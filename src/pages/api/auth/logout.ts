import type { NextApiRequest, NextApiResponse } from "next";
import { clearAuthCookie } from "@/infrastructure/auth/cookies";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * POST /api/auth/logout
 *
 * Cierra la sesión del administrador eliminando la cookie de autenticación.
 */
export default withErrorHandling(function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  clearAuthCookie(res);
  return res.status(200).json({ ok: true });
});
