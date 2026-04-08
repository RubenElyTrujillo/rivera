import { z } from "zod";

/**
 * Schema de validación para el formulario de cotización del sitio público.
 * Usado en POST /api/quotation antes de enviar al webhook n8n.
 */
export const QuotationSchema = z.object({
  name:     z.string().max(200).default(""),
  phone:    z.string().max(50).default(""),
  surface:  z.string().min(1, "Tipo de superficie requerido").max(200),
  area:     z.string().max(100).default(""),
  location: z.string().max(300).default(""),
  message:  z.string().max(2000).default(""),
});

export type QuotationInput = z.infer<typeof QuotationSchema>;
