import type { NextApiRequest, NextApiResponse } from "next";
import { QuotationSchema } from "@/domain/schemas/quotation.schema";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * POST /api/quotation
 *
 * Recibe una solicitud de cotización del formulario público y la reenvía
 * al webhook de n8n configurado en la variable de entorno N8N_QUOTATION_WEBHOOK_URL.
 *
 * Si el webhook no está configurado, la petición se acepta igualmente (modo silencioso).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const parsed = QuotationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" });
  }

  const webhookUrl = process.env.N8N_QUOTATION_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        console.error("[quotation] n8n webhook error:", response.status, await response.text());
      }
    } catch (err) {
      console.error("[quotation] Error enviando a n8n:", err);
    }
  }

  return res.status(200).json({ ok: true });
});
