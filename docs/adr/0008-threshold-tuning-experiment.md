# ADR 0008: Threshold Tuning Sweep for Evidence-Backed Enforcement Settings

- Status: Accepted
- Date: 2026-03-04
- Owners: BrandGuard project team

## Context

BrandGuard currently supports case-threshold configuration (`high_risk_threshold`), but threshold selection was based on static defaults and short run-over-run notes. That is weak evidence for explaining why enforcement sensitivity is set to a specific value.

The project needs a reproducible way to evaluate threshold tradeoffs against synthetic ground truth while accounting for operational constraints (vendor capacity).

## Decision

Add a deterministic threshold tuning experiment:

- Module `src/brandguard/threshold_tuning.py` runs a multi-seed threshold sweep.
- CLI `scripts/tune-thresholds.py` writes:
  - JSON artifact: `docs/metrics/threshold_tuning/latest.json`
  - Markdown report: `docs/metrics/threshold_tuning/latest.md`
- Evaluation includes confusion-matrix metrics by threshold (`precision`, `recall`, `f1`, false-positive rate) plus case volume and vendor overflow ratio.
- Recommendation policy selects a threshold that satisfies configured guardrails when possible; otherwise it falls back to best-effort weighted tradeoff with explicit rationale.

## Consequences

### Positive

- Threshold decisions become auditable and explainable.
- Demonstrates program-management tradeoff handling (risk sensitivity vs operational load).
- Produces reusable artifacts that can feed reporting and dashboard context.

### Negative

- Adds extra runtime for tuning sweeps.
- Uses synthetic labels, so results are representative but not production-truth.

## Alternatives Considered

- Keep threshold fixed and rely only on run-over-run case deltas.
- Manually tune threshold without repeatable sweep artifacts.
- Optimize only for F1 and ignore vendor capacity constraints.

## Follow-up

- Add side-by-side false-positive sampling workflow for threshold candidates.
- Persist sweep history as time-series artifacts, not only `latest`.
- Add dashboard controls for switching between threshold tuning runs.
