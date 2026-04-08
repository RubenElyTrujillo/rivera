import type { NextApiRequest, NextApiResponse } from "next";
import { JWT_MAX_AGE } from "./jwt";

const COOKIE_NAME = "rivera_admin_token";

/**
 * Establece la cookie HttpOnly de autenticación en la respuesta.
 * La cookie es Secure en producción y SameSite=Lax para protección CSRF.
 *
 * @param res   - Respuesta de Next.js API.
 * @param token - JWT firmado a almacenar en la cookie.
 */
export function setAuthCookie(res: NextApiResponse, token: string): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${JWT_MAX_AGE}; SameSite=Lax${secure}`
  );
}

/**
 * Elimina la cookie de autenticación estableciendo Max-Age=0.
 * Equivale a un logout desde el lado del servidor.
 *
 * @param res - Respuesta de Next.js API.
 */
export function clearAuthCookie(res: NextApiResponse): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`
  );
}

/**
 * Extrae el token JWT de la request: primero busca la cookie, luego el header Authorization.
 *
 * @param req - Request de Next.js API.
 * @returns El token como string, o `null` si no está presente.
 */
export function getTokenFromRequest(req: NextApiRequest): string | null {
  const cookie = req.cookies?.[COOKIE_NAME];
  if (cookie) return cookie;

  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);

  return null;
}
