import { z } from "zod"

/**
 * Schema para un ítem de navegación.
 */
export const NavItemSchema = z.object({
  label:    z.string().min(1).max(200),
  href:     z.string().max(500).default(""),
  order:    z.number().int().min(0).default(0),
  visible:  z.boolean().default(true),
  parentId: z.number().int().positive().nullable().default(null),
})

export type NavItemInput = z.infer<typeof NavItemSchema>
