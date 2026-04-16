import type { NextApiRequest, NextApiResponse } from "next"
import { proyectoRepository } from "@/repositories/proyecto.repository"
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling"

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") { res.status(405).end(); return }
  const featured = req.query.featured === "true"
  const data = featured
    ? await proyectoRepository.findFeatured()
    : await proyectoRepository.findAll()
  res.status(200).json(data)
})
