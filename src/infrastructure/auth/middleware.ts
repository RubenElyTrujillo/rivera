import type { NextApiRequest, NextApiResponse } from "next";
import type { JwtPayload } from "@/domain/types/auth";
import { getTokenFromRequest } from "./cookies";
import { verifyToken } from "./jwt";

/**
 * Middleware de autenticación para API routes del panel admin.
 * Verifica que la cookie/header tenga un JWT válido.
 *
 * @param req - Request de Next.js API.
 * @param res - Respuesta de Next.js API.
 * @returns El payload del JWT si el usuario está autenticado, o `null` si no lo está
 *          (en ese caso ya envía 401 al cliente).
 *
 * @example
 *   const auth = requireAuth(req, res);
 *   if (!auth) return; // 401 ya fue enviado
 */
export function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): JwtPayload | null {
  const token = getTokenFromRequest(req);

  if (!token) {
    res.status(401).json({ error: "No autenticado" });
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: "Token inválido o expirado" });
    return null;
  }

  return payload;
}
