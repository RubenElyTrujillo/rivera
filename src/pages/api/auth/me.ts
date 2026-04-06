import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/apiHandler";

export default withErrorHandling(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const payload = requireAuth(req, res);
  if (!payload) return;

  const user = await db.user.findUnique({ where: { id: payload.userId } });
  if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

  return res.status(200).json({ id: user.id, email: user.email });
});
