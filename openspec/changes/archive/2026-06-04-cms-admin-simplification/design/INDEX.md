# Design Artifacts — cms-admin-simplification

## Design Document
- `design.md` — Architecture decisions, component inventory, file changes, testing strategy

## New Components (14 files)

### Guided Flow System (`src/components/admin/guided-flows/`)
| File | Purpose |
|------|---------|
| `GuidedFlowStepper.tsx` | Horizontal step navigation shell |
| `GuidedFlowStep.tsx` | Step content wrapper |
| `FlowNavigation.tsx` | Previous/Next/Save buttons |
| `FlowProgress.tsx` | "Paso X de Y" indicator |
| `FlowDraftSave.ts` | localStorage persistence hook |
| `FlowEscapeDialog.tsx` | Abandon flow confirmation |
| `useFlowValidation.ts` | Inline field validation hook |

### Dashboard (`src/components/admin/dashboard/`)
| File | Purpose |
|------|---------|
| `ActionCard.tsx` | Large clickable action card |
| `MetricCard.tsx` | Stat display widget |
| `AdminMetrics.tsx` | Metrics fetching + display |

### Guided Flow Pages (new routes)
| File | Purpose |
|------|---------|
| `src/pages/admin/flows/agregar-producto.tsx` | 6-step product creation wizard |
| `src/pages/admin/flows/agregar-proyecto.tsx` | 6-step project creation wizard |
| `src/pages/admin/flows/actualizar-hero.tsx` | 5-step hero update wizard |

## Modified Files (3 files)
| File | Change |
|------|--------|
| `src/pages/admin/index.tsx` | New action-card dashboard layout |
| `src/components/admin/AdminLayout.tsx` | Reordered NAV_ITEMS + collapse toggle |
| `openspec/changes/cms-admin-simplification/design.md` | This document |
