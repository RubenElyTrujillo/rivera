import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const SpaceSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  imageUrl: z.string().max(1000),
  order: z.number().int().min(0),
});

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const rows = await db.spaceProject.findMany({ orderBy: { order: "asc" } });
    return res.status(200).json(rows);
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const parsed = z.array(SpaceSchema).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos de espacios inválidos", details: parsed.error.flatten() });
    }

    const result = await db.$transaction(async (tx) => {
      await tx.spaceProject.deleteMany();
      await tx.spaceProject.createMany({ data: parsed.data });
      return tx.spaceProject.findMany({ orderBy: { order: "asc" } });
    });

    return res.status(200).json(result);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
