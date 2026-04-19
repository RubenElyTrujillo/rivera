import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import {
  BLOCK_TYPES,
  parseBlockConfig,
} from "@/domain/schemas/paginaBloque.schema";
import { paginaRepository } from "@/repositories/pagina.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

const BloqueInputSchema = z.object({
  type: z.enum(BLOCK_TYPES),
  config: z.union([z.string(), z.record(z.string(), z.unknown())]),
  visible: z.boolean().default(true),
});
const BloquesListSchema = z.array(BloqueInputSchema);

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID inválido" });

  if (req.method !== "PUT") return res.status(405).json({ error: "Método no permitido" });
  if (!requireAuth(req, res)) return;

  const parsed = BloquesListSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Bloques inválidos", details: parsed.error.flatten() });
  }

  const normalized = [];
  for (const [i, b] of parsed.data.entries()) {
    const raw = typeof b.config === "string" ? safeJSON(b.config) : b.config;
    if (raw == null) {
      return res.status(400).json({ error: `Bloque ${i} tiene config inválido (JSON malformado)` });
    }
    const check = parseBlockConfig(b.type, raw);
    if (!check.success) {
      return res.status(400).json({ error: `Bloque ${i} (${b.type}) inválido: ${check.error}` });
    }
    normalized.push({
      order: i,
      type: b.type,
      config: JSON.stringify(check.data),
      visible: b.visible,
    });
  }

  const saved = await paginaRepository.replaceBloques(id, normalized);
  return res.status(200).json(saved);
});

function safeJSON(s: string): unknown {
  try { return JSON.parse(s); } catch { return null; }
}
