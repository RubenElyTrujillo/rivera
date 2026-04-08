import type { NextApiRequest, NextApiResponse } from "next";

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * HOF que envuelve un API handler con manejo centralizado de errores.
 * Captura cualquier excepción no controlada (DB, red, etc.) y responde 500
 * en lugar de dejar el request colgado sin respuesta.
 *
 * @param handler - Handler de Next.js API a proteger.
 * @returns El mismo handler envuelto en un try/catch.
 *
 * @example
 *   export default withErrorHandling(async function handler(req, res) {
 *     // tu lógica aquí — los errores se capturan automáticamente
 *   });
 */
export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(`[API Error] ${req.method} ${req.url}`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error interno del servidor" });
      }
    }
  };
}
