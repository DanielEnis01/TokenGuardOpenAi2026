import assert from 'node:assert/strict';

import {
  GUARDRAIL_OUTCOMES,
  GUARDRAIL_RULE_IDS,
  type GuardrailRuleResult,
} from '../../shared/rule-results.ts';

const now = Date.now();
const sessionId = `sess-rule-results-${now}`;

const ruleResults: GuardrailRuleResult[] = [
  createResult('revert_loop', 'warning', 'warning', {
    filePaths: ['src/guardrails.ts'],
    observedAt: [now - 30_000, now - 15_000, now],
    metrics: { editCount: 3, revertedEdits: 1 },
  }),
  createResult('near_duplicate_edit', 'intervention_requested', 'warning', {
    filePaths: ['src/guardrails.ts'],
    observedAt: [now - 10_000, now],
    metrics: { similarityPercent: 96 },
  }),
  createResult('file_ping_pong', 'stop_recommended', 'critical', {
    filePaths: ['src/api.ts', 'src/client.ts'],
    observedAt: [now - 20_000, now - 10_000, now],
    metrics: { switches: 2 },
  }),
  {
    ...createResult('high_churn', 'intervention_resolved', 'info', {
      filePaths: ['src/api.ts'],
      observedAt: [now - 5_000, now],
      metrics: { editsPerMinute: 18 },
    }),
    resolvedAt: now,
    resolution: 'continue',
  },
];

for (const result of ruleResults) {
  assert.ok(GUARDRAIL_RULE_IDS.includes(result.ruleId), `Unknown rule: ${result.ruleId}`);
  assert.ok(GUARDRAIL_OUTCOMES.includes(result.outcome), `Unknown outcome: ${result.outcome}`);
  assert.match(result.id, new RegExp(`^${sessionId}:`));
  assert.equal(result.sessionId, sessionId);
  assert.ok(result.evidence.filePaths.length > 0);
  assert.ok(result.evidence.observedAt.length > 0);
  assert.equal(typeof result.evidence.metrics, 'object');
}

const resolvedResult = ruleResults.find((result) => result.outcome === 'intervention_resolved');
assert.equal(resolvedResult?.resolution, 'continue');
assert.equal(resolvedResult?.resolvedAt, now);

const serialized = JSON.stringify(ruleResults);
assert.deepEqual(JSON.parse(serialized), ruleResults);

console.log(`Rule-result schema smoke test passed for ${ruleResults.length} outcomes.`);
console.log(`Session ID: ${sessionId}`);

function createResult(
  ruleId: GuardrailRuleResult['ruleId'],
  outcome: GuardrailRuleResult['outcome'],
  severity: GuardrailRuleResult['severity'],
  evidence: GuardrailRuleResult['evidence'],
): GuardrailRuleResult {
  return {
    id: `${sessionId}:${ruleId}:${outcome}`,
    ruleId,
    outcome,
    severity,
    sessionId,
    tool: 'codex',
    timestamp: now,
    summary: `Smoke test result for ${ruleId}.`,
    evidence,
    threshold: null,
    resolvedAt: null,
    resolution: null,
  };
}
