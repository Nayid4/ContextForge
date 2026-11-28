"""Core GRASP Controller coordinating Policy Factories, Rules, Strategies and Exporters."""

from __future__ import annotations

from typing import Mapping, Sequence

from sdd_governance_engine.contracts import (
    IAssignmentStrategy,
    IGovernanceEngine,
    IGovernancePolicyFactory,
    IReportExporter,
    IValidationRule,
)
from sdd_governance_engine.exceptions import UnknownProfileError, UnknownStrategyError
from sdd_governance_engine.models import (
    AssignmentDecision,
    GovernanceAuditRecord,
    ReviewerCandidate,
    Severity,
    SpecArtifact,
    TaskContext,
    TransitionContext,
    TransitionDecision,
    ValidationResult,
    WorkflowState,
)

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    WorkflowState.PENDING.value: {WorkflowState.SPEC_READY.value, WorkflowState.BLOCKED.value},
    WorkflowState.SPEC_READY.value: {
        WorkflowState.IN_PROGRESS.value,
        WorkflowState.PENDING.value,
        WorkflowState.BLOCKED.value,
    },
    WorkflowState.IN_PROGRESS.value: {
        WorkflowState.IN_REVIEW.value,
        WorkflowState.SPEC_READY.value,
        WorkflowState.BLOCKED.value,
    },
    WorkflowState.IN_REVIEW.value: {
        WorkflowState.DONE.value,
        WorkflowState.IN_PROGRESS.value,
        WorkflowState.BLOCKED.value,
    },
    WorkflowState.BLOCKED.value: {
        WorkflowState.PENDING.value,
        WorkflowState.SPEC_READY.value,
        WorkflowState.IN_PROGRESS.value,
    },
    WorkflowState.DONE.value: set(),
}


class DefaultGovernanceEngine(IGovernanceEngine):
    """High-cohesion, low-coupling SDD Governance Engine implementation."""

    def __init__(
        self,
        factories: Mapping[str, IGovernancePolicyFactory],
        strategies: Mapping[str, IAssignmentStrategy],
        exporters: Mapping[str, IReportExporter],
    ) -> None:
        self._factories = dict(factories)
        self._strategies = dict(strategies)
        self._exporters = dict(exporters)

    def _get_factory(self, profile_name: str) -> IGovernancePolicyFactory:
        key = profile_name.strip().lower()
        factory = self._factories.get(key)
        if factory is None:
            raise UnknownProfileError(profile_name)
        return factory

    def validate_artifact(
        self,
        artifact: SpecArtifact,
        profile_name: str = "strict_enterprise",
        custom_rules: Sequence[IValidationRule] | None = None,
    ) -> ValidationResult:
        factory = self._get_factory(profile_name)
        chain_head = factory.create_validation_chain(extra_rules=custom_rules)
        issues = chain_head.evaluate(artifact)
        errors = sum(1 for i in issues if i.severity == Severity.ERROR)
        warnings = sum(1 for i in issues if i.severity == Severity.WARNING)
        score = max(0.0, 100.0 - (errors * 25.0) - (warnings * 5.0))
        return ValidationResult(
            ticket_id=artifact.ticket_id or "UNSPECIFIED",
            profile_name=factory.profile_name,
            is_valid=(errors == 0),
            score=score,
            issues=tuple(issues),
        )

    def evaluate_transition(
        self,
        context: TransitionContext,
        profile_name: str = "strict_enterprise",
    ) -> TransitionDecision:
        factory = self._get_factory(profile_name)
        cur = context.current_state.strip().lower()
        tgt = context.target_state.strip().lower()
        role = context.actor_role.strip().lower()

        reasons: list[str] = []
        guardrails: list[str] = ["state_graph"]

        valid_targets = ALLOWED_TRANSITIONS.get(cur)
        if valid_targets is None or tgt not in valid_targets:
            reasons.append(f"Transition '{cur}' -> '{tgt}' is not permitted by the SDD state machine.")
            return TransitionDecision(
                allowed=False,
                current_state=cur,
                target_state=tgt,
                actor_role=role,
                reasons=tuple(reasons),
                guardrails_checked=tuple(guardrails),
            )

        # Guardrail 1: Human Gate before implementation
        if cur == WorkflowState.SPEC_READY.value and tgt == WorkflowState.IN_PROGRESS.value:
            guardrails.append("human_approval_gate")
            if factory.require_human_gate() and not context.human_gate_approved:
                reasons.append("Human Approval Gate is required before moving to 'in_progress'.")

        # Guardrail 2: Passing tests & coverage before entering review or closing
        if tgt in (WorkflowState.IN_REVIEW.value, WorkflowState.DONE.value):
            guardrails.extend(["automated_tests_green", "minimum_coverage"])
            if not context.tests_passing:
                reasons.append("All automated tests must pass before entering review or closing.")
            min_cov = factory.minimum_coverage_percent()
            if context.coverage_percent < min_cov:
                reasons.append(
                    f"Coverage ({context.coverage_percent:.1f}%) is below profile minimum ({min_cov:.1f}%)."
                )

        # Guardrail 3: Independent reviewer separation of duties for closure
        if tgt == WorkflowState.DONE.value:
            guardrails.append("independent_reviewer_separation")
            if role not in ("reviewer", "leader", "human-lead"):
                reasons.append(f"Role '{role}' cannot close a spec to 'done' (requires reviewer or leader).")
            if factory.require_human_gate() and not context.has_independent_review:
                reasons.append("Independent QA/Reviewer audit is required before closing to 'done'.")
            if context.author_id and context.actor_id and context.author_id == context.actor_id:
                reasons.append("Separation of duties violation: implementer cannot approve their own closure.")

        allowed = len(reasons) == 0
        if allowed:
            reasons.append(f"Transition '{cur}' -> '{tgt}' authorized under '{factory.profile_name}'.")

        return TransitionDecision(
            allowed=allowed,
            current_state=cur,
            target_state=tgt,
            actor_role=role,
            reasons=tuple(reasons),
            guardrails_checked=tuple(guardrails),
        )

    def assign_reviewer(
        self,
        task: TaskContext,
        candidates: Sequence[ReviewerCandidate],
        strategy_name: str = "domain_expertise",
    ) -> AssignmentDecision:
        key = strategy_name.strip().lower()
        strategy = self._strategies.get(key)
        if strategy is None:
            raise UnknownStrategyError(strategy_name, kind="strategy")
        return strategy.select_reviewer(task, candidates)

    def export_report(
        self,
        record: GovernanceAuditRecord,
        format_name: str = "markdown",
    ) -> str:
        key = format_name.strip().lower()
        exporter = self._exporters.get(key)
        if exporter is None:
            raise UnknownStrategyError(format_name, kind="format")
        return exporter.export(record)
