# Tasks: CMS Admin Simplification

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1800-2200 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main|feature-branch-chain|size-exception|pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Guided flow foundation (hooks, stepper, navigation) | PR 1 | Base: main; includes useFlowDraft, GuidedFlowStepper, FlowNavigation, FlowProgress, FlowEscapeDialog |
| 2 | Dashboard components (ActionCard, MetricCard, AdminMetrics) | PR 2 | Base: main; standalone widgets, no flow dependencies |
| 3 | Admin layout + dashboard page + flow pages | PR 3 | Base: main; wiring everything together |
| 4 | Integration tests + E2E | PR 4 | Base: PR 3; final verification slice |

## Phase 1: Guided Flow Foundation

- [x] 1.1 Create `src/components/admin/guided-flows/useFlowValidation.ts` — inline field validation hook
- [x] 1.2 Create `src/components/admin/guided-flows/FlowDraftSave.tsx` — localStorage persistence hook (useAdminDraft.ts exists)
- [x] 1.3 Create `src/components/admin/guided-flows/GuidedFlowStepper.tsx` — horizontal step navigation shell
- [x] 1.4 Create `src/components/admin/guided-flows/GuidedFlowStep.tsx` — step content wrapper (StepperStep.tsx exists)
- [x] 1.5 Create `src/components/admin/guided-flows/FlowNavigation.tsx` — Previous/Next/Save buttons (StepNavigation.tsx exists)
- [x] 1.6 Create `src/components/admin/guided-flows/FlowProgress.tsx` — "Paso X de Y" indicator
- [x] 1.7 Create `src/components/admin/guided-flows/FlowEscapeDialog.tsx` — "abandonar flujo?" confirmation

## Phase 2: Dashboard Components

- [x] 2.1 Create `src/components/admin/dashboard/ActionCard.tsx` — large clickable dashboard card
- [x] 2.2 Create `src/components/admin/dashboard/MetricCard.tsx` — stat display widget
- [x] 2.3 Create `src/components/admin/dashboard/AdminMetrics.tsx` — metrics fetching + display

## Phase 3: Page Integration

- [x] 3.1 Modify `src/components/admin/AdminLayout.tsx` — reorder NAV_ITEMS by frequency; add collapse toggle
- [x] 3.2 Modify `src/pages/admin/index.tsx` — new action-card dashboard layout with metric widgets
- [x] 3.3 Create `src/pages/admin/flows/agregar-producto.tsx` — 6-step guided flow for products
- [x] 3.4 Create `src/pages/admin/flows/agregar-proyecto.tsx` — 6-step guided flow for projects
- [x] 3.5 Create `src/pages/admin/flows/actualizar-hero.tsx` — 5-step guided flow for hero

## Phase 4: Testing

- [x] 4.1 Integration test for agregar-producto flow
- [x] 4.2 Integration test for agregar-proyecto flow
- [x] 4.3 Integration test for actualizar-hero flow
- [x] 4.4 Dashboard integration test
- [x] 4.5 AdminLayout nav order test
- [x] 4.6 GuidedFlowStepper e2e test

## Phase 5: Cleanup

- [x] 5.1 Verify all exports in admin/index.ts
- [x] 5.2 Verify build passes
