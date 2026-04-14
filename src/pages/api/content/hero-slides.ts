import { z } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";
import { pageSectionRepository } from "@/repositories/pageSection.repository";
import type { HeroPageConfig } from "@/domain/types";

const HeroSlideSchema = z.object({
  titleLine1:  z.string().max(200),
  titleLine2:  z.string().max(200),
  subtitle:    z.string().max(300),
  description: z.string().max(1000),
  imageUrl:    z.string().max(1000),
  textAlign:   z.enum(["left", "center", "right"]).optional(),
});

const HeroSlidesBodySchema = z.array(HeroSlideSchema).min(1).max(20);

async function getHeroSection() {
  const sections = await pageSectionRepository.findByType("HERO");
  return sections[0] ?? null;
}

export default withErrorHandling(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const section = await getHeroSection();
    if (!section) return res.status(200).json([]);
    const config = JSON.parse(section.config as string) as HeroPageConfig;
    return res.status(200).json(config.slides ?? []);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const parsed = HeroSlidesBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }

    const section = await getHeroSection();
    if (!section) {
      return res.status(404).json({ error: "Sección HERO no encontrada" });
    }

    const existingConfig = JSON.parse(section.config as string) as HeroPageConfig;
    const newConfig: HeroPageConfig = {
      ...existingConfig,
      slides: parsed.data,
    };

    await pageSectionRepository.update(section.id, {
      config: JSON.stringify(newConfig),
    });

    return res.status(200).json(parsed.data);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
