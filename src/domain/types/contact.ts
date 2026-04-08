/**
 * Datos de contacto y opciones del formulario de cotización.
 * Se almacena en la tabla `ContactInfo` de la base de datos.
 * El campo `surfaceOptions` se guarda como JSON string en DB y se parsea al leer.
 */
export interface IContactInfo {
  whatsappPhone: string;
  phone1: string;
  phone2: string;
  email: string;
  /** Texto de horario con saltos de línea. Ej: "Lunes a Viernes\n9:00 AM — 10:00 PM". */
  hoursText: string;
  /** Tipos de superficie disponibles en el formulario de cotización. */
  surfaceOptions: string[];
}
