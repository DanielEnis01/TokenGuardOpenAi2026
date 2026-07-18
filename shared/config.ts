export interface GuardrailConfig {
  sessionTokenCap: number;
  monthlyBudgetUsd: number;
  monthlyBudgetWarnPercent: number;
  spiralEditThreshold: number;
  spiralTimeWindowSeconds: number;
  burnRateWarnThreshold: number;
  contextWindowWarnPercent: number;
  contextWindowAlertsEnabled: boolean;
  autoStopSpirals: boolean;
  hardStopOnSessionCap: boolean;
  hardStopOnMonthlyBudget: boolean;
  rollbackOnHardStop: boolean;
  promptRateLimitEnabled: boolean;
  promptRateLimitCount: number;
  promptRateLimitWindowSeconds: number;
}

export const DEFAULT_GUARDRAIL_CONFIG: GuardrailConfig = {
  sessionTokenCap: 500_000,
  monthlyBudgetUsd: 50,
  monthlyBudgetWarnPercent: 75,
  spiralEditThreshold: 3,
  spiralTimeWindowSeconds: 300,
  burnRateWarnThreshold: 10_000,
  contextWindowWarnPercent: 75,
  contextWindowAlertsEnabled: true,
  autoStopSpirals: false,
  hardStopOnSessionCap: false,
  hardStopOnMonthlyBudget: false,
  rollbackOnHardStop: false,
  promptRateLimitEnabled: false,
  promptRateLimitCount: 8,
  promptRateLimitWindowSeconds: 300,
};

export function mergeGuardrailConfig(
  overrides: Partial<GuardrailConfig> = {},
): GuardrailConfig {
  return {
    ...DEFAULT_GUARDRAIL_CONFIG,
    ...overrides,
  };
}

export function sanitizeGuardrailConfig(
  overrides: Partial<GuardrailConfig> = {},
): GuardrailConfig {
  const merged = mergeGuardrailConfig(overrides);

  return {
    sessionTokenCap: sanitizePositiveInteger(merged.sessionTokenCap, DEFAULT_GUARDRAIL_CONFIG.sessionTokenCap),
    monthlyBudgetUsd: sanitizePositiveNumber(merged.monthlyBudgetUsd, DEFAULT_GUARDRAIL_CONFIG.monthlyBudgetUsd),
    monthlyBudgetWarnPercent: sanitizePercentage(
      merged.monthlyBudgetWarnPercent,
      DEFAULT_GUARDRAIL_CONFIG.monthlyBudgetWarnPercent,
    ),
    spiralEditThreshold: sanitizePositiveInteger(
      merged.spiralEditThreshold,
      DEFAULT_GUARDRAIL_CONFIG.spiralEditThreshold,
    ),
    spiralTimeWindowSeconds: sanitizePositiveInteger(
      merged.spiralTimeWindowSeconds,
      DEFAULT_GUARDRAIL_CONFIG.spiralTimeWindowSeconds,
    ),
    burnRateWarnThreshold: sanitizePositiveInteger(
      merged.burnRateWarnThreshold,
      DEFAULT_GUARDRAIL_CONFIG.burnRateWarnThreshold,
    ),
    contextWindowWarnPercent: sanitizePercentage(
      merged.contextWindowWarnPercent,
      DEFAULT_GUARDRAIL_CONFIG.contextWindowWarnPercent,
    ),
    contextWindowAlertsEnabled: Boolean(merged.contextWindowAlertsEnabled),
    autoStopSpirals: Boolean(merged.autoStopSpirals),
    hardStopOnSessionCap: Boolean(merged.hardStopOnSessionCap),
    hardStopOnMonthlyBudget: Boolean(merged.hardStopOnMonthlyBudget),
    rollbackOnHardStop: Boolean(merged.rollbackOnHardStop),
    promptRateLimitEnabled: Boolean(merged.promptRateLimitEnabled),
    promptRateLimitCount: sanitizePositiveInteger(
      merged.promptRateLimitCount,
      DEFAULT_GUARDRAIL_CONFIG.promptRateLimitCount,
    ),
    promptRateLimitWindowSeconds: sanitizePositiveInteger(
      merged.promptRateLimitWindowSeconds,
      DEFAULT_GUARDRAIL_CONFIG.promptRateLimitWindowSeconds,
    ),
  };
}

function sanitizePositiveInteger(value: unknown, fallback: number): number {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return numericValue;
}

function sanitizePositiveNumber(value: unknown, fallback: number): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return numericValue;
}

function sanitizePercentage(value: unknown, fallback: number): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0 || numericValue > 100) {
    return fallback;
  }

  return numericValue;
}
