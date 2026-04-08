import type { NextApiRequest, NextApiResponse } from "next";
import { ContactSchema } from "@/domain/schemas/contact.schema";
import { contactRepository } from "@/repositories/contact.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET  /api/content/contact  → Devuelve los datos de contacto.
 * PUT  /api/content/contact  → Actualiza los datos de contacto (requiere auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await contactRepository.findOne();
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;

    const parsed = ContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos de contacto inválidos", details: parsed.error.flatten() });
    }

    const data = await contactRepository.upsert(parsed.data);
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
