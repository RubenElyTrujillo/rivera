import { z } from "zod"

/**
 * Schema para un ítem de navegación.
 */
export const NavItemSchema = z.object({
  label:       z.string().min(1).max(200),
  href:        z.string().max(500).default(""),
  slug:        z.string().max(200).nullable().optional(),
  coverImage:  z.string().max(1000).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  order:       z.number().int().min(0).default(0),
  visible:     z.boolean().default(true),
  parentId:    z.number().int().positive().nullable().default(null),
})

export type NavItemInput = z.infer<typeof NavItemSchema>
