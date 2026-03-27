import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const row = await db.seoSettings.findFirst();
    return res.status(200).json(row);
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const { title, description, keywords, ogImageUrl } = req.body;
    const existing = await db.seoSettings.findFirst();
    const data = { title, description, keywords, ogImageUrl: ogImageUrl ?? "" };
    const row = existing
      ? await db.seoSettings.update({ where: { id: existing.id }, data })
      : await db.seoSettings.create({ data });

    return res.status(200).json(row);
  }

  return res.status(405).json({ error: "Método no permitido" });
}
