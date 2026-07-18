import type { GuardrailConfig } from '../../shared/config.ts';
import type {
  AgentStoppedEvent,
  BudgetThresholdEvent,
  CurrentSessionState,
  SessionEvent,
  SpiralStopEvent,
} from '../../shared/types.ts';

const SESSION_WARN_PERCENT = 70;
const CRITICAL_PERCENT = 90;

interface EnforcementState {
  firedKeys: Set<string>;
}

export function createGuardrailEnforcer(getConfig: () => GuardrailConfig) {
  const stateBySession = new Map<string, EnforcementState>();

  return {
    processEvent(event: SessionEvent, session: CurrentSessionState): SessionEvent[] {
      if (event.type === 'session_start') {
        stateBySession.delete(event.sessionId);
        return [];
      }

      if (event.type === 'session_end') {
        stateBySession.delete(event.sessionId);
        return [];
      }

      const state = getSessionState(event.sessionId);
      const derivedEvents: SessionEvent[] = [];

      if (event.type === 'spiral_start' && getConfig().autoStopSpirals && session.agentStatus !== 'stopped') {
        const stopKey = `spiral-stop:${event.filePath}:${event.timestamp}`;

        if (!state.firedKeys.has(stopKey)) {
          state.firedKeys.add(stopKey);
          derivedEvents.push(
            createAgentStoppedEvent(event, 'auto_stopped'),
            createSpiralStopEvent(event, 'auto_stopped'),
          );
        }
      }

      if (event.type === 'token_count') {
        evaluateSessionCap(event, session, state, derivedEvents);
        evaluateMonthlyBudget(event, session, state, derivedEvents);
      }

      return derivedEvents;
    },
  };

  function getSessionState(sessionId: string): EnforcementState {
    const existingState = stateBySession.get(sessionId);

    if (existingState) {
      return existingState;
    }

    const nextState: EnforcementState = {
      firedKeys: new Set<string>(),
    };

    stateBySession.set(sessionId, nextState);
    return nextState;
  }

  function evaluateSessionCap(
    event: Extract<SessionEvent, { type: 'token_count' }>,
    session: CurrentSessionState,
    state: EnforcementState,
    derivedEvents: SessionEvent[],
  ): void {
    const config = getConfig();
    const percentUsed = (session.totalTokens / config.sessionTokenCap) * 100;

    if (percentUsed >= 100) {
      if (config.hardStopOnSessionCap) {
        emitThresholdOnce(state, 'session-stop', () => {
          derivedEvents.push(
            createBudgetThresholdEvent(event, 'session', 'critical', percentUsed, 'stop'),
            createAgentStoppedEvent(event, 'session_cap'),
          );
        });
        return;
      }

      emitThresholdOnce(state, 'session-critical', () => {
        derivedEvents.push(
          createBudgetThresholdEvent(event, 'session', 'critical', percentUsed, 'warn'),
        );
      });
      return;
    }

    if (percentUsed >= CRITICAL_PERCENT) {
      emitThresholdOnce(state, 'session-critical', () => {
        derivedEvents.push(
          createBudgetThresholdEvent(event, 'session', 'critical', percentUsed, 'warn'),
        );
      });
      return;
    }

    if (percentUsed >= SESSION_WARN_PERCENT) {
      emitThresholdOnce(state, 'session-warn', () => {
        derivedEvents.push(createBudgetThresholdEvent(event, 'session', 'warn', percentUsed, 'warn'));
      });
    }
  }

  function evaluateMonthlyBudget(
    event: Extract<SessionEvent, { type: 'token_count' }>,
    session: CurrentSessionState,
    state: EnforcementState,
    derivedEvents: SessionEvent[],
  ): void {
    const config = getConfig();
    const percentUsed = (session.monthlyCostUsd / config.monthlyBudgetUsd) * 100;

    if (percentUsed >= 100) {
      if (config.hardStopOnMonthlyBudget) {
        emitThresholdOnce(state, 'monthly-stop', () => {
          derivedEvents.push(
            createBudgetThresholdEvent(event, 'monthly', 'critical', percentUsed, 'stop'),
            createAgentStoppedEvent(event, 'monthly_budget'),
          );
        });
        return;
      }

      emitThresholdOnce(state, 'monthly-critical', () => {
        derivedEvents.push(
          createBudgetThresholdEvent(event, 'monthly', 'critical', percentUsed, 'warn'),
        );
      });
      return;
    }

    if (percentUsed >= CRITICAL_PERCENT) {
      emitThresholdOnce(state, 'monthly-critical', () => {
        derivedEvents.push(
          createBudgetThresholdEvent(event, 'monthly', 'critical', percentUsed, 'warn'),
        );
      });
      return;
    }

    if (percentUsed >= config.monthlyBudgetWarnPercent) {
      emitThresholdOnce(state, 'monthly-warn', () => {
        derivedEvents.push(createBudgetThresholdEvent(event, 'monthly', 'warn', percentUsed, 'warn'));
      });
    }
  }
}

function emitThresholdOnce(state: EnforcementState, key: string, callback: () => void): void {
  if (state.firedKeys.has(key)) {
    return;
  }

  state.firedKeys.add(key);
  callback();
}

function createBudgetThresholdEvent(
  event: Extract<SessionEvent, { type: 'token_count' }>,
  scope: 'session' | 'monthly',
  level: 'warn' | 'critical',
  percentUsed: number,
  action: 'warn' | 'stop',
): BudgetThresholdEvent {
  return {
    type: 'budget_threshold',
    sessionId: event.sessionId,
    tool: event.tool,
    timestamp: event.timestamp,
    scope,
    level,
    percentUsed: Math.round(percentUsed * 10) / 10,
    action,
  };
}

function createAgentStoppedEvent(
  event: Extract<SessionEvent, { type: 'spiral_start' | 'token_count' }>,
  reason: AgentStoppedEvent['reason'],
): AgentStoppedEvent {
  return {
    type: 'agent_stopped',
    sessionId: event.sessionId,
    tool: event.tool,
    timestamp: event.timestamp,
    reason,
    filePath: event.type === 'spiral_start' ? event.filePath : null,
  };
}

function createSpiralStopEvent(
  event: Extract<SessionEvent, { type: 'spiral_start' }>,
  reason: SpiralStopEvent['reason'],
): SpiralStopEvent {
  return {
    type: 'spiral_stop',
    sessionId: event.sessionId,
    tool: event.tool,
    timestamp: event.timestamp,
    filePath: event.filePath,
    reason,
    costSavedUsd: event.estimatedWasteUsd ?? null,
  };
}
