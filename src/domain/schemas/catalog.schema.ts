import { z } from "zod";

export const CatalogContentSchema = z.object({
  title:       z.string().min(1, "El título es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  pdfUrl:      z.string().min(1, "La URL del PDF es obligatoria"),
  buttonText:  z.string().min(1, "El texto del botón es obligatorio"),
});
