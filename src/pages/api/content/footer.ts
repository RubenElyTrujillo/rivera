import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const { tagline, services } = req.body;
    const existing = await db.footerContent.findFirst();
    const data = { tagline, services: JSON.stringify(services ?? []) };
    const row = existing
      ? await db.footerContent.update({ where: { id: existing.id }, data })
      : await db.footerContent.create({ data });

    return res.status(200).json({
      ...row,
      services: JSON.parse(row.services) as string[],
    });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
