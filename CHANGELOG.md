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
- Local runner script `scripts/run-vertical-slice.py` that writes markdown executive summaries.
- Runner support for persisted artifacts under `docs/metrics/runs/<run-id>/`.
- Runner auto-updates `docs/metrics/runs/index.json` after each run.
- New CLI `scripts/compare-runs.py` to compare baseline vs candidate runs (config + metric + vendor deltas).
- New CLI `scripts/report-runs.py` to generate weekly trend markdown reports from indexed runs.
- Unit tests for contract invariants and case lifecycle transitions.
- Unit tests for vertical-slice flow and vendor-capacity constraints.
- Unit tests for artifact serialization and manifest integrity.
- Unit tests for run index generation and ordering behavior.
- Unit tests for run comparison logic and default pair selection.
- Unit tests for weekly run report generation and recommendation behavior.
- CI `lint` and `build` jobs now run real Python checks (`compileall` and `unittest`).
- CI build now validates weekly report rendering in dry-run mode.
- ADR 0003 and artifact schema reference documentation.
- ADR 0004 documenting run index strategy.
- ADR 0005 documenting run comparison utility.
- ADR 0006 documenting weekly run trend reporting.
