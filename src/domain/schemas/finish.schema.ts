import { z } from "zod";

/**
 * Schema de validación para un acabado de material.
 * Usado en POST/PUT /api/content/finishes.
 */
export const FinishSchema = z.object({
  materialId: z.number().int().positive().optional(),
  name:       z.string().min(1).max(200),
  code:       z.string().max(100).default(""),
  collection: z.string().max(200).default(""),
  image:      z.string().max(1000).default(""),
  dims:       z.string().max(200).default(""),
  order:        z.number().int().min(0).default(0),
  hoverImage:   z.string().default(""),
  pdfUrl:       z.string().default(""),
  thickness:    z.string().default(""),
  useClass:     z.string().default(""),
  waterRes:     z.boolean().default(false),
  installType:  z.string().default(""),
  warranty:     z.string().default(""),
  collectionId: z.number().int().positive("Collection requerida"),
});

export type FinishInput = z.infer<typeof FinishSchema>;
