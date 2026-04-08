import { db } from "@/infrastructure/db/client";
import type { IFooterContent } from "@/domain/types/footer";
import type { FooterInput } from "@/domain/schemas/footer.schema";

/** Serializa la lista de servicios a JSON para almacenar en DB. */
function serializeServices(services: string[]): string {
  return JSON.stringify(services);
}

/** Parsea la lista de servicios de JSON string a array al leer de DB. */
function parseServices(raw: string): string[] {
  return JSON.parse(raw) as string[];
}

/**
 * Repositorio para el contenido del Footer.
 * La tabla solo tiene una fila.
 *
 * Nota: `services` se guarda como JSON string en DB.
 */
export const footerRepository = {
  /**
   * Obtiene el contenido del footer.
   * @returns El registro con services parseado, o `null`.
   */
  async findOne(): Promise<IFooterContent | null> {
    const row = await db.footerContent.findFirst();
    if (!row) return null;
    return { ...row, services: parseServices(row.services) };
  },

  /**
   * Crea o actualiza el contenido del footer.
   *
   * @param data - Datos validados del footer.
   * @returns El registro actualizado con services parseado.
   */
  async upsert(data: FooterInput): Promise<IFooterContent> {
    const serialized = {
      ...data,
      services: serializeServices(data.services),
    };
    const existing = await db.footerContent.findFirst();
    const row = existing
      ? await db.footerContent.update({ where: { id: existing.id }, data: serialized })
      : await db.footerContent.create({ data: serialized });
    return { ...row, services: parseServices(row.services) };
  },
};
