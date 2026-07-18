import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import { Activity, AlertTriangle, ChevronDown, Clock, DollarSign, Shield } from 'lucide-react';
import { ContactPopup } from '../components/ContactPopup';
import { Logo } from '../components/Logo';
import './home-hero.css';

export default function Home() {
  const [activeSpiral, setActiveSpiral] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpiral((previous) => !previous);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="website-home min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <nav
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-panel)',
          backdropFilter: 'var(--blur-panel)',
          WebkitBackdropFilter: 'var(--blur-panel)',
        }}
      >
        <Link to="/">
          <Logo size={28} />
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/how-it-works" style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>
            How It Works
          </Link>
          <Link to="/pricing" style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>
            Pricing
          </Link>
          <Link
            to="/auth"
            className="flex h-9 items-center rounded-xl px-4 transition-opacity hover:opacity-90"
            style={{
              color: 'var(--text-primary)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              font: 'var(--font-label)',
              backdropFilter: 'var(--blur-elevated)',
              WebkitBackdropFilter: 'var(--blur-elevated)',
            }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      <section className="relative flex h-screen items-center justify-center overflow-hidden px-6 pt-20">
        <MeshGradient
          className="absolute inset-0 h-full w-full"
          colors={['#000000', '#1a1a1a', '#2a2a2a', '#ffffff']}
          speed={0.8}
          backgroundColor="#000000"
        />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-1/4 h-32 w-32 animate-pulse rounded-full bg-gray-800/5 blur-3xl" />
          <div
            className="absolute bottom-1/3 right-1/4 h-24 w-24 animate-pulse rounded-full bg-white/5 blur-2xl"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute right-1/3 top-1/2 h-20 w-20 animate-pulse rounded-full bg-gray-900/10 blur-xl"
            style={{ animationDelay: '0.5s' }}
          />
        </div>

        <div className="relative z-10 w-full max-w-5xl text-center">
          <h1 className="title-text mb-4">TokenGuard</h1>
          <p className="subtitle-text mx-auto max-w-3xl">
            Stop AI token spirals before they drain your budget
          </p>

          <div className="mt-20 flex flex-col items-center gap-2" style={{ animation: 'fadeInBounce 2s ease-in-out infinite' }}>
            <span style={{ font: 'var(--font-caption)', color: 'rgba(255,255,255,0.5)' }}>
              Scroll to explore
            </span>
            <ChevronDown className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </div>
        </div>
      </section>

      <div className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div
            className="relative mb-16 overflow-hidden rounded-[28px] p-8"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              backdropFilter: 'var(--blur-card)',
              WebkitBackdropFilter: 'var(--blur-card)',
            }}
          >
            {activeSpiral ? (
              <div
                className="mb-6 flex items-start gap-3 rounded-[18px] p-4"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: '4px solid var(--status-danger)',
                  backdropFilter: 'var(--blur-elevated)',
                  WebkitBackdropFilter: 'var(--blur-elevated)',
                }}
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: 'var(--status-danger)' }} />
                <div className="flex-1">
                  <div className="mb-1" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                    Spiral Detected: auth.service.ts
                  </div>
                  <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                    6 edits in 2m 14s · burn rate +340% · projected cost $8.40
                  </div>
                </div>
                <button
                  className="rounded-xl px-3 py-1.5 transition-opacity hover:opacity-80"
                  style={{
                    background: 'rgba(224, 85, 85, 0.14)',
                    color: 'var(--status-danger)',
                    font: 'var(--font-label)',
                    border: '1px solid rgba(224, 85, 85, 0.28)',
                  }}
                >
                  Force Stop
                </button>
              </div>
            ) : null}

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DashboardMetric
                icon={<Activity className="h-4 w-4" />}
                label="Burn Rate"
                value={activeSpiral ? '15.2k' : '2.1k'}
                unit="tok/min"
                status={activeSpiral ? 'danger' : 'ok'}
              />
              <DashboardMetric
                icon={<DollarSign className="h-4 w-4" />}
                label="Session Cost"
                value={activeSpiral ? '$2.85' : '$0.42'}
                unit="/ $15.00"
                status={activeSpiral ? 'warn' : 'ok'}
              />
              <DashboardMetric
                icon={<Shield className="h-4 w-4" />}
                label="Spirals Blocked"
                value="3"
                unit="this session"
                status="ok"
              />
              <DashboardMetric
                icon={<Clock className="h-4 w-4" />}
                label="Context"
                value={activeSpiral ? '72%' : '34%'}
                unit="used"
                status={activeSpiral ? 'warn' : 'ok'}
              />
            </div>

            <div>
              <h3 className="mb-4" style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>
                Active Files
              </h3>
              <div className="space-y-3">
                <FileCard name="auth.service.ts" edits={activeSpiral ? 6 : 2} status={activeSpiral ? 'danger' : 'ok'} active={activeSpiral} />
                <FileCard name="user.controller.ts" edits={1} status="ok" active={false} />
                <FileCard name="database.config.ts" edits={activeSpiral ? 4 : 1} status={activeSpiral ? 'warn' : 'ok'} active={false} />
              </div>
            </div>
          </div>

          <div
            className="flex items-center justify-center gap-4 rounded-[22px] py-4"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'var(--blur-card)',
              WebkitBackdropFilter: 'var(--blur-card)',
            }}
          >
            <span style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>Upgrade plan:</span>
            <Link
              to="/pricing"
              className="flex h-10 items-center rounded-xl px-6 transition-opacity hover:opacity-90"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                font: 'var(--font-label)',
                backdropFilter: 'var(--blur-elevated)',
                WebkitBackdropFilter: 'var(--blur-elevated)',
              }}
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      <footer className="mt-20 px-6 py-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>© 2026 TokenGuard</p>
          <div className="flex items-center gap-6">
            <Link to="/pricing" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              Pricing
            </Link>
            <Link to="/how-it-works" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              How It Works
            </Link>
            <button
              onClick={() => setShowContactPopup(true)}
              style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </footer>

      {showContactPopup ? <ContactPopup onClose={() => setShowContactPopup(false)} /> : null}

      <style>{`
        @keyframes fadeInBounce {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(8px);
          }
        }
      `}</style>
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
    ok: 'var(--status-ok)',
  };

  return (
    <div
      className="rounded-[20px] p-5"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--blur-elevated)',
        WebkitBackdropFilter: 'var(--blur-elevated)',
      }}
    >
      <div className="mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
        {icon}
        <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          style={{
            font: '500 24px/1 var(--font-family-mono)',
            color: status === 'ok' ? 'var(--text-primary)' : statusColors[status],
          }}
        >
          {value}
        </span>
        <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>{unit}</span>
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
    ok: 'var(--status-ok)',
  };

  return (
    <div
      className="flex items-center justify-between rounded-[18px] p-4"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--blur-elevated)',
        WebkitBackdropFilter: 'var(--blur-elevated)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${active ? 'animate-pulse' : ''}`} style={{ background: statusColors[status] }} />
        <span style={{ font: 'var(--font-data)', color: 'var(--text-primary)' }}>{name}</span>
      </div>
      <span
        className="rounded-lg px-2.5 py-0.5"
        style={{
          background:
            status === 'ok'
              ? 'rgba(61, 173, 120, 0.12)'
              : status === 'warn'
                ? 'rgba(224, 152, 85, 0.12)'
                : 'rgba(224, 85, 85, 0.12)',
          color: statusColors[status],
          font: 'var(--font-caption)',
        }}
      >
        {edits}× edits
      </span>
    </div>
  );
}

