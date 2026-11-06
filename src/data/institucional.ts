/**
 * CONTENIDO DE EJEMPLO — Relaciones Institucionales.
 *
 * No se incluyen instituciones reales: los vínculos usan nombres genéricos
 * y `convenios` queda vacío hasta contar con información confirmada.
 */
import type { ActividadConjunta, Convenio, Vinculo } from './types';

export const vinculos: Vinculo[] = [
  {
    ejemplo: true,
    nombre: 'Universidad (a confirmar)',
    tipo: 'Universidad',
    descripcion: 'Espacio para describir el vínculo: intercambios, competencias conjuntas o actividades académicas.',
  },
  {
    ejemplo: true,
    nombre: 'Colegio profesional (a confirmar)',
    tipo: 'Colegio profesional',
    descripcion: 'Espacio para describir el vínculo: capacitaciones, charlas o prácticas.',
  },
  {
    ejemplo: true,
    nombre: 'Organismo público (a confirmar)',
    tipo: 'Organismo público',
    descripcion: 'Espacio para describir el vínculo: visitas institucionales o programas de pasantías.',
  },
  {
    ejemplo: true,
    nombre: 'Organización civil (a confirmar)',
    tipo: 'Organización civil',
    descripcion: 'Espacio para describir el vínculo: voluntariados y proyectos compartidos.',
  },
];

export const convenios: Convenio[] = [];

export const actividadesConjuntas: ActividadConjunta[] = [
  {
    ejemplo: true,
    titulo: 'Visita institucional (ejemplo)',
    tipo: 'Visita',
    fecha: '2026-07-15',
    descripcion: 'Texto de ejemplo para describir una visita a una institución y lo que se trabajó.',
  },
  {
    ejemplo: true,
    titulo: 'Encuentro interuniversitario (ejemplo)',
    tipo: 'Encuentro',
    fecha: '2026-05-20',
    descripcion: 'Texto de ejemplo para describir una actividad organizada junto con otra universidad.',
  },
];
