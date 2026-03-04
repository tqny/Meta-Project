from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Protocol, Sequence

from .contracts import (
    CampaignCluster,
    CaseStatus,
    DomainCandidate,
    EnforcementCase,
    EnforcementRecommendation,
    ImpersonationSignals,
    InfrastructureSignals,
    ThreatAssessment,
    WeeklyExecutiveSummary,
)


@dataclass(frozen=True)
class VendorCapacity:
    vendor_id: str
    daily_capacity: int
    priority_weight: int = 1


class DomainGenerationEngine(Protocol):
    def generate(
        self,
        *,
        brand_keywords: Sequence[str],
        attack_keywords: Sequence[str],
        tld_list: Sequence[str],
        typo_patterns: Sequence[str],
        sample_size: int,
    ) -> list[DomainCandidate]:
        ...


class BrandImpersonationDetector(Protocol):
    def detect(self, domain: DomainCandidate) -> ImpersonationSignals:
        ...


class InfrastructureSignalSimulator(Protocol):
    def simulate(self, domain: DomainCandidate) -> InfrastructureSignals:
        ...


class PredictiveThreatModel(Protocol):
    def assess(
        self,
        domain: DomainCandidate,
        impersonation: ImpersonationSignals,
        infrastructure: InfrastructureSignals,
    ) -> ThreatAssessment:
        ...


class CampaignClusterer(Protocol):
    def cluster(
        self,
        assessments: Sequence[ThreatAssessment],
        infrastructure_signals: Sequence[InfrastructureSignals],
    ) -> list[CampaignCluster]:
        ...


class CaseCreationEngine(Protocol):
    def create_case(
        self,
        *,
        domain: DomainCandidate,
        threat: ThreatAssessment,
        infrastructure: InfrastructureSignals,
        campaign_id: str | None,
    ) -> EnforcementCase:
        ...


class EnforcementRecommendationEngine(Protocol):
    def recommend(self, case: EnforcementCase) -> EnforcementRecommendation:
        ...


class VendorQueueRouter(Protocol):
    def assign(
        self,
        *,
        cases: Sequence[EnforcementCase],
        capacities: Sequence[VendorCapacity],
    ) -> dict[str, list[EnforcementCase]]:
        ...


class CaseLifecycleManager(Protocol):
    def transition(
        self,
        *,
        case: EnforcementCase,
        to_status: CaseStatus,
        actor: str,
        note: str = "",
    ) -> EnforcementCase:
        ...


class ExecutiveReporter(Protocol):
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
        ...

