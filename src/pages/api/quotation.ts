import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { withErrorHandling } from "@/lib/apiHandler";

const QuotationSchema = z.object({
  name: z.string().max(200).default(""),
  phone: z.string().max(50).default(""),
  surface: z.string().min(1, "Tipo de superficie requerido").max(200),
  area: z.string().max(100).default(""),
  location: z.string().max(300).default(""),
  message: z.string().max(2000).default(""),
});

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const parsed = QuotationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" });
  }

  const { name, phone, surface, area, location, message } = parsed.data;
  const n8nWebhookUrl = process.env.N8N_QUOTATION_WEBHOOK_URL;

  if (n8nWebhookUrl) {
    try {
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, surface, area, location, message }),
      });

      if (!response.ok) {
        console.error("n8n webhook error:", response.status, await response.text());
      }
    } catch (err) {
      console.error("Error enviando a n8n:", err);
    }
  }

  return res.status(200).json({ ok: true });
});
