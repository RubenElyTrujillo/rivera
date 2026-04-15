import { z } from "zod"

export const SubcategoriaSchema = z.object({
  categoriaId: z.number().int().positive(),
  name:        z.string().min(1).max(200),
  coverImage:  z.string().max(1000).nullable().default(null),
  description: z.string().max(3000).nullable().default(null),
  gridCols:    z.number().int().min(2).max(4).default(3),
  cardAspect:  z.enum(["cuadrada", "paisaje", "retrato"]).default("cuadrada"),
})

export type SubcategoriaInput = z.infer<typeof SubcategoriaSchema>
