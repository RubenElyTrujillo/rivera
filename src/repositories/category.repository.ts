import { db } from "@/infrastructure/db/client";
import type { ICategory } from "@/domain/types";
import type { CategoryInput } from "@/domain/schemas/category.schema";

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
 * Repositorio para las categorías de producto (nivel raíz).
 * Abstrae todas las operaciones de base de datos relacionadas con `Category`.
 */
export const categoryRepository = {
  async findAll(): Promise<ICategory[]> {
    return db.category.findMany({
      orderBy: { order: "asc" },
    }) as unknown as ICategory[];
  },

  async findBySlug(slug: string): Promise<ICategory | null> {
    return db.category.findUnique({
      where: { slug },
    }) as unknown as ICategory | null;
  },

  async create(input: CategoryInput): Promise<ICategory> {
    return db.category.create({
      data: {
        ...input,
        slug: toSlug(input.name),
      },
    }) as unknown as ICategory;
  },

  async update(id: number, input: Partial<CategoryInput>): Promise<ICategory> {
    const data: Record<string, unknown> = { ...input };
    if (input.name) {
      data.slug = toSlug(input.name);
    }
    return db.category.update({
      where: { id },
      data,
    }) as unknown as ICategory;
  },

  async delete(id: number): Promise<ICategory> {
    return db.category.delete({
      where: { id },
    }) as unknown as ICategory;
  },
};
