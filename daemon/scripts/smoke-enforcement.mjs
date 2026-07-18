const baseUrl = process.env.TG_DAEMON_URL ?? 'http://localhost:47291';
const now = Date.now();
const sessionId = `sess-enforcement-${now}`;

const originalConfig = await getJson('/config');

try {
  await putJson('/config', {
    sessionTokenCap: 100_000,
    monthlyBudgetUsd: 0.5,
    monthlyBudgetWarnPercent: 50,
    autoStopSpirals: false,
    hardStopOnSessionCap: true,
    hardStopOnMonthlyBudget: false,
  });

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
    tokensIn: 60_000,
    tokensOut: 10_000,
  });

  await postEvent({
    ...baseEvent,
    type: 'token_count',
    timestamp: now + 10_000,
    model: 'claude-sonnet-4',
    tokensIn: 20_000,
    tokensOut: 5_000,
  });

  await postEvent({
    ...baseEvent,
    type: 'token_count',
    timestamp: now + 15_000,
    model: 'claude-sonnet-4',
    tokensIn: 10_000,
    tokensOut: 5_000,
  });

  const currentSession = await getJson('/session/current');

  console.log(`Enforcement smoke session sent to ${baseUrl}`);
  console.log(`Session ID: ${sessionId}`);
  console.log('Expected result: session warning at 70%, critical warning above 90%, then hard stop at cap.');
  console.log(JSON.stringify(currentSession, null, 2));
} finally {
  if (originalConfig?.config) {
    await putJson('/config', originalConfig.config);
  }
}

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

async function getJson(path) {
  const response = await fetch(`${baseUrl}${path}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to GET ${path}: ${response.status} ${body}`);
  }

  return response.json();
}

async function putJson(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to PUT ${path}: ${response.status} ${text}`);
  }

  return response.json();
}
