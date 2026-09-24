/**
 * Configuración general del sitio: nombre, navegación, contacto y redes.
 * Los valores marcados como provisionales deben confirmarse con el Centro.
 */
import type { Enlace } from './types';

export const site = {
  /** Nombre completo. */
  nombre: 'Centro de Estudiantes de Derecho',
  institucion: 'Pontificia Universidad Católica Argentina',
  /** Sigla provisional: confirmar la forma oficial que usa el Centro. */
  sigla: 'CED',
  descripcion:
    'Centro de Estudiantes de la Facultad de Derecho de la UCA. Charlas, apuntes, acción social, deportes y vida universitaria.',
  lema: 'Formación, comunidad y compromiso.',
} as const;

export interface NavItem {
  label: string;
  href: string;
  descripcion?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

export const isNavGroup = (entry: NavEntry): entry is NavGroup => 'items' in entry;

/** Menú principal. Los grupos se muestran como desplegables. */
export const navegacion: NavEntry[] = [
  { label: 'Inicio', href: '/' },
  {
    label: 'Actividades',
    items: [
      { label: 'Charlas', href: '/charlas', descripcion: 'Charlas, jornadas y encuentros' },
      { label: 'Acción Social', href: '/accion-social', descripcion: 'Voluntariados, colectas y proyectos' },
      { label: 'Deportes', href: '/deportes', descripcion: 'Disciplinas, entrenamientos y torneos' },
      { label: 'Historial INTERUCA', href: '/deportes/interuca', descripcion: 'Resultados y trofeos por año' },
    ],
  },
  { label: 'Noticias', href: '/noticias' },
  {
    label: 'El Centro',
    items: [
      { label: 'Miembros', href: '/miembros', descripcion: 'Quiénes integran el Centro' },
      { label: 'Logros', href: '/logros', descripcion: 'Iniciativas y resultados por gestión' },
      {
        label: 'Relaciones Institucionales',
        href: '/relaciones-institucionales',
        descripcion: 'Vínculos, convenios y visitas',
      },
    ],
  },
];

/** Acceso destacado que se muestra como botón en el encabezado. */
export const navDestacado: NavItem = { label: 'Resúmenes y apuntes', href: '/apuntes' };

/**
 * Datos de contacto. `null` = pendiente de confirmar.
 * El pie de página muestra "A confirmar" en esos casos.
 */
export const contacto: {
  email: string | null;
  direccion: string | null;
  horario: string | null;
} = {
  email: null,
  direccion: 'Facultad de Derecho · UCA · Campus Puerto Madero',
  horario: null,
};

export const redes: (Enlace & { red: 'instagram' | 'linkedin' | 'x' | 'youtube' })[] = [
  { red: 'instagram', label: 'Instagram', href: null },
  { red: 'linkedin', label: 'LinkedIn', href: null },
  { red: 'youtube', label: 'YouTube', href: null },
];

export const enlacesUtiles: Enlace[] = [
  { label: 'Sitio de la UCA', href: 'https://uca.edu.ar' },
  { label: 'Facultad de Derecho', href: null },
  { label: 'Autogestión de alumnos', href: null },
  { label: 'Calendario académico', href: null },
];
