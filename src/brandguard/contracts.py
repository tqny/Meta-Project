from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _require_probability(value: float, field_name: str) -> None:
    if value < 0.0 or value > 1.0:
        raise ValueError(f"{field_name} must be between 0.0 and 1.0")


class GroundTruthLabel(str, Enum):
    BENIGN = "benign"
    SUSPICIOUS = "suspicious"
    PHISHING = "phishing"
    BRAND_ABUSE = "brand abuse"


class ThreatType(str, Enum):
    UNKNOWN = "unknown"
    CREDENTIAL_PHISHING = "credential phishing"
    SCAM = "scam"
    MALWARE = "malware"
    BRAND_IMPERSONATION = "brand impersonation"


class ConfidenceLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class CaseStatus(str, Enum):
    OPEN = "Open"
    UNDER_REVIEW = "Under Review"
    ESCALATED = "Escalated"
    ENFORCEMENT_INITIATED = "Enforcement Initiated"
    RESOLVED = "Resolved"
    CLOSED = "Closed"


class EnforcementAction(str, Enum):
    REGISTRAR_TAKEDOWN = "Registrar takedown"
    HOSTING_PROVIDER_COMPLAINT = "Hosting provider complaint"
    UDRP_FILING = "UDRP filing"
    MONITOR = "Monitor"
    CAMPAIGN_ESCALATION = "Campaign escalation"


@dataclass(frozen=True)
class DomainCandidate:
    domain: str
    brand_keywords: tuple[str, ...] = ()
    attack_keywords: tuple[str, ...] = ()
    tld: str = ""
    typo_pattern: str | None = None
    ground_truth: GroundTruthLabel = GroundTruthLabel.BENIGN
    generated_at: datetime = field(default_factory=_utc_now)

    def __post_init__(self) -> None:
        normalized_domain = self.domain.strip().lower()
        if not normalized_domain or "." not in normalized_domain:
            raise ValueError("domain must be a non-empty FQDN-like value")
        object.__setattr__(self, "domain", normalized_domain)
        if not self.tld:
            object.__setattr__(self, "tld", normalized_domain.split(".")[-1])


@dataclass(frozen=True)
class ImpersonationSignals:
    domain: str
    brand_similarity: float
    keyword_score: float
    suspicious_keywords: tuple[str, ...] = ()
    min_edit_distance: int = 0

    def __post_init__(self) -> None:
        _require_probability(self.brand_similarity, "brand_similarity")
        _require_probability(self.keyword_score, "keyword_score")


@dataclass(frozen=True)
class InfrastructureSignals:
    domain: str
    dns_a_record_present: bool
    mx_record_present: bool
    tls_certificate_issued: bool
    hosting_provider_type: str
    registrar: str
    registrar_risk_score: float
    tld_risk_score: float

    def __post_init__(self) -> None:
        _require_probability(self.registrar_risk_score, "registrar_risk_score")
        _require_probability(self.tld_risk_score, "tld_risk_score")


@dataclass(frozen=True)
class ThreatAssessment:
    domain: str
    activation_probability: float
    predicted_threat_type: ThreatType
    confidence: ConfidenceLevel
    contributing_factors: tuple[str, ...]
    model_version: str

    def __post_init__(self) -> None:
        _require_probability(self.activation_probability, "activation_probability")
        if not self.model_version.strip():
            raise ValueError("model_version must be non-empty")

    @property
    def threat_score(self) -> int:
        return int(round(self.activation_probability * 100))


@dataclass(frozen=True)
class CampaignCluster:
    campaign_id: str
    domains: tuple[str, ...]
    primary_keyword: str | None = None
    primary_brand: str | None = None
    recommendation: str | None = None

    def __post_init__(self) -> None:
        if not self.campaign_id.strip():
            raise ValueError("campaign_id must be non-empty")


@dataclass(frozen=True)
class EnforcementRecommendation:
    action: EnforcementAction
    reasons: tuple[str, ...]

    def __post_init__(self) -> None:
        if not self.reasons:
            raise ValueError("reasons must include at least one factor")


@dataclass(frozen=True)
class CaseAuditEntry:
    timestamp: datetime
    from_status: CaseStatus
    to_status: CaseStatus
    actor: str
    note: str = ""


@dataclass
class EnforcementCase:
    case_id: str
    domain: str
    threat_score: int
    predicted_threat_type: ThreatType
    target_brand: str
    registrar: str
    status: CaseStatus = CaseStatus.OPEN
    recommended_action: EnforcementAction = EnforcementAction.MONITOR
    campaign_id: str | None = None
    explanation: tuple[str, ...] = ()
    audit_log: list[CaseAuditEntry] = field(default_factory=list)

    _valid_transitions = {
        CaseStatus.OPEN: {
            CaseStatus.UNDER_REVIEW,
            CaseStatus.ESCALATED,
            CaseStatus.CLOSED,
        },
        CaseStatus.UNDER_REVIEW: {
            CaseStatus.ESCALATED,
            CaseStatus.ENFORCEMENT_INITIATED,
            CaseStatus.RESOLVED,
            CaseStatus.CLOSED,
        },
        CaseStatus.ESCALATED: {
            CaseStatus.ENFORCEMENT_INITIATED,
            CaseStatus.RESOLVED,
            CaseStatus.CLOSED,
        },
        CaseStatus.ENFORCEMENT_INITIATED: {
            CaseStatus.RESOLVED,
            CaseStatus.CLOSED,
        },
        CaseStatus.RESOLVED: {CaseStatus.CLOSED},
        CaseStatus.CLOSED: set(),
    }

    def __post_init__(self) -> None:
        if not self.case_id.strip():
            raise ValueError("case_id must be non-empty")
        if self.threat_score < 0 or self.threat_score > 100:
            raise ValueError("threat_score must be between 0 and 100")
        if not self.explanation:
            raise ValueError("explanation must include at least one factor")

    def transition(self, to_status: CaseStatus, actor: str, note: str = "") -> None:
        allowed = self._valid_transitions[self.status]
        if to_status not in allowed:
            raise ValueError(f"invalid transition: {self.status.value} -> {to_status.value}")
        self.audit_log.append(
            CaseAuditEntry(
                timestamp=_utc_now(),
                from_status=self.status,
                to_status=to_status,
                actor=actor,
                note=note,
            )
        )
        self.status = to_status


@dataclass(frozen=True)
class WeeklyExecutiveSummary:
    week_start: datetime
    domains_analyzed: int
    cases_opened: int
    cases_resolved: int
    average_time_to_action_hours: float
    top_abused_keywords: tuple[str, ...]
    top_abused_tlds: tuple[str, ...]
    campaign_trends: str
    generated_at: datetime = field(default_factory=_utc_now)

    def __post_init__(self) -> None:
        if self.domains_analyzed < 0 or self.cases_opened < 0 or self.cases_resolved < 0:
            raise ValueError("summary volumes cannot be negative")
        if self.average_time_to_action_hours < 0:
            raise ValueError("average_time_to_action_hours cannot be negative")

