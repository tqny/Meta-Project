from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
import sys

sys.path.insert(0, str(ROOT / "src"))

from brandguard.threshold_tuning import (  # noqa: E402
    ThresholdSweepConfig,
    render_threshold_sweep_markdown,
    run_threshold_sweep,
)


class ThresholdTuningTest(unittest.TestCase):
    def test_threshold_grid_respects_maximum_bound(self) -> None:
        result = run_threshold_sweep(
            ThresholdSweepConfig(
                sample_size=15,
                seed_start=1,
                seed_count=1,
                threshold_min=0.55,
                threshold_max=0.90,
                threshold_step=0.02,
                vendor_daily_capacity=20,
            )
        )

        thresholds = [row.threshold for row in result.thresholds]
        self.assertEqual(thresholds[-1], 0.9)
        self.assertTrue(all(value <= 0.9 for value in thresholds))

    def test_case_volume_decreases_as_threshold_increases(self) -> None:
        result = run_threshold_sweep(
            ThresholdSweepConfig(
                sample_size=40,
                seed_start=20,
                seed_count=3,
                threshold_min=0.60,
                threshold_max=0.80,
                threshold_step=0.10,
                vendor_daily_capacity=60,
            )
        )

        thresholds = [row.threshold for row in result.thresholds]
        self.assertEqual(thresholds, [0.6, 0.7, 0.8])

        volumes = [row.case_volume for row in result.thresholds]
        self.assertGreaterEqual(volumes[0], volumes[1])
        self.assertGreaterEqual(volumes[1], volumes[2])

    def test_recommendation_is_in_threshold_grid(self) -> None:
        result = run_threshold_sweep(
            ThresholdSweepConfig(
                sample_size=30,
                seed_start=5,
                seed_count=2,
                threshold_min=0.55,
                threshold_max=0.75,
                threshold_step=0.10,
                vendor_daily_capacity=30,
                min_precision=0.10,
                min_recall=0.10,
                max_overflow_ratio=1.0,
            )
        )

        grid = {row.threshold for row in result.thresholds}
        self.assertIn(result.recommendation.threshold, grid)
        self.assertGreater(result.total_domains, 0)

        for row in result.thresholds:
            self.assertGreaterEqual(row.precision, 0.0)
            self.assertLessEqual(row.precision, 1.0)
            self.assertGreaterEqual(row.recall, 0.0)
            self.assertLessEqual(row.recall, 1.0)
            self.assertGreaterEqual(row.f1, 0.0)
            self.assertLessEqual(row.f1, 1.0)

    def test_markdown_render_contains_sections(self) -> None:
        result = run_threshold_sweep(
            ThresholdSweepConfig(
                sample_size=20,
                seed_start=1,
                seed_count=1,
                threshold_min=0.60,
                threshold_max=0.70,
                threshold_step=0.10,
                vendor_daily_capacity=20,
            )
        )

        report = render_threshold_sweep_markdown(result)
        self.assertIn("# BrandGuard Threshold Tuning Report", report)
        self.assertIn("## Recommendation", report)
        self.assertIn("## Threshold Metrics", report)


if __name__ == "__main__":
    unittest.main()
