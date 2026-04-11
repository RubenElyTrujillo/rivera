# Rediseño Modular — Comercializadora Rivera
**Fecha:** 2026-04-11  
**Estado:** Aprobado por cliente

---

## Problema y Objetivo

El sitio actual de Comercializadora Rivera tiene funcionalidad básica pero el cliente necesita:
1. Control total sobre la estructura del sitio (secciones, navbar, orden) desde el panel admin
2. Jerarquía de productos correcta: Categoría → Material → Colección → Producto
3. 8 mejoras funcionales y de UX específicas

**Referencia visual:** https://tekno-step.com/

---

## Decisiones de Diseño

- **Stack:** Mantener Next.js + TypeScript + Prisma + PostgreSQL + Tailwind + Framer Motion
- **Enfoque:** Page Builder propio con DB (sin CMS externo)
- **Navegación:** Navbar dinámico desde DB, soporte de dropdowns

---

## Nueva Arquitectura de Datos (Prisma)

### Nuevos modelos

```prisma
model Category {
  id          Int        @id @default(autoincrement())
  name        String
  slug        String     @unique
  coverImage  String     @default("")
  icon        String     @default("")
  order       Int        @default(0)
  materials   Material[]
}

model NavItem {
  id        Int       @id @default(autoincrement())
  label     String
  href      String    @default("")
  order     Int       @default(0)
  parentId  Int?
  parent    NavItem?  @relation("NavTree", fields: [parentId], references: [id])
  children  NavItem[] @relation("NavTree")
  visible   Boolean   @default(true)
}

model PageSection {
  id      Int     @id @default(autoincrement())
  type    String  // HERO | VENTAS | SHOWROOM | SPACES | CATALOG | CONTACT | CTA | FEATURED
  order   Int     @default(0)
  visible Boolean @default(true)
  config  String  @default("{}") // JSON con configuración específica del tipo
}
```

### Cambios en modelos existentes

```prisma
// Material: agregar FK a Category
model Material {
  // ... campos existentes ...
  categoryId  Int?
  category    Category? @relation(fields: [categoryId], references: [id])
}

// MaterialFinish: agregar campos para hover, ficha técnica y specs
model MaterialFinish {
  // ... campos existentes ...
  hoverImage  String  @default("")  // imagen del material instalado en ambiente
  pdfUrl      String  @default("")  // link a ficha técnica PDF
  thickness   String  @default("")  // espesor, ej "8 mm"
  useClass    String  @default("")  // clase de uso, ej "AC4 — Comercial"
  waterRes    Boolean @default(false) // resistencia al agua
  installType String  @default("")  // tipo instalación, ej "Flotante / Click"
  warranty    String  @default("")  // garantía, ej "25 años"
}
```

---

## Jerarquía de Navegación

```
/ (home)
  → Secciones dinámicas desde PageSection (order + visible)

/categorias/[slug]
  → Lista de materiales (Material) que pertenecen a esa Category
  → Tabs o grid de cards por material

/materiales/[materialSlug]          (ya existe)
  → Lista de colecciones (MaterialCollection)
  → + Bloque "¿Qué es X?" (campo spec del Material)

/materiales/[materialSlug]/[colSlug]  (ya existe)
  → Lista de productos (MaterialFinish) con hover effect

/producto/[finishSlug]               (ya existe)
  → Detalle del producto
  → Ficha técnica (specs + botón PDF)
  → Botón WhatsApp con contexto del material
```

---

## Cambios por Sección

### 1. Hero → Carrusel
- `PageSection type=HERO` con `config` = array de slides:
  ```json
  {
    "slides": [
      { "titleLine1": "SUPERFICIES", "titleLine2": "SIN LÍMITE", "subtitle": "...", "description": "...", "imageUrl": "..." },
      { ... }
    ],
    "autoPlayMs": 5000
  }
  ```
- Texto más grande: `text-8xl md:text-[7rem] lg:text-[9rem]`
- Textos blancos con mayor opacidad (de `/60` a `/90`)
- Posición: centrado vertical (actualmente pegado al fondo)
- Auto-play + dots de navegación + botones prev/next

### 2. Servicios → Ventas
- Renombrar `id="servicios"` → `id="ventas"`
- Ancla en nav actualizada
- `PageSection type=VENTAS` (antes SERVICES)
- Label configurable desde admin

### 3. Pisos por Subcategoría (nueva página `/categorias/[slug]`)
- Cards de materiales agrupados por `Category`
- Al hacer click → va a `/materiales/[slug]`
- En la página de material: tabs/scroll horizontal para navegar colecciones
- Navbar: dropdown "Pisos" con todos los materiales de esa categoría

### 4. Hover en Galería
- Campo `hoverImage` en `MaterialFinish`
- En la página de colección (`/materiales/[mat]/[col]`):
  - `img src={finish.image}` por defecto
  - `onMouseEnter` → transición CSS a `img src={finish.hoverImage}`
  - Si no hay `hoverImage`, no hay efecto (degradación elegante)
- En admin: campo adicional "Imagen ambiente (hover)" en el formulario de producto

### 5. Fichas Técnicas
- Nuevos campos en `MaterialFinish`: `thickness`, `useClass`, `waterRes`, `installType`, `warranty`, `pdfUrl`
- En página de producto: panel lateral "Especificaciones Técnicas" con tabla
- Botón "Descargar Ficha Técnica PDF" (solo visible si `pdfUrl` tiene valor)
- En admin: sección "Ficha Técnica" en formulario de producto

### 6. Explicación de Producto (¿Qué es X?)
- Campo `spec` ya existe en `Material` (se usa con texto largo)
- En `/materiales/[slug]`: bloque expandible antes del grid de colecciones
  ```
  ¿Qué es el [nombre del material]?
  [texto de spec]
  [tags de ventajas]
  ```
- En admin: textarea para `spec` con editor de texto enriquecido (markdown simple)

### 7. Botón Flotante WhatsApp
- Componente `<WhatsAppFAB phone={whatsappPhone} materialContext={...} />`
- Ubicación: `_app.tsx`, renderizado en todas las páginas
- CSS: `position: fixed; right: 20px; top: 50%; transform: translateY(-50%)`
- Color: `#25D366` con sombra verde
- Tooltip al hover: "¡Cotiza por WhatsApp!"
- El `phone` viene del `ContactInfo` en DB (ya existe)

### 8. Mensaje WhatsApp con Contexto
- Hook `useWhatsApp(phone: string, context?: { material?: string; collection?: string; product?: string })`
- En páginas de material/colección/producto: el contexto se pasa automáticamente
- Formato del mensaje:
  - En `/materiales/pisos-laminados`: `"Hola, me interesa: Pisos Laminados. ¿Me dan más información?"`
  - En `/materiales/pisos-laminados/splash`: `"Hola, me interesa: Pisos Laminados — Splash!. ¿Precios y disponibilidad?"`
  - En `/producto/clasico`: `"Hola, me interesa el producto: Clásico (SPLASH-CL-01) de Pisos Laminados Splash!. ¿Precio y disponibilidad?"`

---

## Panel de Admin (Extensiones)

### Nuevas secciones en `/admin`
1. **Categorías** — CRUD de `Category` (nombre, slug, imagen, orden)
2. **Navegación** — CRUD de `NavItem` con reordenamiento drag & drop
3. **Secciones del Home** — Lista de `PageSection` con toggle visible + reordenar

### Formularios extendidos
- **Material:** + campo `categoryId` (selector de categoría)
- **Producto (MaterialFinish):** + `hoverImage`, + `pdfUrl`, + campos de ficha técnica

---

## Fases de Implementación

### Fase 1 — DB & Infraestructura
- Migración Prisma: `Category`, `NavItem`, `PageSection`
- Campos nuevos en `MaterialFinish`
- Seeds de datos de prueba
- Repositorios y tipos TypeScript

### Fase 2 — Componentes Core
- `<WhatsAppFAB />` global
- Hook `useWhatsApp()`
- `<DynamicNav />` desde DB
- `<PageBuilder />` renderizador de secciones

### Fase 3 — Hero Carrusel
- Refactor de `HeroSection` para soporte multi-slide
- Auto-play, dots, flechas prev/next

### Fase 4 — Nuevas Páginas de Producto
- `/categorias/[slug]` — página de categoría
- Refactor de `/materiales/[slug]` — agregar bloque "¿Qué es X?"
- Hover effect en galería de colección
- Fichas técnicas en página de producto

### Fase 5 — Admin Extensions
- CRUD Categorías
- CRUD NavItems con reorden
- CRUD PageSections (toggle + reorden)
- Campos nuevos en formularios de Material y Producto

### Fase 6 — Renombrar Servicios → Ventas
- Cambio de label, id anchor, y nav link

### Fase 7 — QA & Polish
- Revisar todas las rutas
- SEO metadata en páginas nuevas
- Responsive en mobile
- WhatsApp context en todas las páginas

---

## Criterios de Éxito

- [ ] El cliente puede reordenar secciones del home desde el admin
- [ ] El cliente puede editar el navbar desde el admin
- [ ] El cliente puede crear categorías y asignar materiales a ellas
- [ ] La ruta `/categorias/pisos` muestra todos los materiales de pisos
- [ ] Hover en galería muestra imagen de ambiente
- [ ] Fichas técnicas visibles y descargables
- [ ] Botón WhatsApp flotante en todas las páginas
- [ ] Mensaje de WhatsApp incluye el material/producto que se está viendo
