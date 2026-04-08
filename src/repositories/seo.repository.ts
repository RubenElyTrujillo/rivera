import { db } from "@/infrastructure/db/client";
import type { ISeoSettings } from "@/domain/types/seo";
import type { SeoInput } from "@/domain/schemas/seo.schema";

/**
 * Repositorio para la configuración SEO del sitio.
 * La tabla solo tiene una fila.
 */
export const seoRepository = {
  /**
   * Obtiene la configuración SEO.
   * @returns El registro o `null` si aún no se ha configurado.
   */
  async findOne(): Promise<ISeoSettings | null> {
    return db.seoSettings.findFirst();
  },

  /**
   * Crea o actualiza la configuración SEO.
   *
   * @param data - Datos validados de SEO.
   * @returns El registro actualizado o creado.
   */
  async upsert(data: SeoInput): Promise<ISeoSettings> {
    const existing = await db.seoSettings.findFirst();
    if (existing) {
      return db.seoSettings.update({ where: { id: existing.id }, data });
    }
    return db.seoSettings.create({ data });
  },
};
