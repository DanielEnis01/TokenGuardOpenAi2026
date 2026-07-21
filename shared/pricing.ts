export interface ModelPricing {
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
}

const MODEL_PRICING_MATCHERS: Array<{
  match: string[];
  pricing: ModelPricing;
}> = [
  {
    match: ['claude-opus', 'opus'],
    pricing: { inputUsdPerMillion: 15, outputUsdPerMillion: 75 },
  },
  {
    match: ['claude-sonnet', 'sonnet'],
    pricing: { inputUsdPerMillion: 3, outputUsdPerMillion: 15 },
  },
  {
    match: ['gpt-4.1-mini', 'gpt-4o-mini', 'mini'],
    pricing: { inputUsdPerMillion: 0.4, outputUsdPerMillion: 1.6 },
  },
  {
    match: ['gpt-4.1', 'gpt-4o', 'gpt-4'],
    pricing: { inputUsdPerMillion: 2, outputUsdPerMillion: 8 },
  },
];

export function resolveModelPricing(model: string | null | undefined): ModelPricing | null {
  if (!model) {
    return null;
  }

  const normalizedModel = model.toLowerCase();
  const matchedPricing = MODEL_PRICING_MATCHERS.find(({ match }) =>
    match.some((pattern) => normalizedModel.includes(pattern)),
  );

  return matchedPricing?.pricing ?? null;
}

export function hasKnownModelPricing(model: string | null | undefined): boolean {
  return resolveModelPricing(model) !== null;
}

export function estimateTokenCostUsd(
  model: string | null | undefined,
  tokensIn: number,
  tokensOut: number,
): number | null {
  const pricing = resolveModelPricing(model);

  if (!pricing) {
    return null;
  }

  return (
    (Math.max(0, tokensIn) / 1_000_000) * pricing.inputUsdPerMillion +
    (Math.max(0, tokensOut) / 1_000_000) * pricing.outputUsdPerMillion
  );
}
