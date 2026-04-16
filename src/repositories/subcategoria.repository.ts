import { db } from "@/infrastructure/db/client"
import { toSlug } from "@/lib/toSlug"
import type { ISubcategoria } from "@/domain/types"
import type { SubcategoriaInput } from "@/domain/schemas/subcategoria.schema"

export const subcategoriaRepository = {
  async findAll(categoriaId?: number): Promise<ISubcategoria[]> {
    return db.subcategoria.findMany({
      where: categoriaId ? { categoriaId } : undefined,
      orderBy: { id: "asc" },
      include: {
        categoria: { select: { id: true, name: true, slug: true } },
        _count: { select: { productos: true } },
      },
    }) as unknown as ISubcategoria[]
  },

  async findBySlug(slug: string): Promise<ISubcategoria | null> {
    const row = await db.subcategoria.findUnique({
      where: { slug },
      include: {
        categoria: { select: { id: true, name: true, slug: true } },
        productos: {
          orderBy: { id: "asc" },
          select: { id: true, name: true, slug: true, coverImage: true, hoverImage: true, shortDesc: true, subcategoriaId: true, htmlContent: true },
        },
      },
    })
    return row as unknown as ISubcategoria | null
  },

  async create(input: SubcategoriaInput): Promise<ISubcategoria> {
    return db.subcategoria.create({
      data: {
        categoriaId: input.categoriaId,
        name:        input.name,
        slug:        toSlug(input.name),
        coverImage:  input.coverImage ?? null,
        bannerImage: input.bannerImage ?? null,
        description: input.description ?? null,
        gridCols:    input.gridCols ?? 3,
        cardAspect:  input.cardAspect ?? "cuadrada",
      },
    }) as unknown as ISubcategoria
  },

  async update(id: number, input: Partial<SubcategoriaInput>): Promise<ISubcategoria> {
    return db.subcategoria.update({
      where: { id },
      data: {
        ...(input.categoriaId !== undefined && { categoriaId: input.categoriaId }),
        ...(input.name        !== undefined && { name: input.name, slug: toSlug(input.name) }),
        ...(input.coverImage  !== undefined && { coverImage: input.coverImage }),
        ...(input.bannerImage !== undefined && { bannerImage: input.bannerImage }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.gridCols    !== undefined && { gridCols: input.gridCols }),
        ...(input.cardAspect  !== undefined && { cardAspect: input.cardAspect }),
      },
    }) as unknown as ISubcategoria
  },

  async delete(id: number): Promise<void> {
    await db.subcategoria.delete({ where: { id } })
  },
}
