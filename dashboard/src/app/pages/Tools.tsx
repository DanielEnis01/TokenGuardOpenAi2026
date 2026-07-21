import { useMemo, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { ToolInstallDialog } from '../components/ToolInstallDialog';
import { Command, Terminal, Box, Zap, Code2, Rocket, Heart, Cloud, Key, AlertCircle } from 'lucide-react';
import type { ToolId } from '../../../../shared/types.ts';
import { isImplementedConnectorTool } from '../../../../shared/tools.ts';
import { formatRelativeTime, formatToolLabel } from '../dashboardData';
import { useDaemonState } from '../providers/DaemonProvider';
import type { CliToolActionResult } from '../../../../shared/cli.ts';

const toolIcons: Record<ToolId, typeof Terminal> = {
  codex: Command,
  cursor: Terminal,
  windsurf: Box,
  'claude-code': Zap,
  'github-copilot': Code2,
  bolt: Rocket,
  lovable: Heart,
  'claude-api': Cloud,
  'openai-api': Key,
  unknown: AlertCircle,
};

const toolColors: Record<ToolId, string> = {
  codex: '#F3F3F5',
  cursor: '#8E8EA8',
  windsurf: '#8E8EA8',
  'claude-code': '#D9D9E8',
  'github-copilot': '#8E8EA8',
  bolt: '#8E8EA8',
  lovable: '#8E8EA8',
  'claude-api': '#8E8EA8',
  'openai-api': '#8E8EA8',
  unknown: '#8E8EA8',
};

export default function Tools() {
  const { connections, connectTool, errorMessage } = useDaemonState();
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [results, setResults] = useState<CliToolActionResult[]>([]);

  const selectedTools = useMemo(() => (activeTool ? [activeTool] : []), [activeTool]);

  const runInstall = async () => {
    if (!activeTool) {
      return;
    }

    setIsInstalling(true);
    const result = await connectTool(activeTool);
    setResults([result]);
    setIsInstalling(false);
  };

  return (
    <AppShell>
      <ToolInstallDialog
        open={activeTool !== null}
        tools={selectedTools}
        isRunning={isInstalling}
        results={results}
        onClose={() => {
          setActiveTool(null);
          setResults([]);
        }}
        onRun={() => void runInstall()}
        title={activeTool === 'codex' ? 'Install TokenGuard for Codex' : 'Install a local TokenGuard connector'}
        description={
          activeTool === 'codex'
            ? 'After you confirm, TokenGuard adds its Codex marketplace and installs the TokenGuard plugin in Codex on this computer.'
            : 'Run the selected local connector command.'
        }
      />

      <div className="dashboard-page p-7" style={{ background: 'transparent' }}>
        <div className="dashboard-page-header">
          <p className="dashboard-page-kicker">Connections</p>
          <h2 className="dashboard-page-title">Tools</h2>
          {errorMessage ? (
            <p className="mt-2" style={{ font: 'var(--font-caption)', color: 'var(--status-danger)' }}>
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {connections.map((tool) => (
            <ToolCard key={tool.tool} tool={tool} onConnect={() => setActiveTool(tool.tool)} />
          ))}
        </div>

        <div
          className="liquid-glass-card bento-card rounded-lg p-4"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            backdropFilter: 'var(--blur-elevated)',
            WebkitBackdropFilter: 'var(--blur-elevated)',
          }}
        >
          <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Local metadata only. Prompt content stays private.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function ToolCard({
  tool,
  onConnect,
}: {
  tool: ReturnType<typeof useDaemonState>['connections'][number];
  onConnect: () => void;
}) {
  const Icon = toolIcons[tool.tool] ?? AlertCircle;
  const displayName = formatToolLabel(tool.tool);
  const isConnected = tool.status === 'connected';
  const isConnecting = tool.status === 'connecting';
  const isImplemented = isImplementedConnectorTool(tool.tool);

  return (
    <div
      className="liquid-glass-card bento-card flex items-center justify-between rounded-xl p-5"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--blur-elevated)',
        WebkitBackdropFilter: 'var(--blur-elevated)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-6 w-6 items-center justify-center" style={{ color: toolColors[tool.tool] ?? '#8E8EA8' }}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '2px' }}>
            <span style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>{displayName}</span>
            <span
              className="rounded-full px-2 py-0.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-subtle)',
                color: isImplemented ? 'var(--text-primary)' : 'var(--text-muted)',
                font: 'var(--font-caption)',
              }}
            >
              {isImplemented ? 'ready now' : 'coming later'}
            </span>
          </div>
          {!isConnected ? (
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              {isConnecting
                ? 'Running install command...'
                : tool.status === 'error'
                  ? tool.errorMessage ?? 'Needs attention'
                  : 'Not connected'}
            </div>
          ) : null}
          <div className="mt-1" style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
            {isConnected && tool.lastSeenAt ? `Seen ${formatRelativeTime(tool.lastSeenAt)}` : tool.command}
          </div>
        </div>
      </div>

      <div>
        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ background: 'var(--status-ok)' }} />
            <span style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              Connected
            </span>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="rounded-xl px-3 py-1.5 transition-colors hover:opacity-80"
            style={{
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              background: 'var(--bg-card)',
              font: 'var(--font-label)',
              cursor: 'pointer',
              backdropFilter: 'var(--blur-card)',
              WebkitBackdropFilter: 'var(--blur-card)',
            }}
          >
            {isImplemented ? 'Connect' : 'Try install'}
          </button>
        )}
      </div>
    </div>
  );
}
