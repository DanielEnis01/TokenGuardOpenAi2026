export type ToolId =
  | 'codex'
  | 'claude-code'
  | 'cursor'
  | 'windsurf'
  | 'github-copilot'
  | 'claude-api'
  | 'openai-api'
  | 'bolt'
  | 'lovable'
  | 'unknown';

export type SessionEventType =
  | 'session_start'
  | 'session_end'
  | 'file_write'
  | 'token_count'
  | 'spiral_start'
  | 'spiral_update'
  | 'spiral_stop'
  | 'budget_threshold'
  | 'context_pressure'
  | 'stop_requested'
  | 'agent_stopped'
  | 'burn_rate_update';

export type BudgetThresholdScope = 'session' | 'monthly' | 'context_window';

export type BudgetThresholdLevel = 'warn' | 'critical';

export type BudgetThresholdAction = 'warn' | 'pause' | 'stop';

export type SpiralResolutionReason =
  | 'user_confirmed'
  | 'auto_stopped'
  | 'hard_cap'
  | 'free_plan_switch'
  | 'continue_anyway';

export type AgentStatus = 'idle' | 'running' | 'stopped';

export type AgentStopReason = SpiralResolutionReason | 'session_cap' | 'monthly_budget';

export type ToolConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface BaseSessionEvent {
  type: SessionEventType;
  sessionId: string;
  tool: ToolId;
  timestamp: number;
}

export interface SessionStartEvent extends BaseSessionEvent {
  type: 'session_start';
  model?: string | null;
}

export interface SessionEndEvent extends BaseSessionEvent {
  type: 'session_end';
}

export interface FileWriteEvent extends BaseSessionEvent {
  type: 'file_write';
  filePath: string;
}

export interface TokenCountEvent extends BaseSessionEvent {
  type: 'token_count';
  model?: string | null;
  tokensIn: number;
  tokensOut: number;
}

export interface SpiralStartEvent extends BaseSessionEvent {
  type: 'spiral_start';
  filePath: string;
  editCount: number;
  estimatedWasteUsd?: number | null;
}

export interface SpiralStopEvent extends BaseSessionEvent {
  type: 'spiral_stop';
  filePath: string;
  reason: SpiralResolutionReason;
  costSavedUsd?: number | null;
}

export interface BudgetThresholdEvent extends BaseSessionEvent {
  type: 'budget_threshold';
  scope: BudgetThresholdScope;
  level: BudgetThresholdLevel;
  percentUsed: number;
  action: BudgetThresholdAction;
}

export interface ContextPressureEvent extends BaseSessionEvent {
  type: 'context_pressure';
  percent: number;
  tokensUsed: number;
  tokensTotal: number;
}

export interface AgentStoppedEvent extends BaseSessionEvent {
  type: 'agent_stopped';
  reason: AgentStopReason;
  filePath?: string | null;
}

/** A later write to an already-detected loop; it is not a new detection. */
export interface SpiralUpdateEvent extends BaseSessionEvent {
  type: 'spiral_update';
  filePath: string;
  editCount: number;
  estimatedWasteUsd?: number | null;
}

/**
 * A control request has been sent, but the daemon has not observed a real
 * session end yet. This distinction keeps the dashboard honest when Codex is
 * already inside a long-running command.
 */
export interface StopRequestedEvent extends BaseSessionEvent {
  type: 'stop_requested';
  reason: AgentStopReason;
  filePath?: string | null;
}

export interface BurnRateUpdateEvent extends BaseSessionEvent {
  type: 'burn_rate_update';
  tokensPerMin: number;
}

export type SessionEvent =
  | SessionStartEvent
  | SessionEndEvent
  | FileWriteEvent
  | TokenCountEvent
  | SpiralStartEvent
  | SpiralUpdateEvent
  | SpiralStopEvent
  | BudgetThresholdEvent
  | ContextPressureEvent
  | StopRequestedEvent
  | AgentStoppedEvent
  | BurnRateUpdateEvent;

export interface ActiveSpiral {
  filePath: string;
  editCount: number;
  startedAt: number;
  updatedAt: number;
  estimatedWasteUsd?: number | null;
  status: 'active' | 'resolved';
}

export interface CurrentSessionState {
  sessionId: string | null;
  tool: ToolId | null;
  model?: string | null;
  startedAt?: number | null;
  agentStatus: AgentStatus;
  totalTokens: number;
  tokensIn: number;
  tokensOut: number;
  sessionCostUsd: number;
  costEstimateAvailable: boolean;
  monthlyCostUsd: number;
  burnRatePerMin: number;
  contextPercent: number;
  contextUsedTokens: number;
  contextTotalTokens: number;
  spiralsCaughtToday: number;
  activeSpirals: ActiveSpiral[];
  lastBudgetThreshold: BudgetThresholdEvent | null;
  lastActivityAt: number | null;
  stopRequestCount: number;
  lastStopRequestedAt: number | null;
  lastStopRequestReason: AgentStopReason | null;
  lastStopRequestFilePath: string | null;
  lastStopReason: AgentStopReason | null;
  lastStoppedAt: number | null;
  lastStoppedFilePath: string | null;
}

export interface SessionSummary {
  sessionId: string;
  tool: ToolId;
  model?: string | null;
  startedAt: number;
  endedAt?: number | null;
  totalTokens: number;
  tokensIn: number;
  tokensOut: number;
  totalCostUsd: number;
  spiralsCaught: number;
  spiralsStopped: number;
  costSavedUsd: number;
}

export interface ToolConnection {
  tool: ToolId;
  status: ToolConnectionState;
  command: string;
  lastSeenAt?: number | null;
  errorMessage?: string | null;
}

export const TOOL_IDS: ToolId[] = [
  'codex',
  'claude-code',
  'cursor',
  'windsurf',
  'github-copilot',
  'claude-api',
  'openai-api',
  'bolt',
  'lovable',
  'unknown',
];

export const SESSION_EVENT_TYPES: SessionEventType[] = [
  'session_start',
  'session_end',
  'file_write',
  'token_count',
  'spiral_start',
  'spiral_update',
  'spiral_stop',
  'budget_threshold',
  'context_pressure',
  'stop_requested',
  'agent_stopped',
  'burn_rate_update',
];

export const EMPTY_CURRENT_SESSION_STATE: CurrentSessionState = {
  sessionId: null,
  tool: null,
  model: null,
  startedAt: null,
  agentStatus: 'idle',
  totalTokens: 0,
  tokensIn: 0,
  tokensOut: 0,
  sessionCostUsd: 0,
  costEstimateAvailable: false,
  monthlyCostUsd: 0,
  burnRatePerMin: 0,
  contextPercent: 0,
  contextUsedTokens: 0,
  contextTotalTokens: 0,
  spiralsCaughtToday: 0,
  activeSpirals: [],
  lastBudgetThreshold: null,
  lastActivityAt: null,
  stopRequestCount: 0,
  lastStopRequestedAt: null,
  lastStopRequestReason: null,
  lastStopRequestFilePath: null,
  lastStopReason: null,
  lastStoppedAt: null,
  lastStoppedFilePath: null,
};
