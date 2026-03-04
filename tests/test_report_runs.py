import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
import sys

sys.path.insert(0, str(ROOT / "src"))

from brandguard.report_runs import (  # noqa: E402
    generate_weekly_run_report,
    load_run_index,
    recommend_tuning_note,
    render_weekly_run_report,
)


class ReportRunsTest(unittest.TestCase):
    def _write_run(
        self,
        runs_root: Path,
        *,
        run_id: str,
        generated_at: str,
        sample_size: int,
        threshold: float,
        seed: int,
        domains: int,
        cases: int,
        campaigns: int,
        vendor_assigned_cases: int,
        vendor_counts: dict[str, int],
    ) -> dict:
        run_dir = runs_root / run_id
        run_dir.mkdir(parents=True, exist_ok=True)

        manifest = {
            "run_id": run_id,
            "generated_at": generated_at,
            "config": {
                "sample_size": sample_size,
                "high_risk_threshold": threshold,
                "seed": seed,
            },
            "counts": {
                "domains": domains,
                "cases": cases,
                "campaigns": campaigns,
                "vendor_assigned_cases": vendor_assigned_cases,
            },
            "summary_markdown_path": f"docs/demos/{run_id}.md",
        }
        (run_dir / "manifest.json").write_text(json.dumps(manifest) + "\n", encoding="utf-8")

        assignments = {
            vendor: [f"CASE-{idx+1}" for idx in range(count)]
            for vendor, count in vendor_counts.items()
        }
        (run_dir / "vendor_assignments.json").write_text(
            json.dumps(assignments) + "\n", encoding="utf-8"
        )

        return {
            "run_id": run_id,
            "generated_at": generated_at,
            "sample_size": sample_size,
            "high_risk_threshold": threshold,
            "seed": seed,
            "domains": domains,
            "cases": cases,
            "campaigns": campaigns,
            "vendor_assigned_cases": vendor_assigned_cases,
            "summary_markdown_path": f"docs/demos/{run_id}.md",
            "run_path": f"docs/metrics/runs/{run_id}",
            "manifest_path": f"docs/metrics/runs/{run_id}/manifest.json",
        }

    def test_render_report_contains_expected_sections(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            runs_root = repo_root / "docs" / "metrics" / "runs"
            runs_root.mkdir(parents=True, exist_ok=True)

            run_old = self._write_run(
                runs_root,
                run_id="run-old",
                generated_at="2026-03-04T10:00:00+00:00",
                sample_size=50,
                threshold=0.70,
                seed=42,
                domains=50,
                cases=29,
                campaigns=32,
                vendor_assigned_cases=29,
                vendor_counts={"Vendor-A": 19, "Vendor-B": 10},
            )
            run_new = self._write_run(
                runs_root,
                run_id="run-new",
                generated_at="2026-03-04T12:00:00+00:00",
                sample_size=55,
                threshold=0.68,
                seed=52,
                domains=55,
                cases=28,
                campaigns=27,
                vendor_assigned_cases=28,
                vendor_counts={"Vendor-A": 20, "Vendor-B": 8},
            )

            payload = {
                "schema_version": "1.0.0",
                "artifact_type": "vertical-slice-run-index",
                "generated_at": "2026-03-04T12:01:00+00:00",
                "run_count": 2,
                "runs": [run_new, run_old],
            }

            report = render_weekly_run_report(index_payload=payload, repo_root=repo_root)
            self.assertIn("# BrandGuard Weekly Run Trend Report", report)
            self.assertIn("## Run-over-Run Deltas", report)
            self.assertIn("run-old -> run-new", report)
            self.assertIn("threshold -0.02", report)
            self.assertIn("cases -1", report)
            self.assertIn("Vendor-A=20", report)
            self.assertIn("## Recommended Tuning Note", report)

    def test_generate_report_writes_file(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            runs_root = repo_root / "docs" / "metrics" / "runs"
            runs_root.mkdir(parents=True, exist_ok=True)

            run = self._write_run(
                runs_root,
                run_id="run-01",
                generated_at="2026-03-04T10:00:00+00:00",
                sample_size=20,
                threshold=0.70,
                seed=1,
                domains=20,
                cases=10,
                campaigns=4,
                vendor_assigned_cases=10,
                vendor_counts={"Vendor-A": 10},
            )

            index = {
                "schema_version": "1.0.0",
                "artifact_type": "vertical-slice-run-index",
                "generated_at": "2026-03-04T10:01:00+00:00",
                "run_count": 1,
                "runs": [run],
            }
            index_path = runs_root / "index.json"
            index_path.write_text(json.dumps(index) + "\n", encoding="utf-8")

            output_path = repo_root / "docs" / "metrics" / "WEEKLY_RUN_REPORT_2026-03-04.md"
            generated = generate_weekly_run_report(
                repo_root=repo_root,
                index_path=index_path,
                output_path=output_path,
            )
            self.assertTrue(output_path.exists())
            self.assertIn("Indexed runs: 1", generated)

    def test_recommendation_for_insufficient_history(self) -> None:
        note = recommend_tuning_note(
            [
                {
                    "run_id": "run-01",
                    "high_risk_threshold": 0.70,
                    "cases": 10,
                    "vendor_assigned_cases": 10,
                }
            ]
        )
        self.assertIn("Insufficient run history", note)

    def test_load_run_index_missing_file(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaises(FileNotFoundError):
                load_run_index(Path(temp_dir) / "missing-index.json")


if __name__ == "__main__":
    unittest.main()
