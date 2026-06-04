# Exploration: CMS para Comercializadora de Pisos

## Current State

The project **is already a CMS** for a flooring/commercial products company. It has a comprehensive admin panel with 20+ pages and a well-established architecture.

### Admin Panel (Full CMS)

| Section | Admin Page | Status |
|---------|-----------|--------|
| **Contenido** | Hero Carrusel, Carrusel de Materiales, Plantillas de cuarto, Servicios, Catálogo, Secciones del home, Páginas | ✅ Implemented |
| **Catálogo de materiales** | Categorías, Subcategorías, Productos | ✅ Implemented |
| **Proyectos** | Proyectos recientes | ✅ Implemented |
| **Configuración** | Navegación, Contacto, Footer, SEO, Medios | ✅ Implemented |

### Existing Architecture

```
src/
├── components/admin/           # Reusable admin UI components
│   ├── adminUtils.tsx          # DEPRECATED - redirects to new paths
│   ├── forms/                  # Field, AdminInput, AdminTextarea, ImageUploadField
│   └── ui/                     # FormCard, PageHeader, SaveButton, AdminSkeletons
├── infrastructure/
│   ├── auth/                   # JWT auth, cookies, middleware, rate limit
│   ├── db/                     # Prisma client
│   ├── storage/                # File system, image handling
│   └── http/                   # Error handling wrapper
├── repositories/               # 20+ repositories following same pattern
├── pages/admin/                # 20+ admin pages
├── pages/api/content/          # Content API routes (auth-protected)
└── domain/
    ├── types/                  # TypeScript interfaces
    └── schemas/                # Zod validation schemas
```

### Key Models Already Present

| Model | Purpose | CMS Coverage |
|-------|---------|-------------|
| `Service` | Catálogo de servicios | ✅ Admin page exists |
| `Categoria` → `Subcategoria` → `Producto` | 3-level product catalog | ✅ Full CRUD admin |
| `ContactInfo` | WhatsApp, phones, email, surface options | ✅ Admin page exists |
| `NavItem` | Hierarchical navigation tree | ✅ Admin page exists |
| `Pagina` + `PaginaBloque` | Page builder with blocks | ✅ Admin page exists |
| `Media` | File/image management | ✅ Admin page exists |

### Auth Pattern

- JWT-based authentication with cookies
- `requireAuth(req, res)` middleware on all admin API routes
- AdminLayout with `useAdminAuth()` hook for protected pages

### Repository Pattern

All entities follow the same pattern:
```typescript
// Example: carouselItem.repository.ts
export const carouselItemRepository = {
  async findAll(): Promise<ICarouselItem[]>
  async findById(id: number): Promise<ICarouselItem | null>
  async create(data): Promise<ICarouselItem>
  async update(id, data): Promise<ICarouselItem>
  async delete(id): Promise<void>
  async reorder(items): Promise<void>
}
```

---

## Affected Areas

### Would Require New Development

| Area | Files to Create/Modify |
|------|----------------------|
| **WhatsApp Bot** | `src/pages/api/whatsapp-bot.ts`, `src/infrastructure/whatsapp/` (new), `src/components/whatsapp/` (new) |
| **Enhanced Contact Form** | `src/pages/api/quotation.ts` (exists, may need enhancement), contact form component |
| **WhatsApp Integration UI** | `src/pages/admin/whatsapp-settings.tsx` (new) |

### Already Exists (May Need Enhancement)

| Feature | Existing | Notes |
|---------|----------|-------|
| Services catalog | ✅ `src/pages/admin/services.tsx` | Card-based, could add images |
| Product catalog | ✅ Full 3-level hierarchy | Already comprehensive |
| Contact form | ✅ `/api/quotation` exists | Works, WhatsApp already configured |
| WhatsApp number | ✅ `ContactInfo.whatsappPhone` | Already in DB |

---

## Approaches

### Approach 1: Incremental Enhancement (Recommended)

Build on existing CMS. Add WhatsApp bot as new feature.

| Aspect | Detail |
|--------|--------|
| **Description** | Treat WhatsApp bot as new feature on existing CMS. Enhance existing services and contact admin pages. |
| **Effort** | Medium |
| **Risk** | Low - existing patterns well-established |

**Pros:**
- Reuses existing auth, repositories, UI components
- Faster development
- Consistent with existing codebase

**Cons:**
- WhatsApp bot requires new external integration
- May need webhook handling architecture

### Approach 2: Dedicated CMS Module

Create isolated WhatsApp bot module with its own patterns.

| Aspect | Detail |
|--------|--------|
| **Description** | Treat WhatsApp bot as separate bounded context with its own handlers. |
| **Effort** | High |
| **Risk** | Medium - introduces new patterns |

**Pros:**
- Clean separation
- Easier to test in isolation

**Cons:**
- More code to maintain
- Duplicates patterns already in codebase

---

## Recommendation

**The codebase is already a comprehensive CMS.** The user is likely asking to add:

1. **WhatsApp Bot** (futuro) - NEW, requires external integration (Twilio, Meta Business API, etc.)
2. **Enhanced Service Catalog** - Minor enhancements to existing
3. **Contact Form** - Already functional

**Recommended Approach:** Incremental Enhancement
- Use existing admin patterns
- Add WhatsApp bot as new API route + webhook handler
- Create admin settings page for WhatsApp configuration
- Reuse `ContactInfo.whatsappPhone` already in database

---

## Risks

1. **WhatsApp Bot External Dependency** - Requires Meta/Facebook developer account, WhatsApp Business API access
2. **Webhook Architecture** - Need to handle incoming WhatsApp messages securely
3. **Session Management** - WhatsApp bots need state machine for conversation flow
4. **Existing Codebase Complexity** - Admin panel is already extensive; new features should follow established patterns

---

## Ready for Proposal

**Yes, but with clarification needed:**

The existing CMS is already quite complete for a "comercializadora de pisos." Before proceeding:

1. **Clarify scope** - What specifically needs to be built as "new" CMS features?
2. **WhatsApp Bot specifics** - Twilio? Meta Business API? Dialogflow? Other?
3. **Service Catalog enhancements** - What specific enhancements to existing services section?

The exploration suggests the core CMS (catalog, products, categories, navigation, contact) already exists. The main new work would be the WhatsApp bot integration and possibly enhancing the service catalog display.
