/**
 * Verificación de permisos en el servidor. El middleware ya protege `/admin`,
 * pero cada página o endpoint administrativo vuelve a comprobarlo antes de
 * leer o modificar datos.
 */
import type { APIContext, AstroGlobal } from 'astro';

type Ctx = Pick<APIContext | AstroGlobal, 'locals' | 'url' | 'redirect'>;

const loginUrl = (url: URL) => `/ingresar?next=${encodeURIComponent(url.pathname + url.search)}`;

/** Devuelve una respuesta de rechazo si el usuario no es administrador. */
export function requireAdmin(ctx: Ctx): Response | null {
  const user = ctx.locals.user;
  if (!user) return ctx.redirect(loginUrl(ctx.url), 303);
  if (user.rol !== 'admin') return new Response('No tenés permisos para realizar esta acción.', { status: 403 });
  return null;
}

/** Devuelve una respuesta de rechazo si no hay sesión iniciada. */
export function requireUser(ctx: Ctx): Response | null {
  if (!ctx.locals.user) return ctx.redirect(loginUrl(ctx.url), 303);
  return null;
}

export const isAdmin = (ctx: Pick<Ctx, 'locals'>) => ctx.locals.user?.rol === 'admin';
