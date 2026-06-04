# Admin Dashboard Specification

## Purpose

The admin dashboard is the entry point for non-technical users managing the CMS. It MUST provide immediate clarity on what actions are available and enable rapid task completion without browsing through menus.

## Requirements

### Requirement: Dashboard displays prioritized action cards

The dashboard MUST display 4-6 large, visually distinct action cards representing the most frequent tasks. Each card MUST be clickable in a single action and lead directly to either a guided flow or the relevant page.

The system SHALL display metric widgets showing business-relevant stats (pending reviews, recent edits, quick stats).

### Requirement: Dashboard shows context-relevant quick actions

Based on common usage patterns, the dashboard SHOULD show:
- "Agregar Producto" (primary CTA, largest card)
- "Agregar Proyecto" (secondary CTA)
- "Actualizar Hero" (quick image update)
- "Ver Sitio" (external link)

Additional actions MUST be accessible via "Ver todas las opciones" expansion or sidebar.

### Requirement: Dashboard shows at-a-glance business metrics

The dashboard MUST include a metrics section with:
- Total productos count
- Total proyectos count
- Recent activity indicator (last edit timestamp)
- Quick status indicators (e.g., "3 productos sin imágenes")

### Requirement: Dashboard passes 3-second usability test

A first-time user MUST be able to answer "Where do I add a new product?" within 3 seconds of seeing the dashboard without any guidance. The layout MUST make the primary action obvious through size, color, and position.

### Requirement: Dashboard maintains access to all existing admin pages

All existing 23 admin pages MUST remain accessible via the sidebar or an "Administración completa" section. No functionality is removed—only reorganized for优先级.

## Scenarios

### Scenario: First-time user finds product creation

- GIVEN a non-technical user logs into the admin panel
- WHEN the dashboard loads
- THEN they see "Agregar Producto" as the largest, most prominent card with a clear "+" icon
- AND the card text reads "Agregar nuevo producto al catálogo"
- AND clicking it starts the guided flow for adding a product

### Scenario: Returning user checks recent activity

- GIVEN a returning user logs into the admin panel
- WHEN the dashboard loads
- THEN they see a "Última actividad" section showing when content was last modified
- AND they see metric cards for productos and proyectos counts

### Scenario: User needs less-common admin function

- GIVEN a user needs to update the footer
- WHEN they look at the dashboard and don't see a footer shortcut
- THEN they click "Ver todas las opciones" or scroll to find it in sidebar
- AND they navigate to Configuración → Footer

### Scenario: User wants to view public site

- GIVEN a user is in the admin panel
- WHEN they want to see how changes look
- THEN they click "Ver sitio" in the dashboard header area
- AND the public site opens in a new tab

---

## Metrics

| Metric | Target |
|--------|--------|
| "Add product" task completion | ≤5 clicks from dashboard |
| Dashboard cognitive load | 3-second usability pass |
| All 23 pages accessible | 100% coverage |
