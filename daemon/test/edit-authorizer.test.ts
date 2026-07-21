import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_GUARDRAIL_CONFIG } from '../../shared/config.ts';
import { createEditAuthorizer } from '../src/edit-authorizer.ts';

function createAuthorizer(autoStopSpirals = true) {
  return createEditAuthorizer(() => ({
    ...DEFAULT_GUARDRAIL_CONFIG,
    autoStopSpirals,
    spiralEditThreshold: 3,
    spiralTimeWindowSeconds: 300,
  }));
}

const request = (timestamp: number) => ({
  sessionId: 'session-1',
  tool: 'codex' as const,
  filePaths: ['src/api/routes.ts'],
  timestamp,
});

test('allows early edits and blocks the edit that reaches an enabled spiral limit', () => {
  const authorizer = createAuthorizer();

  assert.equal(authorizer.authorize(request(1_000)).allowed, true);
  assert.equal(authorizer.authorize(request(2_000)).allowed, true);

  const decision = authorizer.authorize(request(3_000));
  assert.equal(decision.allowed, false);
  assert.match(decision.reason ?? '', /repeated-edit limit/);
  assert.deepEqual(decision.spiral, { filePath: 'src/api/routes.ts', editCount: 3 });
});

test('keeps a stopped file locked until the user explicitly continues', () => {
  const authorizer = createAuthorizer();
  authorizer.authorize(request(1_000));
  authorizer.authorize(request(2_000));
  authorizer.authorize(request(3_000));

  assert.equal(authorizer.authorize(request(4_000)).allowed, false);

  authorizer.processEvent({
    type: 'spiral_stop',
    sessionId: 'session-1',
    tool: 'codex',
    timestamp: 5_000,
    filePath: 'src/api/routes.ts',
    reason: 'continue_anyway',
  });

  assert.equal(authorizer.authorize(request(6_000)).allowed, true);
});

test('blocks every later edit after the dashboard requests a stop', () => {
  const authorizer = createAuthorizer();

  authorizer.processEvent({
    type: 'stop_requested',
    sessionId: 'session-1',
    tool: 'codex',
    timestamp: 1_000,
    reason: 'user_confirmed',
    filePath: null,
  });

  const decision = authorizer.authorize({
    ...request(2_000),
    filePaths: ['a-different-file.txt'],
  });

  assert.equal(decision.allowed, false);
  assert.match(decision.reason ?? '', /stopped from the dashboard/);
});

test('reports but does not block a spiral when automatic stopping is off', () => {
  const authorizer = createAuthorizer(false);
  authorizer.authorize(request(1_000));
  authorizer.authorize(request(2_000));

  const decision = authorizer.authorize(request(3_000));
  assert.equal(decision.allowed, true);
  assert.deepEqual(decision.spiral, { filePath: 'src/api/routes.ts', editCount: 3 });
});

test('blocks a single command that contains a repeated patch batch', () => {
  const authorizer = createAuthorizer();

  const decision = authorizer.authorize({
    ...request(1_000),
    filePaths: [
      'src/api/routes.ts',
      'src/api/routes.ts',
      'src/api/routes.ts',
    ],
  });

  assert.equal(decision.allowed, false);
  assert.match(decision.reason ?? '', /repeated-edit limit/);
  assert.deepEqual(decision.spiral, { filePath: 'src/api/routes.ts', editCount: 3 });
});

test('blocks a repeated edit loop before its first nested patch runs', () => {
  const authorizer = createAuthorizer();

  const decision = authorizer.authorize({
    ...request(1_000),
    containsRepeatedEditLoop: true,
  });

  assert.equal(decision.allowed, false);
  assert.match(decision.reason ?? '', /repeated file-edit loop/);
  assert.deepEqual(decision.spiral, { filePath: 'src/api/routes.ts', editCount: 3 });
});
