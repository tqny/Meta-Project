from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any


INDEX_SCHEMA_VERSION = "1.0.0"


def _read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _timestamp_or_min(value: str) -> float:
    try:
        dt = datetime.fromisoformat(value)
        return dt.astimezone(timezone.utc).timestamp()
    except ValueError:
        return float("-inf")


def _path_string(path: Path, base: Path) -> str:
    try:
        return str(path.relative_to(base))
    except ValueError:
        return str(path)


def _build_run_entry(*, manifest: dict[str, Any], run_dir: Path, path_base: Path) -> dict[str, Any]:
    config = manifest.get("config", {})
    counts = manifest.get("counts", {})

    return {
        "run_id": manifest.get("run_id", run_dir.name),
        "generated_at": manifest.get("generated_at", "Unavailable"),
        "sample_size": config.get("sample_size", "Unavailable"),
        "high_risk_threshold": config.get("high_risk_threshold", "Unavailable"),
        "seed": config.get("seed", "Unavailable"),
        "domains": counts.get("domains", 0),
        "cases": counts.get("cases", 0),
        "campaigns": counts.get("campaigns", 0),
        "vendor_assigned_cases": counts.get("vendor_assigned_cases", 0),
        "summary_markdown_path": manifest.get("summary_markdown_path", "Unavailable"),
        "run_path": _path_string(run_dir, path_base),
        "manifest_path": _path_string(run_dir / "manifest.json", path_base),
    }


def build_run_index_payload(*, runs_root: Path, path_base: Path) -> dict[str, Any]:
    runs: list[dict[str, Any]] = []

    if runs_root.exists():
        for candidate in sorted(runs_root.iterdir()):
            if not candidate.is_dir():
                continue
            manifest_path = candidate / "manifest.json"
            if not manifest_path.exists():
                continue
            manifest = _read_json(manifest_path)
            runs.append(_build_run_entry(manifest=manifest, run_dir=candidate, path_base=path_base))

    runs.sort(
        key=lambda row: (
            _timestamp_or_min(str(row.get("generated_at", ""))),
            str(row.get("run_id", "")),
        ),
        reverse=True,
    )

    return {
        "schema_version": INDEX_SCHEMA_VERSION,
        "artifact_type": "vertical-slice-run-index",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "run_count": len(runs),
        "runs": runs,
    }


def write_run_index(*, runs_root: Path, index_path: Path, path_base: Path) -> Path:
    payload = build_run_index_payload(runs_root=runs_root, path_base=path_base)
    index_path.parent.mkdir(parents=True, exist_ok=True)
    index_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return index_path
