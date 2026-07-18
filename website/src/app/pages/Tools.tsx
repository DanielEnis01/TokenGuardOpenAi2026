import { AppShell } from '../components/AppShell';
import { Terminal, Box, Zap, Code2, Rocket, Heart, Cloud, Key } from 'lucide-react';

const tools = [
  { 
    name: 'Cursor', 
    icon: Terminal, 
    status: 'connected', 
    usage: '1.2M tokens this month',
    color: '#4A8FD4'
  },
  { 
    name: 'Windsurf', 
    icon: Box, 
    status: 'connected', 
    usage: '840k tokens this month',
    color: '#3DAD78'
  },
  { 
    name: 'Claude Code', 
    icon: Zap, 
    status: 'not-connected',
    color: '#8E8EA8'
  },
  { 
    name: 'GitHub Copilot', 
    icon: Code2, 
    status: 'not-connected',
    color: '#8E8EA8'
  },
  { 
    name: 'Bolt', 
    icon: Rocket, 
    status: 'not-connected',
    color: '#8E8EA8'
  },
  { 
    name: 'Lovable', 
    icon: Heart, 
    status: 'not-connected',
    color: '#8E8EA8'
  },
  { 
    name: 'Claude API', 
    icon: Cloud, 
    status: 'connected', 
    usage: '124k tokens this month',
    color: '#D4874A'
  },
  { 
    name: 'OpenAI API', 
    icon: Key, 
    status: 'not-connected',
    color: '#8E8EA8'
  },
];

export default function Tools() {
  return (
    <AppShell>
      <div className="p-7" style={{ background: 'var(--bg-card)' }}>
        {/* Header */}
        <div className="mb-8">
          <h2 className="mb-2" style={{ font: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Tools
          </h2>
          <p style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
            Connect your IDEs and API keys
          </p>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {tools.map((tool) => (
            <ToolCard key={tool.name} tool={tool} />
          ))}
        </div>

        {/* Note */}
        <div className="p-4 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            TokenGuard connects via IDE hooks and API proxies. No prompt content is ever read — only metadata.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function ToolCard({ tool }: { 
  tool: { 
    name: string; 
    icon: any; 
    status: string; 
    usage?: string;
    color: string;
  } 
}) {
  const Icon = tool.icon;
  
  return (
    <div className="p-5 rounded-xl flex items-center justify-between" 
         style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 flex items-center justify-center" style={{ color: tool.color }}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)', marginBottom: '2px' }}>
            {tool.name}
          </div>
          {tool.status === 'connected' && tool.usage && (
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              Connected · {tool.usage}
            </div>
          )}
          {tool.status === 'not-connected' && (
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              Not connected
            </div>
          )}
        </div>
      </div>
      
      <div>
        {tool.status === 'connected' ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--status-ok)' }}></div>
            <span style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              Connected
            </span>
          </div>
        ) : (
          <button className="px-3 py-1.5 rounded-md transition-colors hover:opacity-80"
                  style={{ 
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    background: 'transparent',
                    font: 'var(--font-label)',
                    cursor: 'pointer'
                  }}>
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
