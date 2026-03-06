# Speculo

Speculo is a portfolio prototype simulating how a large technology company detects and prioritizes domain impersonation and routes high-risk findings into an enforcement workflow.

## Objectives

- Simulate suspicious domain generation against Meta brands.
- Score abuse risk with explainable factors.
- Create and track enforcement cases through lifecycle states.
- Produce operational and executive reporting artifacts.
- Maintain evidence-first engineering discipline.

## Project Status

Scaffolding baseline established. Contract-first architecture, artifact/index/report tooling, and a V1 operations dashboard are in place.

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
- `product_v1.py` transforms run artifacts into a product-facing queue/detail/vendor/campaign payload.

## Run Vertical Slice

Run a local deterministic simulation:

```bash
python3 scripts/run-vertical-slice.py --sample-size 50 --threshold 0.70 --seed 42
```

Optional explicit output path:

```bash
python3 scripts/run-vertical-slice.py --output docs/demos/vertical-slice-summary.md
```

Write structured run artifacts with an explicit run ID:

```bash
python3 scripts/run-vertical-slice.py --run-id 2026-03-04-slice-01 --artifact-dir docs/metrics/runs
```

Artifact schema reference:

- `docs/metrics/ARTIFACT_SCHEMA.md`
- `docs/metrics/runs/index.json` is auto-updated after each run for cross-run comparison.

Compare latest two indexed runs:

```bash
python3 scripts/compare-runs.py
```

Compare specific runs:

```bash
python3 scripts/compare-runs.py --baseline-run-id 2026-03-04-slice-01 --candidate-run-id 2026-03-04-slice-02
```

Generate weekly run trend report:

```bash
python3 scripts/report-runs.py
```

Validate report generation in dry mode:

```bash
python3 scripts/report-runs.py --dry-run
```

Run threshold tuning sweep and write evidence artifacts:

```bash
python3 scripts/tune-thresholds.py
```

Validate threshold tuning in dry mode:

```bash
python3 scripts/tune-thresholds.py --dry-run
```

## Product Surfaces

Build dashboard payload from latest indexed run:

```bash
python3 scripts/build-product-v1.py
```

The dashboard includes a Threshold Tuning panel when `docs/metrics/threshold_tuning/latest.json` exists.

Serve locally:

```bash
python3 -m http.server 8080
```

Open:

- Landing: `http://127.0.0.1:8080/`
- Operations dashboard: `http://127.0.0.1:8080/dashboard/index.html`
- Campaign lab: `http://127.0.0.1:8080/dashboard/campaigns.html`

Install reusable design bucket into another project:

```bash
python3 scripts/install-bucket.py --bucket saas-security-neon --target /ABSOLUTE/TARGET/PATH
```

Run security suite structural smoke checks:

```bash
node tests/security_suite_smoke.mjs
```

Serve the `security-suite` dashboard with the correct shared asset paths:

```bash
./scripts/serve-security-suite.sh
```

This serves the repo root and points you at the `security-suite` app start page:

```text
http://127.0.0.1:4186/dashboard/security-suite/security-overview.html
```

## Design Hub Workflow (Primary + Harvest)

- Primary visual token authority: `design-system/firecrawl/tokens.css`
- Root class for dashboard surface: `.theme-firecrawl`
- Composition package:
  - `design-system/compositions/firecrawl-speculo-brandguard-operations-console-for-predictive-domain-abuse-enforcement-case-q-202603041455/`
- Traceability:
  - `docs/design/primary-harvest-traceability.md`

Run outfit commands (required command phrases):

```bash
python3 scripts/theme-outfit.py list outfits
python3 scripts/theme-outfit.py switch to next one
python3 scripts/theme-outfit.py switch to previous one
python3 scripts/theme-outfit.py switch to idea-02
```

## Evidence-First Workflow

- Daily log required at `docs/worklog/YYYY-MM-DD.md`.
- `scripts/check-evidence.sh` must pass before close-day handoff.
- Missing evidence must be explicitly marked `TBD`, `Unavailable`, or `Pending validation`.

## Security Hygiene

- Never commit secrets or `.env` files.
- Use `.env.example` for configuration documentation.
