import { z } from "zod";

export const BLOCK_TYPES = [
  "HERO",
  "TEXT",
  "TEXT_IMAGE",
  "GALLERY",
  "QUOTE",
  "CTA",
  "SPACER",
  "VIDEO",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const HeroConfigSchema = z.object({
  imageUrl: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  height: z.enum(["sm", "md", "lg"]).default("md"),
});

export const TextConfigSchema = z.object({
  html: z.string().min(1),
});

export const TextImageConfigSchema = z.object({
  imageUrl: z.string().min(1),
  imageSide: z.enum(["left", "right"]).default("left"),
  title: z.string().optional().nullable(),
  html: z.string().min(1),
});

export const GalleryConfigSchema = z.object({
  images: z.array(z.string().min(1)).min(1),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
});

export const QuoteConfigSchema = z.object({
  text: z.string().min(1),
  author: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
});

export const CtaConfigSchema = z.object({
  title: z.string().min(1),
  buttonText: z.string().min(1),
  linkType: z.enum(["internal", "external"]),
  linkHref: z.string().min(1),
  style: z.enum(["primary", "secondary"]).default("primary"),
});

export const SpacerConfigSchema = z.object({
  size: z.enum(["sm", "md", "lg"]).default("md"),
});

export const VideoConfigSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional().nullable(),
});

export const BlockConfigSchemas = {
  HERO:       HeroConfigSchema,
  TEXT:       TextConfigSchema,
  TEXT_IMAGE: TextImageConfigSchema,
  GALLERY:   GalleryConfigSchema,
  QUOTE:     QuoteConfigSchema,
  CTA:       CtaConfigSchema,
  SPACER:    SpacerConfigSchema,
  VIDEO:     VideoConfigSchema,
} as const;

export type HeroConfig       = z.infer<typeof HeroConfigSchema>;
export type TextConfig       = z.infer<typeof TextConfigSchema>;
export type TextImageConfig  = z.infer<typeof TextImageConfigSchema>;
export type GalleryConfig    = z.infer<typeof GalleryConfigSchema>;
export type QuoteConfig      = z.infer<typeof QuoteConfigSchema>;
export type CtaConfig        = z.infer<typeof CtaConfigSchema>;
export type SpacerConfig     = z.infer<typeof SpacerConfigSchema>;
export type VideoConfig      = z.infer<typeof VideoConfigSchema>;

export function parseBlockConfig(
  type: string,
  config: unknown,
): { success: true; data: unknown } | { success: false; error: string } {
  const schema = (BlockConfigSchemas as Record<string, z.ZodTypeAny>)[type];
  if (!schema) return { success: false, error: `Tipo de bloque desconocido: ${type}` };
  const parsed = schema.safeParse(config);
  if (parsed.success) return { success: true, data: parsed.data };
  return { success: false, error: JSON.stringify(parsed.error.flatten()) };
}

export const PaginaBloqueSchema = z.object({
  order: z.number().int().min(0),
  type: z.enum(BLOCK_TYPES),
  config: z.string(),
  visible: z.boolean().default(true),
});

export type PaginaBloqueInput = z.infer<typeof PaginaBloqueSchema>;
