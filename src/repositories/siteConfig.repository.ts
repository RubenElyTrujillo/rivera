import { db } from "@/infrastructure/db/client";

/** Configuración global del sitio (visibilidad de secciones, etc.). */
export interface ISiteConfig {
  id: number;
  /** Si es `false`, la sección "Pisos y Acabados" se oculta en el home. */
  showMaterials: boolean;
  /** Si es `false`, la sección "Showroom" se oculta en el home. */
  showShowroom: boolean;
  /** Última modificación de la configuración. */
  updatedAt: Date;
}

// Prisma SiteConfig type with updatedAt
type SiteConfigWithUpdatedAt = {
  id: number;
  showMaterials: boolean;
  showShowroom: boolean;
  updatedAt: Date;
};

/**
 * Repositorio para la configuración global del sitio.
 * Siempre existe exactamente un registro (patrón singleton via upsert).
 */
export const siteConfigRepository = {
  /**
   * Obtiene la configuración actual del sitio.
   * Si no existe, la crea con los valores por defecto.
   *
   * @returns Configuración del sitio.
   */
  async get(): Promise<ISiteConfig> {
    const existing = await db.siteConfig.findFirst();
    if (existing) {
      return existing as unknown as SiteConfigWithUpdatedAt;
    }
    const created = await db.siteConfig.create({ data: {} });
    return created as unknown as SiteConfigWithUpdatedAt;
  },

  /**
   * Actualiza la configuración del sitio.
   * Hace upsert: crea si no existe, actualiza si ya existe.
   *
   * @param data - Campos a actualizar.
   * @returns Configuración actualizada.
   */
  async update(data: Partial<Omit<ISiteConfig, "id">>): Promise<ISiteConfig> {
    const existing = await db.siteConfig.findFirst();
    if (existing) {
      const updated = await db.siteConfig.update({ where: { id: existing.id }, data });
      return updated as unknown as SiteConfigWithUpdatedAt;
    }
    const created = await db.siteConfig.create({ data: { ...data } });
    return created as unknown as SiteConfigWithUpdatedAt;
  },
};
