import type { NextApiRequest, NextApiResponse } from "next";

interface QuotationPayload {
  name: string;
  phone: string;
  surface: string;
  area: string;
  location: string;
  message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { name, phone, surface, area, location, message } =
    req.body as QuotationPayload;

  if (!surface) {
    return res.status(400).json({ error: "Tipo de superficie requerido" });
  }

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
}
