#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from brandguard.threshold_tuning import (  # noqa: E402
    ThresholdSweepConfig,
    render_threshold_sweep_markdown,
    run_threshold_sweep,
    write_threshold_sweep_artifact,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run BrandGuard threshold tuning sweep")
    parser.add_argument("--sample-size", type=int, default=120, help="Domains per run/seed")
    parser.add_argument("--seed-start", type=int, default=40, help="Starting seed value")
    parser.add_argument("--seed-count", type=int, default=12, help="Number of sequential seeds")
    parser.add_argument("--threshold-min", type=float, default=0.55, help="Minimum threshold")
    parser.add_argument("--threshold-max", type=float, default=0.90, help="Maximum threshold")
    parser.add_argument("--threshold-step", type=float, default=0.02, help="Threshold increment")
    parser.add_argument(
        "--vendor-capacity",
        type=int,
        default=60,
        help="Total daily vendor capacity used for overflow constraint",
    )
    parser.add_argument("--min-precision", type=float, default=0.65, help="Policy precision floor")
    parser.add_argument("--min-recall", type=float, default=0.75, help="Policy recall floor")
    parser.add_argument(
        "--max-overflow-ratio",
        type=float,
        default=0.15,
        help="Policy maximum vendor overflow ratio",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "docs" / "metrics" / "threshold_tuning" / "latest.json",
        help="Output JSON artifact path",
    )
    parser.add_argument(
        "--markdown-output",
        type=Path,
        default=ROOT / "docs" / "metrics" / "threshold_tuning" / "latest.md",
        help="Output markdown report path",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Render report without writing artifacts",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    config = ThresholdSweepConfig(
        sample_size=args.sample_size,
        seed_start=args.seed_start,
        seed_count=args.seed_count,
        threshold_min=args.threshold_min,
        threshold_max=args.threshold_max,
        threshold_step=args.threshold_step,
        vendor_daily_capacity=args.vendor_capacity,
        min_precision=args.min_precision,
        min_recall=args.min_recall,
        max_overflow_ratio=args.max_overflow_ratio,
    )
    result = run_threshold_sweep(config)
    markdown = render_threshold_sweep_markdown(result)

    if args.dry_run:
        print(markdown, end="")
        print("[dry-run] Threshold tuning artifacts not written to disk")
        return 0

    write_threshold_sweep_artifact(result, args.output)
    args.markdown_output.parent.mkdir(parents=True, exist_ok=True)
    args.markdown_output.write_text(markdown, encoding="utf-8")

    print(f"Threshold tuning artifact written: {args.output}")
    print(f"Threshold tuning markdown written: {args.markdown_output}")
    print(f"Recommended threshold: {result.recommendation.threshold:.2f}")
    print(f"Selection mode: {result.recommendation.selection_mode}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
