# BrandGuard Artifact Schema (v1.0.0)

This document defines files written by `scripts/run-vertical-slice.py` into `docs/metrics/runs/<run-id>/`.

## Files

- `domains.jsonl`: `DomainCandidate` rows.
- `impersonation_signals.jsonl`: `ImpersonationSignals` rows.
- `infrastructure_signals.jsonl`: `InfrastructureSignals` rows.
- `threat_assessments.jsonl`: `ThreatAssessment` rows.
- `campaigns.jsonl`: `CampaignCluster` rows.
- `cases.jsonl`: `EnforcementCase` rows including `audit_log` entries.
- `vendor_assignments.json`: object mapping vendor IDs to case ID arrays.
- `weekly_summary.json`: `WeeklyExecutiveSummary` object.
- `manifest.json`: run metadata and file index.

## Run Catalog

- `docs/metrics/runs/index.json`: canonical list of all run manifests for run-to-run comparison.
- Each entry includes config values, key volume fields, and paths back to manifest and summary artifacts.

## Manifest Fields

- `schema_version` (string)
- `artifact_type` (string)
- `run_id` (string)
- `generated_at` (ISO-8601 UTC datetime)
- `config` (object):
  - `sample_size` (integer)
  - `high_risk_threshold` (number)
  - `seed` (integer)
- `counts` (object): entity totals
- `summary_markdown_path` (string)
- `files` (object): map of logical name -> filename

## Type Rules

- Datetimes are serialized as ISO-8601 UTC strings.
- Enums are serialized as string values.
- Tuples are serialized as arrays.
