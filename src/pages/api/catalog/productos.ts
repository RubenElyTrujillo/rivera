import type { NextApiRequest, NextApiResponse } from "next"
import { ProductoSchema } from "@/domain/schemas/producto.schema"
import { productoRepository } from "@/repositories/producto.repository"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling"

/**
 * GET    /api/catalog/productos                    → Todos o filtrados por ?subcategoriaId=X
 * POST   /api/catalog/productos                    → Crear (auth)
 * PUT    /api/catalog/productos?id=X               → Actualizar (auth)
 * DELETE /api/catalog/productos?id=X               → Eliminar (auth)
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const subcategoriaId = req.query.subcategoriaId ? Number(req.query.subcategoriaId) : undefined
    const data = await productoRepository.findAll(subcategoriaId)
    res.status(200).json(data); return
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return
    const parsed = ProductoSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() }); return }
    const data = await productoRepository.create(parsed.data)
    res.status(201).json(data); return
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) { res.status(400).json({ error: "Se requiere ?id=X" }); return }
    const parsed = ProductoSchema.partial().safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() }); return }
    const data = await productoRepository.update(id, parsed.data)
    res.status(200).json(data); return
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) { res.status(400).json({ error: "Se requiere ?id=X" }); return }
    await productoRepository.delete(id)
    res.status(204).end(); return
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"])
  res.status(405).end()
})
