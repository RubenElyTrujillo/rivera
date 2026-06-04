# Admin Navigation Specification

## Purpose

The admin navigation (sidebar) MUST reflect user task priorities. The current flat list of 23 pages is reorganized into a logical hierarchy that groups related tasks and surfaces frequent actions first.

## Requirements

### Requirement: Navigation follows user task frequency priority

The sidebar navigation MUST be reorganized into the following top-level priority order:
1. **Catálogo** (products, categories, subcategories) — most frequent
2. **Proyectos** — frequent for portfolio businesses
3. **Servicios** — medium frequency
4. **Contenido** — medium frequency (hero, carousel, pages)
5. **Configuración** — rare, but necessary

### Requirement: Navigation uses clear visual hierarchy

Each navigation section MUST have:
- A visible section label (uppercase, muted color)
- 3-7 items per section (Miller's Law)
- Icons for each item matching lucide-react icon set
- Active state clearly distinguishable (background color change)

### Requirement: Navigation allows quick context switching

A non-technical user MUST be able to switch between related tasks (e.g., "Agregar Producto" to "Ver Productos") without more than 2 clicks.

### Requirement: Sidebar is collapsible for content focus

The sidebar SHOULD have a collapse/expand toggle to give more screen space to content editing areas.

### Requirement: Navigation maintains all existing routes

All 23 existing admin URLs MUST remain functional with either:
- Direct access via the reorganized menu
- Alias routes that redirect to new organization
- A visible "Administración avanzada" section for rarely-used pages

## Navigation Structure (Proposed)

```
Dashboard (always visible at top)

Catálogo
├── Agregar Producto → guided-flow
├── Productos
├── Categorías
└── Subcategorías

Proyectos
├── Agregar Proyecto → guided-flow
└── Proyectos

Servicios
└── Servicios

Contenido
├── Hero
├── Carrusel
├── Catálogo (text/PDF)
├── Secciones del Home
└── Páginas

Configuración
├── Navegación
├── Contacto
├── Footer
├── SEO
└── Medios
```

## Scenarios

### Scenario: User navigates to add a product

- GIVEN a user is on any admin page
- WHEN they want to add a product
- THEN they look at the sidebar and see "Catálogo" section
- AND click "Agregar Producto" which starts the guided flow
- AND they are NOT required to navigate through Categorías first

### Scenario: User switches between producto tasks

- GIVEN a user just added a product via the guided flow
- WHEN they want to edit a different product
- THEN they can use the sidebar to go to Catálogo → Productos
- AND the sidebar remembers their recent section expanded

### Scenario: Advanced user accesses rarely-used page

- GIVEN a user needs to update SEO settings
- WHEN they look at the sidebar
- THEN they find it under Configuración → SEO
- AND it is clearly labeled and accessible

### Scenario: User collapses sidebar for more space

- GIVEN a user is editing a complex page with many fields
- WHEN they need more screen space
- THEN they click the collapse button on the sidebar
- AND the sidebar becomes a thin icon-only strip
- AND clicking the expand icon restores the full sidebar

---

## Size Budget Compliance

Current sidebar has 23 items grouped into 5 sections with separators. Proposed reorganization maintains all items but reorders by frequency and adds guided flow shortcuts. Navigation component code should not exceed 150 lines (currently 125 lines).
