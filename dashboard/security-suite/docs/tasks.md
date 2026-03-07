# Tasks

Status legend:
- `done`
- `todo`
- `blocked`

## A1. Create Project-Brain Docs
- Status: `done`
- Goal: Add scoped docs so future work follows a written spec instead of ad hoc prompts.
- Definition of done:
  - `spec.md`, `architecture.md`, `tasks.md`, `decisions.md`, `design.md`, and `panel-audit.md` exist
  - docs reflect the current 5-page MVP state
  - docs stay scoped to `dashboard/security-suite`
- Files touched:
  - `docs/spec.md`
  - `docs/architecture.md`
  - `docs/tasks.md`
  - `docs/decisions.md`
  - `docs/design.md`
  - `docs/panel-audit.md`
- How to test:
  - Read the docs and confirm they match the current routes, state model, and visual goals
- Dependencies: none

## A2. Consolidate Visual Source Of Truth
- Status: `done`
- Goal: Turn the reference-image learnings into one shared visual system target for the current five-page app.
- Definition of done:
  - `design.md` is expanded with a unified shell/type/spacing/chart language
  - each active page is mapped to its strongest source-image analog
  - adoption rules are explicit: what to borrow, what to ignore
- Files touched:
  - `docs/design.md`
  - `docs/decisions.md`
- How to test:
  - another builder can read `design.md` and restyle one page without needing extra explanation
- Dependencies:
  - `A1`

## A3. Run Full Panel Audit
- Status: `done`
- Goal: Audit every page and panel for source-image alignment, task fit, and data-viz fit before code changes.
- Definition of done:
  - every panel in all five pages is labeled `keep`, `restyle`, `restructure`, `replace`, or `merge`
  - audit notes include why the current pattern is weak or strong
  - likely consolidation opportunities are called out explicitly
- Files touched:
  - `docs/panel-audit.md`
  - `docs/tasks.md`
- How to test:
  - the next builder task can be selected directly from the audit without re-discussing scope
- Dependencies:
  - `A1`
  - `A2`

## B1. Converge Global Shell And Token Language
- Status: `done`
- Goal: Bring the shared shell, typography, spacing, and surface language materially closer to the source images.
- Definition of done:
  - shell/background/rail/topbar/surface treatment updated
  - typography hierarchy is consistent and less generic
  - token changes are centralized
- Files touched:
  - `assets/security-suite.css`
  - `../../design-system/saas-security-neon/tokens.css`
  - active page templates as needed
  - `tests/security_suite_smoke.mjs`
- How to test:
  - open all five pages and confirm the global frame feels cohesive before page-specific differences
- Dependencies:
  - `A3`

## B2. Converge Shared Components And Data-Viz Grammar
- Status: `done`
- Goal: Standardize shared tables, filter bars, KPI cards, chips, chart containers, and detail panels.
- Definition of done:
  - repeated patterns look like one system
  - chart styles use a clear common grammar
  - weak or redundant controls are removed or merged
- Files touched:
  - `assets/security-suite.css`
  - `assets/security-suite.js`
  - active page templates as needed
  - `tests/security_suite_smoke.mjs`
- How to test:
  - compare repeated components across all pages and confirm they no longer feel one-off
- Dependencies:
  - `B1`

## C1. Rebuild Case Queue Page
- Status: `done`
- Goal: Make the queue page the strongest source-aligned operational screen in the suite.
- Definition of done:
  - filter bar, table, and selected-case panel feel materially closer to the table reference image
  - information density improves without hurting readability
  - no unnecessary sub-navigation is added
- Files touched:
  - `table.html`
  - `assets/security-suite.css`
  - `assets/security-suite.js`
- How to test:
  - queue filters, row selection, and note actions still work
- Dependencies:
  - `B2`

## C2. Rebuild Investigation Page
- Status: `done`
- Goal: Rework the investigation page using the strongest chart-first source patterns.
- Definition of done:
  - trend, evidence, AI assist, and decision trace feel structured and visually integrated
  - chart choice fits the information being shown
- Files touched:
  - `charts.html`
  - `assets/security-suite.css`
  - `assets/security-suite.js`
- How to test:
  - case selection, action triggers, and timeline/evidence rendering still work
- Dependencies:
  - `C1`

## C3. Rebuild Domain Portfolio Page
- Status: `done`
- Goal: Use source-image heatmap and utility patterns only where they improve the domain-ops job to be done.
- Definition of done:
  - portfolio table/detail/log structure is cleaner
  - any matrix or summary pattern is semantically justified
- Files touched:
  - `heatmap.html`
  - `assets/security-suite.css`
  - `assets/security-suite.js`
- How to test:
  - filter, selection, linked cases, and registrar log interactions still work
- Dependencies:
  - `C2`

## C4. Rebuild Enforcement Tracker Page
- Status: `done`
- Goal: Make vendor coordination feel denser, cleaner, and more like the utility-rich reference images.
- Definition of done:
  - pipeline table and action detail panel are visually stronger
  - redundant breakdowns are merged or simplified where appropriate
- Files touched:
  - `ui-elements.html`
  - `assets/security-suite.css`
  - `assets/security-suite.js`
- How to test:
  - filter, selection, status updates, and notes still work
- Dependencies:
  - `C3`

## C5. Rebuild Operations Overview Page
- Status: `done`
- Goal: Finish with an overview page that summarizes the refined operational system instead of dictating it.
- Definition of done:
  - overview panels reflect the final visual/data-viz grammar
  - no low-value summary widget remains
- Files touched:
  - `security-overview.html`
  - `assets/security-suite.css`
  - `assets/security-suite.js`
- How to test:
  - overview controls still update scoped metrics and charts correctly
- Dependencies:
  - `C4`
