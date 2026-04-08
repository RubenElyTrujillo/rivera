import type { NextApiRequest, NextApiResponse } from "next";
import { SpaceCategoryListSchema } from "@/domain/schemas/spaceCategory.schema";
import { spaceCategoryRepository } from "@/repositories/spaceCategory.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET  /api/content/space-categories  → Devuelve todas las categorías de espacios.
 * PUT  /api/content/space-categories  → Reemplaza la lista completa (requiere auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await spaceCategoryRepository.findAll();
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const parsed = SpaceCategoryListSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }

    const data = await spaceCategoryRepository.replaceAll(parsed.data);
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
