import type { NextApiRequest, NextApiResponse } from "next";
import { CatalogContentSchema } from "@/domain/schemas/catalog.schema";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";
import { db } from "@/lib/db";

/**
 * GET /api/content/catalog  → Devuelve el contenido del catálogo.
 * PUT /api/content/catalog  → Actualiza el contenido del catálogo (requiere auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await db.catalogContent.findFirst();
    return res.status(200).json(data ?? {
      title: "Catálogo completo",
      description: "Descarga nuestro catálogo con especificaciones técnicas, colecciones de pisos, colores y fichas de cada producto.",
      pdfUrl: "/CR%20CATALOGO.pdf",
      buttonText: "DESCARGAR CATÁLOGO PDF",
    });
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const parsed = CatalogContentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos del catálogo inválidos", details: parsed.error.flatten() });
    }

    const existing = await db.catalogContent.findFirst();
    const data = existing
      ? await db.catalogContent.update({ where: { id: existing.id }, data: parsed.data })
      : await db.catalogContent.create({ data: parsed.data });

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
