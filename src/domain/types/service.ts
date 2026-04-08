/**
 * Tarjeta de servicio mostrada en la sección Servicios.
 * Se almacena en la tabla `Service` de la base de datos.
 */
export interface IService {
  id: number;
  /** Nombre del ícono de Lucide React. Ej: "Layers", "Wrench". */
  icon: string;
  title: string;
  subtitle: string;
  desc: string;
  /** Posición en la lista. Determina el orden de renderizado. */
  order: number;
}
