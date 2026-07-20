import { access, readFile, readdir, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, normalize } from 'node:path';
import { homedir } from 'node:os';

import type { SessionEvent } from '../../shared/types.ts';
import { parseCodexTokenUsage, type CodexTokenUsage } from './codex-token-usage.ts';

const DEFAULT_CODEX_HOME = join(homedir(), '.codex');
const DEFAULT_POLL_INTERVAL_MS = 2_000;
const EXISTING_SESSION_GRACE_MS = 60_000;
const STALE_SESSION_MS = 15 * 60_000;
const RECENT_SESSION_FILE_GRACE_MS = 10_000;
const MISSING_SESSION_RETRY_MS = 5 * 60_000;

interface CodexWatcherOptions {
  onEvents: (events: SessionEvent[]) => void;
  isEnabled: () => boolean;
  log: (scope: string, message: string, meta?: Record<string, unknown>) => void;
  codexHome?: string;
  pollIntervalMs?: number;
}

interface SessionIndexEntry {
  id: string;
  updatedAt: number | null;
}

interface TrackedCodexSession {
  sessionId: string;
  filePath: string;
  cwd: string | null;
  model: string | null;
  source: string | null;
  originator: string | null;
  initialTokenUsage: CodexTokenUsage | null;
  processedLineCount: number;
  startedEmitted: boolean;
  endedEmitted: boolean;
  lastObservedAt: number;
}

interface TranscriptRecord {
  timestamp?: string;
  type?: string;
  payload?: Record<string, unknown>;
}

export function createCodexWatcher({
  onEvents,
  isEnabled,
  log,
  codexHome = process.env.TG_CODEX_HOME ?? DEFAULT_CODEX_HOME,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
}: CodexWatcherOptions) {
  const sessionIndexPath = join(codexHome, 'session_index.jsonl');
  const sessionsRoot = join(codexHome, 'sessions');

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let pollInFlight = false;
  let initialized = false;
  const trackedSessions = new Map<string, TrackedCodexSession>();
  const sessionFileCache = new Map<string, string>();
  const missingSessionRetryAfter = new Map<string, number>();
  const activeSessionByCwd = new Map<string, string>();

  return {
    async start(): Promise<void> {
      if (pollTimer) {
        return;
      }

      if (!(await fileExists(sessionIndexPath)) || !(await fileExists(sessionsRoot))) {
        log('codex', 'codex session files not found', {
          codexHome,
        });
        return;
      }

      log('codex', 'starting codex session watcher', {
        codexHome,
        pollIntervalMs,
      });

      await poll();
      pollTimer = setInterval(() => {
        void poll();
      }, pollIntervalMs);
    },

    stop(): void {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }

      trackedSessions.clear();
      missingSessionRetryAfter.clear();
      activeSessionByCwd.clear();
      initialized = false;
    },
  };

  async function poll(): Promise<void> {
    if (pollInFlight || !isEnabled()) {
      return;
    }

    pollInFlight = true;

    try {
      const recentSessions = await readSessionIndex(sessionIndexPath);

      if (recentSessions.length === 0) {
        return;
      }

      if (!initialized) {
        initialized = true;
        await initializeTrackedSessions(recentSessions);
        return;
      }

      await hydrateRecentSessions(recentSessions, false);
      await processTrackedSessions();
      emitStaleSessionEnds();
    } catch (error) {
      log('codex', 'watcher poll failed', {
        error: error instanceof Error ? error.message : 'Unknown codex watcher error.',
      });
    } finally {
      pollInFlight = false;
    }
  }

  async function initializeTrackedSessions(recentSessions: SessionIndexEntry[]): Promise<void> {
    await hydrateRecentSessions(recentSessions, true);

    const cutoff = Date.now() - EXISTING_SESSION_GRACE_MS;

    for (const trackedSession of trackedSessions.values()) {
      if (!trackedSession.startedEmitted && trackedSession.lastObservedAt >= cutoff) {
        emitSessionStart(trackedSession);
      }
    }
  }

  async function hydrateRecentSessions(
    recentSessions: SessionIndexEntry[],
    asBaseline: boolean,
  ): Promise<void> {
    for (const sessionEntry of recentSessions.slice(-15)) {
      const existingSession = trackedSessions.get(sessionEntry.id);

      if (existingSession) {
        existingSession.lastObservedAt = Math.max(existingSession.lastObservedAt, sessionEntry.updatedAt ?? 0);
        continue;
      }

      const retryAfter = missingSessionRetryAfter.get(sessionEntry.id);
      if (retryAfter && retryAfter > Date.now()) {
        continue;
      }

      const trackedSession = await createTrackedSession(sessionEntry);

      if (!trackedSession) {
        const now = Date.now();
        const ageMs = sessionEntry.updatedAt === null ? Number.POSITIVE_INFINITY : now - sessionEntry.updatedAt;
        const isRecentSession = ageMs >= 0 && ageMs < RECENT_SESSION_FILE_GRACE_MS;
        const wasAlreadyMissing = missingSessionRetryAfter.has(sessionEntry.id);

        missingSessionRetryAfter.set(
          sessionEntry.id,
          now + (isRecentSession ? DEFAULT_POLL_INTERVAL_MS : MISSING_SESSION_RETRY_MS),
        );

        if (!isRecentSession && !wasAlreadyMissing) {
          log('codex', 'skipping stale codex session with no transcript file', {
            sessionId: sessionEntry.id,
          });
        }
        continue;
      }

      missingSessionRetryAfter.delete(sessionEntry.id);
      trackedSessions.set(sessionEntry.id, trackedSession);

      if (!asBaseline) {
        emitSessionStart(trackedSession);
      }
    }
  }

  async function createTrackedSession(
    sessionEntry: SessionIndexEntry,
  ): Promise<TrackedCodexSession | null> {
    const filePath = await findSessionFileById(sessionEntry.id);

    if (!filePath) {
      return null;
    }

    const fileContents = await readFile(filePath, 'utf8');
    const lines = splitJsonLines(fileContents);

    if (lines.length === 0) {
      return null;
    }

    const metadata = readSessionMetadata(lines);
    const initialTokenUsage = readLatestCodexTokenUsage(lines, 'total');
    const transcriptStats = await stat(filePath);

    return {
      sessionId: sessionEntry.id,
      filePath,
      cwd: metadata.cwd,
      model: metadata.model,
      source: metadata.source,
      originator: metadata.originator,
      initialTokenUsage,
      processedLineCount: lines.length,
      startedEmitted: false,
      endedEmitted: false,
      lastObservedAt: Math.max(sessionEntry.updatedAt ?? 0, Math.floor(transcriptStats.mtimeMs)),
    };
  }

  async function processTrackedSessions(): Promise<void> {
    for (const trackedSession of [...trackedSessions.values()]) {
      try {
        const fileContents = await readFile(trackedSession.filePath, 'utf8');
        const lines = splitJsonLines(fileContents);
        const transcriptStats = await stat(trackedSession.filePath);
        trackedSession.lastObservedAt = Math.max(trackedSession.lastObservedAt, Math.floor(transcriptStats.mtimeMs));

        if (lines.length <= trackedSession.processedLineCount) {
          continue;
        }

        const nextLines = lines.slice(trackedSession.processedLineCount);
        trackedSession.processedLineCount = lines.length;

        if (!trackedSession.startedEmitted) {
          emitSessionStart(trackedSession);
        }

        const fileWriteEvents = nextLines.flatMap((line) =>
          parseFileWriteEvents(line, trackedSession),
        );

        if (fileWriteEvents.length > 0) {
          trackedSession.lastObservedAt = fileWriteEvents[fileWriteEvents.length - 1].timestamp;
          onEvents(fileWriteEvents);
          log('codex', 'emitted codex file activity', {
            sessionId: trackedSession.sessionId,
            fileWrites: fileWriteEvents.map((event) => event.filePath),
          });
        }
      } catch (error) {
        if (isFileMissing(error)) {
          discardMissingSession(trackedSession);
          continue;
        }

        throw error;
      }
    }
  }

      const fileWriteEvents = nextLines.flatMap((line) =>
        parseFileWriteEvents(line, trackedSession),
      );
      const tokenCountEvents = nextLines.flatMap((line) =>
        parseTokenCountEvents(line, trackedSession),
      );
      const nextEvents = [...fileWriteEvents, ...tokenCountEvents].sort(
        (left, right) => left.timestamp - right.timestamp,
      );

      if (nextEvents.length > 0) {
        trackedSession.lastObservedAt = nextEvents[nextEvents.length - 1].timestamp;
        onEvents(nextEvents);
      }

      if (fileWriteEvents.length > 0) {
        log('codex', 'emitted codex file activity', {
          sessionId: trackedSession.sessionId,
          fileWrites: fileWriteEvents.map((event) => event.filePath),
        });
      }

      if (tokenCountEvents.length > 0) {
        log('codex', 'emitted codex token usage', {
          sessionId: trackedSession.sessionId,
          tokensIn: tokenCountEvents.reduce((total, event) => total + event.tokensIn, 0),
          tokensOut: tokenCountEvents.reduce((total, event) => total + event.tokensOut, 0),
        });
      }
    }

    log('codex', 'discarded missing codex session transcript', {
      sessionId: trackedSession.sessionId,
      filePath: trackedSession.filePath,
    });
  }

  function emitStaleSessionEnds(): void {
    const staleCutoff = Date.now() - STALE_SESSION_MS;

    for (const trackedSession of trackedSessions.values()) {
      if (
        !trackedSession.startedEmitted ||
        trackedSession.endedEmitted ||
        trackedSession.lastObservedAt > staleCutoff
      ) {
        continue;
      }

      trackedSession.endedEmitted = true;

      if (trackedSession.cwd) {
        const cwdKey = normalize(trackedSession.cwd);
        if (activeSessionByCwd.get(cwdKey) === trackedSession.sessionId) {
          activeSessionByCwd.delete(cwdKey);
        }
      }


      onEvents([
        {
          type: 'session_end',
          sessionId: trackedSession.sessionId,
          tool: 'codex',
          timestamp: trackedSession.lastObservedAt,
        },
      ]);

      log('codex', 'closed stale codex session', {
        sessionId: trackedSession.sessionId,
        cwd: trackedSession.cwd,
      });
    }
  }

  function emitSessionStart(trackedSession: TrackedCodexSession): void {
    trackedSession.startedEmitted = true;
    trackedSession.endedEmitted = false;

    if (trackedSession.cwd) {
      const cwdKey = normalize(trackedSession.cwd);
      const priorSessionId = activeSessionByCwd.get(cwdKey);

      if (priorSessionId && priorSessionId !== trackedSession.sessionId) {
        const priorTrackedSession = trackedSessions.get(priorSessionId);

        if (priorTrackedSession) {
          priorTrackedSession.endedEmitted = true;
        }


        onEvents([
          {
            type: 'session_end',
            sessionId: priorSessionId,
            tool: 'codex',
            timestamp: trackedSession.lastObservedAt,
          },
        ]);
      }

      activeSessionByCwd.set(cwdKey, trackedSession.sessionId);
    }

    onEvents([
      {
        type: 'session_start',
        sessionId: trackedSession.sessionId,
        tool: 'codex',
        timestamp: trackedSession.lastObservedAt,
        model: trackedSession.model,
      },
    ]);

    const initialTokenUsage = trackedSession.initialTokenUsage;
    trackedSession.initialTokenUsage = null;

    if (initialTokenUsage) {
      onEvents([
        createTokenCountEvent(trackedSession, initialTokenUsage, trackedSession.lastObservedAt),
      ]);
    }

    log('codex', 'detected codex session', {
      sessionId: trackedSession.sessionId,
      cwd: trackedSession.cwd,
      model: trackedSession.model,
      source: trackedSession.source,
      originator: trackedSession.originator,
      tokensIn: initialTokenUsage?.tokensIn ?? 0,
      tokensOut: initialTokenUsage?.tokensOut ?? 0,
    });
  }

  async function findSessionFileById(sessionId: string): Promise<string | null> {
    const cachedPath = sessionFileCache.get(sessionId);

    if (cachedPath && (await fileExists(cachedPath))) {
      return cachedPath;
    }

    const filePath = await findSessionFileRecursive(sessionsRoot, sessionId);

    if (filePath) {
      sessionFileCache.set(sessionId, filePath);
    }

    return filePath;
  }
}

async function readSessionIndex(path: string): Promise<SessionIndexEntry[]> {
  const contents = await readFile(path, 'utf8');

  return splitJsonLines(contents)
    .map((line) => safeParseJson(line))
    .filter(isRecord)
    .map((record) => ({
      id: pickString(record.id),
      updatedAt: parseTimestamp(record.updated_at),
    }))
    .filter((entry): entry is SessionIndexEntry => Boolean(entry.id));
}

async function findSessionFileRecursive(
  rootPath: string,
  sessionId: string,
): Promise<string | null> {
  const entries = await readdir(rootPath, { withFileTypes: true });

  for (const entry of entries) {
    const nextPath = join(rootPath, entry.name);

    if (entry.isDirectory()) {
      const foundPath = await findSessionFileRecursive(nextPath, sessionId);

      if (foundPath) {
        return foundPath;
      }

      continue;
    }

    if (entry.isFile() && entry.name.endsWith(`${sessionId}.jsonl`)) {
      return nextPath;
    }
  }

  return null;
}

function readSessionMetadata(lines: string[]): {
  cwd: string | null;
  model: string | null;
  source: string | null;
  originator: string | null;
} {
  let cwd: string | null = null;
  let model: string | null = null;
  let source: string | null = null;
  let originator: string | null = null;

  for (const line of lines.slice(0, 25)) {
    const record = safeParseJson(line);

    if (!isTranscriptRecord(record)) {
      continue;
    }

    if (record.type === 'session_meta' && isRecord(record.payload)) {
      cwd = pickString(record.payload.cwd) ?? cwd;
      source = pickString(record.payload.source) ?? source;
      originator = pickString(record.payload.originator) ?? originator;
    }

    if (record.type === 'turn_context' && isRecord(record.payload)) {
      model = pickString(record.payload.model) ?? model;
    }

    if (cwd && model) {
      break;
    }
  }

  return { cwd, model, source, originator };
}

function parseFileWriteEvents(
  line: string,
  trackedSession: TrackedCodexSession,
): Extract<SessionEvent, { type: 'file_write' }>[] {
  const record = safeParseJson(line);

  if (!isTranscriptRecord(record) || !isRecord(record.payload)) {
    return [];
  }

  const timestamp = parseTimestamp(record.timestamp) ?? Date.now();

  // Nested tools inside an exec call emit one patch_apply_end event per patch.
  // Count those events directly so a long-running edit loop is not mistaken for
  // a single outer command.
  if (record.type === 'event_msg' && record.payload.type === 'patch_apply_end') {
    const filePaths = extractPatchApplyFilePaths(record.payload);

    return filePaths.map((filePath) => ({
      type: 'file_write' as const,
      sessionId: trackedSession.sessionId,
      tool: 'codex' as const,
      timestamp,
      filePath,
    }));
  }

  if (
    record.type !== 'response_item' ||
    record.payload.type !== 'custom_tool_call' ||
    record.payload.status !== 'completed'
  ) {
    return [];
  }

  const patchInput = pickString(record.payload.input);

  if (!patchInput) {
    return [];
  }

  // exec-based patches are counted from patch_apply_end above. Keeping direct
  // apply_patch support here covers transcript variants without that event.
  if (record.payload.name === 'exec') {
    return [];
  }

  const filePaths = extractCodexPatchFilePaths(record.payload.name, patchInput);

  return filePaths.map((filePath) => ({
    type: 'file_write' as const,
    sessionId: trackedSession.sessionId,
    tool: 'codex' as const,
    timestamp,
    filePath,
  }));
}

function parseTokenCountEvents(
  line: string,
  trackedSession: TrackedCodexSession,
): Extract<SessionEvent, { type: 'token_count' }>[] {
  const record = safeParseJson(line);
  const usage = parseCodexTokenUsage(record, 'last');

  if (!usage) {
    return [];
  }

  return [
    createTokenCountEvent(
      trackedSession,
      usage,
      isTranscriptRecord(record) ? parseTimestamp(record.timestamp) ?? Date.now() : Date.now(),
    ),
  ];
}

function createTokenCountEvent(
  trackedSession: TrackedCodexSession,
  usage: CodexTokenUsage,
  timestamp: number,
): Extract<SessionEvent, { type: 'token_count' }> {
  return {
    type: 'token_count',
    sessionId: trackedSession.sessionId,
    tool: 'codex',
    timestamp,
    model: trackedSession.model,
    tokensIn: usage.tokensIn,
    tokensOut: usage.tokensOut,
  };
}

function readLatestCodexTokenUsage(
  lines: string[],
  kind: 'total',
): CodexTokenUsage | null {
  for (const line of [...lines].reverse()) {
    const usage = parseCodexTokenUsage(safeParseJson(line), kind);

    if (usage) {
      return usage;
    }
  }

  return null;
}

function extractPatchFilePaths(patchInput: string): string[] {
  const pattern = /^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm;
  const filePaths = new Set<string>();
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(toolInput)) !== null) {
    filePaths.add(match[1].trim().replaceAll('\\', '/').replace(/\/{2,}/g, '/'));
  }

  return [...filePaths];
}

function splitJsonLines(contents: string): string[] {
  return contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseTimestamp(value: unknown): number | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  const parsedValue = Date.parse(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function pickString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTranscriptRecord(value: unknown): value is TranscriptRecord {
  return isRecord(value);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function extractPatchApplyFilePaths(payload: Record<string, unknown>): string[] {
  if (payload.success !== true || !isRecord(payload.changes)) {
    return [];
  }

  return Object.keys(payload.changes)
    .map((filePath) => filePath.trim().replaceAll('\\', '/'))
    .filter(Boolean);
}

function isFileMissing(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: unknown }).code === 'ENOENT',
  );
}
