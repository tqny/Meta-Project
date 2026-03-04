from __future__ import annotations

from dataclasses import asdict, is_dataclass
from datetime import datetime, timezone
from enum import Enum
import json
from pathlib import Path
from typing import Any

from .pipeline import VerticalSliceConfig, VerticalSliceResult


SCHEMA_VERSION = "1.0.0"


def _json_safe(value: Any) -> Any:
    if is_dataclass(value):
        return _json_safe(asdict(value))
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc).isoformat()
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_json_safe(item) for item in value]
    return value


def _write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(_json_safe(payload), indent=2) + "\n", encoding="utf-8")


def _write_jsonl(path: Path, rows: list[Any]) -> None:
    lines = [json.dumps(_json_safe(row)) for row in rows]
    body = "\n".join(lines)
    if body:
        body += "\n"
    path.write_text(body, encoding="utf-8")


def write_vertical_slice_artifacts(
    *,
    result: VerticalSliceResult,
    config: VerticalSliceConfig,
    output_dir: Path,
    run_id: str,
    summary_markdown_path: Path,
) -> dict[str, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)

    paths = {
        "domains": output_dir / "domains.jsonl",
        "impersonation_signals": output_dir / "impersonation_signals.jsonl",
        "infrastructure_signals": output_dir / "infrastructure_signals.jsonl",
        "threat_assessments": output_dir / "threat_assessments.jsonl",
        "campaigns": output_dir / "campaigns.jsonl",
        "cases": output_dir / "cases.jsonl",
        "vendor_assignments": output_dir / "vendor_assignments.json",
        "weekly_summary": output_dir / "weekly_summary.json",
        "manifest": output_dir / "manifest.json",
    }

    _write_jsonl(paths["domains"], list(result.generated_domains))
    _write_jsonl(paths["impersonation_signals"], list(result.impersonation_signals))
    _write_jsonl(paths["infrastructure_signals"], list(result.infrastructure_signals))
    _write_jsonl(paths["threat_assessments"], list(result.threat_assessments))
    _write_jsonl(paths["campaigns"], list(result.campaigns))
    _write_jsonl(paths["cases"], list(result.cases))

    vendor_assignments = {
        vendor: [case.case_id for case in queue]
        for vendor, queue in result.vendor_assignments.items()
    }
    _write_json(paths["vendor_assignments"], vendor_assignments)
    _write_json(paths["weekly_summary"], result.weekly_summary)

    manifest = {
        "schema_version": SCHEMA_VERSION,
        "artifact_type": "vertical-slice-run",
        "run_id": run_id,
        "generated_at": datetime.now(timezone.utc),
        "config": {
            "sample_size": config.sample_size,
            "high_risk_threshold": config.high_risk_threshold,
            "seed": config.seed,
        },
        "counts": {
            "domains": len(result.generated_domains),
            "impersonation_signals": len(result.impersonation_signals),
            "infrastructure_signals": len(result.infrastructure_signals),
            "threat_assessments": len(result.threat_assessments),
            "campaigns": len(result.campaigns),
            "cases": len(result.cases),
            "vendor_assigned_cases": sum(len(queue) for queue in result.vendor_assignments.values()),
        },
        "summary_markdown_path": summary_markdown_path,
        "files": {name: path.name for name, path in paths.items()},
    }
    _write_json(paths["manifest"], manifest)

    return paths
