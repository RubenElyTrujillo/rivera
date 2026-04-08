import type { NextApiRequest, NextApiResponse } from "next";
import { MaterialsListSchema } from "@/domain/schemas/material.schema";
import { materialRepository } from "@/repositories/material.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET  /api/content/materials  → Devuelve todos los materiales con sus acabados.
 * PUT  /api/content/materials  → Reemplaza la lista completa (requiere auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await materialRepository.findAll();
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const parsed = MaterialsListSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos de materiales inválidos", details: parsed.error.flatten() });
    }

    const data = await materialRepository.replaceAll(parsed.data);
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
