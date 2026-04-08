import { z } from "zod";

/**
 * Schema de validación para los datos de Contacto.
 * Usado en PUT /api/content/contact.
 */
export const ContactSchema = z.object({
  whatsappPhone:  z.string().min(1).max(30),
  phone1:         z.string().min(1).max(50),
  phone2:         z.string().max(50).default(""),
  email:          z.string().email("Email inválido"),
  hoursText:      z.string().max(500),
  surfaceOptions: z.array(z.string()).default([]),
});

export type ContactInput = z.infer<typeof ContactSchema>;
