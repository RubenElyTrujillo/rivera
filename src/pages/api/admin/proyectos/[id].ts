import type { NextApiRequest, NextApiResponse } from "next"
import { ProyectoSchema } from "@/domain/schemas/proyecto.schema"
import { proyectoRepository } from "@/repositories/proyecto.repository"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling"

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return
  const id = Number(req.query.id)
  if (!id) { res.status(400).json({ error: "ID inválido" }); return }

  if (req.method === "GET") {
    const data = await proyectoRepository.findById(id)
    if (!data) { res.status(404).json({ error: "No encontrado" }); return }
    res.status(200).json(data); return
  }

  if (req.method === "PUT") {
    const parsed = ProyectoSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() }); return }
    const data = await proyectoRepository.update(id, parsed.data)
    res.status(200).json(data); return
  }

  if (req.method === "DELETE") {
    await proyectoRepository.delete(id)
    res.status(204).end(); return
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"])
  res.status(405).end()
})
