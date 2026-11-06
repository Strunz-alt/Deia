/**
 * Miembros del Centro. El cargo es institucional y no otorga ningún permiso
 * en el sitio: los administradores se gestionan en la sección Usuarios.
 */
import { z } from 'astro/zod';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { miembros, type Miembro } from '@/db/schema';
import { formValues, opt, parseWith, req } from '@/lib/forms';
import { deleteStored } from '@/lib/storage';
import { fail, nextOrden, processImageField, uploadErrorMessage, withCleanup, type SaveResult } from './common';

const schema = z.object({
  nombre: req('el nombre', 100),
  cargo: req('el cargo', 100),
  area: opt(80),
  descripcion: opt(600),
});

export const listMiembros = () => db.select().from(miembros).orderBy(asc(miembros.orden), asc(miembros.id));

export const getMiembro = async (id: number) =>
  (await db.select().from(miembros).where(eq(miembros.id, id)).limit(1))[0] ?? null;

export async function saveMiembro(form: FormData, current: Miembro | null): Promise<SaveResult> {
  const values = formValues(form);
  const parsed = parseWith(schema, values);
  if (!parsed.ok) return fail(values, parsed.errors);

  let foto;
  try {
    foto = await processImageField(form, 'foto', 'miembros', current?.foto ?? null);
  } catch (err) {
    return fail(values, { foto: uploadErrorMessage(err) });
  }

  const id = await withCleanup(foto.created, async () => {
    if (current) {
      await db.update(miembros).set({ ...parsed.data, foto: foto.value }).where(eq(miembros.id, current.id));
      return current.id;
    }
    const [row] = await db
      .insert(miembros)
      .values({ ...parsed.data, foto: foto.value, orden: await nextOrden(miembros) })
      .returning({ id: miembros.id });
    return row.id;
  });
  await deleteStored(...foto.obsolete);
  return { ok: true, id, message: current ? 'Integrante actualizado.' : 'Integrante agregado.' };
}

export async function deleteMiembro(id: number) {
  const m = await getMiembro(id);
  if (!m) return false;
  await db.delete(miembros).where(eq(miembros.id, id));
  await deleteStored(m.foto);
  return true;
}
