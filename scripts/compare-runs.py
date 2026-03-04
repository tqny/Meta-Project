#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from brandguard.compare_runs import (  # noqa: E402
    compare_runs,
    determine_default_pair,
    format_comparison_text,
    load_index,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Compare two BrandGuard run artifacts")
    parser.add_argument(
        "--index",
        type=Path,
        default=ROOT / "docs" / "metrics" / "runs" / "index.json",
        help="Path to run index JSON",
    )
    parser.add_argument(
        "--baseline-run-id",
        type=str,
        default=None,
        help="Older/baseline run ID",
    )
    parser.add_argument(
        "--candidate-run-id",
        type=str,
        default=None,
        help="Newer/candidate run ID",
    )
    parser.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
        help="Output format",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    index_payload = load_index(args.index)

    baseline_id = args.baseline_run_id
    candidate_id = args.candidate_run_id
    if baseline_id is None and candidate_id is None:
        baseline_id, candidate_id = determine_default_pair(index_payload)
    elif baseline_id is None or candidate_id is None:
        raise ValueError("provide both --baseline-run-id and --candidate-run-id, or neither")

    comparison = compare_runs(
        repo_root=ROOT,
        index_path=args.index,
        baseline_run_id=str(baseline_id),
        candidate_run_id=str(candidate_id),
    )

    if args.format == "json":
        print(json.dumps(comparison.__dict__, indent=2))
    else:
        print(format_comparison_text(comparison))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
