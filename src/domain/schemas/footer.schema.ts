import { z } from "zod";

/**
 * Schema de validación para el contenido del Footer.
 * Usado en PUT /api/content/footer.
 */
export const FooterSchema = z.object({
  tagline:  z.string().min(1).max(500),
  services: z.array(z.string()).default([]),
});

export type FooterInput = z.infer<typeof FooterSchema>;
