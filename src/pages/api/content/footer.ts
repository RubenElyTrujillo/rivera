import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const FooterSchema = z.object({
  tagline: z.string().min(1).max(500),
  services: z.array(z.string()).default([]),
});

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const row = await db.footerContent.findFirst();
    if (!row) return res.status(200).json(null);
    return res.status(200).json({
      ...row,
      services: JSON.parse(row.services) as string[],
    });
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const parsed = FooterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos del footer inválidos", details: parsed.error.flatten() });
    }

    const { tagline, services } = parsed.data;
    const existing = await db.footerContent.findFirst();
    const data = { tagline, services: JSON.stringify(services) };
    const row = existing
      ? await db.footerContent.update({ where: { id: existing.id }, data })
      : await db.footerContent.create({ data });

    return res.status(200).json({
      ...row,
      services: JSON.parse(row.services) as string[],
    });
  }

  return res.status(405).json({ error: "Método no permitido" });
});
