import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const rows = await db.spaceProject.findMany({ orderBy: { order: "asc" } });
    return res.status(200).json(rows);
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const spaces = req.body as Array<{
      title: string;
      category: string;
      imageUrl: string;
      order: number;
    }>;

    await db.spaceProject.deleteMany();
    await db.spaceProject.createMany({ data: spaces });
    const result = await db.spaceProject.findMany({ orderBy: { order: "asc" } });
    return res.status(200).json(result);
  }

  return res.status(405).json({ error: "Método no permitido" });
}
