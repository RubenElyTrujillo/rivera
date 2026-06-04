# Design: CMS Admin Simplification

## Technical Approach

Replace the current flat dashboard with a prioritized action-card layout + reorganized sidebar. Guided flows wrap existing product/project/hero creation in a multi-step stepper UI. All existing 23 admin URLs remain functional — no routes deleted, only new routes added for guided flow entry points.

## Architecture Decisions

### Decision: Dashboard lives at existing `/admin` route

| | |
|---|---|
| **Choice** | Replace content of `src/pages/admin/index.tsx` with new prioritized layout |
| **Alternatives** | Create new `/admin/new-dashboard` route and keep old index as fallback |
| **Rationale** | Simpler — no URL redirects needed. The admin index is already the dashboard entry point. Existing bookmarks to `/admin` continue working. |

### Decision: Guided flow pattern — shared `GuidedFlowStepper` component

| | |
|---|---|
| **Choice** | Single `GuidedFlowStepper` + `GuidedFlowStep` wrapper used by all three flows |
| **Alternatives** | Per-flow stepper components, or a single page per step |
| **Rationale** | Consistent UX across flows. Reuses `FlowNavigation`, `FlowProgress`, `FlowValidation`, `FlowDraftSave` per flow. Each flow is a separate page with its own step state. |

### Decision: Sidebar reorganization only — no routing changes

| | |
|---|---|
| **Choice** | Reorder `NAV_ITEMS` in `AdminLayout.tsx` by frequency; add guided-flow entry points |
| **Alternatives** | Create new route groups `/admin/catalogo/`, `/admin/contenido/` with redirects |
| **Rationale** | No URL changes means no bookmarks break. The sidebar is already data-driven (`NAV_ITEMS` array), so reordering is a trivial code change. |

### Decision: Draft persistence via localStorage

| | |
|---|---|
| **Choice** | Save draft on every field blur using `localStorage` key `draft:{flow}:{id}` |
| **Alternatives** | Server-side draft save, URL params, React state only |
| **Rationale** | No backend changes required. Survives browser crash. Auto-clear on successful submit. |

## Data Flow

```
Dashboard (/admin)
├── ActionCard "Agregar Producto" → /admin/flows/agregar-producto (new route)
│   └── GuidedFlowStepper (6 steps)
│       ├── Step 1: BasicInfo → validates → saves to localStorage draft
│       ├── Step 2: Details → ...
│       ├── Step 3: Images → ImageUploader → /api/upload
│       ├── Step 4: Documents → ...
│       ├── Step 5: Review → shows summary
│       └── Step 6: Publish → POST /api/productos → clears draft
│
├── ActionCard "Agregar Proyecto" → /admin/flows/agregar-proyecto
│   └── GuidedFlowStepper (6 steps) → POST /api/proyectos
│
├── ActionCard "Actualizar Hero" → /admin/flows/actualizar-hero
│   └── GuidedFlowStepper (5 steps) → PUT /api/content/hero
│
└── MetricCard widgets → fetch counts from existing API endpoints
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/admin/index.tsx` | Modify | New action-card dashboard with metric widgets |
| `src/components/admin/AdminLayout.tsx` | Modify | Reorder NAV_ITEMS by frequency; add collapse toggle |
| `src/components/admin/guided-flows/GuidedFlowStepper.tsx` | Create | Horizontal step navigation shell |
| `src/components/admin/guided-flows/GuidedFlowStep.tsx` | Create | Step content wrapper |
| `src/components/admin/guided-flows/FlowNavigation.tsx` | Create | Previous/Next/Save buttons |
| `src/components/admin/guided-flows/FlowProgress.tsx` | Create | "Paso X de Y" indicator |
| `src/components/admin/guided-flows/FlowDraftSave.tsx` | Create | localStorage persistence hook |
| `src/components/admin/guided-flows/FlowEscapeDialog.tsx` | Create | " abandonar flujo?" confirmation |
| `src/components/admin/guided-flows/useFlowValidation.ts` | Create | Inline field validation hook |
| `src/components/admin/dashboard/ActionCard.tsx` | Create | Large clickable dashboard card |
| `src/components/admin/dashboard/MetricCard.tsx` | Create | Stat display widget |
| `src/components/admin/dashboard/AdminMetrics.tsx` | Create | Metrics fetching + display |
| `src/pages/admin/flows/agregar-producto.tsx` | Create | Guided flow for products |
| `src/pages/admin/flows/agregar-proyecto.tsx` | Create | Guided flow for projects |
| `src/pages/admin/flows/actualizar-hero.tsx` | Create | Guided flow for hero |

## Interfaces / Contracts

```typescript
// GuidedFlowStepper props
interface GuidedFlowStepperProps {
  steps: { label: string }[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  children: React.ReactNode;
}

// FlowDraftSave hook
function useFlowDraft<T>(key: string, initial: T): {
  draft: T;
  updateDraft: (partial: Partial<T>) => void;
  clearDraft: () => void;
  hasDraft: boolean;
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `useFlowDraft` localStorage get/set/clear | Jest mock `localStorage` |
| Unit | `useFlowValidation` field validation logic | Unit test each rule |
| Unit | `FlowProgress` step calculation | Snapshot test |
| Integration | GuidedFlowStepper step navigation | RTL test with user-event |
| Integration | Dashboard metric cards load | Mock fetch, assert renders |
| E2E | Full "Agregar Producto" flow | Playwright — click through all 6 steps |

## Migration / Rollout

No database migration needed. Phased rollout:
1. Deploy new dashboard + sidebar (all 23 pages still accessible)
2. Add guided flow routes behind feature flag (optional)
3. Enable guided flows for all users
4. Deprecate old direct page access hints

## Open Questions

- [ ] Should guided flow routes be nested under `/admin/flows/` or `/admin/guided/`?
- [ ] Do we need a "classic view" toggle for power users who prefer the old flat dashboard?
- [ ] Confirm: does `strict_tdd: true` in config mean we need RED-GREEN before any implementation code?
