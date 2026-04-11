import { db } from "@/infrastructure/db/client";
import type { INavItem } from "@/domain/types";
import type { NavItemInput } from "@/domain/schemas/navItem.schema";

/**
 * Repositorio para los ítems de navegación.
 * Abstrae todas las operaciones de base de datos relacionadas con `NavItem`.
 */
export const navItemRepository = {
  async findAll(): Promise<INavItem[]> {
    return db.navItem.findMany({
      orderBy: { order: "asc" },
    }) as unknown as INavItem[];
  },

  async findRoots(): Promise<INavItem[]> {
    return db.navItem.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
    }) as unknown as INavItem[];
  },

  async findChildren(parentId: number): Promise<INavItem[]> {
    return db.navItem.findMany({
      where: { parentId },
      orderBy: { order: "asc" },
    }) as unknown as INavItem[];
  },

  async create(input: NavItemInput): Promise<INavItem> {
    return db.navItem.create({
      data: input,
    }) as unknown as INavItem;
  },

  async update(id: number, input: Partial<NavItemInput>): Promise<INavItem> {
    return db.navItem.update({
      where: { id },
      data: input,
    }) as unknown as INavItem;
  },

  async delete(id: number): Promise<INavItem> {
    return db.navItem.delete({
      where: { id },
    }) as unknown as INavItem;
  },
};
