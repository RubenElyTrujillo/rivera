import { z } from "zod";

/**
 * Schema de validación para una categoría de espacios.
 * Usado en POST/PUT /api/content/space-categories.
 */
export const SpaceCategorySchema = z.object({
  name:       z.string().min(1).max(200),
  coverImage: z.string().max(1000).default(""),
  order:      z.number().int().min(0).default(0),
});

/** Schema para reemplazar toda la lista de categorías. */
export const SpaceCategoryListSchema = z.array(SpaceCategorySchema);

export type SpaceCategoryInput = z.infer<typeof SpaceCategorySchema>;
