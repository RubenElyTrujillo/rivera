import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const row = await db.catalogContent.findFirst();
    return res.status(200).json(row);
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const { title, description, pdfUrl, buttonText } = req.body;
    const existing = await db.catalogContent.findFirst();
    const data = { title, description, pdfUrl, buttonText };
    const row = existing
      ? await db.catalogContent.update({ where: { id: existing.id }, data })
      : await db.catalogContent.create({ data });

    return res.status(200).json(row);
  }

  return res.status(405).json({ error: "Método no permitido" });
}
