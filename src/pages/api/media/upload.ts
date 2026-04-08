import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs";
import { mediaRepository } from "@/repositories/media.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";
import { convertToWebP } from "@/infrastructure/storage/image";
import { ensureUploadDir, sanitizeName, uniqueFilename, UPLOAD_DIR } from "@/infrastructure/storage/fileSystem";

export const config = {
  api: { bodyParser: false },
};

/**
 * POST /api/media/upload
 *
 * Sube un archivo (imagen o PDF) al servidor.
 * - Imágenes: se convierten automáticamente a WebP optimizado (quality=82) con sharp.
 * - PDFs: se renombran con nombre sanitizado y timestamp.
 *
 * Requiere autenticación de administrador.
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  if (!requireAuth(req, res)) return;

  ensureUploadDir();

  const form = formidable({
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    maxFileSize: 20 * 1024 * 1024,
    filter: ({ mimetype }) =>
      !!(mimetype && (mimetype.startsWith("image/") || mimetype === "application/pdf")),
  });

  const [, files] = await form.parse(req);
  const fileField = files.file;
  const file = Array.isArray(fileField) ? fileField[0] : fileField;

  if (!file) {
    return res.status(400).json({ error: "No se recibió ningún archivo" });
  }

  const isPdf = file.mimetype === "application/pdf";
  const originalBase = sanitizeName(
    path.basename(file.originalFilename ?? "file", path.extname(file.originalFilename ?? "file"))
  );

  let finalFilename: string;
  let finalPath: string;
  let finalMime: string;
  let finalSize: number;

  if (isPdf) {
    finalFilename = uniqueFilename(originalBase, ".pdf");
    finalPath = path.join(UPLOAD_DIR, finalFilename);
    fs.renameSync(file.filepath, finalPath);
    finalMime = "application/pdf";
    finalSize = file.size;
  } else {
    finalFilename = uniqueFilename(originalBase, ".webp");
    finalPath = path.join(UPLOAD_DIR, finalFilename);
    await convertToWebP(file.filepath, finalPath);
    fs.unlinkSync(file.filepath);
    finalMime = "image/webp";
    finalSize = fs.statSync(finalPath).size;
  }

  const media = await mediaRepository.create({
    filename: `${originalBase}.${isPdf ? "pdf" : "webp"}`,
    url: `/uploads/${finalFilename}`,
    mimeType: finalMime,
    size: finalSize,
  });

  return res.status(200).json(media);
});
