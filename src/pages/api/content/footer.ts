import type { NextApiRequest, NextApiResponse } from "next";
import { FooterSchema } from "@/domain/schemas/footer.schema";
import { footerRepository } from "@/repositories/footer.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET  /api/content/footer  → Devuelve el contenido del footer.
 * PUT  /api/content/footer  → Actualiza el contenido del footer (requiere auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await footerRepository.findOne();
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const parsed = FooterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos del footer inválidos", details: parsed.error.flatten() });
    }

    const data = await footerRepository.upsert(parsed.data);
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
