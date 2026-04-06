import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const ServiceSchema = z.object({
  icon: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300),
  desc: z.string().max(2000),
  order: z.number().int().min(0),
});

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const rows = await db.service.findMany({ orderBy: { order: "asc" } });
    return res.status(200).json(rows);
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const parsed = z.array(ServiceSchema).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos de servicios inválidos", details: parsed.error.flatten() });
    }

    const result = await db.$transaction(async (tx) => {
      await tx.service.deleteMany();
      await tx.service.createMany({
        data: parsed.data.map((s) => ({
          icon: s.icon,
          title: s.title,
          subtitle: s.subtitle,
          desc: s.desc,
          order: s.order,
        })),
      });
      return tx.service.findMany({ orderBy: { order: "asc" } });
    });

    return res.status(200).json(result);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
