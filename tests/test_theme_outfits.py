import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
import sys

sys.path.insert(0, str(ROOT / "src"))

from brandguard.theme_outfits import (  # noqa: E402
    apply_outfit,
    list_outfits,
    next_outfit_id,
    previous_outfit_id,
)


class ThemeOutfitTest(unittest.TestCase):
    def _setup_buckets(self, root: Path) -> tuple[Path, Path, Path]:
        buckets_dir = root / "design-system" / "buckets"
        buckets_dir.mkdir(parents=True, exist_ok=True)

        (buckets_dir / "idea-01.json").write_text(
            json.dumps(
                {
                    "id": "idea-01",
                    "name": "One",
                    "tokens": {
                        "color_bg": "#ffffff",
                        "color_text": "#111111",
                    },
                }
            )
            + "\n",
            encoding="utf-8",
        )
        (buckets_dir / "idea-02.json").write_text(
            json.dumps(
                {
                    "id": "idea-02",
                    "name": "Two",
                    "tokens": {
                        "color_bg": "#eeeeee",
                        "color_text": "#222222",
                    },
                }
            )
            + "\n",
            encoding="utf-8",
        )

        active_bucket = buckets_dir / "active-bucket.json"
        active_bucket.write_text(
            json.dumps({"activeBucketId": "idea-01", "updatedAt": "2026-03-04T00:00:00+00:00"}) + "\n",
            encoding="utf-8",
        )
        css_path = root / "dashboard" / "legacy-firecrawl" / "theme.css"
        return buckets_dir, active_bucket, css_path

    def test_list_and_cycle(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            buckets_dir, active_bucket, _css_path = self._setup_buckets(Path(temp_dir))
            outfits = list_outfits(buckets_dir, active_bucket)
            self.assertEqual(len(outfits), 2)
            self.assertTrue(outfits[0]["is_active"])
            self.assertEqual(next_outfit_id(buckets_dir, active_bucket), "idea-02")
            self.assertEqual(previous_outfit_id(buckets_dir, active_bucket), "idea-02")

    def test_apply_outfit_updates_active_and_css(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            buckets_dir, active_bucket, css_path = self._setup_buckets(Path(temp_dir))
            result = apply_outfit(
                buckets_dir=buckets_dir,
                active_bucket_path=active_bucket,
                outfit_id="idea-02",
                css_output_path=css_path,
            )

            self.assertEqual(result["id"], "idea-02")
            active_payload = json.loads(active_bucket.read_text(encoding="utf-8"))
            self.assertEqual(active_payload["activeBucketId"], "idea-02")
            css = css_path.read_text(encoding="utf-8")
            self.assertIn("--color_bg: #eeeeee;", css)


if __name__ == "__main__":
    unittest.main()
