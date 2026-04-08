import type { NextApiRequest, NextApiResponse } from "next";
import { SpacesListSchema } from "@/domain/schemas/space.schema";
import { spaceRepository } from "@/repositories/space.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET  /api/content/spaces  → Devuelve todos los proyectos de la galería.
 * PUT  /api/content/spaces  → Reemplaza la lista completa (requiere auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await spaceRepository.findAll();
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const parsed = SpacesListSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos de espacios inválidos", details: parsed.error.flatten() });
    }

    const data = await spaceRepository.replaceAll(parsed.data);
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
