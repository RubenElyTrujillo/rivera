import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";
import { db } from "@/lib/db";

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;
    const items = req.body as { id: number; order: number }[];
    if (!Array.isArray(items)) return res.status(400).json({ error: "Array requerido" });

    await db.$transaction(
      items.map(({ id, order }) =>
        db.pageSection.update({ where: { id }, data: { order } })
      )
    );
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: "Método no permitido" });
});
