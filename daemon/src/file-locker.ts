import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync, statSync } from 'node:fs';

export interface FileLockResult {
  filePath: string;
  locked: boolean;
  error?: string;
}

/**
 * The Codex desktop app does not expose a reliable way for another local
 * process to interrupt its in-flight tool run. A read-only file is the
 * dependable last line of defense: the active loop can no longer write the
 * file even when a plugin hook was bypassed by a built-in Codex tool.
 */
export function lockFileForEdits(filePath: string): FileLockResult {
  try {
    if (!existsSync(filePath)) {
      return { filePath, locked: false, error: 'The file no longer exists.' };
    }

    if (process.platform === 'win32') {
      execFileSync('attrib', ['+R', filePath], { windowsHide: true });
    } else {
      const mode = statSync(filePath).mode;
      chmodSync(filePath, mode & ~0o222);
    }

    return { filePath, locked: true };
  } catch (error) {
    return {
      filePath,
      locked: false,
      error: error instanceof Error ? error.message : 'Unable to lock the file.',
    };
  }
}
