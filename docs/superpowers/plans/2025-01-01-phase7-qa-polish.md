# Phase 7 — QA & Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix hero mobile overflow, complete admin ficha técnica fields, add Categories and NavItems API endpoints + admin pages, and update the dashboard.

**Architecture:** Six independent tasks. T1 fixes CSS. T2 extends the materials admin form. T3 creates two API files. T4–T5 create two new admin pages. T6 updates the admin dashboard. All work goes on branch `feature/phase7-qa-polish` in worktree `.worktrees/phase7-qa`.

**Tech Stack:** Next.js 14 Pages Router, TypeScript, Tailwind CSS, Prisma 7, Zod, Lucide React. Admin utilities from `@/components/admin/adminUtils`.

**Worktree:** `.worktrees/phase7-qa` on branch `feature/phase7-qa-polish`

**Create worktree before starting:**
```bash
cd /Users/rubenely/Documentos/Proyectos/rivera
git branch feature/phase7-qa-polish main
git worktree add .worktrees/phase7-qa feature/phase7-qa-polish
cd .worktrees/phase7-qa
```

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/components/sections/HeroSection.tsx` | Modify line 46 | Add responsive text-size breakpoints |
| `src/components/sections/HeroCarousel.tsx` | Modify line 97 | Add responsive text-size breakpoints |
| `src/pages/admin/materials.tsx` | Modify | Add ficha técnica fields to edit + add finish forms |
| `src/pages/api/content/categories.ts` | Create | CRUD for Category model |
| `src/pages/api/content/nav-items.ts` | Create | CRUD for NavItem model |
| `src/pages/admin/categories.tsx` | Create | Admin page for product categories |
| `src/pages/admin/nav-items.tsx` | Create | Admin page for navigation tree |
| `src/pages/admin/index.tsx` | Modify | Add Categories + NavItems links, rename Servicios → Ventas |

---

### Task 1: Hero overflow fix

**Files:**
- Modify: `src/components/sections/HeroSection.tsx:46`
- Modify: `src/components/sections/HeroCarousel.tsx:97`

**Context:**
Both files have `text-8xl md:text-[7rem] lg:text-[9rem]` with no breakpoints below `md`. On mobile (< 768px), `text-8xl` (6rem) is wider than the viewport, causing overflow. Fix: add `text-4xl sm:text-6xl` breakpoints before `md`.

- [ ] **Step 1: Fix HeroSection.tsx**

In `src/components/sections/HeroSection.tsx` line 46, change:
```
className="text-white text-8xl md:text-[7rem] lg:text-[9rem] font-bold leading-[0.9] tracking-tight max-w-4xl"
```
to:
```
className="text-white text-4xl sm:text-6xl md:text-[7rem] lg:text-[9rem] font-bold leading-[0.9] tracking-tight max-w-4xl"
```

- [ ] **Step 2: Fix HeroCarousel.tsx**

In `src/components/sections/HeroCarousel.tsx` line 97, change:
```
className="text-white text-8xl md:text-[7rem] lg:text-[9rem] font-bold leading-[0.9] tracking-tight max-w-4xl"
```
to:
```
className="text-white text-4xl sm:text-6xl md:text-[7rem] lg:text-[9rem] font-bold leading-[0.9] tracking-tight max-w-4xl"
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v "admin/materials\|db/client" | grep "error TS" | head -5
```
Expected: 0 new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/HeroSection.tsx src/components/sections/HeroCarousel.tsx
git commit -m "fix(hero): add responsive text-size breakpoints for mobile overflow"
```

---

### Task 2: Admin Materials — add ficha técnica fields

**Files:**
- Modify: `src/pages/admin/materials.tsx`

**Context:**
The finish API (`PUT /api/content/finishes?id=X`) already accepts: `hoverImage`, `pdfUrl`, `thickness`, `useClass`, `waterRes` (boolean), `installType`, `warranty`. The `startEdit()` function already loads these fields. But the `EMPTY_FINISH` constant, the `updateNewFinish` and `updateEdit` function signatures, and the form UIs are missing them.

`FinishEditState` is `Omit<IMaterialFinish, "id" | "materialId" | "order">` — already includes all new fields.

Changes needed:
1. Line 14: `EMPTY_FINISH` — add all new fields
2. Line ~61: `updateNewFinish` — change `value: string` → `value: string | boolean`
3. Line ~121: `updateEdit` — change `value: string` → `value: string | boolean`
4. Edit form UI (after Imagen field, before save buttons) — add 7 new fields
5. New finish form (after Imagen field, before Agregar button) — add 7 new fields

- [ ] **Step 1: Update EMPTY_FINISH**

Find line:
```typescript
const EMPTY_FINISH = { name: "", code: "", collection: "", image: "", dims: "" };
```

Replace with:
```typescript
const EMPTY_FINISH = {
  name: "", code: "", collection: "", image: "", dims: "",
  hoverImage: "", pdfUrl: "", thickness: "", useClass: "",
  waterRes: false, installType: "", warranty: "",
};
```

- [ ] **Step 2: Update updateNewFinish signature**

Find:
```typescript
  function updateNewFinish(matId: number, key: keyof typeof EMPTY_FINISH, value: string) {
```
Replace with:
```typescript
  function updateNewFinish(matId: number, key: keyof typeof EMPTY_FINISH, value: string | boolean) {
```

- [ ] **Step 3: Update updateEdit signature**

Find:
```typescript
  function updateEdit(finishId: number, key: keyof FinishEditState, value: string) {
```
Replace with:
```typescript
  function updateEdit(finishId: number, key: keyof FinishEditState, value: string | boolean) {
```

- [ ] **Step 4: Add new fields to the edit form**

In the edit form, find the closing tag after the Imagen del acabado ImageUploadField:
```tsx
              <Field label="Imagen del acabado">
                <ImageUploadField
                  value={edits?.image ?? ""}
                  onChange={(v) => updateEdit(f.id, "image", v)}
                  aspect="square"
                />
              </Field>
              <div className="flex gap-2 mt-3">
```

Replace with:
```tsx
              <Field label="Imagen del acabado">
                <ImageUploadField
                  value={edits?.image ?? ""}
                  onChange={(v) => updateEdit(f.id, "image", v)}
                  aspect="square"
                />
              </Field>
              <Field label="Imagen hover (cómo se ve instalado)">
                <ImageUploadField
                  value={edits?.hoverImage ?? ""}
                  onChange={(v) => updateEdit(f.id, "hoverImage", v)}
                  aspect="landscape"
                />
              </Field>
              <Field label="PDF Ficha técnica (URL)">
                <AdminInput
                  value={edits?.pdfUrl ?? ""}
                  onChange={(v) => updateEdit(f.id, "pdfUrl", v)}
                  placeholder="/uploads/ficha-tecnica.pdf"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Grosor">
                  <AdminInput
                    value={edits?.thickness ?? ""}
                    onChange={(v) => updateEdit(f.id, "thickness", v)}
                    placeholder="8mm"
                  />
                </Field>
                <Field label="Clase de uso">
                  <AdminInput
                    value={edits?.useClass ?? ""}
                    onChange={(v) => updateEdit(f.id, "useClass", v)}
                    placeholder="AC3"
                  />
                </Field>
                <Field label="Tipo de instalación">
                  <AdminInput
                    value={edits?.installType ?? ""}
                    onChange={(v) => updateEdit(f.id, "installType", v)}
                    placeholder="Flotante / Click"
                  />
                </Field>
                <Field label="Garantía">
                  <AdminInput
                    value={edits?.warranty ?? ""}
                    onChange={(v) => updateEdit(f.id, "warranty", v)}
                    placeholder="25 años"
                  />
                </Field>
              </div>
              <Field label="Resistencia al agua">
                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={edits?.waterRes ?? false}
                    onChange={(e) => updateEdit(f.id, "waterRes", e.target.checked)}
                    className="w-4 h-4 accent-[hsl(20,60%,45%)]"
                  />
                  <span className="text-sm text-[hsl(0,0%,40%)]">
                    {edits?.waterRes ? "Sí — resistente al agua" : "No"}
                  </span>
                </label>
              </Field>
              <div className="flex gap-2 mt-3">
```

- [ ] **Step 5: Add new fields to the new finish form**

In the new finish form, find:
```tsx
                      <Field label="Imagen del acabado">
                        <ImageUploadField
                          value={newFinish[mat.id]?.image ?? ""}
                          onChange={(v) => updateNewFinish(mat.id, "image", v)}
                          aspect="square"
                        />
                      </Field>
                      <button
                        onClick={() => addFinish(mat.id)}
```

Replace with:
```tsx
                      <Field label="Imagen del acabado">
                        <ImageUploadField
                          value={newFinish[mat.id]?.image ?? ""}
                          onChange={(v) => updateNewFinish(mat.id, "image", v)}
                          aspect="square"
                        />
                      </Field>
                      <Field label="Imagen hover (cómo se ve instalado)">
                        <ImageUploadField
                          value={newFinish[mat.id]?.hoverImage ?? ""}
                          onChange={(v) => updateNewFinish(mat.id, "hoverImage", v)}
                          aspect="landscape"
                        />
                      </Field>
                      <Field label="PDF Ficha técnica (URL)">
                        <AdminInput
                          value={newFinish[mat.id]?.pdfUrl ?? ""}
                          onChange={(v) => updateNewFinish(mat.id, "pdfUrl", v)}
                          placeholder="/uploads/ficha-tecnica.pdf"
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <Field label="Grosor">
                          <AdminInput
                            value={newFinish[mat.id]?.thickness ?? ""}
                            onChange={(v) => updateNewFinish(mat.id, "thickness", v)}
                            placeholder="8mm"
                          />
                        </Field>
                        <Field label="Clase de uso">
                          <AdminInput
                            value={newFinish[mat.id]?.useClass ?? ""}
                            onChange={(v) => updateNewFinish(mat.id, "useClass", v)}
                            placeholder="AC3"
                          />
                        </Field>
                        <Field label="Tipo de instalación">
                          <AdminInput
                            value={newFinish[mat.id]?.installType ?? ""}
                            onChange={(v) => updateNewFinish(mat.id, "installType", v)}
                            placeholder="Flotante / Click"
                          />
                        </Field>
                        <Field label="Garantía">
                          <AdminInput
                            value={newFinish[mat.id]?.warranty ?? ""}
                            onChange={(v) => updateNewFinish(mat.id, "warranty", v)}
                            placeholder="25 años"
                          />
                        </Field>
                      </div>
                      <Field label="Resistencia al agua">
                        <label className="flex items-center gap-2 mt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newFinish[mat.id]?.waterRes ?? false}
                            onChange={(e) => updateNewFinish(mat.id, "waterRes", e.target.checked)}
                            className="w-4 h-4 accent-[hsl(20,60%,45%)]"
                          />
                          <span className="text-sm text-[hsl(0,0%,40%)]">
                            {newFinish[mat.id]?.waterRes ? "Sí — resistente al agua" : "No"}
                          </span>
                        </label>
                      </Field>
                      <button
                        onClick={() => addFinish(mat.id)}
```

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v "admin/materials\|db/client" | grep "error TS" | head -10
```
Expected: 0 new errors on these changes.

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/materials.tsx
git commit -m "feat(admin): add ficha técnica fields to finish edit and add forms"
```

---

### Task 3: API endpoints for categories and nav-items

**Files:**
- Create: `src/pages/api/content/categories.ts`
- Create: `src/pages/api/content/nav-items.ts`

**Context:**

**Categories API:**
- `categoryRepository` at `@/repositories/category.repository` has: `findAll()`, `create(input)`, `update(id, input)`, `delete(id)`
- `CategorySchema` at `@/domain/schemas/category.schema`: `{ name, coverImage?, icon?, order? }` — slug auto-generated from name
- Pattern: same as existing APIs (`requireAuth`, `withErrorHandling`)

**NavItems API:**
- `navItemRepository` at `@/repositories/navItem.repository` has: `findAll()`, `create(input)`, `update(id, input)`, `delete(id)`
- `NavItemSchema` at `@/domain/schemas/navItem.schema`: `{ label, href?, order?, visible?, parentId? }`
- GET returns flat `findAll()` (not `findRoots()`) so admin can see ALL items including hidden ones. The tree is built client-side.

- [ ] **Step 1: Create categories API**

Create `src/pages/api/content/categories.ts` with full content:

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { CategorySchema } from "@/domain/schemas/category.schema";
import { categoryRepository } from "@/repositories/category.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET    /api/content/categories          → Lista todas las categorías (público).
 * POST   /api/content/categories          → Crea una nueva categoría (auth).
 * PUT    /api/content/categories?id=X     → Actualiza una categoría (auth).
 * DELETE /api/content/categories?id=X     → Elimina una categoría (auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await categoryRepository.findAll();
    return res.status(200).json(data);
  }

  if (!requireAuth(req, res)) return;

  if (req.method === "POST") {
    const parsed = CategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }
    const created = await categoryRepository.create(parsed.data);
    return res.status(201).json(created);
  }

  if (req.method === "PUT") {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" });
    const parsed = CategorySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }
    const updated = await categoryRepository.update(id, parsed.data);
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" });
    await categoryRepository.delete(id);
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Método no permitido" });
});
```

- [ ] **Step 2: Create nav-items API**

Create `src/pages/api/content/nav-items.ts` with full content:

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { NavItemSchema } from "@/domain/schemas/navItem.schema";
import { navItemRepository } from "@/repositories/navItem.repository";
import { requireAuth } from "@/infrastructure/auth/middleware";
import { withErrorHandling } from "@/infrastructure/http/withErrorHandling";

/**
 * GET    /api/content/nav-items          → Lista TODOS los items (plano, incluye ocultos).
 * POST   /api/content/nav-items          → Crea un nuevo item (auth).
 * PUT    /api/content/nav-items?id=X     → Actualiza un item (auth).
 * DELETE /api/content/nav-items?id=X     → Elimina un item y sus hijos en cascada (auth).
 */
export default withErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = await navItemRepository.findAll();
    return res.status(200).json(data);
  }

  if (!requireAuth(req, res)) return;

  if (req.method === "POST") {
    const parsed = NavItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }
    const created = await navItemRepository.create(parsed.data);
    return res.status(201).json(created);
  }

  if (req.method === "PUT") {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" });
    const parsed = NavItemSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }
    const updated = await navItemRepository.update(id, parsed.data);
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: "Se requiere ?id=X" });
    await navItemRepository.delete(id);
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Método no permitido" });
});
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v "admin/materials\|db/client" | grep "error TS" | head -10
```
Expected: 0 new errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/content/categories.ts src/pages/api/content/nav-items.ts
git commit -m "feat(api): add CRUD endpoints for categories and nav-items"
```

---

### Task 4: Admin Categories page

**Files:**
- Create: `src/pages/admin/categories.tsx`

**Context:**
`ICategory` interface: `{ id, name, slug, coverImage, icon, order }`. Slug is auto-generated from name on create/update — displayed read-only. Uses individual PUT per row (not replace-all) to preserve FK references from materials. Pattern follows `space-categories.tsx` but with per-item save buttons.

- [ ] **Step 1: Create admin categories page**

Create `src/pages/admin/categories.tsx` with full content:

```typescript
import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import { Trash2, Plus } from "lucide-react";
import type { ICategory } from "@/domain/types";

const EMPTY_CAT = { name: "", coverImage: "", icon: "", order: 0 };

export default function AdminCategoriesPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [addSaving, setAddSaving] = useState(false);
  const [newCat, setNewCat] = useState({ ...EMPTY_CAT });

  useEffect(() => {
    fetch("/api/content/categories")
      .then((r) => r.json())
      .then((d: ICategory[]) => { if (d?.length) setCategories(d); });
  }, []);

  function update(idx: number, key: keyof typeof EMPTY_CAT, value: string | number) {
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));
  }

  async function saveOne(cat: ICategory) {
    setSavingId(cat.id);
    await fetch(`/api/content/categories?id=${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cat.name, coverImage: cat.coverImage, icon: cat.icon, order: cat.order }),
    });
    // Reload to get fresh slug after name change
    const updated: ICategory[] = await fetch("/api/content/categories").then((r) => r.json());
    if (updated?.length) setCategories(updated);
    setSavingId(null);
    show("¡Guardado!");
  }

  async function remove(cat: ICategory) {
    if (!confirm(`¿Eliminar "${cat.name}"?\n\nAtención: los materiales asignados a esta categoría quedarán sin categoría.`)) return;
    await fetch(`/api/content/categories?id=${cat.id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    show("Categoría eliminada");
  }

  async function addCat() {
    if (!newCat.name) return;
    setAddSaving(true);
    const created: ICategory = await fetch("/api/content/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCat),
    }).then((r) => r.json());
    setCategories((prev) => [...prev, created]);
    setNewCat({ ...EMPTY_CAT, order: categories.length + 1 });
    setAddSaving(false);
    show("Categoría creada");
  }

  if (checking) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Categorías — Admin Rivera</title></Head>
      <PageHeader
        title="Categorías"
        subtitle="Categorías de producto (Pisos, Paredes, Ventanas…). Cada categoría genera su propia página en /categorias/[slug]."
      />
      <div className="space-y-4">
        {categories.map((cat, idx) => (
          <FormCard key={cat.id}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,50%)]">
                {cat.slug ? `/categorias/${cat.slug}` : `Categoría ${idx + 1}`}
              </span>
              <button
                onClick={() => remove(cat)}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre">
                <AdminInput
                  value={cat.name}
                  onChange={(v) => update(idx, "name", v)}
                  placeholder="Pisos"
                />
              </Field>
              <Field label="Ícono (emoji o texto corto)">
                <AdminInput
                  value={cat.icon}
                  onChange={(v) => update(idx, "icon", v)}
                  placeholder="🪵"
                />
              </Field>
              <Field label="Orden (número)">
                <AdminInput
                  value={String(cat.order)}
                  onChange={(v) => update(idx, "order", Number(v))}
                  placeholder="0"
                />
              </Field>
            </div>

            <Field label="Imagen de portada">
              <ImageUploadField
                value={cat.coverImage}
                onChange={(v) => update(idx, "coverImage", v)}
                aspect="landscape"
                placeholder="/uploads/categorias/pisos.webp"
              />
            </Field>

            <SaveButton saving={savingId === cat.id} onClick={() => saveOne(cat)} />
          </FormCard>
        ))}

        {/* ── Nueva categoría ── */}
        <FormCard>
          <p className="text-xs font-bold uppercase tracking-wider text-[hsl(20,60%,45%)] mb-3">
            Nueva categoría
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre *">
              <AdminInput
                value={newCat.name}
                onChange={(v) => setNewCat((p) => ({ ...p, name: v }))}
                placeholder="Pisos"
              />
            </Field>
            <Field label="Ícono">
              <AdminInput
                value={newCat.icon}
                onChange={(v) => setNewCat((p) => ({ ...p, icon: v }))}
                placeholder="🪵"
              />
            </Field>
            <Field label="Orden">
              <AdminInput
                value={String(newCat.order)}
                onChange={(v) => setNewCat((p) => ({ ...p, order: Number(v) }))}
                placeholder="0"
              />
            </Field>
          </div>

          <Field label="Imagen de portada">
            <ImageUploadField
              value={newCat.coverImage}
              onChange={(v) => setNewCat((p) => ({ ...p, coverImage: v }))}
              aspect="landscape"
              placeholder="/uploads/categorias/nueva.webp"
            />
          </Field>

          <button
            onClick={addCat}
            disabled={addSaving || !newCat.name}
            className="mt-3 flex items-center gap-2 text-sm font-semibold bg-[hsl(20,60%,45%)] text-white px-4 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            {addSaving ? "Creando..." : "Crear categoría"}
          </button>
        </FormCard>
      </div>
      {ToastComponent}
    </>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v "admin/materials\|db/client" | grep "error TS" | head -10
```
Expected: 0 new errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/categories.tsx
git commit -m "feat(admin): add Categories admin page"
```

---

### Task 5: Admin NavItems page

**Files:**
- Create: `src/pages/admin/nav-items.tsx`

**Context:**
`INavItem` interface: `{ id, label, href, order, visible, parentId, children? }`. The API returns a flat list (from `findAll()`) — the tree is built client-side with `buildTree()`. Cascade delete is configured in Prisma schema (`onDelete: Cascade`), so deleting a root item removes all its children automatically.

Tree depth: Level 0 = roots, Level 1 = children, Level 2 = grandchildren. No adding children at depth 2 (grandchildren have no children).

- [ ] **Step 1: Create admin nav-items page**

Create `src/pages/admin/nav-items.tsx` with full content:

```typescript
import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { Trash2, Plus, Pencil, Check, X, EyeOff } from "lucide-react";
import type { INavItem } from "@/domain/types";

type EditState = { label: string; href: string; visible: boolean; order: number };
type AddState = { label: string; href: string; visible: boolean; order: number };

const EMPTY_ADD: AddState = { label: "", href: "", visible: true, order: 0 };

function buildTree(flat: INavItem[]): INavItem[] {
  const map = new Map<number, INavItem & { children: INavItem[] }>();
  [...flat].sort((a, b) => a.order - b.order).forEach((i) => map.set(i.id, { ...i, children: [] }));
  const roots: INavItem[] = [];
  map.forEach((item) => {
    if (item.parentId === null) {
      roots.push(item);
    } else {
      map.get(item.parentId)?.children?.push(item);
    }
  });
  return roots;
}

interface NavRowProps {
  item: INavItem;
  editing: EditState | null;
  saving: boolean;
  depth: number;
  canAddChild: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (k: keyof EditState, v: string | boolean | number) => void;
  onAddChild: () => void;
}

function NavRow({
  item, editing, saving, depth, canAddChild,
  onEdit, onCancel, onSave, onDelete, onChange, onAddChild,
}: NavRowProps) {
  if (editing) {
    return (
      <div className="rounded border border-[hsl(20,60%,45%)]/30 bg-[hsl(20,60%,45%)]/5 p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Etiqueta *">
            <AdminInput
              value={editing.label}
              onChange={(v) => onChange("label", v)}
              placeholder="Pisos"
            />
          </Field>
          <Field label="URL (href)">
            <AdminInput
              value={editing.href}
              onChange={(v) => onChange("href", v)}
              placeholder="/categorias/pisos"
            />
          </Field>
          <Field label="Orden">
            <AdminInput
              value={String(editing.order)}
              onChange={(v) => onChange("order", Number(v))}
              placeholder="0"
            />
          </Field>
          <Field label="Visible en el menú">
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.visible}
                onChange={(e) => onChange("visible", e.target.checked)}
                className="w-4 h-4 accent-[hsl(20,60%,45%)]"
              />
              <span className="text-sm text-[hsl(0,0%,40%)]">
                {editing.visible ? "Visible" : "Oculto"}
              </span>
            </label>
          </Field>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[hsl(20,60%,45%)] text-white px-3 py-1.5 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50"
          >
            <Check size={12} />
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs font-semibold border border-[hsl(0,0%,80%)] text-[hsl(0,0%,40%)] px-3 py-1.5 rounded hover:bg-[hsl(0,0%,95%)] transition-colors"
          >
            <X size={12} /> Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded border border-[hsl(0,0%,90%)] bg-[hsl(0,0%,97%)]">
      <span
        className={`flex-1 text-sm truncate ${
          !item.visible ? "text-[hsl(0,0%,60%)] line-through" : "text-[hsl(0,0%,13%)] font-medium"
        }`}
      >
        {item.label}
        {item.href && (
          <span className="ml-2 text-xs font-mono text-[hsl(0,0%,55%)] font-normal">
            {item.href}
          </span>
        )}
      </span>
      {!item.visible && <EyeOff size={12} className="text-[hsl(0,0%,50%)] shrink-0" />}
      {canAddChild && depth < 2 && (
        <button
          onClick={onAddChild}
          title="Agregar hijo"
          className="p-1 rounded text-[hsl(0,0%,55%)] hover:text-[hsl(20,60%,45%)] hover:bg-[hsl(20,60%,45%)]/10 transition-colors shrink-0"
        >
          <Plus size={13} />
        </button>
      )}
      <button
        onClick={onEdit}
        title="Editar"
        className="p-1 rounded text-[hsl(0,0%,55%)] hover:text-[hsl(20,60%,45%)] hover:bg-[hsl(20,60%,45%)]/10 transition-colors shrink-0"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={onDelete}
        title="Eliminar"
        className="p-1 rounded text-[hsl(0,0%,55%)] hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

interface AddFormProps {
  saving: boolean;
  onSave: (data: AddState) => void;
  onCancel: () => void;
}

function AddForm({ saving, onSave, onCancel }: AddFormProps) {
  const [form, setForm] = useState<AddState>({ ...EMPTY_ADD });

  return (
    <div className="rounded border border-[hsl(20,60%,45%)]/30 bg-[hsl(20,60%,45%)]/5 p-3 space-y-2 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Etiqueta *">
          <AdminInput
            value={form.label}
            onChange={(v) => setForm((p) => ({ ...p, label: v }))}
            placeholder="Pisos Laminados"
          />
        </Field>
        <Field label="URL (href)">
          <AdminInput
            value={form.href}
            onChange={(v) => setForm((p) => ({ ...p, href: v }))}
            placeholder="/categorias/pisos-laminados"
          />
        </Field>
        <Field label="Orden">
          <AdminInput
            value={String(form.order)}
            onChange={(v) => setForm((p) => ({ ...p, order: Number(v) }))}
            placeholder="0"
          />
        </Field>
        <Field label="Visible">
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))}
              className="w-4 h-4 accent-[hsl(20,60%,45%)]"
            />
            <span className="text-sm text-[hsl(0,0%,40%)]">
              {form.visible ? "Visible" : "Oculto"}
            </span>
          </label>
        </Field>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.label}
          className="flex items-center gap-1.5 text-xs font-semibold bg-[hsl(20,60%,45%)] text-white px-3 py-1.5 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50"
        >
          <Check size={12} />
          {saving ? "Agregando..." : "Agregar"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold border border-[hsl(0,0%,80%)] text-[hsl(0,0%,40%)] px-3 py-1.5 rounded hover:bg-[hsl(0,0%,95%)] transition-colors"
        >
          <X size={12} /> Cancelar
        </button>
      </div>
    </div>
  );
}

export default function AdminNavItemsPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [allItems, setAllItems] = useState<INavItem[]>([]);
  const [editing, setEditing] = useState<Record<number, EditState | null>>({});
  const [addingParentId, setAddingParentId] = useState<number | null | "none">("none");
  const [saving, setSaving] = useState(false);

  async function reload() {
    const data: INavItem[] = await fetch("/api/content/nav-items").then((r) => r.json());
    if (Array.isArray(data)) setAllItems(data);
  }

  useEffect(() => { reload(); }, []);

  function startEdit(item: INavItem) {
    setEditing((p) => ({
      ...p,
      [item.id]: { label: item.label, href: item.href, visible: item.visible, order: item.order },
    }));
  }

  function cancelEdit(id: number) {
    setEditing((p) => ({ ...p, [id]: null }));
  }

  async function saveEdit(item: INavItem) {
    const edits = editing[item.id];
    if (!edits) return;
    setSaving(true);
    await fetch(`/api/content/nav-items?id=${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...edits, parentId: item.parentId }),
    });
    await reload();
    setEditing((p) => ({ ...p, [item.id]: null }));
    setSaving(false);
    show("Guardado");
  }

  async function addItem(data: AddState, parentId: number | null) {
    if (!data.label) return;
    setSaving(true);
    await fetch("/api/content/nav-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, parentId }),
    });
    await reload();
    setAddingParentId("none");
    setSaving(false);
    show("Item agregado");
  }

  async function deleteItem(id: number, hasChildren: boolean) {
    const msg = hasChildren
      ? "¿Eliminar este item y todos sus hijos?"
      : "¿Eliminar este item?";
    if (!confirm(msg)) return;
    await fetch(`/api/content/nav-items?id=${id}`, { method: "DELETE" });
    await reload();
    show("Eliminado");
  }

  if (checking) return <AdminPageSkeleton />;

  const tree = buildTree(allItems);

  function renderItems(items: INavItem[], depth: number) {
    return items.map((item) => {
      const hasChildren = (item.children?.length ?? 0) > 0;
      return (
        <div key={item.id}>
          <NavRow
            item={item}
            editing={editing[item.id] ?? null}
            saving={saving}
            depth={depth}
            canAddChild={addingParentId === "none" || addingParentId === item.id}
            onEdit={() => startEdit(item)}
            onCancel={() => cancelEdit(item.id)}
            onSave={() => saveEdit(item)}
            onDelete={() => deleteItem(item.id, hasChildren)}
            onChange={(k, v) =>
              setEditing((p) => ({
                ...p,
                [item.id]: p[item.id] ? { ...p[item.id]!, [k]: v } : null,
              }))
            }
            onAddChild={() => setAddingParentId(item.id)}
          />
          {addingParentId === item.id && (
            <div className={depth > 0 ? "ml-6 pl-3" : "ml-6 pl-3"}>
              <AddForm
                saving={saving}
                onSave={(data) => addItem(data, item.id)}
                onCancel={() => setAddingParentId("none")}
              />
            </div>
          )}
          {hasChildren && (
            <div className="ml-6 border-l border-[hsl(0,0%,88%)] pl-3 mt-1 space-y-1">
              {renderItems(item.children!, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <>
      <Head><title>Navegación — Admin Rivera</title></Head>
      <PageHeader
        title="Navegación"
        subtitle="Árbol de menú de 3 niveles. Items ocultos no aparecen en el sitio. Eliminar un item también elimina sus hijos."
      />
      <FormCard>
        <div className="space-y-1">
          {renderItems(tree, 0)}
        </div>

        {addingParentId === null && (
          <AddForm
            saving={saving}
            onSave={(data) => addItem(data, null)}
            onCancel={() => setAddingParentId("none")}
          />
        )}

        <button
          onClick={() => setAddingParentId(null)}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-[hsl(20,60%,45%)] hover:text-[hsl(20,60%,35%)] transition-colors"
        >
          <Plus size={16} /> Agregar item raíz
        </button>
      </FormCard>
      {ToastComponent}
    </>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v "admin/materials\|db/client" | grep "error TS" | head -10
```
Expected: 0 new errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/nav-items.tsx
git commit -m "feat(admin): add NavItems admin page with 3-level tree UI"
```

---

### Task 6: Admin Dashboard update

**Files:**
- Modify: `src/pages/admin/index.tsx`

**Context:**
Current `SECTIONS` array has `{ href: "/admin/services", label: "Servicios", ... }` — needs renaming to "Ventas" and href to `/admin/ventas` (or keep pointing to existing services page). The existing services page at `/admin/services` has the old name; for now just update the label in the dashboard.

Also add two new entries: Categories and NavItems. Import the needed icons: `FolderOpen` (Categories) and `Navigation` (NavItems) from `lucide-react`.

- [ ] **Step 1: Update dashboard imports**

In `src/pages/admin/index.tsx`, find the icon imports line:
```typescript
import {
  ImageIcon,
  Wrench,
  Package,
  Grid2x2,
  BookOpen,
  Phone,
  Layout,
  Search,
  Upload,
} from "lucide-react";
```

Replace with:
```typescript
import {
  ImageIcon,
  Wrench,
  Package,
  Grid2x2,
  BookOpen,
  Phone,
  Layout,
  Search,
  Upload,
  FolderOpen,
  Navigation,
} from "lucide-react";
```

- [ ] **Step 2: Update SECTIONS array**

Replace the entire `const SECTIONS = [...]` block:
```typescript
const SECTIONS = [
  { href: "/admin/hero", label: "Hero", desc: "Título, subtítulo e imagen principal", icon: ImageIcon },
  { href: "/admin/services", label: "Ventas", desc: "5 tarjetas de ventas", icon: Wrench },
  { href: "/admin/materials", label: "Materiales", desc: "Tipos de pisos y recubrimientos", icon: Package },
  { href: "/admin/categories", label: "Categorías", desc: "Categorías de producto (Pisos, Paredes…)", icon: FolderOpen },
  { href: "/admin/nav-items", label: "Navegación", desc: "Árbol de menú de 3 niveles", icon: Navigation },
  { href: "/admin/spaces", label: "Espacios", desc: "Galería de proyectos", icon: Grid2x2 },
  { href: "/admin/catalog", label: "Catálogo", desc: "Texto y PDF descargable", icon: BookOpen },
  { href: "/admin/contact", label: "Contacto", desc: "Teléfonos, email y opciones del formulario", icon: Phone },
  { href: "/admin/footer", label: "Footer", desc: "Tagline y lista de servicios", icon: Layout },
  { href: "/admin/seo", label: "SEO", desc: "Título, descripción y palabras clave", icon: Search },
  { href: "/admin/media", label: "Medios", desc: "Subir y gestionar imágenes y PDFs", icon: Upload },
];
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v "admin/materials\|db/client" | grep "error TS" | head -10
```
Expected: 0 new errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/index.tsx
git commit -m "feat(admin): add Categories + Navegación to dashboard, rename Servicios → Ventas"
```

---

## Final steps

- [ ] **Run tests to confirm no regressions**

```bash
npx jest --passWithNoTests 2>&1 | tail -20
```
Expected: same baseline as main (58 passing, `hero.test.ts` and `login.test.ts` fail as before).

- [ ] **Full TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v "admin/materials\|db/client" | grep "error TS"
```
Expected: empty output (0 new errors).

- [ ] **Merge and push**

```bash
cd /Users/rubenely/Documentos/Proyectos/rivera
git merge feature/phase7-qa-polish --no-ff -m "feat: Phase 7 — QA & admin polish"
git push origin main
git worktree remove .worktrees/phase7-qa
git branch -d feature/phase7-qa-polish
```
