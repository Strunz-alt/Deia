/**
 * Modelos de las secciones cuyo contenido todavía vive en `src/data/*.ts`
 * (Acción Social, Deportes y Relaciones Institucionales).
 *
 * Charlas, noticias, materiales, miembros, logros e INTERUCA se guardan en la
 * base de datos y se administran desde el panel (ver `src/db/schema.ts`).
 *
 * Convenciones:
 * - `ejemplo: true` marca contenido provisional. La interfaz lo señala con una
 *   etiqueta "Ejemplo" para que nunca se confunda con información real.
 * - Un `href: null` indica un enlace, archivo o formulario pendiente: el botón
 *   se muestra como "pendiente" y no simula ninguna acción.
 * - Las fechas usan formato ISO (`AAAA-MM-DD`).
 */

export interface Enlace {
  label: string;
  /** `null` = enlace, archivo o formulario todavía no disponible. */
  href: string | null;
}

export interface Imagen {
  src: string;
  alt: string;
}

interface Contenido {
  /** Contenido de muestra que debe reemplazarse. */
  ejemplo?: boolean;
}

/* ---------- Acción Social ---------- */

export type TipoIniciativa = 'Voluntariado' | 'Colecta' | 'Proyecto';

export interface Iniciativa extends Contenido {
  titulo: string;
  tipo: TipoIniciativa;
  descripcion: string;
  frecuencia: string;
  estado: 'Activa' | 'Próximamente' | 'Finalizada';
  participar: Enlace;
}

export interface Organizacion extends Contenido {
  nombre: string;
  descripcion: string;
  logo?: Imagen | null;
  sitio?: string | null;
}

/* ---------- Deportes ---------- */

export interface Entrenamiento {
  dia: string;
  horario: string;
  lugar: string;
}

export interface Disciplina extends Contenido {
  slug: string;
  nombre: string;
  ramas: string[];
  entrenamientos: Entrenamiento[];
  /** Descripción breve de competencias en las que participa. */
  competencias: string;
  inscripcion: Enlace;
}

export interface ActividadDeportiva extends Contenido {
  titulo: string;
  disciplina: string;
  fecha: string;
  hora?: string;
  lugar: string;
  tipo: 'Partido' | 'Torneo' | 'Prueba' | 'Entrenamiento abierto';
}

/* ---------- Relaciones Institucionales ---------- */

export type TipoInstitucion =
  | 'Universidad'
  | 'Colegio profesional'
  | 'Organismo público'
  | 'Organización civil'
  | 'Estudio jurídico';

export interface Vinculo extends Contenido {
  nombre: string;
  tipo: TipoInstitucion;
  descripcion: string;
  logo?: Imagen | null;
}

export interface Convenio extends Contenido {
  titulo: string;
  contraparte: string;
  fecha: string;
  descripcion: string;
  documento: Enlace;
}

export interface ActividadConjunta extends Contenido {
  titulo: string;
  tipo: 'Visita' | 'Actividad conjunta' | 'Encuentro';
  fecha: string;
  descripcion: string;
}
