import type { DatabaseSync } from 'node:sqlite';

import {
  DEFAULT_GUARDRAIL_CONFIG,
  sanitizeGuardrailConfig,
  type GuardrailConfig,
} from '../../shared/config.ts';

const CONFIG_KEY = 'guardrails';

export function loadGuardrailConfig(database: DatabaseSync): GuardrailConfig {
  const storedConfig = readStoredGuardrailConfig(database);

  if (!storedConfig) {
    return saveGuardrailConfig(database, DEFAULT_GUARDRAIL_CONFIG);
  }

  return sanitizeGuardrailConfig(storedConfig);
}

export function saveGuardrailConfig(
  database: DatabaseSync,
  overrides: Partial<GuardrailConfig>,
): GuardrailConfig {
  const storedConfig = readStoredGuardrailConfig(database) ?? DEFAULT_GUARDRAIL_CONFIG;
  const config = sanitizeGuardrailConfig({
    ...storedConfig,
    ...overrides,
  });

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
    .run(CONFIG_KEY, JSON.stringify(config), Date.now());

  return config;
}

function readStoredGuardrailConfig(database: DatabaseSync): Partial<GuardrailConfig> | null {
  const statement = database.prepare('SELECT value FROM app_config WHERE key = ?');
  const row = statement.get(CONFIG_KEY) as { value: string } | undefined;

  if (!row) {
    return null;
  }

  try {
    return JSON.parse(row.value) as Partial<GuardrailConfig>;
  } catch {
    return null;
  }
}
