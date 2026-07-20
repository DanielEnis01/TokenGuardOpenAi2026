import assert from 'node:assert/strict';

import { parseCodexTokenUsage } from '../src/codex-token-usage.ts';

const transcriptRecord = {
  timestamp: '2026-07-20T18:30:00.000Z',
  type: 'event_msg',
  payload: {
    type: 'token_count',
    info: {
      total_token_usage: {
        input_tokens: 58_474,
        cached_input_tokens: 56_576,
        output_tokens: 178,
        reasoning_output_tokens: 53,
        total_tokens: 58_652,
      },
      last_token_usage: {
        input_tokens: 1_663,
        cached_input_tokens: 1_152,
        output_tokens: 178,
        reasoning_output_tokens: 53,
        total_tokens: 1_841,
      },
      model_context_window: 128_000,
    },
  },
};

const baselineUsage = parseCodexTokenUsage(transcriptRecord, 'total');
const liveUsage = parseCodexTokenUsage(transcriptRecord, 'last');

assert.ok(baselineUsage);
assert.ok(liveUsage);
assert.deepEqual(baselineUsage, { tokensIn: 58_474, tokensOut: 178 });
assert.deepEqual(liveUsage, { tokensIn: 1_663, tokensOut: 178 });
assert.equal(baselineUsage.tokensIn + baselineUsage.tokensOut, 58_652);
assert.equal(liveUsage.tokensIn + liveUsage.tokensOut, 1_841);
assert.equal(parseCodexTokenUsage({ type: 'event_msg', payload: { type: 'token_count' } }, 'last'), null);

console.log('Codex token watcher smoke test passed.');
console.log(`Existing-session total: ${baselineUsage.tokensIn + baselineUsage.tokensOut} tokens.`);
console.log(`New transcript event: ${liveUsage.tokensIn + liveUsage.tokensOut} tokens.`);
