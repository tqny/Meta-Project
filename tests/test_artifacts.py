import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
import sys

sys.path.insert(0, str(ROOT / "src"))

from brandguard.artifacts import write_vertical_slice_artifacts  # noqa: E402
from brandguard.pipeline import VerticalSliceConfig, run_vertical_slice  # noqa: E402


class ArtifactWriterTest(unittest.TestCase):
    def test_vertical_slice_artifacts_are_written(self) -> None:
        config = VerticalSliceConfig(sample_size=20, high_risk_threshold=0.68, seed=13)
        result = run_vertical_slice(config)

        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir) / "run-01"
            summary_path = Path(temp_dir) / "summary.md"
            summary_path.write_text("# Summary\n", encoding="utf-8")

            paths = write_vertical_slice_artifacts(
                result=result,
                config=config,
                output_dir=output_dir,
                run_id="run-01",
                summary_markdown_path=summary_path,
            )

            expected = {
                "domains",
                "impersonation_signals",
                "infrastructure_signals",
                "threat_assessments",
                "campaigns",
                "cases",
                "vendor_assignments",
                "weekly_summary",
                "manifest",
            }
            self.assertEqual(set(paths.keys()), expected)
            for path in paths.values():
                self.assertTrue(path.exists())

            manifest = json.loads(paths["manifest"].read_text(encoding="utf-8"))
            self.assertEqual(manifest["schema_version"], "1.0.0")
            self.assertEqual(manifest["run_id"], "run-01")
            self.assertEqual(manifest["config"]["sample_size"], 20)
            self.assertEqual(manifest["counts"]["domains"], 20)

            domains_lines = [
                line for line in paths["domains"].read_text(encoding="utf-8").splitlines() if line.strip()
            ]
            self.assertEqual(len(domains_lines), 20)


if __name__ == "__main__":
    unittest.main()
