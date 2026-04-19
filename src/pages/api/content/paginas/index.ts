import type { NextApiRequest, NextApiResponse } from "next";
import { PaginaSchema } from "@/domain/schemas/pagina.schema";
import { paginaRepository } from "@/repositories/pagina.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    if (!requireAuth(req, res)) return;
    const data = await paginaRepository.findAll();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return;
    const parsed = PaginaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }
    const existing = await paginaRepository.findBySlug(parsed.data.slug);
    if (existing) return res.status(409).json({ error: "Ya existe una página con ese slug" });
    const created = await paginaRepository.create(parsed.data);
    return res.status(201).json(created);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
