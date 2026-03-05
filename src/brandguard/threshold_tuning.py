from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any

from .pipeline import VerticalSliceConfig, run_vertical_slice


SCHEMA_VERSION = "1.0.0"
ARTIFACT_TYPE = "threshold-tuning-sweep"
DEFAULT_POSITIVE_LABELS = ("phishing", "brand abuse")


def _require_unit_interval(value: float, field_name: str) -> None:
    if value < 0.0 or value > 1.0:
        raise ValueError(f"{field_name} must be between 0.0 and 1.0")


def _safe_div(numerator: float, denominator: float) -> float:
    if denominator <= 0:
        return 0.0
    return numerator / denominator


def _threshold_values(minimum: float, maximum: float, step: float) -> tuple[float, ...]:
    if step <= 0:
        raise ValueError("threshold step must be greater than 0")
    if maximum < minimum:
        raise ValueError("threshold_max must be greater than or equal to threshold_min")

    span = maximum - minimum
    intervals = int((span / step) + 1e-9)
    values = [
        round(minimum + (step * idx), 4)
        for idx in range(intervals + 1)
        if (minimum + (step * idx)) <= (maximum + 1e-9)
    ]
    if not values or abs(values[-1] - maximum) > 1e-6:
        values.append(round(maximum, 4))
    unique_sorted = sorted(set(values))
    return tuple(unique_sorted)


@dataclass(frozen=True)
class ThresholdSweepConfig:
    sample_size: int = 120
    seed_start: int = 40
    seed_count: int = 12
    threshold_min: float = 0.55
    threshold_max: float = 0.90
    threshold_step: float = 0.02
    vendor_daily_capacity: int = 60
    positive_labels: tuple[str, ...] = DEFAULT_POSITIVE_LABELS
    min_precision: float = 0.65
    min_recall: float = 0.75
    max_overflow_ratio: float = 0.15

    def __post_init__(self) -> None:
        if self.sample_size <= 0:
            raise ValueError("sample_size must be greater than 0")
        if self.seed_count <= 0:
            raise ValueError("seed_count must be greater than 0")
        if self.vendor_daily_capacity <= 0:
            raise ValueError("vendor_daily_capacity must be greater than 0")
        if not self.positive_labels:
            raise ValueError("positive_labels must contain at least one label")
        _require_unit_interval(self.threshold_min, "threshold_min")
        _require_unit_interval(self.threshold_max, "threshold_max")
        _require_unit_interval(self.min_precision, "min_precision")
        _require_unit_interval(self.min_recall, "min_recall")
        _require_unit_interval(self.max_overflow_ratio, "max_overflow_ratio")
        _threshold_values(self.threshold_min, self.threshold_max, self.threshold_step)


@dataclass(frozen=True)
class ThresholdMetrics:
    threshold: float
    true_positive: int
    false_positive: int
    true_negative: int
    false_negative: int
    case_volume: int
    case_rate: float
    precision: float
    recall: float
    f1: float
    false_positive_rate: float
    vendor_overflow: int
    vendor_overflow_ratio: float


@dataclass(frozen=True)
class ThresholdRecommendation:
    threshold: float
    selection_mode: str
    rationale: tuple[str, ...]


@dataclass(frozen=True)
class ThresholdSweepResult:
    generated_at: str
    config: ThresholdSweepConfig
    evaluated_runs: int
    total_domains: int
    recommendation: ThresholdRecommendation
    thresholds: tuple[ThresholdMetrics, ...]


def _selection_score(metrics: ThresholdMetrics, target_recall: float) -> float:
    recall_gap = abs(metrics.recall - target_recall)
    return (
        (metrics.f1 * 0.70)
        + (metrics.precision * 0.20)
        + (metrics.recall * 0.10)
        - (metrics.vendor_overflow_ratio * 0.35)
        - (recall_gap * 0.05)
    )


def _select_recommendation(
    metrics: tuple[ThresholdMetrics, ...],
    config: ThresholdSweepConfig,
) -> ThresholdRecommendation:
    compliant = [
        row
        for row in metrics
        if row.precision >= config.min_precision
        and row.recall >= config.min_recall
        and row.vendor_overflow_ratio <= config.max_overflow_ratio
    ]

    if compliant:
        winner = max(
            compliant,
            key=lambda row: (row.f1, row.precision, -row.case_rate, row.threshold),
        )
        return ThresholdRecommendation(
            threshold=winner.threshold,
            selection_mode="policy-compliant",
            rationale=(
                "Selected highest-F1 threshold that meets precision, recall, and vendor overflow guardrails.",
                f"Precision {winner.precision:.3f} >= {config.min_precision:.3f} and "
                f"recall {winner.recall:.3f} >= {config.min_recall:.3f}.",
                f"Vendor overflow ratio {winner.vendor_overflow_ratio:.3f} <= {config.max_overflow_ratio:.3f}.",
            ),
        )

    winner = max(
        metrics,
        key=lambda row: (_selection_score(row, config.min_recall), row.threshold),
    )
    return ThresholdRecommendation(
        threshold=winner.threshold,
        selection_mode="best-effort",
        rationale=(
            "No evaluated threshold satisfied all policy guardrails.",
            "Selected best tradeoff using weighted score (F1, precision, recall, overflow penalty).",
            f"Chosen threshold keeps overflow ratio at {winner.vendor_overflow_ratio:.3f}.",
        ),
    )


def run_threshold_sweep(config: ThresholdSweepConfig | None = None) -> ThresholdSweepResult:
    cfg = config or ThresholdSweepConfig()
    thresholds = _threshold_values(cfg.threshold_min, cfg.threshold_max, cfg.threshold_step)
    positive = {label.strip().lower() for label in cfg.positive_labels if label.strip()}
    if not positive:
        raise ValueError("positive_labels normalization produced an empty set")

    counters: dict[float, dict[str, int]] = {
        threshold: {"tp": 0, "fp": 0, "tn": 0, "fn": 0}
        for threshold in thresholds
    }

    total_domains = 0
    for seed in range(cfg.seed_start, cfg.seed_start + cfg.seed_count):
        result = run_vertical_slice(
            VerticalSliceConfig(
                sample_size=cfg.sample_size,
                high_risk_threshold=1.0,
                seed=seed,
            )
        )

        for domain, assessment in zip(result.generated_domains, result.threat_assessments):
            actual_positive = str(domain.ground_truth.value).lower() in positive
            probability = assessment.activation_probability
            total_domains += 1
            for threshold in thresholds:
                predicted_positive = probability >= threshold
                bucket = counters[threshold]
                if predicted_positive and actual_positive:
                    bucket["tp"] += 1
                elif predicted_positive and not actual_positive:
                    bucket["fp"] += 1
                elif not predicted_positive and actual_positive:
                    bucket["fn"] += 1
                else:
                    bucket["tn"] += 1

    total_capacity = cfg.vendor_daily_capacity * cfg.seed_count
    metric_rows: list[ThresholdMetrics] = []
    for threshold in thresholds:
        bucket = counters[threshold]
        tp = bucket["tp"]
        fp = bucket["fp"]
        tn = bucket["tn"]
        fn = bucket["fn"]
        case_volume = tp + fp

        precision = _safe_div(tp, tp + fp)
        recall = _safe_div(tp, tp + fn)
        f1 = _safe_div(2 * precision * recall, precision + recall)
        false_positive_rate = _safe_div(fp, fp + tn)
        case_rate = _safe_div(case_volume, total_domains)
        overflow = max(0, case_volume - total_capacity)
        overflow_ratio = _safe_div(overflow, total_capacity)

        metric_rows.append(
            ThresholdMetrics(
                threshold=threshold,
                true_positive=tp,
                false_positive=fp,
                true_negative=tn,
                false_negative=fn,
                case_volume=case_volume,
                case_rate=case_rate,
                precision=precision,
                recall=recall,
                f1=f1,
                false_positive_rate=false_positive_rate,
                vendor_overflow=overflow,
                vendor_overflow_ratio=overflow_ratio,
            )
        )

    ordered_rows = tuple(sorted(metric_rows, key=lambda row: row.threshold))
    recommendation = _select_recommendation(ordered_rows, cfg)
    generated_at = datetime.now(timezone.utc).isoformat()
    return ThresholdSweepResult(
        generated_at=generated_at,
        config=cfg,
        evaluated_runs=cfg.seed_count,
        total_domains=total_domains,
        recommendation=recommendation,
        thresholds=ordered_rows,
    )


def threshold_sweep_to_dict(result: ThresholdSweepResult) -> dict[str, Any]:
    payload = asdict(result)
    payload["schema_version"] = SCHEMA_VERSION
    payload["artifact_type"] = ARTIFACT_TYPE
    return payload


def write_threshold_sweep_artifact(result: ThresholdSweepResult, output_path: Path) -> Path:
    payload = threshold_sweep_to_dict(result)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return output_path


def render_threshold_sweep_markdown(result: ThresholdSweepResult) -> str:
    lines: list[str] = []
    lines.append("# BrandGuard Threshold Tuning Report")
    lines.append("")
    lines.append(f"- Generated at (UTC): {result.generated_at}")
    lines.append(f"- Evaluated runs: {result.evaluated_runs}")
    lines.append(f"- Total domains: {result.total_domains}")
    lines.append(
        f"- Candidate thresholds: {result.config.threshold_min:.2f} to {result.config.threshold_max:.2f} "
        f"(step {result.config.threshold_step:.2f})"
    )
    lines.append(f"- Positive labels: {', '.join(result.config.positive_labels)}")
    lines.append(
        "- Policy guardrails: "
        f"precision>={result.config.min_precision:.2f}, "
        f"recall>={result.config.min_recall:.2f}, "
        f"overflow ratio<={result.config.max_overflow_ratio:.2f}"
    )
    lines.append("")
    lines.append("## Recommendation")
    lines.append("")
    lines.append(f"- Recommended threshold: {result.recommendation.threshold:.2f}")
    lines.append(f"- Selection mode: {result.recommendation.selection_mode}")
    for item in result.recommendation.rationale:
        lines.append(f"- {item}")

    lines.append("")
    lines.append("## Threshold Metrics")
    lines.append("")
    lines.append(
        "| threshold | precision | recall | f1 | case_volume | case_rate | overflow_ratio |"
    )
    lines.append("|---:|---:|---:|---:|---:|---:|---:|")
    for row in result.thresholds:
        lines.append(
            f"| {row.threshold:.2f} | {row.precision:.3f} | {row.recall:.3f} | {row.f1:.3f} | "
            f"{row.case_volume} | {row.case_rate:.3f} | {row.vendor_overflow_ratio:.3f} |"
        )

    return "\n".join(lines) + "\n"
