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
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return;

    const parsed = NavItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }

    const created = await navItemRepository.create(parsed.data);
    return res.status(201).json(created);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" });

    const parsed = NavItemSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }

    const updated = await navItemRepository.update(id, parsed.data);
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return;

    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" });

    await navItemRepository.delete(id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
});
