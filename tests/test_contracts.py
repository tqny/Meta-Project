import pathlib
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from brandguard.contracts import (  # noqa: E402
    CaseStatus,
    ConfidenceLevel,
    EnforcementAction,
    EnforcementCase,
    ThreatAssessment,
    ThreatType,
)


class ContractsTest(unittest.TestCase):
    def test_threat_score_maps_from_probability(self) -> None:
        assessment = ThreatAssessment(
            domain="facebook-login-support.com",
            activation_probability=0.82,
            predicted_threat_type=ThreatType.CREDENTIAL_PHISHING,
            confidence=ConfidenceLevel.HIGH,
            contributing_factors=("brand similarity", "active dns"),
            model_version="v0.1.0",
        )
        self.assertEqual(assessment.threat_score, 82)

    def test_probability_bounds_are_enforced(self) -> None:
        with self.assertRaises(ValueError):
            ThreatAssessment(
                domain="meta-account-security.net",
                activation_probability=1.2,
                predicted_threat_type=ThreatType.BRAND_IMPERSONATION,
                confidence=ConfidenceLevel.MEDIUM,
                contributing_factors=("keyword",),
                model_version="v0.1.0",
            )

    def test_case_transition_writes_audit_entry(self) -> None:
        case = EnforcementCase(
            case_id="BG-1042",
            domain="facebook-login-support.com",
            threat_score=82,
            predicted_threat_type=ThreatType.CREDENTIAL_PHISHING,
            target_brand="Facebook",
            registrar="Namecheap",
            recommended_action=EnforcementAction.REGISTRAR_TAKEDOWN,
            explanation=("brand impersonation detected",),
        )
        case.transition(
            to_status=CaseStatus.UNDER_REVIEW,
            actor="triage-analyst",
            note="initial triage complete",
        )
        self.assertEqual(case.status, CaseStatus.UNDER_REVIEW)
        self.assertEqual(len(case.audit_log), 1)
        self.assertEqual(case.audit_log[0].from_status, CaseStatus.OPEN)
        self.assertEqual(case.audit_log[0].to_status, CaseStatus.UNDER_REVIEW)

    def test_invalid_transition_raises(self) -> None:
        case = EnforcementCase(
            case_id="BG-2048",
            domain="threads-confirm-account.xyz",
            threat_score=75,
            predicted_threat_type=ThreatType.BRAND_IMPERSONATION,
            target_brand="Threads",
            registrar="RegistrarX",
            explanation=("suspicious keyword: confirm",),
        )
        with self.assertRaises(ValueError):
            case.transition(
                to_status=CaseStatus.RESOLVED,
                actor="triage-analyst",
            )


if __name__ == "__main__":
    unittest.main()

