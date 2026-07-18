const baseUrl = process.env.TG_DAEMON_URL ?? 'http://localhost:47291';
const now = Date.now();
const sessionId = `sess-smoke-${now}`;

const baseEvent = {
  sessionId,
  tool: 'claude-code',
};

await postEvent({
  ...baseEvent,
  type: 'session_start',
  timestamp: now,
  model: 'claude-sonnet-4',
});

await postEvent({
  ...baseEvent,
  type: 'token_count',
  timestamp: now + 5_000,
  model: 'claude-sonnet-4',
  tokensIn: 120_000,
  tokensOut: 48_000,
});

await postEvent({
  ...baseEvent,
  type: 'burn_rate_update',
  timestamp: now + 6_000,
  tokensPerMin: 12_000,
});

await postEvent({
  ...baseEvent,
  type: 'context_pressure',
  timestamp: now + 7_000,
  percent: 68,
  tokensUsed: 87_000,
  tokensTotal: 128_000,
});

for (let index = 0; index < 3; index += 1) {
  await postEvent({
    ...baseEvent,
    type: 'file_write',
    timestamp: now + 10_000 + index * 30_000,
    filePath: 'src/api/routes.ts',
  });
}

console.log(`Smoke session sent to ${baseUrl}`);
console.log(`Session ID: ${sessionId}`);
console.log('Expected result: live monitor shows an active session and one detected spiral.');

async function postEvent(event) {
  const response = await fetch(`${baseUrl}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to post ${event.type}: ${response.status} ${body}`);
  }

  return response.json();
}
