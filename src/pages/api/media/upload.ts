import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

export const config = {
  api: { bodyParser: false },
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const form = formidable({
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    maxFileSize: 20 * 1024 * 1024, // 20 MB
    filter: ({ mimetype }) => {
      return !!(
        mimetype &&
        (mimetype.startsWith("image/") || mimetype === "application/pdf")
      );
    },
  });

  const [, files] = await form.parse(req);
  const fileField = files.file;
  const file = Array.isArray(fileField) ? fileField[0] : fileField;

  if (!file) {
    return res.status(400).json({ error: "No se recibió ningún archivo" });
  }

  const filename = path.basename(file.filepath);
  const url = `/uploads/${filename}`;

  const media = await db.media.create({
    data: {
      filename: file.originalFilename ?? filename,
      url,
      mimeType: file.mimetype ?? "application/octet-stream",
      size: file.size,
    },
  });

  return res.status(200).json(media);
});
