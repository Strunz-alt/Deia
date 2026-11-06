/**
 * Utilidades para validar formularios en el servidor con Zod.
 * Los mensajes de error están pensados para mostrarse junto a cada campo.
 */
import { z } from 'astro/zod';

export type FieldErrors = Record<string, string>;
export type FormValues = Record<string, string>;

export type ParseResult<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

/** Campos de texto del formulario (ignora archivos). Los checkbox valen "on". */
export function formValues(form: FormData): FormValues {
  const values: FormValues = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string' && !(key in values)) values[key] = value;
  }
  return values;
}

export function parseWith<S extends z.ZodType>(schema: S, input: unknown): ParseResult<z.output<S>> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_form';
    errors[key] ??= issue.message;
  }
  return { ok: false, errors };
}

const emptyToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

/* ---------- Constructores de campos ---------- */

export const req = (label: string, max = 200) =>
  z
    .string({ error: `Completá ${label}.` })
    .trim()
    .min(1, `Completá ${label}.`)
    .max(max, `Máximo ${max} caracteres.`);

export const opt = (max = 500) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max, `Máximo ${max} caracteres.`).optional()).transform(
    (v) => v ?? null,
  );

const isValidDate = (s: string) => {
  const d = new Date(`${s}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

export const date = (label = 'la fecha') =>
  z
    .string({ error: `Completá ${label}.` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, `Ingresá ${label} con el formato AAAA-MM-DD.`)
    .refine(isValidDate, 'La fecha no es válida.');

export const optTime = () =>
  z
    .preprocess(emptyToUndefined, z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Ingresá un horario válido (HH:MM).').optional())
    .transform((v) => v ?? null);

export const optUrl = () =>
  z
    .preprocess(
      emptyToUndefined,
      z.url({ protocol: /^https?$/, error: 'Ingresá un enlace válido que empiece con https://' }).max(500).optional(),
    )
    .transform((v) => v ?? null);

export const intIn = (label: string, min: number, max: number) =>
  z.coerce
    .number({ error: `Ingresá ${label}.` })
    .int(`${label} debe ser un número entero.`)
    .min(min, `${label} debe ser entre ${min} y ${max}.`)
    .max(max, `${label} debe ser entre ${min} y ${max}.`);

export const optIntIn = (label: string, min: number, max: number) =>
  z.preprocess(emptyToUndefined, intIn(label, min, max).optional()).transform((v) => v ?? null);

export const oneOf = <const T extends readonly [string, ...string[]]>(values: T, message = 'Elegí una opción válida.') =>
  z.enum(values, { error: message });

export const checkbox = () => z.preprocess((v) => v === 'on' || v === 'true' || v === '1', z.boolean());

export const idRef = (message: string) => z.coerce.number({ error: message }).int(message).positive(message);

export const optIdRef = () =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()).transform((v) => v ?? null);

/** Id numérico de la URL o `null`. */
export const paramId = (value: string | undefined) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

/** Hoy en formato AAAA-MM-DD (hora argentina). */
export const todayISO = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());
