import { z } from "zod";

/**
 * Schema de validación para una imagen adicional de un proyecto.
 */
export const SpaceProjectImageSchema = z.object({
  id:      z.number().int().optional(),
  url:     z.string().max(1000),
  caption: z.string().max(500).default(""),
  order:   z.number().int().min(0).default(0),
});

/**
 * Schema de validación para un proyecto de la galería Espacios.
 * Usado en PUT /api/content/spaces (array de SpaceSchema).
 */
export const SpaceSchema = z.object({
  title:       z.string().min(1).max(200),
  category:    z.string().min(1).max(100),
  imageUrl:    z.string().max(1000),
  description: z.string().max(5000).default(""),
  completedAt: z.string().nullable().optional(),
  order:       z.number().int().min(0),
  images:      z.array(SpaceProjectImageSchema).default([]),
});

/** Schema para actualización completa de la lista de espacios. */
export const SpacesListSchema = z.array(SpaceSchema);

export type SpaceInput = z.infer<typeof SpaceSchema>;
export type SpaceProjectImageInput = z.infer<typeof SpaceProjectImageSchema>;
