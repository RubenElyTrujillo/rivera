import { db } from "@/infrastructure/db/client";
import type { ISpaceProject } from "@/domain/types/space";
import type { SpaceInput } from "@/domain/schemas/space.schema";

/**
 * Repositorio para los proyectos de la galería Espacios.
 * Abstrae todas las operaciones de base de datos relacionadas con `SpaceProject`.
 */
export const spaceRepository = {
  /**
   * Obtiene todos los proyectos ordenados por su campo `order`.
   * @returns Lista de proyectos.
   */
  async findAll(): Promise<ISpaceProject[]> {
    return db.spaceProject.findMany({ orderBy: { order: "asc" } });
  },

  /**
   * Reemplaza toda la lista de proyectos en una sola transacción atómica.
   *
   * @param spaces - Lista completa de proyectos a guardar.
   * @returns La nueva lista de proyectos ordenada.
   */
  async replaceAll(spaces: SpaceInput[]): Promise<ISpaceProject[]> {
    return db.$transaction(async (tx) => {
      await tx.spaceProject.deleteMany();
      await tx.spaceProject.createMany({ data: spaces });
      return tx.spaceProject.findMany({ orderBy: { order: "asc" } });
    });
  },
};
