import {
  SESSION_EVENT_TYPES,
  TOOL_IDS,
  type AgentStopReason,
  type BudgetThresholdAction,
  type BudgetThresholdLevel,
  type BudgetThresholdScope,
  type SessionEvent,
  type SessionEventType,
  type ToolId,
} from '../../shared/types.ts';

export function parseSessionEvent(body: unknown): SessionEvent {
  if (!body || typeof body !== 'object') {
    throw new Error('Event payload must be an object.');
  }

  const event = body as Record<string, unknown>;

  if (!isSessionEventType(event.type)) {
    throw new Error('Event type is invalid.');
  }

  if (!isString(event.sessionId)) {
    throw new Error('sessionId is required.');
  }

  if (!isToolId(event.tool)) {
    throw new Error('tool is invalid.');
  }

  if (typeof event.timestamp !== 'number' || !Number.isFinite(event.timestamp)) {
    throw new Error('timestamp must be a number.');
  }

  if (event.type === 'file_write' && !isString(event.filePath)) {
    throw new Error('filePath is required for file_write events.');
  }

  if (
    (event.type === 'stop_requested' || event.type === 'agent_stopped') &&
    !isAgentStopReason(event.reason)
  ) {
    throw new Error(`reason is required for ${event.type} events.`);
  }

  if (event.type === 'budget_threshold') {
    if (!isBudgetThresholdScope(event.scope)) {
      throw new Error('scope is invalid for budget_threshold events.');
    }

    if (!isBudgetThresholdLevel(event.level)) {
      throw new Error('level is invalid for budget_threshold events.');
    }

    if (!isBudgetThresholdAction(event.action)) {
      throw new Error('action is invalid for budget_threshold events.');
    }
  }

  return event as unknown as SessionEvent;
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSessionEventType(value: unknown): value is SessionEventType {
  return isString(value) && (SESSION_EVENT_TYPES as readonly string[]).includes(value);
}

function isToolId(value: unknown): value is ToolId {
  return isString(value) && (TOOL_IDS as readonly string[]).includes(value);
}

function isBudgetThresholdScope(value: unknown): value is BudgetThresholdScope {
  return value === 'session' || value === 'monthly' || value === 'context_window';
}

function isBudgetThresholdLevel(value: unknown): value is BudgetThresholdLevel {
  return value === 'warn' || value === 'critical';
}

function isBudgetThresholdAction(value: unknown): value is BudgetThresholdAction {
  return value === 'warn' || value === 'pause' || value === 'stop';
}

function isAgentStopReason(value: unknown): value is AgentStopReason {
  return (
    value === 'user_confirmed' ||
    value === 'auto_stopped' ||
    value === 'hard_cap' ||
    value === 'free_plan_switch' ||
    value === 'continue_anyway' ||
    value === 'session_cap' ||
    value === 'monthly_budget'
  );
}
