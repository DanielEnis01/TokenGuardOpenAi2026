import {
  EMPTY_CURRENT_SESSION_STATE,
  type ActiveSpiral,
  type BudgetThresholdEvent,
  type CurrentSessionState,
  type SessionEvent,
  type SpiralStartEvent,
} from '../../shared/types.ts';
import { estimateTokenCostUsd } from '../../shared/pricing.ts';

export function createSessionStateStore(initialState = EMPTY_CURRENT_SESSION_STATE) {
  let currentState = cloneCurrentSessionState(initialState);

  return {
    getState(): CurrentSessionState {
      return cloneCurrentSessionState(currentState);
    },
    applyEvent(event: SessionEvent): CurrentSessionState {
      currentState = reduceSessionEvent(currentState, event);
      return cloneCurrentSessionState(currentState);
    },
    reset(): CurrentSessionState {
      currentState = cloneCurrentSessionState(EMPTY_CURRENT_SESSION_STATE);
      return cloneCurrentSessionState(currentState);
    },
  };
}

function reduceSessionEvent(
  currentState: CurrentSessionState,
  event: SessionEvent,
): CurrentSessionState {
  switch (event.type) {
    case 'session_start':
      return {
        ...cloneCurrentSessionState(EMPTY_CURRENT_SESSION_STATE),
        sessionId: event.sessionId,
        tool: event.tool,
        model: event.model ?? null,
        startedAt: event.timestamp,
        agentStatus: 'running',
      };

    case 'session_end':
      return {
        ...cloneCurrentSessionState(EMPTY_CURRENT_SESSION_STATE),
        monthlyCostUsd: currentState.monthlyCostUsd,
      };

    case 'token_count': {
      const tokensIn = currentState.tokensIn + event.tokensIn;
      const tokensOut = currentState.tokensOut + event.tokensOut;
      const deltaCostUsd = estimateTokenCostUsd(
        event.model ?? currentState.model ?? null,
        event.tokensIn,
        event.tokensOut,
      );

      return {
        ...currentState,
        model: event.model ?? currentState.model ?? null,
        tokensIn,
        tokensOut,
        totalTokens: tokensIn + tokensOut,
        sessionCostUsd: currentState.sessionCostUsd + deltaCostUsd,
        monthlyCostUsd: currentState.monthlyCostUsd + deltaCostUsd,
      };
    }

    case 'spiral_start':
      const existingSpiral = currentState.activeSpirals.find(
        (spiral) => spiral.filePath === event.filePath,
      );

      return {
        ...currentState,
        spiralsCaughtToday: existingSpiral
          ? currentState.spiralsCaughtToday
          : currentState.spiralsCaughtToday + 1,
        activeSpirals: upsertActiveSpiral(currentState.activeSpirals, event),
      };

    case 'spiral_stop':
      return {
        ...currentState,
        activeSpirals: currentState.activeSpirals.filter(
          (spiral) => spiral.filePath !== event.filePath,
        ),
      };

    case 'context_pressure':
      return {
        ...currentState,
        contextPercent: event.percent,
        contextUsedTokens: event.tokensUsed,
        contextTotalTokens: event.tokensTotal,
      };

    case 'burn_rate_update':
      return {
        ...currentState,
        burnRatePerMin: event.tokensPerMin,
      };

    case 'file_write':
      // A write after any stop request is proof the process is still live.
      // Keep the request for the UI, but never present it as a completed stop.
      return {
        ...currentState,
        agentStatus: 'running',
        lastActivityAt: event.timestamp,
      };

    case 'budget_threshold':
      return {
        ...currentState,
        lastBudgetThreshold: cloneBudgetThresholdEvent(event),
      };

    case 'stop_requested':
      return {
        ...currentState,
        stopRequestCount: currentState.stopRequestCount + 1,
        lastStopRequestedAt: event.timestamp,
        lastStopRequestReason: event.reason,
        lastStopRequestFilePath: event.filePath ?? null,
      };

    case 'agent_stopped':
      return {
        ...currentState,
        agentStatus: 'stopped',
        lastStopReason: event.reason,
        lastStoppedAt: event.timestamp,
        lastStoppedFilePath: event.filePath ?? null,
      };
  }
}

function upsertActiveSpiral(
  activeSpirals: ActiveSpiral[],
  event: SpiralStartEvent,
): ActiveSpiral[] {
  const nextSpiral: ActiveSpiral = {
    filePath: event.filePath,
    editCount: event.editCount,
    startedAt: event.timestamp,
    updatedAt: event.timestamp,
    estimatedWasteUsd: event.estimatedWasteUsd ?? null,
    status: 'active',
  };

  const existingIndex = activeSpirals.findIndex((spiral) => spiral.filePath === event.filePath);

  if (existingIndex === -1) {
    return [...activeSpirals, nextSpiral];
  }

  const updatedSpirals = [...activeSpirals];
  updatedSpirals[existingIndex] = {
    ...updatedSpirals[existingIndex],
    editCount: event.editCount,
    updatedAt: event.timestamp,
    estimatedWasteUsd: event.estimatedWasteUsd ?? updatedSpirals[existingIndex].estimatedWasteUsd,
    status: 'active',
  };

  return updatedSpirals;
}

function cloneCurrentSessionState(state: CurrentSessionState): CurrentSessionState {
  return {
    ...state,
    activeSpirals: state.activeSpirals.map((spiral) => ({ ...spiral })),
    lastBudgetThreshold: state.lastBudgetThreshold
      ? cloneBudgetThresholdEvent(state.lastBudgetThreshold)
      : null,
  };
}

function cloneBudgetThresholdEvent(event: BudgetThresholdEvent): BudgetThresholdEvent {
  return { ...event };
}
