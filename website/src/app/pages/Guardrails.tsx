import { AppShell } from '../components/AppShell';
import { useState } from 'react';
import { Shield, AlertTriangle, DollarSign, Activity, Clock, Zap, Lock, CheckCircle2, XCircle } from 'lucide-react';

export default function Guardrails() {
  const [spiralEdits, setSpiralEdits] = useState(3);
  const [spiralTime, setSpiralTime] = useState(2);
  const [spiralAutoStop, setSpiralAutoStop] = useState(true);
  
  const [sessionCap, setSessionCap] = useState(300);
  const [sessionHardStop, setSessionHardStop] = useState(true);
  
  const [monthlyCap, setMonthlyCap] = useState(60);
  const [warningThreshold, setWarningThreshold] = useState(75);
  const [monthlyHardStop, setMonthlyHardStop] = useState(false);
  
  const [contextWarn, setContextWarn] = useState(75);
  const [contextAlerts, setContextAlerts] = useState(true);
  
  const [rateLimit, setRateLimit] = useState(15);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(false);

  return (
    <AppShell>
      <div className="p-7" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="mb-2" style={{ font: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)' }}>
              Guardrails
            </h2>
            <p style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
              Real-time protection rules that automatically enforce your limits
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Spiral Detection */}
            <GuardrailCard
              icon={<AlertTriangle className="w-6 h-6" />}
              title="Spiral Detection"
              subtitle="Stop infinite loops before they drain your budget"
              color="var(--status-warn)"
              active={spiralAutoStop}
            >
              <div className="space-y-5">
                <ControlRow
                  label="Trigger after"
                  description="Number of edits to same file"
                  value={spiralEdits}
                  onChange={setSpiralEdits}
                  min={2}
                  max={10}
                  unit="edits"
                />
                <ControlRow
                  label="Time window"
                  description="Edits within this period"
                  value={spiralTime}
                  onChange={setSpiralTime}
                  min={1}
                  max={10}
                  unit="minutes"
                />
                <ActionToggle
                  label="Auto-stop spirals"
                  enabled={spiralAutoStop}
                  onChange={setSpiralAutoStop}
                  description={spiralAutoStop ? "Will force-stop when detected" : "Will only warn when detected"}
                />
              </div>
              <SimulationPreview 
                status={spiralAutoStop ? "protected" : "warning"}
                message={`${spiralEdits}+ edits in ${spiralTime}min → ${spiralAutoStop ? 'Force Stop' : 'Warning Only'}`}
              />
            </GuardrailCard>

            {/* Token Caps */}
            <GuardrailCard
              icon={<Activity className="w-6 h-6" />}
              title="Token Caps"
              subtitle="Hard limits on token usage per session"
              color="var(--status-info)"
              active={sessionHardStop}
            >
              <div className="space-y-5">
                <ControlRow
                  label="Session maximum"
                  description="Hard limit per session"
                  value={sessionCap}
                  onChange={setSessionCap}
                  min={50}
                  max={1000}
                  step={50}
                  unit="k tokens"
                />
                <ActionToggle
                  label="Hard stop at limit"
                  enabled={sessionHardStop}
                  onChange={setSessionHardStop}
                  description={sessionHardStop ? "Will block all prompts at limit" : "Will only warn at limit"}
                />
              </div>
              <SimulationPreview 
                status={sessionHardStop ? "protected" : "warning"}
                message={`${sessionCap}k tokens → ${sessionHardStop ? 'Session Blocked' : 'Warning Only'}`}
              />
            </GuardrailCard>

            {/* Budget */}
            <GuardrailCard
              icon={<DollarSign className="w-6 h-6" />}
              title="Monthly Budget"
              subtitle="Spending caps to prevent cost overruns"
              color="var(--status-ok)"
              active={monthlyHardStop}
            >
              <div className="space-y-5">
                <ControlRow
                  label="Monthly cap"
                  description="Maximum spend per month"
                  value={monthlyCap}
                  onChange={setMonthlyCap}
                  min={10}
                  max={500}
                  step={10}
                  unit="dollars"
                  prefix="$"
                />
                <ControlRow
                  label="Warning at"
                  description="Alert threshold percentage"
                  value={warningThreshold}
                  onChange={setWarningThreshold}
                  min={50}
                  max={95}
                  step={5}
                  unit="%"
                />
                <ActionToggle
                  label="Hard stop at cap"
                  enabled={monthlyHardStop}
                  onChange={setMonthlyHardStop}
                  description={monthlyHardStop ? "Will block activity at cap" : "Will only warn at cap"}
                />
              </div>
              <SimulationPreview 
                status={monthlyHardStop ? "protected" : "warning"}
                message={`$${monthlyCap}/month → ${monthlyHardStop ? 'Activity Blocked' : 'Warning Only'}`}
              />
            </GuardrailCard>

            {/* Context Window */}
            <GuardrailCard
              icon={<Clock className="w-6 h-6" />}
              title="Context Window"
              subtitle="Monitor context memory pressure"
              color="var(--accent)"
              active={contextAlerts}
            >
              <div className="space-y-5">
                <ControlRow
                  label="Warning threshold"
                  description="Alert when context fills"
                  value={contextWarn}
                  onChange={setContextWarn}
                  min={50}
                  max={95}
                  step={5}
                  unit="% full"
                />
                <ActionToggle
                  label="Enable alerts"
                  enabled={contextAlerts}
                  onChange={setContextAlerts}
                  description={contextAlerts ? "Will show context warnings" : "Context alerts disabled"}
                />
              </div>
              <SimulationPreview 
                status={contextAlerts ? "active" : "disabled"}
                message={`${contextWarn}% full → ${contextAlerts ? 'Alert Shown' : 'No Alert'}`}
              />
            </GuardrailCard>
          </div>

          {/* Rate Limiting - Full Width */}
          <div className="rounded-xl p-6" 
               style={{ 
                 background: rateLimitEnabled ? 'var(--bg-card)' : 'var(--bg-elevated)',
                 border: '1px solid var(--border-subtle)',
                 opacity: rateLimitEnabled ? 1 : 0.6
               }}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                     style={{ 
                       background: 'var(--bg-elevated)',
                       color: rateLimitEnabled ? 'var(--status-info)' : 'var(--text-muted)'
                     }}>
                  <Zap className="w-6 h-6" />
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
                enabled={rateLimitEnabled}
                onChange={setRateLimitEnabled}
                description=""
              />
            </div>
            <div className="flex items-center gap-6">
              <ControlRow
                label="Max prompts per 5 minutes"
                description=""
                value={rateLimit}
                onChange={setRateLimit}
                min={5}
                max={30}
                step={5}
                unit="prompts"
              />
              <SimulationPreview 
                status={rateLimitEnabled ? "active" : "disabled"}
                message={`${rateLimit} prompts/5min → ${rateLimitEnabled ? 'Throttled' : 'No Limit'}`}
              />
            </div>
          </div>

          {/* Status Footer */}
          <div className="mt-8 flex items-center justify-between p-5 rounded-lg" 
               style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" style={{ color: 'var(--status-ok)' }} />
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
              <span>{spiralAutoStop ? '✓' : '○'} Spiral protection</span>
              <span>{sessionHardStop ? '✓' : '○'} Token caps</span>
              <span>{monthlyHardStop ? '✓' : '○'} Budget limits</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function GuardrailCard({ icon, title, subtitle, color, active, children }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-6 flex flex-col" 
         style={{ 
           background: 'var(--bg-card)',
           border: '1px solid var(--border-subtle)',
           minHeight: '360px'
         }}>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" 
             style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
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
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function ControlRow({ label, description, value, onChange, min, max, step = 1, unit, prefix }: {
  label: string;
  description: string;
  value: number;
  onChange: (val: number) => void;
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
    const newValue = parseInt(tempValue);
    if (!isNaN(newValue)) {
      const clampedValue = Math.max(min, Math.min(max, newValue));
      onChange(clampedValue);
    }
    setIsEditing(false);
    setTempValue(value.toString());
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTempValue(value.toString());
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
            {label}
          </div>
          {description && (
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              {description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2" style={{ font: 'var(--font-data)', color: 'var(--text-primary)' }}>
          {prefix && <span>{prefix}</span>}
          {isEditing ? (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-16 text-lg font-semibold text-center bg-transparent border-b border-current outline-none"
            />
          ) : (
            <span 
              className="text-lg font-semibold cursor-pointer hover:opacity-70"
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
        <div className="absolute h-full rounded-full transition-all" 
             style={{ 
               width: `${percentage}%`,
               background: 'var(--text-secondary)'
             }}></div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

function ActionToggle({ label, enabled, onChange, description }: {
  label: string;
  enabled: boolean;
  onChange: (val: boolean) => void;
  description: string;
}) {
  return (
    <div className="rounded-lg p-4 flex items-center justify-between" 
         style={{ 
           background: 'var(--bg-elevated)',
           border: '1px solid var(--border-subtle)'
         }}>
      <div className="flex items-center gap-3">
        {enabled ? (
          <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
        ) : (
          <XCircle className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        )}
        <div>
          <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
            {label}
          </div>
          {description && (
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              {description}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className="relative w-11 h-6 rounded-full transition-all"
        style={{ 
          background: enabled ? 'var(--text-primary)' : 'var(--bg-elevated)',
          border: enabled ? 'none' : '1px solid var(--border-default)'
        }}>
        <div className="absolute top-1 transition-all w-4 h-4 bg-white rounded-full shadow-sm"
             style={{ 
               left: enabled ? 'calc(100% - 20px)' : '4px'
             }}></div>
      </button>
    </div>
  );
}

function SimulationPreview({ status, message }: {
  status: 'protected' | 'warning' | 'active' | 'disabled';
  message: string;
}) {
  const statusConfig = {
    protected: { icon: Lock, color: 'var(--text-primary)' },
    warning: { icon: AlertTriangle, color: 'var(--text-secondary)' },
    active: { icon: Activity, color: 'var(--text-primary)' },
    disabled: { icon: XCircle, color: 'var(--text-muted)' }
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="rounded-md p-3 flex items-center gap-3" 
           style={{ background: 'var(--bg-elevated)' }}>
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: config.color }} />
        <span style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
          {message}
        </span>
      </div>
    </div>
  );
}