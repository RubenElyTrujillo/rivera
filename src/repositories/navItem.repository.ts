import { db } from "@/infrastructure/db/client";
import type { INavItem } from "@/domain/types";
import type { NavItemInput } from "@/domain/schemas/navItem.schema";

export const navItemRepository = {
  async findAll(): Promise<INavItem[]> {
    return db.navItem.findMany({
      orderBy: [{ parentId: "asc" }, { order: "asc" }],
    }) as unknown as INavItem[];
  },

  /** Returns root items (parentId = null, visible = true) with their children eager-loaded. */
  async findRoots(): Promise<INavItem[]> {
    return db.navItem.findMany({
      where: { parentId: null, visible: true },
      orderBy: { order: "asc" },
      include: {
        children: {
          where: { visible: true },
          orderBy: { order: "asc" },
          include: {
            children: {
              where: { visible: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
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
      data: {
        label:       input.label,
        href:        input.href ?? "",
        slug:        input.slug ?? null,
        coverImage:  input.coverImage ?? null,
        description: input.description ?? null,
        order:       input.order ?? 0,
        visible:     input.visible ?? true,
        parentId:    input.parentId ?? null,
      },
    }) as unknown as INavItem;
  },

  async update(id: number, input: Partial<NavItemInput>): Promise<INavItem> {
    return db.navItem.update({
      where: { id },
      data: {
        ...(input.label       !== undefined && { label: input.label }),
        ...(input.href        !== undefined && { href: input.href }),
        ...(input.slug        !== undefined && { slug: input.slug }),
        ...(input.coverImage  !== undefined && { coverImage: input.coverImage }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.order       !== undefined && { order: input.order }),
        ...(input.visible     !== undefined && { visible: input.visible }),
        ...(input.parentId    !== undefined && { parentId: input.parentId }),
      },
    }) as unknown as INavItem;
  },

  async delete(id: number): Promise<void> {
    await db.navItem.delete({ where: { id } });
  },

  async findBySlug(slug: string): Promise<INavItem | null> {
    return db.navItem.findUnique({
      where: { slug },
      include: {
        children: {
          where: { visible: true },
          orderBy: { order: "asc" },
        },
        parent: true,
      },
    }) as unknown as INavItem | null;
  },
};
