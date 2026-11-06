/** Logros del Centro, con imágenes, destacados y orden manual. */
import { z } from 'astro/zod';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db/client';
import { logroImagenes, logros, type Logro } from '@/db/schema';
import { checkbox, date, formValues, opt, parseWith, req } from '@/lib/forms';
import { deleteStored } from '@/lib/storage';
import { fail, idsToRemove, nextOrden, saveImageList, uploadErrorMessage, withCleanup, type SaveResult } from './common';

export const MAX_IMAGENES_LOGRO = 8;

const schema = z.object({
  titulo: req('el título', 160),
  descripcion: req('la descripción', 3000),
  fecha: date(),
  area: opt(80),
  destacado: checkbox(),
});

export type LogroConImagenes = Logro & { imagenes: { id: number; archivo: string }[] };

async function withImages(rows: Logro[]): Promise<LogroConImagenes[]> {
  if (!rows.length) return [];
  const imgs = await db
    .select()
    .from(logroImagenes)
    .where(inArray(logroImagenes.logroId, rows.map((r) => r.id)))
    .orderBy(asc(logroImagenes.orden), asc(logroImagenes.id));
  return rows.map((r) => ({ ...r, imagenes: imgs.filter((i) => i.logroId === r.id) }));
}

/** Orden manual del panel; a igual orden, los más recientes primero. */
export const listLogros = async () =>
  withImages(await db.select().from(logros).orderBy(asc(logros.orden), desc(logros.fecha)));

export const listLogrosDestacados = async (limit = 3) =>
  withImages(
    await db.select().from(logros).where(eq(logros.destacado, true)).orderBy(asc(logros.orden), desc(logros.fecha)).limit(limit),
  );

export async function getLogro(id: number) {
  const [row] = await db.select().from(logros).where(eq(logros.id, id)).limit(1);
  return row ? (await withImages([row]))[0] : null;
}

export async function saveLogro(form: FormData, current: LogroConImagenes | null): Promise<SaveResult> {
  const values = formValues(form);
  const parsed = parseWith(schema, values);
  if (!parsed.ok) return fail(values, parsed.errors);

  const quitar = idsToRemove(form).filter((id) => current?.imagenes.some((i) => i.id === id));
  const quedan = (current?.imagenes.length ?? 0) - quitar.length;
  let created: string[];
  try {
    created = await saveImageList(form, 'imagenes', 'logros', MAX_IMAGENES_LOGRO, quedan);
  } catch (err) {
    return fail(values, { imagenes: uploadErrorMessage(err) });
  }

  const obsolete = current?.imagenes.filter((i) => quitar.includes(i.id)).map((i) => i.archivo) ?? [];
  const id = await withCleanup(created, () =>
    db.transaction(async (tx) => {
      let logroId: number;
      if (current) {
        await tx.update(logros).set(parsed.data).where(eq(logros.id, current.id));
        logroId = current.id;
        if (quitar.length) {
          await tx.delete(logroImagenes).where(and(eq(logroImagenes.logroId, logroId), inArray(logroImagenes.id, quitar)));
        }
      } else {
        const [row] = await tx
          .insert(logros)
          .values({ ...parsed.data, orden: await nextOrden(logros) })
          .returning({ id: logros.id });
        logroId = row.id;
      }
      const base = current?.imagenes.length ?? 0;
      for (const [i, archivo] of created.entries()) {
        await tx.insert(logroImagenes).values({ logroId, archivo, orden: base + i + 1 });
      }
      return logroId;
    }),
  );
  await deleteStored(...obsolete);
  return { ok: true, id, message: current ? 'Logro actualizado.' : 'Logro creado.' };
}

export async function toggleDestacadoLogro(id: number) {
  const l = await getLogro(id);
  if (!l) return null;
  await db.update(logros).set({ destacado: !l.destacado }).where(eq(logros.id, id));
  return !l.destacado;
}

export async function deleteLogro(id: number) {
  const l = await getLogro(id);
  if (!l) return false;
  await db.transaction(async (tx) => {
    await tx.delete(logroImagenes).where(eq(logroImagenes.logroId, id));
    await tx.delete(logros).where(eq(logros.id, id));
  });
  await deleteStored(...l.imagenes.map((i) => i.archivo));
  return true;
}
