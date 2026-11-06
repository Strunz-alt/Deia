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
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { hashPassword, PASSWORD_MIN } from '../lib/password.ts';
import * as schema from './schema.ts';

const url = process.env.DATABASE_URL || 'file:./data/ced.db';

if (url.startsWith('file:')) {
  fs.mkdirSync(path.dirname(path.resolve(url.slice('file:'.length))), { recursive: true });
}

export const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
export const db = drizzle(client, { schema });
export type DB = typeof db;

/**
 * Primera cuenta administradora desde variables de entorno, para hostings sin
 * acceso a la consola (p. ej. Railway). Sólo actúa si TODAVÍA NO HAY ningún
 * administrador y están definidas ADMIN_EMAIL y ADMIN_PASSWORD (y opcionalmente
 * ADMIN_NOMBRE). Si ya existe una cuenta con ese correo, se le asigna el rol y
 * la contraseña indicada, y se cierran sus sesiones. Una vez creada, conviene
 * borrar ADMIN_PASSWORD de las variables del hosting.
 */
async function bootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const { usuarios, sesiones } = schema;
  const [admin] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.rol, 'admin')).limit(1);
  if (admin) return;
  if (password.length < PASSWORD_MIN || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.warn(`[admin] ADMIN_EMAIL no es válido o ADMIN_PASSWORD tiene menos de ${PASSWORD_MIN} caracteres: no se creó el administrador.`);
    return;
  }
  const passwordHash = await hashPassword(password);
  const [existing] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email)).limit(1);
  if (existing) {
    await db.update(usuarios).set({ rol: 'admin', passwordHash }).where(eq(usuarios.id, existing.id));
    await db.delete(sesiones).where(eq(sesiones.usuarioId, existing.id));
  } else {
    const nombre = process.env.ADMIN_NOMBRE?.trim() || 'Administración';
    await db.insert(usuarios).values({ email, nombre, passwordHash, rol: 'admin' });
  }
  console.log(`[admin] Cuenta administradora inicial lista para ${email}. Ya podés borrar ADMIN_PASSWORD de las variables.`);
}

let ready: Promise<void> | undefined;

/** Aplica las migraciones pendientes (y el administrador inicial) una sola vez por proceso. */
export function ensureDb() {
  ready ??= (async () => {
    await client.execute('PRAGMA foreign_keys = ON');
    if (url.startsWith('file:')) await client.execute('PRAGMA journal_mode = WAL');
    await migrate(db, { migrationsFolder: path.resolve('drizzle') });
    await bootstrapAdmin();
  })().catch((err) => {
    ready = undefined;
    throw err;
  });
  return ready;
}
