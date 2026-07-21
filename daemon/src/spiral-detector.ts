import type { GuardrailConfig } from '../../shared/config.ts';
import type {
  FileWriteEvent,
  SessionEndEvent,
  SessionEvent,
  SessionStartEvent,
  SpiralStopEvent,
  SpiralUpdateEvent,
  ToolId,
} from '../../shared/types.ts';

interface ActiveDetection {
  filePath: string;
  startedAt: number;
  lastSeenAt: number;
  editCount: number;
  tool: ToolId;
}

export function createSpiralDetector(getConfig: () => GuardrailConfig) {
  const fileWriteWindows = new Map<string, Map<string, number[]>>();
  const activeDetections = new Map<string, Map<string, ActiveDetection>>();

  return {
    processEvent(event: SessionEvent): SessionEvent[] {
      const derivedEvents: SessionEvent[] = [];

      resolveExpiredSpirals(event.sessionId, event.timestamp, derivedEvents);

      switch (event.type) {
        case 'session_start':
          resetSessionState(event);
          return derivedEvents;

        case 'file_write':
          return [...derivedEvents, ...processFileWrite(event)];

        case 'spiral_stop':
          deactivateSpiral(event.sessionId, event.filePath);
          return derivedEvents;

        case 'session_end':
          return [...derivedEvents, ...resolveAllSpirals(event)];

        default:
          return derivedEvents;
      }
    },
  };

  function processFileWrite(event: FileWriteEvent): SessionEvent[] {
    const config = getConfig();
    const sessionWindows = getSessionWindows(event.sessionId);
    const previousTimestamps = sessionWindows.get(event.filePath) ?? [];
    const thresholdWindowStart = event.timestamp - config.spiralTimeWindowSeconds * 1000;
    const timestamps = [...previousTimestamps, event.timestamp].filter(
      (timestamp) => timestamp >= thresholdWindowStart,
    );

    sessionWindows.set(event.filePath, timestamps);

    if (timestamps.length < config.spiralEditThreshold) {
      return [];
    }

    const activeSessionDetections = getActiveSessionDetections(event.sessionId);
    const existingDetection = activeSessionDetections.get(event.filePath);

    activeSessionDetections.set(event.filePath, {
      filePath: event.filePath,
      startedAt: existingDetection?.startedAt ?? timestamps[0] ?? event.timestamp,
      lastSeenAt: event.timestamp,
      editCount: timestamps.length,
      tool: event.tool,
    });

    if (existingDetection) {
      return [
        {
          type: 'spiral_update' as const,
          sessionId: event.sessionId,
          tool: event.tool,
          timestamp: event.timestamp,
          filePath: event.filePath,
          editCount: timestamps.length,
          estimatedWasteUsd: null,
        } satisfies SpiralUpdateEvent,
      ];
    }

    return [
      {
        type: 'spiral_start',
        sessionId: event.sessionId,
        tool: event.tool,
        timestamp: event.timestamp,
        filePath: event.filePath,
        editCount: timestamps.length,
        estimatedWasteUsd: null,
      },
    ];
  }

  function resolveExpiredSpirals(
    sessionId: string,
    now: number,
    derivedEvents: SessionEvent[],
  ): void {
    const config = getConfig();
    const sessionDetections = activeDetections.get(sessionId);

    if (!sessionDetections) {
      return;
    }

    for (const [filePath, detection] of sessionDetections.entries()) {
      const isExpired = now - detection.lastSeenAt > config.spiralTimeWindowSeconds * 1000;

      if (!isExpired) {
        continue;
      }

      derivedEvents.push(createSpiralStopEvent(sessionId, filePath, detection.tool, now));
      sessionDetections.delete(filePath);
    }

    if (sessionDetections.size === 0) {
      activeDetections.delete(sessionId);
    }
  }

  function resolveAllSpirals(event: SessionEndEvent): SpiralStopEvent[] {
    const sessionDetections = activeDetections.get(event.sessionId);

    if (!sessionDetections) {
      clearSessionWindows(event.sessionId);
      return [];
    }

    const stopEvents = [...sessionDetections.values()].map((detection) =>
      createSpiralStopEvent(event.sessionId, detection.filePath, detection.tool, event.timestamp),
    );

    activeDetections.delete(event.sessionId);
    clearSessionWindows(event.sessionId);
    return stopEvents;
  }

  function resetSessionState(event: SessionStartEvent): void {
    activeDetections.delete(event.sessionId);
    clearSessionWindows(event.sessionId);
  }

  function deactivateSpiral(sessionId: string, filePath: string): void {
    const sessionDetections = activeDetections.get(sessionId);

    if (!sessionDetections) {
      return;
    }

    sessionDetections.delete(filePath);

    if (sessionDetections.size === 0) {
      activeDetections.delete(sessionId);
    }
  }

  function getSessionWindows(sessionId: string): Map<string, number[]> {
    const existingWindows = fileWriteWindows.get(sessionId);

    if (existingWindows) {
      return existingWindows;
    }

    const nextWindows = new Map<string, number[]>();
    fileWriteWindows.set(sessionId, nextWindows);
    return nextWindows;
  }

  function getActiveSessionDetections(sessionId: string): Map<string, ActiveDetection> {
    const existingDetections = activeDetections.get(sessionId);

    if (existingDetections) {
      return existingDetections;
    }

    const nextDetections = new Map<string, ActiveDetection>();
    activeDetections.set(sessionId, nextDetections);
    return nextDetections;
  }

  function clearSessionWindows(sessionId: string): void {
    fileWriteWindows.delete(sessionId);
  }
}

function createSpiralStopEvent(
  sessionId: string,
  filePath: string,
  tool: ToolId,
  timestamp: number,
): SpiralStopEvent {
  return {
    type: 'spiral_stop',
    sessionId,
    tool,
    timestamp,
    filePath,
    reason: 'continue_anyway',
    costSavedUsd: null,
  };
}
