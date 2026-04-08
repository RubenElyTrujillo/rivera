/**
 * Contenido del pie de página del sitio público.
 * Se almacena en la tabla `FooterContent` de la base de datos.
 * El campo `services` se guarda como JSON string en DB y se parsea al leer.
 */
export interface IFooterContent {
  tagline: string;
  /** Lista de servicios mostrados en el footer. */
  services: string[];
}
