import { useState } from 'react';
import { Check } from 'lucide-react';

const IDEs = [
  { id: 'cursor', name: 'Cursor', description: 'AI-first code editor' },
  { id: 'windsurf', name: 'Windsurf', description: 'Codeium\'s AI IDE' },
  { id: 'vscode', name: 'VS Code', description: 'With Copilot/Continue' },
  { id: 'claude', name: 'Claude Desktop', description: 'Anthropic\'s chat app' },
  { id: 'jetbrains', name: 'JetBrains', description: 'IntelliJ, WebStorm, etc.' },
  { id: 'other', name: 'Other', description: 'Custom integration' },
];

export function IDESelector({ onContinue }: { onContinue?: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleIDE = (id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="p-6 sm:p-8">
      <h2 className="mb-2" style={{ 
        font: '600 clamp(28px, 4vw, 34px)/1.1 var(--font-family-sans)',
        color: 'var(--text-primary)',
        letterSpacing: '-0.5px'
      }}>
        Which AI tools do you use?
      </h2>
      <p className="mb-8 max-w-2xl" style={{ font: '400 15px/1.6 var(--font-family-sans)', color: 'var(--text-secondary)' }}>
        Select all that apply. We'll help you set up monitoring for each one.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {IDEs.map((ide) => (
          <button
            key={ide.id}
            type="button"
            onClick={() => toggleIDE(ide.id)}
            className="relative rounded-[22px] p-5 text-left transition-colors"
            style={{ 
              background: selected.includes(ide.id) ? 'var(--bg-elevated)' : 'var(--bg-card)',
              border: selected.includes(ide.id) 
                ? '1px solid var(--accent)' 
                : '1px solid var(--border-default)',
              cursor: 'pointer',
              boxShadow: selected.includes(ide.id) ? '0 20px 40px rgba(79,70,229,0.10)' : 'none',
            }}
          >
            {selected.includes(ide.id) && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                   style={{ background: 'var(--accent)' }}>
                <Check className="w-3 h-3" style={{ color: 'white' }} />
              </div>
            )}
            <div className="mb-1" style={{ font: 'var(--font-label)', fontSize: '16px', color: 'var(--text-primary)' }}>
              {ide.name}
            </div>
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              {ide.description}
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p style={{ font: '400 14px/1.6 var(--font-family-sans)', color: 'var(--text-secondary)' }}>
          {selected.length > 0
            ? `${selected.length} tool${selected.length !== 1 ? 's' : ''} selected and ready for setup.`
            : 'Pick at least one tool to continue into the setup flow.'}
        </p>
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => {
            if (selected.length > 0) {
              onContinue?.();
            }
          }}
          className="h-12 rounded-full px-6 transition-opacity"
          style={{ 
            background: selected.length > 0 ? '#020617' : 'var(--bg-elevated)',
            color: selected.length > 0 ? 'white' : 'var(--text-muted)',
            font: '600 14px/1 var(--font-family-sans)',
            border: 'none',
            cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
            opacity: selected.length > 0 ? 1 : 0.5
          }}
        >
          Continue with {selected.length} tool{selected.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
