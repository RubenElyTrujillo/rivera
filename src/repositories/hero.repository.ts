import { db } from "@/infrastructure/db/client";
import type { IHeroContent } from "@/domain/types/hero";
import type { HeroInput } from "@/domain/schemas/hero.schema";

/**
 * Repositorio para el contenido de la sección Hero.
 * Abstrae todas las operaciones de base de datos relacionadas con `HeroContent`.
 *
 * La tabla solo tiene una fila. Si no existe, se crea al hacer upsert.
 */
export const heroRepository = {
  /**
   * Obtiene el contenido del Hero.
   * @returns El registro o `null` si aún no se ha configurado.
   */
  async findOne(): Promise<IHeroContent | null> {
    return db.heroContent.findFirst();
  },

  /**
   * Crea o actualiza el contenido del Hero.
   * Usa upsert lógico: actualiza si existe, crea si no.
   *
   * @param data - Datos validados del Hero.
   * @returns El registro actualizado o creado.
   */
  async upsert(data: HeroInput): Promise<IHeroContent> {
    const existing = await db.heroContent.findFirst();
    if (existing) {
      return db.heroContent.update({ where: { id: existing.id }, data });
    }
    return db.heroContent.create({ data });
  },
};
