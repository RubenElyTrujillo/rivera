import { z } from "zod"

export const PageSectionSchema = z.object({
  type: z.string().min(1, "Tipo requerido").max(50),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
  config: z.string().default("{}"),
})

export type PageSectionInput = z.infer<typeof PageSectionSchema>
