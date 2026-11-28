"""Creational GoF (Abstract Factory): policy families for Enterprise vs Agile MVP rigor."""

from __future__ import annotations

from typing import Sequence

from sdd_governance_engine._internal.rules import (
    AcceptanceCriteriaRule,
    ArtifactSectionsRule,
    BranchNamingRule,
    EarsNotationRule,
    TicketIdentityRule,
)
from sdd_governance_engine.contracts import IGovernancePolicyFactory, IValidationRule


def _link_chain(rules: list[IValidationRule]) -> IValidationRule:
    head = rules[0]
    current = head
    for nxt in rules[1:]:
        current = current.set_next(nxt)
    return head


class StrictEnterprisePolicyFactory(IGovernancePolicyFactory):
    """High-rigor SDD policy requiring full sections, strict EARS, human gate, and >=70% coverage."""

    @property
    def profile_name(self) -> str:
        return "strict_enterprise"

    def create_validation_chain(
        self,
        extra_rules: Sequence[IValidationRule] | None = None,
    ) -> IValidationRule:
        chain: list[IValidationRule] = [
            TicketIdentityRule(),
            BranchNamingRule(max_length=80),
            ArtifactSectionsRule(required_sections=("requirements", "design", "tasks"), min_chars=30),
            AcceptanceCriteriaRule(min_count=3),
            EarsNotationRule(strict=True),
        ]
        if extra_rules:
            chain.extend(extra_rules)
        return _link_chain(chain)

    def minimum_coverage_percent(self) -> float:
        return 70.0

    def require_human_gate(self) -> bool:
        return True


class AgileMvpPolicyFactory(IGovernancePolicyFactory):
    """Lightweight SDD policy tailored for rapid spikes/MVPs while preserving branch & AC hygiene."""

    @property
    def profile_name(self) -> str:
        return "agile_mvp"

    def create_validation_chain(
        self,
        extra_rules: Sequence[IValidationRule] | None = None,
    ) -> IValidationRule:
        chain: list[IValidationRule] = [
            TicketIdentityRule(),
            BranchNamingRule(max_length=80),
            ArtifactSectionsRule(required_sections=("requirements", "tasks"), min_chars=15),
            AcceptanceCriteriaRule(min_count=1),
            EarsNotationRule(strict=False),
        ]
        if extra_rules:
            chain.extend(extra_rules)
        return _link_chain(chain)

    def minimum_coverage_percent(self) -> float:
        return 50.0

    def require_human_gate(self) -> bool:
        return False
