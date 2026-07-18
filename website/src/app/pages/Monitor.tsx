import { AppShell } from '../components/AppShell';
import { LineChart, Line, XAxis, ResponsiveContainer } from 'recharts';

const burnData = [
  { time: '00', normal: 1200, spiral: null },
  { time: '05', normal: 1500, spiral: null },
  { time: '10', normal: 1800, spiral: null },
  { time: '15', normal: 2100, spiral: null },
  { time: '20', normal: null, spiral: 4200 },
  { time: '25', normal: null, spiral: 8100 },
  { time: '30', normal: null, spiral: 15200 },
];

const loopFiles = [
  { file: 'auth.service.ts', edits: 6, elapsed: '2m 14s', status: 'active' },
  { file: 'database.config.js', edits: 3, elapsed: '8m 02s', status: 'resolved' },
  { file: 'api/routes.ts', edits: 2, elapsed: '1m 45s', status: 'active' },
];

export default function Monitor() {
  return (
    <AppShell>
      <div className="p-7" style={{ background: 'var(--bg-card)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ font: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Monitor
          </h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" 
               style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--status-danger)' }}></div>
            <span style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              cursor · claude-sonnet-4
            </span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <MetricCard label="Burn Rate" value="15.2k" unit="tok/min" delta="+340%" status="danger" />
          <MetricCard label="Session Cost" value="$2.85" unit="/ $15.00" delta="19% used" status="warn" />
          <MetricCard label="Spirals Blocked" value="3" unit="this session" delta="$6.86 saved" status="ok" />
          <MetricCard label="Context Window" value="72%" unit="used" delta="28k remain" status="info" />
        </div>

        {/* Burn Rate Chart */}
        <div className="mb-8">
          <div className="flex items-baseline gap-2 mb-4">
            <h2 style={{ font: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Burn Rate
            </h2>
            <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              tokens per minute · last 30 minutes
            </span>
          </div>
          <div className="h-50" style={{ background: 'var(--bg-page)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burnData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis 
                  dataKey="time" 
                  stroke="var(--text-muted)"
                  style={{ font: 'var(--font-caption)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border-default)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="normal" 
                  stroke="var(--status-ok)" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="spiral" 
                  stroke="var(--status-danger)" 
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="0"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two-column section */}
        <div className="grid grid-cols-5 gap-6">
          {/* Loop Detector */}
          <div className="col-span-3">
            <h2 className="mb-4" style={{ font: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Loop Detector
            </h2>
            <div>
              {loopFiles.map((file, idx) => (
                <div key={idx} 
                     className="flex items-center gap-4 h-11"
                     style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className={`w-2 h-2 rounded-full ${file.status === 'active' ? 'animate-pulse' : ''}`} 
                       style={{ background: file.status === 'active' ? 'var(--status-danger)' : 'var(--status-ok)' }}></div>
                  <span className="flex-1" style={{ font: 'var(--font-data)', color: 'var(--text-primary)' }}>
                    {file.file}
                  </span>
                  <span className="px-2 py-0.5 rounded" 
                        style={{ 
                          font: 'var(--font-caption)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-secondary)'
                        }}>
                    {file.edits}× edits
                  </span>
                  <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                    {file.elapsed}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Bars */}
          <div className="col-span-2">
            <h2 className="mb-4" style={{ font: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Budget
            </h2>
            <div className="space-y-4">
              <BudgetBar label="Session" current="$2.85" limit="$15.00" percent={19} status="ok" />
              <BudgetBar label="Monthly" current="$25.20" limit="$60.00" percent={42} status="warn" />
              <BudgetBar label="Context" current="72%" limit="100%" percent={72} status="warn" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({ label, value, unit, delta, status }: {
  label: string;
  value: string;
  unit: string;
  delta: string;
  status: 'danger' | 'warn' | 'ok' | 'info';
}) {
  const statusColors = {
    danger: 'var(--status-danger)',
    warn: 'var(--status-warn)',
    ok: 'var(--status-ok)',
    info: 'var(--status-info)'
  };

  return (
    <div className="p-4 rounded-xl" 
         style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', marginBottom: '8px' }}>
        {label}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span style={{ 
          font: 'var(--font-data-lg)',
          color: status === 'ok' || status === 'info' ? 'var(--text-primary)' : statusColors[status]
        }}>
          {value}
        </span>
        <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
          {unit}
        </span>
      </div>
      <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
        {delta}
      </div>
    </div>
  );
}

function BudgetBar({ label, current, limit, percent, status }: {
  label: string;
  current: string;
  limit: string;
  percent: number;
  status: 'danger' | 'warn' | 'ok';
}) {
  const statusColors = {
    danger: 'var(--status-danger)',
    warn: 'var(--status-warn)',
    ok: 'var(--status-ok)'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
          {label}
        </span>
        <span style={{ font: 'var(--font-data)', color: 'var(--text-secondary)' }}>
          {current} / {limit}
        </span>
      </div>
      <div className="h-1 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
        <div className="h-full rounded-full transition-all" 
             style={{ width: `${percent}%`, background: statusColors[status] }}></div>
      </div>
    </div>
  );
}
