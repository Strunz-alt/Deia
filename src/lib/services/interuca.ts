/** Historial de participaciones y resultados en las INTERUCA. */
import { z } from 'astro/zod';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { interuca, interucaFotos, RAMAS, RESULTADOS_INTERUCA, type ParticipacionInteruca, type ResultadoInteruca } from '@/db/schema';
import { checkbox, formValues, intIn, oneOf, opt, parseWith, req } from '@/lib/forms';
import { deleteStored } from '@/lib/storage';
import { fail, idsToRemove, saveImageList, uploadErrorMessage, withCleanup, type SaveResult } from './common';

export const MAX_FOTOS_INTERUCA = 10;

export const RESULTADO_LABEL: Record<ResultadoInteruca, string> = {
  campeon: 'Campeón',
  subcampeon: 'Subcampeón',
  tercero: 'Tercer puesto',
  participacion: 'Participación',
};

/** Orden de importancia para mostrar primero los mejores resultados. */
export const RESULTADO_RANK: Record<ResultadoInteruca, number> = { campeon: 1, subcampeon: 2, tercero: 3, participacion: 4 };

const emptyToUndef = (v: unknown) => (v === '' ? undefined : v);

const schema = z.object({
  anio: intIn('El año', 1990, new Date().getFullYear() + 1),
  disciplina: req('la disciplina', 80),
  rama: z.preprocess(emptyToUndef, oneOf(RAMAS).optional()).transform((v) => v ?? null),
  equipo: opt(300),
  resultado: oneOf(RESULTADOS_INTERUCA, 'Elegí el resultado.'),
  resultadoDetalle: opt(120),
  descripcion: opt(3000),
  destacado: checkbox(),
});

export type Participacion = ParticipacionInteruca & { fotos: { id: number; archivo: string }[] };

async function withFotos(rows: ParticipacionInteruca[]): Promise<Participacion[]> {
  if (!rows.length) return [];
  const fotos = await db
    .select()
    .from(interucaFotos)
    .where(inArray(interucaFotos.participacionId, rows.map((r) => r.id)))
    .orderBy(asc(interucaFotos.orden), asc(interucaFotos.id));
  return rows.map((r) => ({ ...r, fotos: fotos.filter((f) => f.participacionId === r.id) }));
}

const rankSql = sql`case ${interuca.resultado} when 'campeon' then 1 when 'subcampeon' then 2 when 'tercero' then 3 else 4 end`;

export const listInteruca = async () =>
  withFotos(await db.select().from(interuca).orderBy(desc(interuca.anio), rankSql, asc(interuca.disciplina)));

export const getParticipacion = async (id: number) => {
  const [row] = await db.select().from(interuca).where(eq(interuca.id, id)).limit(1);
  return row ? (await withFotos([row]))[0] : null;
};

export const listDisciplinasInteruca = async () =>
  (await db.selectDistinct({ d: interuca.disciplina }).from(interuca).orderBy(asc(interuca.disciplina))).map((r) => r.d);

export async function resumenInteruca() {
  const rows = await db
    .select({ resultado: interuca.resultado, n: sql<number>`count(*)` })
    .from(interuca)
    .groupBy(interuca.resultado);
  const [ed] = await db.select({ n: sql<number>`count(distinct ${interuca.anio})` }).from(interuca);
  const get = (r: ResultadoInteruca) => Number(rows.find((x) => x.resultado === r)?.n ?? 0);
  return {
    campeonatos: get('campeon'),
    subcampeonatos: get('subcampeon'),
    terceros: get('tercero'),
    participaciones: rows.reduce((a, r) => a + Number(r.n), 0),
    ediciones: Number(ed?.n ?? 0),
  };
}

export async function saveParticipacion(form: FormData, current: Participacion | null): Promise<SaveResult> {
  const values = formValues(form);
  const parsed = parseWith(schema, values);
  if (!parsed.ok) return fail(values, parsed.errors);

  const quitar = idsToRemove(form).filter((id) => current?.fotos.some((f) => f.id === id));
  const quedan = (current?.fotos.length ?? 0) - quitar.length;
  let created: string[];
  try {
    created = await saveImageList(form, 'fotos', 'interuca', MAX_FOTOS_INTERUCA, quedan);
  } catch (err) {
    return fail(values, { fotos: uploadErrorMessage(err) });
  }

  const obsolete = current?.fotos.filter((f) => quitar.includes(f.id)).map((f) => f.archivo) ?? [];
  const id = await withCleanup(created, () =>
    db.transaction(async (tx) => {
      let pid: number;
      if (current) {
        await tx.update(interuca).set(parsed.data).where(eq(interuca.id, current.id));
        pid = current.id;
        if (quitar.length) {
          await tx.delete(interucaFotos).where(and(eq(interucaFotos.participacionId, pid), inArray(interucaFotos.id, quitar)));
        }
      } else {
        const [row] = await tx.insert(interuca).values(parsed.data).returning({ id: interuca.id });
        pid = row.id;
      }
      const base = current?.fotos.length ?? 0;
      for (const [i, archivo] of created.entries()) {
        await tx.insert(interucaFotos).values({ participacionId: pid, archivo, orden: base + i + 1 });
      }
      return pid;
    }),
  );
  await deleteStored(...obsolete);
  return { ok: true, id, message: current ? 'Resultado actualizado.' : 'Resultado agregado al historial.' };
}

export async function deleteParticipacion(id: number) {
  const p = await getParticipacion(id);
  if (!p) return false;
  await db.transaction(async (tx) => {
    await tx.delete(interucaFotos).where(eq(interucaFotos.participacionId, id));
    await tx.delete(interuca).where(eq(interuca.id, id));
  });
  await deleteStored(...p.fotos.map((f) => f.archivo));
  return true;
}
