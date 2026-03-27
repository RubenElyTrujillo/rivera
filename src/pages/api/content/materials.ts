import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const rows = await db.material.findMany({
      orderBy: { order: "asc" },
      include: { finishes: { orderBy: { order: "asc" } } },
    });
    return res.status(200).json(rows.map((m) => ({
      ...m,
      collections: JSON.parse(m.collections) as string[],
    })));
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const materials = req.body as Array<{
      name: string;
      subtitle: string;
      desc: string;
      spec: string;
      coverImage: string;
      collections: string[];
      order: number;
    }>;

    await db.material.deleteMany();
    await db.material.createMany({
      data: materials.map((m) => ({
        name: m.name,
        subtitle: m.subtitle,
        desc: m.desc,
        spec: m.spec,
        coverImage: m.coverImage ?? "",
        collections: JSON.stringify(m.collections ?? []),
        order: m.order,
      })),
    });

    const result = await db.material.findMany({
      orderBy: { order: "asc" },
      include: { finishes: { orderBy: { order: "asc" } } },
    });
    return res.status(200).json(result.map((m) => ({
      ...m,
      collections: JSON.parse(m.collections) as string[],
    })));
  }

  return res.status(405).json({ error: "Método no permitido" });
}
