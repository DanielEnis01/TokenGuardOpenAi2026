export interface ModelPricing {
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
}

const DEFAULT_MODEL_PRICING: ModelPricing = {
  inputUsdPerMillion: 2,
  outputUsdPerMillion: 8,
};

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

export function resolveModelPricing(model: string | null | undefined): ModelPricing {
  if (!model) {
    return DEFAULT_MODEL_PRICING;
  }

  const normalizedModel = model.toLowerCase();
  const matchedPricing = MODEL_PRICING_MATCHERS.find(({ match }) =>
    match.some((pattern) => normalizedModel.includes(pattern)),
  );

  return matchedPricing?.pricing ?? DEFAULT_MODEL_PRICING;
}

export function estimateTokenCostUsd(
  model: string | null | undefined,
  tokensIn: number,
  tokensOut: number,
): number {
  const pricing = resolveModelPricing(model);

  return (
    (Math.max(0, tokensIn) / 1_000_000) * pricing.inputUsdPerMillion +
    (Math.max(0, tokensOut) / 1_000_000) * pricing.outputUsdPerMillion
  );
}
