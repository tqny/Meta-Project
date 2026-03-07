#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from brandguard.theme_outfits import (  # noqa: E402
    apply_outfit,
    list_outfits,
    next_outfit_id,
    previous_outfit_id,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Design outfit switcher for BrandGuard dashboard")
    parser.add_argument("command", nargs="+", help="Command phrase")
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "dashboard" / "legacy-firecrawl" / "theme.css",
        help="Output path for generated theme CSS",
    )
    parser.add_argument(
        "--buckets-dir",
        type=Path,
        default=ROOT / "design-system" / "buckets",
        help="Bucket directory",
    )
    parser.add_argument(
        "--active-bucket",
        type=Path,
        default=ROOT / "design-system" / "buckets" / "active-bucket.json",
        help="Active bucket file",
    )
    return parser.parse_args()


def _normalized(command_parts: list[str]) -> str:
    return " ".join(part.strip().lower() for part in command_parts if part.strip())


def main() -> int:
    args = parse_args()
    command = _normalized(args.command)

    if command == "list outfits":
        outfits = list_outfits(args.buckets_dir, args.active_bucket)
        print("Available outfits:")
        for outfit in outfits:
            marker = "*" if outfit.get("is_active") else "-"
            print(f"{marker} {outfit['id']}: {outfit['name']}")
            description = str(outfit.get("description", "")).strip()
            if description:
                print(f"    {description}")
        return 0

    outfit_id: str
    if command == "switch to next one":
        outfit_id = next_outfit_id(args.buckets_dir, args.active_bucket)
    elif command == "switch to previous one":
        outfit_id = previous_outfit_id(args.buckets_dir, args.active_bucket)
    elif command.startswith("switch to idea-"):
        outfit_id = command.replace("switch to", "", 1).strip()
    else:
        raise ValueError(
            "Unsupported command. Use one of: 'list outfits', 'switch to next one', "
            "'switch to previous one', 'switch to idea-0X'"
        )

    applied = apply_outfit(
        buckets_dir=args.buckets_dir,
        active_bucket_path=args.active_bucket,
        outfit_id=outfit_id,
        css_output_path=args.output,
    )
    print(f"Switched to {applied['id']} ({applied['name']})")
    print(f"Theme CSS: {applied['css_output']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
