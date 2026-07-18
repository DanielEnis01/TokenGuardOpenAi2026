import { mergeGuardrailConfig, type GuardrailConfig } from '../../../shared/config.ts';
import { createDefaultToolConnections } from '../../../shared/tools.ts';
import {
  EMPTY_CURRENT_SESSION_STATE,
  type CurrentSessionState,
  type SessionEvent,
  type SessionSummary,
  type ToolConnection,
  type ToolId,
} from '../../../shared/types.ts';

export interface BurnSeriesPoint {
  minute: string;
  actual: number;
  expected: number;
}

export interface LoopDetectorRow {
  status: 'active' | 'resolved';
  file: string;
  edits: number;
  timeInLoop: string;
  estimatedWaste: string;
  action: 'Stop' | '-';
}

export interface TimelineEventRow {
  time: string;
  icon: 'start' | 'spiral' | 'stop' | 'rollback' | 'resolved';
  label: string;
  detail: string;
}

export interface ToolConnectionCard extends ToolConnection {
  usageSummary?: string | null;
}

export const guardrailConfig: GuardrailConfig = mergeGuardrailConfig();

export const currentSession: CurrentSessionState = {
  ...EMPTY_CURRENT_SESSION_STATE,
};

export const burnSeries: BurnSeriesPoint[] = [];

export const loopDetectorRows: LoopDetectorRow[] = [];

export const sessionEvents: SessionEvent[] = [];

export const timelineEvents: TimelineEventRow[] = [];

export const historySessions: SessionSummary[] = [];

export const toolConnections: ToolConnectionCard[] = createDefaultToolConnections().map((tool) => ({
  ...tool,
  usageSummary: null,
}));

export function formatToolLabel(tool: ToolId | null | undefined): string {
  switch (tool) {
    case 'codex':
      return 'Codex';
    case 'claude-code':
      return 'Claude Code';
    case 'github-copilot':
      return 'GitHub Copilot';
    case 'claude-api':
      return 'Claude API';
    case 'openai-api':
      return 'OpenAI API';
    case 'cursor':
      return 'Cursor';
    case 'windsurf':
      return 'Windsurf';
    case 'bolt':
      return 'Bolt';
    case 'lovable':
      return 'Lovable';
    default:
      return 'No tool connected';
  }
}

export function formatDuration(startedAt: number, endedAt = Date.now()): string {
  const totalSeconds = Math.max(0, Math.floor((endedAt - startedAt) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value);
}

export function formatRelativeTime(timestamp: number | null | undefined): string {
  if (!timestamp) {
    return 'Never';
  }

  const deltaMs = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(deltaMs / 60_000);

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
