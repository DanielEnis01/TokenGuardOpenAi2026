import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { Shield, AlertTriangle, DollarSign, Activity, Clock, Zap, Lock, CheckCircle2, XCircle } from 'lucide-react';
import type { GuardrailConfig } from '../../../../shared/config.ts';
import { AppShell } from '../components/AppShell';
import { useDaemonState } from '../providers/DaemonProvider';

export default function Guardrails() {
  const { config, updateConfig: persistConfig, connectionStatus, isUsingMockData } = useDaemonState();

  const updateConfig = <K extends keyof GuardrailConfig>(key: K, value: GuardrailConfig[K]) => {
    void persistConfig({ [key]: value } as Partial<GuardrailConfig>);
  };

  const spiralTimeMinutes = Math.round(config.spiralTimeWindowSeconds / 60);
  const sessionCapThousands = Math.round(config.sessionTokenCap / 1000);

  return (
    <AppShell>
      <div className="p-7" style={{ background: 'transparent' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h2 className="mb-2" style={{ font: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)' }}>
              Guardrails
            </h2>
            <p style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
              Real-time protection rules that automatically enforce your limits
            </p>
            <p className="mt-2" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              {isUsingMockData
                ? 'daemon offline - editing mock fallback config'
                : connectionStatus === 'connected'
                  ? 'changes save directly to the local daemon'
                  : 'daemon reconnecting - changes will sync on the next successful save'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <GuardrailCard
              icon={<AlertTriangle className="h-6 w-6" />}
              title="Spiral Detection"
              subtitle="Stop infinite loops before they drain your budget"
            >
              <div className="space-y-5">
                <ControlRow
                  label="Trigger after"
                  description="Number of edits to same file"
                  value={config.spiralEditThreshold}
                  onChange={(value) => updateConfig('spiralEditThreshold', value)}
                  min={2}
                  max={10}
                  unit="edits"
                />
                <ControlRow
                  label="Time window"
                  description="Edits within this period"
                  value={spiralTimeMinutes}
                  onChange={(value) => updateConfig('spiralTimeWindowSeconds', value * 60)}
                  min={1}
                  max={10}
                  unit="minutes"
                />
                <ActionToggle
                  label="Auto-stop spirals"
                  enabled={config.autoStopSpirals}
                  onChange={(value) => updateConfig('autoStopSpirals', value)}
                  description={config.autoStopSpirals ? 'Will force-stop when detected' : 'Will only warn when detected'}
                />
              </div>
              <SimulationPreview
                status={config.autoStopSpirals ? 'protected' : 'warning'}
                message={`${config.spiralEditThreshold}+ edits in ${spiralTimeMinutes}min -> ${config.autoStopSpirals ? 'Force stop' : 'Warning only'}`}
              />
            </GuardrailCard>

            <GuardrailCard
              icon={<Activity className="h-6 w-6" />}
              title="Token Caps"
              subtitle="Hard limits on token usage per session"
            >
              <div className="space-y-5">
                <ControlRow
                  label="Session maximum"
                  description="Hard limit per session"
                  value={sessionCapThousands}
                  onChange={(value) => updateConfig('sessionTokenCap', value * 1000)}
                  min={50}
                  max={3000}
                  step={50}
                  unit="k tokens"
                />
                <ControlRow
                  label="Burn rate warning"
                  description="Alert when token velocity spikes"
                  value={config.burnRateWarnThreshold}
                  onChange={(value) => updateConfig('burnRateWarnThreshold', value)}
                  min={1000}
                  max={50000}
                  step={1000}
                  unit="tok/min"
                />
                <ActionToggle
                  label="Hard stop at limit"
                  enabled={config.hardStopOnSessionCap}
                  onChange={(value) => updateConfig('hardStopOnSessionCap', value)}
                  description={config.hardStopOnSessionCap ? 'Will block all prompts at limit' : 'Will only warn at limit'}
                />
              </div>
              <SimulationPreview
                status={config.hardStopOnSessionCap ? 'protected' : 'warning'}
                message={`${sessionCapThousands}k tokens -> ${config.hardStopOnSessionCap ? 'Session blocked' : 'Warning only'}`}
              />
            </GuardrailCard>

            <GuardrailCard
              icon={<DollarSign className="h-6 w-6" />}
              title="Monthly Budget"
              subtitle="Spending caps to prevent cost overruns"
            >
              <div className="space-y-5">
                <ControlRow
                  label="Monthly cap"
                  description="Maximum spend per month"
                  value={config.monthlyBudgetUsd}
                  onChange={(value) => updateConfig('monthlyBudgetUsd', value)}
                  min={10}
                  max={500}
                  step={10}
                  unit="dollars"
                  prefix="$"
                />
                <ControlRow
                  label="Warning at"
                  description="Alert threshold percentage"
                  value={config.monthlyBudgetWarnPercent}
                  onChange={(value) => updateConfig('monthlyBudgetWarnPercent', value)}
                  min={50}
                  max={95}
                  step={5}
                  unit="%"
                />
                <ActionToggle
                  label="Hard stop at cap"
                  enabled={config.hardStopOnMonthlyBudget}
                  onChange={(value) => updateConfig('hardStopOnMonthlyBudget', value)}
                  description={config.hardStopOnMonthlyBudget ? 'Will block activity at cap' : 'Will only warn at cap'}
                />
              </div>
              <SimulationPreview
                status={config.hardStopOnMonthlyBudget ? 'protected' : 'warning'}
                message={`$${config.monthlyBudgetUsd}/month -> ${config.hardStopOnMonthlyBudget ? 'Activity blocked' : 'Warning only'}`}
              />
            </GuardrailCard>

            <GuardrailCard
              icon={<Clock className="h-6 w-6" />}
              title="Context Window"
              subtitle="Monitor context memory pressure"
            >
              <div className="space-y-5">
                <ControlRow
                  label="Warning threshold"
                  description="Alert when context fills"
                  value={config.contextWindowWarnPercent}
                  onChange={(value) => updateConfig('contextWindowWarnPercent', value)}
                  min={50}
                  max={95}
                  step={5}
                  unit="% full"
                />
                <ActionToggle
                  label="Enable alerts"
                  enabled={config.contextWindowAlertsEnabled}
                  onChange={(value) => updateConfig('contextWindowAlertsEnabled', value)}
                  description={config.contextWindowAlertsEnabled ? 'Will show context warnings' : 'Context alerts disabled'}
                />
              </div>
              <SimulationPreview
                status={config.contextWindowAlertsEnabled ? 'active' : 'disabled'}
                message={`${config.contextWindowWarnPercent}% full -> ${config.contextWindowAlertsEnabled ? 'Alert shown' : 'No alert'}`}
              />
            </GuardrailCard>
          </div>

          <div
            className="rounded-xl p-6"
            style={{
              background: config.promptRateLimitEnabled ? 'var(--bg-card)' : 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              opacity: config.promptRateLimitEnabled ? 1 : 0.6,
              backdropFilter: 'var(--blur-card)',
              WebkitBackdropFilter: 'var(--blur-card)',
            }}
          >
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{
                    background: 'var(--bg-elevated)',
                    color: config.promptRateLimitEnabled ? 'var(--status-info)' : 'var(--text-muted)',
                  }}
                >
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-1" style={{ font: 'var(--font-heading)', fontSize: '16px', color: 'var(--text-primary)' }}>
                    Prompt Rate Limiting
                  </h3>
                  <p style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                    Throttle excessive prompt frequency to prevent runaway sessions
                  </p>
                </div>
              </div>
              <ActionToggle
                label="Enable"
                enabled={config.promptRateLimitEnabled}
                onChange={(value) => updateConfig('promptRateLimitEnabled', value)}
                description=""
              />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
              <ControlRow
                label="Max prompts per 5 minutes"
                description=""
                value={config.promptRateLimitCount}
                onChange={(value) => updateConfig('promptRateLimitCount', value)}
                min={5}
                max={30}
                step={1}
                unit="prompts"
              />
              <SimulationPreview
                status={config.promptRateLimitEnabled ? 'active' : 'disabled'}
                message={`${config.promptRateLimitCount} prompts / 5min -> ${config.promptRateLimitEnabled ? 'Throttled' : 'No limit'}`}
              />
            </div>
          </div>

          <div
            className="mt-8 flex items-center justify-between rounded-lg p-5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'var(--blur-elevated)',
              WebkitBackdropFilter: 'var(--blur-elevated)',
            }}
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" style={{ color: 'var(--status-ok)' }} />
              <div>
                <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                  Protection Active
                </div>
                <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                  All changes saved automatically
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4" style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              <span>{config.autoStopSpirals ? 'ON' : 'OFF'} Spiral protection</span>
              <span>{config.hardStopOnSessionCap ? 'ON' : 'OFF'} Token caps</span>
              <span>{config.hardStopOnMonthlyBudget ? 'ON' : 'OFF'} Budget limits</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function GuardrailCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex min-h-[360px] flex-col rounded-xl p-6"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--blur-card)',
        WebkitBackdropFilter: 'var(--blur-card)',
      }}
    >
      <div className="mb-6 flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="mb-1" style={{ font: 'var(--font-heading)', fontSize: '16px', color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <p style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function ControlRow({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  prefix,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  prefix?: string;
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  const handleBlur = () => {
    const newValue = Number.parseInt(tempValue, 10);
    if (!Number.isNaN(newValue)) {
      const clampedValue = Math.max(min, Math.min(max, newValue));
      onChange(clampedValue);
    }
    setIsEditing(false);
    setTempValue(value.toString());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleBlur();
    } else if (event.key === 'Escape') {
      setIsEditing(false);
      setTempValue(value.toString());
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>{label}</div>
          {description ? (
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>{description}</div>
          ) : null}
        </div>
        <div className="flex items-center gap-2" style={{ font: 'var(--font-data)', color: 'var(--text-primary)' }}>
          {prefix ? <span>{prefix}</span> : null}
          {isEditing ? (
            <input
              type="text"
              value={tempValue}
              onChange={(event) => setTempValue(event.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-20 bg-transparent text-center text-lg font-semibold outline-none"
            />
          ) : (
            <span
              className="cursor-pointer text-lg font-semibold hover:opacity-70"
              onClick={() => {
                setIsEditing(true);
                setTempValue(value.toString());
              }}
            >
              {value}
            </span>
          )}
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{unit}</span>
        </div>
      </div>

      <div className="relative h-2 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="absolute h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, background: 'var(--text-secondary)' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number.parseInt(event.target.value, 10))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}

function ActionToggle({
  label,
  enabled,
  onChange,
  description,
}: {
  label: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  description: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-lg p-4"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--blur-elevated)',
        WebkitBackdropFilter: 'var(--blur-elevated)',
      }}
    >
      <div className="flex items-center gap-3">
        {enabled ? (
          <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
        ) : (
          <XCircle className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
        )}
        <div>
          <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>{label}</div>
          {description ? (
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>{description}</div>
          ) : null}
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className="relative h-6 w-11 rounded-full transition-all"
        style={{
          background: enabled ? 'var(--text-primary)' : 'var(--bg-elevated)',
          border: enabled ? 'none' : '1px solid var(--border-default)',
        }}
      >
        <div
          className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all"
          style={{ left: enabled ? 'calc(100% - 20px)' : '4px' }}
        />
      </button>
    </div>
  );
}

function SimulationPreview({
  status,
  message,
}: {
  status: 'protected' | 'warning' | 'active' | 'disabled';
  message: string;
}) {
  const statusConfig = {
    protected: { icon: Lock, color: 'var(--text-primary)' },
    warning: { icon: AlertTriangle, color: 'var(--text-secondary)' },
    active: { icon: Activity, color: 'var(--text-primary)' },
    disabled: { icon: XCircle, color: 'var(--text-muted)' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
      <div className="mt-auto border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
      <div
        className="flex items-center gap-3 rounded-md p-3"
        style={{
          background: 'var(--bg-elevated)',
          backdropFilter: 'var(--blur-elevated)',
          WebkitBackdropFilter: 'var(--blur-elevated)',
        }}
      >
        <Icon className="h-4 w-4 flex-shrink-0" style={{ color: config.color }} />
        <span style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>{message}</span>
      </div>
    </div>
  );
}
