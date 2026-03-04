#!/usr/bin/env python3
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from brandguard.artifacts import write_vertical_slice_artifacts  # noqa: E402
from brandguard.pipeline import (  # noqa: E402
    VerticalSliceConfig,
    render_weekly_summary_markdown,
    run_vertical_slice,
)
from brandguard.run_index import write_run_index  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run BrandGuard vertical slice simulation")
    parser.add_argument("--sample-size", type=int, default=50, help="Number of synthetic domains")
    parser.add_argument("--threshold", type=float, default=0.7, help="Case creation threshold")
    parser.add_argument("--seed", type=int, default=42, help="Deterministic simulation seed")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Optional markdown output file path",
    )
    parser.add_argument(
        "--artifact-dir",
        type=Path,
        default=ROOT / "docs" / "metrics" / "runs",
        help="Directory where structured run artifacts are written",
    )
    parser.add_argument(
        "--run-id",
        type=str,
        default=None,
        help="Optional run identifier used for artifact folder naming",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    result = run_vertical_slice(
        VerticalSliceConfig(
            sample_size=args.sample_size,
            high_risk_threshold=args.threshold,
            seed=args.seed,
        )
    )

    output = args.output
    if output is None:
        date_suffix = datetime.now(timezone.utc).date().isoformat()
        output = ROOT / "docs" / "demos" / f"vertical-slice-summary-{date_suffix}.md"

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(render_weekly_summary_markdown(result) + "\n", encoding="utf-8")

    run_id = args.run_id
    if run_id is None:
        run_id = datetime.now(timezone.utc).strftime("vertical-slice-%Y%m%dT%H%M%SZ")
    artifact_dir = args.artifact_dir / run_id
    write_vertical_slice_artifacts(
        result=result,
        config=VerticalSliceConfig(
            sample_size=args.sample_size,
            high_risk_threshold=args.threshold,
            seed=args.seed,
        ),
        output_dir=artifact_dir,
        run_id=run_id,
        summary_markdown_path=output,
    )
    index_path = write_run_index(
        runs_root=args.artifact_dir,
        index_path=args.artifact_dir / "index.json",
        path_base=ROOT,
    )

    print("Vertical slice completed")
    print(f"Domains analyzed: {result.weekly_summary.domains_analyzed}")
    print(f"Cases opened: {result.weekly_summary.cases_opened}")
    print(f"Campaigns detected: {len(result.campaigns)}")
    print(f"Summary written: {output}")
    print(f"Artifacts written: {artifact_dir}")
    print(f"Run index updated: {index_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
