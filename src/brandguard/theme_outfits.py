from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any


def _read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def _bucket_paths(buckets_dir: Path) -> list[Path]:
    paths = []
    for path in sorted(buckets_dir.glob("idea-*.json")):
        if path.name == "active-bucket.json":
            continue
        paths.append(path)
    return paths


def list_outfits(buckets_dir: Path, active_bucket_path: Path) -> list[dict[str, Any]]:
    active = _read_json(active_bucket_path).get("activeBucketId")
    outfits: list[dict[str, Any]] = []
    for path in _bucket_paths(buckets_dir):
        payload = _read_json(path)
        outfit_id = str(payload.get("id", path.stem))
        outfits.append(
            {
                "id": outfit_id,
                "name": payload.get("name", "Unnamed Outfit"),
                "description": payload.get("description", ""),
                "is_active": outfit_id == active,
            }
        )
    return outfits


def _active_bucket_id(active_bucket_path: Path) -> str:
    payload = _read_json(active_bucket_path)
    return str(payload.get("activeBucketId", ""))


def _set_active_bucket(active_bucket_path: Path, outfit_id: str) -> None:
    payload = _read_json(active_bucket_path)
    payload["activeBucketId"] = outfit_id
    payload["updatedAt"] = datetime.now(timezone.utc).isoformat()
    _write_json(active_bucket_path, payload)


def _load_outfit(buckets_dir: Path, outfit_id: str) -> dict[str, Any]:
    path = buckets_dir / f"{outfit_id}.json"
    if not path.exists():
        raise ValueError(f"outfit not found: {outfit_id}")
    payload = _read_json(path)
    tokens = payload.get("tokens", {})
    if not isinstance(tokens, dict) or not tokens:
        raise ValueError(f"outfit has no tokens: {outfit_id}")
    return payload


def _outfit_id_list(buckets_dir: Path) -> list[str]:
    return [path.stem for path in _bucket_paths(buckets_dir)]


def next_outfit_id(buckets_dir: Path, active_bucket_path: Path) -> str:
    outfit_ids = _outfit_id_list(buckets_dir)
    if not outfit_ids:
        raise ValueError("no outfits found")
    active = _active_bucket_id(active_bucket_path)
    if active not in outfit_ids:
        return outfit_ids[0]
    index = outfit_ids.index(active)
    return outfit_ids[(index + 1) % len(outfit_ids)]


def previous_outfit_id(buckets_dir: Path, active_bucket_path: Path) -> str:
    outfit_ids = _outfit_id_list(buckets_dir)
    if not outfit_ids:
        raise ValueError("no outfits found")
    active = _active_bucket_id(active_bucket_path)
    if active not in outfit_ids:
        return outfit_ids[-1]
    index = outfit_ids.index(active)
    return outfit_ids[(index - 1) % len(outfit_ids)]


def render_theme_css(outfit: dict[str, Any]) -> str:
    tokens = outfit.get("tokens", {})
    if not isinstance(tokens, dict):
        raise ValueError("invalid outfit token shape")

    token_lines = [f"  --{key}: {value};" for key, value in sorted(tokens.items())]
    header = [
        "/* Auto-generated from design-system bucket; do not hand-edit. */",
        f"/* Outfit: {outfit.get('id', 'unknown')} - {outfit.get('name', 'Unnamed')} */",
        ":root {",
    ]
    footer = ["}"]
    return "\n".join(header + token_lines + footer) + "\n"


def apply_outfit(
    *,
    buckets_dir: Path,
    active_bucket_path: Path,
    outfit_id: str,
    css_output_path: Path,
) -> dict[str, Any]:
    outfit = _load_outfit(buckets_dir, outfit_id)
    _set_active_bucket(active_bucket_path, outfit_id)
    css_output_path.parent.mkdir(parents=True, exist_ok=True)
    css_output_path.write_text(render_theme_css(outfit), encoding="utf-8")
    return {
        "id": outfit.get("id", outfit_id),
        "name": outfit.get("name", "Unnamed Outfit"),
        "description": outfit.get("description", ""),
        "css_output": str(css_output_path),
    }
