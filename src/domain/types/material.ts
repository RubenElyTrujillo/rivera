/**
 * Acabado individual de un material (color, textura, código de producto).
 * Se almacena en la tabla `MaterialFinish`, relacionada a `Material`.
 */
export interface IMaterialFinish {
  id: number;
  materialId: number;
  name: string;
  slug: string;
  code: string;
  /** @deprecated Replaced by collectionId relation. */
  collection?: string;
  /** URL relativa de la imagen del acabado. */
  image: string;
  /** Dimensiones del producto. Ej: "1220 x 183 mm". */
  dims: string;
  desc: string;
  order: number;
  hoverImage: string;
  pdfUrl: string;
  thickness: string;
  useClass: string;
  waterRes: boolean;
  installType: string;
  warranty: string;
  specMd: string;
  collectionId: number;
  images?: IMaterialFinishImage[];
}

/**
 * Material de piso o recubrimiento con su galería de acabados.
 * Se almacena en la tabla `Material` de la base de datos.
 * El campo `collections` se guarda como JSON string en DB y se parsea al leer.
 */
export interface IMaterial {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  desc: string;
  /** Especificaciones técnicas del material. */
  spec: string;
  /** URL relativa de la imagen de portada. */
  coverImage: string;
  /** Lista de nombres de colecciones disponibles. */
  collections: string[];
  order: number;
  categoryId: number | null;
  finishes: IMaterialFinish[];
}

export interface IMaterialCollection {
  id: number;
  materialId: number;
  name: string;
  slug: string;
  desc: string;
  coverImage: string;
  order: number;
}

export interface IMaterialFinishImage {
  id: number;
  finishId: number;
  url: string;
  caption: string;
  order: number;
}
