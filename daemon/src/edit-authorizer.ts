import type { GuardrailConfig } from '../../shared/config.ts';
import type { SessionEvent, ToolId } from '../../shared/types.ts';

export interface EditAuthorizationRequest {
  sessionId: string;
  tool: ToolId;
  filePaths: string[];
  timestamp: number;
}

export interface EditAuthorizationDecision {
  allowed: boolean;
  reason: string | null;
  spiral: {
    filePath: string;
    editCount: number;
  } | null;
}

interface FileEditWindow {
  timestamps: number[];
  locked: boolean;
  spiralReported: boolean;
}

/**
 * Tracks attempted writes before they reach Codex's apply_patch tool. This is
 * intentionally separate from transcript monitoring: enforcement must decide
 * before a write runs, while the watcher remains the audit trail afterward.
 */
export function createEditAuthorizer(getConfig: () => GuardrailConfig) {
  const sessions = new Map<string, Map<string, FileEditWindow>>();
  const stoppedSessions = new Set<string>();

  return {
    authorize(request: EditAuthorizationRequest): EditAuthorizationDecision {
      const config = getConfig();
      const filePaths = normalizeFilePaths(request.filePaths);

      if (filePaths.length === 0) {
        return { allowed: true, reason: null, spiral: null };
      }

      if (stoppedSessions.has(request.sessionId)) {
        return {
          allowed: false,
          reason: 'TokenGuard blocked this edit: this coding session was stopped from the dashboard.',
          spiral: null,
        };
      }

      const sessionWindows = getSessionWindows(request.sessionId);
      const thresholdStart = request.timestamp - config.spiralTimeWindowSeconds * 1_000;
      let thresholdSpiral: EditAuthorizationDecision['spiral'] = null;
      let blockedFilePath: string | null = null;

      for (const filePath of filePaths) {
        const current = sessionWindows.get(filePath) ?? {
          timestamps: [],
          locked: false,
          spiralReported: false,
        };
        const timestamps = [...current.timestamps, request.timestamp].filter(
          (timestamp) => timestamp >= thresholdStart,
        );
        const editCount = timestamps.length;
        const crossedThreshold = editCount >= config.spiralEditThreshold;
        const shouldReport = crossedThreshold && !current.spiralReported;
        const shouldLock = crossedThreshold && config.autoStopSpirals;

        sessionWindows.set(filePath, {
          timestamps,
          locked: current.locked || shouldLock,
          spiralReported: current.spiralReported || crossedThreshold,
        });

        if (shouldReport && !thresholdSpiral) {
          thresholdSpiral = { filePath, editCount };
        }

        if ((current.locked || shouldLock) && !blockedFilePath) {
          blockedFilePath = filePath;
        }
      }

      if (blockedFilePath) {
        return {
          allowed: false,
          reason: `TokenGuard blocked this edit: ${blockedFilePath} reached the repeated-edit limit.`,
          spiral: thresholdSpiral,
        };
      }

      return {
        allowed: true,
        reason: null,
        spiral: thresholdSpiral,
      };
    },

    processEvent(event: SessionEvent): void {
      if (event.type === 'session_start' || event.type === 'session_end') {
        sessions.delete(event.sessionId);
        stoppedSessions.delete(event.sessionId);
        return;
      }

      if (event.type === 'stop_requested' || event.type === 'agent_stopped') {
        stoppedSessions.add(event.sessionId);
        return;
      }

      // A user choosing to continue is the explicit override that unlocks a
      // file. Automatic and user-confirmed stops remain locked for the rest of
      // the session so Codex cannot immediately resume editing it.
      if (event.type === 'spiral_stop' && event.reason === 'continue_anyway') {
        sessions.get(event.sessionId)?.delete(event.filePath);
      }
    },
  };

  function getSessionWindows(sessionId: string): Map<string, FileEditWindow> {
    const existing = sessions.get(sessionId);

    if (existing) {
      return existing;
    }

    const next = new Map<string, FileEditWindow>();
    sessions.set(sessionId, next);
    return next;
  }
}

function normalizeFilePaths(filePaths: string[]): string[] {
  return [...new Set(filePaths.map((filePath) => filePath.trim().replaceAll('\\', '/')).filter(Boolean))];
}
