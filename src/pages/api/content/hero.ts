import type { NextApiRequest, NextApiResponse } from "next";
import { HeroSchema } from "@/domain/schemas/hero.schema";
import { heroRepository } from "@/repositories/hero.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET  /api/content/hero  → Devuelve el contenido actual del Hero.
 * PUT  /api/content/hero  → Actualiza el contenido del Hero (requiere auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await heroRepository.findOne();
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const parsed = HeroSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos del hero inválidos", details: parsed.error.flatten() });
    }

    const data = await heroRepository.upsert(parsed.data);
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
