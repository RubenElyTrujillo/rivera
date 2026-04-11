import { z } from "zod"

export const CategorySchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  coverImage: z.string().default(""),
  icon: z.string().default(""),
  order: z.number().int().default(0),
})

export type CategoryInput = z.infer<typeof CategorySchema>
