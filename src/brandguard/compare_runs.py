from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any


def _read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _normalize_path(repo_root: Path, path_value: str) -> Path:
    path = Path(path_value)
    if path.is_absolute():
        return path
    return repo_root / path


def _as_int(value: Any) -> int:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        return int(value)
    return 0


@dataclass(frozen=True)
class RunComparison:
    baseline_run_id: str
    candidate_run_id: str
    baseline_generated_at: str
    candidate_generated_at: str
    config_baseline: dict[str, Any]
    config_candidate: dict[str, Any]
    metric_deltas: dict[str, int]
    vendor_case_deltas: dict[str, int]


REPORTED_METRICS = (
    "domains",
    "cases",
    "campaigns",
    "vendor_assigned_cases",
)


def load_index(index_path: Path) -> dict[str, Any]:
    if not index_path.exists():
        raise FileNotFoundError(f"index file not found: {index_path}")
    payload = _read_json(index_path)
    runs = payload.get("runs", [])
    if not isinstance(runs, list):
        raise ValueError("index payload must contain a runs list")
    return payload


def determine_default_pair(index_payload: dict[str, Any]) -> tuple[str, str]:
    runs = index_payload.get("runs", [])
    if len(runs) < 2:
        raise ValueError("at least two runs are required for comparison")
    latest = runs[0]
    previous = runs[1]
    return str(previous.get("run_id", "")), str(latest.get("run_id", ""))


def _runs_by_id(index_payload: dict[str, Any]) -> dict[str, dict[str, Any]]:
    mapped: dict[str, dict[str, Any]] = {}
    for row in index_payload.get("runs", []):
        run_id = str(row.get("run_id", "")).strip()
        if not run_id:
            continue
        mapped[run_id] = row
    return mapped


def _load_vendor_counts(repo_root: Path, run_entry: dict[str, Any]) -> dict[str, int]:
    run_path_value = str(run_entry.get("run_path", "")).strip()
    if not run_path_value:
        return {}
    vendor_path = _normalize_path(repo_root, run_path_value) / "vendor_assignments.json"
    if not vendor_path.exists():
        return {}

    vendor_payload = _read_json(vendor_path)
    counts: dict[str, int] = {}
    for vendor, case_ids in vendor_payload.items():
        if isinstance(case_ids, list):
            counts[str(vendor)] = len(case_ids)
        else:
            counts[str(vendor)] = 0
    return counts


def compare_runs(
    *,
    repo_root: Path,
    index_path: Path,
    baseline_run_id: str,
    candidate_run_id: str,
) -> RunComparison:
    baseline_run_id = baseline_run_id.strip()
    candidate_run_id = candidate_run_id.strip()
    if not baseline_run_id or not candidate_run_id:
        raise ValueError("both baseline_run_id and candidate_run_id are required")
    if baseline_run_id == candidate_run_id:
        raise ValueError("baseline_run_id and candidate_run_id must be different")

    index_payload = load_index(index_path)
    runs_by_id = _runs_by_id(index_payload)

    if baseline_run_id not in runs_by_id:
        raise ValueError(f"baseline run not found in index: {baseline_run_id}")
    if candidate_run_id not in runs_by_id:
        raise ValueError(f"candidate run not found in index: {candidate_run_id}")

    baseline = runs_by_id[baseline_run_id]
    candidate = runs_by_id[candidate_run_id]

    config_baseline = {
        "sample_size": baseline.get("sample_size", "Unavailable"),
        "high_risk_threshold": baseline.get("high_risk_threshold", "Unavailable"),
        "seed": baseline.get("seed", "Unavailable"),
    }
    config_candidate = {
        "sample_size": candidate.get("sample_size", "Unavailable"),
        "high_risk_threshold": candidate.get("high_risk_threshold", "Unavailable"),
        "seed": candidate.get("seed", "Unavailable"),
    }

    metric_deltas = {
        metric: _as_int(candidate.get(metric, 0)) - _as_int(baseline.get(metric, 0))
        for metric in REPORTED_METRICS
    }

    baseline_vendor_counts = _load_vendor_counts(repo_root, baseline)
    candidate_vendor_counts = _load_vendor_counts(repo_root, candidate)
    vendors = sorted(set(baseline_vendor_counts.keys()) | set(candidate_vendor_counts.keys()))
    vendor_case_deltas = {
        vendor: candidate_vendor_counts.get(vendor, 0) - baseline_vendor_counts.get(vendor, 0)
        for vendor in vendors
    }

    return RunComparison(
        baseline_run_id=baseline_run_id,
        candidate_run_id=candidate_run_id,
        baseline_generated_at=str(baseline.get("generated_at", "Unavailable")),
        candidate_generated_at=str(candidate.get("generated_at", "Unavailable")),
        config_baseline=config_baseline,
        config_candidate=config_candidate,
        metric_deltas=metric_deltas,
        vendor_case_deltas=vendor_case_deltas,
    )


def _signed(value: Any) -> str:
    if isinstance(value, (int, float)):
        prefix = "+" if value >= 0 else ""
        return f"{prefix}{value}"
    return str(value)


def format_comparison_text(comparison: RunComparison) -> str:
    lines: list[str] = []
    lines.append("# BrandGuard Run Comparison")
    lines.append("")
    lines.append(f"- Baseline: {comparison.baseline_run_id} ({comparison.baseline_generated_at})")
    lines.append(f"- Candidate: {comparison.candidate_run_id} ({comparison.candidate_generated_at})")
    lines.append("")
    lines.append("## Config Changes")
    lines.append("")

    for key in ("sample_size", "high_risk_threshold", "seed"):
        before = comparison.config_baseline.get(key, "Unavailable")
        after = comparison.config_candidate.get(key, "Unavailable")
        changed = "changed" if before != after else "unchanged"
        lines.append(f"- {key}: {before} -> {after} ({changed})")

    lines.append("")
    lines.append("## Metric Deltas (candidate - baseline)")
    lines.append("")
    for metric in REPORTED_METRICS:
        lines.append(f"- {metric}: {_signed(comparison.metric_deltas.get(metric, 0))}")

    lines.append("")
    lines.append("## Vendor Assignment Deltas")
    lines.append("")
    if comparison.vendor_case_deltas:
        for vendor, delta in comparison.vendor_case_deltas.items():
            lines.append(f"- {vendor}: {_signed(delta)}")
    else:
        lines.append("- Unavailable")

    return "\n".join(lines)
