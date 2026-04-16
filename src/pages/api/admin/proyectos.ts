import type { NextApiRequest, NextApiResponse } from "next"
import { ProyectoSchema } from "@/domain/schemas/proyecto.schema"
import { proyectoRepository } from "@/repositories/proyecto.repository"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling"

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return

  if (req.method === "GET") {
    const data = await proyectoRepository.findAll()
    res.status(200).json(data); return
  }

  if (req.method === "POST") {
    const parsed = ProyectoSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() }); return }
    const data = await proyectoRepository.create(parsed.data)
    res.status(201).json(data); return
  }

  res.setHeader("Allow", ["GET", "POST"])
  res.status(405).end()
})
