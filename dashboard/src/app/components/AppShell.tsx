import { Link, useLocation } from 'react-router';
import { Activity, Shield, Clock, Settings as SettingsIcon, Wrench } from 'lucide-react';
import { Logo, LogoIcon } from './Logo';
import { useDaemonState } from '../providers/DaemonProvider';
import { getWebsitePricingUrl } from '../lib/externalLinks';

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { session, connectionStatus, isUsingMockData } = useDaemonState();
  const hasActiveSession = Boolean(session.sessionId);
  const activeSpiralCount = session.activeSpirals.length;
  const pricingUrl = getWebsitePricingUrl();

  const navItems = [
    { path: '/monitor', icon: Activity, label: 'Monitor' },
    { path: '/guardrails', icon: Shield, label: 'Guardrails' },
    { path: '/history', icon: Clock, label: 'Sessions' },
    { path: '/tools', icon: Wrench, label: 'Tools' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="app-root dashboard-glass flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      <div
        className="flex w-12 shrink-0 flex-col items-center py-4"
        style={{
          background: 'var(--bg-rail)',
          borderRight: '1px solid var(--border-subtle)',
          backdropFilter: 'var(--blur-panel)',
          WebkitBackdropFilter: 'var(--blur-panel)',
        }}
      >
        <Link to="/monitor" className="mb-6">
          <LogoIcon size={24} />
        </Link>
        <div className="flex flex-1 flex-col gap-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              style={{
                color: location.pathname === item.path ? 'var(--text-primary)' : 'var(--text-muted)',
                background: 'transparent',
              }}
            >
              <item.icon className="h-4 w-4" />
            </Link>
          ))}
        </div>
        <div className="mb-3 h-px w-6" style={{ background: 'var(--border-subtle)' }} />
        <Link
          to="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
          style={{
            color: location.pathname === '/settings' ? 'var(--text-primary)' : 'var(--text-muted)',
            background: 'transparent',
          }}
        >
          <SettingsIcon className="h-4 w-4" />
        </Link>
        <a
          href={pricingUrl}
          className="mt-3 rounded-lg px-2 py-1 text-center transition-opacity hover:opacity-85"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            font: 'var(--font-caption)',
            backdropFilter: 'var(--blur-elevated)',
            WebkitBackdropFilter: 'var(--blur-elevated)',
          }}
        >
          Free
        </a>
      </div>

      <div
        className="hidden w-[220px] shrink-0 lg:flex lg:flex-col"
        style={{
          background: 'var(--bg-panel)',
          borderRight: '1px solid var(--border-subtle)',
          backdropFilter: 'var(--blur-panel)',
          WebkitBackdropFilter: 'var(--blur-panel)',
        }}
      >
        <div className="px-6 py-7">
          <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>Workspace</p>
          <div className="mt-2">
            <Logo size={18} />
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="rounded-xl px-4 py-3 transition-colors"
              style={{
                background: location.pathname === item.path ? 'var(--bg-card)' : 'transparent',
                color: location.pathname === item.path ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <div style={{ font: 'var(--font-label)' }}>{item.label}</div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1080px] px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
            {children}
          </div>
        </div>
        <footer
          className="shrink-0 border-t px-4 py-2"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'var(--bg-panel)',
            backdropFilter: 'var(--blur-panel)',
            WebkitBackdropFilter: 'var(--blur-panel)',
          }}
        >
          <div
            className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center gap-x-3 gap-y-1"
            style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}
          >
            <span className="inline-flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${activeSpiralCount > 0 ? 'animate-pulse' : ''}`}
                style={{
                  background: activeSpiralCount > 0
                    ? 'var(--status-danger)'
                    : hasActiveSession
                      ? 'var(--status-ok)'
                      : 'var(--text-muted)',
                }}
              />
              {hasActiveSession ? 'Session live' : 'No active session'}
            </span>
            <span>{isUsingMockData ? 'Mock data' : connectionStatus === 'connected' ? 'Daemon live' : 'Reconnecting'}</span>
            <span>|</span>
            <span>
              {hasActiveSession
                ? activeSpiralCount > 0
                  ? `${activeSpiralCount} spiral${activeSpiralCount === 1 ? '' : 's'} need attention`
                  : 'No active spirals'
                : 'Waiting for the first session event'}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
