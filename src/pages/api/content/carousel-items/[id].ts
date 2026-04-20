import { z } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";
import { carouselItemRepository } from "@/repositories/carouselItem.repository";

const CarouselItemUpdateSchema = z.object({
  image: z.string().min(1).max(1000).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  order: z.number().int().optional(),
});

export default withErrorHandling(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = Number(req.query.id);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

  if (req.method === "GET") {
    const item = await carouselItemRepository.findById(id);
    if (!item) { res.status(404).json({ error: "No encontrado" }); return; }
    res.status(200).json(item);
    return;
  }

  if (!requireAuth(req, res)) return;

  if (req.method === "PUT") {
    const parsed = CarouselItemUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
      return;
    }
    const item = await carouselItemRepository.update(id, parsed.data);
    res.status(200).json(item);
    return;
  }

  if (req.method === "DELETE") {
    await carouselItemRepository.delete(id);
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
});
