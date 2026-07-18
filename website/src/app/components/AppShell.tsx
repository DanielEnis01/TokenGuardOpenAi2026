import { Link, useLocation } from 'react-router';
import { Activity, Shield, Clock, Settings as SettingsIcon, Wrench } from 'lucide-react';
import { LogoIcon } from './Logo';

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const navItems = [
    { path: '/monitor', icon: Activity, label: 'Monitor' },
    { path: '/guardrails', icon: Shield, label: 'Guardrails' },
    { path: '/history', icon: Clock, label: 'History' },
    { path: '/tools', icon: Wrench, label: 'Tools' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Left Rail */}
      <div className="w-12 flex flex-col items-center py-4" 
           style={{ background: 'var(--bg-rail)', borderRight: '1px solid var(--border-subtle)' }}>
        <Link to="/monitor" className="mb-8">
          <LogoIcon size={24} />
        </Link>
        <div className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} 
                  className="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
                  style={{ 
                    color: location.pathname === item.path ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}>
              <item.icon className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}