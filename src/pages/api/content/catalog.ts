import type { NextApiRequest, NextApiResponse } from "next";
import { CatalogSchema } from "@/domain/schemas/catalog.schema";
import { catalogRepository } from "@/repositories/catalog.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET  /api/content/catalog  → Devuelve el contenido del Catálogo.
 * PUT  /api/content/catalog  → Actualiza el contenido del Catálogo (requiere auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await catalogRepository.findOne();
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const parsed = CatalogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos del catálogo inválidos", details: parsed.error.flatten() });
    }

    const data = await catalogRepository.upsert(parsed.data);
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
