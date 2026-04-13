import type { NextApiRequest, NextApiResponse } from "next";
import { CategorySchema } from "@/domain/schemas/category.schema";
import { categoryRepository } from "@/repositories/category.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET    /api/content/categories          → Lista todas las categorías (público).
 * POST   /api/content/categories          → Crea una nueva categoría (auth).
 * PUT    /api/content/categories?id=X     → Actualiza una categoría (auth).
 * DELETE /api/content/categories?id=X     → Elimina una categoría (auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await categoryRepository.findAll();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return;

    const parsed = CategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }

    const created = await categoryRepository.create(parsed.data);
    return res.status(201).json(created);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" });

    const parsed = CategorySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }

    const updated = await categoryRepository.update(id, parsed.data);
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return;

    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" });

    await categoryRepository.delete(id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
});
