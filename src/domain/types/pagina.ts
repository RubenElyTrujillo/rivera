import type { BlockType } from "@/domain/schemas/paginaBloque.schema";

export interface IPaginaBloque {
  id: number;
  paginaId: number;
  order: number;
  type: BlockType;
  config: string;      // JSON string
  visible: boolean;
}

export interface IPagina {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  bloques?: IPaginaBloque[];
}
