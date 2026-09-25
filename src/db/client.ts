/**
 * Conexión a la base de datos.
 *
 * - Por defecto usa un archivo SQLite local (`data/ced.db`).
 * - Para una base remota libSQL/Turso, definir DATABASE_URL y DATABASE_AUTH_TOKEN.
 *
 * Este módulo usa imports con extensión `.ts` para poder reutilizarse desde
 * los scripts de línea de comandos (`scripts/*.ts`), que corren con Node.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from './schema.ts';

const url = process.env.DATABASE_URL || 'file:./data/ced.db';

if (url.startsWith('file:')) {
  fs.mkdirSync(path.dirname(path.resolve(url.slice('file:'.length))), { recursive: true });
}

export const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
export const db = drizzle(client, { schema });
export type DB = typeof db;

let ready: Promise<void> | undefined;

/** Aplica las migraciones pendientes una sola vez por proceso. */
export function ensureDb() {
  ready ??= (async () => {
    await client.execute('PRAGMA foreign_keys = ON');
    if (url.startsWith('file:')) await client.execute('PRAGMA journal_mode = WAL');
    await migrate(db, { migrationsFolder: path.resolve('drizzle') });
  })().catch((err) => {
    ready = undefined;
    throw err;
  });
  return ready;
}
