# Diseño: Páginas propias + Link en servicios

**Fecha:** 2026-04-17
**Estado:** Aprobado — listo para plan de implementación

## Problema

El cliente necesita crear páginas de contenido propias (tipo "Nosotros", "Garantía", "Aviso de privacidad") sin intervención técnica. Adicionalmente, el módulo de **Ventas** (Service) debe permitir dirigir a los visitantes a un destino configurable desde cada tarjeta — incluyendo las nuevas páginas propias.

## Alcance

### Dentro de alcance

- Creación, edición, publicación y borrado de páginas propias desde el admin
- Editor de páginas basado en **bloques prefabricados** (no drag-and-drop libre tipo Elementor)
- Catálogo inicial de 8 tipos de bloque: `HERO`, `TEXT`, `TEXT_IMAGE`, `GALLERY`, `QUOTE`, `CTA`, `SPACER`, `VIDEO`
- Reordenamiento de bloques por drag-and-drop
- SEO por página (title, description, og:image)
- Ruta pública `/p/[slug]`
- Estado publicado/borrador (borradores devuelven 404)
- Campo `link` en Service con 3 modos: ninguno, interno (picker), externo (URL libre)
- Selector de link reutilizable `<LinkPicker>` para Service, CTA block y donde haga falta

### Fuera de alcance

- Versionado / historial de páginas
- Preview en tiempo real mientras edita
- Autoguardado por bloque
- Undo / redo
- Duplicar página o bloque
- Animaciones personalizables en bloques
- Bloques condicionales o lógica
- Aparición automática en el menú de navegación (los enlaces son manuales desde Ventas/NavItems/Footer)

## Arquitectura

### Modelo de datos

**Nuevo modelo `Pagina`:**

```prisma
model Pagina {
  id              String         @id @default(cuid())
  title           String
  slug            String         @unique
  published       Boolean        @default(false)
  seoTitle        String?
  seoDescription  String?
  ogImage         String?
  bloques         PaginaBloque[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
```

**Nuevo modelo `PaginaBloque`** (mismo patrón que `PageSection`):

```prisma
model PaginaBloque {
  id        String   @id @default(cuid())
  paginaId  String
  pagina    Pagina   @relation(fields: [paginaId], references: [id], onDelete: Cascade)
  order     Int
  type      String   // HERO | TEXT | TEXT_IMAGE | GALLERY | QUOTE | CTA | SPACER | VIDEO
  config    String   // JSON string con los datos del bloque
  visible   Boolean  @default(true)

  @@index([paginaId, order])
}
```

**Modificación a `Service`** (no rompe lo existente):

```prisma
// agregar a model Service:
linkType  String   @default("none")   // "none" | "internal" | "external"
linkHref  String?
```

### Estructura de `config` por tipo de bloque

Cada bloque guarda su configuración como JSON en `config`. Las formas son:

- **HERO:** `{ imageUrl: string, title: string, subtitle?: string, height: "sm" | "md" | "lg" }`
- **TEXT:** `{ html: string }` — HTML generado por TipTap
- **TEXT_IMAGE:** `{ imageUrl: string, imageSide: "left" | "right", title?: string, html: string }`
- **GALLERY:** `{ images: string[], columns: 2 | 3 | 4 }`
- **QUOTE:** `{ text: string, author?: string, role?: string }`
- **CTA:** `{ title: string, buttonText: string, linkType: "internal" | "external", linkHref: string, style: "primary" | "secondary" }`
- **SPACER:** `{ size: "sm" | "md" | "lg" }`
- **VIDEO:** `{ url: string, caption?: string }` — YouTube o Vimeo

Las formas se validan con Zod en cada API endpoint y en el form del bloque.

### Rutas

**Admin:**

- `GET /admin/paginas` — tabla con todas las páginas
- `GET /admin/paginas/nueva` — formulario de creación
- `GET /admin/paginas/[id]` — editor de bloques de la página

**API:**

- `GET/POST /api/content/paginas` — listar + crear
- `GET/PUT/DELETE /api/content/paginas/[id]` — CRUD de una página (campos básicos + SEO)
- `GET/POST /api/content/paginas/[id]/bloques` — listar + crear bloque
- `PUT/DELETE /api/content/paginas/[id]/bloques/[bloqueId]` — actualizar/eliminar bloque
- `PUT /api/content/paginas/[id]/bloques/reorder` — guardar nuevo orden (array de IDs)
- `GET /api/admin/link-targets` — lista plana de destinos internos (páginas publicadas, categorías, subcategorías, anchors de home)

**Público:**

- `GET /p/[slug]` — renderiza la página pública (404 si no existe o `published=false`)

### Frontend público

Un componente `<PaginaRenderer blocks={blocks} />` mapea `type` → componente de bloque. Cada bloque vive en `src/components/blocks/` (un archivo por tipo, aislado y testeable).

**Bloques:**

- `src/components/blocks/HeroBlock.tsx`
- `src/components/blocks/TextBlock.tsx`
- `src/components/blocks/TextImageBlock.tsx`
- `src/components/blocks/GalleryBlock.tsx`
- `src/components/blocks/QuoteBlock.tsx`
- `src/components/blocks/CtaBlock.tsx`
- `src/components/blocks/SpacerBlock.tsx`
- `src/components/blocks/VideoBlock.tsx`

**SEO:** `<Head>` de Next se llena con `seoTitle` y `seoDescription` de la página. Si están vacíos, cae al default del sitio (`SeoSettings`).

### Admin: editor de bloques

- Arriba: acordeón colapsable con campos básicos de la página (título, slug, publicado, SEO).
- Columna central: lista vertical de bloques. Cada tarjeta muestra tipo del bloque, preview corto del contenido, drag handle para reordenar, botón "Editar" (abre panel lateral), toggle visible, botón eliminar.
- Botón flotante "+ Agregar bloque" abre un menú con los 8 tipos disponibles.
- **Guardado:** botón "Guardar todo" al pie — guarda página + bloques en una sola transacción. No hay autoguardado en este alcance.

### LinkPicker reutilizable

Componente `<LinkPicker value onChange>`:

```ts
type LinkValue =
  | { type: "none" }
  | { type: "internal"; href: string }
  | { type: "external"; href: string };
```

UI:
1. Radio "Sin enlace / Página interna / URL externa"
2. Si interna: dropdown con las opciones devueltas por `/api/admin/link-targets`
3. Si externa: input de URL libre

Lo usa: `/admin/services`, editor del bloque CTA, y cualquier otro form futuro.

### Editor de texto rico

**TipTap** para bloques `TEXT` y `TEXT_IMAGE`. Extensiones: bold, italic, underline, heading (h2, h3), bulletList, orderedList, link, image (via media picker). Output: HTML string, sanitizado del lado del servidor antes de guardar.

## Flujo del cliente (éxito)

1. Cliente entra a `/admin/paginas`, da click "+ Nueva página"
2. Llena título "Nosotros" → slug autogenerado `nosotros`
3. Guarda — llega al editor de bloques vacío
4. Agrega HERO, TEXT, GALLERY, CTA — edita contenido de cada uno
5. Reordena con drag si hace falta
6. Marca como publicada, da "Guardar todo"
7. Visita `/p/nosotros` — la ve igual que el cliente final
8. Va a `/admin/services`, edita una tarjeta, selecciona "Página interna" → "Nosotros" en el dropdown
9. Guarda — la tarjeta del home ahora lleva a `/p/nosotros`

## Migración

- Archivo SQL manual: `prisma/migrations/YYYYMMDDHHMMSS_paginas_propias/migration.sql`
  - `CREATE TABLE "Pagina" (...)`
  - `CREATE TABLE "PaginaBloque" (...)`
  - `CREATE INDEX "PaginaBloque_paginaId_order_idx" ON "PaginaBloque"("paginaId", "order")`
  - `ALTER TABLE "Service" ADD COLUMN "linkType" TEXT NOT NULL DEFAULT 'none'`
  - `ALTER TABLE "Service" ADD COLUMN "linkHref" TEXT`
- Actualizar `prisma/seed.ts`: no requiere seed inicial de páginas (el cliente las crea).

## Testing

- **Unit:** schemas de Zod para cada tipo de bloque (forma del `config`)
- **Integración:** API CRUD de Pagina + PaginaBloque (happy path + 404 + validación)
- **E2E (manual, documentado en checkpoint):** flujo completo de crear página → agregar bloques → publicar → ver en `/p/slug` → enlazar desde Service

## Precedencia de rutas

Next.js resuelve rutas estáticas antes que dinámicas. Las rutas actuales son:

- Estáticas: `/admin/*`, `/proyectos/*`, `/espacios/*`, `/producto/*`, `/p/*` (nueva)
- Dinámica de primer nivel: `/[categoriaSlug]`

`/p/[slug]` es un segmento estático (`/p/`), así que no colisiona con `/[categoriaSlug]`. No hay ambigüedad.

## Dependencias nuevas

- `@tiptap/react`
- `@tiptap/starter-kit`
- `@tiptap/extension-link`
- `@tiptap/extension-image`
- `sanitize-html` (servidor) — limpia HTML antes de guardar

## Success criteria

- Cliente crea `/p/nosotros` con hero + texto + galería + CTA en menos de 10 minutos sin ayuda técnica
- Publica / despublica desde el toggle
- Enlaza la página desde una tarjeta de Ventas usando el dropdown
- Google indexa la página con su título y descripción SEO configurados
- Eliminar una página elimina sus bloques en cascada
- `/p/slug-inexistente` devuelve 404
- `/p/slug-en-borrador` devuelve 404
