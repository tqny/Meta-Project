from __future__ import annotations

from datetime import datetime, timezone
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


def _as_int(value: Any, default: int = 0) -> int:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        return int(value)
    return default


def _as_float(value: Any, default: float = 0.0) -> float:
    if isinstance(value, bool):
        return float(value)
    if isinstance(value, (int, float)):
        return float(value)
    return default


def load_run_index(index_path: Path) -> dict[str, Any]:
    if not index_path.exists():
        raise FileNotFoundError(f"run index not found: {index_path}")
    payload = _read_json(index_path)
    runs = payload.get("runs", [])
    if not isinstance(runs, list):
        raise ValueError("run index payload must contain a runs list")
    return payload


def _load_vendor_counts(repo_root: Path, run_entry: dict[str, Any]) -> dict[str, int]:
    run_path_value = str(run_entry.get("run_path", "")).strip()
    if not run_path_value:
        return {}

    vendor_path = _normalize_path(repo_root, run_path_value) / "vendor_assignments.json"
    if not vendor_path.exists():
        return {}

    payload = _read_json(vendor_path)
    counts: dict[str, int] = {}
    for vendor, case_ids in payload.items():
        if isinstance(case_ids, list):
            counts[str(vendor)] = len(case_ids)
        else:
            counts[str(vendor)] = 0
    return counts


def _signed_int(value: int) -> str:
    prefix = "+" if value >= 0 else ""
    return f"{prefix}{value}"


def _run_pair_deltas(runs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    deltas: list[dict[str, Any]] = []
    for index in range(len(runs) - 1):
        candidate = runs[index]
        baseline = runs[index + 1]
        deltas.append(
            {
                "baseline": str(baseline.get("run_id", "Unavailable")),
                "candidate": str(candidate.get("run_id", "Unavailable")),
                "threshold_delta": _as_float(candidate.get("high_risk_threshold"))
                - _as_float(baseline.get("high_risk_threshold")),
                "cases_delta": _as_int(candidate.get("cases")) - _as_int(baseline.get("cases")),
                "campaigns_delta": _as_int(candidate.get("campaigns")) - _as_int(baseline.get("campaigns")),
                "vendor_assigned_delta": _as_int(candidate.get("vendor_assigned_cases"))
                - _as_int(baseline.get("vendor_assigned_cases")),
            }
        )
    return deltas


def recommend_tuning_note(runs: list[dict[str, Any]]) -> str:
    if len(runs) < 2:
        return (
            "Insufficient run history for tuning recommendation. "
            "Collect at least two indexed runs with controlled inputs."
        )

    latest = runs[0]
    previous = runs[1]

    threshold_delta = _as_float(latest.get("high_risk_threshold")) - _as_float(
        previous.get("high_risk_threshold")
    )
    case_delta = _as_int(latest.get("cases")) - _as_int(previous.get("cases"))
    vendor_delta = _as_int(latest.get("vendor_assigned_cases")) - _as_int(
        previous.get("vendor_assigned_cases")
    )

    if threshold_delta < 0 and case_delta <= 0:
        return (
            "Lowering threshold did not increase case volume. Hold current threshold and run at least "
            "one more controlled comparison before lowering further."
        )

    if threshold_delta < 0 and case_delta > 0 and vendor_delta > 0:
        return (
            "Lower threshold increased operational load. Validate vendor capacity and false-positive "
            "tolerance before additional sensitivity increases."
        )

    if threshold_delta > 0 and case_delta < 0:
        return (
            "Higher threshold reduced case volume. Verify recall risk on high-confidence abuse patterns "
            "before keeping this stricter setting."
        )

    return (
        "Recent configuration changes produced mixed signals. Keep threshold stable and compare with a "
        "fixed seed window to isolate threshold impact."
    )


def render_weekly_run_report(
    *,
    index_payload: dict[str, Any],
    repo_root: Path,
    generated_at: datetime | None = None,
) -> str:
    runs = index_payload.get("runs", [])
    if not isinstance(runs, list):
        raise ValueError("run index payload must contain a runs list")

    report_generated_at = (generated_at or datetime.now(timezone.utc)).astimezone(timezone.utc)
    deltas = _run_pair_deltas(runs)

    lines: list[str] = []
    lines.append("# BrandGuard Weekly Run Trend Report")
    lines.append("")
    lines.append(f"- Generated at (UTC): {report_generated_at.isoformat()}")
    lines.append(f"- Indexed runs: {len(runs)}")
    lines.append("")

    lines.append("## Run Inventory")
    lines.append("")
    lines.append("| run_id | generated_at | sample_size | threshold | cases | campaigns | vendor_assigned |")
    lines.append("|---|---|---:|---:|---:|---:|---:|")
    for run in runs:
        lines.append(
            "| "
            f"{run.get('run_id', 'Unavailable')} | "
            f"{run.get('generated_at', 'Unavailable')} | "
            f"{run.get('sample_size', 'Unavailable')} | "
            f"{run.get('high_risk_threshold', 'Unavailable')} | "
            f"{run.get('cases', 'Unavailable')} | "
            f"{run.get('campaigns', 'Unavailable')} | "
            f"{run.get('vendor_assigned_cases', 'Unavailable')} |"
        )

    lines.append("")
    lines.append("## Run-over-Run Deltas")
    lines.append("")
    if deltas:
        for delta in deltas:
            lines.append(
                f"- {delta['baseline']} -> {delta['candidate']}: "
                f"threshold {delta['threshold_delta']:+.2f}, "
                f"cases {_signed_int(delta['cases_delta'])}, "
                f"campaigns {_signed_int(delta['campaigns_delta'])}, "
                f"vendor assigned {_signed_int(delta['vendor_assigned_delta'])}"
            )
    else:
        lines.append("- Unavailable")

    lines.append("")
    lines.append("## Threshold vs Case Volume")
    lines.append("")
    for run in reversed(runs):
        domains = max(1, _as_int(run.get("domains"), default=1))
        cases = _as_int(run.get("cases"))
        case_rate = cases / domains
        lines.append(
            f"- {run.get('run_id', 'Unavailable')}: threshold {run.get('high_risk_threshold', 'Unavailable')}, "
            f"cases {cases}, cases/domain {case_rate:.3f}"
        )

    lines.append("")
    lines.append("## Vendor Load Trend")
    lines.append("")
    for run in runs:
        vendor_counts = _load_vendor_counts(repo_root, run)
        if vendor_counts:
            vendor_text = ", ".join(
                f"{vendor}={count}" for vendor, count in sorted(vendor_counts.items())
            )
        else:
            vendor_text = "Unavailable"
        lines.append(f"- {run.get('run_id', 'Unavailable')}: {vendor_text}")

    lines.append("")
    lines.append("## Recommended Tuning Note")
    lines.append("")
    lines.append(f"- {recommend_tuning_note(runs)}")

    return "\n".join(lines) + "\n"


def generate_weekly_run_report(
    *,
    repo_root: Path,
    index_path: Path,
    output_path: Path,
) -> str:
    payload = load_run_index(index_path)
    report = render_weekly_run_report(index_payload=payload, repo_root=repo_root)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(report, encoding="utf-8")
    return report
