# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial repository scaffolding for BrandGuard.
- ADR 0001 defining contract-first architecture baseline.
- ADR 0002 defining the first executable vertical slice.
- Core pipeline contracts in `src/brandguard/contracts.py`.
- Pipeline stage interfaces in `src/brandguard/interfaces.py`.
- Deterministic vertical-slice simulation pipeline in `src/brandguard/pipeline.py`.
- Structured artifact writer in `src/brandguard/artifacts.py` for JSONL/JSON run outputs.
- Run index builder in `src/brandguard/run_index.py` for multi-run comparison metadata.
- Run comparison module in `src/brandguard/compare_runs.py`.
- Run trend reporting module in `src/brandguard/report_runs.py`.
- Product V1 payload adapter in `src/brandguard/product_v1.py`.
- Theme outfit engine in `src/brandguard/theme_outfits.py`.
- Threshold tuning module in `src/brandguard/threshold_tuning.py` for multi-seed enforcement threshold sweeps.
- Local runner script `scripts/run-vertical-slice.py` that writes markdown executive summaries.
- Runner support for persisted artifacts under `docs/metrics/runs/<run-id>/`.
- Runner auto-updates `docs/metrics/runs/index.json` after each run.
- New CLI `scripts/compare-runs.py` to compare baseline vs candidate runs (config + metric + vendor deltas).
- New CLI `scripts/report-runs.py` to generate weekly trend markdown reports from indexed runs.
- New CLI `scripts/build-product-v1.py` to build dashboard-ready product payload.
- New CLI `scripts/theme-outfit.py` to list/switch design outfits and generate dashboard theme tokens.
- New CLI `scripts/tune-thresholds.py` to generate threshold tuning JSON + markdown evidence artifacts.
- Dashboard frontend scaffold in `dashboard/` for queue/detail/lifecycle/vendor/campaign views.
- Dashboard now includes threshold tuning evidence panel sourced from threshold-sweep artifacts.
- Firecrawl bucket installed under `design-system/firecrawl/` from Design Hub distribution.
- Primary+Harvest composition package copied to `design-system/compositions/firecrawl-speculo-brandguard-operations-console-for-predictive-domain-abuse-enforcement-case-q-202603041455/`.
- Dashboard surface now uses Firecrawl token source with `.theme-firecrawl` root class.
- Dashboard UI updated per composition patterns (top-nav CTA, KPI footers, filter bar tightening, activity timeline composer/feed).
- Dashboard layout fully re-imagined around mission-first operations narrative: command-center header, intake/workbench split, terminal intelligence window, vendor matrix, and activity timeline.
- Added `index.html` landing surface that routes into product work surfaces.
- Added dedicated `dashboard/campaigns.html` Campaign Lab surface for cluster strategy and threshold policy analysis.
- Added a dashboard-local Firecrawl token mirror at `dashboard/design-system/firecrawl/tokens.css` and retargeted dashboard pages to load it, preventing theme-variable loss when serving from `dashboard/` as web root.
- Added Firecrawl token defaults in `dashboard/styles.css` as a resilience fallback so dashboard rendering remains styled even when token imports fail or root theme class is missing.
- Operations dashboard visualization system reworked to reduce chart repetition and improve signal clarity:
  - risk composition donut + legend,
  - workflow funnel by stage,
  - threat curve line chart with threshold marker,
  - vendor utilization mini-gauges,
  - compact brand pressure matrix replacing redundant repeated bar blocks.
- Replaced prior dashboard interaction model with a first-principles operations behavior model:
  - stage-based workflow (`Detect`, `Validate`, `Enforce`, `Monitor`, `Closed`);
  - autopilot stage moves from risk posture;
  - campaign-level action states (`Escalation Requested`, `Monitor`, `Contained`);
  - terminal-style strategy panels driven by threshold and campaign data.
- Design traceability report added at `docs/design/primary-harvest-traceability.md`.
- Design outfit bucket files in `design-system/buckets/idea-01.json`, `idea-02.json`, `idea-03.json`.
- Unit tests for contract invariants and case lifecycle transitions.
- Unit tests for vertical-slice flow and vendor-capacity constraints.
- Unit tests for artifact serialization and manifest integrity.
- Unit tests for run index generation and ordering behavior.
- Unit tests for run comparison logic and default pair selection.
- Unit tests for weekly run report generation and recommendation behavior.
- Unit tests for product payload assembly and outfit switching.
- Unit tests for threshold tuning metrics and recommendation outputs.
- CI `lint` and `build` jobs now run real Python checks (`compileall` and `unittest`).
- CI build now validates weekly report rendering in dry-run mode.
- ADR 0003 and artifact schema reference documentation.
- ADR 0004 documenting run index strategy.
- ADR 0005 documenting run comparison utility.
- ADR 0006 documenting weekly run trend reporting.
- ADR 0007 documenting Product V1 dashboard architecture and design-token workflow.
- ADR 0008 documenting threshold tuning experiment and policy guardrails.
