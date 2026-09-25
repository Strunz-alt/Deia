import type { APIRoute } from 'astro';
import { mimeForKey, PUBLIC_FOLDERS, readStored } from '@/lib/storage';

/** Imágenes públicas subidas desde el panel (materias, miembros, noticias…). */
export const GET: APIRoute = async ({ params }) => {
  const key = params.key ?? '';
  const folder = key.split('/')[0];
  if (!(PUBLIC_FOLDERS as readonly string[]).includes(folder)) return new Response('No encontrado', { status: 404 });

  const data = await readStored(key);
  if (!data) return new Response('No encontrado', { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': mimeForKey(key),
      'Content-Length': String(data.length),
      // Cada archivo tiene un nombre único: se puede cachear indefinidamente.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
};
