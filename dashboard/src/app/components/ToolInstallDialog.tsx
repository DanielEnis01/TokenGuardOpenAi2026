import type { CliToolActionResult } from '../../../../shared/cli.ts';
import type { ToolId } from '../../../../shared/types.ts';
import { getToolInstallCommands } from '../../../../shared/tools.ts';

import { EmbeddedTerminal } from './LiquidGlass';

interface ToolInstallDialogProps {
  open: boolean;
  tools: ToolId[];
  isRunning: boolean;
  results: CliToolActionResult[];
  onClose: () => void;
  onRun: () => void;
  title: string;
  description: string;
}

export function ToolInstallDialog({
  open,
  tools,
  isRunning,
  results,
  onClose,
  onRun,
  title,
  description,
}: ToolInstallDialogProps) {
  if (!open) {
    return null;
  }

  const selectedToolCommands = tools.flatMap((tool) => getToolInstallCommands(tool));
  const isInstallingCodex = tools.includes('codex');
  const terminalLines = results.length > 0
    ? results.flatMap((result) => [
        { text: `$ ${result.command}` },
        { text: result.message, tone: result.success ? 'success' as const : 'danger' as const },
        ...[result.stdout, result.stderr]
          .filter((output): output is string => Boolean(output?.trim()))
          .flatMap((output) => output.trim().split(/\r?\n/).map((text) => ({ text, tone: result.success ? 'success' as const : 'danger' as const }))),
      ])
    : [
        ...selectedToolCommands.map((command) => ({ text: `$ ${command}` })),
        { text: isRunning ? 'running local connector install...' : 'ready to run after confirmation', tone: 'muted' as const },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div
        className="w-full max-w-2xl rounded-[24px] p-6"
        style={{
          background: 'rgba(16, 16, 16, 0.92)',
          border: '1px solid var(--border-default)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="mt-1" style={{ font: '600 24px/1.15 var(--font-family-sans)', color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <p className="mt-3" style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              {description}
            </p>
            {isInstallingCodex ? (
              <p className="mt-2" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                This adds the TokenGuard marketplace from GitHub and installs the TokenGuard plugin in Codex.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              font: 'var(--font-caption)',
            }}
          >
            Close
          </button>
        </div>

        <div className="mt-5">
          <EmbeddedTerminal
            title="tokenguard.connect"
            lines={terminalLines}
            resetKey={`${isRunning}-${results.map((result) => `${result.tool}-${result.success}`).join(',')}`}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              font: 'var(--font-label)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onRun}
            disabled={tools.length === 0 || isRunning}
            className="rounded-xl px-4 py-2.5"
            style={{
              background: tools.length > 0 && !isRunning ? 'var(--bg-card)' : 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: tools.length > 0 && !isRunning ? 'var(--text-primary)' : 'var(--text-muted)',
              font: 'var(--font-label)',
              opacity: tools.length > 0 && !isRunning ? 1 : 0.65,
              cursor: tools.length > 0 && !isRunning ? 'pointer' : 'not-allowed',
            }}
          >
            {isRunning ? 'Installing...' : isInstallingCodex ? 'Install TokenGuard plugin' : 'Run install command'}
          </button>
        </div>
      </div>
    </div>
  );
}
