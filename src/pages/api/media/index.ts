import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { mediaRepository } from "@/repositories/media.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { removeFileIfExists, UPLOAD_DIR } from "@/infrastructure/storage/fileSystem";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET    /api/media     → Lista todos los archivos subidos (requiere auth).
 * DELETE /api/media?id= → Elimina un archivo del disco y de la DB (requiere auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    if (!requireAuth(req, res)) return;
    const data = await mediaRepository.findAll();
    return res.status(200).json(data);
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return;

    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "ID requerido" });

    const media = await mediaRepository.findById(id);
    if (!media) return res.status(404).json({ error: "No encontrado" });

    removeFileIfExists(path.join(UPLOAD_DIR, path.basename(media.url)));
    await mediaRepository.delete(id);

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
});
