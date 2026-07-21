import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_GUARDRAIL_CONFIG } from '../../shared/config.ts';
import { createSpiralDetector } from '../src/spiral-detector.ts';

test('emits one spiral detection and then quiet count updates for the same loop', () => {
  const detector = createSpiralDetector(() => ({
    ...DEFAULT_GUARDRAIL_CONFIG,
    spiralEditThreshold: 2,
    spiralTimeWindowSeconds: 300,
  }));
  const base = { sessionId: 'session-1', tool: 'codex' as const, filePath: 'loop.txt' };

  detector.processEvent({ type: 'session_start', ...base, timestamp: 1_000 });
  assert.deepEqual(detector.processEvent({ type: 'file_write', ...base, timestamp: 2_000 }), []);

  const detected = detector.processEvent({ type: 'file_write', ...base, timestamp: 3_000 });
  assert.equal(detected[0]?.type, 'spiral_start');

  const updated = detector.processEvent({ type: 'file_write', ...base, timestamp: 4_000 });
  assert.equal(updated[0]?.type, 'spiral_update');
  assert.equal(updated[0]?.editCount, 3);
});
