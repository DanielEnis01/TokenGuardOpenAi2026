import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Activity, Shield, Clock, Settings as SettingsIcon, Wrench } from 'lucide-react';
import { Logo, LogoIcon } from './Logo';
import { useDaemonState } from '../providers/DaemonProvider';
import { getWebsitePricingUrl } from '../lib/externalLinks';

// Each route renders its own AppShell. Keep the pointer state at module scope so
// a sidebar remains open when a navigation click swaps one page for another.
let sidebarPointerIsInside = false;

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { session, connectionStatus, isUsingMockData } = useDaemonState();
  const hasActiveSession = Boolean(session.sessionId);
  const activeSpiralCount = session.activeSpirals.length;
  const pricingUrl = getWebsitePricingUrl();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => sidebarPointerIsInside);

  const expandSidebar = () => {
    sidebarPointerIsInside = true;
    setIsSidebarExpanded(true);
  };

  const collapseSidebar = () => {
    sidebarPointerIsInside = false;
    setIsSidebarExpanded(false);
  };

  const navItems = [
    { path: '/monitor', icon: Activity, label: 'Monitor' },
    { path: '/guardrails', icon: Shield, label: 'Guardrails' },
    { path: '/history', icon: Clock, label: 'Sessions' },
    { path: '/tools', icon: Wrench, label: 'Tools' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="app-root dashboard-glass flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      <aside
        className={`dashboard-sidebar relative z-10 flex shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-out ${
          isSidebarExpanded ? 'is-expanded w-[220px]' : 'w-14'
        }`}
        onMouseEnter={expandSidebar}
        onMouseLeave={collapseSidebar}
        onFocusCapture={expandSidebar}
        style={{
          background: 'var(--bg-rail)',
          borderRight: '1px solid var(--border-subtle)',
          backdropFilter: 'var(--blur-panel)',
          WebkitBackdropFilter: 'var(--blur-panel)',
        }}
      >
        <Link to="/monitor" className="flex min-w-[220px] items-center gap-3 px-4 py-5" aria-label="TokenGuard home">
          <LogoIcon size={24} />
          <div className="sidebar-copy min-w-0">
            <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>Workspace</p>
            <div className="mt-1">
              <Logo size={18} />
            </div>
          </div>
        </Link>

        <nav className="flex min-w-[220px] flex-1 flex-col gap-1 px-3 pb-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className="sidebar-nav-item flex items-center gap-3 rounded-xl px-3 py-3"
                style={{
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--border-subtle)' : 'transparent'}`,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="sidebar-copy whitespace-nowrap" style={{ font: 'var(--font-label)' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="min-w-[220px] px-3 pb-4">
          <a
            href={pricingUrl}
            className="sidebar-plan flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              font: 'var(--font-caption)',
              backdropFilter: 'var(--blur-elevated)',
              WebkitBackdropFilter: 'var(--blur-elevated)',
            }}
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--accent)', color: '#0b0b0d' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} />
            </span>
            <span className="sidebar-copy whitespace-nowrap">Free plan</span>
          </a>
        </div>
      </aside>

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
