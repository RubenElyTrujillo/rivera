import type { NextApiRequest, NextApiResponse } from "next"
import { CategoriaSchema } from "@/domain/schemas/categoria.schema"
import { categoriaRepository } from "@/repositories/categoria.repository"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling"

/**
 * GET    /api/catalog/categorias        → Lista todas las categorías
 * POST   /api/catalog/categorias        → Crear categoría (auth)
 * PUT    /api/catalog/categorias?id=X   → Actualizar (auth)
 * DELETE /api/catalog/categorias?id=X   → Eliminar (auth)
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await categoriaRepository.findAll()
    res.status(200).json(data); return
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return
    const parsed = CategoriaSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() }); return }
    const data = await categoriaRepository.create(parsed.data)
    res.status(201).json(data); return
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) { res.status(400).json({ error: "Se requiere ?id=X" }); return }
    const parsed = CategoriaSchema.partial().safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() }); return }
    const data = await categoriaRepository.update(id, parsed.data)
    res.status(200).json(data); return
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) { res.status(400).json({ error: "Se requiere ?id=X" }); return }
    await categoriaRepository.delete(id)
    res.status(204).end(); return
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"])
  res.status(405).end()
})
