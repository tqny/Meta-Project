# ADR 0007: Product V1 Operations Dashboard with Local-First Data

- Status: Superseded
- Date: 2026-03-04
- Owners: BrandGuard project team

Superseded note:
- The Firecrawl-based frontend described here was archived on branch `codex/archive-firecrawl-final` at commit `d33cb7a`.
- The active frontend is now `dashboard/security-suite/`.

## Context

BrandGuard has backend simulation, artifacts, and reporting, but it still needs a user-facing product slice that demonstrates operational workflow handling: queue triage, explainable case detail, lifecycle actions, vendor load visibility, and campaign context.

The project must remain demo-stable without external API dependencies for domain data.

## Decision

Build a local-first V1 dashboard:

- Data adapter in `src/brandguard/product_v1.py` to transform indexed run artifacts into a dashboard payload.
- Payload builder CLI `scripts/build-product-v1.py` to create a local product payload from indexed runs.
- Frontend console was originally implemented as the Firecrawl-based Product V1 surface, which is now archived and removed from the active working tree.

## Consequences

### Positive

- Delivered a concrete product interaction layer for portfolio demos.
- Preserves determinism and reliability by using local synthetic/indexed data.
- Separated business logic from presentation for that archived frontend.

### Negative

- Lifecycle transitions in the archived V1 dashboard were local-session state only (not persisted to backend artifacts).
- The archived dashboard targeted a single run payload rather than multi-run exploration inside the UI.

## Alternatives Considered

- Build dashboard directly against live APIs for domain infrastructure.
- Delay UI until after model sophistication increases.
- Build static report-only product without interactive case actions.

## Follow-up

- Persist UI lifecycle changes to dedicated case event artifacts.
- Add multi-run selector inside dashboard.
- Add role-based workflow views (triage, escalation, vendor management).
