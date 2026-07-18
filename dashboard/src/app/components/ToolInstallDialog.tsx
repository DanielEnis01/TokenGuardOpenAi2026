import type { CliToolActionResult } from '../../../../shared/cli.ts';
import type { ToolId } from '../../../../shared/types.ts';

import { formatToolLabel } from '../dashboardData';

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
            <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>Local install command</p>
            <h3 className="mt-1" style={{ font: '600 24px/1.15 var(--font-family-sans)', color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <p className="mt-3" style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              {description}
            </p>
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

        <div
          className="mt-5 rounded-[18px] p-4"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
            TokenGuard will run these local CLI commands through the daemon:
          </p>
          <div className="mt-3 space-y-2">
            {tools.map((tool) => (
              <code
                key={tool}
                className="block rounded-xl px-3 py-2"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  font: 'var(--font-data)',
                }}
              >
                tokenguard connect {tool}
              </code>
            ))}
          </div>
        </div>

        {results.length > 0 ? (
          <div className="mt-5 space-y-3">
            {results.map((result) => (
              <div
                key={`${result.tool}-${result.command}`}
                className="rounded-[18px] p-4"
                style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${result.success ? 'rgba(82, 186, 135, 0.24)' : 'rgba(224, 85, 85, 0.24)'}`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                    {formatToolLabel(result.tool)}
                  </p>
                  <span style={{ font: 'var(--font-caption)', color: result.success ? 'var(--status-ok)' : 'var(--status-danger)' }}>
                    {result.success ? 'Installed' : 'Needs attention'}
                  </span>
                </div>
                <p className="mt-2" style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
                  {result.message}
                </p>
                {result.stdout ? (
                  <pre
                    className="mt-3 overflow-x-auto rounded-xl px-3 py-3"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-secondary)',
                      font: '12px/1.5 var(--font-family-mono)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {result.stdout}
                  </pre>
                ) : null}
                {result.stderr ? (
                  <pre
                    className="mt-3 overflow-x-auto rounded-xl px-3 py-3"
                    style={{
                      background: 'rgba(224, 85, 85, 0.08)',
                      color: 'var(--status-danger)',
                      font: '12px/1.5 var(--font-family-mono)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {result.stderr}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

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
            {isRunning ? 'Running install command...' : 'Run install command'}
          </button>
        </div>
      </div>
    </div>
  );
}
