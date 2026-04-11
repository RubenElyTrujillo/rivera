import { db } from "@/infrastructure/db/client";
import { toSlug } from "@/lib/toSlug";
import type { ICategory } from "@/domain/types";
import type { CategoryInput } from "@/domain/schemas/category.schema";

export const categoryRepository = {
  async findAll(): Promise<ICategory[]> {
    return db.category.findMany({
      orderBy: { order: "asc" },
    }) as unknown as ICategory[];
  },

  async findById(id: number): Promise<ICategory | null> {
    return db.category.findUnique({
      where: { id },
    }) as unknown as ICategory | null;
  },

  async findBySlug(slug: string): Promise<ICategory | null> {
    return db.category.findUnique({
      where: { slug },
    }) as unknown as ICategory | null;
  },

  async create(input: CategoryInput): Promise<ICategory> {
    return db.category.create({
      data: {
        name:       input.name,
        slug:       toSlug(input.name),
        coverImage: input.coverImage ?? "",
        icon:       input.icon ?? "",
        order:      input.order ?? 0,
      },
    }) as unknown as ICategory;
  },

  async update(id: number, input: Partial<CategoryInput>): Promise<ICategory> {
    return db.category.update({
      where: { id },
      data: {
        ...(input.name       !== undefined && { name: input.name, slug: toSlug(input.name) }),
        ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
        ...(input.icon       !== undefined && { icon: input.icon }),
        ...(input.order      !== undefined && { order: input.order }),
      },
    }) as unknown as ICategory;
  },

  async delete(id: number): Promise<void> {
    await db.category.delete({ where: { id } });
  },
};
