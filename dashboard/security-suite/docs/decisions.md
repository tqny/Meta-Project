# Decisions

## 2026-03-05

### 1. Scope docs to the active security-suite build
Decision:
- Keep project-brain docs under `dashboard/security-suite/docs`.

Why:
- The repo contains other dashboard/site experiments.
- This keeps the workflow and decisions attached to the correct build.

### 2. Preserve the current 5-page architecture
Decision:
- Keep the active IA fixed at five pages during the next phase.

Why:
- The page structure already matches the MVP workflow.
- The current problem is mostly visual convergence and panel efficiency, not route discovery.

### 3. Treat the source images as visual authority, not business-logic authority
Decision:
- Borrow visual system, layout, density, and UI patterns from the reference images.
- Keep Brand Protection workflow semantics as the operational authority.

Why:
- The images are strong aesthetic references but do not define our exact product model.

### 4. Desktop-first is the active delivery target
Decision:
- Prioritize desktop density, hierarchy, and composition before any additional breakpoint work.

Why:
- The current use case is interview/demo presentation on desktop.

### 5. Use audit -> shared system -> page passes
Decision:
- No large page restyles before:
  - visual-source consolidation
  - panel audit

Why:
- This reduces thrash and inconsistent local improvements.

### 6. Keep the current data model unless a specific audit finding requires change
Decision:
- Preserve the current `Case`, `Evidence`, `Domain`, `Vendor`, and `EnforcementAction` model as the operating baseline.

Why:
- The current upcoming work is primarily aesthetic, structural, and presentational.
- Unnecessary model churn would slow iteration.

### 7. Keep legacy rollback pages untouched
Decision:
- Leave `vendor-ops.html` and `executive-reporting.html` in place but outside the active navigation.

Why:
- They provide rollback safety without interfering with the current MVP.

### 8. Remove duplicate page-level navigation in the visual convergence phase
Decision:
- Treat the left rail as the long-term primary navigation system.
- Remove or drastically reduce the full-width page tabs during the shared-shell pass.

Why:
- The current app duplicates navigation in both the rail and the topbar.
- The source images rely on a single stronger navigation spine.

### 9. Keep one primary working surface per page
Decision:
- Each page should be organized around one hero work surface, plus one secondary support strip or side panel.

Why:
- The source images consistently weight one dominant surface more strongly than the others.
- The current implementation often fragments attention across too many equally weighted cards.

### 10. Do not force a literal heatmap onto the domain page
Decision:
- Borrow stepped risk language and visual cues from the heatmap reference, but keep the domain page table-first unless a real two-axis domain-risk model is introduced.

Why:
- The current domain workflow is record-first and portfolio-first.
- A literal 5x5 matrix would be visually faithful to the reference image but semantically weaker for the current data.

### 11. Replace ornamental KPI rows on operational pages
Decision:
- Keep rich summary cards primarily on the overview page.
- Compress or merge KPI rows on queue, domain, and enforcement pages.

Why:
- Those pages are operator work surfaces, not executive summary surfaces.
- The current KPI rows take attention away from the actual work modules.
