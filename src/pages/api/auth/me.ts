import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET /api/auth/me
 *
 * Verifica si el usuario tiene una sesión activa válida.
 * Usado por el hook `useAdminAuth` en el cliente para proteger las páginas del admin.
 *
 * @returns 200 con el payload del JWT si está autenticado, 401 si no.
 */
export default withErrorHandling(function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  return res.status(200).json({ userId: auth.userId, email: auth.email });
});
