# BrandGuard Weekly Run Trend Report

- Generated at (UTC): 2026-03-04T21:22:59.043985+00:00
- Indexed runs: 2

## Run Inventory

| run_id | generated_at | sample_size | threshold | cases | campaigns | vendor_assigned |
|---|---|---:|---:|---:|---:|---:|
| 2026-03-04-slice-02 | 2026-03-04T21:13:44.147887+00:00 | 55 | 0.68 | 28 | 27 | 28 |
| 2026-03-04-slice-01 | 2026-03-04T21:10:04.038938+00:00 | 50 | 0.7 | 29 | 32 | 29 |

## Run-over-Run Deltas

- 2026-03-04-slice-01 -> 2026-03-04-slice-02: threshold -0.02, cases -1, campaigns -5, vendor assigned -1

## Threshold vs Case Volume

- 2026-03-04-slice-01: threshold 0.7, cases 29, cases/domain 0.580
- 2026-03-04-slice-02: threshold 0.68, cases 28, cases/domain 0.509

## Vendor Load Trend

- 2026-03-04-slice-02: Vendor-A=19, Vendor-B=9
- 2026-03-04-slice-01: Vendor-A=19, Vendor-B=10

## Recommended Tuning Note

- Lowering threshold did not increase case volume. Hold current threshold and run at least one more controlled comparison before lowering further.
