import { useState, useEffect } from 'react';
import { Activity, DollarSign, Shield, Clock, AlertTriangle, TrendingUp, Settings, Bell } from 'lucide-react';

export function AppDashboard() {
  const [activeSpiral, setActiveSpiral] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpiral(prev => !prev);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ background: 'var(--bg-page)' }}>
      {/* Sidebar + Main Layout */}
      <div className="flex h-[600px]">
        {/* Sidebar */}
        <div className="w-[220px] p-4 flex flex-col" 
             style={{ borderRight: '1px solid var(--border-subtle)' }}>
          <div className="mb-6 px-2">
            <div style={{ font: 'var(--font-label)', fontSize: '18px', color: 'var(--text-primary)' }}>
              TokenGuard
            </div>
          </div>
          
          <nav className="flex-1 space-y-1">
            <NavItem icon={<Activity className="w-4 h-4" />} label="Dashboard" active />
            <NavItem icon={<Shield className="w-4 h-4" />} label="Guardrails" />
            <NavItem icon={<Clock className="w-4 h-4" />} label="History" />
            <NavItem icon={<Bell className="w-4 h-4" />} label="Alerts" />
            <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
          </nav>

          <div className="px-3 py-2 rounded-lg" 
               style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Current Plan
            </div>
            <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
              Pro
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="mb-1" style={{ 
                font: '600 24px/1.2 var(--font-family-sans)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.3px'
              }}>
                Active Session
              </h1>
              <p style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                Cursor · Project: tokenguard-web
              </p>
            </div>

            {/* Spiral Alert */}
            {activeSpiral && (
              <div className="mb-6 rounded-lg p-4 flex items-start gap-3" 
                   style={{ 
                     background: 'var(--bg-elevated)',
                     borderLeft: '4px solid var(--status-danger)'
                   }}>
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" 
                               style={{ color: 'var(--status-danger)' }} />
                <div className="flex-1">
                  <div className="mb-1" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                    Spiral Detected: auth.service.ts
                  </div>
                  <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                    6 edits in 2m 14s · burn rate +340% · projected cost $8.40
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-md transition-opacity hover:opacity-80"
                        style={{ 
                          background: 'var(--status-danger)',
                          color: 'white',
                          font: 'var(--font-label)',
                          border: 'none',
                          cursor: 'pointer'
                        }}>
                  Force Stop
                </button>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <MetricCard 
                icon={<Activity className="w-4 h-4" />}
                label="Burn Rate" 
                value={activeSpiral ? "15.2k" : "2.1k"}
                unit="tok/min" 
                status={activeSpiral ? "danger" : "ok"}
              />
              <MetricCard 
                icon={<DollarSign className="w-4 h-4" />}
                label="Session Cost" 
                value={activeSpiral ? "$2.85" : "$0.42"}
                unit="/ $15.00" 
                status={activeSpiral ? "warn" : "ok"}
              />
              <MetricCard 
                icon={<Shield className="w-4 h-4" />}
                label="Spirals Blocked" 
                value="3"
                unit="this session" 
                status="ok"
              />
              <MetricCard 
                icon={<Clock className="w-4 h-4" />}
                label="Context" 
                value={activeSpiral ? "72%" : "34%"}
                unit="used" 
                status={activeSpiral ? "warn" : "ok"}
              />
            </div>

            {/* Active Files */}
            <div>
              <h3 className="mb-3" style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>
                Active Files
              </h3>
              <div className="space-y-2">
                <FileRow 
                  name="auth.service.ts" 
                  edits={activeSpiral ? 6 : 2}
                  status={activeSpiral ? "danger" : "ok"}
                  active={activeSpiral}
                />
                <FileRow 
                  name="user.controller.ts" 
                  edits={1}
                  status="ok"
                  active={false}
                />
                <FileRow 
                  name="database.config.ts" 
                  edits={activeSpiral ? 4 : 1}
                  status={activeSpiral ? "warn" : "ok"}
                  active={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className="w-full px-3 py-2 rounded-lg flex items-center gap-3 transition-colors"
      style={{ 
        background: active ? 'var(--bg-elevated)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        font: 'var(--font-label)',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left'
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function MetricCard({ icon, label, value, unit, status }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  status: 'danger' | 'warn' | 'ok';
}) {
  const statusColors = {
    danger: 'var(--status-danger)',
    warn: 'var(--status-warn)',
    ok: 'var(--status-ok)'
  };

  return (
    <div className="p-4 rounded-lg" 
         style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
        {icon}
        <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span style={{ 
          font: '500 20px/1 var(--font-family-mono)',
          color: status === 'ok' ? 'var(--text-primary)' : statusColors[status]
        }}>
          {value}
        </span>
        <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

function FileRow({ name, edits, status, active }: {
  name: string;
  edits: number;
  status: 'danger' | 'warn' | 'ok';
  active: boolean;
}) {
  const statusColors = {
    danger: 'var(--status-danger)',
    warn: 'var(--status-warn)',
    ok: 'var(--status-ok)'
  };

  return (
    <div className="rounded-lg p-3 flex items-center justify-between" 
         style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${active ? 'animate-pulse' : ''}`}
             style={{ background: statusColors[status] }}></div>
        <span style={{ font: 'var(--font-data)', color: 'var(--text-primary)' }}>
          {name}
        </span>
      </div>
      <span className="px-2 py-0.5 rounded" 
            style={{ 
              background: status === 'ok' ? 'rgba(61, 173, 120, 0.12)' : status === 'warn' ? 'rgba(224, 152, 85, 0.12)' : 'rgba(224, 85, 85, 0.12)',
              color: statusColors[status],
              font: 'var(--font-caption)'
            }}>
        {edits}× edits
      </span>
    </div>
  );
}
