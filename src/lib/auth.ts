/**
 * @deprecated Importa directamente desde "@/infrastructure/auth/...".
 * Este archivo existe solo para compatibilidad durante la migración.
 */
export type { JwtPayload } from "@/domain/types/auth";
export { signToken, verifyToken } from "@/infrastructure/auth/jwt";
export { setAuthCookie, clearAuthCookie, getTokenFromRequest } from "@/infrastructure/auth/cookies";
export { requireAuth } from "@/infrastructure/auth/middleware";

