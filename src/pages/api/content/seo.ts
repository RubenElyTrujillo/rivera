import type { NextApiRequest, NextApiResponse } from "next";
import { SeoSchema } from "@/domain/schemas/seo.schema";
import { seoRepository } from "@/repositories/seo.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET  /api/content/seo  → Devuelve la configuración SEO.
 * PUT  /api/content/seo  → Actualiza la configuración SEO (requiere auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await seoRepository.findOne();
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const parsed = SeoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos SEO inválidos", details: parsed.error.flatten() });
    }

    const data = await seoRepository.upsert(parsed.data);
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
