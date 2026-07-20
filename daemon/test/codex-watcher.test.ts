import assert from 'node:assert/strict';
import test from 'node:test';

import { extractCodexPatchFilePaths, extractPatchApplyFilePaths } from '../src/codex-watcher.ts';

const patch = `*** Begin Patch
*** Update File: src\\api\\routes.ts
@@
-old
+new
*** Add File: docs/notes.md
+note
*** End Patch`;

test('recognizes a direct completed apply_patch call', () => {
  assert.deepEqual(extractCodexPatchFilePaths('apply_patch', patch), [
    'src/api/routes.ts',
    'docs/notes.md',
  ]);
});

test('recognizes an apply_patch nested in a completed exec call', () => {
  const execInput = `const p = ${JSON.stringify(patch)};
const result = await tools.apply_patch(p);`;

  assert.deepEqual(extractCodexPatchFilePaths('exec', execInput), [
    'src/api/routes.ts',
    'docs/notes.md',
  ]);
});

test('ignores exec calls that do not apply a patch', () => {
  assert.deepEqual(
    extractCodexPatchFilePaths('exec', 'const result = await tools.shell_command({ command: "Get-ChildItem" });'),
    [],
  );
});

test('recognizes the exact file from a completed nested patch event', () => {
  assert.deepEqual(
    extractPatchApplyFilePaths({
      type: 'patch_apply_end',
      success: true,
      changes: {
        'C:\\project\\stop-test.txt': { type: 'update' },
      },
    }),
    ['C:/project/stop-test.txt'],
  );
});
