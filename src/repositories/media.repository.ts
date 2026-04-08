import { db } from "@/infrastructure/db/client";
import type { IMedia } from "@/domain/types/media";

/** Datos necesarios para registrar un nuevo archivo en la tabla Media. */
export interface CreateMediaData {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

/**
 * Repositorio para los archivos multimedia (imágenes y PDFs).
 * Abstrae todas las operaciones de base de datos relacionadas con `Media`.
 */
export const mediaRepository = {
  /**
   * Obtiene todos los archivos ordenados del más reciente al más antiguo.
   * @returns Lista de archivos multimedia.
   */
  async findAll(): Promise<IMedia[]> {
    const rows = await db.media.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  },

  /**
   * Obtiene un archivo por su ID.
   *
   * @param id - ID del archivo.
   * @returns El archivo o `null` si no existe.
   */
  async findById(id: number): Promise<IMedia | null> {
    const row = await db.media.findUnique({ where: { id } });
    if (!row) return null;
    return { ...row, createdAt: row.createdAt.toISOString() };
  },

  /**
   * Registra un nuevo archivo en la base de datos.
   *
   * @param data - Metadatos del archivo subido.
   * @returns El registro creado.
   */
  async create(data: CreateMediaData): Promise<IMedia> {
    const row = await db.media.create({ data });
    return { ...row, createdAt: row.createdAt.toISOString() };
  },

  /**
   * Elimina el registro de un archivo de la base de datos.
   * No elimina el archivo del disco (eso lo hace el handler o servicio).
   *
   * @param id - ID del archivo a eliminar.
   */
  async delete(id: number): Promise<void> {
    await db.media.delete({ where: { id } });
  },
};
