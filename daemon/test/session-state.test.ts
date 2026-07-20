import assert from 'node:assert/strict';
import test from 'node:test';

import { createSessionStateStore } from '../src/session-state.ts';

test('keeps a stop request visible but returns to running when edits continue', () => {
  const store = createSessionStateStore();

  store.applyEvent({
    type: 'session_start',
    sessionId: 'session-1',
    tool: 'codex',
    timestamp: 1_000,
    model: 'gpt-5.6-terra',
  });
  store.applyEvent({
    type: 'stop_requested',
    sessionId: 'session-1',
    tool: 'codex',
    timestamp: 2_000,
    reason: 'user_confirmed',
    filePath: 'loop.txt',
  });

  assert.equal(store.getState().agentStatus, 'running');
  assert.equal(store.getState().lastStopRequestedAt, 2_000);

  store.applyEvent({
    type: 'file_write',
    sessionId: 'session-1',
    tool: 'codex',
    timestamp: 3_000,
    filePath: 'loop.txt',
  });

  const state = store.getState();
  assert.equal(state.agentStatus, 'running');
  assert.equal(state.lastActivityAt, 3_000);
  assert.equal(state.stopRequestCount, 1);
});
