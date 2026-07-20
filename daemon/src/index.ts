import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import WebSocket, { WebSocketServer } from 'ws';

import type { CliToolActionResult } from '../../shared/cli.ts';
import { saveGuardrailConfig, loadGuardrailConfig } from './config-store.ts';
import { loadToolConnections, touchToolConnectionActivity, upsertToolConnection } from './connection-store.ts';
import { createCodexWatcher } from './codex-watcher.ts';
import { createDatabase } from './database.ts';
import { createEditAuthorizer } from './edit-authorizer.ts';
import { parseSessionEvent } from './events.ts';
import { createGuardrailEnforcer } from './guardrail-enforcer.ts';
import { createSpiralDetector } from './spiral-detector.ts';
import { createSessionStateStore } from './session-state.ts';
import type { GuardrailConfig } from '../../shared/config.ts';
import { DAEMON_WS_PATH, DEFAULT_DAEMON_PORT } from '../../shared/runtime.ts';
import type { CurrentSessionState, SessionEvent, SpiralResolutionReason, ToolConnection, ToolId } from '../../shared/types.ts';

const port = Number(process.env.TG_DAEMON_PORT ?? DEFAULT_DAEMON_PORT);
const database = createDatabase();
const sessionStateStore = createSessionStateStore();
let guardrailConfig = loadGuardrailConfig(database);
let toolConnections = loadToolConnections(database);
const spiralDetector = createSpiralDetector(() => guardrailConfig);
const guardrailEnforcer = createGuardrailEnforcer(() => guardrailConfig);
const editAuthorizer = createEditAuthorizer(() => guardrailConfig);
const cliEntryPath = resolve(
  fileURLToPath(new URL('../../cli/src/index.ts', import.meta.url)),
);

const webSocketServer = new WebSocketServer({ noServer: true });
const codexWatcher = createCodexWatcher({
  onEvents: (events) => {
    if (events.length === 0) {
      return;
    }

    const { processedEvents } = processEventQueue(events);
    logDaemon('codex', 'forwarded codex watcher events', {
      processedEvents: processedEvents.map((event) => event.type),
    });
  },
  isEnabled: () =>
    toolConnections.some((connection) => connection.tool === 'codex' && connection.status === 'connected'),
  log: logDaemon,
});

const server = createServer(async (request, response) => {
  applyCors(response);

  if (!request.url) {
    response.writeHead(400).end(JSON.stringify({ error: 'Missing request URL.' }));
    return;
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204).end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const pathName = url.pathname ?? '/';

  try {
    logDaemon('http', `${request.method ?? 'GET'} ${pathName}`);

    if (request.method === 'GET' && pathName === '/health') {
      respondJson(response, 200, {
        status: 'ok',
        service: 'tokenguard-daemon',
        port,
        wsPath: DAEMON_WS_PATH,
      });
      return;
    }

    if (request.method === 'GET' && pathName === '/config') {
      respondJson(response, 200, { config: guardrailConfig });
      return;
    }

    if (request.method === 'GET' && pathName === '/connections') {
      respondJson(response, 200, { connections: toolConnections });
      return;
    }

    if (request.method === 'PUT' && pathName === '/config') {
      const body = await readJsonBody<Partial<GuardrailConfig>>(request);
      logDaemon('config', 'saving config patch', body ?? {});
      guardrailConfig = saveGuardrailConfig(database, body ?? {});
      logDaemon('config', 'config saved', summarizeConfig(guardrailConfig));
      broadcast('config_updated', { config: guardrailConfig });
      respondJson(response, 200, { config: guardrailConfig });
      return;
    }

    if (request.method === 'GET' && pathName === '/session/current') {
      respondJson(response, 200, { session: sessionStateStore.getState() });
      return;
    }

    if (request.method === 'POST' && pathName === '/cli/connect') {
      const body = await readJsonBody<{ tool?: ToolId }>(request);

      if (!body.tool) {
        throw new Error('tool is required for CLI connect.');
      }

      toolConnections = upsertToolConnection(database, body.tool, {
        status: 'connecting',
        errorMessage: null,
      });
      broadcast('connections_updated', { connections: toolConnections });
      logDaemon('cli', 'running connect command', {
        tool: body.tool,
        cliEntryPath,
      });

      const result = await runCliConnect(body.tool);
      toolConnections = upsertToolConnection(database, body.tool, result.connection ?? {
        tool: body.tool,
        status: result.success ? 'connected' : 'error',
        command: result.command,
        lastSeenAt: null,
        errorMessage: result.success ? null : result.message,
      });
      broadcast('connections_updated', { connections: toolConnections });
      logDaemon('cli', 'connect command finished', {
        tool: body.tool,
        success: result.success,
        message: result.message,
      });

      if (body.tool === 'codex' && result.success) {
        await codexWatcher.start();
      }

      respondJson(response, 200, {
        result,
        connections: toolConnections,
      });
      return;
    }

    if (request.method === 'POST' && pathName === '/events') {
      const body = await readJsonBody<unknown>(request);
      const event = parseSessionEvent(body);
      logDaemon('incoming', summarizeEvent(event));
      const { session, processedEvents } = processEventQueue([event]);

      respondJson(response, 202, {
        accepted: true,
        eventType: event.type,
        derivedEventTypes: processedEvents.slice(1).map((nextEvent) => nextEvent.type),
        processedEventTypes: processedEvents.map((nextEvent) => nextEvent.type),
        session,
      });
      return;
    }

    if (request.method === 'POST' && pathName === '/enforcement/authorize-edit') {
      const body = await readJsonBody<{
        sessionId?: string;
        tool?: ToolId;
        model?: string | null;
        filePaths?: unknown;
      }>(request);

      if (!body.sessionId || body.tool !== 'codex' || !Array.isArray(body.filePaths)) {
        throw new Error('sessionId, tool=codex, and filePaths are required for edit authorization.');
      }

      const filePaths = body.filePaths.filter((filePath): filePath is string =>
        typeof filePath === 'string' && filePath.trim().length > 0,
      );

      if (filePaths.length === 0) {
        throw new Error('filePaths must contain at least one file path.');
      }

      const currentSession = sessionStateStore.getState();

      if (currentSession.sessionId !== body.sessionId) {
        processEventQueue([
          {
            type: 'session_start',
            sessionId: body.sessionId,
            tool: 'codex',
            timestamp: Date.now(),
            model: body.model ?? null,
          },
        ]);
      }

      const timestamp = Date.now();
      const decision = editAuthorizer.authorize({
        sessionId: body.sessionId,
        tool: 'codex',
        filePaths,
        timestamp,
      });
      let session = sessionStateStore.getState();

      if (decision.spiral) {
        const result = processEventQueue([
          {
            type: 'spiral_start',
            sessionId: body.sessionId,
            tool: 'codex',
            timestamp,
            filePath: decision.spiral.filePath,
            editCount: decision.spiral.editCount,
            estimatedWasteUsd: null,
          },
        ]);
        session = result.session;
      }

      logDaemon('enforcement', decision.allowed ? 'allowed Codex edit' : 'blocked Codex edit', {
        sessionId: body.sessionId,
        filePaths,
        reason: decision.reason,
      });
      respondJson(response, 200, {
        allowed: decision.allowed,
        reason: decision.reason,
        session,
      });
      return;
    }

    if (request.method === 'POST' && pathName === '/interventions/spirals') {
      const body = await readJsonBody<{
        sessionId?: string;
        tool?: SessionEvent['tool'];
        filePath?: string;
        decision?: 'stop' | 'continue';
      }>(request);

      if (!body.sessionId || !body.filePath || !body.tool) {
        throw new Error('sessionId, tool, and filePath are required for spiral interventions.');
      }

      if (body.decision !== 'stop' && body.decision !== 'continue') {
        throw new Error('decision must be stop or continue.');
      }

      logDaemon('intervention', 'received spiral intervention', {
        sessionId: body.sessionId,
        tool: body.tool,
        filePath: body.filePath,
        decision: body.decision,
      });

      const interventionEvents = createSpiralInterventionEvents(
        body.sessionId,
        body.tool,
        body.filePath,
        body.decision,
      );
      const { session, processedEvents } = processEventQueue(interventionEvents);

      respondJson(response, 202, {
        accepted: true,
        decision: body.decision,
        processedEventTypes: processedEvents.map((nextEvent) => nextEvent.type),
        session,
      });
      return;
    }

    if (request.method === 'POST' && pathName === '/interventions/session-stop') {
      const body = await readJsonBody<{
        sessionId?: string;
        tool?: SessionEvent['tool'];
      }>(request);

      if (!body.sessionId || !body.tool) {
        throw new Error('sessionId and tool are required for session stop interventions.');
      }

      const currentSession = sessionStateStore.getState();
      const sessionActiveSpirals =
        currentSession.sessionId === body.sessionId ? currentSession.activeSpirals : [];
      const stopEvents = createSessionStopEvents(body.sessionId, body.tool, sessionActiveSpirals);

      logDaemon('intervention', 'received session stop intervention', {
        sessionId: body.sessionId,
        tool: body.tool,
        activeSpirals: sessionActiveSpirals.length,
      });

      const { session, processedEvents } = processEventQueue(stopEvents);

      respondJson(response, 202, {
        accepted: true,
        processedEventTypes: processedEvents.map((nextEvent) => nextEvent.type),
        session,
      });
      return;
    }

    respondJson(response, 404, { error: 'Route not found.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown daemon error.';
    logDaemon('error', `${request.method ?? 'GET'} ${pathName} failed`, { error: message });
    respondJson(response, 400, { error: message });
  }
});

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url ?? '/', `http://${request.headers.host || 'localhost'}`);

  if (pathname !== DAEMON_WS_PATH) {
    logDaemon('ws', 'rejected websocket upgrade', { pathname });
    socket.destroy();
    return;
  }

  webSocketServer.handleUpgrade(request, socket, head, (client) => {
    webSocketServer.emit('connection', client, request);
  });
});

webSocketServer.on('connection', (client, request) => {
  logDaemon('ws', 'client connected', {
    clients: webSocketServer.clients.size,
    remoteAddress: request.socket.remoteAddress ?? 'unknown',
  });

  client.send(
    JSON.stringify({
      type: 'hello',
      payload: {
        config: guardrailConfig,
        session: sessionStateStore.getState(),
        connections: toolConnections,
      },
    }),
  );

  client.on('close', () => {
    logDaemon('ws', 'client disconnected', {
      clients: webSocketServer.clients.size,
    });
  });

  client.on('error', (error) => {
    logDaemon('ws', 'client error', { error: error.message });
  });
});

server.listen(port, () => {
  logDaemon('startup', 'TokenGuard daemon listening', {
    httpOrigin: `http://localhost:${port}`,
    wsPath: DAEMON_WS_PATH,
    config: summarizeConfig(guardrailConfig),
  });
  void codexWatcher.start();
});

function processEventQueue(initialEvents: SessionEvent[]): {
  processedEvents: SessionEvent[];
  session: ReturnType<typeof sessionStateStore.getState>;
} {
  const eventQueue = [...initialEvents];
  const processedEvents: SessionEvent[] = [];
  let session = sessionStateStore.getState();

  for (let index = 0; index < eventQueue.length; index += 1) {
    const currentEvent = eventQueue[index];
    logDaemon('event', `processing ${summarizeEvent(currentEvent)}`);
    editAuthorizer.processEvent(currentEvent);
    const detectorEvents = spiralDetector.processEvent(currentEvent);

    if (detectorEvents.length > 0) {
      logDaemon('spiral', 'detector emitted derived events', {
        count: detectorEvents.length,
        events: detectorEvents.map(summarizeEvent),
      });
      eventQueue.splice(index + 1, 0, ...detectorEvents);
    }

    persistEvent(currentEvent);
    session = sessionStateStore.applyEvent(currentEvent);
    processedEvents.push(currentEvent);
    logDaemon('state', 'session updated', summarizeSession(session));
    broadcast('event_received', { event: currentEvent });
    const nextConnections = touchToolConnectionActivity(database, currentEvent.tool, currentEvent.timestamp);

    if (haveConnectionsChanged(toolConnections, nextConnections)) {
      toolConnections = nextConnections;
      broadcast('connections_updated', { connections: toolConnections });
    }

    const enforcementEvents = guardrailEnforcer.processEvent(currentEvent, session);

    if (enforcementEvents.length > 0) {
      logDaemon('guardrail', 'enforcer emitted derived events', {
        count: enforcementEvents.length,
        events: enforcementEvents.map(summarizeEvent),
      });
      eventQueue.splice(index + 1, 0, ...enforcementEvents);
    }
  }

  broadcast('session_updated', { session });
  logDaemon('queue', 'event queue completed', {
    processedEvents: processedEvents.map((event) => event.type),
    session: summarizeSession(session),
    websocketClients: webSocketServer.clients.size,
  });

  return {
    processedEvents,
    session,
  };
}

function persistEvent(event: SessionEvent): void {
  database
    .prepare(
      `
        INSERT INTO session_events (session_id, type, tool, timestamp, payload)
        VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(event.sessionId, event.type, event.tool, event.timestamp, JSON.stringify(event));
}

function broadcast(type: string, payload: unknown): void {
  const message = JSON.stringify({ type, payload });

  for (const client of webSocketServer.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function applyCors(response: import('node:http').ServerResponse): void {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
}

function respondJson(
  response: import('node:http').ServerResponse,
  statusCode: number,
  payload: unknown,
): void {
  response.writeHead(statusCode);
  response.end(JSON.stringify(payload));
}

async function readJsonBody<T>(request: import('node:http').IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {} as T;
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
}

function createSpiralInterventionEvents(
  sessionId: string,
  tool: SessionEvent['tool'],
  filePath: string,
  decision: 'stop' | 'continue',
): SessionEvent[] {
  const timestamp = Date.now();
  const spiralResolutionReason: SpiralResolutionReason =
    decision === 'stop' ? 'user_confirmed' : 'continue_anyway';
  const events: SessionEvent[] = [];

  if (decision === 'stop') {
    events.push({
      type: 'stop_requested',
      sessionId,
      tool,
      timestamp,
      reason: 'user_confirmed',
      filePath,
    });
  }

  events.push({
    type: 'spiral_stop',
    sessionId,
    tool,
    timestamp,
    filePath,
    reason: spiralResolutionReason,
    costSavedUsd: null,
  });

  return events;
}

function createSessionStopEvents(
  sessionId: string,
  tool: SessionEvent['tool'],
  activeSpirals: CurrentSessionState['activeSpirals'],
): SessionEvent[] {
  const timestamp = Date.now();
  const firstSpiral = activeSpirals[0] ?? null;

  return [
    {
      type: 'stop_requested' as const,
      sessionId,
      tool,
      timestamp,
      reason: 'user_confirmed',
      filePath: firstSpiral?.filePath ?? null,
    },
  ];
}

function logDaemon(scope: string, message: string, meta?: Record<string, unknown>): void {
  const serializedMeta =
    meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  console.log(`[daemon] ${new Date().toISOString()} [${scope}] ${message}${serializedMeta}`);
}

function summarizeEvent(event: SessionEvent): string {
  switch (event.type) {
    case 'session_start':
      return `session_start session=${event.sessionId} tool=${event.tool} model=${event.model ?? 'unknown'}`;
    case 'session_end':
      return `session_end session=${event.sessionId} tool=${event.tool}`;
    case 'file_write':
      return `file_write session=${event.sessionId} file=${event.filePath}`;
    case 'token_count':
      return `token_count session=${event.sessionId} +in=${event.tokensIn} +out=${event.tokensOut} model=${event.model ?? 'unknown'}`;
    case 'spiral_start':
      return `spiral_start session=${event.sessionId} file=${event.filePath} edits=${event.editCount}`;
    case 'spiral_stop':
      return `spiral_stop session=${event.sessionId} file=${event.filePath} reason=${event.reason}`;
    case 'budget_threshold':
      return `budget_threshold session=${event.sessionId} scope=${event.scope} level=${event.level} percent=${event.percentUsed} action=${event.action}`;
    case 'context_pressure':
      return `context_pressure session=${event.sessionId} percent=${event.percent} used=${event.tokensUsed}/${event.tokensTotal}`;
    case 'agent_stopped':
      return `agent_stopped session=${event.sessionId} reason=${event.reason}${event.filePath ? ` file=${event.filePath}` : ''}`;
    case 'stop_requested':
      return `stop_requested session=${event.sessionId} reason=${event.reason}${event.filePath ? ` file=${event.filePath}` : ''}`;
    case 'burn_rate_update':
      return `burn_rate_update session=${event.sessionId} tokensPerMin=${event.tokensPerMin}`;
  }
}

function summarizeSession(session: CurrentSessionState): Record<string, unknown> {
  return {
    sessionId: session.sessionId,
    tool: session.tool,
    status: session.agentStatus,
    totalTokens: session.totalTokens,
    sessionCostUsd: Number(session.sessionCostUsd.toFixed(2)),
    monthlyCostUsd: Number(session.monthlyCostUsd.toFixed(2)),
    burnRatePerMin: session.burnRatePerMin,
    contextPercent: session.contextPercent,
    activeSpirals: session.activeSpirals.map((spiral) => ({
      filePath: spiral.filePath,
      editCount: spiral.editCount,
    })),
    lastBudgetThreshold: session.lastBudgetThreshold
      ? {
          scope: session.lastBudgetThreshold.scope,
          level: session.lastBudgetThreshold.level,
          percentUsed: session.lastBudgetThreshold.percentUsed,
          action: session.lastBudgetThreshold.action,
        }
      : null,
    lastStopReason: session.lastStopReason,
  };
}

function summarizeConfig(config: GuardrailConfig): Record<string, unknown> {
  return {
    sessionTokenCap: config.sessionTokenCap,
    monthlyBudgetUsd: config.monthlyBudgetUsd,
    monthlyBudgetWarnPercent: config.monthlyBudgetWarnPercent,
    spiralEditThreshold: config.spiralEditThreshold,
    spiralTimeWindowSeconds: config.spiralTimeWindowSeconds,
    burnRateWarnThreshold: config.burnRateWarnThreshold,
    autoStopSpirals: config.autoStopSpirals,
    hardStopOnSessionCap: config.hardStopOnSessionCap,
    hardStopOnMonthlyBudget: config.hardStopOnMonthlyBudget,
    promptRateLimitEnabled: config.promptRateLimitEnabled,
  };
}

async function runCliConnect(tool: ToolId): Promise<CliToolActionResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      process.execPath,
      ['--experimental-strip-types', cliEntryPath, 'connect', tool, '--json'],
      {
        cwd: resolve(fileURLToPath(new URL('..', import.meta.url)), '..'),
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (exitCode) => {
      const trimmedStdout = stdout.trim();

      if (trimmedStdout.length === 0) {
        reject(new Error(`CLI connect produced no output for ${tool}.`));
        return;
      }

      try {
        const parsed = JSON.parse(trimmedStdout) as CliToolActionResult;
        resolvePromise({
          ...parsed,
          stdout: parsed.stdout || stdout.trim(),
          stderr: parsed.stderr || stderr.trim(),
          success: exitCode === 0 && parsed.success,
        });
      } catch (error) {
        reject(
          new Error(
            `Failed to parse CLI output for ${tool}: ${
              error instanceof Error ? error.message : 'Unknown parse error.'
            }`,
          ),
        );
      }
    });
  });
}

function haveConnectionsChanged(
  previousConnections: ToolConnection[],
  nextConnections: ToolConnection[],
): boolean {
  if (previousConnections.length !== nextConnections.length) {
    return true;
  }

  return previousConnections.some((connection, index) => {
    const nextConnection = nextConnections[index];
    return JSON.stringify(connection) !== JSON.stringify(nextConnection);
  });
}
