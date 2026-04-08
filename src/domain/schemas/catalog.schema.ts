import { z } from "zod";

/**
 * Schema de validación para el contenido del Catálogo.
 * Usado en PUT /api/content/catalog.
 */
export const CatalogSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(1000),
  pdfUrl:      z.string().max(1000),
  buttonText:  z.string().max(100).default("DESCARGAR CATÁLOGO PDF"),
});

export type CatalogInput = z.infer<typeof CatalogSchema>;
