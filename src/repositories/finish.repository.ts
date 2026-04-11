import { db } from "@/infrastructure/db/client";
import type { IMaterialFinish } from "@/domain/types/material";
import type { FinishInput } from "@/domain/schemas/finish.schema";

/**
 * Repositorio para los acabados de materiales.
 * Abstrae todas las operaciones de base de datos relacionadas con `MaterialFinish`.
 */
export const finishRepository = {
  /**
   * Obtiene todos los acabados de un material, ordenados por `order`.
   *
   * @param materialId - ID del material padre.
   * @returns Lista de acabados del material.
   */
  async findByMaterial(materialId: number): Promise<IMaterialFinish[]> {
    return db.materialFinish.findMany({
      where: { materialId },
      orderBy: { order: "asc" },
    });
  },

  /**
   * Crea un nuevo acabado asociado a un material.
   *
   * @param materialId - ID del material padre.
   * @param data       - Datos del acabado validados.
   * @returns El acabado creado.
   */
  async create(materialId: number, data: FinishInput): Promise<IMaterialFinish> {
    const { name, code, image, dims, order } = data;
    return db.materialFinish.create({
      data: { materialId, name, code, image, dims, order, slug: code || name, collectionId: 1 },
    });
  },

  /**
   * Actualiza un acabado existente.
   *
   * @param id   - ID del acabado.
   * @param data - Datos actualizados del acabado.
   * @returns El acabado actualizado.
   */
  async update(id: number, data: FinishInput): Promise<IMaterialFinish> {
    const { name, code, image, dims, order } = data;
    return db.materialFinish.update({
      where: { id },
      data: { name, code, image, dims, order },
    });
  },

  /**
   * Elimina un acabado por ID.
   *
   * @param id - ID del acabado a eliminar.
   */
  async delete(id: number): Promise<void> {
    await db.materialFinish.delete({ where: { id } });
  },
};
