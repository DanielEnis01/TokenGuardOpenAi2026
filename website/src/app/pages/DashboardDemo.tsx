import { Link } from 'react-router';
import { Activity, DollarSign, Shield, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';

export default function DashboardDemo() {
  const [activeSpiral, setActiveSpiral] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpiral(prev => !prev);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header/Nav */}
      <nav className="px-6 py-5 flex items-center justify-between" 
           style={{ 
             borderBottom: '1px solid var(--border-subtle)',
             background: 'var(--bg-panel)',
             backdropFilter: 'var(--blur-panel)',
             WebkitBackdropFilter: 'var(--blur-panel)'
           }}>
        <Link to="/">
          <Logo size={28} />
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/how-it-works" 
             style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>
            How It Works
          </Link>
          <Link to="/pricing" 
             style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>
            Pricing
          </Link>
          <Link to="/auth" 
                className="px-4 h-9 rounded-lg flex items-center transition-colors" 
                style={{ 
                  color: 'var(--text-primary)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  font: 'var(--font-label)'
                }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-3" style={{ 
              font: '600 40px/1.1 var(--font-family-sans)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.8px'
            }}>
              Live Session Monitor
            </h1>
            <p style={{ 
              font: '400 16px/1.6 var(--font-family-sans)',
              color: 'var(--text-secondary)' 
            }}>
              Watch your token burn rate in real-time. Stop spirals before they cost you.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="rounded-xl p-8 relative overflow-hidden mb-12" 
               style={{ 
                 background: 'var(--bg-card)',
                 border: '1px solid var(--border-default)',
                 backdropFilter: 'var(--blur-card)',
                 WebkitBackdropFilter: 'var(--blur-card)'
               }}>
            
            {/* Spiral Alert */}
            {activeSpiral && (
              <div className="mb-6 rounded-lg p-4 flex items-start gap-3 animate-in" 
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
                          border: 'none'
                        }}>
                  Force Stop
                </button>
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <DashboardMetric 
                icon={<Activity className="w-4 h-4" />}
                label="Burn Rate" 
                value={activeSpiral ? "15.2k" : "2.1k"}
                unit="tok/min" 
                status={activeSpiral ? "danger" : "ok"}
              />
              <DashboardMetric 
                icon={<DollarSign className="w-4 h-4" />}
                label="Session Cost" 
                value={activeSpiral ? "$2.85" : "$0.42"}
                unit="/ $15.00" 
                status={activeSpiral ? "warn" : "ok"}
              />
              <DashboardMetric 
                icon={<Shield className="w-4 h-4" />}
                label="Spirals Blocked" 
                value="3"
                unit="this session" 
                status="ok"
              />
              <DashboardMetric 
                icon={<Clock className="w-4 h-4" />}
                label="Context" 
                value={activeSpiral ? "72%" : "34%"}
                unit="used" 
                status={activeSpiral ? "warn" : "ok"}
              />
            </div>

            {/* Active Files */}
            <div>
              <h3 className="mb-4" style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>
                Active Files
              </h3>
              <div className="space-y-3">
                <FileCard 
                  name="auth.service.ts" 
                  edits={activeSpiral ? 6 : 2}
                  status={activeSpiral ? "danger" : "ok"}
                  active={activeSpiral}
                />
                <FileCard 
                  name="user.controller.ts" 
                  edits={1}
                  status="ok"
                  active={false}
                />
                <FileCard 
                  name="database.config.ts" 
                  edits={activeSpiral ? 4 : 1}
                  status={activeSpiral ? "warn" : "ok"}
                  active={false}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Average Savings"
              value="73%"
              description="compared to unmonitored sessions"
            />
            <StatCard
              icon={<Shield className="w-5 h-5" />}
              label="Spirals Prevented"
              value="1,247"
              description="across all users this month"
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5" />}
              label="Money Saved"
              value="$142k"
              description="in prevented token waste"
            />
          </div>

          {/* CTA */}
          <div className="text-center rounded-xl p-12" 
               style={{ 
                 background: 'var(--bg-card)',
                 border: '1px solid var(--border-default)',
                 backdropFilter: 'var(--blur-card)',
                 WebkitBackdropFilter: 'var(--blur-card)'
               }}>
            <h3 className="mb-3" style={{ 
              font: '600 28px/1.2 var(--font-family-sans)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.4px'
            }}>
              Ready to stop wasting tokens?
            </h3>
            <p className="mb-6" style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
              Get your own dashboard and start monitoring in minutes
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/auth" 
                    className="px-6 h-11 rounded-lg flex items-center transition-opacity hover:opacity-90" 
                    style={{ 
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-default)',
                      font: 'var(--font-label)',
                      backdropFilter: 'var(--blur-elevated)',
                      WebkitBackdropFilter: 'var(--blur-elevated)'
                    }}>
                Start Free Trial
              </Link>
              <Link to="/pricing" 
                   className="px-6 h-11 rounded-lg flex items-center transition-colors" 
                   style={{ 
                     color: 'var(--text-primary)',
                     background: 'var(--bg-elevated)',
                     border: '1px solid var(--border-default)',
                     font: 'var(--font-label)'
                   }}>
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardMetric({ icon, label, value, unit, status }: {
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
    <div className="p-5 rounded-lg" 
         style={{ 
           background: 'var(--bg-elevated)', 
           border: '1px solid var(--border-subtle)',
           backdropFilter: 'var(--blur-elevated)',
           WebkitBackdropFilter: 'var(--blur-elevated)'
         }}>
      <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
        {icon}
        <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span style={{ 
          font: '500 24px/1 var(--font-family-mono)',
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

function FileCard({ name, edits, status, active }: {
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
    <div className="rounded-lg p-4 flex items-center justify-between" 
         style={{ 
           background: 'var(--bg-elevated)', 
           border: '1px solid var(--border-subtle)',
           backdropFilter: 'var(--blur-elevated)',
           WebkitBackdropFilter: 'var(--blur-elevated)'
         }}>
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

function StatCard({ icon, label, value, description }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl" 
         style={{ 
           background: 'var(--bg-card)', 
           border: '1px solid var(--border-subtle)',
           backdropFilter: 'var(--blur-card)',
           WebkitBackdropFilter: 'var(--blur-card)'
         }}>
      <div className="flex items-center gap-3 mb-4" style={{ color: 'var(--status-ok)' }}>
        {icon}
        <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
          {label}
        </span>
      </div>
      <div className="mb-2" style={{ 
        font: '600 32px/1 var(--font-family-sans)',
        color: 'var(--text-primary)'
      }}>
        {value}
      </div>
      <div style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
        {description}
      </div>
    </div>
  );
}
