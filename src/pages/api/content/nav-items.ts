import type { NextApiRequest, NextApiResponse } from "next";
import { NavItemSchema } from "@/domain/schemas/navItem.schema";
import { navItemRepository } from "@/repositories/navItem.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET    /api/content/nav-items          → Lista TODOS los items (plano, incluye ocultos).
 * POST   /api/content/nav-items          → Crea un nuevo item (auth).
 * PUT    /api/content/nav-items?id=X     → Actualiza un item (auth).
 * DELETE /api/content/nav-items?id=X     → Elimina un item y sus hijos en cascada (auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await navItemRepository.findAll();
    res.status(200).json(data);
    return;
  }

  if (!requireAuth(req, res)) return;

  if (req.method === "POST") {
    const parsed = NavItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
      return;
    }
    const created = await navItemRepository.create(parsed.data);
    res.status(201).json(created);
    return;
  }

  if (req.method === "PUT") {
    const id = Number(req.query.id);
    if (!id) {
      res.status(400).json({ error: "Se requiere ?id=X" });
      return;
    }
    const parsed = NavItemSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
      return;
    }
    const updated = await navItemRepository.update(id, parsed.data);
    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE") {
    const id = Number(req.query.id);
    if (!id) {
      res.status(400).json({ error: "Se requiere ?id=X" });
      return;
    }
    await navItemRepository.delete(id);
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
});
