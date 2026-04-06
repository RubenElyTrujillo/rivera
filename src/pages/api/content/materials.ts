import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const MaterialSchema = z.object({
  name: z.string().min(1).max(200),
  subtitle: z.string().max(300),
  desc: z.string().max(5000),
  spec: z.string().max(500),
  coverImage: z.string().max(1000).default(""),
  collections: z.array(z.string()).default([]),
  order: z.number().int().min(0),
});

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const parsed = z.array(MaterialSchema).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos de materiales inválidos", details: parsed.error.flatten() });
    }

    const result = await db.$transaction(async (tx) => {
      await tx.material.deleteMany();
      await tx.material.createMany({
        data: parsed.data.map((m) => ({
          name: m.name,
          subtitle: m.subtitle,
          desc: m.desc,
          spec: m.spec,
          coverImage: m.coverImage,
          collections: JSON.stringify(m.collections),
          order: m.order,
        })),
      });
      return tx.material.findMany({
        orderBy: { order: "asc" },
        include: { finishes: { orderBy: { order: "asc" } } },
      });
    });

    return res.status(200).json(result.map((m) => ({
      ...m,
      collections: JSON.parse(m.collections) as string[],
    })));
  }

  return res.status(405).json({ error: "Método no permitido" });
});
