import { z } from "zod";

/**
 * Schema de validación para un material (sin acabados).
 * Usado en PUT /api/content/materials (array de MaterialSchema).
 */
export const MaterialSchema = z.object({
  name:        z.string().min(1).max(200),
  slug:        z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  subtitle:    z.string().max(300),
  desc:        z.string().max(5000),
  spec:        z.string().max(10000).default(""),
  coverImage:  z.string().max(1000).default(""),
  collections: z.array(z.string()).default([]),
  order:       z.number().int().min(0),
  categoryId:  z.number().int().nullable().default(null),
});

/** Schema para actualización completa de la lista de materiales. */
export const MaterialsListSchema = z.array(MaterialSchema);

export type MaterialInput = z.infer<typeof MaterialSchema>;
