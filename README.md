# BrandGuard

BrandGuard is a portfolio prototype simulating how a large technology company detects and prioritizes domain impersonation and routes high-risk findings into an enforcement workflow.

## Objectives

- Simulate suspicious domain generation against Meta brands.
- Score abuse risk with explainable factors.
- Create and track enforcement cases through lifecycle states.
- Produce operational and executive reporting artifacts.
- Maintain evidence-first engineering discipline.

## Project Status

Scaffolding baseline established. Contract-first architecture and a thin executable vertical slice are in place.

## Repository Layout

- `docs/adr/` Architecture decision records.
- `docs/demos/` Demo evidence and walkthrough logs.
- `docs/metrics/` Program and operational metrics templates.
- `docs/postmortems/` Incident/postmortem artifacts.
- `docs/worklog/` Daily engineering evidence logs.
- `scripts/` Local verification and utility scripts.
- `.github/workflows/` CI checks for evidence, lint, and build.
- `src/brandguard/` Pipeline contracts and interface definitions.
- `tests/` Unit tests for contracts and lifecycle invariants.

## Current Architecture Baseline

- `contracts.py` defines typed entities for domains, signals, threats, campaigns, cases, recommendations, audit entries, and weekly summaries.
- `interfaces.py` defines stage boundaries for each pipeline module (generation, detection, scoring, clustering, case creation, recommendation, routing, lifecycle, reporting).
- `pipeline.py` includes a deterministic vertical slice from domain generation through executive summary output.

## Run Vertical Slice

Run a local deterministic simulation:

```bash
python3 scripts/run-vertical-slice.py --sample-size 50 --threshold 0.70 --seed 42
```

Optional explicit output path:

```bash
python3 scripts/run-vertical-slice.py --output docs/demos/vertical-slice-summary.md
```

## Evidence-First Workflow

- Daily log required at `docs/worklog/YYYY-MM-DD.md`.
- `scripts/check-evidence.sh` must pass before close-day handoff.
- Missing evidence must be explicitly marked `TBD`, `Unavailable`, or `Pending validation`.

## Security Hygiene

- Never commit secrets or `.env` files.
- Use `.env.example` for configuration documentation.
