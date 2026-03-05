# ADR 0007: Product V1 Operations Dashboard with Local-First Data

- Status: Accepted
- Date: 2026-03-04
- Owners: BrandGuard project team

## Context

BrandGuard has backend simulation, artifacts, and reporting, but it still needs a user-facing product slice that demonstrates operational workflow handling: queue triage, explainable case detail, lifecycle actions, vendor load visibility, and campaign context.

The project must remain demo-stable without external API dependencies for domain data.

## Decision

Build a local-first V1 dashboard:

- Data adapter in `src/brandguard/product_v1.py` to transform indexed run artifacts into a dashboard payload.
- Payload builder CLI `scripts/build-product-v1.py` to create `dashboard/data/product-v1.json`.
- Frontend console at `dashboard/index.html` with queue, detail, lifecycle actions, vendor capacity, and campaign board.
- Design-token outfit system using `design-system/buckets/idea-0X.json` and `scripts/theme-outfit.py` with required command phrases.
- Theme CSS generated to `dashboard/theme.css` from active bucket, so style decisions remain centralized.

## Consequences

### Positive

- Delivers a concrete product interaction layer for portfolio demos.
- Preserves determinism and reliability by using local synthetic/indexed data.
- Separates business logic from presentation and keeps theme switching non-invasive.

### Negative

- Lifecycle transitions in V1 dashboard are local-session state only (not persisted to backend artifacts).
- Dashboard currently targets a single run payload rather than multi-run exploration inside the UI.

## Alternatives Considered

- Build dashboard directly against live APIs for domain infrastructure.
- Delay UI until after model sophistication increases.
- Build static report-only product without interactive case actions.

## Follow-up

- Persist UI lifecycle changes to dedicated case event artifacts.
- Add multi-run selector inside dashboard.
- Add role-based workflow views (triage, escalation, vendor management).

