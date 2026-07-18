import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

import type { CliToolActionResult } from '../../shared/cli.ts';
import { getDaemonHttpOrigin } from '../../shared/runtime.ts';
import { CONNECTABLE_TOOL_IDS, getConnectCommand } from '../../shared/tools.ts';
import type { ToolConnection, ToolId } from '../../shared/types.ts';

const args = process.argv.slice(2);
const command = args[0];
const wantsJson = args.includes('--json');

await run().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown CLI error.';

  if (wantsJson) {
    console.log(
      JSON.stringify({
        success: false,
        tool: 'unknown',
        command: args.join(' '),
        message,
        stdout: '',
        stderr: message,
        connection: null,
      }),
    );
  } else {
    console.error(message);
  }

  process.exitCode = 1;
});

async function run(): Promise<void> {
  switch (command) {
    case 'connect': {
      const tool = parseToolId(args[1]);
      const result = await connectTool(tool);
      emitResult(result, wantsJson);
      process.exitCode = result.success ? 0 : 1;
      return;
    }
    case 'status': {
      const summary = await getStatusSummary();
      if (wantsJson) {
        console.log(JSON.stringify(summary, null, 2));
      } else {
        console.log(summary);
      }
      return;
    }
    case 'version': {
      console.log('tokenguard-cli 0.0.1');
      return;
    }
    case 'hook': {
      const hookName = args[1];
      await handleHook(hookName);
      return;
    }
    default:
      printHelp();
      process.exitCode = 1;
  }
}

async function connectTool(tool: ToolId): Promise<CliToolActionResult> {
  const commandText = getConnectCommand(tool);

  if (tool === 'codex') {
    return connectCodex(commandText);
  }

  if (tool === 'claude-code') {
    return connectClaudeCode(commandText);
  }

  return {
    success: false,
    tool,
    command: commandText,
    message: `${tool} connector is not implemented yet. Codex is the primary live connector right now.`,
    stdout: '',
    stderr: `${tool} connector is not implemented yet.`,
    connection: {
      tool,
      status: 'error',
      command: commandText,
      lastSeenAt: null,
      errorMessage: `${tool} connector is not implemented yet.`,
    },
  };
}

async function connectCodex(commandText: string): Promise<CliToolActionResult> {
  const codexHome = getCodexHome();
  const sessionIndexPath = join(codexHome, 'session_index.jsonl');
  const configPath = join(codexHome, 'config.toml');
  const markerPath = join(codexHome, 'tokenguard-connector.json');

  if (!(await fileExists(configPath)) || !(await fileExists(sessionIndexPath))) {
    return {
      success: false,
      tool: 'codex',
      command: commandText,
      message: `Codex local session files were not found in ${codexHome}`,
      stdout: '',
      stderr: `Missing Codex config.toml or session_index.jsonl in ${codexHome}`,
      connection: {
        tool: 'codex',
        status: 'error',
        command: commandText,
        lastSeenAt: null,
        errorMessage: `Codex local session files were not found in ${codexHome}`,
      },
    };
  }

  await mkdir(codexHome, { recursive: true });
  await writeFile(
    markerPath,
    `${JSON.stringify(
      {
        tool: 'codex',
        mode: 'session_log_watcher',
        installedAt: new Date().toISOString(),
        daemonOrigin: getDaemonHttpOrigin(),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  return {
    success: true,
    tool: 'codex',
    command: commandText,
    message: `Codex connection enabled using local session logs in ${codexHome}`,
    stdout: [
      `Verified Codex config: ${configPath}`,
      `Verified session index: ${sessionIndexPath}`,
      `Wrote TokenGuard marker: ${markerPath}`,
      `Daemon will watch future Codex sessions and apply_patch edits.`,
    ].join('\n'),
    stderr: '',
    connection: {
      tool: 'codex',
      status: 'connected',
      command: commandText,
      lastSeenAt: null,
      errorMessage: null,
    },
  };
}

async function connectClaudeCode(commandText: string): Promise<CliToolActionResult> {
  const cliEntryPath = fileURLToPath(import.meta.url);
  const settingsPath = join(homedir(), '.claude', 'settings.json');
  await mkdir(dirname(settingsPath), { recursive: true });

  const settings = await readJsonFile<ClaudeSettings>(settingsPath, {
    hooks: {},
  });

  const sessionStartCommand = buildHookCommand(cliEntryPath, 'claude-code-session-start');
  const postToolCommand = buildHookCommand(cliEntryPath, 'claude-code-posttool');
  const sessionEndCommand = buildHookCommand(cliEntryPath, 'claude-code-session-end');

  ensureCommandHook(settings, 'SessionStart', null, sessionStartCommand);
  ensureCommandHook(settings, 'PostToolUse', 'Write|Edit|MultiEdit', postToolCommand);
  ensureCommandHook(settings, 'SessionEnd', null, sessionEndCommand);

  await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');

  return {
    success: true,
    tool: 'claude-code',
    command: commandText,
    message: `Claude Code hooks installed in ${settingsPath}`,
    stdout: [
      `Installed SessionStart hook`,
      `Installed PostToolUse hook for Write|Edit|MultiEdit`,
      `Installed SessionEnd hook`,
      `Settings file: ${settingsPath}`,
    ].join('\n'),
    stderr: '',
    connection: {
      tool: 'claude-code',
      status: 'connected',
      command: commandText,
      lastSeenAt: null,
      errorMessage: null,
    },
  };
}

async function getStatusSummary(): Promise<string> {
  const codexHome = getCodexHome();
  const codexMarkerPath = join(codexHome, 'tokenguard-connector.json');
  const codexSessionIndexPath = join(codexHome, 'session_index.jsonl');
  const settingsPath = join(homedir(), '.claude', 'settings.json');
  const settings = await readJsonFile<ClaudeSettings | null>(settingsPath, null);
  const cliEntryPath = fileURLToPath(import.meta.url);
  const postToolCommand = buildHookCommand(cliEntryPath, 'claude-code-posttool');
  const hasClaudeCodeHook = hasHookCommand(settings, 'PostToolUse', 'Write|Edit|MultiEdit', postToolCommand);
  const hasCodexMarker = await fileExists(codexMarkerPath);
  const hasCodexSessionIndex = await fileExists(codexSessionIndexPath);

  const lines = ['TokenGuard CLI status', ''];

  for (const tool of CONNECTABLE_TOOL_IDS) {
    if (tool === 'codex') {
      lines.push(
        `- codex: ${
          hasCodexMarker
            ? 'connected'
            : hasCodexSessionIndex
              ? 'available locally (run tokenguard connect codex)'
              : 'not detected'
        }`,
      );
    } else if (tool === 'claude-code') {
      lines.push(`- claude-code: ${hasClaudeCodeHook ? 'connected' : 'not connected'}`);
    } else {
      lines.push(`- ${tool}: not implemented yet`);
    }
  }

  return lines.join('\n');
}

async function handleHook(hookName: string | undefined): Promise<void> {
  const payload = await readStdinJson();

  try {
    switch (hookName) {
      case 'claude-code-session-start': {
        const sessionId = resolveClaudeSessionId(payload);

        if (!sessionId) {
          return;
        }

        await postDaemonEvent({
          type: 'session_start',
          sessionId,
          tool: 'claude-code',
          timestamp: Date.now(),
          model: resolveClaudeModel(payload),
        });
        return;
      }
      case 'claude-code-posttool': {
        const sessionId = resolveClaudeSessionId(payload);
        const filePath = resolveClaudeFilePath(payload);

        if (!sessionId || !filePath) {
          return;
        }

        await postDaemonEvent({
          type: 'file_write',
          sessionId,
          tool: 'claude-code',
          timestamp: Date.now(),
          filePath,
        });
        return;
      }
      case 'claude-code-session-end': {
        const sessionId = resolveClaudeSessionId(payload);

        if (!sessionId) {
          return;
        }

        await postDaemonEvent({
          type: 'session_end',
          sessionId,
          tool: 'claude-code',
          timestamp: Date.now(),
        });
        return;
      }
      default:
        return;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown hook error.';
    console.error(`[tokenguard hook] ${message}`);
  }
}

function emitResult(result: CliToolActionResult, asJson: boolean): void {
  if (asJson) {
    console.log(JSON.stringify(result));
    return;
  }

  console.log(result.message);

  if (result.stdout) {
    console.log(result.stdout);
  }

  if (result.stderr) {
    console.error(result.stderr);
  }
}

function printHelp(): void {
  console.log(`TokenGuard CLI\n\nCommands:\n  tokenguard connect <tool>\n  tokenguard status\n  tokenguard version`);
}

function parseToolId(rawTool: string | undefined): ToolId {
  if (!rawTool || !CONNECTABLE_TOOL_IDS.includes(rawTool as ToolId)) {
    throw new Error(`Unknown tool "${rawTool ?? ''}".`);
  }

  return rawTool as ToolId;
}

function buildHookCommand(cliEntryPath: string, hookName: string): string {
  return `${quoteShellArg(process.execPath)} --experimental-strip-types ${quoteShellArg(cliEntryPath)} hook ${hookName}`;
}

function getCodexHome(): string {
  return process.env.TG_CODEX_HOME || join(homedir(), '.codex');
}

function ensureCommandHook(
  settings: ClaudeSettings,
  eventName: ClaudeHookEventName,
  matcher: string | null,
  command: string,
): void {
  settings.hooks ??= {};
  const hookEntries = settings.hooks[eventName] ?? [];
  let entry = hookEntries.find((candidate) => (candidate.matcher ?? null) === matcher);

  if (!entry) {
    entry = matcher ? { matcher, hooks: [] } : { hooks: [] };
    hookEntries.push(entry);
  }

  const existingHook = entry.hooks.find(
    (hook) => hook.type === 'command' && hook.command === command,
  );

  if (!existingHook) {
    entry.hooks.push({
      type: 'command',
      command,
      timeout: 10,
    });
  } else {
    existingHook.timeout = 10;
  }

  settings.hooks[eventName] = hookEntries;
}

function hasHookCommand(
  settings: ClaudeSettings | null,
  eventName: ClaudeHookEventName,
  matcher: string | null,
  command: string,
): boolean {
  const hookEntries = settings?.hooks?.[eventName] ?? [];
  return hookEntries.some(
    (entry) =>
      (entry.matcher ?? null) === matcher &&
      entry.hooks.some((hook) => hook.type === 'command' && hook.command === command),
  );
}

async function readJsonFile<T>(path: string, fallback: T): Promise<T> {
  try {
    const contents = await readFile(path, 'utf8');
    return JSON.parse(contents) as T;
  } catch {
    return fallback;
  }
}

async function readStdinJson(): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function postDaemonEvent(event: Record<string, unknown>): Promise<void> {
  const response = await fetch(`${getDaemonHttpOrigin()}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to post daemon event: ${response.status} ${body}`);
  }
}

function resolveClaudeSessionId(payload: Record<string, unknown>): string | null {
  const directId = pickString(
    payload.session_id,
    payload.sessionId,
    payload.conversation_id,
    payload.conversationId,
    process.env.CLAUDE_SESSION_ID,
    process.env.CLAUDE_CONVERSATION_ID,
  );

  if (directId) {
    return directId;
  }

  const transcriptPath = pickString(payload.transcript_path, payload.transcriptPath);
  return transcriptPath ? `claude-${transcriptPath}` : null;
}

function resolveClaudeModel(payload: Record<string, unknown>): string | null {
  const model = payload.model;

  if (typeof model === 'string') {
    return model;
  }

  if (model && typeof model === 'object') {
    const record = model as Record<string, unknown>;
    return pickString(record.id, record.name, record.display_name, record.displayName);
  }

  return null;
}

function resolveClaudeFilePath(payload: Record<string, unknown>): string | null {
  const toolInput = isRecord(payload.tool_input) ? payload.tool_input : isRecord(payload.toolInput) ? payload.toolInput : null;

  return pickString(
    toolInput?.file_path,
    toolInput?.filePath,
    toolInput?.path,
    toolInput?.target_file,
    toolInput?.targetFile,
    payload.file_path,
    payload.filePath,
  );
}

function pickString(...candidates: unknown[]): string | null {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function quoteShellArg(value: string): string {
  return `"${value.replaceAll('"', '\\"')}"`;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

type ClaudeHookEventName = 'SessionStart' | 'PostToolUse' | 'SessionEnd';

interface ClaudeCommandHook {
  type: 'command';
  command: string;
  timeout?: number;
}

interface ClaudeHookMatcherEntry {
  matcher?: string;
  hooks: ClaudeCommandHook[];
}

interface ClaudeSettings {
  hooks?: Partial<Record<ClaudeHookEventName, ClaudeHookMatcherEntry[]>>;
  [key: string]: unknown;
}
