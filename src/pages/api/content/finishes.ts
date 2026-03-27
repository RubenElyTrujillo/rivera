import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET  /api/content/finishes?materialId=1  → lista acabados del material
// POST /api/content/finishes               → crear acabado (auth)
// PUT  /api/content/finishes/[id]          → editar acabado (auth)
// DELETE /api/content/finishes?id=1        → eliminar acabado (auth)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const { materialId, name, code, collection, image, dims, order } = req.body as {
      materialId: number;
      name: string;
      code: string;
      collection: string;
      image: string;
      dims: string;
      order: number;
    };

    const finish = await db.materialFinish.create({
      data: { materialId, name, code, collection: collection ?? "", image, dims: dims ?? "", order: order ?? 0 },
    });
    return res.status(201).json(finish);
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "id requerido" });

    const { name, code, collection, image, dims, order } = req.body as {
      name: string;
      code: string;
      collection: string;
      image: string;
      dims: string;
      order: number;
    };

    const finish = await db.materialFinish.update({
      where: { id },
      data: { name, code, collection: collection ?? "", image, dims: dims ?? "", order: order ?? 0 },
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
}
