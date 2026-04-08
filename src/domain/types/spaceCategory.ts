/**
 * Categoría de espacios mostrada en la sección del home.
 * Cada categoría agrupa proyectos relacionados (ej: Residencial, Comercial).
 * Se almacena en la tabla `SpaceCategory` de la base de datos.
 */
export interface ISpaceCategory {
  id: number;
  /** Nombre visible de la categoría. */
  name: string;
  /** Slug URL-friendly generado del nombre. Ej: "residencial". */
  slug: string;
  /** URL de la imagen de portada de la categoría. */
  coverImage: string;
  order: number;
}
