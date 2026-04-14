import { z } from "zod"

export const ProductoSchema = z.object({
  subcategoriaId: z.number().int().positive(),
  name:           z.string().min(1).max(200),
  coverImage:     z.string().max(1000).nullable().default(null),
  hoverImage:     z.string().max(1000).nullable().default(null),
  shortDesc:      z.string().max(500).nullable().default(null),
  htmlContent:    z.string().nullable().default(null),
  order:          z.number().int().min(0).default(0),
})

export type ProductoInput = z.infer<typeof ProductoSchema>

export const ProductoImagenSchema = z.object({
  productoId: z.number().int().positive(),
  url:        z.string().min(1).max(1000),
  caption:    z.string().max(300).nullable().default(null),
  order:      z.number().int().min(0).default(0),
})

export type ProductoImagenInput = z.infer<typeof ProductoImagenSchema>
