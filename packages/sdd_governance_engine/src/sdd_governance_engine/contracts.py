"""Public abstract contracts and extension points (ISP, DIP & Protected Variations)."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Sequence

from sdd_governance_engine.models import (
    AssignmentDecision,
    GovernanceAuditRecord,
    ReviewerCandidate,
    SpecArtifact,
    TaskContext,
    TransitionContext,
    TransitionDecision,
    ValidationIssue,
    ValidationResult,
)


class IValidationRule(ABC):
    """Open extension point #1 (Chain of Responsibility): custom SDD validation rule."""

    def __init__(self) -> None:
        self._next_rule: IValidationRule | None = None

    @property
    @abstractmethod
    def rule_id(self) -> str:
        """Unique identifier of the validation rule (e.g. 'RULE-BRANCH-001')."""

    def set_next(self, rule: IValidationRule) -> IValidationRule:
        """Link the next rule in the validation chain and return it for fluent chaining."""
        self._next_rule = rule
        return rule

    def evaluate(
        self,
        artifact: SpecArtifact,
        accumulated: list[ValidationIssue] | None = None,
    ) -> list[ValidationIssue]:
        """Template/Chain execution: evaluate current rule and forward unless short-circuited."""
        issues = accumulated if accumulated is not None else []
        halt = self._check(artifact, issues)
        if not halt and self._next_rule is not None:
            return self._next_rule.evaluate(artifact, issues)
        return issues

    @abstractmethod
    def _check(self, artifact: SpecArtifact, issues: list[ValidationIssue]) -> bool:
        """Inspect artifact, append findings to `issues`, and return True only to halt chain."""


class IAssignmentStrategy(ABC):
    """Open extension point #2 (Strategy): interchangeable reviewer selection algorithm."""

    @property
    @abstractmethod
    def strategy_name(self) -> str:
        """Canonical name of the strategy."""

    @abstractmethod
    def select_reviewer(
        self,
        task: TaskContext,
        candidates: Sequence[ReviewerCandidate],
    ) -> AssignmentDecision:
        """Select the optimal reviewer among eligible candidates."""


class IReportExporter(ABC):
    """Open extension point #3 (Strategy / Pure Fabrication): custom report serializer."""

    @property
    @abstractmethod
    def format_name(self) -> str:
        """Format key (e.g. 'json', 'markdown', 'text', 'csv')."""

    @abstractmethod
    def export(self, record: GovernanceAuditRecord) -> str:
        """Serialize the GovernanceAuditRecord into the target string representation."""


class IAuditSink(ABC):
    """Port for recording immutable audit events emitted by AuditedGovernanceDecorator."""

    @abstractmethod
    def record(self, operation: str, payload: dict[str, Any]) -> None:
        """Persist or collect an audit entry."""


class IGovernancePolicyFactory(ABC):
    """Creational GoF (Abstract Factory): creates coherent families of SDD rules & policies."""

    @property
    @abstractmethod
    def profile_name(self) -> str:
        """Unique identifier of the governance rigor profile."""

    @abstractmethod
    def create_validation_chain(
        self,
        extra_rules: Sequence[IValidationRule] | None = None,
    ) -> IValidationRule:
        """Build the linked chain of validation rules for this profile."""

    @abstractmethod
    def minimum_coverage_percent(self) -> float:
        """Minimum required test coverage percentage to close or review tasks."""

    @abstractmethod
    def require_human_gate(self) -> bool:
        """Whether explicit human approval is required before implementation."""


class IGovernanceEngine(ABC):
    """Segregated engine contract wrapped by Structural Decorators (Audited, Metrics)."""

    @abstractmethod
    def validate_artifact(
        self,
        artifact: SpecArtifact,
        profile_name: str = "strict_enterprise",
        custom_rules: Sequence[IValidationRule] | None = None,
    ) -> ValidationResult:
        """Validate an SDD specification artifact."""

    @abstractmethod
    def evaluate_transition(
        self,
        context: TransitionContext,
        profile_name: str = "strict_enterprise",
    ) -> TransitionDecision:
        """Evaluate whether a lifecycle state transition is permitted."""

    @abstractmethod
    def assign_reviewer(
        self,
        task: TaskContext,
        candidates: Sequence[ReviewerCandidate],
        strategy_name: str = "domain_expertise",
    ) -> AssignmentDecision:
        """Select the best reviewer candidate using the requested strategy."""

    @abstractmethod
    def export_report(
        self,
        record: GovernanceAuditRecord,
        format_name: str = "markdown",
    ) -> str:
        """Export an audit record in the requested format."""
