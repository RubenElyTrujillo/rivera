import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const SeoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500),
  keywords: z.string().max(1000),
  ogImageUrl: z.string().max(1000).default(""),
});

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const row = await db.seoSettings.findFirst();
    return res.status(200).json(row);
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const parsed = SeoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos SEO inválidos", details: parsed.error.flatten() });
    }

    const existing = await db.seoSettings.findFirst();
    const row = existing
      ? await db.seoSettings.update({ where: { id: existing.id }, data: parsed.data })
      : await db.seoSettings.create({ data: parsed.data });

    return res.status(200).json(row);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
