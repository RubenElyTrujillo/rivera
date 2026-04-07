import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

export const config = {
  api: { bodyParser: false },
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function uniqueName(base: string, ext: string): string {
  return `${base}-${Date.now()}${ext}`;
}

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  // Guardamos el archivo temporal fuera de public/uploads
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

  let finalPath: string;
  let finalFilename: string;
  let finalMime: string;
  let finalSize: number;

  if (isPdf) {
    // PDF: solo renombrar al nombre original sanitizado
    finalFilename = uniqueName(originalBase, ".pdf");
    finalPath = path.join(UPLOAD_DIR, finalFilename);
    fs.renameSync(file.filepath, finalPath);
    finalMime = "application/pdf";
    finalSize = file.size;
  } else {
    // Imagen: convertir a WebP optimizado con sharp
    finalFilename = uniqueName(originalBase, ".webp");
    finalPath = path.join(UPLOAD_DIR, finalFilename);

    await sharp(file.filepath)
      .webp({ quality: 82, effort: 4 })
      .toFile(finalPath);

    // Eliminar el temporal original
    fs.unlinkSync(file.filepath);

    finalMime = "image/webp";
    finalSize = fs.statSync(finalPath).size;
  }

  const url = `/uploads/${finalFilename}`;

  const media = await db.media.create({
    data: {
      filename: `${originalBase}.${isPdf ? "pdf" : "webp"}`,
      url,
      mimeType: finalMime,
      size: finalSize,
    },
  });

  return res.status(200).json(media);
});

