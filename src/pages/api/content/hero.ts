import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const row = await db.heroContent.findFirst();
    return res.status(200).json(row);
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const { subtitle, titleLine1, titleLine2, description, imageUrl } = req.body;
    const existing = await db.heroContent.findFirst();

    const data = { subtitle, titleLine1, titleLine2, description, imageUrl };
    const row = existing
      ? await db.heroContent.update({ where: { id: existing.id }, data })
      : await db.heroContent.create({ data });

    return res.status(200).json(row);
  }

  return res.status(405).json({ error: "Método no permitido" });
}
