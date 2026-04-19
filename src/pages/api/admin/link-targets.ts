import type { NextApiRequest, NextApiResponse } from "next";
import { paginaRepository } from "@/repositories/pagina.repository";
import { categoriaRepository } from "@/repositories/categoria.repository";
import { subcategoriaRepository } from "@/repositories/subcategoria.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

export interface LinkTarget {
  label: string;
  href: string;
  group: "pagina" | "categoria" | "subcategoria" | "anchor";
}

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });
  if (!requireAuth(req, res)) return;

  const [paginas, categorias, subcats] = await Promise.all([
    paginaRepository.findAll(),
    categoriaRepository.findAll(),
    subcategoriaRepository.findAll(),
  ]);

  const targets: LinkTarget[] = [
    { label: "Inicio", href: "/", group: "anchor" },
    { label: "Sección: Contacto (home)", href: "/#contacto", group: "anchor" },
    { label: "Sección: Ventas (home)", href: "/#ventas", group: "anchor" },
    ...paginas
      .filter((p) => p.published)
      .map((p) => ({ label: `Página: ${p.title}`, href: `/p/${p.slug}`, group: "pagina" as const })),
    ...categorias.map((c) => ({ label: `Categoría: ${c.name}`, href: `/${c.slug}`, group: "categoria" as const })),
    ...subcats.map((s: { name: string; slug: string; categoria?: { slug?: string } | null }) => ({
      label: `Subcategoría: ${s.name}`,
      href: `/${s.categoria?.slug ?? ""}/${s.slug}`.replace("//", "/"),
      group: "subcategoria" as const,
    })),
  ];

  return res.status(200).json(targets);
});
