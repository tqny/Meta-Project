import pathlib
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from brandguard.contracts import CaseStatus  # noqa: E402
from brandguard.pipeline import VerticalSliceConfig, run_vertical_slice  # noqa: E402


class VerticalSliceTest(unittest.TestCase):
    def test_vertical_slice_generates_expected_counts(self) -> None:
        result = run_vertical_slice(VerticalSliceConfig(sample_size=30, high_risk_threshold=0.68, seed=7))

        self.assertEqual(len(result.generated_domains), 30)
        self.assertEqual(len(result.impersonation_signals), 30)
        self.assertEqual(len(result.infrastructure_signals), 30)
        self.assertEqual(len(result.threat_assessments), 30)
        self.assertGreater(len(result.cases), 0)

    def test_opened_cases_are_triaged_and_audited(self) -> None:
        result = run_vertical_slice(VerticalSliceConfig(sample_size=25, high_risk_threshold=0.7, seed=9))

        for case in result.cases:
            self.assertEqual(case.status, CaseStatus.UNDER_REVIEW)
            self.assertGreaterEqual(len(case.audit_log), 1)
            self.assertTrue(case.explanation)

    def test_vendor_assignments_respect_capacity(self) -> None:
        result = run_vertical_slice(VerticalSliceConfig(sample_size=120, high_risk_threshold=0.6, seed=11))
        assigned_total = sum(len(queue) for queue in result.vendor_assignments.values())
        self.assertLessEqual(assigned_total, 60)
        self.assertGreater(len(result.vendor_assignments.get("Vendor-A", ())), 0)
        self.assertGreater(len(result.vendor_assignments.get("Vendor-B", ())), 0)


if __name__ == "__main__":
    unittest.main()
