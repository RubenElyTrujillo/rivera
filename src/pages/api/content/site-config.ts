import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { siteConfigRepository } from "@/repositories/siteConfig.repository";

const SiteConfigUpdateSchema = z.object({
  showMaterials: z.boolean().optional(),
  showShowroom:  z.boolean().optional(),
});

/**
 * GET  /api/content/site-config  — devuelve la configuración actual.
 * PUT  /api/content/site-config  — actualiza la configuración (requiere auth).
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const config = await siteConfigRepository.get();
    return res.status(200).json(config);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;
    const parsed = SiteConfigUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const updated = await siteConfigRepository.update(parsed.data);
    return res.status(200).json(updated);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withErrorHandling(handler);
