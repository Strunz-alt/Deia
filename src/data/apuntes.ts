/**
 * CONTENIDO DE EJEMPLO — Biblioteca de resúmenes y apuntes.
 *
 * - `materias` define el catálogo (materia → año → cátedras) usado por los filtros.
 * - `apuntes` es el listado de materiales. `archivo: null` indica que el PDF
 *   todavía no fue cargado: los botones "Ver" y "Descargar" se muestran como
 *   pendientes.
 *
 * Las cátedras usan nombres genéricos ("Cátedra A") para no atribuir material
 * a docentes reales. Reemplazar por la denominación oficial de cada cátedra.
 */
import type { Apunte, Materia, TipoMaterial } from './types';

export const tiposMaterial: TipoMaterial[] = [
  'Resumen',
  'Apunte de clase',
  'Guía de estudio',
  'Modelo de examen',
  'Cuadro comparativo',
];

export const materias: Materia[] = [
  { nombre: 'Introducción al Derecho', anio: 1, catedras: ['Cátedra A', 'Cátedra B'] },
  { nombre: 'Derecho Romano', anio: 1, catedras: ['Cátedra A', 'Cátedra B'] },
  { nombre: 'Historia del Derecho', anio: 1, catedras: ['Cátedra A'] },
  { nombre: 'Derecho Constitucional', anio: 2, catedras: ['Cátedra A', 'Cátedra B', 'Cátedra C'] },
  { nombre: 'Derecho Civil: Parte General', anio: 2, catedras: ['Cátedra A', 'Cátedra B'] },
  { nombre: 'Derecho Penal: Parte General', anio: 2, catedras: ['Cátedra A', 'Cátedra B'] },
  { nombre: 'Obligaciones', anio: 3, catedras: ['Cátedra A', 'Cátedra B'] },
  { nombre: 'Derecho Administrativo', anio: 3, catedras: ['Cátedra A'] },
  { nombre: 'Sociedades', anio: 3, catedras: ['Cátedra A', 'Cátedra B'] },
  { nombre: 'Contratos', anio: 4, catedras: ['Cátedra A', 'Cátedra B'] },
  { nombre: 'Derecho Procesal Civil', anio: 4, catedras: ['Cátedra A'] },
  { nombre: 'Derecho Internacional Público', anio: 4, catedras: ['Cátedra A'] },
  { nombre: 'Familia y Sucesiones', anio: 5, catedras: ['Cátedra A', 'Cátedra B'] },
  { nombre: 'Filosofía del Derecho', anio: 5, catedras: ['Cátedra A'] },
];

const anioDe = (materia: string) => materias.find((m) => m.nombre === materia)?.anio ?? 0;

const apunte = (
  id: string,
  titulo: string,
  materia: string,
  catedra: string,
  tipo: TipoMaterial,
  fecha: string,
  paginas?: number,
): Apunte => ({
  ejemplo: true,
  id,
  titulo,
  materia,
  catedra,
  anio: anioDe(materia),
  tipo,
  fecha,
  paginas,
  archivo: null,
});

export const apuntes: Apunte[] = [
  apunte('a01', 'Fuentes del derecho y teoría de la norma', 'Introducción al Derecho', 'Cátedra A', 'Resumen', '2026-04-10', 24),
  apunte('a02', 'Guía de preguntas para el primer parcial', 'Introducción al Derecho', 'Cátedra B', 'Guía de estudio', '2026-05-02', 8),
  apunte('a03', 'Personas y cosas en el derecho romano', 'Derecho Romano', 'Cátedra A', 'Apunte de clase', '2026-04-22', 31),
  apunte('a04', 'Cuadro de acciones procesales romanas', 'Derecho Romano', 'Cátedra B', 'Cuadro comparativo', '2025-10-14', 4),
  apunte('a05', 'Derecho indiano y codificación', 'Historia del Derecho', 'Cátedra A', 'Resumen', '2025-09-30', 18),
  apunte('a06', 'Parte dogmática: declaraciones, derechos y garantías', 'Derecho Constitucional', 'Cátedra A', 'Resumen', '2026-06-01', 42),
  apunte('a07', 'Control de constitucionalidad: fallos clave', 'Derecho Constitucional', 'Cátedra B', 'Cuadro comparativo', '2026-05-19', 12),
  apunte('a08', 'Modelo de final oral', 'Derecho Constitucional', 'Cátedra C', 'Modelo de examen', '2025-12-03', 5),
  apunte('a09', 'Hechos y actos jurídicos', 'Derecho Civil: Parte General', 'Cátedra A', 'Apunte de clase', '2026-05-28', 27),
  apunte('a10', 'Teoría del delito', 'Derecho Penal: Parte General', 'Cátedra A', 'Resumen', '2026-06-12', 36),
  apunte('a11', 'Casos prácticos de autoría y participación', 'Derecho Penal: Parte General', 'Cátedra B', 'Guía de estudio', '2026-07-04', 10),
  apunte('a12', 'Clasificación de las obligaciones', 'Obligaciones', 'Cátedra A', 'Resumen', '2026-04-15', 22),
  apunte('a13', 'Acto y procedimiento administrativo', 'Derecho Administrativo', 'Cátedra A', 'Apunte de clase', '2026-08-20', 29),
  apunte('a14', 'Tipos societarios: cuadro comparativo', 'Sociedades', 'Cátedra B', 'Cuadro comparativo', '2026-03-30', 6),
  apunte('a15', 'Contratos en particular', 'Contratos', 'Cátedra A', 'Resumen', '2026-09-05', 48),
  apunte('a16', 'Modelo de parcial escrito', 'Contratos', 'Cátedra B', 'Modelo de examen', '2025-11-11', 3),
  apunte('a17', 'Etapas del proceso de conocimiento', 'Derecho Procesal Civil', 'Cátedra A', 'Guía de estudio', '2026-07-22', 15),
  apunte('a18', 'Tratados y fuentes del derecho internacional', 'Derecho Internacional Público', 'Cátedra A', 'Resumen', '2026-06-25', 26),
  apunte('a19', 'Régimen sucesorio', 'Familia y Sucesiones', 'Cátedra A', 'Apunte de clase', '2026-08-08', 33),
  apunte('a20', 'Iusnaturalismo y positivismo', 'Filosofía del Derecho', 'Cátedra A', 'Resumen', '2025-10-28', 20),
];
