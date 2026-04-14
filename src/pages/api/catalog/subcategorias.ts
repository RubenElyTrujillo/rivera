import type { NextApiRequest, NextApiResponse } from "next"
import { SubcategoriaSchema } from "@/domain/schemas/subcategoria.schema"
import { subcategoriaRepository } from "@/repositories/subcategoria.repository"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling"

/**
 * GET    /api/catalog/subcategorias              → Todas o filtradas por ?categoriaId=X
 * POST   /api/catalog/subcategorias              → Crear (auth)
 * PUT    /api/catalog/subcategorias?id=X         → Actualizar (auth)
 * DELETE /api/catalog/subcategorias?id=X         → Eliminar (auth)
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const categoriaId = req.query.categoriaId ? Number(req.query.categoriaId) : undefined
    const data = await subcategoriaRepository.findAll(categoriaId)
    res.status(200).json(data); return
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return
    const parsed = SubcategoriaSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() }); return }
    const data = await subcategoriaRepository.create(parsed.data)
    res.status(201).json(data); return
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) { res.status(400).json({ error: "Se requiere ?id=X" }); return }
    const parsed = SubcategoriaSchema.partial().safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() }); return }
    const data = await subcategoriaRepository.update(id, parsed.data)
    res.status(200).json(data); return
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) { res.status(400).json({ error: "Se requiere ?id=X" }); return }
    await subcategoriaRepository.delete(id)
    res.status(204).end(); return
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"])
  res.status(405).end()
})
