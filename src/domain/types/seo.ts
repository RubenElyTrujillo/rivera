/**
 * Configuración SEO del sitio: meta tags y Open Graph.
 * Se almacena en la tabla `SeoSettings` de la base de datos.
 */
export interface ISeoSettings {
  title: string;
  description: string;
  /** Palabras clave separadas por comas. */
  keywords: string;
  /** URL de la imagen Open Graph. Puede estar vacía. */
  ogImageUrl: string;
}
