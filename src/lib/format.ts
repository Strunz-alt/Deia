/** Utilidades de formato y ordenamiento compartidas por las páginas. */

const TZ = 'America/Argentina/Buenos_Aires';

/** Convierte `AAAA-MM-DD` en Date al mediodía local para evitar corrimientos de zona horaria. */
export const parseFecha = (iso: string) => new Date(`${iso}T12:00:00-03:00`);

export const formatFecha = (iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: 'long' }) =>
  new Intl.DateTimeFormat('es-AR', { timeZone: TZ, ...opts }).format(parseFecha(iso));

/** Partes separadas para "sellos" de fecha: { dia: '08', mes: 'oct', anio: '2026' }. */
export const partesFecha = (iso: string) => {
  const d = parseFecha(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-AR', { timeZone: TZ, ...o }).format(d);
  return {
    dia: f({ day: '2-digit' }),
    mes: f({ month: 'short' }).replace('.', ''),
    anio: f({ year: 'numeric' }),
    diaSemana: f({ weekday: 'long' }),
  };
};

/** Fecha de hoy (AAAA-MM-DD) en horario argentino. Se evalúa al generar el sitio. */
export const hoyISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());

export type EstadoEvento = 'proxima' | 'realizada';

export const estadoEvento = (fecha: string): EstadoEvento => (fecha >= hoyISO() ? 'proxima' : 'realizada');

export const porFechaAsc = <T extends { fecha: string }>(a: T, b: T) => a.fecha.localeCompare(b.fecha);
export const porFechaDesc = <T extends { fecha: string }>(a: T, b: T) => b.fecha.localeCompare(a.fecha);

export const slugify = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const ordinal = (n: number) => `${n}.º`;
