import { db } from "@/infrastructure/db/client"
import { toSlug } from "@/lib/toSlug"
import type { IProducto, IProductoImagen } from "@/domain/types"
import type { ProductoInput, ProductoImagenInput } from "@/domain/schemas/producto.schema"

const WITH_FULL = {
  subcategoria: {
    select: {
      id: true, name: true, slug: true,
      categoria: { select: { id: true, name: true, slug: true } },
    },
  },
  imagenes: { orderBy: { order: "asc" as const } },
}

export const productoRepository = {
  async findAll(subcategoriaId?: number): Promise<IProducto[]> {
    return db.producto.findMany({
      where: subcategoriaId ? { subcategoriaId } : undefined,
      orderBy: { id: "asc" },
      include: WITH_FULL,
    }) as unknown as IProducto[]
  },

  async findBySlug(slug: string): Promise<IProducto | null> {
    const row = await db.producto.findUnique({
      where: { slug },
      include: WITH_FULL,
    })
    return row as unknown as IProducto | null
  },

  async create(input: ProductoInput): Promise<IProducto> {
    return db.producto.create({
      data: {
        subcategoriaId: input.subcategoriaId,
        name:           input.name,
        slug:           toSlug(input.name),
        coverImage:     input.coverImage ?? null,
        hoverImage:     input.hoverImage ?? null,
        shortDesc:      input.shortDesc ?? null,
        htmlContent:    input.htmlContent ?? null,
      },
      include: WITH_FULL,
    }) as unknown as IProducto
  },

  async update(id: number, input: Partial<ProductoInput>): Promise<IProducto> {
    return db.producto.update({
      where: { id },
      data: {
        ...(input.subcategoriaId !== undefined && { subcategoriaId: input.subcategoriaId }),
        ...(input.name           !== undefined && { name: input.name, slug: toSlug(input.name) }),
        ...(input.coverImage     !== undefined && { coverImage: input.coverImage }),
        ...(input.hoverImage     !== undefined && { hoverImage: input.hoverImage }),
        ...(input.shortDesc      !== undefined && { shortDesc: input.shortDesc }),
        ...(input.htmlContent    !== undefined && { htmlContent: input.htmlContent }),
      },
      include: WITH_FULL,
    }) as unknown as IProducto
  },

  async delete(id: number): Promise<void> {
    await db.producto.delete({ where: { id } })
  },

  async addImagen(input: ProductoImagenInput): Promise<IProductoImagen> {
    return db.productoImagen.create({ data: input }) as unknown as IProductoImagen
  },

  async deleteImagen(id: number): Promise<void> {
    await db.productoImagen.delete({ where: { id } })
  },

  async reorderImagenes(productoId: number, orderedIds: number[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) =>
        db.productoImagen.update({ where: { id }, data: { order: index } })
      )
    )
  },
}
