# ADR 0001: Core Pipeline Contracts Before Feature Implementation

- Status: Accepted
- Date: 2026-03-04
- Owners: BrandGuard project team

## Context

BrandGuard must present as a credible internal prototype with explainable, auditable workflows. The system has multiple stages (generation, detection, scoring, clustering, enforcement routing, lifecycle, reporting), and implementation can drift quickly if stage boundaries are not fixed early.

We need a minimal technical baseline that:

- keeps modules independently swappable;
- enforces explainability fields at the data model level;
- captures lifecycle transitions with auditable status history;
- remains lightweight while feature behavior is still being explored.

## Decision

Establish a contract-first baseline in Python before implementing any feature modules.

1. Define typed domain entities in `src/brandguard/contracts.py`.
2. Define pipeline stage interfaces in `src/brandguard/interfaces.py` using `Protocol`.
3. Enforce invariants in contracts:
   - probabilities must be between `0.0` and `1.0`;
   - threat score must be between `0` and `100`;
   - case lifecycle transitions must be valid and emit audit entries;
   - explainability fields cannot be empty for case objects.
4. Validate contract behavior with unit tests before any model logic is added.

## Consequences

### Positive

- Clear implementation boundary for each module in the pipeline.
- Lower coupling between simulation logic and orchestration.
- Explainability and auditability become default behavior rather than optional add-ons.
- Better interview-readability: architecture intent is explicit and reviewable.

### Negative

- Adds upfront design overhead before visible product output.
- Some contracts may need refactors once real data behavior is observed.
- Requires discipline to keep interfaces stable as modules are introduced.

## Alternatives Considered

- Implement end-to-end quickly without contracts, then refactor later.
- Use a single script and postpone modularization until after dashboard work.
- Start from UI and retrofit backend model boundaries afterward.

## Follow-up

- Add ADR 0002 for the first executable vertical slice (synthetic generation to case creation).
- Add serialization format decisions (JSONL vs parquet) once sample volumes are defined.

