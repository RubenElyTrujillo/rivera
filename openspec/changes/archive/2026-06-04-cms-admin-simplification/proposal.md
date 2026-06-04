# Proposal: CMS Admin Simplification

## Intent

The CMS has 23 admin pages and 24 database tables, but the interface is overwhelming for non-technical users (e.g., a small business owner managing their flooring/finishing company). The goal is to reorganize and simplify the admin experience without removing any functionality — making the system intuitive while preserving all existing capabilities.

## Scope

### In Scope
- Simplified admin dashboard with prioritized primary actions
- Reorganized navigation/menu based on user task frequency
- Improved visual hierarchy and consistent UX patterns
- Guided flows for high-frequency tasks (add product, upload images, update hero)
- Dashboard widgets for quick business metrics (pending reviews, recent changes)

### Out of Scope
- WhatsApp bot integration (future work)
- Any changes to backend API or database schema
- Changes to the public-facing website
- Adding new business capabilities

## Capabilities

### New Capabilities
- `admin-dashboard`: New simplified dashboard with role-based quick actions and business metrics widgets
- `admin-navigation`: Reorganized sidebar/menu reflecting user priorities (Catalog → Projects → Services → Content → Settings)
- `guided-flows`: Step-by-step wizards for common tasks (add product, add project, update hero images)

### Modified Capabilities
- None — all existing admin pages remain functionally intact, only reorganized

## Approach

1. **Audit current 23 pages** — group by user task frequency (daily/weekly/rare) via mental model of non-technical user
2. **Redesign dashboard** — replace current dashboard with task-focused layout: 4-6 primary action buttons + metric cards
3. **Restructure navigation** — collapse 23 pages into 5-6 top-level sections with logical groupings
4. **Add guided flows** — wrap complex multi-step tasks (product creation, project upload) in stepper UI
5. **Progressive disclosure** — advanced options hidden by default, accessible via "More options" expansion
6. **TDD throughout** — all new components require tests before implementation

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/admin/` | Modified | All admin page layouts and components |
| `src/components/admin/` | Modified | Shared admin UI components (sidebar, dashboard widgets) |
| `src/lib/admin/` | Modified | Navigation config, permission helpers |
| `prisma/schema.prisma` | None | No schema changes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Existing admin URLs break for bookmarks | Medium | Maintain routing aliases or 301 redirects |
| Users习惯了旧界面 | Low | Provide in-app help tooltips and optional "classic view" toggle |
| Scope creep from stakeholder requests | High | Strict scope enforcement in change control |
| Guided flows increase development time | Medium | Prioritize 3 most common tasks first |

## Rollback Plan

1. Revert `src/app/admin/` and `src/components/admin/` to previous commit
2. Restore `src/lib/admin/navigation.ts` from git history
3. Run `bun test` to verify no regressions
4. No database migration needed — no schema changes

## Dependencies

- None external

## Success Criteria

- [ ] Non-technical user can complete "add new product" task in ≤5 clicks from dashboard
- [ ] "Add project with gallery" task completes in ≤7 clicks
- [ ] Dashboard passes 3-second usability test (user knows where to go without searching)
- [ ] All existing 23 admin pages remain accessible (no functionality removed)
- [ ] `bun test` passes with no new failures
- [ ] ESLint and type checks pass
