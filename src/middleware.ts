import { defineMiddleware } from 'astro:middleware';
import { ensureDb } from '@/db/client';
import {
  clearSessionCookie,
  isSecureRequest,
  purgeExpiredSessions,
  SESSION_COOKIE,
  setSessionCookie,
  validateSession,
} from '@/lib/auth';
import { takeFlash } from '@/lib/flash';

let lastPurge = 0;

export const onRequest = defineMiddleware(async (ctx, next) => {
  ctx.locals.user = null;
  ctx.locals.flash = null;

  // Los archivos estáticos y prerenderizados no necesitan sesión.
  if (ctx.isPrerendered) return next();

  await ensureDb();

  if (Date.now() - lastPurge > 60 * 60 * 1000) {
    lastPurge = Date.now();
    purgeExpiredSessions().catch(() => {});
  }

  const token = ctx.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    const result = await validateSession(token);
    if (result) {
      ctx.locals.user = result.user;
      if (result.renewed) {
        setSessionCookie(ctx.cookies, token, result.expiraEn, isSecureRequest(ctx.url, ctx.request.headers));
      }
    } else {
      clearSessionCookie(ctx.cookies);
    }
  }

  const path = ctx.url.pathname;
  const isMedia = path.startsWith('/media/') || path.startsWith('/apuntes/archivo/');

  if (!isMedia && ctx.request.method === 'GET') ctx.locals.flash = takeFlash(ctx.cookies);

  // Panel de administración: sólo administradores (también se verifica en cada página).
  if (path === '/admin' || path.startsWith('/admin/')) {
    if (!ctx.locals.user) {
      return ctx.redirect(`/ingresar?next=${encodeURIComponent(path + ctx.url.search)}`, 303);
    }
    if (ctx.locals.user.rol !== 'admin') {
      return ctx.rewrite('/acceso-denegado');
    }
  }

  const response = await next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  if (!isMedia) {
    // Las páginas dependen de la sesión: no deben guardarse en cachés compartidas.
    response.headers.set('Cache-Control', 'private, no-store');
  }
  return response;
});
