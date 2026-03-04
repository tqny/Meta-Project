from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from difflib import SequenceMatcher
import hashlib
import random
from typing import Sequence

from .contracts import (
    CampaignCluster,
    CaseStatus,
    ConfidenceLevel,
    DomainCandidate,
    EnforcementAction,
    EnforcementCase,
    EnforcementRecommendation,
    GroundTruthLabel,
    ImpersonationSignals,
    InfrastructureSignals,
    ThreatAssessment,
    ThreatType,
    WeeklyExecutiveSummary,
)
from .interfaces import (
    BrandImpersonationDetector,
    CampaignClusterer,
    CaseCreationEngine,
    CaseLifecycleManager,
    DomainGenerationEngine,
    EnforcementRecommendationEngine,
    ExecutiveReporter,
    InfrastructureSignalSimulator,
    PredictiveThreatModel,
    VendorCapacity,
    VendorQueueRouter,
)


DEFAULT_BRAND_KEYWORDS = ("facebook", "instagram", "meta", "threads", "whatsapp")
DEFAULT_ATTACK_KEYWORDS = (
    "login",
    "support",
    "security",
    "verify",
    "auth",
    "confirm",
    "account",
    "help",
)
DEFAULT_TLDS = ("com", "net", "org", "site", "xyz")
DEFAULT_TYPO_PATTERNS = ("replace_o_with_0", "double_char", "drop_char", "none")

_REGISTRAR_PROFILES = (
    ("Namecheap", 0.55),
    ("GoDaddy", 0.35),
    ("Porkbun", 0.45),
    ("Dynadot", 0.5),
    ("RegistrarX", 0.7),
)
_TLD_RISK = {
    "com": 0.45,
    "net": 0.5,
    "org": 0.35,
    "site": 0.7,
    "xyz": 0.75,
    "info": 0.65,
}


@dataclass(frozen=True)
class VerticalSliceConfig:
    sample_size: int = 50
    high_risk_threshold: float = 0.7
    seed: int = 42


@dataclass(frozen=True)
class VerticalSliceResult:
    generated_domains: tuple[DomainCandidate, ...]
    impersonation_signals: tuple[ImpersonationSignals, ...]
    infrastructure_signals: tuple[InfrastructureSignals, ...]
    threat_assessments: tuple[ThreatAssessment, ...]
    campaigns: tuple[CampaignCluster, ...]
    cases: tuple[EnforcementCase, ...]
    vendor_assignments: dict[str, tuple[EnforcementCase, ...]]
    weekly_summary: WeeklyExecutiveSummary


def _week_start_utc(reference: datetime | None = None) -> datetime:
    now = reference or datetime.now(timezone.utc)
    start_of_day = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    return start_of_day - timedelta(days=start_of_day.weekday())


def _levenshtein_distance(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)

    prev = list(range(len(b) + 1))
    for i, char_a in enumerate(a, start=1):
        curr = [i]
        for j, char_b in enumerate(b, start=1):
            insertions = prev[j] + 1
            deletions = curr[j - 1] + 1
            substitutions = prev[j - 1] + (char_a != char_b)
            curr.append(min(insertions, deletions, substitutions))
        prev = curr
    return prev[-1]


def _domain_tokens(domain: str) -> tuple[str, ...]:
    root = domain.lower().split(".")[0]
    tokens = tuple(token for token in root.replace("_", "-").split("-") if token)
    return tokens


def _brand_from_domain(domain: str) -> str:
    lowered = domain.lower()
    for brand in DEFAULT_BRAND_KEYWORDS:
        if brand in lowered:
            return brand.capitalize()
    return "Unknown"


def _deterministic_unit_interval(seed: int, key: str) -> float:
    digest = hashlib.sha256(f"{seed}:{key}".encode("utf-8")).hexdigest()
    value = int(digest[:12], 16)
    return value / float(0xFFFFFFFFFFFF)


def _apply_typo(brand: str, pattern: str) -> str:
    if pattern == "replace_o_with_0":
        return brand.replace("o", "0")
    if pattern == "double_char" and brand:
        return f"{brand[0]}{brand}"
    if pattern == "drop_char" and len(brand) > 4:
        return brand[:-1]
    return brand


def _clamp(value: float, floor: float = 0.0, ceil: float = 1.0) -> float:
    return max(floor, min(ceil, value))


class SimpleDomainGenerationEngine(DomainGenerationEngine):
    def __init__(self, seed: int = 42) -> None:
        self._random = random.Random(seed)

    def generate(
        self,
        *,
        brand_keywords: Sequence[str],
        attack_keywords: Sequence[str],
        tld_list: Sequence[str],
        typo_patterns: Sequence[str],
        sample_size: int,
    ) -> list[DomainCandidate]:
        if sample_size <= 0:
            return []

        brands = [b.lower() for b in brand_keywords if b]
        attacks = [a.lower() for a in attack_keywords if a]
        tlds = [t.strip(".").lower() for t in tld_list if t]
        typos = [t for t in typo_patterns if t]
        if not brands or not attacks or not tlds:
            raise ValueError("brand_keywords, attack_keywords, and tld_list must be non-empty")

        templates = (
            "{brand}-{attack}-support.{tld}",
            "{brand}-account-{attack}.{tld}",
            "{brand}-{attack}-help.{tld}",
            "{attack}-{brand}-security.{tld}",
        )
        seen: set[str] = set()
        generated: list[DomainCandidate] = []

        for index in range(sample_size):
            brand = brands[index % len(brands)]
            attack = attacks[(index + self._random.randint(0, len(attacks) - 1)) % len(attacks)]
            typo = typos[index % len(typos)] if typos else "none"
            tld = tlds[index % len(tlds)]
            brand_variant = _apply_typo(brand, typo)
            template = templates[index % len(templates)]
            domain = template.format(brand=brand_variant, attack=attack, tld=tld)
            if domain in seen:
                domain = f"{brand_variant}-{attack}-{index}.{tld}"
            seen.add(domain)

            risk = 0.2
            if attack in {"login", "verify", "auth", "confirm", "security"}:
                risk += 0.35
            if typo != "none":
                risk += 0.2
            risk += _TLD_RISK.get(tld, 0.4) * 0.2
            risk = _clamp(risk)

            if risk >= 0.8:
                label = GroundTruthLabel.PHISHING
            elif risk >= 0.65:
                label = GroundTruthLabel.BRAND_ABUSE
            elif risk >= 0.45:
                label = GroundTruthLabel.SUSPICIOUS
            else:
                label = GroundTruthLabel.BENIGN

            generated.append(
                DomainCandidate(
                    domain=domain,
                    brand_keywords=(brand,),
                    attack_keywords=(attack,),
                    tld=tld,
                    typo_pattern=typo,
                    ground_truth=label,
                )
            )
        return generated


class SimpleBrandImpersonationDetector(BrandImpersonationDetector):
    def __init__(
        self,
        brand_keywords: Sequence[str] = DEFAULT_BRAND_KEYWORDS,
        suspicious_keywords: Sequence[str] = DEFAULT_ATTACK_KEYWORDS,
    ) -> None:
        self._brands = tuple(b.lower() for b in brand_keywords)
        self._suspicious_keywords = tuple(k.lower() for k in suspicious_keywords)

    def detect(self, domain: DomainCandidate) -> ImpersonationSignals:
        tokens = _domain_tokens(domain.domain)
        root = domain.domain.split(".")[0]

        similarity_candidates: list[float] = []
        distances: list[int] = []
        for brand in self._brands:
            similarity_candidates.append(SequenceMatcher(a=root, b=brand).ratio())
            for token in tokens:
                distances.append(_levenshtein_distance(token, brand))

        keyword_hits = tuple(sorted({k for k in self._suspicious_keywords if k in root}))
        keyword_score = _clamp(len(keyword_hits) / 3.0)

        return ImpersonationSignals(
            domain=domain.domain,
            brand_similarity=max(similarity_candidates) if similarity_candidates else 0.0,
            keyword_score=keyword_score,
            suspicious_keywords=keyword_hits,
            min_edit_distance=min(distances) if distances else 0,
        )


class SimpleInfrastructureSignalSimulator(InfrastructureSignalSimulator):
    def __init__(self, seed: int = 43) -> None:
        self._seed = seed

    def simulate(self, domain: DomainCandidate) -> InfrastructureSignals:
        score = _deterministic_unit_interval(self._seed, domain.domain)
        tld_risk = _TLD_RISK.get(domain.tld, 0.4)

        registrar_idx = int(score * len(_REGISTRAR_PROFILES)) % len(_REGISTRAR_PROFILES)
        registrar, registrar_risk = _REGISTRAR_PROFILES[registrar_idx]

        dns_active = score > 0.15 or domain.ground_truth in {
            GroundTruthLabel.PHISHING,
            GroundTruthLabel.BRAND_ABUSE,
        }
        mx_active = score > 0.35
        tls_issued = score > 0.25

        return InfrastructureSignals(
            domain=domain.domain,
            dns_a_record_present=dns_active,
            mx_record_present=mx_active,
            tls_certificate_issued=tls_issued,
            hosting_provider_type="cloud" if score > 0.5 else "shared",
            registrar=registrar,
            registrar_risk_score=registrar_risk,
            tld_risk_score=tld_risk,
        )


class SimplePredictiveThreatModel(PredictiveThreatModel):
    model_version = "vertical-slice-v0.1"

    def assess(
        self,
        domain: DomainCandidate,
        impersonation: ImpersonationSignals,
        infrastructure: InfrastructureSignals,
    ) -> ThreatAssessment:
        activation_probability = (
            0.35 * impersonation.brand_similarity
            + 0.2 * impersonation.keyword_score
            + 0.15 * float(infrastructure.dns_a_record_present)
            + 0.1 * float(infrastructure.mx_record_present)
            + 0.1 * float(infrastructure.tls_certificate_issued)
            + 0.05 * infrastructure.registrar_risk_score
            + 0.05 * infrastructure.tld_risk_score
        )

        if any(k in {"login", "auth", "verify", "confirm"} for k in impersonation.suspicious_keywords):
            activation_probability += 0.08

        activation_probability = _clamp(activation_probability)

        if activation_probability >= 0.8:
            confidence = ConfidenceLevel.HIGH
        elif activation_probability >= 0.55:
            confidence = ConfidenceLevel.MEDIUM
        else:
            confidence = ConfidenceLevel.LOW

        if any(k in {"login", "auth", "verify", "confirm"} for k in impersonation.suspicious_keywords):
            threat_type = ThreatType.CREDENTIAL_PHISHING
        elif infrastructure.mx_record_present and infrastructure.tls_certificate_issued:
            threat_type = ThreatType.BRAND_IMPERSONATION
        elif infrastructure.registrar_risk_score > 0.6:
            threat_type = ThreatType.SCAM
        else:
            threat_type = ThreatType.UNKNOWN

        factors: list[str] = []
        if impersonation.brand_similarity > 0.5:
            factors.append(f"Brand similarity {impersonation.brand_similarity:.2f}")
        if impersonation.suspicious_keywords:
            factors.append(f"Suspicious keywords: {', '.join(impersonation.suspicious_keywords)}")
        if infrastructure.dns_a_record_present:
            factors.append("DNS A record present")
        if infrastructure.tls_certificate_issued:
            factors.append("TLS certificate issued")
        if infrastructure.registrar_risk_score >= 0.6:
            factors.append("Registrar risk elevated")
        if not factors:
            factors.append("Baseline monitoring signal only")

        return ThreatAssessment(
            domain=domain.domain,
            activation_probability=activation_probability,
            predicted_threat_type=threat_type,
            confidence=confidence,
            contributing_factors=tuple(factors),
            model_version=self.model_version,
        )


class SimpleCampaignClusterer(CampaignClusterer):
    def cluster(
        self,
        assessments: Sequence[ThreatAssessment],
        infrastructure_signals: Sequence[InfrastructureSignals],
    ) -> list[CampaignCluster]:
        infra_by_domain = {entry.domain: entry for entry in infrastructure_signals}
        groups: dict[tuple[str, str], list[str]] = {}

        for assessment in assessments:
            if assessment.activation_probability < 0.65:
                continue
            tokens = set(_domain_tokens(assessment.domain))
            keyword = next((k for k in DEFAULT_ATTACK_KEYWORDS if k in tokens), "other")
            infra = infra_by_domain.get(assessment.domain)
            tld = assessment.domain.split(".")[-1]
            registrar_bucket = infra.registrar if infra else "unknown"
            key = (keyword, f"{registrar_bucket}:{tld}")
            groups.setdefault(key, []).append(assessment.domain)

        campaigns: list[CampaignCluster] = []
        for idx, ((keyword, _bucket), domains) in enumerate(sorted(groups.items()), start=1):
            sample = domains[0]
            campaigns.append(
                CampaignCluster(
                    campaign_id=f"CMP-{idx:04d}",
                    domains=tuple(sorted(domains)),
                    primary_keyword=keyword if keyword != "other" else None,
                    primary_brand=_brand_from_domain(sample),
                    recommendation=(
                        "campaign takedown escalation" if len(domains) >= 4 else "targeted registrar action"
                    ),
                )
            )
        return campaigns


class SimpleCaseCreationEngine(CaseCreationEngine):
    def __init__(self, high_risk_threshold: float = 0.7, case_start: int = 1000) -> None:
        self._high_risk_threshold = high_risk_threshold
        self._next_case_number = case_start

    @property
    def high_risk_threshold(self) -> float:
        return self._high_risk_threshold

    def create_case(
        self,
        *,
        domain: DomainCandidate,
        threat: ThreatAssessment,
        infrastructure: InfrastructureSignals,
        campaign_id: str | None,
    ) -> EnforcementCase:
        case_id = f"BG-{self._next_case_number}"
        self._next_case_number += 1
        return EnforcementCase(
            case_id=case_id,
            domain=domain.domain,
            threat_score=threat.threat_score,
            predicted_threat_type=threat.predicted_threat_type,
            target_brand=_brand_from_domain(domain.domain),
            registrar=infrastructure.registrar,
            campaign_id=campaign_id,
            explanation=threat.contributing_factors,
        )


class SimpleEnforcementRecommendationEngine(EnforcementRecommendationEngine):
    def recommend(self, case: EnforcementCase) -> EnforcementRecommendation:
        reasons = list(case.explanation)
        if case.threat_score >= 80:
            action = EnforcementAction.REGISTRAR_TAKEDOWN
            reasons.append("High threat score indicates urgent registrar intervention")
        elif case.campaign_id and case.threat_score >= 70:
            action = EnforcementAction.CAMPAIGN_ESCALATION
            reasons.append("Campaign-linked threat meets escalation threshold")
        elif case.threat_score >= 60:
            action = EnforcementAction.HOSTING_PROVIDER_COMPLAINT
            reasons.append("Moderate/high threat score with active infrastructure")
        else:
            action = EnforcementAction.MONITOR
            reasons.append("Below active enforcement threshold")

        return EnforcementRecommendation(action=action, reasons=tuple(reasons))


class SimpleVendorQueueRouter(VendorQueueRouter):
    def assign(
        self,
        *,
        cases: Sequence[EnforcementCase],
        capacities: Sequence[VendorCapacity],
    ) -> dict[str, list[EnforcementCase]]:
        queues = {capacity.vendor_id: [] for capacity in capacities}
        remaining = {capacity.vendor_id: capacity.daily_capacity for capacity in capacities}

        ordered_cases = sorted(cases, key=lambda case: case.threat_score, reverse=True)
        for case in ordered_cases:
            selectable = [
                capacity
                for capacity in capacities
                if remaining.get(capacity.vendor_id, 0) > 0
            ]
            if not selectable:
                break
            # Weighted load-balancing: lower normalized queue load wins.
            selectable.sort(
                key=lambda capacity: (
                    len(queues[capacity.vendor_id]) / max(1, capacity.priority_weight),
                    -remaining[capacity.vendor_id],
                ),
            )
            winner = selectable[0]
            queues[winner.vendor_id].append(case)
            remaining[winner.vendor_id] -= 1

        return queues


class SimpleCaseLifecycleManager(CaseLifecycleManager):
    def transition(
        self,
        *,
        case: EnforcementCase,
        to_status: CaseStatus,
        actor: str,
        note: str = "",
    ) -> EnforcementCase:
        case.transition(to_status=to_status, actor=actor, note=note)
        return case


class SimpleExecutiveReporter(ExecutiveReporter):
    def generate_weekly_summary(
        self,
        *,
        week_start: datetime,
        domains_analyzed: int,
        cases: Sequence[EnforcementCase],
        cases_resolved: int,
        average_time_to_action_hours: float,
        top_keywords: Sequence[str],
        top_tlds: Sequence[str],
        campaign_trends: str,
    ) -> WeeklyExecutiveSummary:
        return WeeklyExecutiveSummary(
            week_start=week_start,
            domains_analyzed=domains_analyzed,
            cases_opened=len(cases),
            cases_resolved=cases_resolved,
            average_time_to_action_hours=average_time_to_action_hours,
            top_abused_keywords=tuple(top_keywords),
            top_abused_tlds=tuple(top_tlds),
            campaign_trends=campaign_trends,
        )


def run_vertical_slice(config: VerticalSliceConfig | None = None) -> VerticalSliceResult:
    cfg = config or VerticalSliceConfig()

    generator = SimpleDomainGenerationEngine(seed=cfg.seed)
    detector = SimpleBrandImpersonationDetector()
    infrastructure = SimpleInfrastructureSignalSimulator(seed=cfg.seed + 1)
    threat_model = SimplePredictiveThreatModel()
    clusterer = SimpleCampaignClusterer()
    case_creator = SimpleCaseCreationEngine(high_risk_threshold=cfg.high_risk_threshold)
    recommender = SimpleEnforcementRecommendationEngine()
    router = SimpleVendorQueueRouter()
    lifecycle = SimpleCaseLifecycleManager()
    reporter = SimpleExecutiveReporter()

    generated_domains = generator.generate(
        brand_keywords=DEFAULT_BRAND_KEYWORDS,
        attack_keywords=DEFAULT_ATTACK_KEYWORDS,
        tld_list=DEFAULT_TLDS,
        typo_patterns=DEFAULT_TYPO_PATTERNS,
        sample_size=cfg.sample_size,
    )

    impersonation_signals = [detector.detect(domain) for domain in generated_domains]
    infrastructure_signals = [infrastructure.simulate(domain) for domain in generated_domains]

    threat_assessments: list[ThreatAssessment] = []
    for domain, impersonation, infra in zip(
        generated_domains,
        impersonation_signals,
        infrastructure_signals,
    ):
        threat_assessments.append(threat_model.assess(domain, impersonation, infra))

    campaigns = clusterer.cluster(threat_assessments, infrastructure_signals)
    campaign_by_domain: dict[str, str] = {}
    for campaign in campaigns:
        for domain in campaign.domains:
            campaign_by_domain[domain] = campaign.campaign_id

    cases: list[EnforcementCase] = []
    for domain, threat, infra in zip(generated_domains, threat_assessments, infrastructure_signals):
        if threat.activation_probability < case_creator.high_risk_threshold:
            continue
        case = case_creator.create_case(
            domain=domain,
            threat=threat,
            infrastructure=infra,
            campaign_id=campaign_by_domain.get(domain.domain),
        )
        recommendation = recommender.recommend(case)
        case.recommended_action = recommendation.action
        case.explanation = recommendation.reasons
        lifecycle.transition(
            case=case,
            to_status=CaseStatus.UNDER_REVIEW,
            actor="system:auto-triage",
            note="Auto-triage transition after case creation",
        )
        cases.append(case)

    capacities = (
        VendorCapacity(vendor_id="Vendor-A", daily_capacity=40, priority_weight=2),
        VendorCapacity(vendor_id="Vendor-B", daily_capacity=20, priority_weight=1),
    )
    assignments = router.assign(cases=cases, capacities=capacities)

    top_keywords: dict[str, int] = {}
    top_tlds: dict[str, int] = {}
    for domain in generated_domains:
        tokens = set(_domain_tokens(domain.domain))
        for keyword in DEFAULT_ATTACK_KEYWORDS:
            if keyword in tokens:
                top_keywords[keyword] = top_keywords.get(keyword, 0) + 1
        tld = domain.domain.split(".")[-1]
        top_tlds[tld] = top_tlds.get(tld, 0) + 1

    sorted_keywords = tuple(
        key for key, _count in sorted(top_keywords.items(), key=lambda item: item[1], reverse=True)[:5]
    )
    sorted_tlds = tuple(
        key for key, _count in sorted(top_tlds.items(), key=lambda item: item[1], reverse=True)[:5]
    )

    summary = reporter.generate_weekly_summary(
        week_start=_week_start_utc(),
        domains_analyzed=len(generated_domains),
        cases=cases,
        cases_resolved=0,
        average_time_to_action_hours=4.0,
        top_keywords=sorted_keywords,
        top_tlds=sorted_tlds,
        campaign_trends=(
            "Concentrated credential-phishing patterns across shared registrars"
            if campaigns
            else "No coordinated campaign patterns detected"
        ),
    )

    return VerticalSliceResult(
        generated_domains=tuple(generated_domains),
        impersonation_signals=tuple(impersonation_signals),
        infrastructure_signals=tuple(infrastructure_signals),
        threat_assessments=tuple(threat_assessments),
        campaigns=tuple(campaigns),
        cases=tuple(cases),
        vendor_assignments={k: tuple(v) for k, v in assignments.items()},
        weekly_summary=summary,
    )


def render_weekly_summary_markdown(result: VerticalSliceResult) -> str:
    summary = result.weekly_summary
    return "\n".join(
        [
            "# BrandGuard Weekly Executive Summary",
            "",
            f"- Week start (UTC): {summary.week_start.date().isoformat()}",
            f"- Domains analyzed: {summary.domains_analyzed}",
            f"- Cases opened: {summary.cases_opened}",
            f"- Cases resolved: {summary.cases_resolved}",
            f"- Average time to action (hours): {summary.average_time_to_action_hours}",
            f"- Top abused keywords: {', '.join(summary.top_abused_keywords) if summary.top_abused_keywords else 'Unavailable'}",
            f"- Top abused TLDs: {', '.join(summary.top_abused_tlds) if summary.top_abused_tlds else 'Unavailable'}",
            f"- Campaign trends: {summary.campaign_trends}",
            "",
            "## Vendor Queues",
            "",
        ]
        + [
            f"- {vendor}: {len(cases)} case(s)"
            for vendor, cases in sorted(result.vendor_assignments.items())
        ]
    )
