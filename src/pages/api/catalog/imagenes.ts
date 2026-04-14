import type { NextApiRequest, NextApiResponse } from "next"
import { ProductoImagenSchema } from "@/domain/schemas/producto.schema"
import { productoRepository } from "@/repositories/producto.repository"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling"

/**
 * POST   /api/catalog/imagenes           → Agregar imagen a producto (auth)
 * DELETE /api/catalog/imagenes?id=X      → Eliminar imagen (auth)
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    if (!requireAuth(req, res)) return
    const parsed = ProductoImagenSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() }); return }
    const data = await productoRepository.addImagen(parsed.data)
    res.status(201).json(data); return
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) { res.status(400).json({ error: "Se requiere ?id=X" }); return }
    await productoRepository.deleteImagen(id)
    res.status(204).end(); return
  }

  res.setHeader("Allow", ["POST", "DELETE"])
  res.status(405).end()
})
