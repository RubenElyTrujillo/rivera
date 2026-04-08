import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { LoginSchema } from "@/domain/schemas/auth.schema";
import { userRepository } from "@/repositories/user.repository";
import { signToken } from "@/infrastructure/auth/jwt";
import { setAuthCookie } from "@/infrastructure/auth/cookies";
import { checkRateLimit, clearRateLimit } from "@/infrastructure/auth/rateLimit";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * POST /api/auth/login
 *
 * Autentica al administrador por email y contraseña.
 * Aplica rate limiting por IP (5 intentos en 15 minutos).
 * En caso de éxito, establece una cookie HttpOnly con el JWT.
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const ip =
    (req.headers?.["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
    req.socket?.remoteAddress ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: "Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.",
    });
  }

  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" });
  }

  const { email, password } = parsed.data;

  const user = await userRepository.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  clearRateLimit(ip);
  const token = signToken({ userId: user.id, email: user.email });
  setAuthCookie(res, token);

  return res.status(200).json({ ok: true });
});
