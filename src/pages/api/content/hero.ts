import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const HeroSchema = z.object({
  subtitle: z.string().min(1).max(300),
  titleLine1: z.string().min(1).max(200),
  titleLine2: z.string().min(1).max(200),
  description: z.string().max(1000),
  imageUrl: z.string().max(1000),
});

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const row = await db.heroContent.findFirst();
    return res.status(200).json(row);
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const parsed = HeroSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos del hero inválidos", details: parsed.error.flatten() });
    }

    const existing = await db.heroContent.findFirst();
    const row = existing
      ? await db.heroContent.update({ where: { id: existing.id }, data: parsed.data })
      : await db.heroContent.create({ data: parsed.data });

    return res.status(200).json(row);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
