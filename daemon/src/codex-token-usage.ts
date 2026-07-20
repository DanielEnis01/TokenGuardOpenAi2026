export type CodexTokenUsageKind = 'last' | 'total';

export interface CodexTokenUsage {
  tokensIn: number;
  tokensOut: number;
}

/**
 * Reads the usage metadata Codex writes to each token_count transcript event.
 * `last` is the delta for one model response; `total` is the cumulative
 * session usage and is used when TokenGuard attaches to an existing session.
 */
export function parseCodexTokenUsage(
  value: unknown,
  kind: CodexTokenUsageKind,
): CodexTokenUsage | null {
  if (!isRecord(value) || value.type !== 'event_msg' || !isRecord(value.payload)) {
    return null;
  }

  const payload = value.payload;

  if (payload.type !== 'token_count' || !isRecord(payload.info)) {
    return null;
  }

  const usageKey = kind === 'last' ? 'last_token_usage' : 'total_token_usage';
  const usage = payload.info[usageKey];

  if (!isRecord(usage)) {
    return null;
  }

  const tokensIn = readNonNegativeNumber(usage.input_tokens);
  const tokensOut = readNonNegativeNumber(usage.output_tokens);

  if (tokensIn === null || tokensOut === null) {
    return null;
  }

  return { tokensIn, tokensOut };
}

function readNonNegativeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
