import type { NextApiRequest, NextApiResponse } from "next";
import { FinishSchema } from "@/domain/schemas/finish.schema";
import { finishRepository } from "@/repositories/finish.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET    /api/content/finishes?materialId=1  → Lista los acabados de un material.
 * POST   /api/content/finishes               → Crea un nuevo acabado (requiere auth).
 * PUT    /api/content/finishes?id=1          → Actualiza un acabado (requiere auth).
 * DELETE /api/content/finishes?id=1          → Elimina un acabado (requiere auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const materialId = Number(req.query.materialId);
    if (!materialId) return res.status(400).json({ error: "materialId requerido" });

    const data = await finishRepository.findByMaterial(materialId);
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return;

    const parsed = FinishSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos de acabado inválidos", details: parsed.error.flatten() });
    }

    const { materialId } = parsed.data;
    if (!materialId) return res.status(400).json({ error: "materialId requerido" });

    const data = await finishRepository.create(materialId, parsed.data);
    return res.status(201).json(data);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "id requerido" });

    const parsed = FinishSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos de acabado inválidos", details: parsed.error.flatten() });
    }

    const data = await finishRepository.update(id, parsed.data);
    return res.status(200).json(data);
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return;

    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "id requerido" });

    await finishRepository.delete(id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
});
