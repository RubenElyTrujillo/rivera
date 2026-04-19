import { db } from "@/infrastructure/db/client";
import type { IPagina, IPaginaBloque } from "@/domain/types/pagina";
import type { PaginaInput } from "@/domain/schemas/pagina.schema";
import type { PaginaBloqueInput, BlockType } from "@/domain/schemas/paginaBloque.schema";

function mapBloque(row: { id: number; paginaId: number; order: number; type: string; config: string; visible: boolean }): IPaginaBloque {
  return {
    id: row.id,
    paginaId: row.paginaId,
    order: row.order,
    type: row.type as BlockType,
    config: row.config,
    visible: row.visible,
  };
}

export const paginaRepository = {
  async findAll(): Promise<IPagina[]> {
    const rows = await db.pagina.findMany({
      orderBy: { updatedAt: "desc" },
      include: { bloques: { orderBy: { order: "asc" } } },
    });
    return rows.map((p) => ({ ...p, bloques: p.bloques.map(mapBloque) }));
  },

  async findById(id: number): Promise<IPagina | null> {
    const row = await db.pagina.findUnique({
      where: { id },
      include: { bloques: { orderBy: { order: "asc" } } },
    });
    if (!row) return null;
    return { ...row, bloques: row.bloques.map(mapBloque) };
  },

  async findBySlug(slug: string): Promise<IPagina | null> {
    const row = await db.pagina.findUnique({
      where: { slug },
      include: { bloques: { orderBy: { order: "asc" } } },
    });
    if (!row) return null;
    return { ...row, bloques: row.bloques.map(mapBloque) };
  },

  async findPublishedBySlug(slug: string): Promise<IPagina | null> {
    const row = await db.pagina.findFirst({
      where: { slug, published: true },
      include: { bloques: { where: { visible: true }, orderBy: { order: "asc" } } },
    });
    if (!row) return null;
    return { ...row, bloques: row.bloques.map(mapBloque) };
  },

  async create(input: PaginaInput): Promise<IPagina> {
    const row = await db.pagina.create({ data: input, include: { bloques: true } });
    return { ...row, bloques: row.bloques.map(mapBloque) };
  },

  async update(id: number, input: PaginaInput): Promise<IPagina> {
    const row = await db.pagina.update({
      where: { id },
      data: input,
      include: { bloques: { orderBy: { order: "asc" } } },
    });
    return { ...row, bloques: row.bloques.map(mapBloque) };
  },

  async delete(id: number): Promise<void> {
    await db.pagina.delete({ where: { id } });
  },

  async replaceBloques(paginaId: number, bloques: PaginaBloqueInput[]): Promise<IPaginaBloque[]> {
    return db.$transaction(async (tx) => {
      await tx.paginaBloque.deleteMany({ where: { paginaId } });
      if (bloques.length === 0) return [];
      await tx.paginaBloque.createMany({
        data: bloques.map((b, i) => ({
          paginaId,
          order: i,
          type: b.type,
          config: b.config,
          visible: b.visible,
        })),
      });
      const rows = await tx.paginaBloque.findMany({
        where: { paginaId },
        orderBy: { order: "asc" },
      });
      return rows.map(mapBloque);
    });
  },
};
