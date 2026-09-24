/**
 * CONTENIDO DE EJEMPLO — Noticias y novedades.
 * Cada noticia genera su propia página en /noticias/[slug].
 */
import type { CategoriaNoticia, Noticia } from './types';

export const categoriasNoticias: CategoriaNoticia[] = [
  'Institucional',
  'Académico',
  'Acción Social',
  'Deportes',
  'Comunidad',
];

const cuerpoEjemplo = [
  'Este es un texto de ejemplo para mostrar cómo se verá el cuerpo de una noticia. Aquí se desarrollará la información completa, con el contexto necesario para que cualquier estudiante pueda entender de qué se trata.',
  'Los párrafos se presentan con un ancho de lectura cómodo y una tipografía pensada para textos largos. Pueden incluirse citas, datos relevantes o enlaces a otras secciones del sitio.',
  'Cuando se incorpore el contenido definitivo, cada noticia podrá tener una imagen principal, un epígrafe y material adicional para descargar.',
];

export const noticias: Noticia[] = [
  {
    ejemplo: true,
    slug: 'abre-la-biblioteca-de-apuntes',
    titulo: 'Se habilita la biblioteca digital de resúmenes y apuntes',
    categoria: 'Académico',
    fecha: '2026-09-18',
    bajada:
      'Un espacio para encontrar material de estudio organizado por materia, cátedra y año de la carrera.',
    cuerpo: cuerpoEjemplo,
    destacada: true,
  },
  {
    ejemplo: true,
    slug: 'colecta-de-invierno',
    titulo: 'Balance de la colecta de invierno',
    categoria: 'Acción Social',
    fecha: '2026-09-02',
    bajada: 'Texto de ejemplo sobre el cierre de una campaña solidaria y los próximos pasos del área.',
    cuerpo: cuerpoEjemplo,
  },
  {
    ejemplo: true,
    slug: 'convocatoria-equipos-deportivos',
    titulo: 'Convocatoria abierta para los equipos deportivos',
    categoria: 'Deportes',
    fecha: '2026-08-25',
    bajada: 'Información de ejemplo sobre pruebas, horarios de entrenamiento y cómo sumarse a cada disciplina.',
    cuerpo: cuerpoEjemplo,
  },
  {
    ejemplo: true,
    slug: 'ciclo-de-charlas-segundo-cuatrimestre',
    titulo: 'Presentamos el ciclo de charlas del segundo cuatrimestre',
    categoria: 'Institucional',
    fecha: '2026-08-12',
    bajada: 'Un adelanto de las actividades académicas previstas para los próximos meses.',
    cuerpo: cuerpoEjemplo,
  },
  {
    ejemplo: true,
    slug: 'bienvenida-ingresantes',
    titulo: 'Bienvenida a ingresantes',
    categoria: 'Comunidad',
    fecha: '2026-03-09',
    bajada: 'Texto de ejemplo sobre las actividades de integración para quienes comienzan la carrera.',
    cuerpo: cuerpoEjemplo,
  },
];
