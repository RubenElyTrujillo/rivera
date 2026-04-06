import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const media = await db.media.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json(media);
  }

  if (req.method === "DELETE") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "ID requerido" });

    const media = await db.media.findUnique({ where: { id } });
    if (!media) return res.status(404).json({ error: "No encontrado" });

    const filepath = path.join(process.cwd(), "public", media.url);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    await db.media.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
});
