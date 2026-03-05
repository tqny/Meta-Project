# BrandGuard Threshold Tuning Report

- Generated at (UTC): 2026-03-04T22:17:50.924918+00:00
- Evaluated runs: 12
- Total domains: 1440
- Candidate thresholds: 0.55 to 0.90 (step 0.02)
- Positive labels: phishing, brand abuse
- Policy guardrails: precision>=0.65, recall>=0.75, overflow ratio<=0.15

## Recommendation

- Recommended threshold: 0.69
- Selection mode: best-effort
- No evaluated threshold satisfied all policy guardrails.
- Selected best tradeoff using weighted score (F1, precision, recall, overflow penalty).
- Chosen threshold keeps overflow ratio at 0.003.

## Threshold Metrics

| threshold | precision | recall | f1 | case_volume | case_rate | overflow_ratio |
|---:|---:|---:|---:|---:|---:|---:|
| 0.55 | 0.611 | 0.893 | 0.725 | 1185 | 0.823 | 0.646 |
| 0.57 | 0.613 | 0.874 | 0.721 | 1157 | 0.803 | 0.607 |
| 0.59 | 0.611 | 0.842 | 0.709 | 1117 | 0.776 | 0.551 |
| 0.61 | 0.605 | 0.758 | 0.673 | 1016 | 0.706 | 0.411 |
| 0.63 | 0.611 | 0.731 | 0.666 | 971 | 0.674 | 0.349 |
| 0.65 | 0.628 | 0.695 | 0.660 | 898 | 0.624 | 0.247 |
| 0.67 | 0.673 | 0.656 | 0.664 | 791 | 0.549 | 0.099 |
| 0.69 | 0.698 | 0.621 | 0.658 | 722 | 0.501 | 0.003 |
| 0.71 | 0.741 | 0.559 | 0.637 | 611 | 0.424 | 0.000 |
| 0.73 | 0.851 | 0.494 | 0.626 | 471 | 0.327 | 0.000 |
| 0.75 | 0.928 | 0.429 | 0.587 | 375 | 0.260 | 0.000 |
| 0.77 | 0.932 | 0.355 | 0.514 | 309 | 0.215 | 0.000 |
| 0.79 | 0.955 | 0.263 | 0.412 | 223 | 0.155 | 0.000 |
| 0.81 | 1.000 | 0.088 | 0.161 | 71 | 0.049 | 0.000 |
| 0.83 | 1.000 | 0.016 | 0.032 | 13 | 0.009 | 0.000 |
| 0.85 | 1.000 | 0.001 | 0.002 | 1 | 0.001 | 0.000 |
| 0.87 | 0.000 | 0.000 | 0.000 | 0 | 0.000 | 0.000 |
| 0.89 | 0.000 | 0.000 | 0.000 | 0 | 0.000 | 0.000 |
| 0.90 | 0.000 | 0.000 | 0.000 | 0 | 0.000 | 0.000 |
