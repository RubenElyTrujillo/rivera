import { z } from "zod"

/**
 * Schema para una categoría de producto (nivel raíz).
 * Slug se auto-genera desde el nombre en el repositorio.
 */
export const CategorySchema = z.object({
  name:       z.string().min(1).max(200),
  coverImage: z.string().max(1000).default(""),
  icon:       z.string().max(100).default(""),
  order:      z.number().int().min(0).default(0),
})

export type CategoryInput = z.infer<typeof CategorySchema>
