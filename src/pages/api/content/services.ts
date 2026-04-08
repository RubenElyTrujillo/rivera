import type { NextApiRequest, NextApiResponse } from "next";
import { ServicesListSchema } from "@/domain/schemas/service.schema";
import { serviceRepository } from "@/repositories/service.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET  /api/content/services  → Devuelve todos los servicios ordenados.
 * PUT  /api/content/services  → Reemplaza la lista completa (requiere auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await serviceRepository.findAll();
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const parsed = ServicesListSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos de servicios inválidos", details: parsed.error.flatten() });
    }

    const data = await serviceRepository.replaceAll(parsed.data);
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
