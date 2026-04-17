# Páginas Propias + Link en Services — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the client to create, edit and publish custom content pages (rendered at `/p/[slug]`) from an 8-block library, and add a configurable link target to each Service card.

**Architecture:** Two new Prisma models (`Pagina`, `PaginaBloque`) following the same pattern as `Proyecto`/`ProyectoImagen`. Each block stores its typed config as a JSON string in a `config` column — one Zod schema per block type validates the shape. Admin editor is a single page with a sortable list of block cards and a side panel for block editing. Public page uses `getServerSideProps` and a `<PaginaRenderer>` that switches on `block.type` to render one component per type (pattern identical to the existing `PageBuilder.tsx`). A new reusable `<LinkPicker>` is used by the CTA block and by the Service admin form.

**Tech Stack:** Next.js 16 Pages Router, Prisma 7 + `@prisma/adapter-pg`, Tailwind v4, existing `WysiwygEditor` (TipTap), `react-dnd` / existing drag-drop util used in `/admin/page-sections`, Zod, sanitize-html.

**Spec:** `docs/superpowers/specs/2026-04-17-paginas-propias-design.md`

---

## Conventions used in this codebase (follow them)

- IDs: `Int @id @default(autoincrement())` (like `Service`, `Proyecto`)
- Prisma client import: `import { db } from "@/infrastructure/db/client"`
- Migrations: manual SQL files under `prisma/migrations/YYYYMMDDHHMMSS_<name>/migration.sql` (no local DB — `prisma migrate dev` is NOT run)
- Repositories live in `src/repositories/*.repository.ts`
- Zod schemas in `src/domain/schemas/*.schema.ts`
- Domain types in `src/domain/types/*.ts`
- API handlers use `withErrorHandling` wrapper + `requireAuth(req, res)` for mutating methods (see `src/pages/api/content/services.ts`)
- Admin pages use `useAdminAuth()`, `useToast()`, `AdminInput`, `AdminTextarea`, `SaveButton` from `src/components/admin/adminUtils.tsx`
- Primary color: `hsl(20, 60%, 45%)` (terracota)
- No Docker DB at build time: `getServerSideProps` only, no `getStaticProps/Paths`

After any code change that edits `prisma/schema.prisma`, run `npx prisma generate` so the generated client updates.

After every task, run: `npx tsc --noEmit` and ensure zero errors.

---

## Task 1: Prisma schema + migration for Pagina, PaginaBloque, and Service link fields

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260417000001_paginas_propias/migration.sql`

- [ ] **Step 1: Append new models to `prisma/schema.prisma`**

Add after the existing `Proyecto` / `ProyectoImagen` block:

```prisma
// ─── Páginas propias ──────────────────────────────────────────────────────────

model Pagina {
  id              Int            @id @default(autoincrement())
  title           String
  slug            String         @unique
  published       Boolean        @default(false)
  seoTitle        String?
  seoDescription  String?
  ogImage         String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  bloques         PaginaBloque[]
}

model PaginaBloque {
  id        Int      @id @default(autoincrement())
  paginaId  Int
  pagina    Pagina   @relation(fields: [paginaId], references: [id], onDelete: Cascade)
  order     Int      @default(0)
  type      String
  config    String   @default("{}")
  visible   Boolean  @default(true)

  @@index([paginaId, order])
}
```

- [ ] **Step 2: Modify `Service` model — add `linkType` and `linkHref`**

Replace the `Service` model with:

```prisma
model Service {
  id       Int     @id @default(autoincrement())
  icon     String
  title    String
  subtitle String
  desc     String
  order    Int     @default(0)
  linkType String  @default("none")   // "none" | "internal" | "external"
  linkHref String?
}
```

- [ ] **Step 3: Create migration SQL**

Create `prisma/migrations/20260417000001_paginas_propias/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "Pagina" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaginaBloque" (
    "id" SERIAL NOT NULL,
    "paginaId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PaginaBloque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pagina_slug_key" ON "Pagina"("slug");
CREATE INDEX "PaginaBloque_paginaId_order_idx" ON "PaginaBloque"("paginaId", "order");

-- AddForeignKey
ALTER TABLE "PaginaBloque"
  ADD CONSTRAINT "PaginaBloque_paginaId_fkey"
  FOREIGN KEY ("paginaId") REFERENCES "Pagina"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Service link fields
ALTER TABLE "Service" ADD COLUMN "linkType" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "Service" ADD COLUMN "linkHref" TEXT;
```

- [ ] **Step 4: Regenerate the Prisma client**

Run:
```bash
npx prisma generate
```
Expected: "Generated Prisma Client" with no errors.

- [ ] **Step 5: Run TypeScript check**

Run:
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/" | head -20
```
Expected: no output (zero errors). The existing code compiles against the regenerated client because all new fields are additive.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20260417000001_paginas_propias/
git commit -m "feat(db): add Pagina + PaginaBloque models and Service link fields"
```

---

## Task 2: Block config Zod schemas (one per block type)

**Files:**
- Create: `src/domain/schemas/paginaBloque.schema.ts`
- Create: `src/domain/schemas/pagina.schema.ts`
- Create: `src/domain/schemas/__tests__/paginaBloque.schema.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/domain/schemas/__tests__/paginaBloque.schema.test.ts`:

```ts
import { describe, it, expect } from "@jest/globals";
import {
  HeroConfigSchema,
  TextConfigSchema,
  TextImageConfigSchema,
  GalleryConfigSchema,
  QuoteConfigSchema,
  CtaConfigSchema,
  SpacerConfigSchema,
  VideoConfigSchema,
  parseBlockConfig,
} from "@/domain/schemas/paginaBloque.schema";

describe("block config schemas", () => {
  it("HERO requires imageUrl and title", () => {
    expect(HeroConfigSchema.safeParse({}).success).toBe(false);
    expect(HeroConfigSchema.safeParse({ imageUrl: "/x.jpg", title: "T", height: "md" }).success).toBe(true);
  });

  it("TEXT requires html string", () => {
    expect(TextConfigSchema.safeParse({ html: "<p>hi</p>" }).success).toBe(true);
    expect(TextConfigSchema.safeParse({}).success).toBe(false);
  });

  it("TEXT_IMAGE requires imageSide left|right", () => {
    const ok = TextImageConfigSchema.safeParse({ imageUrl: "/x.jpg", imageSide: "left", html: "<p>x</p>" });
    expect(ok.success).toBe(true);
    const bad = TextImageConfigSchema.safeParse({ imageUrl: "/x.jpg", imageSide: "center", html: "<p>x</p>" });
    expect(bad.success).toBe(false);
  });

  it("GALLERY columns limited to 2|3|4", () => {
    expect(GalleryConfigSchema.safeParse({ images: ["/a.jpg"], columns: 3 }).success).toBe(true);
    expect(GalleryConfigSchema.safeParse({ images: ["/a.jpg"], columns: 5 }).success).toBe(false);
  });

  it("QUOTE requires text only", () => {
    expect(QuoteConfigSchema.safeParse({ text: "Hi" }).success).toBe(true);
    expect(QuoteConfigSchema.safeParse({}).success).toBe(false);
  });

  it("CTA requires linkType + linkHref + buttonText", () => {
    const ok = CtaConfigSchema.safeParse({
      title: "X", buttonText: "Ver", linkType: "internal", linkHref: "/p/nosotros", style: "primary",
    });
    expect(ok.success).toBe(true);
  });

  it("SPACER size is sm|md|lg", () => {
    expect(SpacerConfigSchema.safeParse({ size: "md" }).success).toBe(true);
    expect(SpacerConfigSchema.safeParse({ size: "xl" }).success).toBe(false);
  });

  it("VIDEO requires url", () => {
    expect(VideoConfigSchema.safeParse({ url: "https://youtube.com/watch?v=x" }).success).toBe(true);
    expect(VideoConfigSchema.safeParse({}).success).toBe(false);
  });

  it("parseBlockConfig dispatches by type and returns parsed config", () => {
    const parsed = parseBlockConfig("HERO", { imageUrl: "/x.jpg", title: "T", height: "md" });
    expect(parsed.success).toBe(true);
  });

  it("parseBlockConfig fails for unknown type", () => {
    const parsed = parseBlockConfig("UNKNOWN", {});
    expect(parsed.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx jest src/domain/schemas/__tests__/paginaBloque.schema.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/domain/schemas/paginaBloque.schema.ts`**

```ts
import { z } from "zod";

/**
 * Allowed block types. Extend this union and the matching map below
 * to add a new block type to the system.
 */
export const BLOCK_TYPES = [
  "HERO",
  "TEXT",
  "TEXT_IMAGE",
  "GALLERY",
  "QUOTE",
  "CTA",
  "SPACER",
  "VIDEO",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const HeroConfigSchema = z.object({
  imageUrl: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  height: z.enum(["sm", "md", "lg"]).default("md"),
});

export const TextConfigSchema = z.object({
  html: z.string().min(1),
});

export const TextImageConfigSchema = z.object({
  imageUrl: z.string().min(1),
  imageSide: z.enum(["left", "right"]).default("left"),
  title: z.string().optional().nullable(),
  html: z.string().min(1),
});

export const GalleryConfigSchema = z.object({
  images: z.array(z.string().min(1)).min(1),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
});

export const QuoteConfigSchema = z.object({
  text: z.string().min(1),
  author: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
});

export const CtaConfigSchema = z.object({
  title: z.string().min(1),
  buttonText: z.string().min(1),
  linkType: z.enum(["internal", "external"]),
  linkHref: z.string().min(1),
  style: z.enum(["primary", "secondary"]).default("primary"),
});

export const SpacerConfigSchema = z.object({
  size: z.enum(["sm", "md", "lg"]).default("md"),
});

export const VideoConfigSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional().nullable(),
});

/** Map block type → its zod schema. Keep in sync with BLOCK_TYPES. */
export const BlockConfigSchemas = {
  HERO:       HeroConfigSchema,
  TEXT:       TextConfigSchema,
  TEXT_IMAGE: TextImageConfigSchema,
  GALLERY:    GalleryConfigSchema,
  QUOTE:      QuoteConfigSchema,
  CTA:        CtaConfigSchema,
  SPACER:     SpacerConfigSchema,
  VIDEO:      VideoConfigSchema,
} as const;

export type HeroConfig       = z.infer<typeof HeroConfigSchema>;
export type TextConfig       = z.infer<typeof TextConfigSchema>;
export type TextImageConfig  = z.infer<typeof TextImageConfigSchema>;
export type GalleryConfig    = z.infer<typeof GalleryConfigSchema>;
export type QuoteConfig      = z.infer<typeof QuoteConfigSchema>;
export type CtaConfig        = z.infer<typeof CtaConfigSchema>;
export type SpacerConfig     = z.infer<typeof SpacerConfigSchema>;
export type VideoConfig      = z.infer<typeof VideoConfigSchema>;

/**
 * Parse an arbitrary config object against the schema for its type.
 * Returns { success, data } or { success, error }.
 */
export function parseBlockConfig(
  type: string,
  config: unknown,
): { success: true; data: unknown } | { success: false; error: string } {
  const schema = (BlockConfigSchemas as Record<string, z.ZodTypeAny>)[type];
  if (!schema) return { success: false, error: `Tipo de bloque desconocido: ${type}` };
  const parsed = schema.safeParse(config);
  if (parsed.success) return { success: true, data: parsed.data };
  return { success: false, error: JSON.stringify(parsed.error.flatten()) };
}

/** Schema for a PaginaBloque record (server-side). */
export const PaginaBloqueSchema = z.object({
  order: z.number().int().min(0),
  type: z.enum(BLOCK_TYPES),
  config: z.string(), // JSON string — validated elsewhere with parseBlockConfig
  visible: z.boolean().default(true),
});

export type PaginaBloqueInput = z.infer<typeof PaginaBloqueSchema>;
```

- [ ] **Step 4: Run tests — all pass**

Run: `npx jest src/domain/schemas/__tests__/paginaBloque.schema.test.ts`
Expected: all 10 tests pass.

- [ ] **Step 5: Create `src/domain/schemas/pagina.schema.ts`**

```ts
import { z } from "zod";
import { PaginaBloqueSchema } from "./paginaBloque.schema";

export const PaginaSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones").min(1).max(100),
  published: z.boolean().default(false),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(400).optional().nullable(),
  ogImage: z.string().optional().nullable(),
});

export type PaginaInput = z.infer<typeof PaginaSchema>;

export const PaginaWithBloquesSchema = PaginaSchema.extend({
  bloques: z.array(PaginaBloqueSchema).default([]),
});

export type PaginaWithBloquesInput = z.infer<typeof PaginaWithBloquesSchema>;
```

- [ ] **Step 6: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/" | head -10
git add src/domain/schemas/pagina.schema.ts src/domain/schemas/paginaBloque.schema.ts src/domain/schemas/__tests__/paginaBloque.schema.test.ts
git commit -m "feat(schemas): add Pagina and PaginaBloque zod schemas with per-type validation"
```

---

## Task 3: Domain types

**Files:**
- Create: `src/domain/types/pagina.ts`

- [ ] **Step 1: Create the types file**

```ts
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
```

- [ ] **Step 2: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/" | head
git add src/domain/types/pagina.ts
git commit -m "feat(types): add IPagina and IPaginaBloque domain types"
```

---

## Task 4: Pagina repository

**Files:**
- Create: `src/repositories/pagina.repository.ts`

- [ ] **Step 1: Create the repository**

```ts
import { db } from "@/infrastructure/db/client";
import type { IPagina, IPaginaBloque } from "@/domain/types/pagina";
import type { PaginaInput } from "@/domain/schemas/pagina.schema";
import type { PaginaBloqueInput, BlockType } from "@/domain/schemas/paginaBloque.schema";

function mapBloque(row: { id: number; paginaId: number; order: number; type: string; config: string; visible: boolean }): IPaginaBloque {
  return {
    id: row.id,
    paginaId: row.paginaId,
    order: row.order,
    type: row.type as BlockType,
    config: row.config,
    visible: row.visible,
  };
}

export const paginaRepository = {
  async findAll(): Promise<IPagina[]> {
    const rows = await db.pagina.findMany({
      orderBy: { updatedAt: "desc" },
      include: { bloques: { orderBy: { order: "asc" } } },
    });
    return rows.map((p) => ({ ...p, bloques: p.bloques.map(mapBloque) }));
  },

  async findById(id: number): Promise<IPagina | null> {
    const row = await db.pagina.findUnique({
      where: { id },
      include: { bloques: { orderBy: { order: "asc" } } },
    });
    if (!row) return null;
    return { ...row, bloques: row.bloques.map(mapBloque) };
  },

  async findBySlug(slug: string): Promise<IPagina | null> {
    const row = await db.pagina.findUnique({
      where: { slug },
      include: { bloques: { orderBy: { order: "asc" } } },
    });
    if (!row) return null;
    return { ...row, bloques: row.bloques.map(mapBloque) };
  },

  async findPublishedBySlug(slug: string): Promise<IPagina | null> {
    const row = await db.pagina.findFirst({
      where: { slug, published: true },
      include: { bloques: { where: { visible: true }, orderBy: { order: "asc" } } },
    });
    if (!row) return null;
    return { ...row, bloques: row.bloques.map(mapBloque) };
  },

  async create(input: PaginaInput): Promise<IPagina> {
    const row = await db.pagina.create({ data: input, include: { bloques: true } });
    return { ...row, bloques: row.bloques.map(mapBloque) };
  },

  async update(id: number, input: PaginaInput): Promise<IPagina> {
    const row = await db.pagina.update({
      where: { id },
      data: input,
      include: { bloques: { orderBy: { order: "asc" } } },
    });
    return { ...row, bloques: row.bloques.map(mapBloque) };
  },

  async delete(id: number): Promise<void> {
    await db.pagina.delete({ where: { id } });
  },

  /** Replace all blocks for a page in a single transaction. */
  async replaceBloques(paginaId: number, bloques: PaginaBloqueInput[]): Promise<IPaginaBloque[]> {
    return db.$transaction(async (tx) => {
      await tx.paginaBloque.deleteMany({ where: { paginaId } });
      if (bloques.length === 0) return [];
      await tx.paginaBloque.createMany({
        data: bloques.map((b, i) => ({
          paginaId,
          order: i, // authoritative ordering = array order
          type: b.type,
          config: b.config,
          visible: b.visible,
        })),
      });
      const rows = await tx.paginaBloque.findMany({
        where: { paginaId },
        orderBy: { order: "asc" },
      });
      return rows.map(mapBloque);
    });
  },
};
```

- [ ] **Step 2: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/" | head
git add src/repositories/pagina.repository.ts
git commit -m "feat(repos): add paginaRepository with CRUD + replaceBloques"
```

---

## Task 5: API endpoints for Pagina CRUD and block replacement

**Files:**
- Create: `src/pages/api/content/paginas/index.ts`
- Create: `src/pages/api/content/paginas/[id]/index.ts`
- Create: `src/pages/api/content/paginas/[id]/bloques.ts`
- Create: `src/pages/api/admin/link-targets.ts`

- [ ] **Step 1: Create `src/pages/api/content/paginas/index.ts` (list + create)**

```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PaginaSchema } from "@/domain/schemas/pagina.schema";
import { paginaRepository } from "@/repositories/pagina.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    if (!requireAuth(req, res)) return;
    const data = await paginaRepository.findAll();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return;
    const parsed = PaginaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }
    const existing = await paginaRepository.findBySlug(parsed.data.slug);
    if (existing) return res.status(409).json({ error: "Ya existe una página con ese slug" });
    const created = await paginaRepository.create(parsed.data);
    return res.status(201).json(created);
  }

  return res.status(405).json({ error: "Método no permitido" });
});
```

- [ ] **Step 2: Create `src/pages/api/content/paginas/[id]/index.ts`**

```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PaginaSchema } from "@/domain/schemas/pagina.schema";
import { paginaRepository } from "@/repositories/pagina.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID inválido" });

  if (req.method === "GET") {
    if (!requireAuth(req, res)) return;
    const page = await paginaRepository.findById(id);
    if (!page) return res.status(404).json({ error: "No encontrada" });
    return res.status(200).json(page);
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return;
    const parsed = PaginaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }
    // Prevent changing slug to one that belongs to another page
    const conflict = await paginaRepository.findBySlug(parsed.data.slug);
    if (conflict && conflict.id !== id) {
      return res.status(409).json({ error: "Ya existe otra página con ese slug" });
    }
    const updated = await paginaRepository.update(id, parsed.data);
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return;
    await paginaRepository.delete(id);
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Método no permitido" });
});
```

- [ ] **Step 3: Create `src/pages/api/content/paginas/[id]/bloques.ts`**

PUT replaces the entire list of blocks for the page (order = array index). Validates each block's config against its type-specific schema.

```ts
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

  // Validate each block's config against its type-specific schema
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
```

- [ ] **Step 4: Create `src/pages/api/admin/link-targets.ts`**

Returns a flat list of internal link targets the client can choose from.

```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { paginaRepository } from "@/repositories/pagina.repository";
import { categoriaRepository } from "@/repositories/categoria.repository";
import { subcategoriaRepository } from "@/repositories/subcategoria.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

export interface LinkTarget {
  label: string;  // human-readable: "Página: Nosotros" / "Categoría: Pisos"
  href: string;   // "/p/nosotros" / "/pisos"
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
    ...subcats.map((s) => ({
      label: `Subcategoría: ${s.name}`,
      // Subcategoria slugs are nested under their categoria slug
      href: `/${s.categoria?.slug ?? ""}/${s.slug}`.replace("//", "/"),
      group: "subcategoria" as const,
    })),
  ];

  return res.status(200).json(targets);
});
```

Note: if `subcategoriaRepository.findAll()` doesn't already `include: { categoria }`, update it to do so (see step 5). If it already does, skip step 5.

- [ ] **Step 5: Ensure subcategoriaRepository.findAll includes categoria**

Open `src/repositories/subcategoria.repository.ts` and verify `findAll` returns each subcat with its parent categoria slug accessible (e.g. `include: { categoria: { select: { slug: true } } }`). If not, add that include. If `ISubcategoria` doesn't already expose `categoria`, add an optional `categoria?: { slug: string }` field to the type used by `link-targets.ts` — a minimal local `type Row = ...` inside the endpoint is acceptable to avoid touching shared types.

- [ ] **Step 6: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/" | head -20
git add src/pages/api/content/paginas src/pages/api/admin/link-targets.ts src/repositories/subcategoria.repository.ts
git commit -m "feat(api): pagina CRUD + bloques PUT + link-targets endpoint"
```

---

## Task 6: LinkPicker reusable component

**Files:**
- Create: `src/components/admin/LinkPicker.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useEffect, useState } from "react";

export type LinkValue =
  | { type: "none" }
  | { type: "internal"; href: string }
  | { type: "external"; href: string };

interface LinkTarget {
  label: string;
  href: string;
  group: string;
}

interface LinkPickerProps {
  value: LinkValue;
  onChange: (v: LinkValue) => void;
  allowNone?: boolean;  // default true
}

export default function LinkPicker({ value, onChange, allowNone = true }: LinkPickerProps) {
  const [targets, setTargets] = useState<LinkTarget[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/admin/link-targets")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: LinkTarget[]) => { if (!cancelled) setTargets(data); })
      .catch(() => { if (!cancelled) setTargets([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex gap-3 text-sm">
        {allowNone && (
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              checked={value.type === "none"}
              onChange={() => onChange({ type: "none" })}
            />
            <span>Sin enlace</span>
          </label>
        )}
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            checked={value.type === "internal"}
            onChange={() => onChange({ type: "internal", href: value.type === "internal" ? value.href : "" })}
          />
          <span>Página interna</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            checked={value.type === "external"}
            onChange={() => onChange({ type: "external", href: value.type === "external" ? value.href : "" })}
          />
          <span>URL externa</span>
        </label>
      </div>

      {value.type === "internal" && (
        <select
          value={value.href}
          onChange={(e) => onChange({ type: "internal", href: e.target.value })}
          className="w-full px-3 py-2 border border-[hsl(0,0%,80%)] rounded-md text-sm bg-white"
        >
          <option value="">{loading ? "Cargando…" : "— Elige un destino —"}</option>
          {targets.map((t) => (
            <option key={`${t.group}-${t.href}`} value={t.href}>{t.label}</option>
          ))}
        </select>
      )}

      {value.type === "external" && (
        <input
          type="url"
          value={value.href}
          onChange={(e) => onChange({ type: "external", href: e.target.value })}
          placeholder="https://ejemplo.com"
          className="w-full px-3 py-2 border border-[hsl(0,0%,80%)] rounded-md text-sm"
        />
      )}
    </div>
  );
}

/**
 * Serialize a LinkValue into the two DB fields (linkType, linkHref).
 */
export function serializeLinkValue(v: LinkValue): { linkType: string; linkHref: string | null } {
  if (v.type === "none") return { linkType: "none", linkHref: null };
  return { linkType: v.type, linkHref: v.href };
}

/**
 * Parse the two DB fields back into a LinkValue.
 */
export function deserializeLinkValue(linkType: string, linkHref: string | null): LinkValue {
  if (linkType === "internal" && linkHref) return { type: "internal", href: linkHref };
  if (linkType === "external" && linkHref) return { type: "external", href: linkHref };
  return { type: "none" };
}
```

- [ ] **Step 2: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/" | head
git add src/components/admin/LinkPicker.tsx
git commit -m "feat(admin): reusable LinkPicker component with internal/external modes"
```

---

## Task 7: Public block components + PaginaRenderer

**Files:**
- Create: `src/components/blocks/HeroBlock.tsx`
- Create: `src/components/blocks/TextBlock.tsx`
- Create: `src/components/blocks/TextImageBlock.tsx`
- Create: `src/components/blocks/GalleryBlock.tsx`
- Create: `src/components/blocks/QuoteBlock.tsx`
- Create: `src/components/blocks/CtaBlock.tsx`
- Create: `src/components/blocks/SpacerBlock.tsx`
- Create: `src/components/blocks/VideoBlock.tsx`
- Create: `src/components/PaginaRenderer.tsx`

Each block is rendered server-side from the parsed config object. All blocks accept the config object as `config` prop. Unknown types render `null`.

- [ ] **Step 1: Create `src/components/blocks/HeroBlock.tsx`**

```tsx
import type { HeroConfig } from "@/domain/schemas/paginaBloque.schema";

const HEIGHTS = { sm: "h-[320px]", md: "h-[480px]", lg: "h-[640px]" } as const;

export default function HeroBlock({ config }: { config: HeroConfig }) {
  return (
    <section
      className={`relative w-full ${HEIGHTS[config.height]} flex items-center justify-center text-white bg-cover bg-center`}
      style={{ backgroundImage: `url(${config.imageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative text-center px-6 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">{config.title}</h1>
        {config.subtitle && <p className="text-lg md:text-xl opacity-90">{config.subtitle}</p>}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/blocks/TextBlock.tsx`**

```tsx
import type { TextConfig } from "@/domain/schemas/paginaBloque.schema";

export default function TextBlock({ config }: { config: TextConfig }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-10">
      <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: config.html }} />
    </section>
  );
}
```

- [ ] **Step 3: Create `src/components/blocks/TextImageBlock.tsx`**

```tsx
import type { TextImageConfig } from "@/domain/schemas/paginaBloque.schema";

export default function TextImageBlock({ config }: { config: TextImageConfig }) {
  const imageFirst = config.imageSide === "left";
  return (
    <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 items-center">
      <div className={imageFirst ? "md:order-1" : "md:order-2"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={config.imageUrl} alt={config.title ?? ""} className="w-full h-auto rounded-lg object-cover" />
      </div>
      <div className={imageFirst ? "md:order-2" : "md:order-1"}>
        {config.title && <h2 className="text-3xl font-bold mb-4">{config.title}</h2>}
        <div className="prose" dangerouslySetInnerHTML={{ __html: config.html }} />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `src/components/blocks/GalleryBlock.tsx`**

```tsx
import type { GalleryConfig } from "@/domain/schemas/paginaBloque.schema";

const COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export default function GalleryBlock({ config }: { config: GalleryConfig }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className={`grid grid-cols-1 ${COLS[config.columns]} gap-4`}>
        {config.images.map((src, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={i} src={src} alt="" className="w-full h-64 object-cover rounded-lg" />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create `src/components/blocks/QuoteBlock.tsx`**

```tsx
import type { QuoteConfig } from "@/domain/schemas/paginaBloque.schema";

export default function QuoteBlock({ config }: { config: QuoteConfig }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-12 text-center">
      <blockquote className="text-2xl md:text-3xl italic text-[hsl(0,0%,20%)] mb-4">
        “{config.text}”
      </blockquote>
      {(config.author || config.role) && (
        <div className="text-sm text-[hsl(0,0%,45%)]">
          {config.author && <strong>{config.author}</strong>}
          {config.author && config.role && " — "}
          {config.role}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 6: Create `src/components/blocks/CtaBlock.tsx`**

```tsx
import type { CtaConfig } from "@/domain/schemas/paginaBloque.schema";

export default function CtaBlock({ config }: { config: CtaConfig }) {
  const isExternal = config.linkType === "external";
  const className = config.style === "primary"
    ? "bg-[hsl(20,60%,45%)] text-white hover:bg-[hsl(20,60%,40%)]"
    : "bg-white text-[hsl(20,60%,45%)] border border-[hsl(20,60%,45%)] hover:bg-[hsl(20,60%,96%)]";

  return (
    <section className="max-w-3xl mx-auto px-6 py-14 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">{config.title}</h2>
      <a
        href={config.linkHref}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={`inline-block px-8 py-3 rounded-md font-semibold transition-colors ${className}`}
      >
        {config.buttonText}
      </a>
    </section>
  );
}
```

- [ ] **Step 7: Create `src/components/blocks/SpacerBlock.tsx`**

```tsx
import type { SpacerConfig } from "@/domain/schemas/paginaBloque.schema";

const SIZES = { sm: "h-8", md: "h-16", lg: "h-32" } as const;

export default function SpacerBlock({ config }: { config: SpacerConfig }) {
  return <div className={SIZES[config.size]} />;
}
```

- [ ] **Step 8: Create `src/components/blocks/VideoBlock.tsx`**

```tsx
import type { VideoConfig } from "@/domain/schemas/paginaBloque.schema";

function toEmbedUrl(url: string): string {
  // YouTube watch → embed
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

export default function VideoBlock({ config }: { config: VideoConfig }) {
  const src = toEmbedUrl(config.url);
  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={src}
          title={config.caption ?? "Video"}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {config.caption && <p className="text-center text-sm text-[hsl(0,0%,45%)] mt-3">{config.caption}</p>}
    </section>
  );
}
```

- [ ] **Step 9: Create `src/components/PaginaRenderer.tsx`**

```tsx
import type { IPaginaBloque } from "@/domain/types/pagina";
import { parseBlockConfig } from "@/domain/schemas/paginaBloque.schema";
import HeroBlock from "@/components/blocks/HeroBlock";
import TextBlock from "@/components/blocks/TextBlock";
import TextImageBlock from "@/components/blocks/TextImageBlock";
import GalleryBlock from "@/components/blocks/GalleryBlock";
import QuoteBlock from "@/components/blocks/QuoteBlock";
import CtaBlock from "@/components/blocks/CtaBlock";
import SpacerBlock from "@/components/blocks/SpacerBlock";
import VideoBlock from "@/components/blocks/VideoBlock";

export default function PaginaRenderer({ blocks }: { blocks: IPaginaBloque[] }) {
  return (
    <>
      {blocks.map((b) => {
        if (!b.visible) return null;
        const raw = safeJSON(b.config);
        const parsed = parseBlockConfig(b.type, raw);
        if (!parsed.success) {
          // Don't break the page on bad config — silently skip
          return null;
        }
        const cfg = parsed.data as never;
        switch (b.type) {
          case "HERO":       return <HeroBlock key={b.id} config={cfg} />;
          case "TEXT":       return <TextBlock key={b.id} config={cfg} />;
          case "TEXT_IMAGE": return <TextImageBlock key={b.id} config={cfg} />;
          case "GALLERY":    return <GalleryBlock key={b.id} config={cfg} />;
          case "QUOTE":      return <QuoteBlock key={b.id} config={cfg} />;
          case "CTA":        return <CtaBlock key={b.id} config={cfg} />;
          case "SPACER":     return <SpacerBlock key={b.id} config={cfg} />;
          case "VIDEO":      return <VideoBlock key={b.id} config={cfg} />;
          default:           return null;
        }
      })}
    </>
  );
}

function safeJSON(s: string): unknown {
  try { return JSON.parse(s); } catch { return null; }
}
```

- [ ] **Step 10: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/" | head
git add src/components/blocks src/components/PaginaRenderer.tsx
git commit -m "feat(public): add 8 block components and PaginaRenderer"
```

---

## Task 8: Public route `/p/[slug]`

**Files:**
- Create: `src/pages/p/[slug].tsx`

- [ ] **Step 1: Create the page**

```tsx
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { paginaRepository } from "@/repositories/pagina.repository";
import type { IPagina } from "@/domain/types/pagina";
import PaginaRenderer from "@/components/PaginaRenderer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { navItemRepository } from "@/repositories/navItem.repository";
import { siteConfigRepository } from "@/repositories/siteConfig.repository";
import { footerRepository } from "@/repositories/footer.repository";
import { contactRepository } from "@/repositories/contact.repository";
import { seoRepository } from "@/repositories/seo.repository";
import type { INavItem } from "@/domain/types/navItem";
import type { IFooterContent } from "@/domain/types/footer";
import type { IContactInfo } from "@/domain/types/contact";
import type { ISeoSettings } from "@/domain/types/seo";

interface Props {
  pagina: IPagina;
  navItems: INavItem[];
  footer: IFooterContent;
  contact: IContactInfo;
  siteName: string;
  defaultSeo: ISeoSettings;
}

export default function CustomPage({ pagina, navItems, footer, contact, siteName, defaultSeo }: Props) {
  const title = pagina.seoTitle ?? `${pagina.title} | ${siteName}`;
  const description = pagina.seoDescription ?? defaultSeo.description ?? "";
  const ogImage = pagina.ogImage ?? defaultSeo.ogImage ?? undefined;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {ogImage && <meta property="og:image" content={ogImage} />}
      </Head>
      <Header navItems={navItems} />
      <main>
        <PaginaRenderer blocks={pagina.bloques ?? []} />
      </main>
      <Footer footer={footer} contact={contact} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug ?? "");
  const pagina = await paginaRepository.findPublishedBySlug(slug);
  if (!pagina) return { notFound: true };

  const [navItems, siteConfig, footer, contact, defaultSeo] = await Promise.all([
    navItemRepository.findAll(),
    siteConfigRepository.get(),
    footerRepository.get(),
    contactRepository.get(),
    seoRepository.get(),
  ]);

  return {
    props: {
      pagina: JSON.parse(JSON.stringify(pagina)),
      navItems,
      footer,
      contact,
      siteName: siteConfig?.siteName ?? "Comercializadora Rivera",
      defaultSeo,
    },
  };
};
```

Note: the exact API signatures of `Header` / `Footer` / the repositories used here may differ slightly in this codebase. Before committing, check the shape of props each takes (e.g. open `src/pages/proyectos/[slug].tsx` to see what that page passes to Header/Footer) and adjust this imports/props to match. Keep behavior identical to another existing detail page to avoid layout regressions.

- [ ] **Step 2: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/" | head
git add src/pages/p/
git commit -m "feat(public): /p/[slug] renders published custom pages with SEO"
```

---

## Task 9: Admin — pages list at `/admin/paginas`

**Files:**
- Create: `src/pages/admin/paginas/index.tsx`

Pattern: mirror `src/pages/admin/proyectos.tsx` list-level structure, simpler because fewer fields.

- [ ] **Step 1: Create the list page**

```tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth, useToast, SaveButton } from "@/components/admin/adminUtils";
import type { IPagina } from "@/domain/types/pagina";

export default function PaginasListPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const router = useRouter();
  const [pages, setPages] = useState<IPagina[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (checking) return;
    fetch("/api/content/paginas")
      .then((r) => r.json())
      .then(setPages)
      .catch(() => show("Error al cargar páginas"))
      .finally(() => setLoading(false));
  }, [checking, show]);

  function slugify(s: string): string {
    return s.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-");
  }

  async function createPage() {
    if (!newTitle.trim() || !newSlug.trim()) return show("Título y slug son obligatorios");
    setSaving(true);
    const res = await fetch("/api/content/paginas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, slug: newSlug, published: false }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      return show(error ?? "Error al crear");
    }
    const created = await res.json();
    router.push(`/admin/paginas/${created.id}`);
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar esta página? Esta acción no se puede deshacer.")) return;
    const res = await fetch(`/api/content/paginas/${id}`, { method: "DELETE" });
    if (!res.ok) return show("Error al eliminar");
    setPages(pages.filter((p) => p.id !== id));
    show("Página eliminada");
  }

  if (checking || loading) return <AdminLayout><p className="p-6">Cargando…</p></AdminLayout>;

  return (
    <AdminLayout>
      {ToastComponent}
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Páginas</h1>
        </header>

        <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Nueva página</h2>
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="px-4 py-2 bg-[hsl(20,60%,45%)] text-white rounded hover:bg-[hsl(20,60%,40%)]"
            >
              + Nueva página
            </button>
          ) : (
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
              <label className="text-sm">
                <span className="block mb-1">Título</span>
                <input
                  value={newTitle}
                  onChange={(e) => { setNewTitle(e.target.value); setNewSlug(slugify(e.target.value)); }}
                  className="w-full px-3 py-2 border rounded"
                />
              </label>
              <label className="text-sm">
                <span className="block mb-1">Slug (URL)</span>
                <input
                  value={newSlug}
                  onChange={(e) => setNewSlug(slugify(e.target.value))}
                  className="w-full px-3 py-2 border rounded font-mono text-xs"
                  placeholder="nosotros"
                />
                <span className="text-xs text-gray-500 block mt-1">/p/{newSlug || "…"}</span>
              </label>
              <SaveButton saving={saving} onClick={createPage} label="Crear" />
            </div>
          )}
        </div>

        <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg divide-y">
          {pages.length === 0 && (
            <p className="p-6 text-center text-gray-500">No hay páginas aún. Crea la primera arriba.</p>
          )}
          {pages.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.published ? "Publicada" : "Borrador"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono">/p/{p.slug}</div>
              </div>
              <div className="flex gap-2 text-sm">
                {p.published && (
                  <a href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 border rounded hover:bg-gray-50">
                    Ver
                  </a>
                )}
                <Link href={`/admin/paginas/${p.id}`} className="px-3 py-1 bg-[hsl(20,60%,45%)] text-white rounded hover:bg-[hsl(20,60%,40%)]">
                  Editar
                </Link>
                <button onClick={() => remove(p.id)} className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
```

- [ ] **Step 2: Add link to sidebar + dashboard**

Edit `src/components/admin/AdminLayout.tsx`: add a nav item `{ href: "/admin/paginas", label: "Páginas" }` under the `Contenido` group (place it after the Categorías / Subcategorías / Productos set, before `Proyectos`).

Edit `src/pages/admin/index.tsx`: add a matching card linking to `/admin/paginas` under the Contenido group.

- [ ] **Step 3: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/" | head
git add src/pages/admin/paginas/index.tsx src/components/admin/AdminLayout.tsx src/pages/admin/index.tsx
git commit -m "feat(admin): /admin/paginas list page + sidebar/dashboard entries"
```

---

## Task 10: Admin — page editor at `/admin/paginas/[id]`

**Files:**
- Create: `src/pages/admin/paginas/[id].tsx`
- Create: `src/components/admin/BlockEditor.tsx` (renders form for selected block type)

This is the biggest UI task. Keep the two files tightly focused: `[id].tsx` owns page-level state (fields + list of blocks), `BlockEditor.tsx` owns the form for a single block.

- [ ] **Step 1: Create `src/components/admin/BlockEditor.tsx`**

The editor accepts a block (type + config object) and calls `onChange` with the updated config. Uses `WysiwygEditor` for rich text fields. Uses `LinkPicker` for CTA block. Delegates media URL entry to plain inputs (you can wire the existing media picker later if needed).

```tsx
"use client";
import { useState } from "react";
import WysiwygEditor from "@/components/admin/WysiwygEditor";
import LinkPicker, { deserializeLinkValue, serializeLinkValue, type LinkValue } from "@/components/admin/LinkPicker";
import type { BlockType } from "@/domain/schemas/paginaBloque.schema";

interface Props {
  type: BlockType;
  config: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}

export default function BlockEditor({ type, config, onChange }: Props) {
  function set<K extends string>(key: K, value: unknown) {
    onChange({ ...config, [key]: value });
  }

  switch (type) {
    case "HERO":
      return (
        <div className="space-y-3">
          <LabeledInput label="URL de imagen" value={str(config.imageUrl)} onChange={(v) => set("imageUrl", v)} />
          <LabeledInput label="Título" value={str(config.title)} onChange={(v) => set("title", v)} />
          <LabeledInput label="Subtítulo (opcional)" value={str(config.subtitle)} onChange={(v) => set("subtitle", v)} />
          <Select label="Altura" value={str(config.height) || "md"} options={["sm", "md", "lg"]} onChange={(v) => set("height", v)} />
        </div>
      );

    case "TEXT":
      return (
        <div className="space-y-2">
          <span className="text-sm font-medium">Contenido</span>
          <WysiwygEditor value={str(config.html)} onChange={(html) => set("html", html)} />
        </div>
      );

    case "TEXT_IMAGE":
      return (
        <div className="space-y-3">
          <LabeledInput label="URL de imagen" value={str(config.imageUrl)} onChange={(v) => set("imageUrl", v)} />
          <Select label="Lado de la imagen" value={str(config.imageSide) || "left"} options={["left", "right"]} onChange={(v) => set("imageSide", v)} />
          <LabeledInput label="Título (opcional)" value={str(config.title)} onChange={(v) => set("title", v)} />
          <div>
            <span className="text-sm font-medium">Contenido</span>
            <WysiwygEditor value={str(config.html)} onChange={(html) => set("html", html)} />
          </div>
        </div>
      );

    case "GALLERY": {
      const images = Array.isArray(config.images) ? (config.images as string[]) : [];
      return (
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium block mb-1">URLs de imágenes (una por línea)</span>
            <textarea
              value={images.join("\n")}
              onChange={(e) => set("images", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
              rows={6}
              className="w-full px-3 py-2 border rounded font-mono text-xs"
            />
          </div>
          <Select
            label="Columnas"
            value={String(config.columns ?? 3)}
            options={["2", "3", "4"]}
            onChange={(v) => set("columns", Number(v))}
          />
        </div>
      );
    }

    case "QUOTE":
      return (
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium block mb-1">Cita</span>
            <textarea
              value={str(config.text)}
              onChange={(e) => set("text", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <LabeledInput label="Autor (opcional)" value={str(config.author)} onChange={(v) => set("author", v)} />
          <LabeledInput label="Cargo (opcional)" value={str(config.role)} onChange={(v) => set("role", v)} />
        </div>
      );

    case "CTA": {
      const link: LinkValue = config.linkType === "external"
        ? { type: "external", href: str(config.linkHref) }
        : { type: "internal", href: str(config.linkHref) };
      return (
        <div className="space-y-3">
          <LabeledInput label="Título" value={str(config.title)} onChange={(v) => set("title", v)} />
          <LabeledInput label="Texto del botón" value={str(config.buttonText)} onChange={(v) => set("buttonText", v)} />
          <Select label="Estilo" value={str(config.style) || "primary"} options={["primary", "secondary"]} onChange={(v) => set("style", v)} />
          <div>
            <span className="text-sm font-medium block mb-1">Enlace</span>
            <LinkPicker
              allowNone={false}
              value={link}
              onChange={(v) => {
                const { linkType, linkHref } = serializeLinkValue(v);
                onChange({ ...config, linkType, linkHref: linkHref ?? "" });
              }}
            />
          </div>
        </div>
      );
    }

    case "SPACER":
      return (
        <Select
          label="Tamaño"
          value={str(config.size) || "md"}
          options={["sm", "md", "lg"]}
          onChange={(v) => set("size", v)}
        />
      );

    case "VIDEO":
      return (
        <div className="space-y-3">
          <LabeledInput label="URL (YouTube o Vimeo)" value={str(config.url)} onChange={(v) => set("url", v)} />
          <LabeledInput label="Caption (opcional)" value={str(config.caption)} onChange={(v) => set("caption", v)} />
        </div>
      );
  }
}

function str(v: unknown): string { return typeof v === "string" ? v : ""; }

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-sm block">
      <span className="block mb-1">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded" />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="text-sm block">
      <span className="block mb-1">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded bg-white">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

// Unused import kept here intentionally: deserializeLinkValue is available for future block types
void deserializeLinkValue;
```

- [ ] **Step 2: Create `src/pages/admin/paginas/[id].tsx`**

```tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import BlockEditor from "@/components/admin/BlockEditor";
import { useAdminAuth, useToast, SaveButton } from "@/components/admin/adminUtils";
import type { IPagina, IPaginaBloque } from "@/domain/types/pagina";
import { BLOCK_TYPES, type BlockType } from "@/domain/schemas/paginaBloque.schema";

const BLOCK_LABELS: Record<BlockType, string> = {
  HERO: "Hero (imagen + título)",
  TEXT: "Texto",
  TEXT_IMAGE: "Texto + imagen",
  GALLERY: "Galería",
  QUOTE: "Cita",
  CTA: "Llamada a la acción",
  SPACER: "Separador",
  VIDEO: "Video",
};

function defaultConfigFor(type: BlockType): Record<string, unknown> {
  switch (type) {
    case "HERO":       return { imageUrl: "", title: "", subtitle: "", height: "md" };
    case "TEXT":       return { html: "<p></p>" };
    case "TEXT_IMAGE": return { imageUrl: "", imageSide: "left", title: "", html: "<p></p>" };
    case "GALLERY":    return { images: [], columns: 3 };
    case "QUOTE":      return { text: "" };
    case "CTA":        return { title: "", buttonText: "", linkType: "internal", linkHref: "", style: "primary" };
    case "SPACER":     return { size: "md" };
    case "VIDEO":      return { url: "", caption: "" };
  }
}

interface BlockState {
  localId: string;  // client-side ID for React keys (distinct from DB id until saved)
  type: BlockType;
  config: Record<string, unknown>;
  visible: boolean;
}

export default function PaginaEditor() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const router = useRouter();
  const id = Number(router.query.id);

  const [page, setPage] = useState<IPagina | null>(null);
  const [blocks, setBlocks] = useState<BlockState[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (checking || !Number.isFinite(id)) return;
    fetch(`/api/content/paginas/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p: IPagina | null) => {
        if (!p) return;
        setPage(p);
        setBlocks((p.bloques ?? []).map(bloqueToState));
      })
      .catch(() => show("Error al cargar la página"));
  }, [checking, id, show]);

  function bloqueToState(b: IPaginaBloque): BlockState {
    return {
      localId: `db-${b.id}`,
      type: b.type,
      config: safeJSON(b.config) as Record<string, unknown>,
      visible: b.visible,
    };
  }

  function addBlock(type: BlockType) {
    const localId = `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setBlocks((prev) => [...prev, { localId, type, config: defaultConfigFor(type), visible: true }]);
    setExpandedId(localId);
  }

  function move(localId: string, delta: -1 | 1) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.localId === localId);
      if (i < 0) return prev;
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function remove(localId: string) {
    setBlocks((prev) => prev.filter((b) => b.localId !== localId));
  }

  function toggleVisible(localId: string) {
    setBlocks((prev) => prev.map((b) => b.localId === localId ? { ...b, visible: !b.visible } : b));
  }

  function patchConfig(localId: string, next: Record<string, unknown>) {
    setBlocks((prev) => prev.map((b) => b.localId === localId ? { ...b, config: next } : b));
  }

  function patchPage<K extends keyof IPagina>(key: K, value: IPagina[K]) {
    if (!page) return;
    setPage({ ...page, [key]: value });
  }

  async function saveAll() {
    if (!page) return;
    setSaving(true);
    try {
      const metaRes = await fetch(`/api/content/paginas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          published: page.published,
          seoTitle: page.seoTitle ?? null,
          seoDescription: page.seoDescription ?? null,
          ogImage: page.ogImage ?? null,
        }),
      });
      if (!metaRes.ok) {
        const { error } = await metaRes.json().catch(() => ({ error: "Error al guardar" }));
        throw new Error(error ?? "Error al guardar");
      }

      const bloquesRes = await fetch(`/api/content/paginas/${id}/bloques`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blocks.map((b) => ({
          type: b.type,
          config: b.config,
          visible: b.visible,
        }))),
      });
      if (!bloquesRes.ok) {
        const { error } = await bloquesRes.json().catch(() => ({ error: "Error al guardar bloques" }));
        throw new Error(error ?? "Error al guardar bloques");
      }

      show("Guardado correctamente");
    } catch (e) {
      show(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const blockTypeOptions = useMemo(() => BLOCK_TYPES.map((t) => ({ type: t, label: BLOCK_LABELS[t] })), []);

  if (checking || !page) return <AdminLayout><p className="p-6">Cargando…</p></AdminLayout>;

  return (
    <AdminLayout>
      {ToastComponent}
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Editar página</h1>
          <div className="flex gap-2">
            {page.published && (
              <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 border rounded hover:bg-gray-50 text-sm">
                Ver publicada
              </a>
            )}
            <SaveButton saving={saving} onClick={saveAll} label="Guardar todo" />
          </div>
        </header>

        {/* Basic fields */}
        <details className="bg-white border rounded-lg p-4" open>
          <summary className="font-semibold cursor-pointer">Información básica</summary>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <label className="text-sm">
              <span className="block mb-1">Título</span>
              <input value={page.title} onChange={(e) => patchPage("title", e.target.value)} className="w-full px-3 py-2 border rounded" />
            </label>
            <label className="text-sm">
              <span className="block mb-1">Slug</span>
              <input value={page.slug} onChange={(e) => patchPage("slug", e.target.value)} className="w-full px-3 py-2 border rounded font-mono text-xs" />
              <span className="text-xs text-gray-500 block mt-1">/p/{page.slug}</span>
            </label>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={page.published} onChange={(e) => patchPage("published", e.target.checked)} />
              <span>Publicada (visible al público)</span>
            </label>
          </div>
          <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block mb-1">SEO: título</span>
              <input value={page.seoTitle ?? ""} onChange={(e) => patchPage("seoTitle", e.target.value || null)} className="w-full px-3 py-2 border rounded" />
            </label>
            <label className="text-sm">
              <span className="block mb-1">SEO: og:image (URL)</span>
              <input value={page.ogImage ?? ""} onChange={(e) => patchPage("ogImage", e.target.value || null)} className="w-full px-3 py-2 border rounded" />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="block mb-1">SEO: descripción</span>
              <textarea value={page.seoDescription ?? ""} onChange={(e) => patchPage("seoDescription", e.target.value || null)} rows={2} className="w-full px-3 py-2 border rounded" />
            </label>
          </div>
        </details>

        {/* Blocks list */}
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Bloques ({blocks.length})</h2>
          </div>

          {blocks.length === 0 && (
            <p className="text-center text-gray-500 py-6">No hay bloques. Agrega el primero abajo.</p>
          )}

          {blocks.map((b, idx) => (
            <div key={b.localId} className={`border rounded-lg ${b.visible ? "" : "opacity-60"}`}>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-t-lg">
                <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded">{idx + 1}</span>
                <span className="font-medium">{BLOCK_LABELS[b.type]}</span>
                <div className="ml-auto flex gap-1">
                  <button onClick={() => move(b.localId, -1)} disabled={idx === 0} className="px-2 py-1 text-xs border rounded disabled:opacity-40">↑</button>
                  <button onClick={() => move(b.localId, 1)} disabled={idx === blocks.length - 1} className="px-2 py-1 text-xs border rounded disabled:opacity-40">↓</button>
                  <button onClick={() => toggleVisible(b.localId)} className="px-2 py-1 text-xs border rounded">{b.visible ? "Ocultar" : "Mostrar"}</button>
                  <button onClick={() => setExpandedId(expandedId === b.localId ? null : b.localId)} className="px-2 py-1 text-xs border rounded">
                    {expandedId === b.localId ? "Cerrar" : "Editar"}
                  </button>
                  <button onClick={() => remove(b.localId)} className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded">Eliminar</button>
                </div>
              </div>
              {expandedId === b.localId && (
                <div className="p-3 border-t">
                  <BlockEditor type={b.type} config={b.config} onChange={(next) => patchConfig(b.localId, next)} />
                </div>
              )}
            </div>
          ))}

          <div className="pt-3 border-t">
            <span className="text-sm font-medium block mb-2">Agregar bloque:</span>
            <div className="flex flex-wrap gap-2">
              {blockTypeOptions.map((o) => (
                <button key={o.type} onClick={() => addBlock(o.type)} className="px-3 py-1 text-sm border rounded hover:bg-[hsl(20,60%,96%)]">
                  + {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function safeJSON(s: string): unknown {
  try { return JSON.parse(s); } catch { return {}; }
}
```

- [ ] **Step 3: Manual smoke test (document in PR/checkpoint, not executable here)**

Expected flow once migration is applied in a real DB:
1. `/admin/paginas` loads, shows empty list.
2. Create "Nosotros" → slug "nosotros" → lands on `/admin/paginas/[id]`.
3. Add HERO, TEXT, GALLERY, CTA, set visibility, reorder with ↑/↓, click Guardar todo.
4. Toggle publicada, save.
5. Visit `/p/nosotros` → see the rendered page.
6. Go to `/admin/paginas`, hit Eliminar → row disappears; `/p/nosotros` now 404.

- [ ] **Step 4: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/" | head
git add src/pages/admin/paginas/[id].tsx src/components/admin/BlockEditor.tsx
git commit -m "feat(admin): page editor with 8 block types, reorder, show/hide, Save all"
```

---

## Task 11: Service link field — backend + admin + frontend wiring

**Files:**
- Modify: `src/domain/schemas/service.schema.ts`
- Modify: `src/domain/types/service.ts`
- Modify: `src/pages/admin/services.tsx`
- Modify: `src/components/home/ServicesSection.tsx` (path may vary — locate the component that renders Services on home)

- [ ] **Step 1: Extend `ServiceSchema` with linkType + linkHref**

Replace the contents of `src/domain/schemas/service.schema.ts`:

```ts
import { z } from "zod";

export const ServiceSchema = z.object({
  icon:     z.string().min(1).max(100),
  title:    z.string().min(1).max(200),
  subtitle: z.string().max(300),
  desc:     z.string().max(2000),
  order:    z.number().int().min(0),
  linkType: z.enum(["none", "internal", "external"]).default("none"),
  linkHref: z.string().max(500).optional().nullable(),
}).refine(
  (s) => s.linkType === "none" || (s.linkHref != null && s.linkHref.length > 0),
  { message: "linkHref es obligatorio cuando linkType no es 'none'", path: ["linkHref"] },
);

export const ServicesListSchema = z.array(ServiceSchema);

export type ServiceInput = z.infer<typeof ServiceSchema>;
```

- [ ] **Step 2: Extend `IService` type**

Replace `src/domain/types/service.ts`:

```ts
export interface IService {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  desc: string;
  order: number;
  linkType: "none" | "internal" | "external" | string;
  linkHref: string | null;
}
```

- [ ] **Step 3: Update `/admin/services` to include LinkPicker per service**

Open `src/pages/admin/services.tsx` and:

- Import `LinkPicker`, `serializeLinkValue`, `deserializeLinkValue` from `@/components/admin/LinkPicker`.
- For each service row being edited, render the LinkPicker using the service's `linkType` / `linkHref` (via `deserializeLinkValue`) and update the service state on change (via `serializeLinkValue`).

Do **not** rewrite the file. Locate the JSX where the existing fields (title, subtitle, desc) are edited and add a new section labeled "Acción al dar click" containing the `<LinkPicker>` underneath them. When saving, pass `linkType` and `linkHref` through untouched — the PUT endpoint already accepts them via the updated schema.

If the existing file maintains services in a state array like `services.map((s, i) => ...)`, the setter pattern to follow is:

```tsx
<LinkPicker
  value={deserializeLinkValue(s.linkType ?? "none", s.linkHref ?? null)}
  onChange={(v) => {
    const { linkType, linkHref } = serializeLinkValue(v);
    setServices(prev => prev.map((x, j) => j === i ? { ...x, linkType, linkHref } : x));
  }}
/>
```

- [ ] **Step 4: Update public ServicesSection to use the link**

Find the component that renders service cards on the home. Likely `src/components/home/ServicesSection.tsx` or similar (check `PageBuilder.tsx` for the `VENTAS` case — that's the one). For each service, wrap the card in an anchor when `linkType !== "none"`:

```tsx
const card = (
  <div className="…existing card markup…">…</div>
);

return service.linkType === "none" || !service.linkHref
  ? card
  : (
    <a
      href={service.linkHref}
      target={service.linkType === "external" ? "_blank" : undefined}
      rel={service.linkType === "external" ? "noopener noreferrer" : undefined}
      className="block"
    >
      {card}
    </a>
  );
```

Do not change the card's visual styling — only add the wrapping anchor. This keeps the feature additive.

- [ ] **Step 5: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/" | head
git add src/domain/schemas/service.schema.ts src/domain/types/service.ts src/pages/admin/services.tsx src/components/
git commit -m "feat(services): link field — admin LinkPicker + public anchor wrapper"
```

---

## Task 12: Final verification

- [ ] **Step 1: TypeScript full check**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "\.next/"
```
Expected: no output.

- [ ] **Step 2: Run Jest suite**

```bash
npx jest 2>&1 | tail -20
```
Expected: all tests pass, including the 10 new block schema tests.

- [ ] **Step 3: Run ESLint**

```bash
npx eslint src --max-warnings 0 2>&1 | tail -40
```
Expected: no errors. Fix any lints introduced by the new files.

- [ ] **Step 4: Push**

```bash
git push origin main
```

- [ ] **Step 5: Update the session plan.md with a brief summary of what shipped**

Open `/Users/rubenely/.copilot/session-state/9bdb702d-6f99-47d9-8ad6-2efb8617c010/plan.md` and note the feature is done: models, admin list, admin editor, public `/p/[slug]`, Service link field.

---

## Out-of-scope items (intentionally not in this plan)

- Drag-and-drop reorder with a library — using simple ↑/↓ buttons is enough for 1-20 blocks.
- Real-time preview next to the editor.
- Undo / redo.
- Duplicate block or page.
- Autosave.
- Media picker integration for block images (URL input is enough for now).
- Search / filter on the page list.
- Custom per-page navigation visibility.

These can each be added later as small, focused changes.
