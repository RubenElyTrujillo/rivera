import { z } from "zod"

export const NavItemSchema = z.object({
  label: z.string().min(1, "Etiqueta requerida").max(100),
  href: z.string().default(""),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
  parentId: z.number().int().nullable().default(null),
})

export type NavItemInput = z.infer<typeof NavItemSchema>
