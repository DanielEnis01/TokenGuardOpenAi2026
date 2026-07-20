import { AppShell } from '../components/AppShell';
import { formatCompactNumber, formatDuration, formatToolLabel, formatUsd, historySessions } from '../dashboardData';

export default function History() {
  const totalSpent = historySessions.reduce((sum, session) => sum + session.totalCostUsd, 0);
  const totalSaved = historySessions.reduce((sum, session) => sum + session.costSavedUsd, 0);
  const totalSpirals = historySessions.reduce((sum, session) => sum + session.spiralsCaught, 0);
  const hasHistory = historySessions.length > 0;

  return (
    <AppShell>
      <div className="dashboard-page space-y-5">
        <header className="dashboard-page-header flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="dashboard-page-kicker">Session history</p>
            <h1 className="dashboard-page-title">Recorded sessions</h1>
          </div>
          <button
            type="button"
            className="rounded-xl px-4 py-2"
            disabled={!hasHistory}
            style={{
              background: 'var(--bg-elevated)',
              color: hasHistory ? 'var(--text-primary)' : 'var(--text-muted)',
              border: '1px solid var(--border-default)',
              font: 'var(--font-label)',
              backdropFilter: 'var(--blur-elevated)',
              WebkitBackdropFilter: 'var(--blur-elevated)',
              opacity: hasHistory ? 1 : 0.6,
              cursor: hasHistory ? 'pointer' : 'not-allowed',
            }}
          >
            Export CSV
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total sessions" value={String(historySessions.length)} />
          <StatCard label="Total spent" value={formatUsd(totalSpent)} />
          <StatCard label="Total saved" value={formatUsd(totalSaved)} tone="ok" />
          <StatCard label="Spirals caught" value={String(totalSpirals)} tone="warn" />
        </section>

        <section
          className="liquid-glass-card bento-card rounded-[20px] p-4 sm:p-5"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            backdropFilter: 'var(--blur-card)',
            WebkitBackdropFilter: 'var(--blur-card)',
          }}
        >
          {hasHistory ? (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                <FilterPill label="Last 30 days" active />
                <FilterPill label="All IDEs" />
                <FilterPill label="Only sessions with spirals" />
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[880px] overflow-hidden rounded-[16px]" style={{ border: '1px solid var(--border-subtle)' }}>
                  <div
                    className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_0.8fr_0.7fr_0.9fr_0.9fr_0.8fr] gap-3 px-4 py-3"
                    style={{ background: 'var(--bg-elevated)', font: 'var(--font-caption)', color: 'var(--text-muted)' }}
                  >
                    <span>Date</span>
                    <span>Tool</span>
                    <span>Duration</span>
                    <span>Tokens In</span>
                    <span>Tokens Out</span>
                    <span>Cost</span>
                    <span>Spirals Detected</span>
                    <span>Spirals Stopped</span>
                    <span>Savings</span>
                  </div>

                  {historySessions.map((session, index) => (
                    <div
                      key={session.sessionId}
                      className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_0.8fr_0.7fr_0.9fr_0.9fr_0.8fr] gap-3 px-4 py-4"
                      style={{
                        borderTop: index === 0 ? 'none' : '1px solid var(--border-subtle)',
                        background: 'var(--bg-card)',
                      }}
                    >
                      <span style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
                        {new Date(session.startedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                        {formatToolLabel(session.tool)}
                      </span>
                      <span style={{ font: 'var(--font-data)', color: 'var(--text-secondary)' }}>
                        {session.endedAt ? formatDuration(session.startedAt, session.endedAt) : 'In progress'}
                      </span>
                      <span style={{ font: 'var(--font-data)', color: 'var(--text-secondary)' }}>
                        {formatCompactNumber(session.tokensIn)}
                      </span>
                      <span style={{ font: 'var(--font-data)', color: 'var(--text-secondary)' }}>
                        {formatCompactNumber(session.tokensOut)}
                      </span>
                      <span style={{ font: 'var(--font-data)', color: 'var(--text-primary)' }}>
                        {formatUsd(session.totalCostUsd)}
                      </span>
                      <span style={{ font: 'var(--font-data)', color: 'var(--status-warn)' }}>
                        {session.spiralsCaught}
                      </span>
                      <span style={{ font: 'var(--font-data)', color: 'var(--status-ok)' }}>
                        {session.spiralsStopped}
                      </span>
                      <span style={{ font: 'var(--font-data)', color: 'var(--status-ok)' }}>
                        {formatUsd(session.costSavedUsd)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div
              className="liquid-glass-inset rounded-[16px] px-5 py-12 text-center"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <p style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                No sessions recorded yet
              </p>
              <p className="mt-2" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                Once TokenGuard captures live sessions, this page will show spend, duration, and spiral outcomes.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'ok' | 'warn';
}) {
  const color =
    tone === 'ok' ? 'var(--status-ok)' : tone === 'warn' ? 'var(--status-warn)' : 'var(--text-primary)';

  return (
    <article
      className="liquid-glass-card bento-card rounded-[18px] p-4"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--blur-card)',
        WebkitBackdropFilter: 'var(--blur-card)',
      }}
    >
      <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>{label}</p>
      <p className="mt-2" style={{ font: '600 26px/1.1 var(--font-family-sans)', color }}>
        {value}
      </p>
    </article>
  );
}

function FilterPill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className="rounded-xl px-3 py-1.5"
      style={{
        background: active ? 'var(--bg-card)' : 'transparent',
        border: '1px solid var(--border-subtle)',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        font: 'var(--font-caption)',
      }}
    >
      {label}
    </span>
  );
}
