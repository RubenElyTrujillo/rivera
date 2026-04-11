import { db } from "@/infrastructure/db/client";
import { toSlug } from "@/lib/toSlug";
import type { IMaterialCollection } from "@/domain/types/material";
import type { CollectionInput } from "@/domain/schemas/finish.schema";

export const collectionRepository = {
  async findByMaterial(materialId: number): Promise<IMaterialCollection[]> {
    const rows = await db.materialCollection.findMany({
      where: { materialId },
      orderBy: { order: "asc" },
    });
    return rows as unknown as IMaterialCollection[];
  },

  async findById(id: number): Promise<IMaterialCollection | null> {
    const row = await db.materialCollection.findUnique({ where: { id } });
    return row ? (row as unknown as IMaterialCollection) : null;
  },

  async create(input: CollectionInput): Promise<IMaterialCollection> {
    const row = await db.materialCollection.create({
      data: {
        materialId: input.materialId,
        name:       input.name,
        slug:       toSlug(input.name),
        desc:       input.desc,
        coverImage: input.coverImage,
        order:      input.order,
      },
    });
    return row as unknown as IMaterialCollection;
  },

  async update(id: number, input: Partial<CollectionInput>): Promise<IMaterialCollection> {
    const row = await db.materialCollection.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name, slug: toSlug(input.name) }),
        ...(input.desc !== undefined && { desc: input.desc }),
        ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
        ...(input.order !== undefined && { order: input.order }),
      },
    });
    return row as unknown as IMaterialCollection;
  },

  async delete(id: number): Promise<void> {
    await db.materialCollection.delete({ where: { id } });
  },
};
