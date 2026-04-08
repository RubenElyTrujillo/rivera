/**
 * Archivo subido al sistema de medios (imagen o PDF).
 * Se almacena en la tabla `Media` de la base de datos.
 * Las imágenes se convierten automáticamente a WebP al subirse.
 */
export interface IMedia {
  id: number;
  /** Nombre legible del archivo, sin incluir el hash de timestamp. */
  filename: string;
  /** URL relativa accesible públicamente. Ej: /uploads/foto-1712345678.webp */
  url: string;
  /** MIME type del archivo. Ej: "image/webp", "application/pdf". */
  mimeType: string;
  /** Tamaño del archivo en bytes. */
  size: number;
  createdAt: string;
}
