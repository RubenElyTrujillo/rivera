/**
 * Contenido de la sección Catálogo del sitio público.
 * Se almacena en la tabla `CatalogContent` de la base de datos.
 */
export interface ICatalogContent {
  title: string;
  description: string;
  /** URL relativa al archivo PDF descargable. Ej: /uploads/catalogo.pdf */
  pdfUrl: string;
  /** Texto del botón de descarga. Ej: "DESCARGAR CATÁLOGO PDF". */
  buttonText: string;
}
