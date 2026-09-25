/**
 * Materias, cátedras y materiales de estudio.
 * Las eliminaciones resuelven primero las relaciones para no dejar registros
 * ni archivos huérfanos.
 */
import { z } from 'astro/zod';
import { and, asc, eq, inArray, isNull, like, ne, or, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { catedras, materiales, materias, TIPOS_MATERIAL, type Materia } from '@/db/schema';
import { date, formValues, opt, optIdRef, optIntIn, parseWith, req, idRef, oneOf } from '@/lib/forms';
import { deleteStored, hasFile, saveDocument } from '@/lib/storage';
import { countWhere, fail, processImageField, uniqueSlug, uploadErrorMessage, withCleanup, type SaveResult } from './common';

/** Compara nombres sin distinguir mayúsculas, tildes ni espacios extra. */
const ci = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/* ====================== Materias ====================== */

const materiaSchema = z.object({
  nombre: req('el nombre de la materia', 120),
  anio: optIntIn('El año', 1, 6),
  descripcion: opt(600),
});

export async function listMaterias() {
  return db
    .select({
      id: materias.id,
      nombre: materias.nombre,
      slug: materias.slug,
      anio: materias.anio,
      descripcion: materias.descripcion,
      imagen: materias.imagen,
      catedras: sql<number>`(select count(*) from ${catedras} where ${catedras.materiaId} = ${materias.id})`,
      materiales: sql<number>`(select count(*) from ${materiales} where ${materiales.materiaId} = ${materias.id})`,
    })
    .from(materias)
    .orderBy(sql`coalesce(${materias.anio}, 99)`, asc(materias.nombre));
}

export const getMateria = async (id: number) =>
  (await db.select().from(materias).where(eq(materias.id, id)).limit(1))[0] ?? null;

export async function saveMateria(form: FormData, current: Materia | null): Promise<SaveResult> {
  const values = formValues(form);
  const parsed = parseWith(materiaSchema, values);
  if (!parsed.ok) return fail(values, parsed.errors);
  const data = parsed.data;

  const existentes = await db
    .select({ id: materias.id, nombre: materias.nombre })
    .from(materias)
    .where(current ? ne(materias.id, current.id) : undefined);
  if (existentes.some((m) => ci(m.nombre) === ci(data.nombre))) {
    return fail(values, { nombre: 'Ya existe una materia con ese nombre.' });
  }

  let image;
  try {
    image = await processImageField(form, 'imagen', 'materias', current?.imagen ?? null);
  } catch (err) {
    return fail(values, { imagen: uploadErrorMessage(err) });
  }

  const slug = await uniqueSlug(materias, data.nombre, current?.id);
  const id = await withCleanup(image.created, async () => {
    if (current) {
      await db.update(materias).set({ ...data, slug, imagen: image.value }).where(eq(materias.id, current.id));
      return current.id;
    }
    const [row] = await db.insert(materias).values({ ...data, slug, imagen: image.value }).returning({ id: materias.id });
    return row.id;
  });
  await deleteStored(...image.obsolete);
  return { ok: true, id, message: current ? 'Materia actualizada.' : 'Materia creada.' };
}

export async function materiaRelations(id: number) {
  const [nCatedras, nMateriales] = await Promise.all([
    countWhere(catedras, eq(catedras.materiaId, id)),
    countWhere(materiales, eq(materiales.materiaId, id)),
  ]);
  return { catedras: nCatedras, materiales: nMateriales };
}

/**
 * Elimina una materia.
 * - `mover`: traslada cátedras y materiales a otra materia (fusiona cátedras con el mismo nombre).
 * - `eliminar`: borra también cátedras, materiales y sus archivos.
 */
export async function deleteMateria(id: number, mode: 'mover' | 'eliminar', destinoId?: number | null) {
  const materia = await getMateria(id);
  if (!materia) return { ok: false as const, error: 'La materia no existe.' };
  const filesToDelete: string[] = materia.imagen ? [materia.imagen] : [];

  if (mode === 'mover') {
    if (!destinoId || destinoId === id || !(await getMateria(destinoId))) {
      return { ok: false as const, error: 'Elegí la materia a la que se van a mover los contenidos.' };
    }
    await db.transaction(async (tx) => {
      const origen = await tx.select().from(catedras).where(eq(catedras.materiaId, id));
      const destino = await tx.select().from(catedras).where(eq(catedras.materiaId, destinoId));
      for (const cat of origen) {
        const igual = destino.find((d) => ci(d.nombre) === ci(cat.nombre));
        if (igual) {
          await tx.update(materiales).set({ catedraId: igual.id }).where(eq(materiales.catedraId, cat.id));
          await tx.delete(catedras).where(eq(catedras.id, cat.id));
        } else {
          await tx.update(catedras).set({ materiaId: destinoId }).where(eq(catedras.id, cat.id));
        }
      }
      await tx.update(materiales).set({ materiaId: destinoId }).where(eq(materiales.materiaId, id));
      await tx.delete(materias).where(eq(materias.id, id));
    });
  } else {
    await db.transaction(async (tx) => {
      const mats = await tx.select({ archivo: materiales.archivo }).from(materiales).where(eq(materiales.materiaId, id));
      filesToDelete.push(...mats.map((m) => m.archivo));
      await tx.delete(materiales).where(eq(materiales.materiaId, id));
      await tx.delete(catedras).where(eq(catedras.materiaId, id));
      await tx.delete(materias).where(eq(materias.id, id));
    });
  }
  await deleteStored(...filesToDelete);
  return { ok: true as const, nombre: materia.nombre };
}

/* ====================== Cátedras ====================== */

const catedraSchema = z.object({
  nombre: req('el nombre de la cátedra', 120),
  detalle: opt(200),
});

export async function listCatedras(materiaId: number) {
  return db
    .select({
      id: catedras.id,
      nombre: catedras.nombre,
      detalle: catedras.detalle,
      materiaId: catedras.materiaId,
      materiales: sql<number>`(select count(*) from ${materiales} where ${materiales.catedraId} = ${catedras.id})`,
    })
    .from(catedras)
    .where(eq(catedras.materiaId, materiaId))
    .orderBy(asc(catedras.nombre));
}

export async function listAllCatedras() {
  return db
    .select({ id: catedras.id, nombre: catedras.nombre, materiaId: catedras.materiaId })
    .from(catedras)
    .orderBy(asc(catedras.nombre));
}

export const getCatedra = async (id: number) =>
  (await db.select().from(catedras).where(eq(catedras.id, id)).limit(1))[0] ?? null;

export async function saveCatedra(form: FormData, materiaId: number, currentId: number | null): Promise<SaveResult> {
  const values = formValues(form);
  const parsed = parseWith(catedraSchema, values);
  if (!parsed.ok) return fail(values, parsed.errors);
  const hermanas = await db
    .select({ id: catedras.id, nombre: catedras.nombre })
    .from(catedras)
    .where(and(eq(catedras.materiaId, materiaId), currentId ? ne(catedras.id, currentId) : undefined));
  if (hermanas.some((c) => ci(c.nombre) === ci(parsed.data.nombre))) {
    return fail(values, { nombre: 'Esta materia ya tiene una cátedra con ese nombre.' });
  }

  if (currentId) {
    await db.update(catedras).set(parsed.data).where(and(eq(catedras.id, currentId), eq(catedras.materiaId, materiaId)));
    return { ok: true, id: currentId, message: 'Cátedra actualizada.' };
  }
  const [row] = await db.insert(catedras).values({ ...parsed.data, materiaId }).returning({ id: catedras.id });
  return { ok: true, id: row.id, message: 'Cátedra creada.' };
}

/**
 * Elimina una cátedra.
 * - `mover`: pasa sus materiales a otra cátedra de la misma materia.
 * - `general`: deja sus materiales como generales de la materia (sin cátedra).
 * - `eliminar`: borra también sus materiales y archivos.
 */
export async function deleteCatedra(id: number, mode: 'mover' | 'general' | 'eliminar', destinoId?: number | null) {
  const cat = await getCatedra(id);
  if (!cat) return { ok: false as const, error: 'La cátedra no existe.' };
  const files: string[] = [];

  if (mode === 'mover') {
    const destino = destinoId ? await getCatedra(destinoId) : null;
    if (!destino || destino.id === id || destino.materiaId !== cat.materiaId) {
      return { ok: false as const, error: 'Elegí otra cátedra de la misma materia.' };
    }
  }

  await db.transaction(async (tx) => {
    if (mode === 'mover') {
      await tx.update(materiales).set({ catedraId: destinoId! }).where(eq(materiales.catedraId, id));
    } else if (mode === 'general') {
      await tx.update(materiales).set({ catedraId: null }).where(eq(materiales.catedraId, id));
    } else {
      const mats = await tx.select({ archivo: materiales.archivo }).from(materiales).where(eq(materiales.catedraId, id));
      files.push(...mats.map((m) => m.archivo));
      await tx.delete(materiales).where(eq(materiales.catedraId, id));
    }
    await tx.delete(catedras).where(eq(catedras.id, id));
  });
  await deleteStored(...files);
  return { ok: true as const, nombre: cat.nombre, materiaId: cat.materiaId };
}

/* ====================== Materiales ====================== */

const materialSchema = z.object({
  titulo: req('el título', 160),
  descripcion: opt(1000),
  tipo: oneOf(TIPOS_MATERIAL, 'Elegí el tipo de material.'),
  materiaId: idRef('Elegí la materia.'),
  catedraId: optIdRef(),
  fecha: date(),
});

export interface MaterialFilters {
  q?: string;
  materiaId?: number | null;
  catedraId?: number | null;
}

export async function listMateriales(filters: MaterialFilters = {}) {
  const conds = [];
  if (filters.materiaId) conds.push(eq(materiales.materiaId, filters.materiaId));
  if (filters.catedraId === -1) conds.push(isNull(materiales.catedraId));
  else if (filters.catedraId) conds.push(eq(materiales.catedraId, filters.catedraId));
  if (filters.q) {
    const term = `%${filters.q.replace(/[%_]/g, '')}%`;
    conds.push(or(like(materiales.titulo, term), like(materiales.descripcion, term)));
  }
  return db
    .select({
      id: materiales.id,
      titulo: materiales.titulo,
      descripcion: materiales.descripcion,
      tipo: materiales.tipo,
      fecha: materiales.fecha,
      archivoNombre: materiales.archivoNombre,
      archivoTipo: materiales.archivoTipo,
      archivoTamano: materiales.archivoTamano,
      materiaId: materiales.materiaId,
      materia: materias.nombre,
      anio: materias.anio,
      catedraId: materiales.catedraId,
      catedra: catedras.nombre,
      actualizadoEn: materiales.actualizadoEn,
    })
    .from(materiales)
    .innerJoin(materias, eq(materiales.materiaId, materias.id))
    .leftJoin(catedras, eq(materiales.catedraId, catedras.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(sql`${materiales.fecha} desc`, sql`${materiales.id} desc`);
}

export const getMaterial = async (id: number) =>
  (await db.select().from(materiales).where(eq(materiales.id, id)).limit(1))[0] ?? null;

export async function saveMaterial(
  form: FormData,
  current: typeof materiales.$inferSelect | null,
  userId: number,
): Promise<SaveResult> {
  const values = formValues(form);
  const parsed = parseWith(materialSchema, values);
  if (!parsed.ok) return fail(values, parsed.errors);
  const data = parsed.data;

  if (!(await getMateria(data.materiaId))) return fail(values, { materiaId: 'La materia elegida no existe.' });
  if (data.catedraId) {
    const cat = await getCatedra(data.catedraId);
    if (!cat || cat.materiaId !== data.materiaId) {
      return fail(values, { catedraId: 'La cátedra elegida no pertenece a esa materia.' });
    }
  }

  const file = form.get('archivo');
  if (!current && !hasFile(file)) return fail(values, { archivo: 'Seleccioná el archivo del material.' });

  let stored = null;
  if (hasFile(file)) {
    try {
      stored = await saveDocument(file);
    } catch (err) {
      return fail(values, { archivo: uploadErrorMessage(err) });
    }
  }

  const fileData = stored
    ? { archivo: stored.key, archivoNombre: stored.nombre, archivoTipo: stored.tipo, archivoTamano: stored.tamano }
    : {};

  const id = await withCleanup(stored ? [stored.key] : [], async () => {
    if (current) {
      await db.update(materiales).set({ ...data, ...fileData }).where(eq(materiales.id, current.id));
      return current.id;
    }
    const [row] = await db
      .insert(materiales)
      .values({ ...data, ...(fileData as Required<typeof fileData>), creadoPor: userId })
      .returning({ id: materiales.id });
    return row.id;
  });
  if (stored && current) await deleteStored(current.archivo);
  return { ok: true, id, message: current ? 'Material actualizado.' : 'Material publicado.' };
}

export async function deleteMaterial(id: number) {
  const mat = await getMaterial(id);
  if (!mat) return false;
  await db.delete(materiales).where(eq(materiales.id, id));
  await deleteStored(mat.archivo);
  return true;
}

export async function deleteMateriales(ids: number[]) {
  if (!ids.length) return 0;
  const rows = await db.select({ id: materiales.id, archivo: materiales.archivo }).from(materiales).where(inArray(materiales.id, ids));
  await db.delete(materiales).where(inArray(materiales.id, rows.map((r) => r.id)));
  await deleteStored(...rows.map((r) => r.archivo));
  return rows.length;
}
