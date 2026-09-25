/** Utilidades compartidas por los servicios de contenido. */
import { and, eq, max, ne, sql, type SQL } from 'drizzle-orm';
import type { SQLiteColumn, SQLiteTable } from 'drizzle-orm/sqlite-core';
import { db } from '@/db/client';
import type { FieldErrors, FormValues } from '@/lib/forms';
import { slugify } from '@/lib/format';
import { deleteStored, hasFile, saveImage, UploadError, type PublicFolder } from '@/lib/storage';

export type SaveResult = { ok: true; id: number; message: string } | { ok: false; errors: FieldErrors; values: FormValues };

export const fail = (values: FormValues, errors: FieldErrors): SaveResult => ({ ok: false, errors, values });

/** Genera un slug único para la tabla (agrega -2, -3… si hace falta). */
export async function uniqueSlug(
  table: SQLiteTable & { slug: SQLiteColumn; id: SQLiteColumn },
  text: string,
  excludeId?: number,
) {
  const base = slugify(text).slice(0, 80) || 'publicacion';
  let slug = base;
  for (let i = 2; ; i++) {
    const cond: SQL = excludeId ? and(eq(table.slug, slug), ne(table.id, excludeId))! : eq(table.slug, slug);
    const [row] = await db.select({ id: table.id }).from(table).where(cond).limit(1);
    if (!row) return slug;
    slug = `${base}-${i}`;
  }
}

/** Siguiente valor de `orden` (al final de la lista). */
export async function nextOrden(table: SQLiteTable & { orden: SQLiteColumn }) {
  const [row] = await db.select({ value: max(table.orden) }).from(table);
  return (Number(row?.value) || 0) + 1;
}

/**
 * Intercambia el orden de un elemento con su vecino (arriba o abajo).
 * Normaliza antes los valores para que no haya repetidos.
 */
export async function moveOrden(
  table: SQLiteTable & { orden: SQLiteColumn; id: SQLiteColumn },
  id: number,
  direction: 'up' | 'down',
) {
  const rows = (await db
    .select({ id: table.id, orden: table.orden })
    .from(table)
    .orderBy(table.orden, table.id)) as { id: number; orden: number }[];
  const index = rows.findIndex((r) => r.id === id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= rows.length) return false;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  await db.transaction(async (tx) => {
    for (const [i, row] of rows.entries()) {
      await tx.update(table).set({ orden: i + 1 } as never).where(eq(table.id, row.id));
    }
  });
  return true;
}

/**
 * Procesa un campo de imagen única: nueva imagen, quitar la actual o dejarla.
 * Devuelve el valor final y los archivos a borrar si el guardado sale bien.
 */
export async function processImageField(form: FormData, field: string, folder: PublicFolder, current: string | null) {
  const file = form.get(field);
  const remove = form.get(`${field}_quitar`) === 'on';
  if (hasFile(file)) {
    const stored = await saveImage(file, folder);
    return { value: stored.key, created: [stored.key], obsolete: current ? [current] : [] };
  }
  if (remove && current) return { value: null, created: [] as string[], obsolete: [current] };
  return { value: current, created: [] as string[], obsolete: [] as string[] };
}

/** Guarda varias imágenes nuevas de un campo `multiple`. */
export async function saveImageList(form: FormData, field: string, folder: PublicFolder, maxTotal: number, existing = 0) {
  const files = form.getAll(field).filter(hasFile);
  if (existing + files.length > maxTotal) {
    throw new UploadError(`Se pueden cargar hasta ${maxTotal} imágenes (ya hay ${existing}).`);
  }
  const created: string[] = [];
  try {
    for (const f of files) created.push((await saveImage(f, folder)).key);
  } catch (err) {
    await deleteStored(...created);
    throw err;
  }
  return created;
}

/** Ids marcados para quitar en un campo de lista de imágenes. */
export const idsToRemove = (form: FormData, field = 'quitar_imagen') =>
  form
    .getAll(field)
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0);

/** Ejecuta el guardado y, si falla, borra los archivos recién subidos. */
export async function withCleanup<T>(created: string[], fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (err) {
    await deleteStored(...created);
    throw err;
  }
}

export const uploadErrorMessage = (err: unknown) =>
  err instanceof UploadError ? err.message : 'No se pudo guardar el archivo. Intentá nuevamente.';

export const countWhere = async (table: SQLiteTable, where: SQL) => {
  const [row] = await db.select({ n: sql<number>`count(*)` }).from(table).where(where);
  return Number(row?.n ?? 0);
};
