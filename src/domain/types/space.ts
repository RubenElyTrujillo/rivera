/**
 * Imagen adicional de un proyecto de espacio.
 * Se almacena en la tabla `SpaceProjectImage` de la base de datos.
 */
export interface ISpaceProjectImage {
  id: number;
  spaceProjectId: number;
  url: string;
  caption: string;
  order: number;
}

/**
 * Proyecto de galería mostrado en la sección Espacios.
 * Se almacena en la tabla `SpaceProject` de la base de datos.
 */
export interface ISpaceProject {
  id: number;
  title: string;
  /** Ej: "Residencial", "Comercial", "Exterior". */
  category: string;
  /** URL relativa de la imagen de portada del proyecto. */
  imageUrl: string;
  /** Descripción del proyecto (HTML o texto plano). */
  description?: string;
  order: number;
  /** Imágenes adicionales del proyecto (galería). */
  images?: ISpaceProjectImage[];
}
