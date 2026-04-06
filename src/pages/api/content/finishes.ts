import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

// GET  /api/content/finishes?materialId=1  → lista acabados del material
// POST /api/content/finishes               → crear acabado (auth)
// PUT  /api/content/finishes?id=1          → editar acabado (auth)
// DELETE /api/content/finishes?id=1        → eliminar acabado (auth)

const FinishWriteSchema = z.object({
  materialId: z.number().int().positive().optional(),
  name: z.string().min(1).max(200),
  code: z.string().max(100).default(""),
  collection: z.string().max(200).default(""),
  image: z.string().max(1000).default(""),
  dims: z.string().max(200).default(""),
  order: z.number().int().min(0).default(0),
});

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const materialId = Number(req.query.materialId);
    if (!materialId) return res.status(400).json({ error: "materialId requerido" });

    const finishes = await db.materialFinish.findMany({
      where: { materialId },
      orderBy: { order: "asc" },
    });
    return res.status(200).json(finishes);
  }

  if (req.method === "POST") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const parsed = FinishWriteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos de acabado inválidos", details: parsed.error.flatten() });
    }

    const { materialId, name, code, collection, image, dims, order } = parsed.data;
    if (!materialId) return res.status(400).json({ error: "materialId requerido" });

    const finish = await db.materialFinish.create({
      data: { materialId, name, code, collection, image, dims, order },
    });
    return res.status(201).json(finish);
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "id requerido" });

    const parsed = FinishWriteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos de acabado inválidos", details: parsed.error.flatten() });
    }

    const { name, code, collection, image, dims, order } = parsed.data;

    const finish = await db.materialFinish.update({
      where: { id },
      data: { name, code, collection, image, dims, order },
    });
    return res.status(200).json(finish);
  }

  if (req.method === "DELETE") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "id requerido" });

    await db.materialFinish.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
});
