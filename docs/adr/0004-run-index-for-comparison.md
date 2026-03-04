# ADR 0004: Maintain a Canonical Run Index for Multi-Run Comparison

- Status: Accepted
- Date: 2026-03-04
- Owners: BrandGuard project team

## Context

ADR 0003 introduced per-run artifacts under `docs/metrics/runs/<run-id>/`. As run volume grows, comparing runs by navigating individual folders is inefficient and error-prone.

## Decision

Create and maintain `docs/metrics/runs/index.json` as the canonical catalog of all run manifests.

Each index entry captures:

- run metadata (`run_id`, `generated_at`, config values);
- operational comparison fields (`domains`, `cases`, `campaigns`, `vendor_assigned_cases`);
- pointers (`run_path`, `manifest_path`, `summary_markdown_path`).

`index.json` is rebuilt after each `scripts/run-vertical-slice.py` execution.

## Consequences

### Positive

- Enables quick run-to-run comparison from one file.
- Reduces manual errors when tracking experiment history.
- Creates a clear bridge to future dashboards or trend scripts.

### Negative

- Adds one more generated artifact to keep in sync.
- Requires schema discipline if index fields evolve.

## Alternatives Considered

- Keep only per-run manifests and compare manually.
- Build comparison data on-demand in notebooks only.
- Store run metadata in SQLite immediately.

## Follow-up

- Add a lightweight trend report script over `index.json`.
- Add retention tooling to prune stale run folders/index entries.

