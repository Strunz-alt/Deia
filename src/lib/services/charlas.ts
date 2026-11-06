/** Charlas, jornadas y encuentros. */
import { z } from 'astro/zod';
import { asc, desc, eq, gte, lt } from 'drizzle-orm';
import { db } from '@/db/client';
import { charlas, MODALIDADES, TIPOS_CHARLA, type Charla, type Orador } from '@/db/schema';
import { date, formValues, oneOf, opt, optTime, optUrl, parseWith, req, todayISO } from '@/lib/forms';
import { deleteStored } from '@/lib/storage';
import { fail, processImageField, uniqueSlug, uploadErrorMessage, withCleanup, type SaveResult } from './common';

export const MAX_ORADORES = 12;

const schema = z.object({
  titulo: req('el título', 160),
  tipo: oneOf(TIPOS_CHARLA, 'Elegí el formato.'),
  tematica: opt(100),
  descripcion: req('la descripción', 5000),
  fecha: date(),
  hora: optTime(),
  lugar: req('el lugar o el enlace de la transmisión', 160),
  modalidad: oneOf(MODALIDADES, 'Elegí la modalidad.'),
  inscripcionUrl: optUrl(),
});

export const estadoCharla = (fecha: string) => (fecha >= todayISO() ? 'proxima' : 'realizada');

export const listCharlas = () => db.select().from(charlas).orderBy(desc(charlas.fecha), desc(charlas.id));

export const listProximasCharlas = (limit?: number) => {
  const q = db.select().from(charlas).where(gte(charlas.fecha, todayISO())).orderBy(asc(charlas.fecha), asc(charlas.hora));
  return limit ? q.limit(limit) : q;
};

export const listCharlasRealizadas = () =>
  db.select().from(charlas).where(lt(charlas.fecha, todayISO())).orderBy(desc(charlas.fecha));

export const getCharla = async (id: number) =>
  (await db.select().from(charlas).where(eq(charlas.id, id)).limit(1))[0] ?? null;

export const getCharlaBySlug = async (slug: string) =>
  (await db.select().from(charlas).where(eq(charlas.slug, slug)).limit(1))[0] ?? null;

/** Lee las filas repetibles de oradores (orador_nombre[] / orador_rol[]). */
function parseOradores(form: FormData): { oradores: Orador[]; error?: string } {
  const nombres = form.getAll('orador_nombre').map((v) => String(v).trim());
  const roles = form.getAll('orador_rol').map((v) => String(v).trim());
  const oradores: Orador[] = [];
  for (let i = 0; i < nombres.length; i++) {
    if (!nombres[i] && !roles[i]) continue;
    if (!nombres[i]) return { oradores, error: 'Completá el nombre de cada orador (o quitá la fila vacía).' };
    if (nombres[i].length > 100 || (roles[i] ?? '').length > 120) return { oradores, error: 'Nombre o rol demasiado largo.' };
    oradores.push({ nombre: nombres[i], rol: roles[i] ?? '' });
  }
  if (oradores.length > MAX_ORADORES) return { oradores, error: `Se pueden cargar hasta ${MAX_ORADORES} oradores.` };
  return { oradores };
}

export async function saveCharla(form: FormData, current: Charla | null): Promise<SaveResult & { oradores?: Orador[] }> {
  const values = formValues(form);
  const parsed = parseWith(schema, values);
  const { oradores, error: oradoresError } = parseOradores(form);
  if (!parsed.ok || oradoresError) {
    const errors = parsed.ok ? {} : parsed.errors;
    if (oradoresError) errors.oradores = oradoresError;
    return { ...fail(values, errors), oradores };
  }

  let imagen;
  try {
    imagen = await processImageField(form, 'imagen', 'charlas', current?.imagen ?? null);
  } catch (err) {
    return { ...fail(values, { imagen: uploadErrorMessage(err) }), oradores };
  }

  const data = { ...parsed.data, oradores, imagen: imagen.value };
  const id = await withCleanup(imagen.created, async () => {
    if (current) {
      await db.update(charlas).set(data).where(eq(charlas.id, current.id));
      return current.id;
    }
    const slug = await uniqueSlug(charlas, parsed.data.titulo);
    const [row] = await db.insert(charlas).values({ ...data, slug }).returning({ id: charlas.id });
    return row.id;
  });
  await deleteStored(...imagen.obsolete);
  return { ok: true, id, message: current ? 'Charla actualizada.' : 'Charla creada.' };
}

export async function deleteCharla(id: number) {
  const c = await getCharla(id);
  if (!c) return false;
  await db.delete(charlas).where(eq(charlas.id, id));
  await deleteStored(c.imagen);
  return true;
}
