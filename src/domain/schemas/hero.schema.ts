import { z } from "zod";

/**
 * Schema de validación para el contenido de la sección Hero.
 * Usado en PUT /api/content/hero para validar el body antes de guardar en DB.
 */
export const HeroSchema = z.object({
  subtitle:    z.string().min(1).max(300),
  titleLine1:  z.string().min(1).max(200),
  titleLine2:  z.string().min(1).max(200),
  description: z.string().max(1000),
  imageUrl:    z.string().max(1000),
});

export type HeroInput = z.infer<typeof HeroSchema>;
