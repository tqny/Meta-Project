import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
import sys

sys.path.insert(0, str(ROOT / "src"))

from brandguard.product_v1 import build_product_v1_payload  # noqa: E402


class ProductV1Test(unittest.TestCase):
    def test_build_payload_from_indexed_run(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_root = Path(temp_dir)
            run_dir = repo_root / "docs" / "metrics" / "runs" / "run-01"
            run_dir.mkdir(parents=True, exist_ok=True)

            (run_dir / "manifest.json").write_text(
                json.dumps(
                    {
                        "run_id": "run-01",
                        "generated_at": "2026-03-04T10:00:00+00:00",
                        "config": {"sample_size": 5, "high_risk_threshold": 0.7, "seed": 7},
                        "counts": {
                            "domains": 5,
                            "cases": 2,
                            "campaigns": 1,
                            "vendor_assigned_cases": 2,
                        },
                    }
                )
                + "\n",
                encoding="utf-8",
            )

            (run_dir / "domains.jsonl").write_text(
                "\n".join(
                    [
                        json.dumps({"domain": "facebook-login-support.com", "ground_truth": "phishing"}),
                        json.dumps({"domain": "meta-account-security.net", "ground_truth": "brand abuse"}),
                    ]
                )
                + "\n",
                encoding="utf-8",
            )
            (run_dir / "campaigns.jsonl").write_text(
                json.dumps(
                    {
                        "campaign_id": "CMP-0001",
                        "domains": ["facebook-login-support.com", "meta-account-security.net"],
                        "primary_keyword": "login",
                        "primary_brand": "Facebook",
                        "recommendation": "campaign takedown escalation",
                    }
                )
                + "\n",
                encoding="utf-8",
            )
            (run_dir / "cases.jsonl").write_text(
                "\n".join(
                    [
                        json.dumps(
                            {
                                "case_id": "BG-1000",
                                "domain": "facebook-login-support.com",
                                "threat_score": 84,
                                "predicted_threat_type": "credential phishing",
                                "target_brand": "Facebook",
                                "registrar": "Namecheap",
                                "status": "Under Review",
                                "recommended_action": "Registrar takedown",
                                "campaign_id": "CMP-0001",
                                "explanation": ["Brand similarity 0.91"],
                                "audit_log": [],
                            }
                        ),
                        json.dumps(
                            {
                                "case_id": "BG-1001",
                                "domain": "meta-account-security.net",
                                "threat_score": 72,
                                "predicted_threat_type": "brand impersonation",
                                "target_brand": "Meta",
                                "registrar": "GoDaddy",
                                "status": "Under Review",
                                "recommended_action": "Campaign escalation",
                                "campaign_id": "CMP-0001",
                                "explanation": ["Suspicious keyword: security"],
                                "audit_log": [],
                            }
                        ),
                    ]
                )
                + "\n",
                encoding="utf-8",
            )
            (run_dir / "threat_assessments.jsonl").write_text(
                "\n".join(
                    [
                        json.dumps(
                            {
                                "domain": "facebook-login-support.com",
                                "activation_probability": 0.84,
                                "confidence": "high",
                            }
                        ),
                        json.dumps(
                            {
                                "domain": "meta-account-security.net",
                                "activation_probability": 0.72,
                                "confidence": "medium",
                            }
                        ),
                    ]
                )
                + "\n",
                encoding="utf-8",
            )
            (run_dir / "vendor_assignments.json").write_text(
                json.dumps({"Vendor-A": ["BG-1000"], "Vendor-B": ["BG-1001"]}) + "\n",
                encoding="utf-8",
            )
            (run_dir / "weekly_summary.json").write_text(
                json.dumps(
                    {
                        "week_start": "2026-03-02T00:00:00+00:00",
                        "domains_analyzed": 5,
                        "cases_opened": 2,
                        "cases_resolved": 0,
                        "average_time_to_action_hours": 4.2,
                        "top_abused_keywords": ["login"],
                        "top_abused_tlds": ["com"],
                        "campaign_trends": "Coordinated credential phishing pattern",
                    }
                )
                + "\n",
                encoding="utf-8",
            )

            index_path = repo_root / "docs" / "metrics" / "runs" / "index.json"
            index_path.write_text(
                json.dumps(
                    {
                        "runs": [
                            {
                                "run_id": "run-01",
                                "generated_at": "2026-03-04T10:00:00+00:00",
                                "sample_size": 5,
                                "high_risk_threshold": 0.7,
                                "seed": 7,
                                "domains": 5,
                                "cases": 2,
                                "campaigns": 1,
                                "vendor_assigned_cases": 2,
                                "run_path": "docs/metrics/runs/run-01",
                            }
                        ]
                    }
                )
                + "\n",
                encoding="utf-8",
            )
            tuning_path = repo_root / "docs" / "metrics" / "threshold_tuning" / "latest.json"
            tuning_path.parent.mkdir(parents=True, exist_ok=True)
            tuning_path.write_text(
                json.dumps(
                    {
                        "generated_at": "2026-03-04T11:00:00+00:00",
                        "evaluated_runs": 4,
                        "total_domains": 200,
                        "config": {
                            "min_precision": 0.65,
                            "min_recall": 0.75,
                            "max_overflow_ratio": 0.15,
                        },
                        "recommendation": {
                            "threshold": 0.72,
                            "selection_mode": "policy-compliant",
                            "rationale": ["best f1 within policy"],
                        },
                        "thresholds": [
                            {
                                "threshold": 0.72,
                                "precision": 0.81,
                                "recall": 0.77,
                                "f1": 0.79,
                                "case_rate": 0.35,
                                "case_volume": 70,
                                "vendor_overflow_ratio": 0.04,
                            },
                            {
                                "threshold": 0.7,
                                "precision": 0.78,
                                "recall": 0.81,
                                "f1": 0.79,
                                "case_rate": 0.39,
                                "case_volume": 78,
                                "vendor_overflow_ratio": 0.10,
                            },
                        ],
                    }
                )
                + "\n",
                encoding="utf-8",
            )

            payload = build_product_v1_payload(
                repo_root=repo_root,
                run_id="run-01",
                index_path=index_path,
                tuning_path=tuning_path,
            )

            self.assertEqual(payload["run"]["run_id"], "run-01")
            self.assertEqual(payload["overview"]["cases_opened"], 2)
            self.assertEqual(payload["overview"]["active_campaigns"], 1)
            self.assertEqual(payload["queue"][0]["case_id"], "BG-1000")
            self.assertIn("Escalated", payload["queue"][0]["allowed_transitions"])
            self.assertEqual(payload["vendors"][0]["vendor"], "Vendor-A")
            self.assertTrue(payload["threshold_tuning"]["available"])
            self.assertEqual(payload["threshold_tuning"]["recommended_threshold"], 0.72)
            self.assertAlmostEqual(payload["overview"]["threshold_gap"], -0.02, places=6)


if __name__ == "__main__":
    unittest.main()
