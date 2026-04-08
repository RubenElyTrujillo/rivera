import path from "path";
import fs from "fs";

/** Directorio absoluto donde se almacenan los uploads. */
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Crea el directorio de uploads si no existe.
 * Se debe llamar antes de cualquier operación de escritura de archivos.
 */
export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Elimina un archivo del disco si existe.
 * No lanza error si el archivo no se encuentra.
 *
 * @param filepath - Ruta absoluta del archivo a eliminar.
 */
export function removeFileIfExists(filepath: string): void {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

/**
 * Sanitiza un nombre de archivo para uso en URLs y sistemas de archivos:
 * elimina acentos, reemplaza caracteres especiales por guiones y convierte a minúsculas.
 *
 * @param name - Nombre original del archivo (sin extensión).
 * @returns Nombre sanitizado.
 *
 * @example
 *   sanitizeName("Foto de Otoño") // → "foto-de-otono"
 */
export function sanitizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

/**
 * Genera un nombre de archivo único añadiendo un timestamp al nombre base.
 *
 * @param base - Nombre sanitizado sin extensión.
 * @param ext  - Extensión con punto. Ej: ".webp", ".pdf".
 * @returns Nombre único. Ej: "foto-portada-1712345678000.webp".
 */
export function uniqueFilename(base: string, ext: string): string {
  return `${base}-${Date.now()}${ext}`;
}
