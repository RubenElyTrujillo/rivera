import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/domain/types/auth";

const JWT_SECRET =
  process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET ?? "dev-secret-change-in-production";

/** Duración del token: 7 días en segundos. */
export const JWT_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * Firma un JWT con el payload del usuario autenticado.
 * @param payload - Datos del usuario (id y email) a incluir en el token.
 * @returns Token JWT firmado como string.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_MAX_AGE });
}

/**
 * Verifica y decodifica un JWT.
 * @param token - Token JWT a verificar.
 * @returns El payload decodificado, o `null` si el token es inválido o expiró.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
