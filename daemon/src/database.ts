import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export const DEFAULT_DATABASE_PATH = resolve(process.cwd(), 'data', 'tokenguard.db');

export function createDatabase(databasePath = DEFAULT_DATABASE_PATH): DatabaseSync {
  mkdirSync(dirname(databasePath), { recursive: true });

  const database = new DatabaseSync(databasePath);

  database.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      type TEXT NOT NULL,
      tool TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      payload TEXT NOT NULL
    );
  `);

  return database;
}
