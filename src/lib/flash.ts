/**
 * Mensajes "flash": se guardan en una cookie de vida corta antes de una
 * redirección y se muestran una sola vez en la página siguiente.
 */
import type { AstroCookies } from 'astro';

export interface Flash {
  type: 'success' | 'error' | 'info';
  message: string;
}

const COOKIE = 'ced_flash';

export function setFlash(cookies: AstroCookies, type: Flash['type'], message: string) {
  cookies.set(COOKIE, JSON.stringify({ type, message }), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60,
  });
}

export function takeFlash(cookies: AstroCookies): Flash | null {
  const raw = cookies.get(COOKIE)?.value;
  if (!raw) return null;
  cookies.delete(COOKIE, { path: '/' });
  try {
    const parsed = JSON.parse(raw) as Flash;
    if (['success', 'error', 'info'].includes(parsed.type) && typeof parsed.message === 'string') return parsed;
  } catch {
    /* cookie inválida */
  }
  return null;
}
