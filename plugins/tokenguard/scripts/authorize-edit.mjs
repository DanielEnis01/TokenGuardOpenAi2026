const daemonUrl = process.env.TG_DAEMON_URL ?? 'http://localhost:47291';

const hookInput = await readHookInput();
const patchCommand = getPatchCommand(hookInput);
const filePaths = extractPatchFilePaths(patchCommand);

if (filePaths.length === 0 || typeof hookInput.session_id !== 'string') {
  process.exit(0);
}

try {
  const response = await fetch(`${daemonUrl}/enforcement/authorize-edit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(4_000),
    body: JSON.stringify({
      sessionId: hookInput.session_id,
      tool: 'codex',
      model: typeof hookInput.model === 'string' ? hookInput.model : null,
      filePaths,
    }),
  });

  if (!response.ok) {
    process.exit(0);
  }

  const decision = await response.json();

  if (decision.allowed !== false) {
    process.exit(0);
  }

  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: decision.reason ?? 'TokenGuard blocked this edit.',
      },
    })}\n`,
  );
} catch {
  // Monitoring should not prevent coding when the local daemon is unavailable.
  process.exit(0);
}

async function readHookInput() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

function getPatchCommand(input) {
  const toolInput = input.tool_input;

  if (typeof toolInput === 'string') {
    return toolInput;
  }

  if (!toolInput || typeof toolInput !== 'object') {
    return '';
  }

  // Codex exposes executable code as `command` in some surfaces and `code`
  // or `input` in others. Check every supported shape before deciding that a
  // tool call does not contain a patch.
  for (const key of ['command', 'patch', 'code', 'input', 'script']) {
    if (typeof toolInput[key] === 'string') {
      return toolInput[key];
    }
  }

  return '';
}

function extractPatchFilePaths(command) {
  // Codex's exec tool carries nested apply_patch content as a JavaScript
  // string, so its newlines arrive escaped (\\n) instead of literal lines.
  const normalizedCommand = command
    .replaceAll('\\r\\n', '\n')
    .replaceAll('\\n', '\n');
  const pattern = /^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm;
  const paths = [];
  let match;

  while ((match = pattern.exec(normalizedCommand)) !== null) {
    // Preserve duplicates: several patches to the same file inside one exec
    // command are exactly the batch-loop pattern TokenGuard must catch before
    // the command begins.
    paths.push(match[1].trim().replaceAll('\\', '/'));
  }

  return paths;
}
