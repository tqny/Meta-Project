#!/usr/bin/env python3
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from brandguard.artifacts import write_vertical_slice_artifacts  # noqa: E402
from brandguard.pipeline import VerticalSliceConfig, run_vertical_slice  # noqa: E402
from brandguard.product_v1 import build_product_v1_payload  # noqa: E402
from brandguard.run_index import write_run_index  # noqa: E402


def _ensure_run_exists(index_path: Path, runs_dir: Path) -> None:
    if index_path.exists():
        return

    run_id = datetime.now(timezone.utc).strftime("bootstrap-%Y%m%dT%H%M%SZ")
    result = run_vertical_slice(VerticalSliceConfig(sample_size=50, high_risk_threshold=0.7, seed=42))
    write_vertical_slice_artifacts(
        result=result,
        config=VerticalSliceConfig(sample_size=50, high_risk_threshold=0.7, seed=42),
        output_dir=runs_dir / run_id,
        run_id=run_id,
        summary_markdown_path=ROOT / "docs" / "demos" / f"vertical-slice-summary-{datetime.now(timezone.utc).date().isoformat()}.md",
    )
    write_run_index(
        runs_root=runs_dir,
        index_path=index_path,
        path_base=ROOT,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build BrandGuard product payload from indexed runs")
    parser.add_argument(
        "--run-id",
        type=str,
        default=None,
        help="Optional run id from docs/metrics/runs/index.json (defaults to latest)",
    )
    parser.add_argument(
        "--index",
        type=Path,
        default=ROOT / "docs" / "metrics" / "runs" / "index.json",
        help="Run index file",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "output" / "product-v1.json",
        help="Product payload output path",
    )
    parser.add_argument(
        "--tuning-artifact",
        type=Path,
        default=ROOT / "docs" / "metrics" / "threshold_tuning" / "latest.json",
        help="Threshold tuning artifact path (optional; payload marks unavailable if missing)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    runs_dir = args.index.parent
    _ensure_run_exists(args.index, runs_dir)

    payload = build_product_v1_payload(
        repo_root=ROOT,
        run_id=args.run_id,
        index_path=args.index,
        tuning_path=args.tuning_artifact,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    print(f"Product V1 payload written: {args.output}")
    print(f"Run id: {payload['run']['run_id']}")
    print(f"Cases: {payload['overview']['cases_opened']}")
    print(f"Campaigns: {payload['overview']['active_campaigns']}")
    print(f"Quality proxy: {payload['overview']['quality_proxy']:.3f}")
    tuning = payload.get("threshold_tuning", {})
    if tuning.get("available"):
        print(f"Recommended threshold: {tuning.get('recommended_threshold')}")
    else:
        print("Recommended threshold: Unavailable")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
