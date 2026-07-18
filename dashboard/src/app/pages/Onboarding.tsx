import { useMemo, useState } from 'react';
import {
  Command,
  Terminal,
  Box,
  Zap,
  Code2,
  Rocket,
  Heart,
  Cloud,
  Key,
  Check,
  Shield,
  Wallet,
  Gauge,
  Repeat2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import type { GuardrailConfig } from '../../../../shared/config.ts';
import type { ToolId } from '../../../../shared/types.ts';
import type { CliToolActionResult } from '../../../../shared/cli.ts';
import { isImplementedConnectorTool } from '../../../../shared/tools.ts';
import { guardrailConfig as defaultGuardrailConfig, formatToolLabel } from '../dashboardData';
import { useDaemonState } from '../providers/DaemonProvider';
import { ToolInstallDialog } from '../components/ToolInstallDialog';

const tools: { id: ToolId; name: string; icon: typeof Terminal }[] = [
  { id: 'codex', name: 'Codex', icon: Command },
  { id: 'cursor', name: 'Cursor', icon: Terminal },
  { id: 'windsurf', name: 'Windsurf', icon: Box },
  { id: 'claude-code', name: 'Claude Code', icon: Zap },
  { id: 'github-copilot', name: 'GitHub Copilot', icon: Code2 },
  { id: 'bolt', name: 'Bolt', icon: Rocket },
  { id: 'lovable', name: 'Lovable', icon: Heart },
  { id: 'claude-api', name: 'Claude API', icon: Cloud },
  { id: 'openai-api', name: 'OpenAI API', icon: Key },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { connections, connectTool } = useDaemonState();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTools, setSelectedTools] = useState<ToolId[]>([]);
  const [setupConfig, setSetupConfig] = useState<GuardrailConfig>(defaultGuardrailConfig);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installResults, setInstallResults] = useState<CliToolActionResult[]>([]);

  const connectionMap = useMemo(
    () => new Map(connections.map((connection) => [connection.tool, connection])),
    [connections],
  );

  const toggleTool = (toolId: ToolId) => {
    setSelectedTools((previous) =>
      previous.includes(toolId) ? previous.filter((tool) => tool !== toolId) : [...previous, toolId],
    );
  };

  const updateSetupConfig = <K extends keyof GuardrailConfig>(key: K, value: GuardrailConfig[K]) => {
    setSetupConfig((current) => ({ ...current, [key]: value }));
  };

  const runInstallCommands = async () => {
    if (selectedTools.length === 0) {
      return;
    }

    setIsInstalling(true);
    const nextResults: CliToolActionResult[] = [];

    for (const tool of selectedTools) {
      const result = await connectTool(tool);
      nextResults.push(result);
    }

    setInstallResults(nextResults);
    setIsInstalling(false);
  };

  const finishSetup = () => {
    navigate('/monitor');
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'transparent' }}>
      <ToolInstallDialog
        open={isInstallDialogOpen}
        tools={selectedTools}
        isRunning={isInstalling}
        results={installResults}
        onClose={() => {
          setIsInstallDialogOpen(false);
          setInstallResults([]);
        }}
        onRun={() => void runInstallCommands()}
        title="Install your selected connectors"
        description="TokenGuard will run the local connector install commands through the daemon after you approve them."
      />

      <div className="w-full max-w-3xl px-6">
        {step === 1 ? (
          <>
            <div className="mb-12 text-center">
              <h2
                className="mb-3"
                style={{
                  font: '600 28px/1.2 var(--font-family-sans)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.4px',
                }}
              >
                Connect your tools
              </h2>
              <p style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                Select the AI coding tools you use. TokenGuard will prompt before it runs any local install command.
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const selected = selectedTools.includes(tool.id);
                const connection = connectionMap.get(tool.id);
                const isImplemented = isImplementedConnectorTool(tool.id);

                return (
                  <div
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className="cursor-pointer rounded-xl p-5 transition-all hover:opacity-80"
                    style={{
                      background: 'var(--bg-card)',
                      border: selected ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                      backdropFilter: 'var(--blur-card)',
                      WebkitBackdropFilter: 'var(--blur-card)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6" style={{ color: 'var(--text-secondary)' }} />
                        <div>
                          <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>{tool.name}</div>
                          <p className="mt-1" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                            {connection?.status === 'connected'
                              ? 'Connected'
                              : connection?.status === 'connecting'
                                ? 'Install command running...'
                                : connection?.status === 'error'
                                  ? connection.errorMessage ?? 'Needs attention'
                                  : isImplemented
                                    ? 'Ready to install'
                                    : 'Connector coming soon'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
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
                        {selected ? (
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded"
                            style={{ background: 'var(--accent)' }}
                          >
                            <Check className="h-3 w-3" style={{ color: 'white' }} />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg px-3 py-2" style={{ background: 'var(--bg-elevated)' }}>
                      <code style={{ font: 'var(--font-data)', color: 'var(--text-secondary)' }}>
                        tokenguard connect {tool.id}
                      </code>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => setIsInstallDialogOpen(true)}
                className="flex h-11 w-full max-w-xs items-center justify-center rounded-xl transition-opacity hover:opacity-90"
                style={{
                  background: selectedTools.length > 0 ? 'var(--bg-elevated)' : 'rgba(255,255,255,0.03)',
                  color: selectedTools.length > 0 ? 'var(--text-primary)' : 'var(--text-disabled)',
                  font: 'var(--font-label)',
                  border: '1px solid var(--border-default)',
                  cursor: selectedTools.length > 0 ? 'pointer' : 'not-allowed',
                  backdropFilter: 'var(--blur-elevated)',
                  WebkitBackdropFilter: 'var(--blur-elevated)',
                }}
                disabled={selectedTools.length === 0}
              >
                Install selected tools
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex h-11 w-full max-w-xs items-center justify-center rounded-xl transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  font: 'var(--font-label)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer',
                  backdropFilter: 'var(--blur-card)',
                  WebkitBackdropFilter: 'var(--blur-card)',
                }}
              >
                Continue to guardrails
              </button>

              <Link to="/monitor" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                Skip for now
              </Link>
            </div>

            <ProgressIndicator currentStep={1} totalSteps={2} />
          </>
        ) : (
          <>
            <div className="mb-10 text-center">
              <h2
                className="mb-3"
                style={{
                  font: '600 28px/1.2 var(--font-family-sans)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.4px',
                }}
              >
                Set your limits
              </h2>
              <p style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                Establish the core guardrails from the TokenGuard workflow before the dashboard goes live.
              </p>
            </div>

            <div className="mb-6 rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>Selected tools</p>
              <p className="mt-2" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                {selectedTools.length > 0
                  ? selectedTools.map((tool) => formatToolLabel(tool)).join(', ')
                  : 'No tools selected yet'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SettingCard
                icon={<Wallet className="h-5 w-5" />}
                title="Session cap"
                description="Maximum tokens allowed in one agent session before TokenGuard warns or stops."
              >
                <InputRow
                  value={setupConfig.sessionTokenCap}
                  onChange={(value) => updateSetupConfig('sessionTokenCap', value)}
                  suffix="tokens"
                />
              </SettingCard>

              <SettingCard
                icon={<Wallet className="h-5 w-5" />}
                title="Monthly cap"
                description="Maximum total spend across all connected tools for the month."
              >
                <InputRow
                  value={setupConfig.monthlyBudgetUsd}
                  onChange={(value) => updateSetupConfig('monthlyBudgetUsd', value)}
                  prefix="$"
                  suffix="/ month"
                />
              </SettingCard>

              <SettingCard
                icon={<Gauge className="h-5 w-5" />}
                title="Burn rate alert"
                description="Alert when token velocity spikes above this threshold."
              >
                <InputRow
                  value={setupConfig.burnRateWarnThreshold}
                  onChange={(value) => updateSetupConfig('burnRateWarnThreshold', value)}
                  suffix="tokens / min"
                />
              </SettingCard>

              <SettingCard
                icon={<Repeat2 className="h-5 w-5" />}
                title="Loop detector"
                description="Flag a spiral when the same file is rewritten too many times in a short window."
              >
                <div className="grid grid-cols-2 gap-3">
                  <InputRow
                    value={setupConfig.spiralEditThreshold}
                    onChange={(value) => updateSetupConfig('spiralEditThreshold', value)}
                    suffix="edits"
                  />
                  <InputRow
                    value={Math.round(setupConfig.spiralTimeWindowSeconds / 60)}
                    onChange={(value) => updateSetupConfig('spiralTimeWindowSeconds', value * 60)}
                    suffix="minutes"
                  />
                </div>
              </SettingCard>

              <div
                className="rounded-xl p-5 md:col-span-2"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  backdropFilter: 'var(--blur-card)',
                  WebkitBackdropFilter: 'var(--blur-card)',
                }}
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--accent)' }}
                    >
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                        Auto-stop when session cap is reached
                      </div>
                      <p className="mt-2" style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                        The product workflow defaults this to alert-only on first use. Turn it on when you want hard
                        stops instead of warnings.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateSetupConfig('hardStopOnSessionCap', !setupConfig.hardStopOnSessionCap)}
                    className="relative flex-shrink-0 h-7 w-12 rounded-full transition-colors"
                    style={{
                      background: setupConfig.hardStopOnSessionCap ? 'var(--accent)' : 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <span
                      className="absolute top-[3px] h-5 w-5 rounded-full transition-all"
                      style={{
                        left: setupConfig.hardStopOnSessionCap ? '24px' : '3px',
                        background: setupConfig.hardStopOnSessionCap ? 'white' : 'var(--text-muted)',
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={finishSetup}
                className="flex h-11 w-full max-w-xs items-center justify-center rounded-xl transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  font: 'var(--font-label)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer',
                  backdropFilter: 'var(--blur-elevated)',
                  WebkitBackdropFilter: 'var(--blur-elevated)',
                }}
              >
                Launch Dashboard
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}
              >
                Back to tool selection
              </button>
            </div>

            <ProgressIndicator currentStep={2} totalSteps={2} />
          </>
        )}
      </div>
    </div>
  );
}

function ProgressIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="mt-12 text-center">
      <div className="mb-3 flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className="h-2 w-2 rounded-full"
            style={{ background: index < currentStep ? 'var(--accent)' : 'var(--border-subtle)' }}
          />
        ))}
      </div>
      <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}

function SettingCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--blur-card)',
        WebkitBackdropFilter: 'var(--blur-card)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: 'var(--bg-elevated)', color: 'var(--accent)' }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>{title}</div>
          <p className="mt-2" style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
            {description}
          </p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function InputRow({
  value,
  onChange,
  prefix,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-4 py-3"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        backdropFilter: 'var(--blur-elevated)',
        WebkitBackdropFilter: 'var(--blur-elevated)',
      }}
    >
      {prefix ? <span style={{ font: 'var(--font-data)', color: 'var(--text-secondary)' }}>{prefix}</span> : null}
      <input
        value={value}
        onChange={(event) => {
          const nextValue = Number.parseInt(event.target.value.replace(/[^\d]/g, ''), 10);
          onChange(Number.isNaN(nextValue) ? 0 : nextValue);
        }}
        className="w-full bg-transparent outline-none"
        style={{ font: 'var(--font-data)', color: 'var(--text-primary)' }}
      />
      {suffix ? <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>{suffix}</span> : null}
    </div>
  );
}
