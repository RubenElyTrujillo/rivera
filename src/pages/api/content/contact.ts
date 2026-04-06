import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

const ContactSchema = z.object({
  whatsappPhone: z.string().min(1).max(30),
  phone1: z.string().min(1).max(50),
  phone2: z.string().max(50).default(""),
  email: z.string().email("Email inválido"),
  hoursText: z.string().max(500),
  surfaceOptions: z.array(z.string()).default([]),
});

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const row = await db.contactInfo.findFirst();
    if (!row) return res.status(200).json(null);
    return res.status(200).json({
      ...row,
      surfaceOptions: JSON.parse(row.surfaceOptions) as string[],
    });
  }

  if (req.method === "PUT") {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const parsed = ContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos de contacto inválidos", details: parsed.error.flatten() });
    }

    const { whatsappPhone, phone1, phone2, email, hoursText, surfaceOptions } = parsed.data;
    const existing = await db.contactInfo.findFirst();
    const data = {
      whatsappPhone,
      phone1,
      phone2,
      email,
      hoursText,
      surfaceOptions: JSON.stringify(surfaceOptions),
    };
    const row = existing
      ? await db.contactInfo.update({ where: { id: existing.id }, data })
      : await db.contactInfo.create({ data });

    return res.status(200).json({
      ...row,
      surfaceOptions: JSON.parse(row.surfaceOptions) as string[],
    });
  }

  return res.status(405).json({ error: "Método no permitido" });
});
