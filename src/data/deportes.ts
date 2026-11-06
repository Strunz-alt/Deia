/**
 * CONTENIDO DE EJEMPLO — Disciplinas y agenda deportiva.
 * (El historial INTERUCA se administra desde el panel: /admin/interuca.)
 */
import type { ActividadDeportiva, Disciplina } from './types';

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
