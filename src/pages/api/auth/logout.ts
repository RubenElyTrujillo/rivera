import type { NextApiRequest, NextApiResponse } from "next";
import { clearAuthCookie } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHandler";

export default withErrorHandling(function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  clearAuthCookie(res);
  return res.status(200).json({ ok: true });
});
