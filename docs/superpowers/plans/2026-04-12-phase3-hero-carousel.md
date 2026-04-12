# Phase 3 — Hero Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static `HeroSection` with a full-screen auto-playing carousel that reads slide data from `PageSection.config` JSON and falls back gracefully to the legacy single-image mode.

**Architecture:** `IHeroSlide` type defines one slide's content; `HeroCarousel` handles all animation/autoplay logic (Framer Motion + `useState`/`useEffect`); `HeroSection` delegates to `HeroCarousel` when slides are present and retains backward-compatible single-image mode; `PageBuilder` parses `section.config` JSON for the `HERO` type and forwards `slides`+`autoPlayMs`; seed is updated with real slide data.

**Tech Stack:** Next.js 14 Pages Router, TypeScript, Framer Motion v12 (`motion/react-client` + `motion/react` for `AnimatePresence`), Tailwind CSS, Lucide React (`ChevronLeft`, `ChevronRight`)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/domain/types/heroSlide.ts` | Create | `IHeroSlide` interface + `HeroPageConfig` type |
| `src/domain/types/index.ts` | Modify | Barrel-export `IHeroSlide`, `HeroPageConfig` |
| `src/components/sections/HeroCarousel.tsx` | Create | Carousel logic: auto-play, dots, prev/next, Framer Motion transitions |
| `src/components/sections/HeroSection.tsx` | Modify | Detect `slides` prop → delegate to `HeroCarousel`; update text size + vertical centering |
| `src/components/PageBuilder.tsx` | Modify | Parse `section.config` JSON for `HERO` type, pass `slides`+`autoPlayMs` |
| `prisma/seed.ts` | Modify | Update HERO `PageSection.config` with 3 real slides |

---

## Task 1: `IHeroSlide` type + barrel export

**Files:**
- Create: `src/domain/types/heroSlide.ts`
- Modify: `src/domain/types/index.ts`

- [ ] **Step 1.1: Create the type file**

Create `src/domain/types/heroSlide.ts`:

```typescript
/**
 * A single slide in the hero carousel.
 * Stored as JSON array inside `PageSection.config` for type=HERO.
 */
export interface IHeroSlide {
  titleLine1: string
  titleLine2: string
  subtitle: string
  description: string
  imageUrl: string
}

/**
 * Shape of the JSON parsed from PageSection.config when type = "HERO".
 */
export interface HeroPageConfig {
  slides: IHeroSlide[]
  autoPlayMs?: number
}
```

- [ ] **Step 1.2: Add barrel export to `src/domain/types/index.ts`**

Open `src/domain/types/index.ts`. Find the existing export block and add:

```typescript
export type { IHeroSlide, HeroPageConfig } from "./heroSlide";
```

Place it near the other hero-related export:
```typescript
export type { IHeroContent } from "./hero";
export type { IHeroSlide, HeroPageConfig } from "./heroSlide";  // ← add this line
```

- [ ] **Step 1.3: TypeScript check**

```bash
cd /path/to/worktree && npx tsc --noEmit 2>&1 | grep heroSlide
```
Expected: 0 errors

- [ ] **Step 1.4: Commit**

```bash
git add src/domain/types/heroSlide.ts src/domain/types/index.ts
git commit -m "feat(hero): add IHeroSlide and HeroPageConfig types"
```

---

## Task 2: `HeroCarousel` component

**Files:**
- Create: `src/components/sections/HeroCarousel.tsx`

This component is self-contained: it receives a `slides` array + optional `autoPlayMs`, and renders a full-screen carousel with Framer Motion.

- [ ] **Step 2.1: Create the component**

Create `src/components/sections/HeroCarousel.tsx`:

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { IHeroSlide } from "@/domain/types";

interface HeroCarouselProps {
  slides: IHeroSlide[]
  autoPlayMs?: number
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

/**
 * Full-screen hero carousel with auto-play, directional slide transitions,
 * dot indicators, and prev/next arrow controls.
 */
export default function HeroCarousel({ slides, autoPlayMs = 5000 }: HeroCarouselProps) {
  const [[activeIndex, direction], setSlide] = useState([0, 0]);

  const paginate = useCallback((newDirection: number) => {
    setSlide(([current]) => {
      const next = (current + newDirection + slides.length) % slides.length;
      return [next, newDirection];
    });
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => paginate(1), autoPlayMs);
    return () => clearInterval(timer);
  }, [paginate, autoPlayMs, slides.length]);

  const slide = slides[activeIndex];
  if (!slide) return null;

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Slide images */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.imageUrl}
            alt=""
            fill
            priority={activeIndex === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/10 to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* Text content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`text-${activeIndex}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 h-full flex flex-col justify-center px-8 md:px-20"
        >
          <p className="text-white/90 text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium">
            {slide.subtitle}
          </p>
          <h1 className="text-white text-8xl md:text-[7rem] lg:text-[9rem] font-bold leading-[0.9] tracking-tight max-w-4xl">
            {slide.titleLine1}
            <br />
            <span className="text-amber-700">{slide.titleLine2}</span>
          </h1>
          <p className="text-white/90 text-base md:text-lg mt-6 max-w-lg font-light leading-relaxed">
            {slide.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            aria-label="Slide anterior"
            className="
              absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20
              w-11 h-11 rounded-full
              bg-white/10 hover:bg-white/25 backdrop-blur-sm
              flex items-center justify-center
              transition-colors duration-200
            "
          >
            <ChevronLeft className="text-white w-6 h-6" />
          </button>
          <button
            onClick={() => paginate(1)}
            aria-label="Slide siguiente"
            className="
              absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20
              w-11 h-11 rounded-full
              bg-white/10 hover:bg-white/25 backdrop-blur-sm
              flex items-center justify-center
              transition-colors duration-200
            "
          >
            <ChevronRight className="text-white w-6 h-6" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide([i, i > activeIndex ? 1 : -1])}
              aria-label={`Ir al slide ${i + 1}`}
              className={`
                h-1.5 rounded-full transition-all duration-300
                ${i === activeIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/70"
                }
              `}
            />
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2.2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -i carousel
```
Expected: 0 errors

- [ ] **Step 2.3: Commit**

```bash
git add src/components/sections/HeroCarousel.tsx
git commit -m "feat(hero): add HeroCarousel component with auto-play, arrows, dot indicators"
```

---

## Task 3: Update `HeroSection` — delegate to carousel + style improvements

**Files:**
- Modify: `src/components/sections/HeroSection.tsx`

The updated `HeroSection`:
- Accepts an optional `slides?: IHeroSlide[]` and `autoPlayMs?: number` prop
- When `slides` is non-empty → renders `<HeroCarousel slides={slides} autoPlayMs={autoPlayMs} />`
- When no slides → renders the legacy single-image layout with updated text styles (larger text, higher white opacity, vertically centered)

- [ ] **Step 3.1: Replace `HeroSection.tsx`**

Replace the full content of `src/components/sections/HeroSection.tsx`:

```typescript
import Image from "next/image";
import * as motion from "motion/react-client";
import type { IHeroContent, IHeroSlide } from "@/domain/types";
import HeroCarousel from "./HeroCarousel";

interface HeroSectionProps {
  heroImage: string
  content?: IHeroContent | null
  slides?: IHeroSlide[]
  autoPlayMs?: number
}

/**
 * Hero section with two modes:
 * - Carousel mode: when `slides` array is non-empty, renders `HeroCarousel`
 * - Legacy mode: single static image with animated text (uses `content` + `heroImage`)
 */
const HeroSection = ({ heroImage, content, slides, autoPlayMs }: HeroSectionProps) => {
  // Carousel mode
  if (slides && slides.length > 0) {
    return <HeroCarousel slides={slides} autoPlayMs={autoPlayMs} />;
  }

  // Legacy single-image mode
  const subtitle = content?.subtitle ?? "Soluciones integrales en acabados";
  const titleLine1 = content?.titleLine1 ?? "SUPERFICIES";
  const titleLine2 = content?.titleLine2 ?? "SIN LÍMITE";
  const description = content?.description ?? "Transformamos la base de sus espacios con el catálogo más completo en pisos, muros y acabados de alta gama.";
  const image = content?.imageUrl ?? heroImage;

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden p-2.5">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/10 to-black/60" />
      </div>
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-20">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-white/90 text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium">
            {subtitle}
          </p>
          <h1 className="text-white text-8xl md:text-[7rem] lg:text-[9rem] font-bold leading-[0.9] tracking-tight max-w-4xl">
            {titleLine1}
            <br />
            <span className="text-amber-700">{titleLine2}</span>
          </h1>
          <p className="text-white/90 text-base md:text-lg mt-6 max-w-lg font-light leading-relaxed">
            {description}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
```

- [ ] **Step 3.2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -i hero
```
Expected: 0 errors

- [ ] **Step 3.3: Run tests**

```bash
npx jest 2>&1 | tail -6
```
Expected: same passing count as baseline

- [ ] **Step 3.4: Commit**

```bash
git add src/components/sections/HeroSection.tsx
git commit -m "feat(hero): update HeroSection — carousel mode + larger text + vertical centering"
```

---

## Task 4: Update `PageBuilder` — parse HERO config and pass slides

**Files:**
- Modify: `src/components/PageBuilder.tsx`

When `section.type === "HERO"`, parse `section.config` as `HeroPageConfig` JSON and forward `slides` + `autoPlayMs` to `HeroSection`.

- [ ] **Step 4.1: Add import and update HERO case**

In `src/components/PageBuilder.tsx`, add the import at the top:

```typescript
import type { HeroPageConfig } from "@/domain/types";
```

Then update the `"HERO"` case in the switch statement from:

```typescript
          case "HERO":
            return (
              <HeroSection
                key={section.id}
                heroImage={heroImageUrl}
                content={hero}
              />
            );
```

To:

```typescript
          case "HERO": {
            let heroConfig: HeroPageConfig | null = null;
            try {
              const parsed = JSON.parse(section.config) as HeroPageConfig;
              if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
                heroConfig = parsed;
              }
            } catch {
              // malformed config — fall back to legacy mode
            }
            return (
              <HeroSection
                key={section.id}
                heroImage={heroImageUrl}
                content={hero}
                slides={heroConfig?.slides}
                autoPlayMs={heroConfig?.autoPlayMs}
              />
            );
          }
```

- [ ] **Step 4.2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -i "pagebuilder\|heroConfig\|heroSection"
```
Expected: 0 errors

- [ ] **Step 4.3: Commit**

```bash
git add src/components/PageBuilder.tsx
git commit -m "feat(hero): PageBuilder parses HERO config JSON and forwards slides to HeroSection"
```

---

## Task 5: Update seed with real carousel slides

**Files:**
- Modify: `prisma/seed.ts`

Update the HERO `PageSection` to carry a real 3-slide config using existing images.

- [ ] **Step 5.1: Update the HERO seed entry**

In `prisma/seed.ts`, find the `PageSection` upsert/create block. The HERO entry currently has `config: "{}"`. Replace it with a real config:

```typescript
        {
          type: "HERO",
          order: 0,
          visible: true,
          config: JSON.stringify({
            slides: [
              {
                titleLine1: "SUPERFICIES",
                titleLine2: "SIN LÍMITE",
                subtitle: "Soluciones integrales en acabados",
                description: "Transformamos la base de sus espacios con el catálogo más completo en pisos, muros y acabados de alta gama.",
                imageUrl: "/images/5ab8b3a15_generated_f21e3e55.png",
              },
              {
                titleLine1: "PISOS",
                titleLine2: "DE CLASE MUNDIAL",
                subtitle: "Laminados · Vinílicos · Madera",
                description: "Desde pisos laminados Splash! hasta madera sólida de ingeniería — calidad y durabilidad para cada espacio.",
                imageUrl: "/images/7219abb30_generated_c7c0b4a0.png",
              },
              {
                titleLine1: "DECKS",
                titleLine2: "Y EXTERIORES",
                subtitle: "Resistentes al clima · Fácil instalación",
                description: "Deck sintético de alto desempeño para terrazas, jardines y zonas húmedas con garantía de 25 años.",
                imageUrl: "/images/fc7bd1af6_generated_345964df.png",
              },
            ],
            autoPlayMs: 5000,
          }),
        },
```

- [ ] **Step 5.2: TypeScript check**

```bash
npx tsc --noEmit --allowJs 2>&1 | grep seed | head -5
```
Expected: 0 errors

- [ ] **Step 5.3: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat(hero): update HERO PageSection seed with 3 real carousel slides"
```

---

## Self-Review

**Spec coverage:**
- ✅ Auto-play + configurable interval (`autoPlayMs`)
- ✅ Dots de navegación (click to jump to slide)
- ✅ Botones prev/next con flechas
- ✅ Texto más grande (`text-8xl md:text-[7rem] lg:text-[9rem]`)
- ✅ Textos blancos con mayor opacidad (`/60` → `/90`)
- ✅ Posición centrada vertically (`justify-center` vs old `justify-end pb-20`)
- ✅ Config via `PageSection.config` JSON — admin puede editar slides desde DB
- ✅ Backward compatible: si no hay slides → legacy single image mode
- ✅ Slides almacenados en `PageSection.config` como array JSON

**Placeholder scan:** None found.

**Type consistency:**
- `IHeroSlide` defined in T1, used in T2 (`HeroCarousel` props) and T3 (`HeroSection` props) ✅
- `HeroPageConfig` defined in T1, used in T4 (`PageBuilder` JSON parse) ✅
- `slides?: IHeroSlide[]` optional in `HeroSection`, matches `HeroCarousel` required prop (guarded by `slides.length > 0`) ✅
- `section.config` is `string` (PageSection) → parsed with `JSON.parse` in PageBuilder ✅
