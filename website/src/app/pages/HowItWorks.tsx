import { Link } from 'react-router';
import { Eye, Shield, Activity, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { Logo } from '../components/Logo';

export default function HowItWorks() {
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
      <div className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="max-w-2xl mb-20">
            <h1 className="mb-4" style={{ 
              font: '600 48px/1.1 var(--font-family-sans)',
              color: 'var(--text-primary)',
              letterSpacing: '-1px'
            }}>
              Three layers of protection
            </h1>
            <p style={{ 
              font: '400 18px/1.6 var(--font-family-sans)',
              color: 'var(--text-secondary)' 
            }}>
              TokenGuard monitors your AI coding sessions and intervenes before spirals waste money
            </p>
          </div>

          {/* Main Features */}
          <div className="grid grid-cols-3 gap-8 mb-24">
            <FeatureCard
              icon={<Eye className="w-6 h-6" />}
              title="Detection"
              description="Monitors file edit frequency, token burn rate, context window pressure, and error patterns in real-time"
              color="var(--status-info)"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Enforcement"
              description="Automated actions: warn with projections, pause for confirmation, force-stop sessions, hard budget caps"
              color="var(--status-warn)"
            />
            <FeatureCard
              icon={<Activity className="w-6 h-6" />}
              title="Dashboard"
              description="Live visibility into burn rate, budget bars, loop detector, and cross-tool tracking in one unified view"
              color="var(--status-ok)"
            />
          </div>

          {/* How Spirals Happen */}
          <div className="mb-24">
            <h2 className="mb-6" style={{ 
              font: '600 32px/1.2 var(--font-family-sans)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px'
            }}>
              How token spirals happen
            </h2>
            
            <div className="space-y-4">
              <SpiralStep
                number="1"
                title="AI suggests a change"
                description="Your coding assistant modifies a file with what seems like a reasonable fix"
              />
              <SpiralStep
                number="2"
                title="Change breaks something else"
                description="The modification introduces a new error or conflict in related files"
              />
              <SpiralStep
                number="3"
                title="AI tries to fix the fix"
                description="The assistant attempts to resolve the new issue, editing multiple files"
              />
              <SpiralStep
                number="4"
                title="Spiral begins"
                description="Each fix creates new problems, looping through the same files repeatedly"
              />
              <SpiralStep
                number="5"
                title="Tokens drain fast"
                description="You're burning 10-20k tokens per minute without realizing it until it's too late"
                danger
              />
            </div>
          </div>

          {/* How TokenGuard Helps */}
          <div className="mb-24">
            <h2 className="mb-6" style={{ 
              font: '600 32px/1.2 var(--font-family-sans)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px'
            }}>
              How TokenGuard stops it
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <HelpCard
                icon={<AlertTriangle className="w-5 h-5" />}
                title="Early Warning"
                description="Detects when the same file is edited 3+ times in 2 minutes and alerts you before costs spiral"
              />
              <HelpCard
                icon={<Clock className="w-5 h-5" />}
                title="Real-time Monitoring"
                description="Tracks burn rate per minute and shows projected session cost based on current usage"
              />
              <HelpCard
                icon={<Shield className="w-5 h-5" />}
                title="Auto-Pause"
                description="Automatically stops the session when thresholds are hit, requiring manual confirmation to continue"
              />
              <HelpCard
                icon={<TrendingUp className="w-5 h-5" />}
                title="Budget Caps"
                description="Set hard limits per session, per day, or per month that cannot be exceeded"
              />
            </div>
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
              Ready to protect your budget?
            </h3>
            <p className="mb-6" style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
              Start monitoring your AI coding tools in minutes
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

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="p-6 rounded-xl" 
         style={{ 
           background: 'var(--bg-card)', 
           border: '1px solid var(--border-subtle)',
           backdropFilter: 'var(--blur-card)',
           WebkitBackdropFilter: 'var(--blur-card)'
         }}>
      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" 
           style={{ background: 'var(--bg-elevated)', color }}>
        {icon}
      </div>
      <h3 className="mb-2" style={{ 
        font: 'var(--font-heading)',
        fontSize: '16px',
        color: 'var(--text-primary)'
      }}>
        {title}
      </h3>
      <p style={{ font: 'var(--font-body)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        {description}
      </p>
    </div>
  );
}

function SpiralStep({ number, title, description, danger }: {
  number: string;
  title: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-lg" 
         style={{ 
           background: 'var(--bg-card)',
           border: danger ? '1px solid var(--status-danger)' : '1px solid var(--border-subtle)',
           backdropFilter: 'var(--blur-card)',
           WebkitBackdropFilter: 'var(--blur-card)'
         }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" 
           style={{ 
             background: danger ? 'var(--status-danger)' : 'var(--bg-elevated)',
             color: danger ? 'white' : 'var(--text-primary)',
             font: '500 14px/1 var(--font-family-mono)'
           }}>
        {number}
      </div>
      <div className="flex-1">
        <div className="mb-1" style={{ 
          font: 'var(--font-label)', 
          color: danger ? 'var(--status-danger)' : 'var(--text-primary)' 
        }}>
          {title}
        </div>
        <div style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
          {description}
        </div>
      </div>
    </div>
  );
}

function HelpCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-5 rounded-lg flex items-start gap-3" 
         style={{ 
           background: 'var(--bg-card)', 
           border: '1px solid var(--border-subtle)',
           backdropFilter: 'var(--blur-card)',
           WebkitBackdropFilter: 'var(--blur-card)'
         }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" 
           style={{ background: 'var(--bg-elevated)', color: 'var(--status-ok)' }}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="mb-1" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
          {title}
        </div>
        <div style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
          {description}
        </div>
      </div>
    </div>
  );
}
