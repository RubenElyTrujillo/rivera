import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const CatalogSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  pdfUrl: z.string().max(1000),
  buttonText: z.string().max(100).default("DESCARGAR CATÁLOGO PDF"),
});

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const row = await db.catalogContent.findFirst();
    return res.status(200).json(row);
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const parsed = CatalogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos del catálogo inválidos", details: parsed.error.flatten() });
    }

    const existing = await db.catalogContent.findFirst();
    const row = existing
      ? await db.catalogContent.update({ where: { id: existing.id }, data: parsed.data })
      : await db.catalogContent.create({ data: parsed.data });

    return res.status(200).json(row);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
