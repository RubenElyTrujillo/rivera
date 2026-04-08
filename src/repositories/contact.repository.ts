import { db } from "@/infrastructure/db/client";
import type { IContactInfo } from "@/domain/types/contact";
import type { ContactInput } from "@/domain/schemas/contact.schema";

/** Serializa surfaceOptions a JSON para almacenar en DB. */
function serializeSurfaceOptions(options: string[]): string {
  return JSON.stringify(options);
}

/** Parsea surfaceOptions de JSON string a array al leer de DB. */
function parseSurfaceOptions(raw: string): string[] {
  return JSON.parse(raw) as string[];
}

/**
 * Repositorio para los datos de contacto del sitio.
 * La tabla solo tiene una fila.
 *
 * Nota: `surfaceOptions` se guarda como JSON string en DB.
 */
export const contactRepository = {
  /**
   * Obtiene los datos de contacto.
   * @returns El registro con surfaceOptions parseado, o `null`.
   */
  async findOne(): Promise<IContactInfo | null> {
    const row = await db.contactInfo.findFirst();
    if (!row) return null;
    return { ...row, surfaceOptions: parseSurfaceOptions(row.surfaceOptions) };
  },

  /**
   * Crea o actualiza los datos de contacto.
   *
   * @param data - Datos validados de contacto.
   * @returns El registro actualizado con surfaceOptions parseado.
   */
  async upsert(data: ContactInput): Promise<IContactInfo> {
    const serialized = {
      ...data,
      surfaceOptions: serializeSurfaceOptions(data.surfaceOptions),
    };
    const existing = await db.contactInfo.findFirst();
    const row = existing
      ? await db.contactInfo.update({ where: { id: existing.id }, data: serialized })
      : await db.contactInfo.create({ data: serialized });
    return { ...row, surfaceOptions: parseSurfaceOptions(row.surfaceOptions) };
  },
};
