/**
 * Carga contenido de DEMOSTRACIÓN para recorrer el sitio y el panel.
 * Todo lo que crea queda marcado con el prefijo «Ejemplo ·» (o una descripción
 * equivalente) y NO representa información real del Centro.
 *
 *   npm run db:demo              Carga el contenido de ejemplo
 *   npm run db:demo -- --quitar  Elimina todo el contenido de ejemplo (y sus archivos)
 */
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { eq, inArray, like } from 'drizzle-orm';
import { client, db, ensureDb } from '../src/db/client.ts';
import {
  catedras,
  charlas,
  interuca,
  interucaFotos,
  logroImagenes,
  logros,
  materiales,
  materias,
  miembros,
  noticias,
} from '../src/db/schema.ts';

const P = 'Ejemplo · ';
const MARCA_MATERIA = 'Materia cargada como ejemplo.';
const UPLOADS = path.resolve(process.env.UPLOADS_DIR || 'data/uploads');

const { values: args } = parseArgs({ options: { quitar: { type: 'boolean', default: false } } });

await ensureDb();

const removeFiles = (keys: string[]) => Promise.all(keys.map((k) => fs.rm(path.join(UPLOADS, k), { force: true })));

if (args.quitar) {
  const mats = await db.select().from(materiales).where(like(materiales.titulo, `${P}%`));
  await db.delete(materiales).where(inArray(materiales.id, mats.map((m) => m.id)));
  const demoMaterias = await db.select().from(materias).where(eq(materias.descripcion, MARCA_MATERIA));
  let materiasQuitadas = 0;
  for (const m of demoMaterias) {
    const quedan = await db.select({ id: materiales.id }).from(materiales).where(eq(materiales.materiaId, m.id)).limit(1);
    if (quedan.length) continue; // tiene material real: se conserva
    await db.delete(catedras).where(eq(catedras.materiaId, m.id));
    await db.delete(materias).where(eq(materias.id, m.id));
    materiasQuitadas++;
  }
  const logs = await db.select().from(logros).where(like(logros.titulo, `${P}%`));
  const logImgs = logs.length ? await db.select().from(logroImagenes).where(inArray(logroImagenes.logroId, logs.map((l) => l.id))) : [];
  await db.delete(logroImagenes).where(inArray(logroImagenes.logroId, logs.map((l) => l.id)));
  await db.delete(logros).where(inArray(logros.id, logs.map((l) => l.id)));
  const iu = await db.select().from(interuca).where(like(interuca.equipo, `${P}%`));
  const iuFotos = iu.length ? await db.select().from(interucaFotos).where(inArray(interucaFotos.participacionId, iu.map((p) => p.id))) : [];
  await db.delete(interucaFotos).where(inArray(interucaFotos.participacionId, iu.map((p) => p.id)));
  await db.delete(interuca).where(inArray(interuca.id, iu.map((p) => p.id)));
  const ch = await db.delete(charlas).where(like(charlas.titulo, `${P}%`)).returning();
  const no = await db.delete(noticias).where(like(noticias.titulo, `${P}%`)).returning();
  const mi = await db.delete(miembros).where(like(miembros.nombre, `${P}%`)).returning();
  await removeFiles([
    ...mats.map((m) => m.archivo),
    ...logImgs.map((i) => i.archivo),
    ...iuFotos.map((f) => f.archivo),
    ...ch.flatMap((c) => (c.imagen ? [c.imagen] : [])),
    ...no.flatMap((n) => (n.portada ? [n.portada] : [])),
    ...mi.flatMap((m) => (m.foto ? [m.foto] : [])),
  ]);
  console.log(
    `✔ Contenido de ejemplo eliminado: ${mats.length} materiales, ${materiasQuitadas} materias, ${ch.length} charlas, ${no.length} noticias, ${logs.length} logros, ${iu.length} resultados INTERUCA, ${mi.length} miembros.`,
  );
  client.close();
  process.exit(0);
}

const [ya] = await db.select({ id: materiales.id }).from(materiales).where(like(materiales.titulo, `${P}%`)).limit(1);
if (ya) {
  console.log('ℹ El contenido de ejemplo ya está cargado. Para quitarlo: npm run db:demo -- --quitar');
  client.close();
  process.exit(0);
}

/* ---------- PDF mínimo de ejemplo ---------- */

function pdf(title: string, subtitle: string) {
  const esc = (s: string) => s.replace(/[\\()]/g, (c) => `\\${c}`);
  const text = `BT /F1 22 Tf 72 760 Td (${esc(title)}) Tj ET\nBT /F1 12 Tf 72 730 Td (${esc(subtitle)}) Tj ET\nBT /F1 11 Tf 72 700 Td (Archivo de ejemplo generado para probar la biblioteca del Centro.) Tj ET`;
  const objs = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>',
    `<</Length ${Buffer.byteLength(text, 'latin1')}>>\nstream\n${text}\nendstream`,
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>',
  ];
  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out, 'latin1'));
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out, 'latin1');
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

async function savePdf(title: string, subtitle: string) {
  const buf = pdf(title, subtitle);
  const key = `materiales/${randomUUID()}.pdf`;
  await fs.mkdir(path.join(UPLOADS, 'materiales'), { recursive: true });
  await fs.writeFile(path.join(UPLOADS, key), buf);
  return { key, size: buf.length };
}

const hoy = new Date();
const diaISO = (offsetDays: number) => {
  const d = new Date(hoy.getTime() + offsetDays * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(d);
};
const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ---------- Materias, cátedras y materiales ---------- */

const catalogo: [string, number][] = [
  ['Introducción al Derecho', 1],
  ['Derecho Romano', 1],
  ['Derecho Constitucional', 2],
  ['Derecho Civil: Parte General', 2],
  ['Derecho Penal: Parte General', 2],
  ['Obligaciones', 3],
  ['Contratos', 4],
  ['Derecho Procesal Civil', 4],
];

const materiaIds = new Map<string, number>();
for (const [nombre, anio] of catalogo) {
  const [existing] = await db.select().from(materias).where(eq(materias.nombre, nombre)).limit(1);
  if (existing) {
    materiaIds.set(nombre, existing.id);
    continue;
  }
  const [m] = await db.insert(materias).values({ nombre, slug: slug(nombre), anio, descripcion: MARCA_MATERIA }).returning();
  materiaIds.set(nombre, m.id);
  for (const cat of ['Cátedra A', 'Cátedra B']) await db.insert(catedras).values({ materiaId: m.id, nombre: cat });
}

const catedraDe = async (materia: string, nombre: string | null) => {
  if (!nombre) return null;
  const all = await db.select().from(catedras).where(eq(catedras.materiaId, materiaIds.get(materia)!));
  return all.find((x) => x.nombre === nombre)?.id ?? null;
};

const demoMateriales: [string, string, string | null, (typeof materiales.$inferInsert)['tipo'], number][] = [
  ['Fuentes del derecho y teoría de la norma', 'Introducción al Derecho', 'Cátedra A', 'Resumen', -40],
  ['Guía de preguntas para el primer parcial', 'Introducción al Derecho', 'Cátedra B', 'Guía de estudio', -20],
  ['Personas y cosas en el derecho romano', 'Derecho Romano', 'Cátedra A', 'Apunte de clase', -65],
  ['Parte dogmática: derechos y garantías', 'Derecho Constitucional', 'Cátedra A', 'Resumen', -12],
  ['Control de constitucionalidad: fallos clave', 'Derecho Constitucional', null, 'Cuadro comparativo', -90],
  ['Hechos y actos jurídicos', 'Derecho Civil: Parte General', 'Cátedra B', 'Apunte de clase', -30],
  ['Teoría del delito', 'Derecho Penal: Parte General', 'Cátedra A', 'Resumen', -8],
  ['Clasificación de las obligaciones', 'Obligaciones', 'Cátedra A', 'Resumen', -120],
  ['Modelo de parcial escrito', 'Contratos', 'Cátedra B', 'Modelo de examen', -150],
  ['Etapas del proceso de conocimiento', 'Derecho Procesal Civil', null, 'Guía de estudio', -3],
];

for (const [titulo, materia, catedra, tipo, dias] of demoMateriales) {
  const file = await savePdf(titulo, `${materia}${catedra ? ` - ${catedra}` : ''}`);
  await db.insert(materiales).values({
    titulo: `${P}${titulo}`,
    descripcion: 'Material de ejemplo para probar la búsqueda, los filtros y las descargas.',
    tipo,
    materiaId: materiaIds.get(materia)!,
    catedraId: await catedraDe(materia, catedra),
    archivo: file.key,
    archivoNombre: `${slug(titulo)}.pdf`,
    archivoTipo: 'application/pdf',
    archivoTamano: file.size,
    fecha: diaISO(dias),
  });
}

/* ---------- Charlas ---------- */

const descCharla = 'Texto de ejemplo. Acá se describe el objetivo de la actividad, a quién está dirigida y qué temas se abordarán.\n\nTambién puede incluir requisitos previos, materiales recomendados y si se entrega certificado de asistencia.';
type CharlaDemo = Omit<typeof charlas.$inferInsert, 'slug' | 'descripcion'>;
const charlasBase: CharlaDemo[] = [
  { titulo: `${P}Litigación oral en el sistema acusatorio`, tipo: 'Charla', tematica: 'Derecho Procesal Penal', fecha: diaISO(14), hora: '18:30', lugar: 'Aula magna', modalidad: 'Presencial', oradores: [{ nombre: 'Orador/a a confirmar', rol: 'Invitado/a' }] },
  { titulo: `${P}Jornada sobre derecho e inteligencia artificial`, tipo: 'Jornada', tematica: 'Derecho y Tecnología', fecha: diaISO(30), hora: '10:00', lugar: 'Auditorio', modalidad: 'Híbrida', inscripcionUrl: 'https://example.com/inscripcion' },
  { titulo: `${P}Taller de oratoria y argumentación`, tipo: 'Taller', tematica: 'Habilidades profesionales', fecha: diaISO(-25), hora: '17:00', lugar: 'Aula 310', modalidad: 'Presencial' },
];
await db.insert(charlas).values(charlasBase.map((c) => ({ ...c, descripcion: descCharla, slug: slug(c.titulo) })));

/* ---------- Noticias ---------- */

const cuerpo = 'Este es un texto de ejemplo para mostrar cómo se ve el cuerpo de una noticia.\n\nLos párrafos se separan con una línea en blanco y se presentan con un ancho de lectura cómodo.\n\nCuando se publique el contenido definitivo, cada noticia puede tener una imagen de portada.';
const noticiasBase: Omit<typeof noticias.$inferInsert, 'slug'>[] = [
  { titulo: `${P}Se habilita la biblioteca digital de resúmenes`, categoria: 'Académico', resumen: 'Un espacio para encontrar material de estudio organizado por materia, cátedra y año.', contenido: cuerpo, fecha: diaISO(-2), estado: 'publicada' },
  { titulo: `${P}Convocatoria abierta para los equipos deportivos`, categoria: 'Deportes', resumen: 'Información de ejemplo sobre pruebas y horarios de entrenamiento.', contenido: cuerpo, fecha: diaISO(-10), estado: 'publicada' },
  { titulo: `${P}Balance de la colecta solidaria`, categoria: 'Acción Social', resumen: 'Borrador de ejemplo: todavía no es visible en el sitio.', contenido: cuerpo, fecha: diaISO(-1), estado: 'borrador' },
];
await db.insert(noticias).values(noticiasBase.map((n) => ({ ...n, slug: slug(n.titulo) })));

/* ---------- Logros ---------- */

await db.insert(logros).values([
  { titulo: `${P}Biblioteca digital de apuntes`, descripcion: 'Iniciativa de ejemplo: organización del material de estudio por materia, cátedra y año.\n\nImpacto: cifras a completar.', fecha: diaISO(-20), area: 'Académica', destacado: true, orden: 1 },
  { titulo: `${P}Campaña solidaria de invierno`, descripcion: 'Iniciativa de ejemplo: colecta y voluntariado en instituciones de la zona.', fecha: diaISO(-200), area: 'Acción Social', destacado: true, orden: 2 },
  { titulo: `${P}Ciclo de charlas con graduados`, descripcion: 'Iniciativa de ejemplo: actividades con especialistas y graduados.', fecha: diaISO(-400), area: 'Académica', destacado: false, orden: 3 },
]);

/* ---------- INTERUCA ---------- */

const anio = hoy.getFullYear();
await db.insert(interuca).values([
  { anio: anio - 1, disciplina: 'Fútbol', rama: 'Masculino', resultado: 'campeon', resultadoDetalle: 'Dato de ejemplo', equipo: `${P}Equipo de Derecho`, descripcion: 'Resultado ilustrativo: reemplazar por el dato oficial.' },
  { anio: anio - 1, disciplina: 'Hockey', rama: 'Femenino', resultado: 'subcampeon', equipo: `${P}Equipo de Derecho`, descripcion: 'Resultado ilustrativo.' },
  { anio: anio - 1, disciplina: 'Vóley', rama: 'Mixto', resultado: 'tercero', equipo: `${P}Equipo de Derecho` },
  { anio: anio - 2, disciplina: 'Rugby', rama: 'Masculino', resultado: 'campeon', equipo: `${P}Equipo de Derecho`, destacado: true },
  { anio: anio - 2, disciplina: 'Tenis', rama: 'Femenino', resultado: 'participacion', resultadoDetalle: 'Cuartos de final', equipo: `${P}Delegación de Derecho` },
]);

/* ---------- Miembros ---------- */

await db.insert(miembros).values([
  { nombre: `${P}Integrante 1`, cargo: 'Presidencia', area: 'Mesa directiva', orden: 1 },
  { nombre: `${P}Integrante 2`, cargo: 'Vicepresidencia', area: 'Mesa directiva', orden: 2 },
  { nombre: `${P}Integrante 3`, cargo: 'Coordinación', area: 'Académica', orden: 3 },
  { nombre: `${P}Integrante 4`, cargo: 'Coordinación', area: 'Deportes', orden: 4 },
]);

console.log('✔ Contenido de ejemplo cargado. Para quitarlo: npm run db:demo -- --quitar');
client.close();
