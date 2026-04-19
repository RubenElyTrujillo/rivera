import { z } from "zod";
import { PaginaBloqueSchema } from "./paginaBloque.schema";

export const PaginaSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones").min(1).max(100),
  published: z.boolean().default(false),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(400).optional().nullable(),
  ogImage: z.string().optional().nullable(),
});

export type PaginaInput = z.infer<typeof PaginaSchema>;

export const PaginaWithBloquesSchema = PaginaSchema.extend({
  bloques: z.array(PaginaBloqueSchema).default([]),
});

export type PaginaWithBloquesInput = z.infer<typeof PaginaWithBloquesSchema>;
