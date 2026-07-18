import { AppShell } from '../components/AppShell';
import { LogOut, CreditCard, User, Bell, Shield, Database } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

export default function Settings() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear any auth state here if needed
    navigate('/');
  };

  return (
    <AppShell>
      <div className="p-7" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="mb-2" style={{ font: 'var(--font-heading)', fontSize: '20px', color: 'var(--text-primary)' }}>
              Settings
            </h2>
            <p style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
              Manage your account and preferences
            </p>
          </div>

          {/* Account Section */}
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
              description="Free plan · Upgrade to unlock more features"
              action={
                <Link to="/pricing"
                      className="px-3 py-1.5 rounded-md transition-opacity hover:opacity-90"
                      style={{ 
                        background: 'var(--accent)',
                        color: 'white',
                        font: 'var(--font-label)'
                      }}>
                  View Pricing
                </Link>
              }
            />
          </Section>

          {/* Notifications Section */}
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

          {/* Privacy & Security Section */}
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

          {/* Danger Zone */}
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
    <div className="mb-8">
      <div className="pb-4 mb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
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