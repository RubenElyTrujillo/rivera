import { z } from "zod";

/**
 * Schema para un material (nivel 1).
 * Slug se auto-genera desde el nombre en el repositorio.
 */
export const MaterialSchema = z.object({
  name:       z.string().min(1).max(200),
  subtitle:   z.string().max(300).default(""),
  desc:       z.string().max(5000).default(""),
  spec:       z.string().max(10000).default(""),
  coverImage: z.string().max(1000).default(""),
  order:      z.number().int().min(0),
  categoryId: z.number().int().positive().nullable().default(null),
});

/** Schema para actualización completa de la lista de materiales. */
export const MaterialsListSchema = z.array(MaterialSchema);

export type MaterialInput = z.infer<typeof MaterialSchema>;
