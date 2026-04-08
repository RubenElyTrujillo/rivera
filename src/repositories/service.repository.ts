import { db } from "@/infrastructure/db/client";
import type { IService } from "@/domain/types/service";
import type { ServiceInput } from "@/domain/schemas/service.schema";

/**
 * Repositorio para las tarjetas de servicios.
 * Abstrae todas las operaciones de base de datos relacionadas con `Service`.
 */
export const serviceRepository = {
  /**
   * Obtiene todos los servicios ordenados por su campo `order`.
   * @returns Lista de servicios.
   */
  async findAll(): Promise<IService[]> {
    return db.service.findMany({ orderBy: { order: "asc" } });
  },

  /**
   * Reemplaza toda la lista de servicios en una sola transacción atómica.
   * Borra los registros existentes y crea los nuevos para garantizar consistencia.
   *
   * @param services - Lista completa de servicios a guardar.
   * @returns La nueva lista de servicios ordenada.
   */
  async replaceAll(services: ServiceInput[]): Promise<IService[]> {
    return db.$transaction(async (tx) => {
      await tx.service.deleteMany();
      await tx.service.createMany({ data: services });
      return tx.service.findMany({ orderBy: { order: "asc" } });
    });
  },
};
