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
- Local runner script `scripts/run-vertical-slice.py` that writes markdown executive summaries.
- Unit tests for contract invariants and case lifecycle transitions.
- Unit tests for vertical-slice flow and vendor-capacity constraints.
- CI `lint` and `build` jobs now run real Python checks (`compileall` and `unittest`).
