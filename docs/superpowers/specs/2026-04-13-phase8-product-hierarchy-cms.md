# Phase 8 — Product Hierarchy + CMS Sections

**Date:** 2026-04-13  
**Project:** Comercializadora Rivera  
**Stack:** Next.js 14 Pages Router · TypeScript · Prisma 7 · PostgreSQL · Tailwind · Framer Motion v12

---

## Problem

1. Navbar text is invisible over the hero (dark text on dark image).
2. Material/collection/finish pages have no nav items — TopBar renders empty.
3. The product catalog has no mid-level collection page; users jump from material straight to individual finishes with no grouping.
4. The admin materials list will become unusable at scale (no pagination, no search).
5. Product finish detail has no free-form technical spec area.
6. Sections on the home page cannot be reordered or hidden from the admin.
7. GitHub Actions deploy workflow has no health-check — silent failures are possible.

---

## Approach

Extend the existing 4-level data model (`Category → Material → MaterialCollection → MaterialFinish`) with the matching front-end pages and admin tools. Add a Markdown field to `MaterialFinish` for free-form spec content. Build an admin section-reorder page using the existing `PageSection` model. Improve the deploy workflow with a health-check step and manual-trigger option.

---

## Bloque 0 — Deployment fixes

### GitHub Actions workflow improvements (`deploy.yml`)

1. Add `workflow_dispatch` trigger so deploys can be launched manually from GitHub UI without a commit.
2. Add a health-check step at the end of the `deploy` job:
   ```yaml
   - name: Health check
     run: |
       sleep 15
       curl --fail --retry 5 --retry-delay 5 http://${{ secrets.SERVER_IP }}/api/health || exit 1
   ```
3. Ensure `prisma migrate deploy` runs inside the container via `docker-entrypoint.sh` — already done, no change needed.

### Next.js health endpoint

Add `src/pages/api/health.ts` returning `200 { ok: true }` — used by the workflow health check.

---

## Bloque 1 — Quick fixes

### 1a. Navbar text color

`TopBar` passes a `transparent` boolean to `NavBar` when `!scrolled`. `NavBar` applies `text-background` (cream/white) when transparent and `text-foreground/70` when not.

```tsx
// TopBar — pass transparent prop
<NavBar items={navItems} transparent={!scrolled} />

// NavBar — use it
className={`... ${transparent ? "text-background/90 hover:text-background" : "text-foreground/70 hover:text-foreground"}`}
```

### 1b. NavItems on all pages

Add `navItemRepository.findRoots()` to `getServerSideProps` in:
- `src/pages/materiales/[id].tsx`
- New collection page (Bloque 2)
- New finish detail page (Bloque 2)

---

## Bloque 2 — Product hierarchy pages

### Data model (no changes needed)

```
Category        /categorias/[slug]                        ← exists ✅
  └─ Material   /materiales/[id]                          ← update ⚠️  ([id] = slug or numeric)
       └─ MaterialCollection  /materiales/[id]/[colSlug]              ← NEW 🆕
            └─ MaterialFinish /materiales/[id]/[colSlug]/[finSlug]    ← NEW 🆕
```

Next.js Pages Router file structure:
```
pages/materiales/
  [id].tsx                          ← Level 2 (existing, updated)
  [id]/
    [colSlug]/
      index.tsx                     ← Level 3 (new)
      [finSlug].tsx                 ← Level 4 (new)
```

Next.js resolves by segment count — no conflict between `[id].tsx` and the `[id]/` folder.

Prisma slugs: `Category.slug`, `Material.slug`, `MaterialCollection.slug` (unique per material via `@@unique([materialId, slug])`), `MaterialFinish.slug` (globally unique).

### Level 2 — `/materiales/[id]` (update existing `pages/materiales/[id].tsx`)

`getServerSideProps` already handles slug strings — keep logic, add navItems fetch and collections display.
Page layout:
1. **Hero banner** — `Material.coverImage` full-width with overlay + material name
2. **"¿Qué es?" section** — renders `Material.desc` as a paragraph block
3. **Collections grid** — cards for each `MaterialCollection` (coverImage, name, desc snippet). Click → Level 3 (`/materiales/[id]/[colSlug]`).
4. **TopBar** with full navItems.

### Level 3 — `/materiales/[id]/[colSlug]` (new `pages/materiales/[id]/[colSlug]/index.tsx`)

`getServerSideProps` receives `params.id` (material slug) and `params.colSlug`. Fetches `MaterialCollection` by `{ material: { slug: id }, slug: colSlug }` with its `finishes`.
Page layout:
1. **Breadcrumb** — `Categoría > Material > Colección`
2. **Collection header** — coverImage banner + name + `desc`
3. **Finishes grid** — `FinishCard` components (image + hoverImage on hover, name, code). Click → Level 4.
4. **TopBar** with full navItems.

### Level 4 — `/materiales/[id]/[colSlug]/[finSlug]` (new `pages/materiales/[id]/[colSlug]/[finSlug].tsx`)

`getServerSideProps` fetches `MaterialFinish` by `slug` with its `images` (MaterialFinishImage[]).  
Page layout:
1. **Breadcrumb** — `Categoría > Material > Colección > Acabado`
2. **Image gallery** — primary `image` large + `MaterialFinishImage[]` thumbnails. Click thumbnail → swap main image.
3. **Structured spec** — chips/badges: grosor, clase de uso, resistencia al agua, tipo instalación, garantía, dims.
4. **Free-form spec** — renders `MaterialFinish.specMd` as Markdown (`react-markdown` library).
5. **WhatsApp CTA** — button that opens `wa.me` with pre-filled message including finish name + collection + material.
6. **PDF download** — if `pdfUrl` set, show download button.
7. **TopBar** with full navItems.

### DB migration

Add field to `MaterialFinish`:
```prisma
specMd String @default("")
```

Migration: `prisma migrate dev --name add-finish-specMd`

---

## Bloque 3 — Admin improvements

### 3a. Admin Materials — table view with search + pagination

Replace the current card grid in `src/pages/admin/materials.tsx` with a compact table:
- Columns: thumbnail (40×40), name, category, # finishes, order, actions (Edit / Delete)
- Search input filters by name client-side
- Pagination: 20 rows per page
- "Edit" → `href="/admin/materials/[id]"` (existing detail page)
- "New material" button opens inline drawer or navigates to `/admin/materials/new`

### 3b. Admin Collections — new page `/admin/collections`

New file: `src/pages/admin/collections.tsx`  
Layout:
1. **Material selector** — dropdown of all materials. Selecting one loads its collections.
2. **Collections table** — name, slug, order, actions (Edit / Delete). Inline edit row on click.
3. **Add collection form** — name, slug (auto-generated), desc, coverImage upload, order.
4. CRUD via `POST/PUT/DELETE /api/content/collections`.

New API: `src/pages/api/content/collections.ts` — CRUD for `MaterialCollection`.  
Pattern: same as existing `categories.ts` / `nav-items.ts`.

### 3c. Admin dashboard — add Collections link

Add to `SECTIONS` in `src/pages/admin/index.tsx`:
```ts
{ href: "/admin/collections", label: "Colecciones", desc: "Subcategorías por material (Splash, Clásico…)", icon: Layers }
```

---

## Bloque 4 — Finish specMd field

- DB: `specMd String @default("")` on `MaterialFinish` (migration in Bloque 2)
- Admin `materials/[id].tsx` finish edit form: add `<AdminTextarea label="Ficha técnica (Markdown)" />` for `specMd`
- Frontend Level 4 page: `import ReactMarkdown from 'react-markdown'` → render `finish.specMd`
- Install: `npm install react-markdown`

---

## Bloque 5 — Section CMS

### Admin Page Sections — `/admin/page-sections`

New file: `src/pages/admin/page-sections.tsx`

`PageSection` model (already in DB):
```prisma
model PageSection {
  id      Int     @id @default(autoincrement())
  type    String  // "HERO" | "SERVICES" | "PRODUCTS" | "SPACES" | "CATALOG" | "CONTACT" | "FOOTER"
  order   Int     @default(0)
  visible Boolean @default(true)
  config  String  @default("{}")
}
```

Page layout:
1. **Ordered list** of sections — shows type label + current order number + visible toggle
2. **Drag-and-drop reorder** — use `@dnd-kit/core` + `@dnd-kit/sortable`
3. **Visible toggle** — `<input type="checkbox">` per row, saves immediately via `PATCH /api/content/page-sections/[id]`
4. **Save order** button — sends updated order array to `PUT /api/content/page-sections/reorder`

New API endpoints:
- `PATCH /api/content/page-sections/[id]` — update `visible` + `order`
- `PUT /api/content/page-sections/reorder` — accepts `[{ id, order }]` array, bulk-updates orders

Section type labels (human-readable map):
```ts
const LABELS: Record<string, string> = {
  HERO: "Hero / Carrusel",
  SERVICES: "Ventas",
  PRODUCTS: "Materiales / Showroom",
  SPACES: "Espacios y proyectos",
  CATALOG: "Catálogo PDF",
  CONTACT: "Contacto",
  FOOTER: "Footer",
}
```

Dashboard link: add `{ href: "/admin/page-sections", label: "Secciones", desc: "Orden y visibilidad de las secciones", icon: LayoutList }` to `SECTIONS`.

Install: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

---

## File map

| File | Status | Change |
|------|--------|--------|
| `.github/workflows/deploy.yml` | exists | add `workflow_dispatch` + health-check step |
| `src/pages/api/health.ts` | new | `200 { ok: true }` |
| `src/components/navigation/TopBar.tsx` | update | pass `transparent` to NavBar |
| `src/components/navigation/NavBar.tsx` | update | accept + apply `transparent` prop |
| `src/pages/materiales/[id].tsx` | update | add navItems, fetch collections, show "¿Qué es?" + collection cards |
| `src/pages/materiales/[id]/[colSlug]/index.tsx` | new | Level 3 collection page |
| `src/pages/materiales/[id]/[colSlug]/[finSlug].tsx` | new | Level 4 finish detail page |
| `prisma/schema.prisma` | update | add `specMd` to `MaterialFinish` |
| `prisma/migrations/…` | new | migration file |
| `src/pages/admin/materials.tsx` | update | table view + search + pagination |
| `src/pages/admin/collections.tsx` | new | collections CRUD admin |
| `src/pages/api/content/collections.ts` | new | CRUD API |
| `src/pages/admin/page-sections.tsx` | new | section reorder + visibility |
| `src/pages/api/content/page-sections/[id].ts` | new | PATCH single section |
| `src/pages/api/content/page-sections/reorder.ts` | new | PUT bulk reorder |
| `src/pages/admin/index.tsx` | update | add Collections + Secciones links |

---

## What does NOT change

- Hero carousel, hero content, service cards, spaces gallery, catalog section, contact form, footer — visual design unchanged.
- Auth system, existing admin pages (hero, services, spaces, catalog, contact, footer, seo, media).
- Existing URL `/materiales/[id]` with numeric id — keep working for backward compatibility (redirect to slug URL).

---

## Testing

- Existing 58 passing tests must remain green.
- No new test files required (consistent with codebase pattern).
- Manual smoke-test: navigate all 4 levels, test WhatsApp URL, test admin CRUD for collections, test section reorder.
