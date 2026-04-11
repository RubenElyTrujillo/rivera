import { db } from "@/infrastructure/db/client";
import type { IPageSection } from "@/domain/types";
import type { PageSectionInput } from "@/domain/schemas/pageSection.schema";

export const pageSectionRepository = {
  async findAll(): Promise<IPageSection[]> {
    return db.pageSection.findMany({
      orderBy: { order: "asc" },
    }) as unknown as IPageSection[];
  },

  async findById(id: number): Promise<IPageSection | null> {
    return db.pageSection.findUnique({
      where: { id },
    }) as unknown as IPageSection | null;
  },

  async findVisible(): Promise<IPageSection[]> {
    return db.pageSection.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
    }) as unknown as IPageSection[];
  },

  async findByType(type: string): Promise<IPageSection[]> {
    return db.pageSection.findMany({
      where: { type },
      orderBy: { order: "asc" },
    }) as unknown as IPageSection[];
  },

  async create(input: PageSectionInput): Promise<IPageSection> {
    return db.pageSection.create({
      data: {
        type:    input.type,
        order:   input.order ?? 0,
        visible: input.visible ?? true,
        config:  input.config ?? "{}",
      },
    }) as unknown as IPageSection;
  },

  async update(id: number, input: Partial<PageSectionInput>): Promise<IPageSection> {
    return db.pageSection.update({
      where: { id },
      data: {
        ...(input.type    !== undefined && { type: input.type }),
        ...(input.order   !== undefined && { order: input.order }),
        ...(input.visible !== undefined && { visible: input.visible }),
        ...(input.config  !== undefined && { config: input.config }),
      },
    }) as unknown as IPageSection;
  },

  async delete(id: number): Promise<void> {
    await db.pageSection.delete({ where: { id } });
  },

  /** Bulk-update order values in a single transaction (for drag-and-drop admin reordering). */
  async reorder(items: { id: number; order: number }[]): Promise<void> {
    await db.$transaction(
      items.map(({ id, order }) =>
        db.pageSection.update({ where: { id }, data: { order } })
      )
    );
  },
};
