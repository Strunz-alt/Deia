import type { APIRoute } from 'astro';
import { paramId } from '@/lib/forms';
import { getMaterial } from '@/lib/services/materias';
import { readStored } from '@/lib/storage';

/**
 * Entrega un material de estudio. Requiere sesión iniciada (estudiante o
 * administrador). `?descargar=1` fuerza la descarga; si no, los PDF se abren
 * en el navegador.
 */
export const GET: APIRoute = async ({ params, url, locals, redirect }) => {
  if (!locals.user) {
    return redirect(`/ingresar?next=${encodeURIComponent('/apuntes')}`, 303);
  }

  const id = paramId(params.id);
  const material = id ? await getMaterial(id) : null;
  if (!material) return new Response('Material no encontrado', { status: 404 });

  const data = await readStored(material.archivo);
  if (!data) return new Response('El archivo no está disponible', { status: 404 });

  const download = url.searchParams.has('descargar') || material.archivoTipo !== 'application/pdf';
  const ascii = material.archivoNombre.normalize('NFD').replace(/[^\x20-\x7e]/g, '').replace(/["\\]/g, '') || 'material';

  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': material.archivoTipo,
      'Content-Length': String(data.length),
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(material.archivoNombre)}`,
      'Cache-Control': 'private, no-store',
    },
  });
};
