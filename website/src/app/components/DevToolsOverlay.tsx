import { useState } from 'react';
import { X } from 'lucide-react';
import { IDESelector } from './onboarding/IDESelector';
import { OnboardingSteps } from './onboarding/OnboardingSteps';
import { AppDashboard } from './onboarding/AppDashboard';

type DevToolsScreen = 'ide' | 'onboarding' | 'dashboard';

interface DevToolsOverlayProps {
  onClose: () => void;
}

export function DevToolsOverlay({ onClose }: DevToolsOverlayProps) {
  const [screen, setScreen] = useState<DevToolsScreen>('ide');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
        style={{ background: 'var(--bg-page)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors z-10"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Screen Selector */}
        <div className="p-4 flex items-center gap-2" 
             style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setScreen('ide')}
            className="px-3 py-1.5 rounded-lg transition-colors"
            style={{ 
              background: screen === 'ide' ? 'var(--bg-elevated)' : 'transparent',
              color: screen === 'ide' ? 'var(--text-primary)' : 'var(--text-secondary)',
              font: 'var(--font-label)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            IDE Selector
          </button>
          <button
            onClick={() => setScreen('onboarding')}
            className="px-3 py-1.5 rounded-lg transition-colors"
            style={{ 
              background: screen === 'onboarding' ? 'var(--bg-elevated)' : 'transparent',
              color: screen === 'onboarding' ? 'var(--text-primary)' : 'var(--text-secondary)',
              font: 'var(--font-label)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Onboarding
          </button>
          <button
            onClick={() => setScreen('dashboard')}
            className="px-3 py-1.5 rounded-lg transition-colors"
            style={{ 
              background: screen === 'dashboard' ? 'var(--bg-elevated)' : 'transparent',
              color: screen === 'dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
              font: 'var(--font-label)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Dashboard
          </button>
        </div>

        {/* Content */}
        <div>
          {screen === 'ide' && <IDESelector />}
          {screen === 'onboarding' && <OnboardingSteps />}
          {screen === 'dashboard' && <AppDashboard />}
        </div>
      </div>
    </div>
  );
}
