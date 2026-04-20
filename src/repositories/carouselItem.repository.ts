import { db } from "@/infrastructure/db/client";
import type { ICarouselItem } from "@/domain/types";

export const carouselItemRepository = {
  async findAll(): Promise<ICarouselItem[]> {
    return db.carouselItem.findMany({ orderBy: { order: "asc" } });
  },

  async findById(id: number): Promise<ICarouselItem | null> {
    return db.carouselItem.findUnique({ where: { id } });
  },

  async create(data: Omit<ICarouselItem, "id">): Promise<ICarouselItem> {
    return db.carouselItem.create({ data });
  },

  async update(id: number, data: Partial<Omit<ICarouselItem, "id">>): Promise<ICarouselItem> {
    return db.carouselItem.update({ where: { id }, data });
  },

  async delete(id: number): Promise<void> {
    await db.carouselItem.delete({ where: { id } });
  },

  async reorder(items: { id: number; order: number }[]): Promise<void> {
    await Promise.all(
      items.map(({ id, order }) =>
        db.carouselItem.update({ where: { id }, data: { order } })
      )
    );
  },
};
