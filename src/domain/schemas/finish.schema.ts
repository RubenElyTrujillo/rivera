import { z } from "zod";

/**
 * Schema para una colección de material (nivel 2).
 * Slug se auto-genera desde el nombre en el repositorio.
 */
export const CollectionSchema = z.object({
  materialId: z.number().int().positive(),
  name:       z.string().min(1).max(200),
  desc:       z.string().max(2000).default(""),
  coverImage: z.string().max(1000).default(""),
  order:      z.number().int().min(0).default(0),
});

export type CollectionInput = z.infer<typeof CollectionSchema>;

/**
 * Schema para un producto/acabado (nivel 3).
 * Slug se auto-genera desde el nombre en el repositorio.
 */
export const FinishSchema = z.object({
  materialId:   z.number().int().positive(),
  collectionId: z.number().int().positive(),
  name:         z.string().min(1).max(200),
  code:         z.string().max(100).default(""),
  image:        z.string().max(1000).default(""),
  hoverImage:   z.string().max(1000).default(""),
  dims:         z.string().max(200).default(""),
  desc:         z.string().max(2000).default(""),
  order:        z.number().int().min(0).default(0),
  pdfUrl:       z.string().max(1000).default(""),
  thickness:    z.string().max(100).default(""),
  useClass:     z.string().max(200).default(""),
  waterRes:     z.boolean().default(false),
  installType:  z.string().max(200).default(""),
  warranty:     z.string().max(200).default(""),
  specMd:       z.string().default(""),
});

export type FinishInput = z.infer<typeof FinishSchema>;
