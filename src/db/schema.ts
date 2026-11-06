/**
 * Esquema de la base de datos (SQLite / libSQL) definido con Drizzle ORM.
 *
 * Después de modificar este archivo, generar una migración con
 * `npm run db:generate`. Las migraciones de `drizzle/` se aplican
 * automáticamente al iniciar el servidor.
 *
 * Los campos `imagen`, `foto`, `portada` y `archivo` guardan la clave del
 * archivo dentro de la carpeta de subidas (p. ej. "miembros/<uuid>.webp").
 */
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const creadoEn = () =>
  integer('creado_en', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);
const actualizadoEn = () =>
  integer('actualizado_en', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => new Date());

/* ---------- Usuarios y sesiones ---------- */

export const ROLES = ['estudiante', 'admin'] as const;
export type Rol = (typeof ROLES)[number];

export const usuarios = sqliteTable('usuarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  nombre: text('nombre').notNull(),
  passwordHash: text('password_hash').notNull(),
  /** Permiso en el sitio. El registro público siempre crea "estudiante". */
  rol: text('rol', { enum: ROLES }).notNull().default('estudiante'),
  ultimoIngreso: integer('ultimo_ingreso', { mode: 'timestamp_ms' }),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
});

export const sesiones = sqliteTable(
  'sesiones',
  {
    /** SHA-256 del token de sesión (el token en claro sólo vive en la cookie). */
    id: text('id').primaryKey(),
    usuarioId: integer('usuario_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    expiraEn: integer('expira_en', { mode: 'timestamp_ms' }).notNull(),
    creadoEn: creadoEn(),
  },
  (t) => [index('sesiones_usuario_idx').on(t.usuarioId)],
);

/* ---------- Resúmenes: materias, cátedras y materiales ---------- */

export const materias = sqliteTable('materias', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull().unique(),
  slug: text('slug').notNull().unique(),
  /** Año de la carrera en el que se cursa (opcional). */
  anio: integer('anio'),
  descripcion: text('descripcion'),
  imagen: text('imagen'),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
});

export const catedras = sqliteTable(
  'catedras',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    materiaId: integer('materia_id')
      .notNull()
      .references(() => materias.id, { onDelete: 'restrict' }),
    nombre: text('nombre').notNull(),
    /** Docentes a cargo u otra referencia (opcional). */
    detalle: text('detalle'),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [uniqueIndex('catedras_materia_nombre_uq').on(t.materiaId, t.nombre)],
);

export const TIPOS_MATERIAL = [
  'Resumen',
  'Apunte de clase',
  'Guía de estudio',
  'Modelo de examen',
  'Cuadro comparativo',
  'Otro',
] as const;

export const materiales = sqliteTable(
  'materiales',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    titulo: text('titulo').notNull(),
    descripcion: text('descripcion'),
    tipo: text('tipo', { enum: TIPOS_MATERIAL }).notNull().default('Resumen'),
    materiaId: integer('materia_id')
      .notNull()
      .references(() => materias.id, { onDelete: 'restrict' }),
    /** `null` = material general de la materia, sin cátedra específica. */
    catedraId: integer('catedra_id').references(() => catedras.id, { onDelete: 'restrict' }),
    archivo: text('archivo').notNull(),
    archivoNombre: text('archivo_nombre').notNull(),
    archivoTipo: text('archivo_tipo').notNull(),
    archivoTamano: integer('archivo_tamano').notNull(),
    /** Fecha de referencia del material (AAAA-MM-DD). */
    fecha: text('fecha').notNull(),
    creadoPor: integer('creado_por').references(() => usuarios.id, { onDelete: 'set null' }),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [index('materiales_materia_idx').on(t.materiaId), index('materiales_catedra_idx').on(t.catedraId)],
);

/* ---------- Miembros ---------- */

export const miembros = sqliteTable('miembros', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  /** Cargo institucional (Presidencia, Secretaría…). No otorga permisos en el sitio. */
  cargo: text('cargo').notNull(),
  area: text('area'),
  descripcion: text('descripcion'),
  foto: text('foto'),
  orden: integer('orden').notNull().default(0),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
});

/* ---------- Logros ---------- */

export const logros = sqliteTable('logros', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titulo: text('titulo').notNull(),
  descripcion: text('descripcion').notNull(),
  fecha: text('fecha').notNull(),
  area: text('area'),
  destacado: integer('destacado', { mode: 'boolean' }).notNull().default(false),
  orden: integer('orden').notNull().default(0),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
});

export const logroImagenes = sqliteTable('logro_imagenes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  logroId: integer('logro_id')
    .notNull()
    .references(() => logros.id, { onDelete: 'cascade' }),
  archivo: text('archivo').notNull(),
  orden: integer('orden').notNull().default(0),
});

/* ---------- Noticias ---------- */

export const CATEGORIAS_NOTICIA = ['Institucional', 'Académico', 'Acción Social', 'Deportes', 'Comunidad'] as const;
export const ESTADOS_NOTICIA = ['borrador', 'publicada'] as const;

export const noticias = sqliteTable('noticias', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  titulo: text('titulo').notNull(),
  categoria: text('categoria', { enum: CATEGORIAS_NOTICIA }).notNull().default('Institucional'),
  resumen: text('resumen').notNull(),
  /** Texto plano; los párrafos se separan con una línea en blanco. */
  contenido: text('contenido').notNull(),
  portada: text('portada'),
  fecha: text('fecha').notNull(),
  estado: text('estado', { enum: ESTADOS_NOTICIA }).notNull().default('borrador'),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
});

/* ---------- Charlas ---------- */

export const TIPOS_CHARLA = ['Charla', 'Jornada', 'Encuentro', 'Conversatorio', 'Taller'] as const;
export const MODALIDADES = ['Presencial', 'Virtual', 'Híbrida'] as const;

export interface Orador {
  nombre: string;
  rol: string;
}

export const charlas = sqliteTable('charlas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  titulo: text('titulo').notNull(),
  tipo: text('tipo', { enum: TIPOS_CHARLA }).notNull().default('Charla'),
  tematica: text('tematica'),
  descripcion: text('descripcion').notNull(),
  oradores: text('oradores', { mode: 'json' }).$type<Orador[]>().notNull().default(sql`'[]'`),
  fecha: text('fecha').notNull(),
  hora: text('hora'),
  lugar: text('lugar').notNull(),
  modalidad: text('modalidad', { enum: MODALIDADES }).notNull().default('Presencial'),
  imagen: text('imagen'),
  inscripcionUrl: text('inscripcion_url'),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
});

/* ---------- INTERUCA ---------- */

export const RESULTADOS_INTERUCA = ['campeon', 'subcampeon', 'tercero', 'participacion'] as const;
export type ResultadoInteruca = (typeof RESULTADOS_INTERUCA)[number];
export const RAMAS = ['Masculino', 'Femenino', 'Mixto'] as const;

export const interuca = sqliteTable(
  'interuca',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    anio: integer('anio').notNull(),
    disciplina: text('disciplina').notNull(),
    rama: text('rama', { enum: RAMAS }),
    /** Nombre del equipo o participantes. */
    equipo: text('equipo'),
    resultado: text('resultado', { enum: RESULTADOS_INTERUCA }).notNull(),
    /** Detalle opcional del resultado (p. ej. "Cuartos de final", "Final 3-1"). */
    resultadoDetalle: text('resultado_detalle'),
    descripcion: text('descripcion'),
    destacado: integer('destacado', { mode: 'boolean' }).notNull().default(false),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [index('interuca_anio_idx').on(t.anio)],
);

export const interucaFotos = sqliteTable('interuca_fotos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  participacionId: integer('participacion_id')
    .notNull()
    .references(() => interuca.id, { onDelete: 'cascade' }),
  archivo: text('archivo').notNull(),
  orden: integer('orden').notNull().default(0),
});

export type Usuario = typeof usuarios.$inferSelect;
export type Materia = typeof materias.$inferSelect;
export type Catedra = typeof catedras.$inferSelect;
export type Material = typeof materiales.$inferSelect;
export type Miembro = typeof miembros.$inferSelect;
export type Logro = typeof logros.$inferSelect;
export type Noticia = typeof noticias.$inferSelect;
export type Charla = typeof charlas.$inferSelect;
export type ParticipacionInteruca = typeof interuca.$inferSelect;
