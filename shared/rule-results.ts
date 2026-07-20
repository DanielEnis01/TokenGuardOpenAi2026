import type { ToolId } from './types.ts';

/**
 * Stable identifiers for the edit-pattern detectors TokenGuard owns today.
 * Add a new identifier here before a detector begins emitting results so
 * persistence, the dashboard, and plugin integrations share one vocabulary.
 */
export type GuardrailRuleId =
  | 'revert_loop'
  | 'near_duplicate_edit'
  | 'file_ping_pong'
  | 'high_churn'
  | 'no_net_progress';

export type GuardrailOutcome =
  | 'warning'
  | 'intervention_requested'
  | 'intervention_resolved'
  | 'stop_recommended';

export type GuardrailSeverity = 'info' | 'warning' | 'critical';

export type GuardrailResolution = 'stop' | 'continue' | 'dismissed' | 'expired';

/**
 * Concrete, serializable evidence a rule used to reach its decision.
 * Values are intentionally JSON-safe so a result can be stored verbatim in
 * SQLite, returned by the History API, and handed to an enforcement plugin.
 */
export interface GuardrailEvidence {
  filePaths: string[];
  observedAt: number[];
  metrics: Record<string, number>;
  details?: Record<string, string | number | boolean | null>;
}

/**
 * A detector's decision. This is separate from raw SessionEvent records:
 * events describe what happened, while results explain which policy matched
 * and what a consumer should do next.
 */
export interface GuardrailRuleResult {
  id: string;
  ruleId: GuardrailRuleId;
  outcome: GuardrailOutcome;
  severity: GuardrailSeverity;
  sessionId: string;
  tool: ToolId;
  timestamp: number;
  summary: string;
  evidence: GuardrailEvidence;
  /** The configured threshold that was evaluated, when the rule uses one. */
  threshold?: number | null;
  /** Set only when an intervention is later resolved. */
  resolvedAt?: number | null;
  resolution?: GuardrailResolution | null;
}

export const GUARDRAIL_RULE_IDS: GuardrailRuleId[] = [
  'revert_loop',
  'near_duplicate_edit',
  'file_ping_pong',
  'high_churn',
  'no_net_progress',
];

export const GUARDRAIL_OUTCOMES: GuardrailOutcome[] = [
  'warning',
  'intervention_requested',
  'intervention_resolved',
  'stop_recommended',
];
