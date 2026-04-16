import { db } from "@/lib/db"
import type { IProyecto } from "@/domain/types/catalog-new"
import type { ProyectoInput } from "@/domain/schemas/proyecto.schema"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-")
}

function parseAmbientes(raw: string): string[] {
  try { return JSON.parse(raw) as string[] } catch { return [] }
}

function mapProyecto(p: any): IProyecto {
  return {
    ...p,
    ambientes: parseAmbientes(p.ambientes),
  }
}

export const proyectoRepository = {
  async findAll(): Promise<IProyecto[]> {
    const rows = await db.proyecto.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { subcategoria: { select: { id: true, name: true, slug: true } } },
    })
    return rows.map(mapProyecto)
  },

  async findFeatured(): Promise<IProyecto[]> {
    const rows = await db.proyecto.findMany({
      where: { featured: true, visible: true },
      orderBy: { order: "asc" },
      include: {
        subcategoria: { select: { id: true, name: true, slug: true } },
        imagenes: { orderBy: { order: "asc" } },
      },
    })
    return rows.map(mapProyecto)
  },

  async findBySlug(slug: string): Promise<IProyecto | null> {
    const row = await db.proyecto.findUnique({
      where: { slug },
      include: {
        subcategoria: { select: { id: true, name: true, slug: true } },
        imagenes: { orderBy: { order: "asc" } },
      },
    })
    return row ? mapProyecto(row) : null
  },

  async findById(id: number): Promise<IProyecto | null> {
    const row = await db.proyecto.findUnique({
      where: { id },
      include: {
        subcategoria: { select: { id: true, name: true, slug: true } },
        imagenes: { orderBy: { order: "asc" } },
      },
    })
    return row ? mapProyecto(row) : null
  },

  async create(input: ProyectoInput): Promise<IProyecto> {
    const { imagenes, ambientes, ...data } = input
    const baseSlug = generateSlug(data.title)
    let slug = baseSlug
    let i = 1
    while (await db.proyecto.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`
    }
    const row = await db.proyecto.create({
      data: {
        ...data,
        slug,
        ambientes: JSON.stringify(ambientes ?? []),
        imagenes: imagenes?.length
          ? { create: imagenes.map((img, idx) => ({ ...img, order: img.order ?? idx })) }
          : undefined,
      },
      include: {
        subcategoria: { select: { id: true, name: true, slug: true } },
        imagenes: { orderBy: { order: "asc" } },
      },
    })
    return mapProyecto(row)
  },

  async update(id: number, input: ProyectoInput): Promise<IProyecto> {
    const { imagenes, ambientes, ...data } = input
    await db.proyectoImagen.deleteMany({ where: { proyectoId: id } })
    const row = await db.proyecto.update({
      where: { id },
      data: {
        ...data,
        ambientes: JSON.stringify(ambientes ?? []),
        imagenes: imagenes?.length
          ? { create: imagenes.map((img, idx) => ({ ...img, order: img.order ?? idx })) }
          : undefined,
      },
      include: {
        subcategoria: { select: { id: true, name: true, slug: true } },
        imagenes: { orderBy: { order: "asc" } },
      },
    })
    return mapProyecto(row)
  },

  async delete(id: number): Promise<void> {
    await db.proyecto.delete({ where: { id } })
  },
}
