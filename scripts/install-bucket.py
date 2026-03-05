#!/usr/bin/env python3
from __future__ import annotations

import argparse
import shutil
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_FILES = ["bucket.json", "tokens.css", "agent-context.md", "README.md", "INTEGRATION.md"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Install a design bucket into another project path")
    parser.add_argument("--bucket", required=True, help="Bucket directory name under design-system/")
    parser.add_argument("--target", required=True, type=Path, help="Target project path")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_dir = ROOT / "design-system" / args.bucket
    if not source_dir.exists() or not source_dir.is_dir():
        raise ValueError(f"Bucket not found: {source_dir}")

    target_root = args.target.resolve()
    target_dir = target_root / "design-system" / args.bucket
    target_dir.mkdir(parents=True, exist_ok=True)

    copied: list[str] = []
    skipped: list[str] = []

    for name in DEFAULT_FILES:
        src = source_dir / name
        if not src.exists():
            continue
        dst = target_dir / name
        if dst.exists() and not args.force:
            skipped.append(str(dst))
            continue
        shutil.copy2(src, dst)
        copied.append(str(dst))

    print(f"Bucket: {args.bucket}")
    print(f"Source: {source_dir}")
    print(f"Target: {target_dir}")
    print(f"Copied: {len(copied)} file(s)")
    for path in copied:
        print(f"  + {path}")

    if skipped:
        print(f"Skipped (exists): {len(skipped)} file(s)")
        for path in skipped:
            print(f"  - {path}")
        print("Use --force to overwrite existing files.")

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(1)
