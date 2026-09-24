/**
 * CONTENIDO DE EJEMPLO — Logros por gestión.
 * Los títulos, descripciones y cifras son ilustrativos: no representan
 * resultados reales del Centro.
 */
import type { Gestion } from './types';

export const gestiones: Gestion[] = [
  {
    ejemplo: true,
    nombre: 'Gestión 2026',
    periodo: 'En curso',
    resumen: 'Texto de ejemplo: ejes de trabajo y prioridades de la gestión actual.',
    logros: [
      {
        ejemplo: true,
        titulo: 'Biblioteca digital de apuntes',
        area: 'Académica',
        descripcion: 'Iniciativa de ejemplo: organización del material de estudio por materia, cátedra y año.',
        indicadores: [
          { valor: '00', etiqueta: 'materiales publicados' },
          { valor: '00', etiqueta: 'materias cubiertas' },
        ],
      },
      {
        ejemplo: true,
        titulo: 'Ciclo de charlas',
        area: 'Académica',
        descripcion: 'Iniciativa de ejemplo: actividades con especialistas y graduados.',
        indicadores: [{ valor: '00', etiqueta: 'actividades' }],
      },
    ],
  },
  {
    ejemplo: true,
    nombre: 'Gestión 2025',
    periodo: 'Período a confirmar',
    resumen: 'Texto de ejemplo: balance de la gestión anterior.',
    logros: [
      {
        ejemplo: true,
        titulo: 'Campaña solidaria',
        area: 'Acción Social',
        descripcion: 'Iniciativa de ejemplo: colecta y voluntariado en instituciones de la zona.',
        indicadores: [
          { valor: '00', etiqueta: 'voluntarios' },
          { valor: '00', etiqueta: 'instituciones' },
        ],
      },
      {
        ejemplo: true,
        titulo: 'Participación en INTERUCA',
        area: 'Deportes',
        descripcion: 'Iniciativa de ejemplo: delegación en varias disciplinas.',
        indicadores: [{ valor: '00', etiqueta: 'disciplinas' }],
      },
      {
        ejemplo: true,
        titulo: 'Mejoras en espacios comunes',
        area: 'Institucional',
        descripcion: 'Iniciativa de ejemplo: gestiones ante la Facultad para mejorar espacios de estudio.',
        indicadores: [],
      },
    ],
  },
];
