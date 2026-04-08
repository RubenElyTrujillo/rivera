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
  order:      z.number().int().min(0).default(0),
});

export type FinishInput = z.infer<typeof FinishSchema>;
