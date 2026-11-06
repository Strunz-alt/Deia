/**
 * Sesiones de usuario.
 *
 * - El token (32 bytes aleatorios) se entrega en una cookie httpOnly.
 * - En la base se guarda sólo su SHA-256, de modo que una filtración de la
 *   base no permite suplantar sesiones.
 * - Las sesiones duran 30 días y se renuevan automáticamente con el uso.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { eq, lt } from 'drizzle-orm';
import { db } from '@/db/client';
import { sesiones, usuarios, type Rol } from '@/db/schema';

export const SESSION_COOKIE = 'ced_sesion';
const DAY = 24 * 60 * 60 * 1000;
const SESSION_TTL = 30 * DAY;
const RENEW_BEFORE = 15 * DAY;

export interface SessionUser {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function createSession(usuarioId: number) {
  const token = randomBytes(32).toString('base64url');
  const expiraEn = new Date(Date.now() + SESSION_TTL);
  await db.insert(sesiones).values({ id: hashToken(token), usuarioId, expiraEn });
  await db.update(usuarios).set({ ultimoIngreso: new Date() }).where(eq(usuarios.id, usuarioId));
  return { token, expiraEn };
}

export async function validateSession(token: string) {
  const id = hashToken(token);
  const [row] = await db
    .select({
      sesionId: sesiones.id,
      expiraEn: sesiones.expiraEn,
      id: usuarios.id,
      email: usuarios.email,
      nombre: usuarios.nombre,
      rol: usuarios.rol,
    })
    .from(sesiones)
    .innerJoin(usuarios, eq(sesiones.usuarioId, usuarios.id))
    .where(eq(sesiones.id, id))
    .limit(1);

  if (!row) return null;
  if (row.expiraEn.getTime() <= Date.now()) {
    await db.delete(sesiones).where(eq(sesiones.id, id));
    return null;
  }

  let expiraEn = row.expiraEn;
  let renewed = false;
  if (expiraEn.getTime() - Date.now() < RENEW_BEFORE) {
    expiraEn = new Date(Date.now() + SESSION_TTL);
    await db.update(sesiones).set({ expiraEn }).where(eq(sesiones.id, id));
    renewed = true;
  }

  const user: SessionUser = { id: row.id, email: row.email, nombre: row.nombre, rol: row.rol };
  return { user, expiraEn, renewed };
}

export async function invalidateSession(token: string) {
  await db.delete(sesiones).where(eq(sesiones.id, hashToken(token)));
}

/** Cierra todas las sesiones de un usuario (p. ej. al cambiarle el rol). */
export async function invalidateUserSessions(usuarioId: number) {
  await db.delete(sesiones).where(eq(sesiones.usuarioId, usuarioId));
}

export async function purgeExpiredSessions() {
  await db.delete(sesiones).where(lt(sesiones.expiraEn, new Date()));
}

export function setSessionCookie(cookies: AstroCookies, token: string, expires: Date, secure: boolean) {
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    expires,
  });
}

export function clearSessionCookie(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

/** La cookie se marca `Secure` cuando el sitio se sirve por HTTPS (también detrás de un proxy). */
export const isSecureRequest = (url: URL, headers: Headers) =>
  url.protocol === 'https:' || headers.get('x-forwarded-proto') === 'https';

/** Sólo acepta rutas internas para redirigir después de iniciar sesión. */
export function safeNext(next: string | null | undefined, fallback = '/') {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}
