import { useState } from 'react';
import { ChevronLeft, ChevronRight, DollarSign, Clock, Shield } from 'lucide-react';

const STEPS = [
  {
    id: 'budget',
    title: 'Set your budget',
    description: 'How much do you want to spend per session?',
    icon: <DollarSign className="w-6 h-6" />,
    component: BudgetStep
  },
  {
    id: 'thresholds',
    title: 'Configure thresholds',
    description: 'When should we alert you about unusual activity?',
    icon: <Shield className="w-6 h-6" />,
    component: ThresholdsStep
  },
  {
    id: 'spirals',
    title: 'Spiral detection',
    description: 'Set limits for repetitive edits',
    icon: <Clock className="w-6 h-6" />,
    component: SpiralStep
  }
];

export function OnboardingSteps({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const Step = STEPS[currentStep].component;

  return (
    <div className="p-6 sm:p-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <div 
                className="h-1 rounded-full flex-1 transition-colors"
                style={{ 
                  background: idx <= currentStep ? 'var(--accent)' : 'var(--bg-elevated)' 
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
               style={{ background: 'var(--bg-elevated)', color: 'var(--accent)' }}>
            {STEPS[currentStep].icon}
          </div>
          <div>
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              Step {currentStep + 1} of {STEPS.length}
            </div>
            <h2 style={{ 
              font: '600 clamp(26px, 4vw, 32px)/1.1 var(--font-family-sans)',
              color: 'var(--text-primary)'
            }}>
              {STEPS[currentStep].title}
            </h2>
          </div>
        </div>
        <p className="max-w-2xl" style={{ font: '400 15px/1.6 var(--font-family-sans)', color: 'var(--text-secondary)' }}>
          {STEPS[currentStep].description}
        </p>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        <Step />
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="flex h-11 items-center justify-center gap-2 rounded-full px-5 transition-opacity"
          style={{ 
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            font: '600 14px/1 var(--font-family-sans)',
            border: '1px solid var(--border-default)',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            opacity: currentStep === 0 ? 0.5 : 1
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={() => {
            if (currentStep === STEPS.length - 1) {
              onComplete?.();
              return;
            }

            setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1));
          }}
          className="flex h-11 items-center justify-center gap-2 rounded-full px-5 transition-opacity hover:opacity-90"
          style={{ 
            background: '#020617',
            color: 'white',
            font: '600 14px/1 var(--font-family-sans)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {currentStep === STEPS.length - 1 ? 'Complete Setup' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function BudgetStep() {
  const [budget, setBudget] = useState(15);

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6" 
           style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <label className="block mb-4" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
          Session Budget Limit
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: 'var(--accent)' }}
          />
          <div className="px-4 py-2 rounded-lg min-w-[80px] text-center"
               style={{ background: 'var(--bg-elevated)', font: 'var(--font-label)', color: 'var(--text-primary)' }}>
            ${budget}
          </div>
        </div>
        <p className="mt-3" style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
          We'll alert you when you're approaching this limit and block requests that exceed it.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[5, 15, 50].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setBudget(preset)}
            className="px-4 py-3 rounded-lg transition-colors"
            style={{ 
              background: budget === preset ? 'var(--bg-elevated)' : 'var(--bg-card)',
              border: budget === preset ? '1px solid var(--accent)' : '1px solid var(--border-default)',
              font: 'var(--font-label)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            ${preset}
          </button>
        ))}
      </div>
    </div>
  );
}

function ThresholdsStep() {
  const [burnRate, setBurnRate] = useState(5000);
  const [contextUsage, setContextUsage] = useState(70);

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6" 
           style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <label className="block mb-4" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
          Burn Rate Alert (tokens/min)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1000"
            max="20000"
            step="500"
            value={burnRate}
            onChange={(e) => setBurnRate(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: 'var(--accent)' }}
          />
          <div className="px-4 py-2 rounded-lg min-w-[100px] text-center"
               style={{ background: 'var(--bg-elevated)', font: 'var(--font-data)', color: 'var(--text-primary)' }}>
            {(burnRate / 1000).toFixed(1)}k
          </div>
        </div>
      </div>

      <div className="rounded-xl p-6" 
           style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <label className="block mb-4" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
          Context Window Alert (%)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={contextUsage}
            onChange={(e) => setContextUsage(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: 'var(--accent)' }}
          />
          <div className="px-4 py-2 rounded-lg min-w-[80px] text-center"
               style={{ background: 'var(--bg-elevated)', font: 'var(--font-data)', color: 'var(--text-primary)' }}>
            {contextUsage}%
          </div>
        </div>
      </div>
    </div>
  );
}

function SpiralStep() {
  const [editLimit, setEditLimit] = useState(5);
  const [timeWindow, setTimeWindow] = useState(2);

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6" 
           style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <label className="block mb-4" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
          Max Edits Per File
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="3"
            max="15"
            step="1"
            value={editLimit}
            onChange={(e) => setEditLimit(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: 'var(--accent)' }}
          />
          <div className="px-4 py-2 rounded-lg min-w-[80px] text-center"
               style={{ background: 'var(--bg-elevated)', font: 'var(--font-data)', color: 'var(--text-primary)' }}>
            {editLimit}x
          </div>
        </div>
        <p className="mt-3" style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
          Alert when a file is edited this many times in a short period
        </p>
      </div>

      <div className="rounded-xl p-6" 
           style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
        <label className="block mb-4" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
          Time Window (minutes)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: 'var(--accent)' }}
          />
          <div className="px-4 py-2 rounded-lg min-w-[80px] text-center"
               style={{ background: 'var(--bg-elevated)', font: 'var(--font-data)', color: 'var(--text-primary)' }}>
            {timeWindow}m
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 flex items-start gap-3"
           style={{ background: 'var(--bg-elevated)', borderLeft: '4px solid var(--accent)' }}>
        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
        <div>
          <div className="mb-1" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
            Current setting: {editLimit} edits in {timeWindow} minutes
          </div>
          <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
            We'll pause the session and ask for confirmation before continuing
          </div>
        </div>
      </div>
    </div>
  );
}
