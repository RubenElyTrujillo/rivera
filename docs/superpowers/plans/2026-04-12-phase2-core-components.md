# Phase 2 — Core Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the WhatsApp FAB (global, context-aware) and PageBuilder (renders dynamic home sections from DB) — the two highest-impact changes that unlock the full site rebuild.

**Architecture:** `useWhatsApp` hook generates context-aware WA URLs; `WhatsAppFAB` renders globally via `_app.tsx` using `pageProps.whatsappPhone`; `PageBuilder` maps `IPageSection[]` (from DB) to React section components, replacing the hardcoded section list in `index.tsx`.

**Tech Stack:** Next.js 14 Pages Router, TypeScript, Tailwind CSS, Framer Motion (`motion/react-client`), Lucide React, Prisma 7

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/hooks/useWhatsApp.ts` | Create | Generate context-aware WhatsApp URL |
| `src/__tests__/hooks/useWhatsApp.test.ts` | Create | Unit tests for the hook |
| `src/components/ui/WhatsAppFAB.tsx` | Create | Fixed green WA button, tooltip |
| `src/pages/_app.tsx` | Modify | Render FAB globally on non-admin pages |
| `src/pages/index.tsx` | Modify | Pass whatsappPhone to pageProps |
| `src/pages/materiales/[id].tsx` | Modify | Pass whatsappPhone + context to pageProps |
| `src/components/PageBuilder.tsx` | Create | Map IPageSection[] → section components |
| `src/pages/index.tsx` | Modify (2nd pass) | Load pageSections + use PageBuilder |

---

## Task 1: `useWhatsApp` hook

**Files:**
- Create: `src/hooks/useWhatsApp.ts`
- Create: `src/__tests__/hooks/useWhatsApp.test.ts`

- [ ] **Step 1.1: Create the hook**

Create `src/hooks/useWhatsApp.ts`:

```typescript
export interface WhatsAppContext {
  material?: string
  collection?: string
  product?: string
  code?: string
}

/**
 * Generates a WhatsApp deeplink URL with an optional context message.
 *
 * @param phone  - E.164 without '+', e.g. "525629671869"
 * @param context - Optional product context to pre-fill the message
 * @returns { url } — ready-to-use `https://wa.me/...` URL
 */
export function useWhatsApp(phone: string, context?: WhatsAppContext) {
  const message = buildMessage(context)
  const encoded = encodeURIComponent(message)
  const url = phone ? `https://wa.me/${phone}?text=${encoded}` : "#"
  return { url }
}

function buildMessage(context?: WhatsAppContext): string {
  if (!context) return "Hola, me gustaría obtener más información. ¿Me pueden ayudar?"

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

- [ ] **Step 1.2: Write the tests**

Create `src/__tests__/hooks/useWhatsApp.test.ts`:

```typescript
import { useWhatsApp } from "@/hooks/useWhatsApp"

describe("useWhatsApp", () => {
  const PHONE = "525629671869"

  it("returns a wa.me URL with the phone number", () => {
    const { url } = useWhatsApp(PHONE)
    expect(url).toContain("https://wa.me/525629671869")
  })

  it("encodes a generic message when no context given", () => {
    const { url } = useWhatsApp(PHONE)
    expect(url).toContain("text=")
    expect(url).toContain("informaci%C3%B3n")
  })

  it("builds material-only message", () => {
    const { url } = useWhatsApp(PHONE, { material: "Pisos Laminados" })
    expect(url).toContain("Pisos%20Laminados")
    expect(url).toContain("informaci%C3%B3n")
  })

  it("builds material+collection message", () => {
    const { url } = useWhatsApp(PHONE, { material: "Pisos Laminados", collection: "Splash!" })
    expect(url).toContain("Pisos%20Laminados")
    expect(url).toContain("Splash!")
    expect(url).toContain("disponibilidad")
  })

  it("builds product message with code", () => {
    const { url } = useWhatsApp(PHONE, {
      material: "Pisos Laminados",
      collection: "Splash!",
      product: "Clásico",
      code: "SPLASH-CL-01",
    })
    expect(url).toContain("Cl%C3%A1sico")
    expect(url).toContain("SPLASH-CL-01")
    expect(url).toContain("Pisos%20Laminados")
  })

  it("returns '#' when phone is empty", () => {
    const { url } = useWhatsApp("")
    expect(url).toBe("#")
  })
})
```

- [ ] **Step 1.3: Run tests**

```bash
cd /path/to/worktree && npx jest useWhatsApp 2>&1 | tail -10
```
Expected: 6 passing, 0 failing

- [ ] **Step 1.4: Commit**

```bash
git add src/hooks/useWhatsApp.ts src/__tests__/hooks/useWhatsApp.test.ts
git commit -m "feat(whatsapp): add useWhatsApp hook with context-aware message builder"
```

---

## Task 2: `WhatsAppFAB` component

**Files:**
- Create: `src/components/ui/WhatsAppFAB.tsx`

- [ ] **Step 2.1: Create the component**

Create `src/components/ui/WhatsAppFAB.tsx`:

```typescript
import { useWhatsApp } from "@/hooks/useWhatsApp"
import type { WhatsAppContext } from "@/hooks/useWhatsApp"

interface WhatsAppFABProps {
  phone: string
  context?: WhatsAppContext
}

/**
 * Floating WhatsApp button fixed to the right edge of the screen
 * at vertical center. Only renders when phone is non-empty.
 */
export default function WhatsAppFAB({ phone, context }: WhatsAppFABProps) {
  const { url } = useWhatsApp(phone, context)

  if (!phone) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Cotizar por WhatsApp"
      className="
        fixed right-5 top-1/2 -translate-y-1/2 z-50
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-[#25D366] hover:bg-[#1ebe5d]
        shadow-lg hover:shadow-[0_4px_20px_rgba(37,211,102,0.5)]
        transition-all duration-300
        group
      "
    >
      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        className="w-7 h-7"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.126 1.533 5.862L.057 23.997l6.305-1.653A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-4.998-1.366l-.358-.213-3.742.981.999-3.648-.234-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z" />
      </svg>

      {/* Tooltip */}
      <span
        className="
          absolute right-16 whitespace-nowrap
          bg-foreground text-background
          text-xs font-semibold tracking-wide
          px-3 py-1.5
          opacity-0 group-hover:opacity-100
          translate-x-2 group-hover:translate-x-0
          transition-all duration-200
          pointer-events-none
        "
      >
        ¡Cotiza por WhatsApp!
      </span>
    </a>
  )
}
```

- [ ] **Step 2.2: Run TypeScript check**

```bash
cd /path/to/worktree && npx tsc --noEmit 2>&1 | head -10
```
Expected: 0 errors

- [ ] **Step 2.3: Commit**

```bash
git add src/components/ui/WhatsAppFAB.tsx
git commit -m "feat(whatsapp): add WhatsAppFAB floating button component"
```

---

## Task 3: Wire WhatsAppFAB globally

Pages pass `whatsappPhone` and optional `whatsappContext` in their `getServerSideProps` props. `_app.tsx` reads them from `pageProps` and renders the FAB.

**Files:**
- Modify: `src/pages/_app.tsx`
- Modify: `src/pages/index.tsx`
- Modify: `src/pages/materiales/[id].tsx`

- [ ] **Step 3.1: Update `_app.tsx` to render FAB**

Replace the full content of `src/pages/_app.tsx` with:

```typescript
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import type { WhatsAppContext } from "@/hooks/useWhatsApp";
import "@/styles/globals.css";

const WhatsAppFAB = dynamic(() => import("@/components/ui/WhatsAppFAB"), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin");
  const isLogin = router.pathname === "/admin/login";
  const isGallery = router.pathname.startsWith("/materiales");

  const whatsappPhone: string = (pageProps.whatsappPhone as string) ?? "";
  const whatsappContext: WhatsAppContext | undefined = pageProps.whatsappContext as WhatsAppContext | undefined;

  if (isAdmin && !isLogin) {
    return (
      <AdminLayout>
        <div key={router.pathname} className="admin-page-transition">
          <Component {...pageProps} />
        </div>
      </AdminLayout>
    );
  }

  if (isGallery) {
    return (
      <>
        <Component {...pageProps} />
        <WhatsAppFAB phone={whatsappPhone} context={whatsappContext} />
      </>
    );
  }

  return (
    <MainLayout>
      <Component {...pageProps} />
      <WhatsAppFAB phone={whatsappPhone} context={whatsappContext} />
    </MainLayout>
  );
}
```

- [ ] **Step 3.2: Update `index.tsx` getServerSideProps to expose whatsappPhone**

In `src/pages/index.tsx`, update the `getServerSideProps` return to include `whatsappPhone`.

Update the return type signature:
```typescript
export const getServerSideProps: GetServerSideProps<{
  pageData: IPageData;
  siteConfig: ISiteConfig;
  spaceCategories: ISpaceCategory[];
  featuredProjects: ISpaceProject[];
  whatsappPhone: string;
}> = async () => {
```

Update the `return { props: ... }` at the end of `getServerSideProps`:
```typescript
  return {
    props: {
      pageData,
      siteConfig,
      spaceCategories,
      featuredProjects: allProjects.slice(0, 4),
      whatsappPhone: contact?.whatsappPhone ?? "",
    },
  };
```

Update the `Home` component props type to include `whatsappPhone`:
```typescript
export default function Home({
  pageData,
  siteConfig,
  spaceCategories,
  featuredProjects,
  whatsappPhone: _wp,
}: {
  pageData: IPageData;
  siteConfig: ISiteConfig;
  spaceCategories: ISpaceCategory[];
  featuredProjects: ISpaceProject[];
  whatsappPhone: string;
}) {
```

(The `_wp` prefix is intentional — the FAB reads it from `pageProps` in `_app.tsx`, not directly in the component.)

- [ ] **Step 3.3: Update `materiales/[id].tsx` to pass phone + context**

At the top of `src/pages/materiales/[id].tsx`, verify `db` is imported. If it uses only `materialRepository`, add:
```typescript
import { db } from "@/lib/db";
```

Update `Props` interface:
```typescript
interface Props {
    material: IMaterial;
    siteUrl: string;
    whatsappPhone: string;
    whatsappContext: { material: string };
}
```

In `getServerSideProps`, for the numeric-ID branch — after `const material = await materialRepository.findById(numId)`, add a contact fetch and update the return:
```typescript
        const contact = await db.contactInfo.findFirst();
        return {
            props: {
                material,
                siteUrl,
                whatsappPhone: contact?.whatsappPhone ?? "",
                whatsappContext: { material: material.name },
            },
        };
```

For the static-data (string slug) branch, before `return { props: ... }`, add:
```typescript
    const contact = await db.contactInfo.findFirst();
    return {
        props: {
            material,
            siteUrl,
            whatsappPhone: contact?.whatsappPhone ?? "",
            whatsappContext: { material: material.name },
        },
    };
```

Update the component signature to include (but ignore) the new props:
```typescript
export default function MaterialGallery({
    material,
    siteUrl,
    whatsappPhone: _wp,
    whatsappContext: _wc,
}: Props) {
```

- [ ] **Step 3.4: TypeScript check + tests**

```bash
cd /path/to/worktree && npx tsc --noEmit 2>&1 | head -20
npx jest 2>&1 | tail -10
```
Expected: 0 TS errors, all previously-passing tests still pass

- [ ] **Step 3.5: Commit**

```bash
git add src/pages/_app.tsx src/pages/index.tsx "src/pages/materiales/[id].tsx"
git commit -m "feat(whatsapp): wire WhatsAppFAB globally via pageProps.whatsappPhone pattern"
```

---

## Task 4: `PageBuilder` component

**Files:**
- Create: `src/components/PageBuilder.tsx`

- [ ] **Step 4.1: Create `PageBuilder.tsx`**

Create `src/components/PageBuilder.tsx`:

```typescript
import type { IPageSection, IPageData, ISpaceCategory, ISpaceProject } from "@/domain/types";
import type { ISiteConfig } from "@/repositories/siteConfig.repository";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ShowroomSection from "@/components/sections/ShowroomSection";
import FeaturedProjectsSection from "@/components/sections/FeaturedProjectsSection";
import CTASection from "@/components/sections/CTASection";
import SpacesSection from "@/components/sections/SpacesSection";
import CatalogSection from "@/components/sections/CatalogSection";
import ContactSection from "@/components/sections/ContactSection";

const TEXTURE_IMAGE = "/images/806a852e2_generated_7961075f.png";

export interface PageBuilderData {
  pageData: IPageData;
  siteConfig: ISiteConfig;
  spaceCategories: ISpaceCategory[];
  featuredProjects: ISpaceProject[];
  heroImageUrl: string;
}

interface PageBuilderProps {
  sections: IPageSection[];
  data: PageBuilderData;
}

/**
 * Renders the home page by mapping each PageSection record to
 * the appropriate section component in order.
 * Unknown section types are silently skipped.
 */
export default function PageBuilder({ sections, data }: PageBuilderProps) {
  const { pageData, siteConfig, spaceCategories, featuredProjects, heroImageUrl } = data;
  const { hero, services, materials, catalog, contact } = pageData;

  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case "HERO":
            return (
              <HeroSection
                key={section.id}
                heroImage={heroImageUrl}
                content={hero}
              />
            );
          case "VENTAS":
            return <ServicesSection key={section.id} services={services} />;
          case "SHOWROOM":
            return siteConfig.showShowroom ? (
              <ShowroomSection key={section.id} materials={materials} />
            ) : null;
          case "SPACES":
            return (
              <SpacesSection key={section.id} categories={spaceCategories} />
            );
          case "CATALOG":
            return (
              <CatalogSection
                key={section.id}
                textureImage={TEXTURE_IMAGE}
                content={catalog}
              />
            );
          case "CONTACT":
            return <ContactSection key={section.id} contact={contact} />;
          case "CTA":
            return (
              <CTASection
                key={section.id}
                whatsappPhone={contact.whatsappPhone}
              />
            );
          case "FEATURED":
            return (
              <FeaturedProjectsSection
                key={section.id}
                projects={featuredProjects}
                categories={spaceCategories}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
```

- [ ] **Step 4.2: TypeScript check**

```bash
cd /path/to/worktree && npx tsc --noEmit 2>&1 | head -20
```
Expected: 0 errors. If any section component prop type mismatches, fix them in this step (e.g., `ShowroomSection` may import as `ProductsSection` alias — check exact export name from the file).

- [ ] **Step 4.3: Commit**

```bash
git add src/components/PageBuilder.tsx
git commit -m "feat(pagebuilder): add PageBuilder component mapping PageSection types to components"
```

---

## Task 5: Wire PageBuilder into `index.tsx`

**Files:**
- Modify: `src/pages/index.tsx`

- [ ] **Step 5.1: Add imports to `index.tsx`**

Add to the imports at the top of `src/pages/index.tsx`:

```typescript
import PageBuilder, { type PageBuilderData } from "@/components/PageBuilder";
import { pageSectionRepository } from "@/repositories/pageSection.repository";
import type { IPageSection } from "@/domain/types";
```

- [ ] **Step 5.2: Load pageSections in `getServerSideProps`**

In the `Promise.all` array, add `pageSectionRepository.findVisible()` at the end:

```typescript
  const [
    hero, services, materials, catalog, contact, footer, seo,
    siteConfig, spaceCategories, allProjects, pageSections
  ] = await Promise.all([
    db.heroContent.findFirst(),
    db.service.findMany({ orderBy: { order: "asc" } }),
    db.material.findMany({ orderBy: { order: "asc" }, include: { finishes: { orderBy: { order: "asc" } } } }),
    db.catalogContent.findFirst(),
    db.contactInfo.findFirst(),
    db.footerContent.findFirst(),
    db.seoSettings.findFirst(),
    siteConfigRepository.get(),
    spaceCategoryRepository.findAll(),
    spaceRepository.findAll(),
    pageSectionRepository.findVisible(),
  ]);
```

Update the `getServerSideProps` return type:
```typescript
export const getServerSideProps: GetServerSideProps<{
  pageData: IPageData;
  siteConfig: ISiteConfig;
  spaceCategories: ISpaceCategory[];
  featuredProjects: ISpaceProject[];
  pageSections: IPageSection[];
  whatsappPhone: string;
}> = async () => {
```

Update `return { props: ... }`:
```typescript
  return {
    props: {
      pageData,
      siteConfig,
      spaceCategories,
      featuredProjects: allProjects.slice(0, 4),
      pageSections: pageSections as unknown as IPageSection[],
      whatsappPhone: contact?.whatsappPhone ?? "",
    },
  };
```

- [ ] **Step 5.3: Update `Home` component to use PageBuilder**

Update props type in the `Home` component:
```typescript
export default function Home({
  pageData,
  siteConfig,
  spaceCategories,
  featuredProjects,
  pageSections,
  whatsappPhone: _wp,
}: {
  pageData: IPageData;
  siteConfig: ISiteConfig;
  spaceCategories: ISpaceCategory[];
  featuredProjects: ISpaceProject[];
  pageSections: IPageSection[];
  whatsappPhone: string;
}) {
```

Inside the JSX return, replace the hardcoded section calls (from `<HeroSection>` through `<FooterSection>`) with:

```tsx
      {pageSections.length > 0 ? (
        <PageBuilder
          sections={pageSections}
          data={{
            pageData,
            siteConfig,
            spaceCategories,
            featuredProjects,
            heroImageUrl,
          } satisfies PageBuilderData}
        />
      ) : (
        /* Fallback: hardcoded order when DB has no PageSection records */
        <>
          <HeroSection heroImage={heroImageUrl} content={hero} />
          {siteConfig.showShowroom && <ProductsSection materials={materials} />}
          <ServicesSection services={services} />
          <FeaturedProjectsSection projects={featuredProjects} categories={spaceCategories} />
          <CTASection whatsappPhone={contact.whatsappPhone} />
          <SpacesSection categories={spaceCategories} />
          <CatalogSection textureImage={IMAGES.texture} content={catalog} />
          <ContactSection contact={contact} />
        </>
      )}
      <FooterSection contact={contact} footer={footer} />
```

Note: `FooterSection` is always rendered outside `PageBuilder` because it stays last regardless of section order. Verify `ProductsSection` is still imported (it's the alias for `ShowroomSection`).

- [ ] **Step 5.4: TypeScript check**

```bash
cd /path/to/worktree && npx tsc --noEmit 2>&1 | head -30
```
Expected: 0 errors.

- [ ] **Step 5.5: Run full test suite**

```bash
cd /path/to/worktree && npx jest 2>&1 | tail -10
```
Expected: All previously-passing tests still pass.

- [ ] **Step 5.6: Commit**

```bash
git add src/pages/index.tsx
git commit -m "feat(pagebuilder): wire PageBuilder into index.tsx with DB-driven section order

- Load pageSections from pageSectionRepository.findVisible()
- PageBuilder renders sections in DB order when records exist
- Fallback to hardcoded order when DB has no PageSection records yet
- FooterSection always rendered last, outside PageBuilder"
```

---

## Self-Review

**Spec coverage:**
- ✅ Change 7 (WhatsApp FAB right side, 50% height): `WhatsAppFAB` with `fixed right-5 top-1/2 -translate-y-1/2`
- ✅ Change 8 (message with material context): `useWhatsApp` builds context-aware messages per page
- ✅ PageBuilder: renders `IPageSection[]` from DB in order
- ⬜ Change 1 (Hero carousel): Phase 3 — `HERO` type already wired in PageBuilder
- ⬜ Change 2 (Ventas rename id): Phase 6 (trivial)
- ⬜ DynamicNav: Phase 5
- ⬜ Gallery hover, fichas técnicas, ¿Qué es X?, /categorias/[slug]: Phase 4

**Type consistency:**
- `WhatsAppContext` exported from `useWhatsApp.ts`, imported in `WhatsAppFAB.tsx` and `_app.tsx` ✅
- `PageBuilderData` exported from `PageBuilder.tsx`, used via `satisfies` in `index.tsx` ✅
- `pageSectionRepository.findVisible()` → `IPageSection[]` (from Phase 1 repo) ✅
- `ShowroomSection` — verify the export name in `src/components/sections/ShowroomSection.tsx` and match it in `PageBuilder.tsx` ✅

**Placeholders:** None.
