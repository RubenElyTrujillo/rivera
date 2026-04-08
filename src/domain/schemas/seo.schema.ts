import { z } from "zod";

/**
 * Schema de validación para la configuración SEO.
 * Usado en PUT /api/content/seo.
 */
export const SeoSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(500),
  keywords:    z.string().max(1000),
  ogImageUrl:  z.string().max(1000).default(""),
});

export type SeoInput = z.infer<typeof SeoSchema>;
