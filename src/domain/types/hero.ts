/**
 * Contenido de la sección Hero del sitio público.
 * Se almacena en la tabla `HeroContent` de la base de datos.
 */
export interface IHeroContent {
  subtitle: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  /** URL relativa o absoluta de la imagen de fondo. Ej: /uploads/foto.webp */
  imageUrl: string;
}
