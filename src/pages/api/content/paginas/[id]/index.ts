import type { NextApiRequest, NextApiResponse } from "next";
import { PaginaSchema } from "@/domain/schemas/pagina.schema";
import { paginaRepository } from "@/repositories/pagina.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "ID inválido" }); return; }

  if (req.method === "GET") {
    if (!requireAuth(req, res)) return;
    const page = await paginaRepository.findById(id);
    if (!page) { res.status(404).json({ error: "No encontrada" }); return; }
    res.status(200).json(page);
    return;
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;
    const parsed = PaginaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
      return;
    }
    const conflict = await paginaRepository.findBySlug(parsed.data.slug);
    if (conflict && conflict.id !== id) {
      res.status(409).json({ error: "Ya existe otra página con ese slug" });
      return;
    }
    const updated = await paginaRepository.update(id, parsed.data);
    res.status(200).json(updated);
    return;
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return;
    await paginaRepository.delete(id);
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
});
