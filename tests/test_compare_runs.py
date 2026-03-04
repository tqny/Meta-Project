import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
import sys

sys.path.insert(0, str(ROOT / "src"))

from brandguard.compare_runs import (  # noqa: E402
    compare_runs,
    determine_default_pair,
    format_comparison_text,
    load_index,
)


class CompareRunsTest(unittest.TestCase):
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

        (run_dir / "manifest.json").write_text(
            json.dumps(
                {
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
            )
            + "\n",
            encoding="utf-8",
        )

        assignment_payload = {
            vendor: [f"CASE-{idx+1}" for idx in range(count)]
            for vendor, count in vendor_counts.items()
        }
        (run_dir / "vendor_assignments.json").write_text(
            json.dumps(assignment_payload) + "\n",
            encoding="utf-8",
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

    def test_compare_runs_reports_expected_deltas(self) -> None:
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

            index_path = runs_root / "index.json"
            index_path.write_text(
                json.dumps(
                    {
                        "schema_version": "1.0.0",
                        "artifact_type": "vertical-slice-run-index",
                        "generated_at": "2026-03-04T12:01:00+00:00",
                        "run_count": 2,
                        "runs": [run_new, run_old],
                    }
                )
                + "\n",
                encoding="utf-8",
            )

            comparison = compare_runs(
                repo_root=repo_root,
                index_path=index_path,
                baseline_run_id="run-old",
                candidate_run_id="run-new",
            )

            self.assertEqual(comparison.metric_deltas["domains"], 5)
            self.assertEqual(comparison.metric_deltas["cases"], -1)
            self.assertEqual(comparison.metric_deltas["campaigns"], -5)
            self.assertEqual(comparison.vendor_case_deltas["Vendor-A"], 1)
            self.assertEqual(comparison.vendor_case_deltas["Vendor-B"], -2)

            rendered = format_comparison_text(comparison)
            self.assertIn("domains: +5", rendered)
            self.assertIn("cases: -1", rendered)

    def test_default_pair_uses_latest_two(self) -> None:
        payload = {
            "runs": [
                {"run_id": "run-3"},
                {"run_id": "run-2"},
                {"run_id": "run-1"},
            ]
        }
        baseline, candidate = determine_default_pair(payload)
        self.assertEqual(baseline, "run-2")
        self.assertEqual(candidate, "run-3")

    def test_load_index_errors_when_missing(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaises(FileNotFoundError):
                load_index(Path(temp_dir) / "missing.json")


if __name__ == "__main__":
    unittest.main()
