/**
 * Acabado individual de un material (color, textura, código de producto).
 * Se almacena en la tabla `MaterialFinish`, relacionada a `Material`.
 */
export interface IMaterialFinish {
  id: number;
  materialId: number;
  name: string;
  code: string;
  collection: string;
  /** URL relativa de la imagen del acabado. */
  image: string;
  /** Dimensiones del producto. Ej: "1220 x 183 mm". */
  dims: string;
  order: number;
}

/**
 * Material de piso o recubrimiento con su galería de acabados.
 * Se almacena en la tabla `Material` de la base de datos.
 * El campo `collections` se guarda como JSON string en DB y se parsea al leer.
 */
export interface IMaterial {
  id: number;
  name: string;
  subtitle: string;
  desc: string;
  /** Especificaciones técnicas del material. */
  spec: string;
  /** URL relativa de la imagen de portada. */
  coverImage: string;
  /** Lista de nombres de colecciones disponibles. */
  collections: string[];
  order: number;
  finishes: IMaterialFinish[];
}
