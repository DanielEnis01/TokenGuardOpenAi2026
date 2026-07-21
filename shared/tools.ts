import type { ToolConnection, ToolId } from './types.ts';

export const CODEX_PLUGIN_MARKETPLACE_REPOSITORY = 'DanielEnis01/TokenGuardOpenAi2026';
export const CODEX_PLUGIN_MARKETPLACE_REF = 'main';
export const CODEX_PLUGIN_MARKETPLACE_NAME = 'tokenguard';
export const CODEX_PLUGIN_NAME = 'tokenguard';

export const CONNECTABLE_TOOL_IDS: ToolId[] = [
  'codex',
  'cursor',
  'windsurf',
  'claude-code',
  'github-copilot',
  'bolt',
  'lovable',
  'claude-api',
  'openai-api',
];

export const IMPLEMENTED_CONNECTOR_TOOL_IDS: ToolId[] = ['codex', 'claude-code'];

export function getConnectCommand(tool: ToolId): string {
  return `tokenguard connect ${tool}`;
}

export function getToolInstallCommands(tool: ToolId): string[] {
  if (tool === 'codex') {
    return [
      `codex plugin marketplace add ${CODEX_PLUGIN_MARKETPLACE_REPOSITORY} --ref ${CODEX_PLUGIN_MARKETPLACE_REF}`,
      `codex plugin add ${CODEX_PLUGIN_NAME}@${CODEX_PLUGIN_MARKETPLACE_NAME}`,
    ];
  }

  return [getConnectCommand(tool)];
}

export function createDefaultToolConnections(): ToolConnection[] {
  return CONNECTABLE_TOOL_IDS.map((tool) => ({
    tool,
    status: 'disconnected',
    command: getConnectCommand(tool),
    lastSeenAt: null,
    errorMessage: null,
  }));
}

export function isImplementedConnectorTool(tool: ToolId): boolean {
  return IMPLEMENTED_CONNECTOR_TOOL_IDS.includes(tool);
}
