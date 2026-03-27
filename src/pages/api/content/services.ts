import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const rows = await db.service.findMany({ orderBy: { order: "asc" } });
    return res.status(200).json(rows);
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    // Reemplaza todos los servicios (array completo)
    const services = req.body as Array<{
      id?: number;
      icon: string;
      title: string;
      subtitle: string;
      desc: string;
      order: number;
    }>;

    await db.service.deleteMany();
    const created = await db.service.createMany({ data: services.map((s) => ({
      icon: s.icon,
      title: s.title,
      subtitle: s.subtitle,
      desc: s.desc,
      order: s.order,
    }))});

    const result = await db.service.findMany({ orderBy: { order: "asc" } });
    return res.status(200).json(result);
  }

  return res.status(405).json({ error: "Método no permitido" });
}
