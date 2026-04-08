import { db } from "@/infrastructure/db/client";
import type { ISpaceCategory } from "@/domain/types/spaceCategory";
import type { SpaceCategoryInput } from "@/domain/schemas/spaceCategory.schema";

/** Genera un slug URL-friendly a partir de un nombre. */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Repositorio para las categorías de espacios.
 * Abstrae todas las operaciones de base de datos relacionadas con `SpaceCategory`.
 */
export const spaceCategoryRepository = {
  /**
   * Obtiene todas las categorías ordenadas por `order`.
   *
   * @returns Lista de categorías.
   */
  async findAll(): Promise<ISpaceCategory[]> {
    return db.spaceCategory.findMany({ orderBy: { order: "asc" } });
  },

  /**
   * Busca una categoría por su slug.
   *
   * @param slug - Slug de la categoría.
   * @returns Categoría o null si no existe.
   */
  async findBySlug(slug: string): Promise<ISpaceCategory | null> {
    return db.spaceCategory.findUnique({ where: { slug } });
  },

  /**
   * Reemplaza toda la lista de categorías en una transacción atómica.
   * El slug se genera automáticamente desde el nombre si no existe.
   *
   * @param categories - Lista completa a guardar.
   * @returns Nueva lista ordenada.
   */
  async replaceAll(categories: SpaceCategoryInput[]): Promise<ISpaceCategory[]> {
    return db.$transaction(async (tx) => {
      await tx.spaceCategory.deleteMany();
      for (const [i, cat] of categories.entries()) {
        await tx.spaceCategory.create({
          data: {
            name:       cat.name,
            slug:       toSlug(cat.name),
            coverImage: cat.coverImage ?? "",
            order:      cat.order ?? i,
          },
        });
      }
      return tx.spaceCategory.findMany({ orderBy: { order: "asc" } });
    });
  },
};
