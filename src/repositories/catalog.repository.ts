import { db } from "@/infrastructure/db/client";
import type { ICatalogContent } from "@/domain/types/catalog";
import type { CatalogInput } from "@/domain/schemas/catalog.schema";

/**
 * Repositorio para el contenido de la sección Catálogo.
 * La tabla solo tiene una fila.
 */
export const catalogRepository = {
  /**
   * Obtiene el contenido del Catálogo.
   * @returns El registro o `null` si aún no se ha configurado.
   */
  async findOne(): Promise<ICatalogContent | null> {
    return db.catalogContent.findFirst();
  },

  /**
   * Crea o actualiza el contenido del Catálogo.
   *
   * @param data - Datos validados del Catálogo.
   * @returns El registro actualizado o creado.
   */
  async upsert(data: CatalogInput): Promise<ICatalogContent> {
    const existing = await db.catalogContent.findFirst();
    if (existing) {
      return db.catalogContent.update({ where: { id: existing.id }, data });
    }
    return db.catalogContent.create({ data });
  },
};
