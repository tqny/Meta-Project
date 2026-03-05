from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any


DEFAULT_VENDOR_CAPACITY = {
    "Vendor-A": 40,
    "Vendor-B": 20,
}
DEFAULT_THRESHOLD_TUNING_PATH = Path("docs/metrics/threshold_tuning/latest.json")

VALID_CASE_TRANSITIONS: dict[str, list[str]] = {
    "Open": ["Under Review", "Escalated", "Closed"],
    "Under Review": ["Escalated", "Enforcement Initiated", "Resolved", "Closed"],
    "Escalated": ["Enforcement Initiated", "Resolved", "Closed"],
    "Enforcement Initiated": ["Resolved", "Closed"],
    "Resolved": ["Closed"],
    "Closed": [],
}


def _read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        return rows
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        rows.append(json.loads(line))
    return rows


def _load_run_index(index_path: Path) -> dict[str, Any]:
    if not index_path.exists():
        raise FileNotFoundError(f"run index not found: {index_path}")
    payload = _read_json(index_path)
    runs = payload.get("runs", [])
    if not isinstance(runs, list):
        raise ValueError("run index payload must include a runs list")
    return payload


def _select_run(index_payload: dict[str, Any], run_id: str | None) -> dict[str, Any]:
    runs = index_payload.get("runs", [])
    if not runs:
        raise ValueError("run index has no runs")

    if run_id is None:
        return runs[0]

    for run in runs:
        if str(run.get("run_id", "")) == run_id:
            return run
    raise ValueError(f"run_id not found in index: {run_id}")


def _resolve_path(repo_root: Path, value: str) -> Path:
    path = Path(value)
    if path.is_absolute():
        return path
    return repo_root / path


def _load_run_artifacts(repo_root: Path, run_entry: dict[str, Any]) -> dict[str, Any]:
    run_path_value = str(run_entry.get("run_path", "")).strip()
    if not run_path_value:
        raise ValueError("run entry missing run_path")
    run_dir = _resolve_path(repo_root, run_path_value)

    manifest = _read_json(run_dir / "manifest.json")
    domains = _read_jsonl(run_dir / "domains.jsonl")
    campaigns = _read_jsonl(run_dir / "campaigns.jsonl")
    cases = _read_jsonl(run_dir / "cases.jsonl")
    assessments = _read_jsonl(run_dir / "threat_assessments.jsonl")
    vendor_assignments = _read_json(run_dir / "vendor_assignments.json")
    weekly_summary = _read_json(run_dir / "weekly_summary.json")

    return {
        "run_dir": run_dir,
        "manifest": manifest,
        "domains": domains,
        "campaigns": campaigns,
        "cases": cases,
        "assessments": assessments,
        "vendor_assignments": vendor_assignments,
        "weekly_summary": weekly_summary,
    }


def _vendor_lookup(assignments: dict[str, list[str]]) -> dict[str, str]:
    case_to_vendor: dict[str, str] = {}
    for vendor, case_ids in assignments.items():
        if not isinstance(case_ids, list):
            continue
        for case_id in case_ids:
            case_to_vendor[str(case_id)] = str(vendor)
    return case_to_vendor


def _domain_ground_truth(domains: list[dict[str, Any]]) -> dict[str, str]:
    return {
        str(item.get("domain", "")): str(item.get("ground_truth", "Unavailable"))
        for item in domains
    }


def _assessment_map(assessments: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {
        str(item.get("domain", "")): item
        for item in assessments
    }


def _as_float(value: Any, default: float = 0.0) -> float:
    if isinstance(value, bool):
        return float(value)
    if isinstance(value, (int, float)):
        return float(value)
    return default


def _as_int(value: Any, default: int = 0) -> int:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        return int(value)
    return default


def _load_threshold_tuning(repo_root: Path, tuning_path: Path | None) -> dict[str, Any]:
    if tuning_path is None:
        artifact_path = repo_root / DEFAULT_THRESHOLD_TUNING_PATH
    elif tuning_path.is_absolute():
        artifact_path = tuning_path
    else:
        artifact_path = repo_root / tuning_path
    try:
        display_path = str(artifact_path.relative_to(repo_root))
    except ValueError:
        display_path = str(artifact_path)

    if not artifact_path.exists():
        return {
            "available": False,
            "artifact_path": display_path,
            "reason": "Unavailable",
        }

    payload = _read_json(artifact_path)
    recommendation = payload.get("recommendation", {})
    thresholds = payload.get("thresholds", [])
    if not isinstance(thresholds, list):
        thresholds = []

    recommended_threshold = _as_float(recommendation.get("threshold"), default=-1.0)
    recommended_metrics: dict[str, Any] = {}
    for row in thresholds:
        if not isinstance(row, dict):
            continue
        threshold_value = _as_float(row.get("threshold"), default=-1.0)
        if abs(threshold_value - recommended_threshold) <= 1e-6:
            recommended_metrics = {
                "precision": _as_float(row.get("precision")),
                "recall": _as_float(row.get("recall")),
                "f1": _as_float(row.get("f1")),
                "case_volume": _as_int(row.get("case_volume")),
                "overflow_ratio": _as_float(row.get("vendor_overflow_ratio")),
            }
            break

    ranked = sorted(
        [row for row in thresholds if isinstance(row, dict)],
        key=lambda row: (
            _as_float(row.get("f1")),
            _as_float(row.get("precision")),
            -_as_float(row.get("case_rate")),
            _as_float(row.get("threshold")),
        ),
        reverse=True,
    )
    top_candidates = [
        {
            "threshold": _as_float(row.get("threshold")),
            "precision": _as_float(row.get("precision")),
            "recall": _as_float(row.get("recall")),
            "f1": _as_float(row.get("f1")),
            "case_volume": _as_int(row.get("case_volume")),
            "overflow_ratio": _as_float(row.get("vendor_overflow_ratio")),
        }
        for row in ranked[:3]
    ]

    return {
        "available": True,
        "artifact_path": display_path,
        "generated_at": payload.get("generated_at", "Unavailable"),
        "evaluated_runs": _as_int(payload.get("evaluated_runs")),
        "total_domains": _as_int(payload.get("total_domains")),
        "recommended_threshold": recommended_threshold if recommended_threshold >= 0 else "Unavailable",
        "selection_mode": str(recommendation.get("selection_mode", "Unavailable")),
        "rationale": list(recommendation.get("rationale", [])),
        "policy": {
            "min_precision": _as_float(payload.get("config", {}).get("min_precision")),
            "min_recall": _as_float(payload.get("config", {}).get("min_recall")),
            "max_overflow_ratio": _as_float(payload.get("config", {}).get("max_overflow_ratio")),
        },
        "recommended_metrics": recommended_metrics,
        "top_candidates": top_candidates,
    }


def build_product_v1_payload(
    *,
    repo_root: Path,
    run_id: str | None = None,
    index_path: Path | None = None,
    vendor_capacity: dict[str, int] | None = None,
    tuning_path: Path | None = None,
) -> dict[str, Any]:
    index_file = index_path or repo_root / "docs" / "metrics" / "runs" / "index.json"
    index_payload = _load_run_index(index_file)
    run_entry = _select_run(index_payload, run_id)
    artifacts = _load_run_artifacts(repo_root, run_entry)

    domains = artifacts["domains"]
    cases = artifacts["cases"]
    campaigns = artifacts["campaigns"]
    assessments = artifacts["assessments"]
    vendor_assignments = artifacts["vendor_assignments"]
    weekly_summary = artifacts["weekly_summary"]

    case_to_vendor = _vendor_lookup(vendor_assignments)
    ground_truth_by_domain = _domain_ground_truth(domains)
    assessment_by_domain = _assessment_map(assessments)

    case_rows: list[dict[str, Any]] = []
    for case in sorted(cases, key=lambda row: int(row.get("threat_score", 0)), reverse=True):
        case_id = str(case.get("case_id", "Unavailable"))
        domain = str(case.get("domain", "Unavailable"))
        status = str(case.get("status", "Open"))
        assessment = assessment_by_domain.get(domain, {})
        case_rows.append(
            {
                "case_id": case_id,
                "domain": domain,
                "threat_score": int(case.get("threat_score", 0)),
                "predicted_threat_type": str(case.get("predicted_threat_type", "unknown")),
                "target_brand": str(case.get("target_brand", "Unknown")),
                "registrar": str(case.get("registrar", "Unknown")),
                "status": status,
                "recommended_action": str(case.get("recommended_action", "Monitor")),
                "campaign_id": case.get("campaign_id"),
                "explanation": list(case.get("explanation", [])),
                "audit_log": list(case.get("audit_log", [])),
                "vendor": case_to_vendor.get(case_id, "Unassigned"),
                "allowed_transitions": VALID_CASE_TRANSITIONS.get(status, []),
                "activation_probability": float(assessment.get("activation_probability", 0.0)),
                "confidence": str(assessment.get("confidence", "low")),
                "ground_truth": ground_truth_by_domain.get(domain, "Unavailable"),
            }
        )

    campaign_rows: list[dict[str, Any]] = []
    for campaign in campaigns:
        domains_in_campaign = list(campaign.get("domains", []))
        campaign_rows.append(
            {
                "campaign_id": str(campaign.get("campaign_id", "Unavailable")),
                "domain_count": len(domains_in_campaign),
                "primary_keyword": campaign.get("primary_keyword"),
                "primary_brand": campaign.get("primary_brand"),
                "recommendation": campaign.get("recommendation"),
            }
        )

    capacities = vendor_capacity or DEFAULT_VENDOR_CAPACITY
    vendor_rows: list[dict[str, Any]] = []
    for vendor in sorted(set(list(capacities.keys()) + list(vendor_assignments.keys()))):
        assigned = len(vendor_assignments.get(vendor, [])) if isinstance(vendor_assignments.get(vendor), list) else 0
        capacity = int(capacities.get(vendor, assigned if assigned > 0 else 1))
        utilization = assigned / capacity if capacity > 0 else 0.0
        vendor_rows.append(
            {
                "vendor": vendor,
                "capacity": capacity,
                "assigned": assigned,
                "utilization": utilization,
            }
        )

    high_risk_count = sum(1 for row in case_rows if row["threat_score"] >= 80)
    phishing_or_abuse = sum(
        1
        for row in case_rows
        if row.get("ground_truth") in {"phishing", "brand abuse"}
    )
    quality_proxy = phishing_or_abuse / len(case_rows) if case_rows else 0.0

    statuses = sorted({str(row.get("status", "Open")) for row in case_rows})
    threat_types = sorted({str(row.get("predicted_threat_type", "unknown")) for row in case_rows})
    registrars = sorted({str(row.get("registrar", "Unknown")) for row in case_rows})
    threshold_tuning = _load_threshold_tuning(repo_root, tuning_path)

    run_threshold = _as_float(run_entry.get("high_risk_threshold"), default=-1.0)
    recommended_threshold = threshold_tuning.get("recommended_threshold")
    threshold_gap = "Unavailable"
    if isinstance(recommended_threshold, (int, float)) and run_threshold >= 0:
        threshold_gap = round(run_threshold - float(recommended_threshold), 4)

    now = datetime.now(timezone.utc).isoformat()
    return {
        "product_version": "v1",
        "generated_at": now,
        "run": {
            "run_id": str(run_entry.get("run_id", "Unavailable")),
            "generated_at": str(run_entry.get("generated_at", "Unavailable")),
            "source_run_path": str(run_entry.get("run_path", "Unavailable")),
            "threshold": run_entry.get("high_risk_threshold", "Unavailable"),
            "sample_size": run_entry.get("sample_size", "Unavailable"),
            "seed": run_entry.get("seed", "Unavailable"),
        },
        "overview": {
            "domains_analyzed": int(weekly_summary.get("domains_analyzed", len(domains))),
            "cases_opened": len(case_rows),
            "active_campaigns": len(campaign_rows),
            "high_risk_cases": high_risk_count,
            "quality_proxy": quality_proxy,
            "threshold_gap": threshold_gap,
        },
        "queue": case_rows,
        "campaigns": sorted(campaign_rows, key=lambda row: row["domain_count"], reverse=True),
        "vendors": vendor_rows,
        "executive_summary": weekly_summary,
        "threshold_tuning": threshold_tuning,
        "lifecycle": {
            "valid_transitions": VALID_CASE_TRANSITIONS,
        },
        "filters": {
            "statuses": statuses,
            "threat_types": threat_types,
            "registrars": registrars,
            "vendors": [row["vendor"] for row in vendor_rows],
        },
    }
