import { z } from "zod"

export const CategoriaSchema = z.object({
  name:        z.string().min(1).max(200),
  coverImage:  z.string().max(1000).nullable().default(null),
  description: z.string().max(3000).nullable().default(null),
  order:       z.number().int().min(0).default(0),
})

export type CategoriaInput = z.infer<typeof CategoriaSchema>
