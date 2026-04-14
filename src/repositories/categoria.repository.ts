import { db } from "@/infrastructure/db/client"
import { toSlug } from "@/lib/toSlug"
import type { ICategoria } from "@/domain/types"
import type { CategoriaInput } from "@/domain/schemas/categoria.schema"

export const categoriaRepository = {
  async findAll(): Promise<ICategoria[]> {
    return db.categoria.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { subcategorias: true } } },
    }) as unknown as ICategoria[]
  },

  async findBySlug(slug: string): Promise<ICategoria | null> {
    const row = await db.categoria.findUnique({
      where: { slug },
      include: {
        subcategorias: {
          orderBy: { order: "asc" },
          include: { _count: { select: { productos: true } } },
        },
      },
    })
    return row as unknown as ICategoria | null
  },

  async create(input: CategoriaInput): Promise<ICategoria> {
    return db.categoria.create({
      data: {
        name:        input.name,
        slug:        toSlug(input.name),
        coverImage:  input.coverImage ?? null,
        description: input.description ?? null,
        order:       input.order ?? 0,
      },
    }) as unknown as ICategoria
  },

  async update(id: number, input: Partial<CategoriaInput>): Promise<ICategoria> {
    return db.categoria.update({
      where: { id },
      data: {
        ...(input.name        !== undefined && { name: input.name, slug: toSlug(input.name) }),
        ...(input.coverImage  !== undefined && { coverImage: input.coverImage }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.order       !== undefined && { order: input.order }),
      },
    }) as unknown as ICategoria
  },

  async delete(id: number): Promise<void> {
    await db.categoria.delete({ where: { id } })
  },
}
