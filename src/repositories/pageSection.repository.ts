import { db } from "@/infrastructure/db/client";
import type { IPageSection } from "@/domain/types";
import type { PageSectionInput } from "@/domain/schemas/pageSection.schema";

/**
 * Repositorio para las secciones configurables del home.
 * Abstrae todas las operaciones de base de datos relacionadas con `PageSection`.
 */
export const pageSectionRepository = {
  async findAll(): Promise<IPageSection[]> {
    return db.pageSection.findMany({
      orderBy: { order: "asc" },
    }) as unknown as IPageSection[];
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
    }) as unknown as IPageSection[];
  },

  async create(input: PageSectionInput): Promise<IPageSection> {
    return db.pageSection.create({
      data: input,
    }) as unknown as IPageSection;
  },

  async update(id: number, input: Partial<PageSectionInput>): Promise<IPageSection> {
    return db.pageSection.update({
      where: { id },
      data: input,
    }) as unknown as IPageSection;
  },

  async delete(id: number): Promise<IPageSection> {
    return db.pageSection.delete({
      where: { id },
    }) as unknown as IPageSection;
  },
};
