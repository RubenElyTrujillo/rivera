import { z } from "zod"

const PAGE_SECTION_TYPES = [
  "HERO",
  "VENTAS",
  "SHOWROOM",
  "SPACES",
  "CATALOG",
  "CONTACT",
  "CTA",
  "FEATURED",
  "CAROUSEL",
] as const

/**
 * Schema para una sección configurable del home.
 */
export const PageSectionSchema = z.object({
  type:    z.enum(PAGE_SECTION_TYPES),
  order:   z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
  config:  z.string().default("{}"),
})

export const PAGE_SECTION_TYPE_VALUES = PAGE_SECTION_TYPES
export type PageSectionInput = z.infer<typeof PageSectionSchema>
