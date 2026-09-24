/**
 * CONTENIDO DE EJEMPLO — Charlas, jornadas y encuentros.
 * Reemplazar por las actividades reales. Los expositores con `nombre: null`
 * se muestran como "A confirmar".
 */
import type { Charla } from './types';

const pendienteInscripcion = { label: 'Inscripción', href: null };

export const charlas: Charla[] = [
  {
    ejemplo: true,
    slug: 'litigacion-oral-primeros-pasos',
    titulo: 'Litigación oral: primeros pasos en el sistema acusatorio',
    tematica: 'Derecho Procesal Penal',
    tipo: 'Charla',
    fecha: '2026-10-08',
    hora: '18:30',
    lugar: 'Aula magna · Facultad de Derecho',
    modalidad: 'Presencial',
    resumen:
      'Una introducción práctica a las técnicas de litigación: teoría del caso, alegatos de apertura y examen de testigos.',
    descripcion: [
      'Texto de ejemplo. En esta sección se describirá el objetivo de la charla, a quién está dirigida y qué temas se abordarán.',
      'También puede incluir requisitos previos, materiales recomendados y si se entregará certificado de asistencia.',
    ],
    expositores: [
      { nombre: null, rol: 'Expositor/a invitado/a' },
      { nombre: null, rol: 'Moderación' },
    ],
    inscripcion: pendienteInscripcion,
  },
  {
    ejemplo: true,
    slug: 'jornada-derecho-e-inteligencia-artificial',
    titulo: 'Jornada sobre derecho e inteligencia artificial',
    tematica: 'Derecho y Tecnología',
    tipo: 'Jornada',
    fecha: '2026-10-22',
    hora: '10:00',
    lugar: 'Auditorio · Campus Puerto Madero',
    modalidad: 'Híbrida',
    resumen:
      'Paneles sobre responsabilidad civil, protección de datos personales y uso de herramientas de IA en la práctica profesional.',
    descripcion: [
      'Texto de ejemplo. Una jornada se compone de varios paneles; aquí puede detallarse el cronograma de cada bloque.',
      'La modalidad híbrida permite seguir la actividad en forma virtual. El enlace de transmisión se publicará cuando esté disponible.',
    ],
    expositores: [
      { nombre: null, rol: 'Panel 1 · Responsabilidad civil' },
      { nombre: null, rol: 'Panel 2 · Datos personales' },
      { nombre: null, rol: 'Panel 3 · Ejercicio profesional' },
    ],
    inscripcion: pendienteInscripcion,
  },
  {
    ejemplo: true,
    slug: 'encuentro-salida-laboral',
    titulo: 'Encuentro: caminos profesionales después de la facultad',
    tematica: 'Orientación profesional',
    tipo: 'Encuentro',
    fecha: '2026-11-05',
    hora: '19:00',
    lugar: 'Sala de conferencias · Piso 2',
    modalidad: 'Presencial',
    resumen:
      'Graduados comparten su experiencia en la función pública, estudios jurídicos, empresas y la academia.',
    descripcion: [
      'Texto de ejemplo. Espacio de conversación abierto para resolver dudas sobre prácticas, pasantías y primeros empleos.',
    ],
    expositores: [{ nombre: null, rol: 'Graduados invitados' }],
    inscripcion: pendienteInscripcion,
  },
  {
    ejemplo: true,
    slug: 'conversatorio-derechos-humanos',
    titulo: 'Conversatorio sobre el sistema interamericano de derechos humanos',
    tematica: 'Derecho Internacional',
    tipo: 'Conversatorio',
    fecha: '2026-09-10',
    hora: '18:00',
    lugar: 'Aula 205',
    modalidad: 'Presencial',
    resumen:
      'Recorrido por el funcionamiento de la Comisión y la Corte Interamericana a partir de casos emblemáticos.',
    descripcion: [
      'Texto de ejemplo. En las actividades realizadas, esta sección puede incluir una breve crónica, fotografías y material compartido.',
    ],
    expositores: [{ nombre: null, rol: 'Expositor/a invitado/a' }],
    inscripcion: { label: 'Inscripción', href: null },
  },
  {
    ejemplo: true,
    slug: 'charla-contratos-inteligentes',
    titulo: 'Contratos inteligentes: ¿un nuevo paradigma contractual?',
    tematica: 'Derecho Civil y Comercial',
    tipo: 'Charla',
    fecha: '2026-08-27',
    hora: '18:30',
    lugar: 'Virtual',
    modalidad: 'Virtual',
    resumen:
      'Análisis de los contratos autoejecutables a la luz del Código Civil y Comercial de la Nación.',
    descripcion: ['Texto de ejemplo. Aquí podrá incluirse la grabación de la charla cuando esté disponible.'],
    expositores: [{ nombre: null, rol: 'Expositor/a invitado/a' }],
    inscripcion: { label: 'Inscripción', href: null },
  },
  {
    ejemplo: true,
    slug: 'jornada-oratoria',
    titulo: 'Taller de oratoria y argumentación jurídica',
    tematica: 'Habilidades profesionales',
    tipo: 'Jornada',
    fecha: '2026-06-18',
    hora: '17:00',
    lugar: 'Aula 310',
    modalidad: 'Presencial',
    resumen: 'Ejercicios prácticos para ganar seguridad al exponer en exámenes orales, audiencias y competencias.',
    descripcion: ['Texto de ejemplo.'],
    expositores: [{ nombre: null, rol: 'Coordinación del taller' }],
    inscripcion: { label: 'Inscripción', href: null },
  },
];
