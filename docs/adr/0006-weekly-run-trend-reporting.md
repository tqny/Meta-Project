# ADR 0006: Generate Weekly Run Trend Reports from Indexed Artifacts

- Status: Accepted
- Date: 2026-03-04
- Owners: BrandGuard project team

## Context

Run artifacts and comparison utilities provide point-in-time analysis, but portfolio storytelling requires a concise weekly operational summary that links configuration changes to workload outcomes.

## Decision

Add weekly trend reporting:

- Core reporting logic in `src/brandguard/report_runs.py`.
- CLI entrypoint in `scripts/report-runs.py`.
- Report sections include inventory, run-over-run deltas, threshold vs case trend, vendor load trend, and tuning recommendation.
- CI executes the reporter in `--dry-run` mode to ensure report generation remains valid.

## Consequences

### Positive

- Provides PM-ready narrative artifacts from simulation data.
- Standardizes how tuning decisions are documented and reviewed.
- Keeps reporting tied to indexed evidence, not ad hoc calculations.

### Negative

- Adds maintenance overhead for report format and recommendation heuristics.
- Recommendation logic is heuristic and may need calibration as models evolve.

## Alternatives Considered

- Manual report drafting from index/comparison outputs.
- Dashboard-first approach without markdown reporting.
- Postpone reporting until real production-like data exists.

## Follow-up

- Add trend confidence indicators over larger run windows.
- Add optional CSV export for external analysis.
- Add domain-level campaign drift summaries.

