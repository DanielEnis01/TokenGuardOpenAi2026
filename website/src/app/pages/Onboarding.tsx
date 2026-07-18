import { useState } from 'react';
import { Terminal, Box, Zap, Code2, Rocket, Heart, Cloud, Key, Check } from 'lucide-react';
import { Link } from 'react-router';
import { Logo } from '../components/Logo';

const tools = [
  { name: 'Cursor', icon: Terminal },
  { name: 'Windsurf', icon: Box },
  { name: 'Claude Code', icon: Zap },
  { name: 'GitHub Copilot', icon: Code2 },
  { name: 'Bolt', icon: Rocket },
  { name: 'Lovable', icon: Heart },
  { name: 'Claude API', icon: Cloud },
  { name: 'OpenAI API', icon: Key },
];

export default function Onboarding() {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const toggleTool = (name: string) => {
    setSelectedTools(prev => 
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-2xl w-full px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Logo size={32} />
          </div>
          
          <h2 className="mb-3" style={{ 
            font: '600 28px/1.2 var(--font-family-sans)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.4px'
          }}>
            Connect your tools
          </h2>
          <p style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
            Select the AI coding tools you use. You can add more later.
          </p>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const selected = selectedTools.includes(tool.name);
            
            return (
              <div key={tool.name}
                   onClick={() => toggleTool(tool.name)}
                   className="p-5 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:opacity-80"
                   style={{ 
                     background: 'var(--bg-card)',
                     border: selected ? '2px solid var(--accent)' : '1px solid var(--border-subtle)'
                   }}>
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                    {tool.name}
                  </span>
                </div>
                {selected && (
                  <div className="w-5 h-5 rounded flex items-center justify-center" 
                       style={{ background: 'var(--accent)' }}>
                    <Check className="w-3 h-3" style={{ color: 'white' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4">
          <Link to="/monitor"
                className="w-full max-w-xs h-11 rounded-lg flex items-center justify-center transition-opacity hover:opacity-90"
                style={{ 
                  background: selectedTools.length > 0 ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: selectedTools.length > 0 ? 'white' : 'var(--text-disabled)',
                  font: 'var(--font-label)',
                  border: 'none',
                  cursor: selectedTools.length > 0 ? 'pointer' : 'not-allowed',
                  pointerEvents: selectedTools.length > 0 ? 'auto' : 'none'
                }}>
            Continue to Dashboard
          </Link>
          
          <Link to="/monitor"
                style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
            Skip for now
          </Link>
        </div>

        {/* Progress */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--border-subtle)' }}></div>
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--border-subtle)' }}></div>
          </div>
          <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
            Step 1 of 3 · Set up guardrails in settings later
          </p>
        </div>
      </div>
    </div>
  );
}