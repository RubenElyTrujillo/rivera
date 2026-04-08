/**
 * Proyecto de galería mostrado en la sección Espacios.
 * Se almacena en la tabla `SpaceProject` de la base de datos.
 */
export interface ISpaceProject {
  id: number;
  title: string;
  /** Ej: "Residencial", "Comercial", "Exterior". */
  category: string;
  /** URL relativa de la imagen del proyecto. */
  imageUrl: string;
  order: number;
}
