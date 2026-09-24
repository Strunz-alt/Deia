/**
 * Modelos de datos del sitio.
 *
 * Todas las secciones leen su contenido desde `src/data/*.ts` a través de estos
 * tipos. Cuando se incorpore un CMS o un panel de administración, alcanza con
 * que devuelva objetos con esta misma forma.
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

/* ---------- Charlas ---------- */

export type TipoCharla = 'Charla' | 'Jornada' | 'Encuentro' | 'Conversatorio';
export type Modalidad = 'Presencial' | 'Virtual' | 'Híbrida';

export interface Expositor {
  /** `null` mientras el nombre no esté confirmado. */
  nombre: string | null;
  rol: string;
  foto?: Imagen | null;
}

export interface Charla extends Contenido {
  slug: string;
  titulo: string;
  tematica: string;
  tipo: TipoCharla;
  fecha: string;
  hora?: string;
  lugar: string;
  modalidad: Modalidad;
  resumen: string;
  descripcion: string[];
  expositores: Expositor[];
  inscripcion: Enlace;
  imagen?: Imagen | null;
}

/* ---------- Noticias ---------- */

export type CategoriaNoticia =
  | 'Institucional'
  | 'Académico'
  | 'Acción Social'
  | 'Deportes'
  | 'Comunidad';

export interface Noticia extends Contenido {
  slug: string;
  titulo: string;
  categoria: CategoriaNoticia;
  fecha: string;
  bajada: string;
  cuerpo: string[];
  imagen?: Imagen | null;
  destacada?: boolean;
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

/* ---------- Resúmenes y apuntes ---------- */

export type TipoMaterial =
  | 'Resumen'
  | 'Apunte de clase'
  | 'Guía de estudio'
  | 'Modelo de examen'
  | 'Cuadro comparativo';

export interface Materia {
  nombre: string;
  /** Año de la carrera en el que se cursa. */
  anio: number;
  catedras: string[];
}

export interface Apunte extends Contenido {
  id: string;
  titulo: string;
  materia: string;
  catedra: string;
  anio: number;
  tipo: TipoMaterial;
  /** Fecha de carga o actualización del material. */
  fecha: string;
  paginas?: number;
  /** URL del archivo (PDF). `null` mientras no se haya cargado. */
  archivo: string | null;
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

/* ---------- Miembros ---------- */

export interface Miembro extends Contenido {
  /** `null` mientras no se cargue el nombre real. */
  nombre: string | null;
  cargo: string;
  area: string;
  foto?: Imagen | null;
}

/* ---------- Logros ---------- */

export interface Indicador {
  valor: string;
  etiqueta: string;
}

export interface Logro extends Contenido {
  titulo: string;
  area: string;
  descripcion: string;
  indicadores: Indicador[];
}

export interface Gestion extends Contenido {
  /** Identificador visible, p. ej. "Gestión 2025". */
  nombre: string;
  periodo: string;
  resumen: string;
  logros: Logro[];
}

/* ---------- INTERUCA ---------- */

export type Posicion = 1 | 2 | 3;

export interface ResultadoInteruca extends Contenido {
  disciplina: string;
  rama: 'Masculino' | 'Femenino' | 'Mixto';
  /** `null` = participación sin podio o resultado a confirmar. */
  posicion: Posicion | null;
  detalle: string;
}

export interface EdicionInteruca extends Contenido {
  anio: number;
  sede: string;
  resumen: string;
  resultados: ResultadoInteruca[];
  hitos: string[];
  fotos: Imagen[];
}
