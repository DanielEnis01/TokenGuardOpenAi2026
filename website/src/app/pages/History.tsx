import { AppShell } from '../components/AppShell';

const sessions = [
  { date: 'Mar 12, 2026', time: '14:32', ide: 'Cursor', model: 'Claude Sonnet 4', duration: '32m', tokens: '284k', cost: '$2.41', spirals: 3, saved: '$6.86' },
  { date: 'Mar 12, 2026', time: '09:15', ide: 'Windsurf', model: 'Claude Sonnet 4', duration: '1h 18m', tokens: '542k', cost: '$4.61', spirals: 1, saved: '$1.20' },
  { date: 'Mar 11, 2026', time: '16:44', ide: 'Cursor', model: 'Claude Sonnet 4', duration: '45m', tokens: '312k', cost: '$2.65', spirals: 0, saved: '$0.00' },
  { date: 'Mar 11, 2026', time: '11:20', ide: 'Bolt', model: 'GPT-4', duration: '22m', tokens: '186k', cost: '$3.72', spirals: 2, saved: '$4.18' },
  { date: 'Mar 10, 2026', time: '15:08', ide: 'Cursor', model: 'Claude Sonnet 4', duration: '1h 5m', tokens: '478k', cost: '$4.06', spirals: 1, saved: '$2.34' },
  { date: 'Mar 10, 2026', time: '10:30', ide: 'Windsurf', model: 'Claude Sonnet 4', duration: '38m', tokens: '298k', cost: '$2.53', spirals: 0, saved: '$0.00' },
];

export default function History() {
  return (
    <AppShell>
      <div className="p-7" style={{ background: 'var(--bg-card)' }}>
        {/* Header */}
        <h2 className="mb-6" style={{ font: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          Session History
        </h2>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <SummaryCard label="Total spend this month" value="$25.20" />
          <SummaryCard label="Total tokens this month" value="2.1M" />
          <SummaryCard label="Total saved from spirals" value="$14.58" highlight />
        </div>

        {/* Table */}
        <div>
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 pb-3 mb-2" 
               style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div className="col-span-2" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              Date
            </div>
            <div className="col-span-2" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              IDE / Model
            </div>
            <div className="col-span-1" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              Duration
            </div>
            <div className="col-span-2" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              Tokens
            </div>
            <div className="col-span-1" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              Cost
            </div>
            <div className="col-span-2" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              Spirals Blocked
            </div>
            <div className="col-span-2" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              Saved
            </div>
          </div>

          {/* Rows */}
          <div>
            {sessions.map((session, idx) => (
              <div key={idx} 
                   className="grid grid-cols-12 gap-4 h-12 items-center transition-colors hover:bg-opacity-50"
                   style={{ 
                     borderBottom: '1px solid var(--border-subtle)',
                     cursor: 'pointer'
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                   onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div className="col-span-2">
                  <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                    {session.date}
                  </div>
                  <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', fontSize: '10px' }}>
                    {session.time}
                  </div>
                </div>
                <div className="col-span-2">
                  <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                    {session.ide}
                  </div>
                  <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                    {session.model}
                  </div>
                </div>
                <div className="col-span-1" style={{ font: 'var(--font-data)', color: 'var(--text-secondary)' }}>
                  {session.duration}
                </div>
                <div className="col-span-2" style={{ font: 'var(--font-data)', color: 'var(--text-secondary)' }}>
                  {session.tokens}
                </div>
                <div className="col-span-1" style={{ font: 'var(--font-data)', color: 'var(--text-primary)' }}>
                  {session.cost}
                </div>
                <div className="col-span-2">
                  {session.spirals > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded" 
                          style={{ 
                            background: 'rgba(224, 85, 85, 0.12)',
                            color: 'var(--status-danger)',
                            font: 'var(--font-caption)'
                          }}>
                      {session.spirals}
                    </span>
                  ) : (
                    <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                      —
                    </span>
                  )}
                </div>
                <div className="col-span-2" style={{ 
                  font: 'var(--font-data)', 
                  color: session.spirals > 0 ? 'var(--status-ok)' : 'var(--text-muted)' 
                }}>
                  {session.saved}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value, highlight }: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl" 
         style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ 
        font: 'var(--font-data-lg)',
        color: highlight ? 'var(--status-ok)' : 'var(--text-primary)'
      }}>
        {value}
      </div>
    </div>
  );
}
