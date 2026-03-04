#!/usr/bin/env python3
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from brandguard.report_runs import (  # noqa: E402
    generate_weekly_run_report,
    load_run_index,
    render_weekly_run_report,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate BrandGuard weekly run trend report")
    parser.add_argument(
        "--index",
        type=Path,
        default=ROOT / "docs" / "metrics" / "runs" / "index.json",
        help="Path to run index JSON",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output markdown path",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Render and print report without writing file",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    output = args.output
    if output is None:
        date_suffix = datetime.now(timezone.utc).date().isoformat()
        output = ROOT / "docs" / "metrics" / f"WEEKLY_RUN_REPORT_{date_suffix}.md"

    if args.dry_run:
        payload = load_run_index(args.index)
        report = render_weekly_run_report(index_payload=payload, repo_root=ROOT)
        print(report, end="")
        print("[dry-run] Report not written to disk")
        return 0

    generate_weekly_run_report(
        repo_root=ROOT,
        index_path=args.index,
        output_path=output,
    )
    print(f"Report written: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
