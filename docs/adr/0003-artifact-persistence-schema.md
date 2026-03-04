# ADR 0003: Persist Vertical Slice Outputs as Structured Artifacts

- Status: Accepted
- Date: 2026-03-04
- Owners: BrandGuard project team

## Context

ADR 0002 established an executable vertical slice that writes a markdown executive summary. For credible internal-tool simulation, runs also need machine-readable records for reproducibility, analytics, and audit support.

## Decision

Persist vertical-slice run outputs under `docs/metrics/runs/<run-id>/` using:

1. JSONL for row-oriented entities (`domains`, `signals`, `assessments`, `campaigns`, `cases`).
2. JSON for aggregate entities (`weekly_summary`, `vendor_assignments`, `manifest`).
3. A run `manifest.json` that records schema version, run config, counts, generated time, and file index.

Schema version for this baseline is `1.0.0`.

## Consequences

### Positive

- Enables deterministic replay analysis and comparison between runs.
- Supports future dashboards and data science workflows without parser rewrites.
- Strengthens evidence-first discipline with explicit artifact provenance.

### Negative

- Introduces schema compatibility responsibility for future changes.
- Increases repository artifact volume if run output is committed frequently.

## Alternatives Considered

- Keep markdown-only output and defer structured persistence.
- Use SQLite immediately instead of file artifacts.
- Persist only cases and skip intermediate stage outputs.

## Follow-up

- Define migration policy for schema version increments.
- Add optional retention controls for large run histories.
- Evaluate columnar storage once run volume increases.

