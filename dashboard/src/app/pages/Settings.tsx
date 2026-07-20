import { AppShell } from '../components/AppShell';
import { LogOut, CreditCard, User, Bell, Shield, Database } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getWebsitePricingUrl } from '../lib/externalLinks';

export default function Settings() {
  const navigate = useNavigate();
  const pricingUrl = getWebsitePricingUrl();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <AppShell>
      <div className="dashboard-page p-7" style={{ background: 'transparent' }}>
        <div className="max-w-3xl">
          <div className="dashboard-page-header">
            <p className="dashboard-page-kicker">Workspace</p>
            <h2 className="dashboard-page-title">Settings</h2>
          </div>

          <Section title="Account">
            <SettingRow
              icon={<User className="w-5 h-5" />}
              label="Profile"
              description="demo@tokenguard.dev"
              action={
                <button className="px-3 py-1.5 rounded-md transition-colors"
                        style={{ 
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)',
                          font: 'var(--font-label)'
                        }}>
                  Edit
                </button>
              }
            />
            <SettingRow
              icon={<CreditCard className="w-5 h-5" />}
              label="Billing & Plans"
              description="Free plan - upgrade opens the public pricing page"
              action={
                <a
                  href={pricingUrl}
                  className="px-3 py-1.5 rounded-xl transition-opacity hover:opacity-90"
                  style={{ 
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                    font: 'var(--font-label)',
                    backdropFilter: 'var(--blur-elevated)',
                    WebkitBackdropFilter: 'var(--blur-elevated)'
                  }}>
                  View Pricing
                </a>
              }
            />
          </Section>

          <Section title="Notifications">
            <SettingRow
              icon={<Bell className="w-5 h-5" />}
              label="Email Alerts"
              description="Get notified when spirals are detected"
              action={<Toggle checked={true} />}
            />
            <SettingRow
              icon={<Bell className="w-5 h-5" />}
              label="Budget Warnings"
              description="Alert when approaching budget limits"
              action={<Toggle checked={true} />}
            />
            <SettingRow
              icon={<Bell className="w-5 h-5" />}
              label="Weekly Reports"
              description="Summary of token usage and savings"
              action={<Toggle checked={false} />}
            />
          </Section>

          <Section title="Privacy & Security">
            <SettingRow
              icon={<Shield className="w-5 h-5" />}
              label="Data Collection"
              description="Only metadata is collected, never prompt content"
              action={
                <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                  Learn more
                </span>
              }
            />
            <SettingRow
              icon={<Database className="w-5 h-5" />}
              label="Export Data"
              description="Download all your session history and settings"
              action={
                <button className="px-3 py-1.5 rounded-md transition-colors"
                        style={{ 
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)',
                          font: 'var(--font-label)'
                        }}>
                  Export
                </button>
              }
            />
          </Section>

          <Section title="Danger Zone">
            <SettingRow
              icon={<LogOut className="w-5 h-5" />}
              label="Sign Out"
              description="Log out of your TokenGuard account"
              action={
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-md transition-colors hover:opacity-80"
                  style={{ 
                    background: 'transparent',
                    border: '1px solid var(--status-danger)',
                    color: 'var(--status-danger)',
                    font: 'var(--font-label)',
                    cursor: 'pointer'
                  }}>
                  Sign Out
                </button>
              }
            />
          </Section>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="liquid-glass-card bento-card mb-8 rounded-2xl px-5 py-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--blur-card)',
        WebkitBackdropFilter: 'var(--blur-card)',
      }}
    >
      <div className="mb-4 border-b pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 style={{ font: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          {title}
        </h3>
      </div>
      <div className="space-y-0">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ icon, label, description, action }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4"
         style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="mb-1" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
            {label}
          </div>
          <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
            {description}
          </div>
        </div>
      </div>
      <div className="ml-4">
        {action}
      </div>
    </div>
  );
}

function Toggle({ checked }: { checked: boolean }) {
  return (
    <div className="relative w-9 h-5 rounded-full transition-colors cursor-pointer"
         style={{ 
           background: checked ? 'var(--status-ok)' : 'var(--bg-elevated)',
           border: checked ? 'none' : '1px solid var(--border-default)'
         }}>
      <div className="absolute top-0.5 transition-transform w-4 h-4 bg-white rounded-full"
           style={{ 
             left: checked ? 'calc(100% - 18px)' : '2px'
           }}></div>
    </div>
  );
}
