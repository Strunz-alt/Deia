/**
 * Gestión de usuarios desde el panel. Sólo un administrador puede cambiar
 * roles; nadie puede quitarse el rol a sí mismo ni dejar el sitio sin
 * administradores.
 */
import { randomInt } from 'node:crypto';
import { desc, eq, like, or, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { usuarios, type Rol } from '@/db/schema';
import { invalidateUserSessions } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

export function listUsuarios(q?: string) {
  const term = q ? `%${q.replace(/[%_]/g, '')}%` : null;
  return db
    .select({
      id: usuarios.id,
      nombre: usuarios.nombre,
      email: usuarios.email,
      rol: usuarios.rol,
      creadoEn: usuarios.creadoEn,
      ultimoIngreso: usuarios.ultimoIngreso,
    })
    .from(usuarios)
    .where(term ? or(like(usuarios.nombre, term), like(usuarios.email, term)) : undefined)
    .orderBy(sql`case ${usuarios.rol} when 'admin' then 0 else 1 end`, desc(usuarios.creadoEn));
}

export async function countAdmins() {
  const [row] = await db.select({ n: sql<number>`count(*)` }).from(usuarios).where(eq(usuarios.rol, 'admin'));
  return Number(row?.n ?? 0);
}

export async function setRol(actorId: number, userId: number, rol: Rol) {
  if (actorId === userId) return { ok: false as const, error: 'No podés cambiar tu propio rol.' };
  const [user] = await db.select().from(usuarios).where(eq(usuarios.id, userId)).limit(1);
  if (!user) return { ok: false as const, error: 'El usuario no existe.' };
  if (user.rol === rol) return { ok: true as const, nombre: user.nombre };
  if (user.rol === 'admin' && rol !== 'admin' && (await countAdmins()) <= 1) {
    return { ok: false as const, error: 'Tiene que quedar al menos un administrador.' };
  }
  await db.update(usuarios).set({ rol }).where(eq(usuarios.id, userId));
  return { ok: true as const, nombre: user.nombre };
}

/** Genera una contraseña temporal legible y cierra las sesiones abiertas del usuario. */
export async function resetPassword(actorId: number, userId: number) {
  if (actorId === userId) return { ok: false as const, error: 'Para tu propia cuenta usá el comando de administración.' };
  const [user] = await db.select().from(usuarios).where(eq(usuarios.id, userId)).limit(1);
  if (!user) return { ok: false as const, error: 'El usuario no existe.' };
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const temp = Array.from({ length: 12 }, () => alphabet[randomInt(alphabet.length)]).join('');
  await db.update(usuarios).set({ passwordHash: await hashPassword(temp) }).where(eq(usuarios.id, userId));
  await invalidateUserSessions(userId);
  return { ok: true as const, nombre: user.nombre, email: user.email, temp };
}
