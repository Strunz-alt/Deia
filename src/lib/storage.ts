/**
 * Almacenamiento de archivos subidos desde el panel.
 *
 * Los archivos se guardan en disco (UPLOADS_DIR, por defecto `data/uploads`)
 * con nombres aleatorios: `<carpeta>/<uuid>.<ext>`. La clave resultante es lo
 * que se guarda en la base de datos.
 *
 * - Imágenes (carpetas públicas): se sirven en `/media/<clave>`.
 * - Materiales de estudio (`materiales/`): sólo se entregan a usuarios con
 *   sesión iniciada, a través de `/apuntes/archivo/<id>`.
 *
 * El tipo se valida por la firma real del archivo (no sólo por la extensión
 * o el tipo informado por el navegador).
 */
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || 'data/uploads');

export const PUBLIC_FOLDERS = ['materias', 'miembros', 'logros', 'noticias', 'charlas', 'interuca'] as const;
export type PublicFolder = (typeof PUBLIC_FOLDERS)[number];
export type Folder = PublicFolder | 'materiales';

const MB = 1024 * 1024;

export const IMAGE_RULES = {
  maxBytes: 5 * MB,
  label: 'JPG, PNG o WebP de hasta 5 MB',
  accept: 'image/jpeg,image/png,image/webp',
};

export const DOCUMENT_RULES = {
  maxBytes: 25 * MB,
  label: 'PDF, Word (.docx) o PowerPoint (.pptx) de hasta 25 MB',
  accept: '.pdf,.docx,.pptx,application/pdf',
};

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export const mimeForKey = (key: string) => MIME[key.split('.').pop() ?? ''] ?? 'application/octet-stream';

export class UploadError extends Error {}

function detectImage(buf: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

function detectDocument(buf: Buffer, filename: string): 'pdf' | 'docx' | 'pptx' | null {
  if (buf.length >= 5 && buf.toString('ascii', 0, 5) === '%PDF-') return 'pdf';
  const isZip = buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
  if (isZip) {
    // Los documentos de Office son ZIP; se verifica la carpeta interna característica.
    const head = buf.toString('latin1', 0, Math.min(buf.length, 64 * 1024));
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'docx' && head.includes('word/')) return 'docx';
    if (ext === 'pptx' && head.includes('ppt/')) return 'pptx';
    if (head.includes('word/')) return 'docx';
    if (head.includes('ppt/')) return 'pptx';
  }
  return null;
}

/** `true` si el campo de formulario trae un archivo seleccionado. */
export const hasFile = (value: FormDataEntryValue | null): value is File =>
  value instanceof File && value.size > 0 && value.name !== '';

export interface StoredFile {
  key: string;
  nombre: string;
  tipo: string;
  tamano: number;
}

async function write(folder: Folder, ext: string, buf: Buffer) {
  const key = `${folder}/${randomUUID()}.${ext}`;
  const full = path.join(UPLOADS_DIR, key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, buf, { flag: 'wx' });
  return key;
}

export async function saveImage(file: File, folder: PublicFolder): Promise<StoredFile> {
  if (file.size > IMAGE_RULES.maxBytes) throw new UploadError(`La imagen «${file.name}» supera los 5 MB.`);
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectImage(buf);
  if (!ext) throw new UploadError(`«${file.name}» no es una imagen válida. Formatos permitidos: JPG, PNG o WebP.`);
  const key = await write(folder, ext, buf);
  return { key, nombre: file.name, tipo: MIME[ext], tamano: buf.length };
}

export async function saveDocument(file: File): Promise<StoredFile> {
  if (file.size > DOCUMENT_RULES.maxBytes) throw new UploadError(`El archivo «${file.name}» supera los 25 MB.`);
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectDocument(buf, file.name);
  if (!ext) throw new UploadError(`«${file.name}» no es un PDF, Word (.docx) o PowerPoint (.pptx) válido.`);
  const key = await write('materiales', ext, buf);
  const base = file.name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').slice(0, 150) || `material.${ext}`;
  const nombre = base.toLowerCase().endsWith(`.${ext}`) ? base : `${base}.${ext}`;
  return { key, nombre, tipo: MIME[ext], tamano: buf.length };
}

const KEY_RE = /^(materias|miembros|logros|noticias|charlas|interuca|materiales)\/[0-9a-f-]{36}\.(jpg|png|webp|pdf|docx|pptx)$/;

/** Ruta absoluta de un archivo guardado, o `null` si la clave no es válida. */
export function resolveKey(key: string) {
  if (!KEY_RE.test(key)) return null;
  const full = path.join(UPLOADS_DIR, key);
  return full.startsWith(UPLOADS_DIR + path.sep) ? full : null;
}

export async function readStored(key: string) {
  const full = resolveKey(key);
  if (!full) return null;
  try {
    return await fs.readFile(full);
  } catch {
    return null;
  }
}

/** Elimina archivos sin fallar si alguno ya no existe. */
export async function deleteStored(...keys: (string | null | undefined)[]) {
  await Promise.all(
    keys.map(async (key) => {
      const full = key ? resolveKey(key) : null;
      if (!full) return;
      await fs.rm(full, { force: true }).catch(() => {});
    }),
  );
}

/** URL pública de una imagen guardada. */
export const mediaUrl = (key: string | null | undefined) => (key ? `/media/${key}` : null);

export const formatBytes = (n: number) =>
  n >= MB ? `${(n / MB).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
