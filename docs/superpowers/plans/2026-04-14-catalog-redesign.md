# Catálogo Rediseño — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el sistema confuso de Material/MaterialCollection/MaterialFinish por un catálogo limpio de 3 niveles (Categoria → Subcategoria → Producto) con admin intuitivo, páginas públicas SSR y WhatsApp contextual.

**Architecture:** Nuevo schema Prisma con 4 modelos limpios. APIs en `/api/catalog/*`. Admin en 3 páginas independientes. Páginas públicas SSR en rutas anidadas `/[catSlug]`, `/[catSlug]/[subSlug]`, `/producto/[slug]`. WYSIWYG con TipTap v2 almacenado como HTML. El WhatsApp FAB global ya existe — solo se actualiza el contexto.

**Tech Stack:** Next.js 16 Pages Router · TypeScript · Prisma 7 (`@prisma/adapter-pg`) · PostgreSQL · Tailwind CSS v4 · Framer Motion v12 (`import * as motion from "motion/react-client"`) · TipTap v2 (nuevo) · `getServerSideProps` en todas las páginas públicas nuevas

---

## Estructura de Archivos

### Crear
- `prisma/migrations/20260415000001_catalog_redesign/migration.sql`
- `src/domain/types/catalog-new.ts` — ICategoria, ISubcategoria, IProducto, IProductoImagen
- `src/domain/schemas/categoria.schema.ts`
- `src/domain/schemas/subcategoria.schema.ts`
- `src/domain/schemas/producto.schema.ts`
- `src/repositories/categoria.repository.ts`
- `src/repositories/subcategoria.repository.ts`
- `src/repositories/producto.repository.ts`
- `src/pages/api/catalog/categorias.ts`
- `src/pages/api/catalog/subcategorias.ts`
- `src/pages/api/catalog/productos.ts`
- `src/pages/api/catalog/imagenes.ts`
- `src/components/admin/WysiwygEditor.tsx`
- `src/pages/admin/categorias.tsx`
- `src/pages/admin/subcategorias.tsx`
- `src/pages/admin/productos/index.tsx`
- `src/pages/admin/productos/[id].tsx`
- `src/pages/[categoriaSlug].tsx` (reemplaza `[slug].tsx`)
- `src/pages/[categoriaSlug]/[subcategoriaSlug].tsx`
- `src/pages/producto/[slug].tsx`

### Modificar
- `prisma/schema.prisma` — nuevos modelos, eliminar viejos
- `src/domain/types/index.ts` — exportar nuevos tipos, eliminar viejos
- `src/hooks/useWhatsApp.ts` — agregar campos `producto`, `subcategoria`, `categoria`
- `src/components/admin/AdminLayout.tsx` — actualizar nav links
- `src/pages/_app.tsx` — eliminar `isGallery` obsoleto

### Eliminar (al final)
- `src/pages/[slug].tsx`
- `src/domain/types/category.ts`, `material.ts`
- `src/domain/schemas/category.schema.ts`, `finish.schema.ts`
- `src/repositories/category.repository.ts`, `material.repository.ts`, `finish.repository.ts`
- `src/pages/api/content/categories.ts`, `materials.ts`, `finishes.ts`, `collections.ts`
- `src/pages/admin/categories.tsx`, `materials.tsx`, `materials/[id].tsx`, `collections.tsx`, `productos.tsx`

---

## Task 1: Instalar TipTap

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar dependencias TipTap**

```bash
cd /ruta/al/proyecto
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-placeholder
```

Esperar a que termine (puede tardar ~20s).

- [ ] **Step 2: Verificar que se instalaron**

```bash
node -e "require('@tiptap/react'); console.log('ok')"
```

Esperado: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: install TipTap v2 for WYSIWYG editor"
```

---

## Task 2: Schema Prisma + Migración

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260415000001_catalog_redesign/migration.sql`

- [ ] **Step 1: Actualizar `prisma/schema.prisma`**

Reemplazar los modelos `Category`, `Material`, `MaterialCollection`, `MaterialFinish`, `MaterialFinishImage` con los nuevos. El archivo schema.prisma completo de los modelos del catálogo debe quedar así (conservar todos los otros modelos intactos: NavItem, PageSection, Service, SpaceProject, SpaceCategory, SpaceProjectImage, SiteConfig, Media):

```prisma
model Categoria {
  id            Int            @id @default(autoincrement())
  name          String
  slug          String         @unique
  coverImage    String?
  description   String?
  order         Int            @default(0)
  subcategorias Subcategoria[]
}

model Subcategoria {
  id          Int        @id @default(autoincrement())
  categoriaId Int
  categoria   Categoria  @relation(fields: [categoriaId], references: [id], onDelete: Cascade)
  name        String
  slug        String     @unique
  coverImage  String?
  description String?
  order       Int        @default(0)
  productos   Producto[]

  @@index([categoriaId])
}

model Producto {
  id             Int              @id @default(autoincrement())
  subcategoriaId Int
  subcategoria   Subcategoria     @relation(fields: [subcategoriaId], references: [id], onDelete: Cascade)
  name           String
  slug           String           @unique
  coverImage     String?
  hoverImage     String?
  shortDesc      String?
  htmlContent    String?          @db.Text
  order          Int              @default(0)
  imagenes       ProductoImagen[]

  @@index([subcategoriaId])
}

model ProductoImagen {
  id         Int      @id @default(autoincrement())
  productoId Int
  producto   Producto @relation(fields: [productoId], references: [id], onDelete: Cascade)
  url        String
  caption    String?
  order      Int      @default(0)

  @@index([productoId])
}
```

Eliminar del schema los bloques `model Category`, `model Material`, `model MaterialCollection`, `model MaterialFinish`, `model MaterialFinishImage`.

- [ ] **Step 2: Crear el SQL de migración**

Crear el archivo `prisma/migrations/20260415000001_catalog_redesign/migration.sql`:

```sql
-- Drop old tables (order: child first)
DROP TABLE IF EXISTS "MaterialFinishImage";
DROP TABLE IF EXISTS "MaterialFinish";
DROP TABLE IF EXISTS "MaterialCollection";
DROP TABLE IF EXISTS "Material";
DROP TABLE IF EXISTS "Category";

-- Create Categoria
CREATE TABLE "Categoria" (
  "id"          SERIAL PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "coverImage"  TEXT,
  "description" TEXT,
  "order"       INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

-- Create Subcategoria
CREATE TABLE "Subcategoria" (
  "id"          SERIAL PRIMARY KEY,
  "categoriaId" INTEGER NOT NULL,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "coverImage"  TEXT,
  "description" TEXT,
  "order"       INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Subcategoria_categoriaId_fkey"
    FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Subcategoria_slug_key" ON "Subcategoria"("slug");
CREATE INDEX "Subcategoria_categoriaId_idx" ON "Subcategoria"("categoriaId");

-- Create Producto
CREATE TABLE "Producto" (
  "id"             SERIAL PRIMARY KEY,
  "subcategoriaId" INTEGER NOT NULL,
  "name"           TEXT NOT NULL,
  "slug"           TEXT NOT NULL,
  "coverImage"     TEXT,
  "hoverImage"     TEXT,
  "shortDesc"      TEXT,
  "htmlContent"    TEXT,
  "order"          INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Producto_subcategoriaId_fkey"
    FOREIGN KEY ("subcategoriaId") REFERENCES "Subcategoria"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Producto_slug_key" ON "Producto"("slug");
CREATE INDEX "Producto_subcategoriaId_idx" ON "Producto"("subcategoriaId");

-- Create ProductoImagen
CREATE TABLE "ProductoImagen" (
  "id"         SERIAL PRIMARY KEY,
  "productoId" INTEGER NOT NULL,
  "url"        TEXT NOT NULL,
  "caption"    TEXT,
  "order"      INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductoImagen_productoId_fkey"
    FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE
);
CREATE INDEX "ProductoImagen_productoId_idx" ON "ProductoImagen"("productoId");
```

- [ ] **Step 3: Regenerar el cliente de Prisma**

```bash
npx prisma generate
```

Esperado: `✔ Generated Prisma Client`

- [ ] **Step 4: Verificar TypeScript no tiene errores nuevos**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "admin/materials\|db/client\|material\.repository\|finish\.repository\|category\.repository\|pages/index\.tsx\|pages/\[slug\]" | head -20
```

Esperado: sin output (o solo los errores pre-existentes en archivos viejos que se eliminarán después).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20260415000001_catalog_redesign/
git commit -m "feat(schema): new catalog models Categoria/Subcategoria/Producto/ProductoImagen, drop old Material/* models"
```

---

## Task 3: Tipos de Dominio + Schemas Zod

**Files:**
- Create: `src/domain/types/catalog-new.ts`
- Create: `src/domain/schemas/categoria.schema.ts`
- Create: `src/domain/schemas/subcategoria.schema.ts`
- Create: `src/domain/schemas/producto.schema.ts`
- Modify: `src/domain/types/index.ts`

- [ ] **Step 1: Crear `src/domain/types/catalog-new.ts`**

```typescript
export interface ICategoria {
  id: number
  name: string
  slug: string
  coverImage: string | null
  description: string | null
  order: number
  _count?: { subcategorias: number }
}

export interface ISubcategoria {
  id: number
  categoriaId: number
  name: string
  slug: string
  coverImage: string | null
  description: string | null
  order: number
  categoria?: Pick<ICategoria, "id" | "name" | "slug">
  _count?: { productos: number }
}

export interface IProducto {
  id: number
  subcategoriaId: number
  name: string
  slug: string
  coverImage: string | null
  hoverImage: string | null
  shortDesc: string | null
  htmlContent: string | null
  order: number
  subcategoria?: Pick<ISubcategoria, "id" | "name" | "slug"> & {
    categoria?: Pick<ICategoria, "id" | "name" | "slug">
  }
  imagenes?: IProductoImagen[]
}

export interface IProductoImagen {
  id: number
  productoId: number
  url: string
  caption: string | null
  order: number
}
```

- [ ] **Step 2: Crear `src/domain/schemas/categoria.schema.ts`**

```typescript
import { z } from "zod"

export const CategoriaSchema = z.object({
  name:        z.string().min(1).max(200),
  coverImage:  z.string().max(1000).nullable().default(null),
  description: z.string().max(3000).nullable().default(null),
  order:       z.number().int().min(0).default(0),
})

export type CategoriaInput = z.infer<typeof CategoriaSchema>
```

- [ ] **Step 3: Crear `src/domain/schemas/subcategoria.schema.ts`**

```typescript
import { z } from "zod"

export const SubcategoriaSchema = z.object({
  categoriaId: z.number().int().positive(),
  name:        z.string().min(1).max(200),
  coverImage:  z.string().max(1000).nullable().default(null),
  description: z.string().max(3000).nullable().default(null),
  order:       z.number().int().min(0).default(0),
})

export type SubcategoriaInput = z.infer<typeof SubcategoriaSchema>
```

- [ ] **Step 4: Crear `src/domain/schemas/producto.schema.ts`**

```typescript
import { z } from "zod"

export const ProductoSchema = z.object({
  subcategoriaId: z.number().int().positive(),
  name:           z.string().min(1).max(200),
  coverImage:     z.string().max(1000).nullable().default(null),
  hoverImage:     z.string().max(1000).nullable().default(null),
  shortDesc:      z.string().max(500).nullable().default(null),
  htmlContent:    z.string().nullable().default(null),
  order:          z.number().int().min(0).default(0),
})

export type ProductoInput = z.infer<typeof ProductoSchema>

export const ProductoImagenSchema = z.object({
  productoId: z.number().int().positive(),
  url:        z.string().min(1).max(1000),
  caption:    z.string().max(300).nullable().default(null),
  order:      z.number().int().min(0).default(0),
})

export type ProductoImagenInput = z.infer<typeof ProductoImagenSchema>
```

- [ ] **Step 5: Actualizar `src/domain/types/index.ts`**

Agregar las exportaciones nuevas y eliminar las viejas. El archivo debe quedar:

```typescript
export type { IHeroContent } from "./hero";
export type { IHeroSlide, HeroPageConfig } from "./heroSlide";
export type { IService } from "./service";
export type { INavItem } from "./navItem";
export type { IPageSection } from "./pageSection";
export type { ISpaceProject, ISpaceProjectImage } from "./space";
export type { ISpaceCategory } from "./spaceCategory";
export type { ICatalogContent } from "./catalog";
export type { IContactInfo } from "./contact";
export type { IFooterContent } from "./footer";
export type { ISeoSettings } from "./seo";
export type { IMedia } from "./media";
export type { JwtPayload } from "./auth";
export type { IPageData } from "./page";
// New catalog types
export type { ICategoria, ISubcategoria, IProducto, IProductoImagen } from "./catalog-new";
```

(Eliminar las líneas `IMaterial`, `IMaterialFinish`, `IMaterialCollection`, `IMaterialFinishImage`, `ICategory`)

- [ ] **Step 6: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep "catalog-new\|categoria\.schema\|subcategoria\.schema\|producto\.schema" | head -10
```

Esperado: sin output.

- [ ] **Step 7: Commit**

```bash
git add src/domain/types/catalog-new.ts src/domain/types/index.ts src/domain/schemas/categoria.schema.ts src/domain/schemas/subcategoria.schema.ts src/domain/schemas/producto.schema.ts
git commit -m "feat(domain): add ICategoria/ISubcategoria/IProducto types and Zod schemas"
```

---

## Task 4: Repositories

**Files:**
- Create: `src/repositories/categoria.repository.ts`
- Create: `src/repositories/subcategoria.repository.ts`
- Create: `src/repositories/producto.repository.ts`

- [ ] **Step 1: Crear `src/repositories/categoria.repository.ts`**

```typescript
import { db } from "@/infrastructure/db/client"
import { toSlug } from "@/lib/toSlug"
import type { ICategoria } from "@/domain/types"
import type { CategoriaInput } from "@/domain/schemas/categoria.schema"

export const categoriaRepository = {
  async findAll(): Promise<ICategoria[]> {
    return db.categoria.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { subcategorias: true } } },
    }) as unknown as ICategoria[]
  },

  async findBySlug(slug: string): Promise<ICategoria | null> {
    const row = await db.categoria.findUnique({
      where: { slug },
      include: {
        subcategorias: {
          orderBy: { order: "asc" },
          include: { _count: { select: { productos: true } } },
        },
      },
    })
    return row as unknown as ICategoria | null
  },

  async create(input: CategoriaInput): Promise<ICategoria> {
    return db.categoria.create({
      data: {
        name:        input.name,
        slug:        toSlug(input.name),
        coverImage:  input.coverImage ?? null,
        description: input.description ?? null,
        order:       input.order ?? 0,
      },
    }) as unknown as ICategoria
  },

  async update(id: number, input: Partial<CategoriaInput>): Promise<ICategoria> {
    return db.categoria.update({
      where: { id },
      data: {
        ...(input.name        !== undefined && { name: input.name, slug: toSlug(input.name) }),
        ...(input.coverImage  !== undefined && { coverImage: input.coverImage }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.order       !== undefined && { order: input.order }),
      },
    }) as unknown as ICategoria
  },

  async delete(id: number): Promise<void> {
    await db.categoria.delete({ where: { id } })
  },
}
```

- [ ] **Step 2: Crear `src/repositories/subcategoria.repository.ts`**

```typescript
import { db } from "@/infrastructure/db/client"
import { toSlug } from "@/lib/toSlug"
import type { ISubcategoria } from "@/domain/types"
import type { SubcategoriaInput } from "@/domain/schemas/subcategoria.schema"

export const subcategoriaRepository = {
  async findAll(categoriaId?: number): Promise<ISubcategoria[]> {
    return db.subcategoria.findMany({
      where: categoriaId ? { categoriaId } : undefined,
      orderBy: { order: "asc" },
      include: {
        categoria: { select: { id: true, name: true, slug: true } },
        _count: { select: { productos: true } },
      },
    }) as unknown as ISubcategoria[]
  },

  async findBySlug(slug: string): Promise<ISubcategoria | null> {
    const row = await db.subcategoria.findUnique({
      where: { slug },
      include: {
        categoria: { select: { id: true, name: true, slug: true } },
        productos: {
          orderBy: { order: "asc" },
          select: { id: true, name: true, slug: true, coverImage: true, hoverImage: true, shortDesc: true },
        },
      },
    })
    return row as unknown as ISubcategoria | null
  },

  async create(input: SubcategoriaInput): Promise<ISubcategoria> {
    return db.subcategoria.create({
      data: {
        categoriaId: input.categoriaId,
        name:        input.name,
        slug:        toSlug(input.name),
        coverImage:  input.coverImage ?? null,
        description: input.description ?? null,
        order:       input.order ?? 0,
      },
    }) as unknown as ISubcategoria
  },

  async update(id: number, input: Partial<SubcategoriaInput>): Promise<ISubcategoria> {
    return db.subcategoria.update({
      where: { id },
      data: {
        ...(input.categoriaId !== undefined && { categoriaId: input.categoriaId }),
        ...(input.name        !== undefined && { name: input.name, slug: toSlug(input.name) }),
        ...(input.coverImage  !== undefined && { coverImage: input.coverImage }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.order       !== undefined && { order: input.order }),
      },
    }) as unknown as ISubcategoria
  },

  async delete(id: number): Promise<void> {
    await db.subcategoria.delete({ where: { id } })
  },
}
```

- [ ] **Step 3: Crear `src/repositories/producto.repository.ts`**

```typescript
import { db } from "@/infrastructure/db/client"
import { toSlug } from "@/lib/toSlug"
import type { IProducto, IProductoImagen } from "@/domain/types"
import type { ProductoInput, ProductoImagenInput } from "@/domain/schemas/producto.schema"

const WITH_FULL = {
  subcategoria: {
    select: {
      id: true, name: true, slug: true,
      categoria: { select: { id: true, name: true, slug: true } },
    },
  },
  imagenes: { orderBy: { order: "asc" as const } },
}

export const productoRepository = {
  async findAll(subcategoriaId?: number): Promise<IProducto[]> {
    return db.producto.findMany({
      where: subcategoriaId ? { subcategoriaId } : undefined,
      orderBy: { order: "asc" },
      include: WITH_FULL,
    }) as unknown as IProducto[]
  },

  async findBySlug(slug: string): Promise<IProducto | null> {
    const row = await db.producto.findUnique({
      where: { slug },
      include: WITH_FULL,
    })
    return row as unknown as IProducto | null
  },

  async create(input: ProductoInput): Promise<IProducto> {
    return db.producto.create({
      data: {
        subcategoriaId: input.subcategoriaId,
        name:           input.name,
        slug:           toSlug(input.name),
        coverImage:     input.coverImage ?? null,
        hoverImage:     input.hoverImage ?? null,
        shortDesc:      input.shortDesc ?? null,
        htmlContent:    input.htmlContent ?? null,
        order:          input.order ?? 0,
      },
      include: WITH_FULL,
    }) as unknown as IProducto
  },

  async update(id: number, input: Partial<ProductoInput>): Promise<IProducto> {
    return db.producto.update({
      where: { id },
      data: {
        ...(input.subcategoriaId !== undefined && { subcategoriaId: input.subcategoriaId }),
        ...(input.name           !== undefined && { name: input.name, slug: toSlug(input.name) }),
        ...(input.coverImage     !== undefined && { coverImage: input.coverImage }),
        ...(input.hoverImage     !== undefined && { hoverImage: input.hoverImage }),
        ...(input.shortDesc      !== undefined && { shortDesc: input.shortDesc }),
        ...(input.htmlContent    !== undefined && { htmlContent: input.htmlContent }),
        ...(input.order          !== undefined && { order: input.order }),
      },
      include: WITH_FULL,
    }) as unknown as IProducto
  },

  async delete(id: number): Promise<void> {
    await db.producto.delete({ where: { id } })
  },

  async addImagen(input: ProductoImagenInput): Promise<IProductoImagen> {
    return db.productoImagen.create({ data: input }) as unknown as IProductoImagen
  },

  async deleteImagen(id: number): Promise<void> {
    await db.productoImagen.delete({ where: { id } })
  },

  async reorderImagenes(productoId: number, orderedIds: number[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) =>
        db.productoImagen.update({ where: { id }, data: { order: index } })
      )
    )
  },
}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep "categoria\.repository\|subcategoria\.repository\|producto\.repository" | head -10
```

Esperado: sin output.

- [ ] **Step 5: Commit**

```bash
git add src/repositories/categoria.repository.ts src/repositories/subcategoria.repository.ts src/repositories/producto.repository.ts
git commit -m "feat(repos): add categoriaRepository, subcategoriaRepository, productoRepository"
```

---

## Task 5: API Routes — Catálogo

**Files:**
- Create: `src/pages/api/catalog/categorias.ts`
- Create: `src/pages/api/catalog/subcategorias.ts`
- Create: `src/pages/api/catalog/productos.ts`
- Create: `src/pages/api/catalog/imagenes.ts`

- [ ] **Step 1: Crear `src/pages/api/catalog/categorias.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from "next"
import { CategoriaSchema } from "@/domain/schemas/categoria.schema"
import { categoriaRepository } from "@/repositories/categoria.repository"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling"

/**
 * GET    /api/catalog/categorias        → Lista todas las categorías
 * POST   /api/catalog/categorias        → Crear categoría (auth)
 * PUT    /api/catalog/categorias?id=X   → Actualizar (auth)
 * DELETE /api/catalog/categorias?id=X   → Eliminar (auth)
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await categoriaRepository.findAll()
    return res.status(200).json(data)
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return
    const parsed = CategoriaSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() })
    const data = await categoriaRepository.create(parsed.data)
    return res.status(201).json(data)
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" })
    const parsed = CategoriaSchema.partial().safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() })
    const data = await categoriaRepository.update(id, parsed.data)
    return res.status(200).json(data)
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" })
    await categoriaRepository.delete(id)
    return res.status(204).end()
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"])
  return res.status(405).end()
})
```

- [ ] **Step 2: Crear `src/pages/api/catalog/subcategorias.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from "next"
import { SubcategoriaSchema } from "@/domain/schemas/subcategoria.schema"
import { subcategoriaRepository } from "@/repositories/subcategoria.repository"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling"

/**
 * GET    /api/catalog/subcategorias              → Todas o filtradas por ?categoriaId=X
 * POST   /api/catalog/subcategorias              → Crear (auth)
 * PUT    /api/catalog/subcategorias?id=X         → Actualizar (auth)
 * DELETE /api/catalog/subcategorias?id=X         → Eliminar (auth)
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const categoriaId = req.query.categoriaId ? Number(req.query.categoriaId) : undefined
    const data = await subcategoriaRepository.findAll(categoriaId)
    return res.status(200).json(data)
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return
    const parsed = SubcategoriaSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() })
    const data = await subcategoriaRepository.create(parsed.data)
    return res.status(201).json(data)
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" })
    const parsed = SubcategoriaSchema.partial().safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() })
    const data = await subcategoriaRepository.update(id, parsed.data)
    return res.status(200).json(data)
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" })
    await subcategoriaRepository.delete(id)
    return res.status(204).end()
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"])
  return res.status(405).end()
})
```

- [ ] **Step 3: Crear `src/pages/api/catalog/productos.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from "next"
import { ProductoSchema } from "@/domain/schemas/producto.schema"
import { productoRepository } from "@/repositories/producto.repository"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling"

/**
 * GET    /api/catalog/productos                    → Todos o filtrados por ?subcategoriaId=X
 * POST   /api/catalog/productos                    → Crear (auth)
 * PUT    /api/catalog/productos?id=X               → Actualizar (auth)
 * DELETE /api/catalog/productos?id=X               → Eliminar (auth)
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const subcategoriaId = req.query.subcategoriaId ? Number(req.query.subcategoriaId) : undefined
    const data = await productoRepository.findAll(subcategoriaId)
    return res.status(200).json(data)
  }

  if (req.method === "POST") {
    if (!requireAuth(req, res)) return
    const parsed = ProductoSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() })
    const data = await productoRepository.create(parsed.data)
    return res.status(201).json(data)
  }

  if (req.method === "PUT") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" })
    const parsed = ProductoSchema.partial().safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() })
    const data = await productoRepository.update(id, parsed.data)
    return res.status(200).json(data)
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" })
    await productoRepository.delete(id)
    return res.status(204).end()
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"])
  return res.status(405).end()
})
```

- [ ] **Step 4: Crear `src/pages/api/catalog/imagenes.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from "next"
import { ProductoImagenSchema } from "@/domain/schemas/producto.schema"
import { productoRepository } from "@/repositories/producto.repository"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling"

/**
 * POST   /api/catalog/imagenes           → Agregar imagen a producto (auth)
 * DELETE /api/catalog/imagenes?id=X      → Eliminar imagen (auth)
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    if (!requireAuth(req, res)) return
    const parsed = ProductoImagenSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() })
    const data = await productoRepository.addImagen(parsed.data)
    return res.status(201).json(data)
  }

  if (req.method === "DELETE") {
    if (!requireAuth(req, res)) return
    const id = Number(req.query.id)
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" })
    await productoRepository.deleteImagen(id)
    return res.status(204).end()
  }

  res.setHeader("Allow", ["POST", "DELETE"])
  return res.status(405).end()
})
```

- [ ] **Step 5: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep "api/catalog" | head -10
```

Esperado: sin output.

- [ ] **Step 6: Commit**

```bash
git add src/pages/api/catalog/
git commit -m "feat(api): catalog CRUD routes for categorias, subcategorias, productos, imagenes"
```

---

## Task 6: Componente WYSIWYG (TipTap)

**Files:**
- Create: `src/components/admin/WysiwygEditor.tsx`

- [ ] **Step 1: Crear `src/components/admin/WysiwygEditor.tsx`**

```tsx
"use client";
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect } from "react"

interface WysiwygEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function WysiwygEditor({ value, onChange, placeholder = "Escribe aquí el contenido del producto…" }: WysiwygEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Sync external value changes (e.g. when loading saved content)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value ?? "", false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!editor) return null

  const btn = (active: boolean, onClick: () => void, label: string) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`px-2 py-1 text-xs rounded transition-colors ${
        active
          ? "bg-[hsl(20,60%,45%)] text-white"
          : "bg-transparent text-[hsl(0,0%,30%)] hover:bg-[hsl(0,0%,92%)]"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="border border-[hsl(0,0%,80%)] rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-[hsl(0,0%,96%)] border-b border-[hsl(0,0%,88%)]">
        {btn(editor.isActive("bold"),      () => editor.chain().focus().toggleBold().run(),      "B")}
        {btn(editor.isActive("italic"),    () => editor.chain().focus().toggleItalic().run(),    "I")}
        {btn(editor.isActive("strike"),    () => editor.chain().focus().toggleStrike().run(),    "S")}
        <div className="w-px bg-[hsl(0,0%,80%)] mx-1" />
        {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "H2")}
        {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "H3")}
        <div className="w-px bg-[hsl(0,0%,80%)] mx-1" />
        {btn(editor.isActive("bulletList"),  () => editor.chain().focus().toggleBulletList().run(),  "• Lista")}
        {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "1. Lista")}
        <div className="w-px bg-[hsl(0,0%,80%)] mx-1" />
        {btn(false, () => {
          const url = window.prompt("URL del enlace:")
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }, "Link")}
        {btn(false, () => {
          const url = window.prompt("URL de la imagen:")
          if (url) editor.chain().focus().setImage({ src: url }).run()
        }, "Img")}
      </div>
      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[200px] p-3 bg-white focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[200px] [&_.tiptap_p.is-editor-empty:first-child::before]:text-[hsl(0,0%,65%)] [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep "WysiwygEditor" | head -10
```

Esperado: sin output.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/WysiwygEditor.tsx
git commit -m "feat(admin): add TipTap WYSIWYG editor component"
```

---

## Task 7: Admin — Página Categorías

**Files:**
- Create: `src/pages/admin/categorias.tsx`

- [ ] **Step 1: Crear `src/pages/admin/categorias.tsx`**

```tsx
import { useState, useEffect } from "react"
import Head from "next/head"
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils"
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField"
import { Trash2, Plus } from "lucide-react"
import type { ICategoria } from "@/domain/types"

const EMPTY: Partial<ICategoria> = { name: "", coverImage: null, description: null, order: 0 }

export default function AdminCategoriasPage() {
  const { checking } = useAdminAuth()
  const { show, ToastComponent } = useToast()
  const [items, setItems] = useState<ICategoria[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)
  const [addSaving, setAddSaving] = useState(false)
  const [newItem, setNewItem] = useState({ ...EMPTY })

  useEffect(() => {
    fetch("/api/catalog/categorias").then(r => r.json()).then((d: ICategoria[]) => {
      if (Array.isArray(d)) setItems(d)
    }).catch(() => null)
  }, [])

  function update(idx: number, key: keyof ICategoria, value: unknown) {
    setItems(prev => prev.map((c, i) => i === idx ? { ...c, [key]: value } : c))
  }

  async function saveOne(cat: ICategoria) {
    setSavingId(cat.id)
    const res = await fetch(`/api/catalog/categorias?id=${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cat.name, coverImage: cat.coverImage, description: cat.description, order: cat.order }),
    })
    if (!res.ok) { show("Error al guardar"); setSavingId(null); return }
    const updated: ICategoria[] = await fetch("/api/catalog/categorias").then(r => r.json())
    if (Array.isArray(updated)) setItems(updated)
    setSavingId(null)
    show("¡Guardado!")
  }

  async function remove(cat: ICategoria) {
    if (!confirm(`¿Eliminar "${cat.name}"?\n\nSe eliminarán también sus subcategorías y productos.`)) return
    await fetch(`/api/catalog/categorias?id=${cat.id}`, { method: "DELETE" })
    setItems(prev => prev.filter(c => c.id !== cat.id))
    show("Eliminada")
  }

  async function addItem() {
    if (!newItem.name) return
    setAddSaving(true)
    const res = await fetch("/api/catalog/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
    const created: ICategoria = await res.json()
    setItems(prev => [...prev, created])
    setNewItem({ ...EMPTY, order: items.length + 1 })
    setAddSaving(false)
    show("Categoría creada")
  }

  if (checking) return <AdminPageSkeleton />

  return (
    <>
      <Head><title>Categorías — Admin Rivera</title></Head>
      <PageHeader title="Categorías" subtitle="Nivel 1 del catálogo (Pisos Laminados, Pisos de Madera…). URL: /[slug]" />
      <div className="space-y-4">
        {items.map((cat, idx) => (
          <FormCard key={cat.id}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(20,60%,45%)]">
                /{cat.slug} · {(cat._count?.subcategorias ?? 0)} subcategorías
              </span>
              <button onClick={() => remove(cat)} className="text-red-400 hover:text-red-600 transition-colors" title="Eliminar">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre *">
                <AdminInput value={cat.name} onChange={v => update(idx, "name", v)} placeholder="Pisos Laminados" />
              </Field>
              <Field label="Orden">
                <AdminInput value={String(cat.order)} onChange={v => update(idx, "order", Number(v))} placeholder="0" />
              </Field>
            </div>
            <Field label="Descripción (opcional)">
              <AdminTextarea value={cat.description ?? ""} onChange={v => update(idx, "description", v || null)} />
            </Field>
            <Field label="Imagen de portada">
              <ImageUploadField value={cat.coverImage ?? ""} onChange={v => update(idx, "coverImage", v || null)} aspect="landscape" />
            </Field>
            <SaveButton saving={savingId === cat.id} onClick={() => saveOne(cat)} />
          </FormCard>
        ))}

        <FormCard>
          <p className="text-sm font-bold text-[hsl(20,60%,45%)] mb-4">+ Nueva categoría</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre *">
              <AdminInput value={newItem.name ?? ""} onChange={v => setNewItem(p => ({ ...p, name: v }))} placeholder="Pisos Laminados" />
            </Field>
            <Field label="Orden">
              <AdminInput value={String(newItem.order ?? 0)} onChange={v => setNewItem(p => ({ ...p, order: Number(v) }))} placeholder="0" />
            </Field>
          </div>
          <Field label="Descripción (opcional)">
            <AdminTextarea value={newItem.description ?? ""} onChange={v => setNewItem(p => ({ ...p, description: v || null }))} />
          </Field>
          <Field label="Imagen de portada">
            <ImageUploadField value={newItem.coverImage ?? ""} onChange={v => setNewItem(p => ({ ...p, coverImage: v || null }))} aspect="landscape" />
          </Field>
          <button onClick={addItem} disabled={addSaving || !newItem.name} className="mt-3 flex items-center gap-2 text-sm font-semibold bg-[hsl(20,60%,45%)] text-white px-4 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50">
            <Plus size={14} />
            {addSaving ? "Creando..." : "Crear categoría"}
          </button>
        </FormCard>
      </div>
      {ToastComponent}
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/categorias.tsx
git commit -m "feat(admin): /admin/categorias page with CRUD"
```

---

## Task 8: Admin — Página Subcategorías

**Files:**
- Create: `src/pages/admin/subcategorias.tsx`

- [ ] **Step 1: Crear `src/pages/admin/subcategorias.tsx`**

```tsx
import { useState, useEffect } from "react"
import Head from "next/head"
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils"
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField"
import { Trash2, Plus } from "lucide-react"
import type { ICategoria, ISubcategoria } from "@/domain/types"

const EMPTY: Partial<ISubcategoria> = { categoriaId: 0, name: "", coverImage: null, description: null, order: 0 }

export default function AdminSubcategoriasPage() {
  const { checking } = useAdminAuth()
  const { show, ToastComponent } = useToast()
  const [categorias, setCategorias] = useState<ICategoria[]>([])
  const [items, setItems] = useState<ISubcategoria[]>([])
  const [filterCat, setFilterCat] = useState<number | "">("")
  const [savingId, setSavingId] = useState<number | null>(null)
  const [addSaving, setAddSaving] = useState(false)
  const [newItem, setNewItem] = useState({ ...EMPTY })

  useEffect(() => {
    fetch("/api/catalog/categorias").then(r => r.json()).then((d: ICategoria[]) => {
      if (Array.isArray(d)) setCategorias(d)
    }).catch(() => null)
  }, [])

  useEffect(() => {
    const url = filterCat ? `/api/catalog/subcategorias?categoriaId=${filterCat}` : "/api/catalog/subcategorias"
    fetch(url).then(r => r.json()).then((d: ISubcategoria[]) => {
      if (Array.isArray(d)) setItems(d)
    }).catch(() => null)
  }, [filterCat])

  function update(idx: number, key: keyof ISubcategoria, value: unknown) {
    setItems(prev => prev.map((s, i) => i === idx ? { ...s, [key]: value } : s))
  }

  async function saveOne(sub: ISubcategoria) {
    setSavingId(sub.id)
    const res = await fetch(`/api/catalog/subcategorias?id=${sub.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoriaId: sub.categoriaId, name: sub.name, coverImage: sub.coverImage, description: sub.description, order: sub.order }),
    })
    if (!res.ok) { show("Error al guardar"); setSavingId(null); return }
    const url = filterCat ? `/api/catalog/subcategorias?categoriaId=${filterCat}` : "/api/catalog/subcategorias"
    const updated: ISubcategoria[] = await fetch(url).then(r => r.json())
    if (Array.isArray(updated)) setItems(updated)
    setSavingId(null)
    show("¡Guardado!")
  }

  async function remove(sub: ISubcategoria) {
    if (!confirm(`¿Eliminar "${sub.name}"?\n\nSe eliminarán también sus productos.`)) return
    await fetch(`/api/catalog/subcategorias?id=${sub.id}`, { method: "DELETE" })
    setItems(prev => prev.filter(s => s.id !== sub.id))
    show("Eliminada")
  }

  async function addItem() {
    if (!newItem.name || !newItem.categoriaId) return
    setAddSaving(true)
    const res = await fetch("/api/catalog/subcategorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
    const created: ISubcategoria = await res.json()
    if (!filterCat || created.categoriaId === filterCat) {
      setItems(prev => [...prev, created])
    }
    setNewItem({ ...EMPTY, categoriaId: newItem.categoriaId, order: items.length + 1 })
    setAddSaving(false)
    show("Subcategoría creada")
  }

  if (checking) return <AdminPageSkeleton />

  return (
    <>
      <Head><title>Subcategorías — Admin Rivera</title></Head>
      <PageHeader title="Subcategorías" subtitle="Nivel 2 del catálogo (Splash!, Clásico…). URL: /[categoría]/[slug]" />

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value === "" ? "" : Number(e.target.value))}
          className="border border-input rounded px-3 py-2 text-sm bg-background"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {items.map((sub, idx) => (
          <FormCard key={sub.id}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(20,60%,45%)]">
                {sub.categoria?.slug ?? "?"}/{sub.slug} · {(sub._count?.productos ?? 0)} productos
              </span>
              <button onClick={() => remove(sub)} className="text-red-400 hover:text-red-600 transition-colors" title="Eliminar">
                <Trash2 size={16} />
              </button>
            </div>
            <Field label="Categoría padre *">
              <select
                value={sub.categoriaId}
                onChange={e => update(idx, "categoriaId", Number(e.target.value))}
                className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
              >
                {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre *">
                <AdminInput value={sub.name} onChange={v => update(idx, "name", v)} placeholder="Splash!" />
              </Field>
              <Field label="Orden">
                <AdminInput value={String(sub.order)} onChange={v => update(idx, "order", Number(v))} placeholder="0" />
              </Field>
            </div>
            <Field label="Descripción (opcional)">
              <AdminTextarea value={sub.description ?? ""} onChange={v => update(idx, "description", v || null)} />
            </Field>
            <Field label="Imagen de portada">
              <ImageUploadField value={sub.coverImage ?? ""} onChange={v => update(idx, "coverImage", v || null)} aspect="landscape" />
            </Field>
            <SaveButton saving={savingId === sub.id} onClick={() => saveOne(sub)} />
          </FormCard>
        ))}

        <FormCard>
          <p className="text-sm font-bold text-[hsl(20,60%,45%)] mb-4">+ Nueva subcategoría</p>
          <Field label="Categoría padre *">
            <select
              value={newItem.categoriaId ?? ""}
              onChange={e => setNewItem(p => ({ ...p, categoriaId: Number(e.target.value) }))}
              className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
            >
              <option value="">— Selecciona una categoría —</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre *">
              <AdminInput value={newItem.name ?? ""} onChange={v => setNewItem(p => ({ ...p, name: v }))} placeholder="Splash!" />
            </Field>
            <Field label="Orden">
              <AdminInput value={String(newItem.order ?? 0)} onChange={v => setNewItem(p => ({ ...p, order: Number(v) }))} placeholder="0" />
            </Field>
          </div>
          <Field label="Descripción (opcional)">
            <AdminTextarea value={newItem.description ?? ""} onChange={v => setNewItem(p => ({ ...p, description: v || null }))} />
          </Field>
          <Field label="Imagen de portada">
            <ImageUploadField value={newItem.coverImage ?? ""} onChange={v => setNewItem(p => ({ ...p, coverImage: v || null }))} aspect="landscape" />
          </Field>
          <button onClick={addItem} disabled={addSaving || !newItem.name || !newItem.categoriaId} className="mt-3 flex items-center gap-2 text-sm font-semibold bg-[hsl(20,60%,45%)] text-white px-4 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50">
            <Plus size={14} />
            {addSaving ? "Creando..." : "Crear subcategoría"}
          </button>
        </FormCard>
      </div>
      {ToastComponent}
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/subcategorias.tsx
git commit -m "feat(admin): /admin/subcategorias page with CRUD and category filter"
```

---

## Task 9: Admin — Página Productos

**Files:**
- Create: `src/pages/admin/productos/index.tsx`
- Create: `src/pages/admin/productos/[id].tsx`

- [ ] **Step 1: Crear `src/pages/admin/productos/index.tsx`**

Página de lista con filtros + botón crear. Al hacer click en un producto va a `/admin/productos/[id]`.

```tsx
import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import {
  useAdminAuth, PageHeader, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { ICategoria, ISubcategoria, IProducto } from "@/domain/types"

export default function AdminProductosPage() {
  const { checking } = useAdminAuth()
  const { show, ToastComponent } = useToast()
  const router = useRouter()
  const [categorias, setCategorias] = useState<ICategoria[]>([])
  const [subcategorias, setSubcategorias] = useState<ISubcategoria[]>([])
  const [productos, setProductos] = useState<IProducto[]>([])
  const [filterCat, setFilterCat] = useState<number | "">("")
  const [filterSub, setFilterSub] = useState<number | "">("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/catalog/categorias").then(r => r.json()),
      fetch("/api/catalog/productos").then(r => r.json()),
    ]).then(([cats, prods]) => {
      if (Array.isArray(cats)) setCategorias(cats)
      if (Array.isArray(prods)) setProductos(prods)
    }).catch(() => null)
  }, [])

  useEffect(() => {
    if (!filterCat) { setSubcategorias([]); setFilterSub(""); return }
    fetch(`/api/catalog/subcategorias?categoriaId=${filterCat}`)
      .then(r => r.json())
      .then((d: ISubcategoria[]) => { if (Array.isArray(d)) setSubcategorias(d) })
      .catch(() => null)
    setFilterSub("")
  }, [filterCat])

  const filtered = productos.filter(p => {
    const matchCat = !filterCat || p.subcategoria?.categoria?.id === filterCat
    const matchSub = !filterSub || p.subcategoriaId === filterSub
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSub && matchSearch
  })

  async function remove(p: IProducto) {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return
    await fetch(`/api/catalog/productos?id=${p.id}`, { method: "DELETE" })
    setProductos(prev => prev.filter(x => x.id !== p.id))
    show("Eliminado")
  }

  if (checking) return <AdminPageSkeleton />

  return (
    <>
      <Head><title>Productos — Admin Rivera</title></Head>
      <PageHeader title="Productos" subtitle="Nivel 3 del catálogo. URL: /producto/[slug]" />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value === "" ? "" : Number(e.target.value))}
          className="border border-input rounded px-3 py-2 text-sm bg-background"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={filterSub}
          onChange={e => setFilterSub(e.target.value === "" ? "" : Number(e.target.value))}
          disabled={!filterCat}
          className="border border-input rounded px-3 py-2 text-sm bg-background disabled:opacity-50"
        >
          <option value="">Todas las subcategorías</option>
          {subcategorias.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input
          type="text"
          placeholder="Buscar por nombre…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-input rounded px-3 py-2 text-sm bg-background w-48"
        />
        <span className="text-sm text-muted-foreground">{filtered.length} producto{filtered.length !== 1 ? "s" : ""}</span>
        <Link href="/admin/productos/new" className="ml-auto flex items-center gap-2 text-sm font-semibold bg-[hsl(20,60%,45%)] text-white px-4 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors">
          <Plus size={14} /> Nuevo producto
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(0,0%,96%)] border-b border-[hsl(0,0%,88%)]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[hsl(0,0%,45%)]">Producto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[hsl(0,0%,45%)] hidden md:table-cell">Categoría › Subcategoría</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[hsl(0,0%,45%)]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(0,0%,92%)]">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-[hsl(0,0%,98%)] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.coverImage
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.coverImage} alt={p.name} className="w-10 h-10 object-cover rounded" />
                      : <div className="w-10 h-10 bg-muted rounded" />
                    }
                    <div>
                      <p className="font-medium text-[hsl(0,0%,13%)]">{p.name}</p>
                      {p.shortDesc && <p className="text-xs text-[hsl(0,0%,55%)] truncate max-w-[200px]">{p.shortDesc}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[hsl(0,0%,55%)] hidden md:table-cell">
                  {p.subcategoria?.categoria?.name ?? "—"} › {p.subcategoria?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => router.push(`/admin/productos/${p.id}`)} className="flex items-center gap-1 text-xs text-[hsl(20,60%,45%)] hover:underline">
                      <Pencil size={12} /> Editar
                    </button>
                    <button onClick={() => remove(p)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600">
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No hay productos que coincidan.
          </div>
        )}
      </div>
      {ToastComponent}
    </>
  )
}
```

- [ ] **Step 2: Crear `src/pages/admin/productos/[id].tsx`**

Página de crear/editar un producto. Usa `id=new` para crear.

```tsx
import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import dynamic from "next/dynamic"
import {
  useAdminAuth, PageHeader, Field, FormCard,
  AdminInput, AdminTextarea, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils"
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField"
import { Trash2, Plus, GripVertical } from "lucide-react"
import type { ICategoria, ISubcategoria, IProducto, IProductoImagen } from "@/domain/types"

// Load WYSIWYG only client-side
const WysiwygEditor = dynamic(() => import("@/components/admin/WysiwygEditor"), { ssr: false })

const EMPTY_PRODUCTO = {
  subcategoriaId: 0, name: "", coverImage: null as string | null,
  hoverImage: null as string | null, shortDesc: null as string | null,
  htmlContent: null as string | null, order: 0,
}

export default function AdminProductoDetailPage() {
  const { checking } = useAdminAuth()
  const { show, ToastComponent } = useToast()
  const router = useRouter()
  const { id } = router.query
  const isNew = id === "new"
  const numId = isNew ? null : Number(id)

  const [categorias, setCategorias] = useState<ICategoria[]>([])
  const [subcategorias, setSubcategorias] = useState<ISubcategoria[]>([])
  const [filterCat, setFilterCat] = useState<number | "">("")
  const [form, setForm] = useState({ ...EMPTY_PRODUCTO })
  const [imagenes, setImagenes] = useState<IProductoImagen[]>([])
  const [saving, setSaving] = useState(false)
  const [imgUploading, setImgUploading] = useState(false)
  const [newImgUrl, setNewImgUrl] = useState("")

  // Load categorias
  useEffect(() => {
    fetch("/api/catalog/categorias").then(r => r.json()).then((d: ICategoria[]) => {
      if (Array.isArray(d)) setCategorias(d)
    }).catch(() => null)
  }, [])

  // Load subcategorias when filterCat changes
  useEffect(() => {
    if (!filterCat) return
    fetch(`/api/catalog/subcategorias?categoriaId=${filterCat}`)
      .then(r => r.json())
      .then((d: ISubcategoria[]) => { if (Array.isArray(d)) setSubcategorias(d) })
      .catch(() => null)
  }, [filterCat])

  // Load existing product if editing
  useEffect(() => {
    if (!numId) return
    fetch(`/api/catalog/productos`).then(r => r.json()).then((list: IProducto[]) => {
      const p = list.find(x => x.id === numId)
      if (!p) return
      const catId = p.subcategoria?.categoria?.id
      if (catId) setFilterCat(catId)
      setForm({
        subcategoriaId: p.subcategoriaId,
        name: p.name,
        coverImage: p.coverImage,
        hoverImage: p.hoverImage,
        shortDesc: p.shortDesc,
        htmlContent: p.htmlContent,
        order: p.order,
      })
      setImagenes(p.imagenes ?? [])
    }).catch(() => null)
  }, [numId])

  async function save() {
    if (!form.name || !form.subcategoriaId) { show("Nombre y subcategoría son requeridos"); return }
    setSaving(true)
    if (isNew) {
      const res = await fetch("/api/catalog/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) { show("Error al crear"); setSaving(false); return }
      const created: IProducto = await res.json()
      show("¡Producto creado!")
      router.push(`/admin/productos/${created.id}`)
    } else {
      const res = await fetch(`/api/catalog/productos?id=${numId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) { show("Error al guardar"); setSaving(false); return }
      show("¡Guardado!")
    }
    setSaving(false)
  }

  async function addImagen() {
    if (!newImgUrl || !numId) return
    setImgUploading(true)
    const res = await fetch("/api/catalog/imagenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId: numId, url: newImgUrl, order: imagenes.length }),
    })
    const img: IProductoImagen = await res.json()
    setImagenes(prev => [...prev, img])
    setNewImgUrl("")
    setImgUploading(false)
    show("Imagen agregada")
  }

  async function deleteImagen(imgId: number) {
    await fetch(`/api/catalog/imagenes?id=${imgId}`, { method: "DELETE" })
    setImagenes(prev => prev.filter(i => i.id !== imgId))
    show("Imagen eliminada")
  }

  if (checking || (!isNew && !numId)) return <AdminPageSkeleton />

  return (
    <>
      <Head><title>{isNew ? "Nuevo Producto" : (form.name || "Producto")} — Admin Rivera</title></Head>
      <PageHeader
        title={isNew ? "Nuevo Producto" : (form.name || "Editar Producto")}
        subtitle="Nivel 3 del catálogo"
      />
      <Link href="/admin/productos" className="inline-block text-sm text-[hsl(20,60%,45%)] hover:underline mb-4">← Volver a productos</Link>

      <div className="space-y-6">
        {/* Main form */}
        <FormCard>
          {/* Categoría → Subcategoría selector */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoría">
              <select
                value={filterCat}
                onChange={e => { setFilterCat(Number(e.target.value)); setForm(p => ({ ...p, subcategoriaId: 0 })) }}
                className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
              >
                <option value="">— Selecciona categoría —</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Subcategoría *">
              <select
                value={form.subcategoriaId || ""}
                onChange={e => setForm(p => ({ ...p, subcategoriaId: Number(e.target.value) }))}
                disabled={!filterCat}
                className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)] disabled:opacity-50"
              >
                <option value="">— Selecciona subcategoría —</option>
                {subcategorias.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre *">
              <AdminInput value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Arctic Oak Splash" />
            </Field>
            <Field label="Orden">
              <AdminInput value={String(form.order)} onChange={v => setForm(p => ({ ...p, order: Number(v) }))} placeholder="0" />
            </Field>
          </div>

          <Field label="Descripción corta">
            <AdminTextarea value={form.shortDesc ?? ""} onChange={v => setForm(p => ({ ...p, shortDesc: v || null }))} rows={2} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Imagen de portada">
              <ImageUploadField value={form.coverImage ?? ""} onChange={v => setForm(p => ({ ...p, coverImage: v || null }))} aspect="square" />
            </Field>
            <Field label="Imagen hover (opcional)">
              <ImageUploadField value={form.hoverImage ?? ""} onChange={v => setForm(p => ({ ...p, hoverImage: v || null }))} aspect="square" />
            </Field>
          </div>

          <Field label="Contenido del producto (WYSIWYG)">
            <WysiwygEditor
              value={form.htmlContent ?? ""}
              onChange={v => setForm(p => ({ ...p, htmlContent: v || null }))}
            />
          </Field>

          <div className="mt-4">
            <SaveButton saving={saving} onClick={save} />
          </div>
        </FormCard>

        {/* Gallery — only show when editing existing product */}
        {!isNew && (
          <FormCard>
            <p className="text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,50%)] mb-4">Galería de imágenes</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {imagenes.map(img => (
                <div key={img.id} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.caption ?? ""} className="w-full aspect-square object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => deleteImagen(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
            <Field label="Agregar imagen a la galería">
              <div className="flex gap-2">
                <div className="flex-1">
                  <ImageUploadField value={newImgUrl} onChange={setNewImgUrl} aspect="square" />
                </div>
                <button
                  type="button"
                  onClick={addImagen}
                  disabled={!newImgUrl || imgUploading}
                  className="self-end flex items-center gap-1 text-sm font-semibold bg-[hsl(20,60%,45%)] text-white px-3 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50"
                >
                  <Plus size={14} />
                  {imgUploading ? "Subiendo…" : "Agregar"}
                </button>
              </div>
            </Field>
          </FormCard>
        )}
      </div>
      {ToastComponent}
    </>
  )
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep "admin/productos\|admin/categorias\|admin/subcategorias" | head -10
```

Esperado: sin output o solo errores mínimos pre-existentes.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/productos/
git commit -m "feat(admin): /admin/productos pages with list, create, edit, gallery"
```

---

## Task 10: Actualizar AdminLayout + WhatsApp Hook

**Files:**
- Modify: `src/components/admin/AdminLayout.tsx`
- Modify: `src/hooks/useWhatsApp.ts`
- Modify: `src/pages/_app.tsx`

- [ ] **Step 1: Actualizar `AdminLayout.tsx` — cambiar links del catálogo**

En el array de nav links, reemplazar las entradas de Categorías, Líneas, Productos actuales por las nuevas:

```typescript
// Reemplazar estas líneas (donde estén en el array):
{ href: "/admin/categories", label: "Categorías", icon: FolderOpen },
{ href: "/admin/materials", label: "Líneas", icon: Package },
{ href: "/admin/productos", label: "Productos", icon: Layers },
// Con estas:
{ href: "/admin/categorias", label: "Categorías", icon: FolderOpen },
{ href: "/admin/subcategorias", label: "Subcategorías", icon: Package },
{ href: "/admin/productos", label: "Productos", icon: Layers },
```

- [ ] **Step 2: Actualizar `src/hooks/useWhatsApp.ts` — agregar campos de nuevo catálogo**

Reemplazar la interfaz `WhatsAppContext` y la función `buildMessage`:

```typescript
export interface WhatsAppContext {
  // Nuevo catálogo
  categoria?: string
  subcategoria?: string
  producto?: string
  // Legacy (se mantiene para compatibilidad)
  material?: string
  collection?: string
  product?: string
  code?: string
}

function buildMessage(context?: WhatsAppContext): string {
  if (!context) return "Hola, me gustaría obtener más información. ¿Me pueden ayudar?"

  // Nuevo catálogo
  if (context.producto) {
    const breadcrumb = [context.categoria, context.subcategoria].filter(Boolean).join(" › ")
    return `Hola, me interesa el producto: ${context.producto}${breadcrumb ? ` (${breadcrumb})` : ""}. ¿Precio y disponibilidad?`
  }

  if (context.subcategoria) {
    return `Hola, me interesa la línea: ${context.categoria ? `${context.categoria} › ` : ""}${context.subcategoria}. ¿Me dan más información?`
  }

  // Legacy
  if (context.product && context.code) {
    const line2 = [context.material, context.collection].filter(Boolean).join(" — ")
    return `Hola, me interesa el producto: ${context.product} (${context.code})${line2 ? ` de ${line2}` : ""}. ¿Precio y disponibilidad?`
  }

  if (context.collection && context.material) {
    return `Hola, me interesa: ${context.material} — ${context.collection}. ¿Precios y disponibilidad?`
  }

  if (context.material) {
    return `Hola, me interesa: ${context.material}. ¿Me dan más información?`
  }

  return "Hola, me gustaría obtener más información. ¿Me pueden ayudar?"
}
```

También actualizar el array de dependencias del `useMemo` en `useWhatsApp`:

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
return useMemo(() => buildWhatsAppUrl(phone, context), [phone, context?.material, context?.collection, context?.product, context?.code, context?.producto, context?.subcategoria, context?.categoria])
```

- [ ] **Step 3: Actualizar `src/pages/_app.tsx` — eliminar isGallery**

Eliminar las líneas relacionadas con `isGallery` (la ruta `/materiales` ya no existirá):

```typescript
// ELIMINAR estas líneas:
const isGallery = router.pathname.startsWith("/materiales")

// Y este bloque:
if (isGallery) {
  return (
    <>
      <Component {...pageProps} />
      <WhatsAppFAB phone={whatsappPhone} context={whatsappContext} />
    </>
  )
}
```

El return final ya maneja WhatsAppFAB dentro de MainLayout, por lo que el bloque `isGallery` es redundante.

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | grep "AdminLayout\|useWhatsApp\|_app" | head -10
```

Esperado: sin output.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AdminLayout.tsx src/hooks/useWhatsApp.ts src/pages/_app.tsx
git commit -m "feat(admin,hooks): update AdminLayout nav links, extend WhatsAppContext for new catalog"
```

---

## Task 11: Páginas Públicas — Helpers Compartidos

**Files:**
- Create: `src/lib/getSharedProps.ts`

Este helper evita repetir la lógica de cargar `navItems` y `whatsappPhone` en cada `getServerSideProps`.

- [ ] **Step 1: Crear `src/lib/getSharedProps.ts`**

```typescript
import { navItemRepository } from "@/repositories/navItem.repository"
import { db } from "@/infrastructure/db/client"

/**
 * Retorna props comunes que todas las páginas públicas necesitan:
 * navItems para el navbar y whatsappPhone para el FAB de WhatsApp.
 */
export async function getSharedProps() {
  const [navItems, contact] = await Promise.all([
    navItemRepository.findAll(),
    db.pageSection.findFirst({
      where: { type: "CONTACT" },
      select: { config: true },
    }),
  ])

  let whatsappPhone = ""
  if (contact?.config && typeof contact.config === "object") {
    whatsappPhone = (contact.config as Record<string, string>).whatsappPhone ?? ""
  }

  return { navItems, whatsappPhone }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/getSharedProps.ts
git commit -m "feat(lib): getSharedProps helper for SSR pages"
```

---

## Task 12: Página Pública — Categoría

**Files:**
- Create: `src/pages/[categoriaSlug].tsx` (reemplaza `[slug].tsx`)

- [ ] **Step 1: Crear `src/pages/[categoriaSlug].tsx`**

```tsx
import type { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { categoriaRepository } from "@/repositories/categoria.repository"
import { getSharedProps } from "@/lib/getSharedProps"
import type { ICategoria, ISubcategoria, INavItem } from "@/domain/types"

interface Props {
  categoria: ICategoria & { subcategorias: (ISubcategoria & { _count: { productos: number } })[] }
  navItems: INavItem[]
  whatsappPhone: string
}

export default function CategoriaPage({ categoria }: Props) {
  return (
    <>
      <Head>
        <title>{categoria.name} — Rivera</title>
        <meta name="description" content={categoria.description ?? `Explora ${categoria.name} en Rivera`} />
      </Head>

      {/* Hero */}
      <div className="relative w-full h-64 md:h-80 bg-[hsl(0,0%,15%)] overflow-hidden">
        {categoria.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={categoria.coverImage}
            alt={categoria.name}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-12 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white">{categoria.name}</h1>
          {categoria.description && (
            <p className="mt-3 text-white/80 text-lg max-w-xl">{categoria.description}</p>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-4">
        <nav className="text-sm text-[hsl(0,0%,55%)]">
          <Link href="/" className="hover:text-[hsl(20,60%,45%)] transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-[hsl(0,0%,20%)]">{categoria.name}</span>
        </nav>
      </div>

      {/* Subcategorías grid */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 pb-16">
        {categoria.subcategorias.length === 0 ? (
          <p className="text-[hsl(0,0%,55%)] text-center py-12">Próximamente…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoria.subcategorias.map(sub => (
              <Link
                key={sub.id}
                href={`/${categoria.slug}/${sub.slug}`}
                className="group block rounded-xl overflow-hidden border border-[hsl(0,0%,90%)] hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-video bg-[hsl(0,0%,90%)] overflow-hidden">
                  {sub.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sub.coverImage}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[hsl(20,30%,85%)] to-[hsl(20,20%,75%)]" />
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-[hsl(0,0%,13%)] group-hover:text-[hsl(20,60%,45%)] transition-colors">
                    {sub.name}
                  </h2>
                  <p className="text-xs text-[hsl(0,0%,55%)] mt-1">
                    {sub._count.productos} producto{sub._count.productos !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slug = ctx.params?.categoriaSlug as string
  const [categoria, shared] = await Promise.all([
    categoriaRepository.findBySlug(slug),
    getSharedProps(),
  ])

  if (!categoria) return { notFound: true }

  return {
    props: {
      categoria: JSON.parse(JSON.stringify(categoria)),
      ...shared,
    },
  }
}
```

- [ ] **Step 2: Eliminar el archivo viejo `src/pages/[slug].tsx`**

```bash
rm src/pages/[slug].tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/[categoriaSlug].tsx
git rm src/pages/[slug].tsx
git commit -m "feat(pages): categoria landing page at /[categoriaSlug], replaces old [slug].tsx"
```

---

## Task 13: Página Pública — Subcategoría

**Files:**
- Create: `src/pages/[categoriaSlug]/[subcategoriaSlug].tsx`

- [ ] **Step 1: Crear directorio y archivo**

```bash
mkdir -p src/pages/[categoriaSlug]
```

Crear `src/pages/[categoriaSlug]/[subcategoriaSlug].tsx`:

```tsx
import type { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { subcategoriaRepository } from "@/repositories/subcategoria.repository"
import { getSharedProps } from "@/lib/getSharedProps"
import type { ISubcategoria, IProducto, INavItem } from "@/domain/types"

interface Props {
  subcategoria: ISubcategoria & { productos: IProducto[] }
  navItems: INavItem[]
  whatsappPhone: string
}

export default function SubcategoriaPage({ subcategoria }: Props) {
  const categoria = subcategoria.categoria!

  return (
    <>
      <Head>
        <title>{subcategoria.name} — {categoria.name} — Rivera</title>
        <meta name="description" content={subcategoria.description ?? `Explora ${subcategoria.name} en Rivera`} />
      </Head>

      {/* Hero */}
      <div className="relative w-full h-56 md:h-72 bg-[hsl(0,0%,15%)] overflow-hidden">
        {subcategoria.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={subcategoria.coverImage}
            alt={subcategoria.name}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-12 max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{subcategoria.name}</h1>
          {subcategoria.description && (
            <p className="mt-2 text-white/80 max-w-lg">{subcategoria.description}</p>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-4">
        <nav className="text-sm text-[hsl(0,0%,55%)]">
          <Link href="/" className="hover:text-[hsl(20,60%,45%)] transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href={`/${categoria.slug}`} className="hover:text-[hsl(20,60%,45%)] transition-colors">{categoria.name}</Link>
          <span className="mx-2">/</span>
          <span className="text-[hsl(0,0%,20%)]">{subcategoria.name}</span>
        </nav>
      </div>

      {/* Productos grid */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 pb-16">
        {(subcategoria as unknown as { productos: IProducto[] }).productos.length === 0 ? (
          <p className="text-[hsl(0,0%,55%)] text-center py-12">Próximamente…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(subcategoria as unknown as { productos: IProducto[] }).productos.map(producto => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function ProductoCard({ producto }: { producto: IProducto }) {
  return (
    <Link
      href={`/producto/${producto.slug}`}
      className="group block rounded-xl overflow-hidden border border-[hsl(0,0%,90%)] hover:shadow-lg transition-all duration-300"
    >
      {/* Image with hover effect */}
      <div className="aspect-square bg-[hsl(0,0%,90%)] overflow-hidden relative">
        {producto.coverImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={producto.coverImage}
              alt={producto.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                producto.hoverImage
                  ? "opacity-100 group-hover:opacity-0"
                  : "group-hover:scale-105"
              }`}
            />
            {producto.hoverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={producto.hoverImage}
                alt={`${producto.name} (detalle)`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[hsl(20,30%,85%)] to-[hsl(20,20%,75%)] group-hover:scale-105 transition-transform duration-300" />
        )}
      </div>
      {/* Name */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-[hsl(0,0%,13%)] group-hover:text-[hsl(20,60%,45%)] transition-colors leading-tight">
          {producto.name}
        </h3>
        {producto.shortDesc && (
          <p className="text-xs text-[hsl(0,0%,55%)] mt-1 line-clamp-2">{producto.shortDesc}</p>
        )}
      </div>
    </Link>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const categoriaSlug = ctx.params?.categoriaSlug as string
  const subcategoriaSlug = ctx.params?.subcategoriaSlug as string

  const [subcategoria, shared] = await Promise.all([
    subcategoriaRepository.findBySlug(subcategoriaSlug),
    getSharedProps(),
  ])

  // Verify it belongs to the right categoria slug
  if (!subcategoria || subcategoria.categoria?.slug !== categoriaSlug) {
    return { notFound: true }
  }

  return {
    props: {
      subcategoria: JSON.parse(JSON.stringify(subcategoria)),
      whatsappContext: {
        categoria: subcategoria.categoria?.name,
        subcategoria: subcategoria.name,
      },
      ...shared,
    },
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/pages/[categoriaSlug]/"
git commit -m "feat(pages): subcategoria page at /[categoriaSlug]/[subcategoriaSlug] with product grid and hover effect"
```

---

## Task 14: Página Pública — Detalle de Producto

**Files:**
- Create: `src/pages/producto/[slug].tsx`

- [ ] **Step 1: Crear directorio y archivo**

```bash
mkdir -p src/pages/producto
```

Crear `src/pages/producto/[slug].tsx`:

```tsx
import { useState } from "react"
import type { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { productoRepository } from "@/repositories/producto.repository"
import { getSharedProps } from "@/lib/getSharedProps"
import type { IProducto, INavItem } from "@/domain/types"

interface Props {
  producto: IProducto
  navItems: INavItem[]
  whatsappPhone: string
}

export default function ProductoPage({ producto }: Props) {
  const subcategoria = producto.subcategoria!
  const categoria = subcategoria.categoria!
  const imagenes = producto.imagenes ?? []
  const [activeImg, setActiveImg] = useState(producto.coverImage ?? "")

  const allImgs = [
    ...(producto.coverImage ? [{ url: producto.coverImage, caption: null }] : []),
    ...imagenes.map(i => ({ url: i.url, caption: i.caption })),
  ]

  return (
    <>
      <Head>
        <title>{producto.name} — Rivera</title>
        <meta name="description" content={producto.shortDesc ?? `${producto.name} — Rivera`} />
      </Head>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-6">
        <nav className="text-sm text-[hsl(0,0%,55%)]">
          <Link href="/" className="hover:text-[hsl(20,60%,45%)] transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href={`/${categoria.slug}`} className="hover:text-[hsl(20,60%,45%)] transition-colors">{categoria.name}</Link>
          <span className="mx-2">/</span>
          <Link href={`/${categoria.slug}/${subcategoria.slug}`} className="hover:text-[hsl(20,60%,45%)] transition-colors">{subcategoria.name}</Link>
          <span className="mx-2">/</span>
          <span className="text-[hsl(0,0%,20%)]">{producto.name}</span>
        </nav>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 pb-16">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

          {/* Left: Gallery */}
          <div>
            {/* Main image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-[hsl(0,0%,90%)] mb-3">
              {activeImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeImg} alt={producto.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[hsl(20,30%,85%)] to-[hsl(20,20%,75%)]" />
              )}
            </div>
            {/* Thumbnails */}
            {allImgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImgs.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(img.url)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImg === img.url ? "border-[hsl(20,60%,45%)]" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.caption ?? ""} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div>
            <h1 className="text-3xl font-bold text-[hsl(0,0%,10%)] mb-2">{producto.name}</h1>
            <p className="text-sm text-[hsl(0,0%,55%)] mb-4">
              {categoria.name} › {subcategoria.name}
            </p>

            {producto.shortDesc && (
              <p className="text-[hsl(0,0%,35%)] mb-6 leading-relaxed">{producto.shortDesc}</p>
            )}

            {producto.htmlContent && (
              <div
                className="prose prose-sm max-w-none text-[hsl(0,0%,30%)] mb-8"
                dangerouslySetInnerHTML={{ __html: producto.htmlContent }}
              />
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slug = ctx.params?.slug as string

  const [producto, shared] = await Promise.all([
    productoRepository.findBySlug(slug),
    getSharedProps(),
  ])

  if (!producto) return { notFound: true }

  return {
    props: {
      producto: JSON.parse(JSON.stringify(producto)),
      whatsappContext: {
        categoria:    producto.subcategoria?.categoria?.name,
        subcategoria: producto.subcategoria?.name,
        producto:     producto.name,
      },
      ...shared,
    },
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/producto/
git commit -m "feat(pages): producto detail page at /producto/[slug] with gallery and WYSIWYG content"
```

---

## Task 15: Limpieza de Archivos Viejos

**Files:** Eliminar múltiples archivos obsoletos.

- [ ] **Step 1: Eliminar archivos de código viejo**

```bash
# Tipos y schemas
rm -f src/domain/types/category.ts
rm -f src/domain/types/material.ts
rm -f src/domain/schemas/category.schema.ts
rm -f src/domain/schemas/finish.schema.ts

# Repositorios
rm -f src/repositories/category.repository.ts
rm -f src/repositories/material.repository.ts
rm -f src/repositories/finish.repository.ts

# APIs viejas
rm -f src/pages/api/content/categories.ts
rm -f src/pages/api/content/materials.ts
rm -f src/pages/api/content/finishes.ts
rm -f src/pages/api/content/collections.ts

# Admin viejas
rm -f src/pages/admin/categories.tsx
rm -f src/pages/admin/materials.tsx
rm -f src/pages/admin/collections.tsx
rm -f src/pages/admin/productos.tsx
rm -rf src/pages/admin/materials/
```

- [ ] **Step 2: Verificar TypeScript limpio**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | head -20
```

Si hay errores, son referencias a los archivos eliminados en otros archivos — buscar y corregir:

```bash
# Buscar referencias residuales
grep -r "category\.repository\|material\.repository\|finish\.repository\|IMaterial\|ICategory\|MaterialFinish" src/ --include="*.ts" --include="*.tsx" -l
```

Para cada archivo encontrado, eliminar o corregir el import.

- [ ] **Step 3: Build final completo**

```bash
npm run build 2>&1 | tail -20
```

Esperado: `✓ Compiled successfully` sin errores fatales.

- [ ] **Step 4: Commit final de limpieza**

```bash
git add -A
git commit -m "chore: remove old Material/Category/Finish models, repos, APIs, and admin pages"
```

---

## Task 16: Verificación Final + Push

- [ ] **Step 1: Build de producción completo**

```bash
npm run build 2>&1 | grep -E "error|Error|✓|✗|Failed|success" | head -20
```

Esperado: sin líneas de error.

- [ ] **Step 2: Verificar rutas nuevas existen**

```bash
ls src/pages/[categoriaSlug].tsx
ls "src/pages/[categoriaSlug]/[subcategoriaSlug].tsx"
ls src/pages/producto/[slug].tsx
ls src/pages/admin/categorias.tsx
ls src/pages/admin/subcategorias.tsx
ls src/pages/admin/productos/index.tsx
ls src/pages/admin/productos/[id].tsx
ls src/pages/api/catalog/categorias.ts
ls src/pages/api/catalog/subcategorias.ts
ls src/pages/api/catalog/productos.ts
```

- [ ] **Step 3: Push**

```bash
git push origin main
```

---

## Notas de Implementación

### Resolución de conflictos de rutas Next.js
Next.js Pages Router resuelve rutas en este orden:
1. Rutas estáticas (`/admin`, `/api`, `/`) → siempre ganan
2. `[categoriaSlug].tsx` captura cualquier ruta raíz dinámica → hace 404 si no hay Categoria con ese slug
3. `[categoriaSlug]/[subcategoriaSlug].tsx` → hace 404 si no coincide el par

### Build-time sin DB
Ninguna página nueva usa `getStaticPaths`. Todo es SSR con `getServerSideProps` para evitar el error de build (no hay DB disponible durante `docker build`).

### WYSIWYG en SSR
`WysiwygEditor` se importa con `dynamic(..., { ssr: false })` porque TipTap usa APIs del browser. El contenido guardado (HTML string) se renderiza en el servidor con `dangerouslySetInnerHTML`.

### Migración aplicada en producción
El `docker-entrypoint.sh` ya ejecuta `prisma migrate deploy` al arrancar el contenedor, lo que aplicará `20260415000001_catalog_redesign` automáticamente.
