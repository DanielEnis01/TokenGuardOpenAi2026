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

export function IDESelector() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleIDE = (id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="p-8">
      <h2 className="mb-2" style={{ 
        font: '600 32px/1.2 var(--font-family-sans)',
        color: 'var(--text-primary)',
        letterSpacing: '-0.5px'
      }}>
        Which AI tools do you use?
      </h2>
      <p className="mb-8" style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
        Select all that apply. We'll help you set up monitoring for each one.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {IDEs.map((ide) => (
          <button
            key={ide.id}
            onClick={() => toggleIDE(ide.id)}
            className="rounded-xl p-5 text-left transition-colors relative"
            style={{ 
              background: selected.includes(ide.id) ? 'var(--bg-elevated)' : 'var(--bg-card)',
              border: selected.includes(ide.id) 
                ? '1px solid var(--accent)' 
                : '1px solid var(--border-default)',
              cursor: 'pointer'
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

      <button
        disabled={selected.length === 0}
        className="w-full h-11 rounded-lg transition-opacity"
        style={{ 
          background: selected.length > 0 ? 'var(--accent)' : 'var(--bg-elevated)',
          color: selected.length > 0 ? 'white' : 'var(--text-muted)',
          font: 'var(--font-label)',
          border: 'none',
          cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
          opacity: selected.length > 0 ? 1 : 0.5
        }}
      >
        Continue with {selected.length} tool{selected.length !== 1 ? 's' : ''}
      </button>
    </div>
  );
}
