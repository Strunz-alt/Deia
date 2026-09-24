/**
 * CONTENIDO DE EJEMPLO — Miembros del Centro.
 *
 * Los cargos y áreas son una estructura tentativa. Los nombres quedan en
 * `null` y se muestran como "Nombre a confirmar" hasta cargar los datos reales.
 * Para agregar fotos: `foto: { src: '/miembros/archivo.jpg', alt: 'Nombre' }`
 * (guardar la imagen en `public/miembros/`).
 */
import type { Miembro } from './types';

/** Orden en que se muestran las áreas. */
export const areas = [
  'Mesa directiva',
  'Académica',
  'Acción Social',
  'Deportes',
  'Relaciones Institucionales',
  'Comunicación',
];

const m = (cargo: string, area: string): Miembro => ({ ejemplo: true, nombre: null, cargo, area, foto: null });

export const miembros: Miembro[] = [
  m('Presidencia', 'Mesa directiva'),
  m('Vicepresidencia', 'Mesa directiva'),
  m('Secretaría general', 'Mesa directiva'),
  m('Tesorería', 'Mesa directiva'),
  m('Coordinación', 'Académica'),
  m('Resúmenes y apuntes', 'Académica'),
  m('Coordinación', 'Acción Social'),
  m('Voluntariados', 'Acción Social'),
  m('Coordinación', 'Deportes'),
  m('Coordinación', 'Relaciones Institucionales'),
  m('Coordinación', 'Comunicación'),
  m('Diseño y redes', 'Comunicación'),
];
