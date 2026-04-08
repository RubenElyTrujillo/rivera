import { db } from "@/infrastructure/db/client";
import type { ISpaceProject } from "@/domain/types/space";
import type { SpaceInput } from "@/domain/schemas/space.schema";

/** Include clause compartido: siempre trae imágenes ordenadas. */
const WITH_IMAGES = { images: { orderBy: { order: "asc" as const } } };

/** Convierte un registro DB (con DateTime) al tipo de dominio (con string ISO). */
function serializeProject(row: Record<string, unknown> & { completedAt: Date | null }): ISpaceProject {
  const { completedAt, ...rest } = row;
  return {
    ...(rest as unknown as ISpaceProject),
    completedAt: completedAt ? completedAt.toISOString() : null,
  };
}

/**
 * Repositorio para los proyectos de la galería Espacios.
 * Abstrae todas las operaciones de base de datos relacionadas con
 * `SpaceProject` y `SpaceProjectImage`.
 */
export const spaceRepository = {
  /**
   * Obtiene todos los proyectos ordenados por su campo `order`,
   * incluyendo sus imágenes adicionales.
   *
   * @returns Lista de proyectos con imágenes.
   */
  async findAll(): Promise<ISpaceProject[]> {
    const rows = await db.spaceProject.findMany({
      orderBy: { order: "asc" },
      include: WITH_IMAGES,
    });
    return rows.map(serializeProject);
  },

  /**
   * Busca un proyecto por su ID numérico.
   *
   * @param id - ID del proyecto.
   * @returns Proyecto con imágenes o null si no existe.
   */
  async findById(id: number): Promise<ISpaceProject | null> {
    const row = await db.spaceProject.findUnique({
      where: { id },
      include: WITH_IMAGES,
    });
    return row ? serializeProject(row) : null;
  },

  /**
   * Obtiene todos los proyectos de una categoría específica,
   * ordenados por `order`.
   *
   * @param category - Nombre exacto de la categoría.
   * @returns Lista de proyectos filtrados.
   */
  async findByCategory(category: string): Promise<ISpaceProject[]> {
    const rows = await db.spaceProject.findMany({
      where: { category: { equals: category, mode: 'insensitive' } },
      orderBy: { order: "asc" },
      include: WITH_IMAGES,
    });
    return rows.map(serializeProject);
  },

  /**
   * Obtiene las categorías únicas de proyectos.
   *
   * @returns Array de strings con las categorías.
   */
  async findCategories(): Promise<string[]> {
    const rows = await db.spaceProject.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });
    return rows.map((r) => r.category);
  },

  /**
   * Reemplaza toda la lista de proyectos en una sola transacción atómica.
   * Las imágenes existentes se eliminan en cascada (onDelete: Cascade en schema).
   *
   * @param spaces - Lista completa de proyectos a guardar (con imágenes).
   * @returns La nueva lista de proyectos ordenada.
   */
  async replaceAll(spaces: SpaceInput[]): Promise<ISpaceProject[]> {
    const rows = await db.$transaction(async (tx) => {
      await tx.spaceProject.deleteMany();
      for (const s of spaces) {
        const { images, completedAt, ...rest } = s;
        await tx.spaceProject.create({
          data: {
            ...rest,
            completedAt: completedAt ? new Date(completedAt) : null,
            images: images?.length
              ? { create: images.map(({ id: _id, ...img }) => img) }
              : undefined,
          },
        });
      }
      return tx.spaceProject.findMany({
        orderBy: { order: "asc" },
        include: WITH_IMAGES,
      });
    });
    return rows.map(serializeProject);
  },

  /**
   * Actualiza un proyecto individual con sus imágenes.
   * Elimina las imágenes anteriores y recrea las nuevas en la misma transacción.
   *
   * @param id     - ID del proyecto a actualizar.
   * @param data   - Datos nuevos del proyecto.
   * @returns Proyecto actualizado.
   */
  async update(id: number, data: SpaceInput): Promise<ISpaceProject> {
    const { images, completedAt, ...rest } = data;
    const row = await db.$transaction(async (tx) => {
      await tx.spaceProjectImage.deleteMany({ where: { spaceProjectId: id } });
      return tx.spaceProject.update({
        where: { id },
        data: {
          ...rest,
          completedAt: completedAt ? new Date(completedAt) : null,
          images: images?.length
            ? { create: images.map(({ id: _id, ...img }) => img) }
            : undefined,
        },
        include: WITH_IMAGES,
      });
    });
    return serializeProject(row);
  },
};
