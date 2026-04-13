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
    res.status(200).json(data);
    return;
  }

  if (!requireAuth(req, res)) return;

  if (req.method === "POST") {
    const parsed = CategorySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
      return;
    }
    const created = await categoryRepository.create(parsed.data);
    res.status(201).json(created);
    return;
  }

  if (req.method === "PUT") {
    const id = Number(req.query.id);
    if (!id) {
      res.status(400).json({ error: "Se requiere ?id=X" });
      return;
    }
    const parsed = CategorySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
      return;
    }
    const updated = await categoryRepository.update(id, parsed.data);
    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE") {
    const id = Number(req.query.id);
    if (!id) {
      res.status(400).json({ error: "Se requiere ?id=X" });
      return;
    }
    await categoryRepository.delete(id);
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
});
