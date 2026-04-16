import { z } from "zod"

export const ProyectoSchema = z.object({
  title: z.string().min(2, "Mínimo 2 caracteres"),
  city: z.string().default(""),
  colonia: z.string().default(""),
  description: z.string().default(""),
  htmlContent: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
  ambientes: z.array(z.string()).default([]),
  area: z.number().int().optional().nullable(),
  subcategoriaId: z.number().int().optional().nullable(),
  materialLabel: z.string().optional().nullable(),
  imagenes: z.array(z.object({
    url: z.string(),
    caption: z.string().optional().nullable(),
    order: z.number().int().default(0),
  })).optional(),
})

export type ProyectoInput = z.infer<typeof ProyectoSchema>
