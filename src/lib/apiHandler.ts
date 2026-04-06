import type { NextApiRequest, NextApiResponse } from "next";

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * Wraps an API handler with centralized error handling.
 * Prevents unhandled Prisma/DB errors from crashing the handler silently.
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
