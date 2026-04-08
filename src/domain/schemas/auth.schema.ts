import { z } from "zod";

/**
 * Schema de validación para el login de administrador.
 * Usado en POST /api/auth/login.
 */
export const LoginSchema = z.object({
  email:    z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
