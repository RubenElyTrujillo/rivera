import { db } from "@/infrastructure/db/client";
import type { IMaterial } from "@/domain/types/material";
import type { MaterialInput } from "@/domain/schemas/material.schema";

/** Serializa el array de colecciones a JSON string para almacenar en DB. */
function serializeCollections(collections: string[]): string {
  return JSON.stringify(collections);
}

/** Parsea el JSON string de colecciones a array de strings al leer de DB. */
function parseCollections(raw: string): string[] {
  return JSON.parse(raw) as string[];
}

/**
 * Repositorio para los materiales y sus acabados.
 * Abstrae todas las operaciones de base de datos relacionadas con `Material` y `MaterialFinish`.
 *
 * Nota: el campo `collections` se guarda como JSON string en DB por limitaciones
 * del schema de SQLite/Postgres sin arrays nativos en Prisma SQLite.
 */
export const materialRepository = {
  /**
   * Obtiene todos los materiales con sus acabados, ordenados por `order`.
   * Parsea el campo `collections` de JSON string a array.
   *
   * @returns Lista de materiales con sus acabados.
   */
  async findAll(): Promise<IMaterial[]> {
    const rows = await db.material.findMany({
      orderBy: { order: "asc" },
      include: { finishes: { orderBy: { order: "asc" } } },
    });
    return rows.map((m) => ({ ...m, collections: [] }));
  },

  /**
   * Busca un material por su ID numérico con todos sus acabados.
   *
   * @param id - ID del material.
   * @returns Material con acabados o null si no existe.
   */
  async findById(id: number): Promise<IMaterial | null> {
    const m = await db.material.findUnique({
      where: { id },
      include: { finishes: { orderBy: { order: "asc" } } },
    });
    if (!m) return null;
    return { ...m, collections: [] };
  },

  /**
   * Reemplaza toda la lista de materiales en una sola transacción.
   * Los acabados existentes se eliminan en cascada (definido en el schema Prisma).
   *
   * @param materials - Lista completa de materiales a guardar.
   * @returns La nueva lista de materiales (sin acabados, estos se gestionan por separado).
   */
  async replaceAll(materials: MaterialInput[]): Promise<IMaterial[]> {
    const rows = await db.$transaction(async (tx) => {
      await tx.material.deleteMany();
      await tx.material.createMany({
        data: materials.map((m) => ({
          name: m.name,
          slug: m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          subtitle: m.subtitle,
          desc: m.desc,
          spec: m.spec,
          coverImage: m.coverImage,
          order: m.order,
        })),
      });
      return tx.material.findMany({
        orderBy: { order: "asc" },
        include: { finishes: { orderBy: { order: "asc" } } },
      });
    });
    return rows.map((m) => ({ ...m, collections: [] }));
  },
};
