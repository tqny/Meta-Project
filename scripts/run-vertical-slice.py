#!/usr/bin/env python3
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from brandguard.pipeline import (  # noqa: E402
    VerticalSliceConfig,
    render_weekly_summary_markdown,
    run_vertical_slice,
)


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

    print("Vertical slice completed")
    print(f"Domains analyzed: {result.weekly_summary.domains_analyzed}")
    print(f"Cases opened: {result.weekly_summary.cases_opened}")
    print(f"Campaigns detected: {len(result.campaigns)}")
    print(f"Summary written: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
