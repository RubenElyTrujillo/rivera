import { z } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";
import { carouselItemRepository } from "@/repositories/carouselItem.repository";

const CarouselItemSchema = z.object({
  image: z.string().min(1).max(1000),
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(""),
  order: z.number().int().default(0),
});

export default withErrorHandling(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const items = await carouselItemRepository.findAll();
    return res.status(200).json(items);
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return;

    const parsed = CarouselItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }

    const item = await carouselItemRepository.create(parsed.data);
    return res.status(201).json(item);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
