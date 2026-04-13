import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { collectionRepository } from "@/repositories/collection.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

const CollectionInputSchema = z.object({
  name: z.string().min(1),
  desc: z.string().optional().default(''),
  coverImage: z.string().optional().default(''),
  order: z.number().int().default(0),
  materialId: z.number().int().optional(),
  slug: z.string().optional(),
});

/**
 * GET    /api/content/collections?materialId=N  → collections for that material
 * POST   /api/content/collections               → create collection (auth)
 * PUT    /api/content/collections?id=N          → update (auth)
 * DELETE /api/content/collections?id=N          → delete (auth)
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const materialId = Number(req.query.materialId);
    if (!materialId) return res.status(400).json({ error: "materialId requerido" });
    const data = await collectionRepository.findByMaterial(materialId);
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return;
    const parsed = CollectionInputSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    const data = await collectionRepository.create(parsed.data as Parameters<typeof collectionRepository.create>[0]);
    return res.status(201).json(data);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "id requerido" });
    const parsed = CollectionInputSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    const data = await collectionRepository.update(id, parsed.data);
    return res.status(200).json(data);
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return;
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "id requerido" });
    await collectionRepository.delete(id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
});
