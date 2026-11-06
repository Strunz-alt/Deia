import type { APIRoute } from 'astro';
import { clearSessionCookie, invalidateSession, SESSION_COOKIE } from '@/lib/auth';
import { setFlash } from '@/lib/flash';

/** Cierre de sesión. Sólo por POST, para que un enlace externo no pueda forzarlo. */
export const POST: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (token) await invalidateSession(token);
  clearSessionCookie(cookies);
  setFlash(cookies, 'info', 'Cerraste sesión.');
  return redirect('/', 303);
};

export const GET: APIRoute = ({ redirect }) => redirect('/', 302);
