/** Noticias y novedades: borradores, publicación y portada. */
import { z } from 'astro/zod';
import { and, desc, eq, like, or } from 'drizzle-orm';
import { db } from '@/db/client';
import { CATEGORIAS_NOTICIA, ESTADOS_NOTICIA, noticias, type Noticia } from '@/db/schema';
import { date, formValues, oneOf, parseWith, req } from '@/lib/forms';
import { deleteStored } from '@/lib/storage';
import { fail, processImageField, uniqueSlug, uploadErrorMessage, withCleanup, type SaveResult } from './common';

const schema = z.object({
  titulo: req('el título', 160),
  categoria: oneOf(CATEGORIAS_NOTICIA, 'Elegí una categoría.'),
  resumen: req('el resumen', 300),
  contenido: req('el contenido', 20000),
  fecha: date(),
  estado: oneOf(ESTADOS_NOTICIA),
});

export const listNoticiasPublicadas = (limit?: number) => {
  const q = db
    .select()
    .from(noticias)
    .where(eq(noticias.estado, 'publicada'))
    .orderBy(desc(noticias.fecha), desc(noticias.id));
  return limit ? q.limit(limit) : q;
};

export function listNoticiasAdmin(q?: string, estado?: string) {
  const conds = [];
  if (q) {
    const term = `%${q.replace(/[%_]/g, '')}%`;
    conds.push(or(like(noticias.titulo, term), like(noticias.resumen, term)));
  }
  if (estado === 'borrador' || estado === 'publicada') conds.push(eq(noticias.estado, estado));
  return db
    .select()
    .from(noticias)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(noticias.fecha), desc(noticias.id));
}

export const getNoticia = async (id: number) =>
  (await db.select().from(noticias).where(eq(noticias.id, id)).limit(1))[0] ?? null;

export const getNoticiaBySlug = async (slug: string) =>
  (await db.select().from(noticias).where(eq(noticias.slug, slug)).limit(1))[0] ?? null;

/** Párrafos del contenido (separados por una línea en blanco). */
export const parrafos = (contenido: string) =>
  contenido
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export async function saveNoticia(form: FormData, current: Noticia | null): Promise<SaveResult> {
  const values = formValues(form);
  const parsed = parseWith(schema, values);
  if (!parsed.ok) return fail(values, parsed.errors);

  let portada;
  try {
    portada = await processImageField(form, 'portada', 'noticias', current?.portada ?? null);
  } catch (err) {
    return fail(values, { portada: uploadErrorMessage(err) });
  }

  const id = await withCleanup(portada.created, async () => {
    if (current) {
      await db.update(noticias).set({ ...parsed.data, portada: portada.value }).where(eq(noticias.id, current.id));
      return current.id;
    }
    const slug = await uniqueSlug(noticias, parsed.data.titulo);
    const [row] = await db
      .insert(noticias)
      .values({ ...parsed.data, slug, portada: portada.value })
      .returning({ id: noticias.id });
    return row.id;
  });
  await deleteStored(...portada.obsolete);
  const publicada = parsed.data.estado === 'publicada';
  const message = current
    ? publicada
      ? 'Cambios guardados. La noticia está publicada.'
      : 'Cambios guardados como borrador.'
    : publicada
      ? 'Noticia publicada.'
      : 'Borrador guardado. Todavía no es visible en el sitio.';
  return { ok: true, id, message };
}

export async function setEstadoNoticia(id: number, estado: Noticia['estado']) {
  await db.update(noticias).set({ estado }).where(eq(noticias.id, id));
}

export async function deleteNoticia(id: number) {
  const n = await getNoticia(id);
  if (!n) return false;
  await db.delete(noticias).where(eq(noticias.id, id));
  await deleteStored(n.portada);
  return true;
}
