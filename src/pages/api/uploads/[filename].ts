import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { withErrorHandling } from "@/lib/apiHandler";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export default withErrorHandling(function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  const filename = req.query.filename as string;
  if (!filename || filename.includes("..") || filename.includes("/")) {
    res.status(400).end();
    return;
  }

  const filepath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filepath)) {
    res.status(404).end();
    return;
  }

  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
  };

  const contentType = mimeTypes[ext] ?? "application/octet-stream";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  const stream = fs.createReadStream(filepath);
  stream.pipe(res);
});
