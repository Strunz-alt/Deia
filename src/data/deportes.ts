/**
 * CONTENIDO DE EJEMPLO — Deportes e historial INTERUCA.
 *
 * Los resultados de INTERUCA son ilustrativos: sirven para ver cómo se
 * presenta el historial y NO representan victorias reales. Reemplazarlos
 * por los resultados oficiales de cada edición.
 */
import type { ActividadDeportiva, Disciplina, EdicionInteruca } from './types';

const inscripcionPendiente = { label: 'Inscripción', href: null };
const horarioPendiente = { dia: 'A confirmar', horario: '—', lugar: 'A confirmar' };

export const disciplinas: Disciplina[] = [
  {
    ejemplo: true,
    slug: 'futbol',
    nombre: 'Fútbol',
    ramas: ['Masculino', 'Femenino'],
    entrenamientos: [horarioPendiente],
    competencias: 'Torneo interfacultades e INTERUCA.',
    inscripcion: inscripcionPendiente,
  },
  {
    ejemplo: true,
    slug: 'hockey',
    nombre: 'Hockey',
    ramas: ['Femenino'],
    entrenamientos: [horarioPendiente],
    competencias: 'INTERUCA y encuentros amistosos.',
    inscripcion: inscripcionPendiente,
  },
  {
    ejemplo: true,
    slug: 'rugby',
    nombre: 'Rugby',
    ramas: ['Masculino'],
    entrenamientos: [horarioPendiente],
    competencias: 'INTERUCA (seven).',
    inscripcion: inscripcionPendiente,
  },
  {
    ejemplo: true,
    slug: 'voley',
    nombre: 'Vóley',
    ramas: ['Masculino', 'Femenino', 'Mixto'],
    entrenamientos: [horarioPendiente],
    competencias: 'INTERUCA y torneos universitarios.',
    inscripcion: inscripcionPendiente,
  },
  {
    ejemplo: true,
    slug: 'basquet',
    nombre: 'Básquet',
    ramas: ['Masculino'],
    entrenamientos: [horarioPendiente],
    competencias: 'INTERUCA.',
    inscripcion: inscripcionPendiente,
  },
  {
    ejemplo: true,
    slug: 'tenis',
    nombre: 'Tenis',
    ramas: ['Masculino', 'Femenino'],
    entrenamientos: [horarioPendiente],
    competencias: 'INTERUCA (singles y dobles).',
    inscripcion: inscripcionPendiente,
  },
];

export const actividadesDeportivas: ActividadDeportiva[] = [
  {
    ejemplo: true,
    titulo: 'Prueba de jugadoras y jugadores',
    disciplina: 'Fútbol',
    fecha: '2026-10-03',
    hora: '10:00',
    lugar: 'A confirmar',
    tipo: 'Prueba',
  },
  {
    ejemplo: true,
    titulo: 'Entrenamiento abierto',
    disciplina: 'Vóley',
    fecha: '2026-10-07',
    hora: '19:00',
    lugar: 'A confirmar',
    tipo: 'Entrenamiento abierto',
  },
  {
    ejemplo: true,
    titulo: 'Fecha de torneo interfacultades',
    disciplina: 'Hockey',
    fecha: '2026-10-17',
    lugar: 'A confirmar',
    tipo: 'Torneo',
  },
];

const nota = 'Resultado ilustrativo — reemplazar por el dato oficial.';

export const interuca: EdicionInteruca[] = [
  {
    ejemplo: true,
    anio: 2025,
    sede: 'Sede a confirmar',
    resumen: 'Texto de ejemplo con un resumen de la edición: participación del equipo, momentos destacados y balance general.',
    resultados: [
      { ejemplo: true, disciplina: 'Fútbol', rama: 'Masculino', posicion: 1, detalle: nota },
      { ejemplo: true, disciplina: 'Hockey', rama: 'Femenino', posicion: 2, detalle: nota },
      { ejemplo: true, disciplina: 'Vóley', rama: 'Mixto', posicion: 3, detalle: nota },
      { ejemplo: true, disciplina: 'Tenis', rama: 'Femenino', posicion: null, detalle: nota },
    ],
    hitos: ['Hito de ejemplo: primera participación en una nueva disciplina.', 'Hito de ejemplo: récord de delegación.'],
    fotos: [],
  },
  {
    ejemplo: true,
    anio: 2024,
    sede: 'Sede a confirmar',
    resumen: 'Texto de ejemplo con un resumen de la edición.',
    resultados: [
      { ejemplo: true, disciplina: 'Rugby', rama: 'Masculino', posicion: 1, detalle: nota },
      { ejemplo: true, disciplina: 'Vóley', rama: 'Femenino', posicion: 1, detalle: nota },
      { ejemplo: true, disciplina: 'Básquet', rama: 'Masculino', posicion: 3, detalle: nota },
    ],
    hitos: ['Hito de ejemplo.'],
    fotos: [],
  },
  {
    ejemplo: true,
    anio: 2023,
    sede: 'Sede a confirmar',
    resumen: 'Texto de ejemplo con un resumen de la edición.',
    resultados: [
      { ejemplo: true, disciplina: 'Fútbol', rama: 'Femenino', posicion: 2, detalle: nota },
      { ejemplo: true, disciplina: 'Tenis', rama: 'Masculino', posicion: 1, detalle: nota },
    ],
    hitos: [],
    fotos: [],
  },
];
