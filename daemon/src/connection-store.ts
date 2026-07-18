import type { DatabaseSync } from 'node:sqlite';

import type { ToolConnection, ToolId } from '../../shared/types.ts';
import { createDefaultToolConnections } from '../../shared/tools.ts';

const CONNECTIONS_KEY = 'tool-connections';

export function loadToolConnections(database: DatabaseSync): ToolConnection[] {
  const storedConnections = readStoredConnections(database);
  return mergeConnections(storedConnections);
}

export function saveToolConnections(
  database: DatabaseSync,
  nextConnections: ToolConnection[],
): ToolConnection[] {
  const normalized = mergeConnections(nextConnections);

  database
    .prepare(
      `
        INSERT INTO app_config (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `,
    )
    .run(CONNECTIONS_KEY, JSON.stringify(normalized), Date.now());

  return normalized;
}

export function upsertToolConnection(
  database: DatabaseSync,
  tool: ToolId,
  patch: Partial<ToolConnection>,
): ToolConnection[] {
  const currentConnections = loadToolConnections(database);
  const nextConnections = currentConnections.map((connection) =>
    connection.tool === tool ? sanitizeConnection({ ...connection, ...patch }) : connection,
  );

  return saveToolConnections(database, nextConnections);
}

export function touchToolConnectionActivity(
  database: DatabaseSync,
  tool: ToolId,
  timestamp: number,
): ToolConnection[] {
  const currentConnections = loadToolConnections(database);
  const existingConnection = currentConnections.find((connection) => connection.tool === tool);

  if (!existingConnection || existingConnection.status !== 'connected') {
    return currentConnections;
  }

  return upsertToolConnection(database, tool, {
    lastSeenAt: timestamp,
  });
}

function readStoredConnections(database: DatabaseSync): ToolConnection[] | null {
  const row = database
    .prepare('SELECT value FROM app_config WHERE key = ?')
    .get(CONNECTIONS_KEY) as { value: string } | undefined;

  if (!row) {
    return null;
  }

  try {
    return JSON.parse(row.value) as ToolConnection[];
  } catch {
    return null;
  }
}

function mergeConnections(overrides: ToolConnection[] | null | undefined): ToolConnection[] {
  const defaults = createDefaultToolConnections();

  if (!overrides || overrides.length === 0) {
    return defaults;
  }

  return defaults.map((defaultConnection) => {
    const override = overrides.find((connection) => connection.tool === defaultConnection.tool);
    return sanitizeConnection({
      ...defaultConnection,
      ...override,
      command: defaultConnection.command,
    });
  });
}

function sanitizeConnection(connection: ToolConnection): ToolConnection {
  return {
    tool: connection.tool,
    status: connection.status,
    command: connection.command,
    lastSeenAt: typeof connection.lastSeenAt === 'number' ? connection.lastSeenAt : null,
    errorMessage: connection.errorMessage ?? null,
  };
}
