import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";
import { db } from "@/lib/db";

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ error: "id requerido" });

  if (req.method === "PATCH") {
    if (!requireAuth(req, res)) return;
    const { visible, order } = req.body as { visible?: boolean; order?: number };
    const data = await db.pageSection.update({
      where: { id },
      data: {
        ...(visible !== undefined && { visible }),
        ...(order !== undefined && { order }),
      },
    });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
