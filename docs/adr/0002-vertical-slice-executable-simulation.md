# ADR 0002: First Executable Vertical Slice (Simulation Pipeline)

- Status: Accepted
- Date: 2026-03-04
- Owners: BrandGuard project team

## Context

ADR 0001 established contracts and module interfaces. We now need a real executable path that proves the architecture can run end-to-end without introducing full production complexity.

Goal of this slice:

- produce deterministic synthetic domains;
- compute impersonation and infrastructure signals;
- predict abuse activation risk with explainable factors;
- open high-risk enforcement cases;
- route cases to vendor queues under capacity constraints;
- generate an executive-summary artifact.

## Decision

Implement a thin in-process simulation pipeline in `src/brandguard/pipeline.py` and a local runner `scripts/run-vertical-slice.py`.

Key implementation choices:

1. Deterministic behavior via explicit seed values.
2. Pure standard-library implementation (no dependency overhead yet).
3. Rule-based scoring model as a placeholder for future ML-backed model.
4. Automatic `Open -> Under Review` transition to exercise lifecycle audit logging.
5. Markdown executive summary output for evidence-friendly review.

## Consequences

### Positive

- Demonstrates executable system thinking with traceable artifacts.
- Supports repeatable interviews/demos because output is deterministic.
- Creates a safe baseline for swapping in richer detectors/models later.

### Negative

- Current scoring quality is heuristic and not statistically calibrated.
- Campaign clustering is intentionally simple and may over/under-group.
- Vendor routing does not yet model SLA aging or geographic specialization.

## Alternatives Considered

- Build only one module at a time without an end-to-end execution path.
- Implement UI-first and postpone executable backend path.
- Introduce full ML stack before simulation flow validation.

## Follow-up

- ADR 0003: data persistence and artifact schema.
- Add confidence calibration strategy and backtesting harness.
- Replace heuristic scoring with model versioning and evaluation metrics.

