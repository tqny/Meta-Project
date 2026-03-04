import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
import sys

sys.path.insert(0, str(ROOT / "src"))

from brandguard.run_index import build_run_index_payload, write_run_index  # noqa: E402


class RunIndexTest(unittest.TestCase):
    def test_run_index_sorts_latest_first(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            runs_root = repo_root / "docs" / "metrics" / "runs"
            runs_root.mkdir(parents=True, exist_ok=True)

            run_old = runs_root / "run-old"
            run_new = runs_root / "run-new"
            run_old.mkdir()
            run_new.mkdir()

            (run_old / "manifest.json").write_text(
                json.dumps(
                    {
                        "run_id": "run-old",
                        "generated_at": "2026-03-04T10:00:00+00:00",
                        "config": {"sample_size": 20, "high_risk_threshold": 0.7, "seed": 1},
                        "counts": {"domains": 20, "cases": 5, "campaigns": 3, "vendor_assigned_cases": 5},
                        "summary_markdown_path": "docs/demos/run-old.md",
                    }
                ),
                encoding="utf-8",
            )
            (run_new / "manifest.json").write_text(
                json.dumps(
                    {
                        "run_id": "run-new",
                        "generated_at": "2026-03-04T12:00:00+00:00",
                        "config": {"sample_size": 30, "high_risk_threshold": 0.65, "seed": 2},
                        "counts": {"domains": 30, "cases": 9, "campaigns": 4, "vendor_assigned_cases": 9},
                        "summary_markdown_path": "docs/demos/run-new.md",
                    }
                ),
                encoding="utf-8",
            )

            payload = build_run_index_payload(runs_root=runs_root, path_base=repo_root)
            self.assertEqual(payload["run_count"], 2)
            self.assertEqual(payload["runs"][0]["run_id"], "run-new")
            self.assertEqual(payload["runs"][1]["run_id"], "run-old")
            self.assertEqual(payload["runs"][0]["run_path"], "docs/metrics/runs/run-new")

    def test_write_run_index_creates_file(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            runs_root = repo_root / "docs" / "metrics" / "runs"
            run_dir = runs_root / "run-01"
            run_dir.mkdir(parents=True, exist_ok=True)

            (run_dir / "manifest.json").write_text(
                json.dumps(
                    {
                        "run_id": "run-01",
                        "generated_at": "2026-03-04T13:00:00+00:00",
                        "config": {"sample_size": 10, "high_risk_threshold": 0.7, "seed": 7},
                        "counts": {"domains": 10, "cases": 3, "campaigns": 2, "vendor_assigned_cases": 3},
                        "summary_markdown_path": "docs/demos/run-01.md",
                    }
                ),
                encoding="utf-8",
            )

            index_path = write_run_index(
                runs_root=runs_root,
                index_path=runs_root / "index.json",
                path_base=repo_root,
            )
            self.assertTrue(index_path.exists())
            payload = json.loads(index_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["artifact_type"], "vertical-slice-run-index")
            self.assertEqual(payload["run_count"], 1)
            self.assertEqual(payload["runs"][0]["run_id"], "run-01")


if __name__ == "__main__":
    unittest.main()
