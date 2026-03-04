# ADR 0005: Add a Lightweight Run Comparison Utility

- Status: Accepted
- Date: 2026-03-04
- Owners: BrandGuard project team

## Context

Run indexing (ADR 0004) makes run metadata discoverable, but users still need a fast way to answer operational questions like: "What changed between this run and the previous one?"

## Decision

Add a small comparison utility:

- Core logic in `src/brandguard/compare_runs.py`.
- CLI entrypoint in `scripts/compare-runs.py`.
- Default mode compares the latest two runs from `docs/metrics/runs/index.json`.
- Explicit mode compares provided `--baseline-run-id` and `--candidate-run-id`.

Comparison output includes:

- config changes (`sample_size`, `high_risk_threshold`, `seed`);
- metric deltas (`domains`, `cases`, `campaigns`, `vendor_assigned_cases`);
- per-vendor assignment deltas from `vendor_assignments.json`.

## Consequences

### Positive

- Fast, repeatable run-to-run change analysis for interviews and demos.
- Encourages evidence-backed claims when tuning thresholds/seeds.
- Reuses indexed artifacts with no additional infrastructure.

### Negative

- Adds maintenance surface for output format and compatibility.
- Current comparison is aggregate-only (no domain-level diff yet).

## Alternatives Considered

- Compare runs manually using raw JSON files.
- Build comparison directly in notebooks only.
- Defer until a dashboard is built.

## Follow-up

- Add optional markdown output for direct inclusion in demo logs.
- Add domain-level overlap and campaign-merge/split diffs.

