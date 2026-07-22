import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from 'recharts';
import { Pencil, Square, Play, AlertTriangle, Check, RotateCcw, Shield, Bot, TimerReset, LoaderCircle } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import {
  burnSeries,
  formatCompactNumber,
  formatDuration,
  formatToolLabel,
  formatUsd,
  loopDetectorRows,
  timelineEvents,
} from '../dashboardData';
import { useDaemonState } from '../providers/DaemonProvider';

const chartRanges = ['5m', '20m', '1h', 'session'] as const;

export default function Monitor() {
  const [selectedRange, setSelectedRange] = useState<(typeof chartRanges)[number]>('20m');
  const {
    session: currentSession,
    config: guardrailConfig,
    connectionStatus,
    isUsingMockData,
    resolveSpiral,
    stopSession,
    isRequestingStop,
  } = useDaemonState();
  const [isSpiralDialogOpen, setIsSpiralDialogOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const lastPromptedSpiralRef = useRef<string | null>(null);

  const contextPercent = currentSession.contextPercent;
  const sessionPercent = Math.min(100, (currentSession.totalTokens / guardrailConfig.sessionTokenCap) * 100);
  const monthlyPercent = Math.min(100, (currentSession.monthlyCostUsd / guardrailConfig.monthlyBudgetUsd) * 100);
  const spiralsStopped = Math.max(0, currentSession.spiralsCaughtToday - currentSession.activeSpirals.length);
  const primaryActiveSpiral = currentSession.activeSpirals[0] ?? null;
  const hasActiveSession = Boolean(currentSession.sessionId);
  const editsContinuedAfterStopRequest = Boolean(
    currentSession.lastStopRequestedAt &&
      currentSession.lastActivityAt &&
      currentSession.lastActivityAt > currentSession.lastStopRequestedAt,
  );
  const awaitingStopConfirmation = Boolean(
    currentSession.lastStopRequestedAt &&
      !currentSession.lastStoppedAt,
  );
  const displayedLoopRows = [
    ...currentSession.activeSpirals.map((spiral) => ({
      status: 'active' as const,
      file: spiral.filePath,
      edits: spiral.editCount,
      timeInLoop: formatDuration(spiral.startedAt, now),
      estimatedWaste:
        typeof spiral.estimatedWasteUsd === 'number' ? formatUsd(spiral.estimatedWasteUsd) : '-',
      action: isRequestingStop
        ? 'Requesting'
        : awaitingStopConfirmation
          ? editsContinuedAfterStopRequest
            ? 'Waiting — retry available'
            : 'Waiting for confirmation'
          : 'Stop',
    })),
    ...loopDetectorRows.filter((row) => row.status === 'resolved'),
  ];
  const hasBurnSeries = burnSeries.length > 0;
  const hasTimelineEvents = timelineEvents.length > 0;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (
      primaryActiveSpiral &&
      !isUsingMockData &&
      !guardrailConfig.autoStopSpirals &&
      currentSession.agentStatus !== 'stopped'
    ) {
      const spiralKey = `${primaryActiveSpiral.filePath}:${primaryActiveSpiral.updatedAt}`;

      if (lastPromptedSpiralRef.current !== spiralKey) {
        lastPromptedSpiralRef.current = spiralKey;
        setIsSpiralDialogOpen(true);
      }

      return;
    }

    if (!primaryActiveSpiral || currentSession.agentStatus === 'stopped') {
      setIsSpiralDialogOpen(false);

      if (!primaryActiveSpiral) {
        lastPromptedSpiralRef.current = null;
      }
    }
  }, [
    currentSession.agentStatus,
    guardrailConfig.autoStopSpirals,
    isUsingMockData,
    primaryActiveSpiral,
  ]);

  return (
    <AppShell>
      <div className="monitor-page dashboard-page space-y-5">
        {primaryActiveSpiral ? (
          <SpiralDecisionDialog
            open={isSpiralDialogOpen}
            spiral={primaryActiveSpiral}
            onIgnore={() => {
              setIsSpiralDialogOpen(false);
              void resolveSpiral(primaryActiveSpiral.filePath, 'continue');
            }}
            onStop={() => {
              setIsSpiralDialogOpen(false);
              void stopSession();
            }}
          />
        ) : null}

        <header className="dashboard-page-header flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="dashboard-page-kicker">Live monitor</p>
            <h1 className="dashboard-page-title">Session telemetry</h1>
          </div>
          <div
            className="liquid-status inline-flex w-fit items-center gap-2 rounded-full px-3 py-2"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'var(--blur-card)',
              WebkitBackdropFilter: 'var(--blur-card)',
            }}
          >
            <span
              className={`h-2 w-2 rounded-full ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`}
              style={{
                background: isUsingMockData
                  ? 'var(--text-muted)'
                  : connectionStatus === 'connected'
                    ? 'var(--status-ok)'
                    : 'var(--status-warn)',
              }}
            />
            <span style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              {isUsingMockData
                ? 'daemon offline - dashboard is waiting for live data'
                : connectionStatus === 'connected'
                  ? hasActiveSession
                    ? 'session events are streaming from the daemon'
                    : 'daemon connected - waiting for the first session'
                  : 'reconnecting to the local daemon'}
            </span>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,0.65fr)]">
          <LiveSessionPanel
            session={currentSession}
            connectionStatus={connectionStatus}
            isUsingMockData={isUsingMockData}
            primaryActiveSpiral={primaryActiveSpiral}
            now={now}
          />
          <SessionActionsPanel
            session={currentSession}
            isRequestingStop={isRequestingStop}
            onStopAgent={() => void stopSession()}
          />
        </section>

        {isRequestingStop ? (
          <InterventionBanner
            tone="warn"
            title="Requesting stop"
            description="TokenGuard is sending the request to the local daemon. It will only show a confirmed stop after the daemon observes enforcement."
          />
        ) : currentSession.agentStatus === 'stopped' ? (
          <InterventionBanner
            tone="danger"
            title="Stop confirmed by TokenGuard"
            description={describeStopReason(
              currentSession.lastStopReason,
              currentSession.lastStoppedFilePath,
            )}
          />
        ) : currentSession.lastStopRequestedAt ? (
          <InterventionBanner
            tone={editsContinuedAfterStopRequest ? 'danger' : 'warn'}
            title={editsContinuedAfterStopRequest ? 'Stop pending — edits are still continuing' : 'Waiting for stop confirmation'}
            description={describeStopRequest(
              currentSession.lastStopRequestReason,
              currentSession.lastStopRequestFilePath,
              editsContinuedAfterStopRequest,
            )}
          />
        ) : !isUsingMockData && currentSession.lastBudgetThreshold ? (
          <InterventionBanner
            tone={currentSession.lastBudgetThreshold.level === 'critical' ? 'danger' : 'warn'}
            title={formatBudgetThresholdTitle(currentSession.lastBudgetThreshold.scope)}
            description={formatBudgetThresholdDescription(currentSession.lastBudgetThreshold)}
          />
        ) : null}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Tokens Observed"
            value={formatInteger(currentSession.totalTokens)}
            status={sessionPercent > 90 ? 'danger' : sessionPercent > 70 ? 'warn' : 'default'}
            detail={hasActiveSession ? `+${formatInteger(currentSession.burnRatePerMin)} / min` : 'Waiting for session events'}
          />
          <MetricCard
            label="Cost Estimate"
            value={currentSession.costEstimateAvailable ? `$${currentSession.sessionCostUsd.toFixed(2)}` : '—'}
            status={monthlyPercent > 90 ? 'danger' : monthlyPercent > 70 ? 'warn' : 'default'}
            detail={currentSession.costEstimateAvailable
              ? `Estimated from ${currentSession.model}`
              : 'No verified pricing available for this model'}
          />
          <MetricCard
            label="Context Window"
            value={`${contextPercent}%`}
            status={contextPercent > 90 ? 'danger' : contextPercent > 70 ? 'warn' : 'default'}
            detail={
              currentSession.contextTotalTokens > 0
                ? `~${formatCompactNumber(currentSession.contextUsedTokens)} / ${formatCompactNumber(currentSession.contextTotalTokens)} tokens`
                : 'No context pressure reported yet'
            }
            progress={contextPercent}
          />
          <MetricCard
            label="Spirals Caught Today"
            value={String(currentSession.spiralsCaughtToday)}
            status={currentSession.activeSpirals.length > 0 ? 'danger' : currentSession.spiralsCaughtToday > 0 ? 'warn' : 'muted'}
            detail={`${spiralsStopped} stopped | ${currentSession.activeSpirals.length} ongoing`}
            pulse={currentSession.activeSpirals.length > 0}
          />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(290px,0.85fr)]">
          <div
            className="liquid-glass-card bento-card rounded-[20px] p-4 sm:p-5"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'var(--blur-card)',
              WebkitBackdropFilter: 'var(--blur-card)',
            }}
          >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 style={{ font: 'var(--font-heading)' }}>Burn Rate</h2>
            </div>
            <div className="smooth-tabs flex flex-wrap gap-1">
              {chartRanges.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className={`smooth-tab rounded-full px-3 py-1.5 ${selectedRange === range ? 'is-active' : ''}`}
                  style={{
                    background: selectedRange === range ? 'var(--bg-elevated)' : 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: selectedRange === range ? 'var(--text-primary)' : 'var(--text-secondary)',
                    font: 'var(--font-caption)',
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div
            className="liquid-glass-inset h-[320px] rounded-[16px] p-3"
            style={{
              background: 'rgba(8, 8, 8, 0.36)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'var(--blur-elevated)',
              WebkitBackdropFilter: 'var(--blur-elevated)',
            }}
          >
            {hasBurnSeries ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burnSeries} margin={{ top: 20, right: 18, bottom: 10, left: 10 }}>
                  <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                  <XAxis
                    dataKey="minute"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => formatCompactNumber(Number(value))}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--border-default)', strokeDasharray: '4 4' }}
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                    }}
                    formatter={(value: number) => formatInteger(value)}
                  />
                  <ReferenceArea x1="20" x2="30" fill="rgba(224, 85, 85, 0.15)" strokeOpacity={0} />
                  <Line
                    type="monotone"
                    dataKey="expected"
                    stroke="var(--text-muted)"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--status-danger)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--status-danger)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyPanel
                title="No burn-rate samples yet"
                detail="Start a live IDE session or run a smoke script and the chart will begin filling in."
              />
            )}
          </div>
          </div>
          <ActivityPanel hasTimelineEvents={hasTimelineEvents} />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.85fr]">
          <div
            className="liquid-glass-card bento-card rounded-[20px] p-4 sm:p-5"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'var(--blur-card)',
              WebkitBackdropFilter: 'var(--blur-card)',
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 style={{ font: 'var(--font-heading)' }}>Loop Detector</h2>
              </div>
              <Link to="/history" style={{ font: 'var(--font-caption)', color: 'var(--text-primary)' }}>
                Open history {'->'}
              </Link>
            </div>

            <div className="liquid-glass-inset overflow-hidden rounded-[16px]" style={{ border: '1px solid var(--border-subtle)' }}>
              <div
                className="hidden grid-cols-[40px_minmax(0,1.6fr)_80px_110px_110px_88px] gap-3 px-4 py-3 md:grid"
                style={{ background: 'var(--bg-elevated)', font: 'var(--font-caption)', color: 'var(--text-muted)' }}
              >
                <span />
                <span>File</span>
                <span>Edits</span>
                <span>Time in Loop</span>
                <span>Est. Waste</span>
                <span>Action</span>
              </div>
              {displayedLoopRows.length > 0 ? (
                displayedLoopRows.map((row, index) => (
                  <div
                    key={`${row.file}-${index}`}
                    className="grid gap-3 px-4 py-4 md:grid-cols-[40px_minmax(0,1.6fr)_80px_110px_110px_88px] md:items-center"
                    style={{
                      background: 'var(--bg-card)',
                      borderTop: index === 0 ? 'none' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {row.status === 'active' ? (
                        <span className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ background: 'var(--status-danger)' }} />
                      ) : (
                        <Check className="h-4 w-4" style={{ color: 'var(--status-ok)' }} />
                      )}
                      <span className="md:hidden" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                        {row.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="truncate text-left"
                      style={{ font: 'var(--font-data)', color: 'var(--text-primary)' }}
                    >
                      {truncatePath(row.file)}
                    </button>
                    <span style={{ font: 'var(--font-data)', color: 'var(--text-secondary)' }}>{row.edits}x</span>
                    <span style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>{row.timeInLoop}</span>
                    <span style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>{row.estimatedWaste}</span>
                    <div>
                      {row.status === 'active' ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isUsingMockData) {
                              // The table and the primary control must take the
                              // same action. Otherwise one panel can claim a
                              // stop while the other still sees live edits.
                              void stopSession();
                            }
                          }}
                          className="rounded-lg px-3 py-1.5"
                          disabled={isRequestingStop || awaitingStopConfirmation}
                          style={{
                            background: 'rgba(224, 85, 85, 0.12)',
                            color: 'var(--status-danger)',
                            font: 'var(--font-caption)',
                            opacity: isUsingMockData || isRequestingStop || awaitingStopConfirmation ? 0.6 : 1,
                            cursor: isRequestingStop || awaitingStopConfirmation ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {row.action}
                        </button>
                      ) : (
                        <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>-</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-12 text-center" style={{ background: 'var(--bg-card)' }}>
                  <p style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                    No active or resolved spirals yet
                  </p>
                  <p className="mt-2" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
                    When repeated file writes are detected, they will appear here immediately.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className="liquid-glass-card bento-card rounded-[20px] p-4 sm:p-5"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              backdropFilter: 'var(--blur-card)',
              WebkitBackdropFilter: 'var(--blur-card)',
            }}
          >
            <div className="mb-4">
              <h2 style={{ font: 'var(--font-heading)' }}>Budget Bars</h2>
            </div>

            <div className="space-y-5">
              <BudgetBar
                label="Session Token Cap"
                value={`${formatInteger(currentSession.totalTokens)} of ${formatInteger(guardrailConfig.sessionTokenCap)} tokens`}
                percent={sessionPercent}
                tone={sessionPercent >= 90 ? 'danger' : sessionPercent >= 70 ? 'warn' : 'ok'}
              />
              <BudgetBar
                label="Monthly Budget (March 2026)"
                value={`$${currentSession.monthlyCostUsd.toFixed(2)} of $${guardrailConfig.monthlyBudgetUsd.toFixed(2)}`}
                percent={monthlyPercent}
                tone={monthlyPercent >= guardrailConfig.monthlyBudgetWarnPercent ? 'warn' : 'ok'}
              />
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}

function LiveSessionPanel({
  session,
  connectionStatus,
  isUsingMockData,
  primaryActiveSpiral,
  now,
}: {
  session: ReturnType<typeof useDaemonState>['session'];
  connectionStatus: ReturnType<typeof useDaemonState>['connectionStatus'];
  isUsingMockData: boolean;
  primaryActiveSpiral: ReturnType<typeof useDaemonState>['session']['activeSpirals'][number] | null;
  now: number;
}) {
  const hasActiveSession = Boolean(session.sessionId);
  const isStopped = session.agentStatus === 'stopped';
  const stopConfirmed = Boolean(session.lastStoppedAt);
  const editsContinuedAfterStopRequest = Boolean(
    session.lastStopRequestedAt &&
      session.lastActivityAt &&
      session.lastActivityAt > session.lastStopRequestedAt,
  );
  const statusTone = isStopped
    ? 'var(--status-danger)'
    : editsContinuedAfterStopRequest
      ? 'var(--status-danger)'
      : session.lastStopRequestedAt
        ? 'var(--status-warn)'
    : primaryActiveSpiral
      ? 'var(--status-warn)'
      : hasActiveSession
        ? 'var(--status-ok)'
        : 'var(--text-muted)';

  const statusLabel = isStopped
    ? 'Stop confirmed'
    : editsContinuedAfterStopRequest
      ? 'Edits still running'
      : session.lastStopRequestedAt
        ? 'Stop requested'
    : primaryActiveSpiral
      ? 'Spiral detected'
      : hasActiveSession
        ? 'Session live'
        : 'Waiting for session';

  const connectionLabel = isUsingMockData
    ? 'Dashboard is waiting for the daemon'
    : connectionStatus === 'connected'
      ? 'Daemon live and streaming'
      : 'Reconnecting to daemon';

  return (
    <section
      className="liquid-session liquid-glass-card bento-card rounded-[12px] p-5 sm:p-6"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--blur-card)',
        WebkitBackdropFilter: 'var(--blur-card)',
      }}
    >
      <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: statusTone,
                font: 'var(--font-caption)',
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: statusTone }} />
              {statusLabel}
            </span>
            <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>{connectionLabel}</span>
          </div>

          <div>
            <h2 style={{ font: '600 24px/1.1 var(--font-family-sans)', color: 'var(--text-primary)' }}>
              {hasActiveSession ? 'Current session at a glance' : 'Ready for the next live session'}
            </h2>
            <p className="mt-2" style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              {stopConfirmed
                ? 'TokenGuard confirmed the block. It will keep monitoring this connected session for later activity.'
                : primaryActiveSpiral
                  ? `${truncatePath(primaryActiveSpiral.filePath)} is spiraling and needs a decision now.`
                : editsContinuedAfterStopRequest
                  ? 'Codex is still producing edits after TokenGuard requested a stop.'
                  : session.lastStopRequestedAt
                    ? 'TokenGuard received the request and is waiting for the daemon to confirm enforcement.'
                : hasActiveSession
                  ? 'Key session details and quick controls are centralized here.'
                  : 'Launch a session or run a smoke command and TokenGuard will surface live telemetry here.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SessionField label="Tool" value={formatToolLabel(session.tool)} icon={<Bot className="h-4 w-4" />} />
            <SessionField label="Model" value={session.model ?? 'Waiting for model'} icon={<Shield className="h-4 w-4" />} />
            <SessionField
              label="Runtime"
              value={session.startedAt
                ? formatDuration(session.startedAt, isStopped ? session.lastStoppedAt ?? now : now)
                : 'Not started'}
              icon={<TimerReset className="h-4 w-4" />}
            />
            <SessionField
              label="Session"
              value={session.sessionId ? shortenSessionId(session.sessionId) : 'No active session'}
              icon={<AlertTriangle className="h-4 w-4" />}
            />
          </div>

          <div
            className="liquid-glass-inset rounded-[18px] px-4 py-3"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>Active spiral</p>
            <p className="mt-1" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
              {primaryActiveSpiral
                ? `${primaryActiveSpiral.filePath} • ${primaryActiveSpiral.editCount} edits`
                : hasActiveSession
                  ? 'No active spiral detected'
                  : 'No session is live yet'}
            </p>
          </div>
      </div>
    </section>
  );
}

function SessionActionsPanel({
  session,
  isRequestingStop,
  onStopAgent,
}: {
  session: ReturnType<typeof useDaemonState>['session'];
  isRequestingStop: boolean;
  onStopAgent: () => void;
}) {
  const hasActiveSession = Boolean(session.sessionId);
  const isStopped = session.agentStatus === 'stopped';
  const stopWasRequested = Boolean(session.lastStopRequestedAt);
  const editsContinuedAfterStopRequest = Boolean(
    session.lastStopRequestedAt &&
      session.lastActivityAt &&
      session.lastActivityAt > session.lastStopRequestedAt,
  );
  const awaitingStopConfirmation = stopWasRequested && !isStopped;
  const canRequestStop = hasActiveSession && !isStopped && !isRequestingStop &&
    (!awaitingStopConfirmation || editsContinuedAfterStopRequest);
  const stopLabel = isRequestingStop
    ? 'Requesting stop…'
    : isStopped
      ? 'Stop confirmed'
      : editsContinuedAfterStopRequest
        ? 'Stop pending — retry'
        : awaitingStopConfirmation
          ? 'Waiting for confirmation'
          : 'Stop agent';

  return (
    <aside className="liquid-glass-card bento-card flex flex-col rounded-[12px] p-5 sm:p-6">
      <p className="dashboard-page-kicker">Session controls</p>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <QuickStat label="Tokens" value={formatInteger(session.totalTokens)} />
        <QuickStat label="Est. cost" value={session.costEstimateAvailable ? `$${session.sessionCostUsd.toFixed(2)}` : '—'} />
        <QuickStat label="Burn" value={`${formatInteger(session.burnRatePerMin)}/m`} />
        <QuickStat label="Context" value={`${session.contextPercent}%`} />
      </div>
      <div className="liquid-glass-inset mt-5 flex flex-1 flex-col justify-end rounded-[12px] p-3">
        <button
          type="button"
          onClick={onStopAgent}
          disabled={!canRequestStop}
          className="rounded-xl px-4 py-3 transition-opacity"
          style={{
            background: canRequestStop ? 'rgba(224, 85, 85, 0.12)' : 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: canRequestStop ? 'var(--status-danger)' : 'var(--text-muted)',
            font: 'var(--font-label)',
            opacity: canRequestStop ? 1 : 0.65,
            cursor: canRequestStop ? 'pointer' : 'not-allowed',
          }}
        >
          {isRequestingStop ? <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />{stopLabel}</span> : stopLabel}
        </button>
        <p className="mt-3 px-1" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
          {isStopped
            ? 'Stop confirmed by the daemon. Monitoring remains active for this session.'
            : awaitingStopConfirmation
              ? editsContinuedAfterStopRequest
                ? 'Stop is still pending. The daemon saw more edits, so you can send another request while it waits for confirmation.'
                : 'Waiting for the daemon to confirm that a later edit was blocked.'
              : 'A confirmed stop appears only after the daemon blocks a later edit.'}
        </p>
        <Link
          to="/guardrails"
          className="mt-2 rounded-xl px-4 py-3 text-center"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            font: 'var(--font-label)',
          }}
        >
          Review guardrails
        </Link>
      </div>
    </aside>
  );
}

function ActivityPanel({ hasTimelineEvents }: { hasTimelineEvents: boolean }) {
  return (
    <aside
      className="liquid-glass-card bento-card rounded-[20px] p-4 sm:p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--blur-card)',
        WebkitBackdropFilter: 'var(--blur-card)',
      }}
    >
      <h2 style={{ font: 'var(--font-heading)' }}>Recent activity</h2>
      {hasTimelineEvents ? (
        <ol className="mt-4 space-y-4">
          {timelineEvents.map((event) => (
            <li key={`${event.time}-${event.label}`} className="flex items-start gap-3">
              <span className="liquid-glass-inset mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                <TimelineIcon type={event.icon} />
              </span>
              <div className="min-w-0">
                <p style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>{event.label}</p>
                <p className="mt-1 font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{event.time}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="liquid-glass-inset mt-4 rounded-[12px] px-4 py-6 text-center">
          <p style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>No activity yet</p>
        </div>
      )}
    </aside>
  );
}

function SessionField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="liquid-glass-inset rounded-[18px] px-4 py-3"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center gap-2" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{icon}</span>
        {label}
      </div>
      <p className="mt-2" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

function QuickStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>{label}</p>
      <p className="mt-1" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

function SpiralDecisionDialog({
  open,
  spiral,
  onIgnore,
  onStop,
}: {
  open: boolean;
  spiral: NonNullable<ReturnType<typeof useDaemonState>['session']['activeSpirals'][number]>;
  onIgnore: () => void;
  onStop: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
      <div
        className="w-full max-w-lg rounded-[24px] p-6"
        style={{
          background: 'rgba(16, 16, 16, 0.92)',
          border: '1px solid var(--border-default)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: 'rgba(224, 85, 85, 0.12)', color: 'var(--status-danger)' }}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>Spiral detected</p>
            <h3 className="mt-1" style={{ font: '600 24px/1.15 var(--font-family-sans)', color: 'var(--text-primary)' }}>
              Stop this agent or ignore the spiral
            </h3>
            <p className="mt-3" style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              {spiral.filePath} crossed {spiral.editCount} repeated edits in the active window.
            </p>
          </div>
        </div>

        <div
          className="mt-5 rounded-[18px] px-4 py-3"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>Why you are seeing this</p>
          <p className="mt-2" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
            TokenGuard detected a likely edit loop. Ignoring it will mark the spiral as accepted and monitoring will continue.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onIgnore}
            className="rounded-xl px-4 py-2.5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              font: 'var(--font-label)',
            }}
          >
            Ignore for now
          </button>
          <button
            type="button"
            onClick={onStop}
            className="rounded-xl px-4 py-2.5"
            style={{
              background: 'rgba(224, 85, 85, 0.14)',
              border: '1px solid rgba(224, 85, 85, 0.28)',
              color: 'var(--status-danger)',
              font: 'var(--font-label)',
            }}
          >
            Stop agent
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  status,
  progress,
  pulse,
}: {
  label: string;
  value: string;
  detail: string;
  status: 'default' | 'warn' | 'danger' | 'muted';
  progress?: number;
  pulse?: boolean;
}) {
  const color =
    status === 'danger'
      ? 'var(--status-danger)'
      : status === 'warn'
        ? 'var(--status-warn)'
        : status === 'muted'
          ? 'var(--text-secondary)'
          : 'var(--text-primary)';

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
      <div className="mb-2 flex items-center gap-2">
        {pulse ? <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: color }} /> : null}
        <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>{label.toUpperCase()}</p>
      </div>
      <p style={{ font: '600 28px/1.1 var(--font-family-sans)', color }}>{value}</p>
      {typeof progress === 'number' ? (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg-elevated)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: color }}
            />
          </div>
        </div>
      ) : null}
      <p className="mt-3" style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
        {detail}
      </p>
    </article>
  );
}

function EmptyPanel({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="flex h-full items-center justify-center rounded-[12px] px-6 text-center">
      <div className="max-w-md">
        <p style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>{title}</p>
        <p className="mt-2" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
          {detail}
        </p>
      </div>
    </div>
  );
}

function InterventionBanner({
  tone,
  title,
  description,
  actions,
}: {
  tone: 'warn' | 'danger';
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  const borderColor = tone === 'danger' ? 'var(--status-danger)' : 'var(--status-warn)';

  return (
    <section
      className="rounded-r-[16px] rounded-l-[6px] px-4 py-3"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderLeft: `4px solid ${borderColor}`,
        backdropFilter: 'var(--blur-elevated)',
        WebkitBackdropFilter: 'var(--blur-elevated)',
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>{title}</p>
          <p className="mt-1" style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

function BudgetBar({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: string;
  percent: number;
  tone: 'ok' | 'warn' | 'danger';
}) {
  const color =
    tone === 'danger'
      ? 'var(--status-danger)'
      : tone === 'warn'
        ? 'var(--status-warn)'
        : 'var(--status-ok)';

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>{label}</span>
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        <span style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
          {percent.toFixed(1)}%
        </span>
      </div>
      <p className="mb-2" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
        {value}
      </p>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </div>
  );
}

function TimelineIcon({ type }: { type: string }) {
  if (type === 'start') return <Play className="h-4 w-4" style={{ color: 'var(--status-ok)' }} />;
  if (type === 'spiral') return <AlertTriangle className="h-4 w-4" style={{ color: 'var(--status-warn)' }} />;
  if (type === 'stop') return <Square className="h-4 w-4" style={{ color: 'var(--status-danger)' }} />;
  if (type === 'rollback') return <RotateCcw className="h-4 w-4" style={{ color: 'var(--accent)' }} />;
  return <Check className="h-4 w-4" style={{ color: 'var(--status-ok)' }} />;
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function truncatePath(path: string) {
  const parts = path.split('/');
  if (parts.length <= 2) return path;
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

function shortenSessionId(sessionId: string) {
  if (sessionId.length <= 18) {
    return sessionId;
  }

  return `${sessionId.slice(0, 12)}...${sessionId.slice(-4)}`;
}

function describeStopReason(
  reason: string | null,
  filePath: string | null,
): string {
  switch (reason) {
    case 'auto_stopped':
      return filePath
        ? `${filePath} tried to continue after TokenGuard detected a live spiral, and the plugin blocked that edit.`
        : 'TokenGuard blocked the edit that tried to continue after a live spiral was detected.';
    case 'user_confirmed':
      return filePath
        ? `${filePath} tried to continue after the dashboard stop request, and the plugin blocked that edit.`
        : 'TokenGuard blocked the edit that tried to continue after the dashboard stop request.';
    case 'session_cap':
      return 'The active session exceeded its token cap and TokenGuard issued a hard stop.';
    case 'monthly_budget':
      return 'The workspace exceeded its monthly budget and TokenGuard issued a hard stop.';
    case 'hard_cap':
      return 'TokenGuard stopped the agent because a hard cap was reached.';
    default:
      return 'TokenGuard blocked the edit that tried to continue this session.';
  }
}

function describeStopRequest(
  reason: ReturnType<typeof useDaemonState>['session']['lastStopRequestReason'],
  filePath: string | null,
  editsAreContinuing: boolean,
): string {
  const prefix = filePath ? `${filePath} triggered a stop request. ` : 'TokenGuard sent a stop request. ';

  if (editsAreContinuing) {
    return `${prefix}Codex is still writing, so the request has not stopped the active command. You can send it again.`;
  }

  if (reason === 'auto_stopped') {
    return `${prefix}TokenGuard has blocked the next matching edit request and is waiting to verify that activity ends.`;
  }

  return `${prefix}TokenGuard has blocked future matching edit requests and is waiting to verify that activity ends.`;
}

function formatBudgetThresholdTitle(scope: 'session' | 'monthly' | 'context_window'): string {
  if (scope === 'session') {
    return 'Session budget threshold crossed';
  }

  if (scope === 'monthly') {
    return 'Monthly budget threshold crossed';
  }

  return 'Context window threshold crossed';
}

function formatBudgetThresholdDescription(
  threshold: NonNullable<ReturnType<typeof useDaemonState>['session']['lastBudgetThreshold']>,
): string {
  const prefix =
    threshold.level === 'critical'
      ? 'The session is in the critical budget zone.'
      : 'The session has crossed the warning budget zone.';

  return `${prefix} ${threshold.percentUsed.toFixed(1)}% used with action "${threshold.action}".`;
}
