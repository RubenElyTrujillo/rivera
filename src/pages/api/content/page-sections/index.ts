import type { NextApiRequest, NextApiResponse } from "next";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";
import { pageSectionRepository } from "@/repositories/pageSection.repository";

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await pageSectionRepository.findAll();
    return res.status(200).json(data);
  }
  return res.status(405).json({ error: "Método no permitido" });
});
