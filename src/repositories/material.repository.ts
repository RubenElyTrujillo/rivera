import { db } from "@/infrastructure/db/client";
import { toSlug } from "@/lib/toSlug";
import type { IMaterial } from "@/domain/types/material";
import type { MaterialInput } from "@/domain/schemas/material.schema";

const WITH_COLLECTIONS = {
  collections: {
    orderBy: { order: "asc" as const },
    include: {
      finishes: {
        orderBy: { order: "asc" as const },
        include: {
          images: { orderBy: { order: "asc" as const } },
          collection: true,
        },
      },
    },
  },
  finishes: {
    orderBy: { order: "asc" as const },
    include: {
      images: { orderBy: { order: "asc" as const } },
      collection: true,
    },
  },
};

/** Normalize a raw Prisma finish row: map collection relation → collection string name. */
function normalizeFinish(f: Record<string, unknown>): Record<string, unknown> {
  const col = f.collection as { name?: string } | null | undefined;
  return { ...f, collection: col?.name ?? undefined };
}

/** Recursively normalize all finishes inside a material row. */
function normalizeMaterial(row: Record<string, unknown>): Record<string, unknown> {
  const finishes = Array.isArray(row.finishes)
    ? row.finishes.map(normalizeFinish)
    : row.finishes;
  const collections = Array.isArray(row.collections)
    ? row.collections.map((c: Record<string, unknown>) => ({
        ...c,
        finishes: Array.isArray(c.finishes)
          ? c.finishes.map(normalizeFinish)
          : c.finishes,
      }))
    : row.collections;
  return { ...row, finishes, collections };
}

export const materialRepository = {
  async findAll(): Promise<IMaterial[]> {
    const rows = await db.material.findMany({
      orderBy: { order: "asc" },
      include: WITH_COLLECTIONS,
    });
    return rows.map((r) => normalizeMaterial(r as Record<string, unknown>)) as unknown as IMaterial[];
  },

  async findByCategory(categoryId: number): Promise<IMaterial[]> {
    const rows = await db.material.findMany({
      where: { categoryId },
      orderBy: { order: "asc" },
      include: WITH_COLLECTIONS,
    });
    return rows.map((r) => normalizeMaterial(r as Record<string, unknown>)) as unknown as IMaterial[];
  },

  async findBySlug(slug: string): Promise<IMaterial | null> {
    const row = await db.material.findUnique({
      where: { slug },
      include: WITH_COLLECTIONS,
    });
    return row ? normalizeMaterial(row as Record<string, unknown>) as unknown as IMaterial : null;
  },

  async findById(id: number): Promise<IMaterial | null> {
    const row = await db.material.findUnique({
      where: { id },
      include: WITH_COLLECTIONS,
    });
    return row ? normalizeMaterial(row as Record<string, unknown>) as unknown as IMaterial : null;
  },

  async replaceAll(materials: MaterialInput[]): Promise<IMaterial[]> {
    const rows = await db.$transaction(async (tx) => {
      await tx.material.deleteMany();
      for (const [i, m] of materials.entries()) {
        await tx.material.create({
          data: {
            name:       m.name,
            slug:       toSlug(m.name),
            subtitle:   m.subtitle,
            desc:       m.desc,
            spec:       m.spec,
            coverImage: m.coverImage,
            order:      m.order ?? i,
            categoryId: m.categoryId ?? null,
          },
        });
      }
      return tx.material.findMany({
        orderBy: { order: "asc" },
        include: WITH_COLLECTIONS,
      });
    });
    return rows.map((r) => normalizeMaterial(r as Record<string, unknown>)) as unknown as IMaterial[];
  },

  async create(data: MaterialInput): Promise<IMaterial> {
    const row = await db.material.create({
      data: {
        name:       data.name,
        slug:       toSlug(data.name),
        subtitle:   data.subtitle,
        desc:       data.desc,
        spec:       data.spec,
        coverImage: data.coverImage,
        order:      data.order,
        categoryId: data.categoryId ?? null,
      },
      include: WITH_COLLECTIONS,
    });
    return normalizeMaterial(row as Record<string, unknown>) as unknown as IMaterial;
  },

  async update(id: number, data: Partial<MaterialInput>): Promise<IMaterial> {
    const row = await db.material.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name, slug: toSlug(data.name) }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.desc !== undefined && { desc: data.desc }),
        ...(data.spec !== undefined && { spec: data.spec }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId ?? null }),
      },
      include: WITH_COLLECTIONS,
    });
    return normalizeMaterial(row as Record<string, unknown>) as unknown as IMaterial;
  },

  async delete(id: number): Promise<void> {
    await db.material.delete({ where: { id } });
  },
};
