import sharp from "sharp";

/**
 * Convierte una imagen desde cualquier formato soportado por sharp
 * (JPEG, PNG, AVIF, TIFF, etc.) a WebP optimizado.
 *
 * Configuración: quality=82 ofrece una relación calidad/tamaño óptima para web.
 * effort=4 es el nivel de compresión (0–6); equilibra velocidad y compresión.
 *
 * @param inputPath  - Ruta absoluta del archivo de imagen de entrada.
 * @param outputPath - Ruta absoluta donde se guardará el WebP resultante.
 * @returns Promise que resuelve cuando la conversión termina.
 *
 * @example
 *   await convertToWebP("/tmp/upload_abc.jpg", "/public/uploads/foto-123.webp");
 */
export async function convertToWebP(inputPath: string, outputPath: string): Promise<void> {
  await sharp(inputPath)
    .webp({ quality: 82, effort: 4 })
    .toFile(outputPath);
}
