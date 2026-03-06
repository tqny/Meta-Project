# Architecture

## Scope Boundary
This documentation applies only to:

- `/Users/tqny/Documents/Meta Project/dashboard/security-suite`

It does not govern other dashboard builds in `Meta Project`.

## Active Surface Area

Routes:
- `security-overview.html` -> Operations Overview
- `table.html` -> Threat Intake & Case Queue
- `charts.html` -> Case Investigation View
- `heatmap.html` -> Domain Portfolio Dashboard
- `ui-elements.html` -> Enforcement & Vendor Tracker

Supporting files:
- `assets/security-suite.js` -> state, seed data, mutations, page controllers
- `assets/security-suite.css` -> shared shell/components/layout styling
- `../../design-system/saas-security-neon/tokens.css` -> current token layer
- `index.html` -> route map / local entry page

Legacy rollback pages retained but not part of active IA:
- `vendor-ops.html`
- `executive-reporting.html`

## Current Page Controller Map
`assets/security-suite.js` currently drives one controller per active page:

- `overviewPage()`
- `queuePage()`
- `investigationPage()`
- `domainsPage()`
- `enforcementPage()`

The file also contains:
- seed generators
- migration logic from earlier local state
- mutation helpers
- shared rendering helpers

## State Model
Persisted local state contains:
- `cases`
- `evidence`
- `domains`
- `vendors`
- `enforcementActions`
- selected record ids for case/domain/action detail panels

This is a client-only demo state model backed by local storage.

## Key Interaction Flows

### Case Flow
Queue -> case selected -> investigation view -> enforcement action creation/update

### Domain Flow
Domain portfolio -> domain detail -> linked case navigation -> registrar action logging

### Enforcement Flow
Investigation or seed state -> enforcement tracker -> status and note updates

### Reporting Flow
Overview aggregates the current operational state rather than owning distinct business logic.

## Architectural Constraints For The Next Phase
- No framework migration
- No page-count expansion
- No redesign-from-scratch workflow
- No business-logic rewrite unless a visual/IA improvement requires it
- Shared patterns should be updated centrally before page-specific divergence

## Current Risks
- `security-suite.js` is monolithic, so changes should remain deliberately scoped.
- Visual drift is currently a bigger risk than functional drift.
- Some current panels are serviceable functionally but not yet aligned to the source-image design system.

## Recommended Build Order From Here
1. Docs + design control layer
2. Full visual/panel audit
3. Shared shell/token convergence
4. Shared component/data-viz convergence
5. Page-by-page implementation
6. Browser QA after each scoped pass
