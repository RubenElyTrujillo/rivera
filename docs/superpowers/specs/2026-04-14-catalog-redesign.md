# Especificación: Rediseño del Catálogo de Productos

**Fecha:** 2026-04-14  
**Estado:** Aprobado  
**Objetivo:** Reemplazar el sistema confuso de Material/MaterialCollection/MaterialFinish por un catálogo limpio de 3 niveles con admin intuitivo y páginas públicas bien definidas.

---

## 1. Contexto y Problema

El sistema anterior tenía modelos mal nombrados (Category, Material, MaterialCollection, MaterialFinish) que no coincidían con el lenguaje del cliente ni con la estructura visual del sitio. El admin resultaba confuso y el árbol de navegación no tenía una implementación clara.

**Solución:** Rediseño limpio con 3 entidades nombradas tal como el cliente las piensa: Categoria → Subcategoria → Producto.

---

## 2. Estructura del Catálogo

### Jerarquía de 3 niveles

```
Categoria (Pisos Laminados)
  └── Subcategoria (Splash!)
        └── Producto (Arctic Oak Splash)
```

### URLs públicas

| Nivel | Ejemplo |
|-------|---------|
| Categoría | `/pisos-laminados` |
| Subcategoría | `/pisos-laminados/splash` |
| Producto | `/producto/arctic-oak-splash` |

### Integración con Navbar

El navbar sigue siendo **manual** (sistema NavItem existente). El admin puede crear ítems de navegación que apunten a las URLs de las categorías. No hay acoplamiento automático.

---

## 3. Modelo de Datos

Se eliminan completamente: `Category`, `Material`, `MaterialCollection`, `MaterialFinish`, `MaterialFinishImage` y sus migraciones activas.

### Nuevas tablas

```prisma
model Categoria {
  id          Int            @id @default(autoincrement())
  name        String
  slug        String         @unique
  coverImage  String?
  description String?
  order       Int            @default(0)
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
}

model ProductoImagen {
  id         Int      @id @default(autoincrement())
  productoId Int
  producto   Producto @relation(fields: [productoId], references: [id], onDelete: Cascade)
  url        String
  caption    String?
  order      Int      @default(0)
}
```

Los slugs se auto-generan desde el nombre usando `toSlug()`.

---

## 4. Páginas de Admin

### `/admin/categorias`
- Lista de categorías existentes (nombre, slug, nº de subcategorías)
- Formulario crear/editar: nombre, descripción (opcional), imagen de portada
- Eliminar con confirmación (cascada elimina subcategorías y productos)

### `/admin/subcategorias`
- Lista con filtro por categoría padre
- Muestra: nombre, categoría padre, nº de productos
- Formulario crear/editar: categoría padre (dropdown), nombre, descripción (opcional), imagen de portada
- Eliminar con confirmación

### `/admin/productos`
- Lista con filtro encadenado: categoría → subcategoría
- Búsqueda por nombre
- Muestra breadcrumb: Categoria › Subcategoria
- Formulario crear/editar:
  - Subcategoría (dropdown, filtra por categoría seleccionada)
  - Nombre, descripción corta
  - Imagen de portada
  - Imagen hover (opcional; si no hay, el frontend hace zoom suave)
  - Galería (múltiples imágenes, reordenables)
  - Editor WYSIWYG (TipTap) para contenido HTML libre
- Eliminar con confirmación

---

## 5. Páginas Públicas

### Página de Categoría — `GET /[categoriaSlug]`

- **Renderizado:** SSR (`getServerSideProps`)
- **Hero:** imagen de portada de la categoría + nombre + descripción (solo si existe)
- **Cuerpo:** breadcrumb + grid de tarjetas de subcategorías
- **Tarjeta de subcategoría:** imagen, nombre, contador de productos
- **404** si slug no corresponde a ninguna Categoria

### Página de Subcategoría — `GET /[categoriaSlug]/[subcategoriaSlug]`

- **Renderizado:** SSR
- **Hero:** imagen de portada + nombre + descripción (si existe)
- **Cuerpo:** breadcrumb (Inicio › Categoria › Subcategoria) + grid de tarjetas de producto
- **Tarjeta de producto:**
  - Imagen `coverImage` visible por defecto
  - Al hacer hover: si `hoverImage` existe → swap de imagen; si no → zoom suave (scale-105, transition)
  - Nombre del producto debajo
  - Click → navega a `/producto/[slug]`
- **404** si el par categoría/subcategoría no existe

### Página de Producto — `GET /producto/[slug]`

- **Renderizado:** SSR
- **Breadcrumb:** Inicio › Categoria › Subcategoria › Producto
- **Layout de 2 columnas:**
  - Izquierda: imagen principal grande + miniaturas de galería (si existen). Click en miniatura → cambia imagen principal
  - Derecha: nombre, descripción corta, contenido HTML (`htmlContent` renderizado as-is)
- **Botón WhatsApp** fijo en pantalla (flotante, lado derecho) — incluye en el mensaje el nombre del producto
- **404** si slug no existe

---

## 6. APIs

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/catalog/categorias` | Lista todas las categorías |
| POST | `/api/catalog/categorias` | Crear categoría (auth) |
| PUT | `/api/catalog/categorias?id=X` | Actualizar (auth) |
| DELETE | `/api/catalog/categorias?id=X` | Eliminar (auth) |
| GET | `/api/catalog/subcategorias` | Lista, acepta `?categoriaId=X` |
| POST | `/api/catalog/subcategorias` | Crear (auth) |
| PUT | `/api/catalog/subcategorias?id=X` | Actualizar (auth) |
| DELETE | `/api/catalog/subcategorias?id=X` | Eliminar (auth) |
| GET | `/api/catalog/productos` | Lista, acepta `?subcategoriaId=X` y `?categoriaId=X` |
| POST | `/api/catalog/productos` | Crear (auth) |
| PUT | `/api/catalog/productos?id=X` | Actualizar (auth) |
| DELETE | `/api/catalog/productos?id=X` | Eliminar (auth) |
| POST | `/api/catalog/productos/[id]/imagenes` | Agregar imagen galería (auth) |
| DELETE | `/api/catalog/imagenes?id=X` | Eliminar imagen galería (auth) |

---

## 7. WYSIWYG Editor

- **Librería:** TipTap v2 (headless, instalamos `@tiptap/react`, `@tiptap/starter-kit`)
- **Extensiones:** Bold, Italic, Headings (H1-H3), BulletList, OrderedList, Table, Link, Image (subida vía endpoint `/api/media/upload` existente)
- **Almacenamiento:** HTML string en `Producto.htmlContent`
- **Renderizado público:** `dangerouslySetInnerHTML` con sanitización (DOMPurify o similar)

---

## 8. Botón WhatsApp Flotante

- Componente global `<WhatsAppButton>` en el layout principal
- Posición: fijo, lado derecho, mitad de pantalla
- Comportamiento en página de producto: el mensaje pre-llenado incluye el nombre del producto
- Fuera de páginas de producto: mensaje genérico de contacto
- Número configurable en `/admin/site` (campo existente o nuevo `whatsappNumber`)

---

## 9. Rutas de URL y Conflictos

La página de categoría usa `[categoriaSlug]` en la raíz (`/`). El `[slug].tsx` existente también captura rutas en la raíz. **Resolución:** eliminar `[slug].tsx` (era para NavItems con slug) y reemplazarlo con la lógica de categorías. Las páginas estáticas existentes (index, admin/*, api/*) tienen prioridad sobre rutas dinámicas en Next.js Pages Router — no hay conflicto.

Para subcategorías se usa un archivo `[categoriaSlug]/[subcategoriaSlug].tsx` dentro de `src/pages/`.

---

## 10. Migración y Limpieza

1. Crear migración que elimina tablas viejas y crea las nuevas
2. Eliminar archivos de código que referencian modelos viejos:
   - `src/repositories/material.repository.ts`
   - `src/repositories/finish.repository.ts`
   - `src/pages/admin/materials.tsx` y `src/pages/admin/materials/[id].tsx`
   - `src/pages/admin/collections.tsx`
   - `src/pages/admin/productos.tsx` (recién creado, se reemplaza)
   - `src/pages/api/content/materials.ts`, `finishes.ts`, `collections.ts`
3. Mantener: NavItem, NavBar, Hero, Services, Spaces (Proyectos), Site, Footer, SEO, Media
4. `src/pages/[slug].tsx` se reemplaza por la nueva página de Categoria

---

## 11. Fuera de Alcance (YAGNI)

- Buscador de productos
- Filtros de precio/características en páginas públicas
- Comparador de productos
- Stock / inventario
- Carrito de compras
