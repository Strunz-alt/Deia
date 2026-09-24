/**
 * CONTENIDO DE EJEMPLO — Acción Social.
 * `organizaciones` queda vacío a propósito: la página muestra un estado vacío
 * hasta que se carguen las organizaciones reales con las que se colabora.
 */
import type { Iniciativa, Organizacion } from './types';

const participarPendiente = { label: 'Quiero participar', href: null };

export const iniciativas: Iniciativa[] = [
  {
    ejemplo: true,
    titulo: 'Voluntariado de apoyo escolar',
    tipo: 'Voluntariado',
    descripcion: 'Texto de ejemplo: acompañamiento semanal a estudiantes de nivel primario y secundario.',
    frecuencia: 'Semanal',
    estado: 'Activa',
    participar: participarPendiente,
  },
  {
    ejemplo: true,
    titulo: 'Consultorio jurídico comunitario',
    tipo: 'Proyecto',
    descripcion: 'Texto de ejemplo: orientación jurídica básica, con supervisión profesional, en barrios vulnerables.',
    frecuencia: 'Quincenal',
    estado: 'Próximamente',
    participar: participarPendiente,
  },
  {
    ejemplo: true,
    titulo: 'Colecta de abrigo',
    tipo: 'Colecta',
    descripcion: 'Texto de ejemplo: recolección de ropa de abrigo, frazadas y alimentos no perecederos.',
    frecuencia: 'Anual · Invierno',
    estado: 'Finalizada',
    participar: participarPendiente,
  },
  {
    ejemplo: true,
    titulo: 'Colecta de útiles escolares',
    tipo: 'Colecta',
    descripcion: 'Texto de ejemplo: campaña de inicio de clases para escuelas de la zona.',
    frecuencia: 'Anual · Febrero',
    estado: 'Próximamente',
    participar: participarPendiente,
  },
];

export const organizaciones: Organizacion[] = [];

export const comoParticipar = [
  {
    titulo: 'Conocé las propuestas',
    texto: 'Revisá las iniciativas activas y elegí la que mejor se adapte a tus tiempos.',
  },
  {
    titulo: 'Escribinos',
    texto: 'Completá el formulario de voluntariado o acercate al Centro para recibir más información.',
  },
  {
    titulo: 'Sumate',
    texto: 'Te contactamos para coordinar la primera actividad y presentarte al equipo.',
  },
];

/** Formulario de voluntariado. `null` hasta que exista el formulario real. */
export const formularioVoluntariado: { label: string; href: string | null } = {
  label: 'Formulario de voluntariado',
  href: null,
};
