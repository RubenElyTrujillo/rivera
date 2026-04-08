import { z } from "zod";

/**
 * Schema de validación para una tarjeta de servicio individual.
 * Usado en PUT /api/content/services (array de ServiceSchema).
 */
export const ServiceSchema = z.object({
  icon:     z.string().min(1).max(100),
  title:    z.string().min(1).max(200),
  subtitle: z.string().max(300),
  desc:     z.string().max(2000),
  order:    z.number().int().min(0),
});

/** Schema para actualización completa de la lista de servicios. */
export const ServicesListSchema = z.array(ServiceSchema);

export type ServiceInput = z.infer<typeof ServiceSchema>;
