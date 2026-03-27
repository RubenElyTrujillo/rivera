import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const { whatsappPhone, phone1, phone2, email, hoursText, surfaceOptions } = req.body;
    const existing = await db.contactInfo.findFirst();
    const data = {
      whatsappPhone,
      phone1,
      phone2: phone2 ?? "",
      email,
      hoursText,
      surfaceOptions: JSON.stringify(surfaceOptions ?? []),
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
}
