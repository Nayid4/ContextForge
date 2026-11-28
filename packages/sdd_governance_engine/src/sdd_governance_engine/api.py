"""Public Facade API of `sdd_governance_engine` (v1.0.0).

Exposes the 4 essential SDD governance operations plus open extension registration
without leaking `_internal` classes.
"""

from __future__ import annotations

from typing import Any, Mapping, Sequence

from sdd_governance_engine._internal.decorators import (
    AuditedGovernanceDecorator,
    InMemoryAuditSink,
    MetricsTrackerDecorator,
)
from sdd_governance_engine._internal.engine import DefaultGovernanceEngine
from sdd_governance_engine._internal.exporters import (
    JsonReportExporter,
    MarkdownReportExporter,
    TextReportExporter,
)
from sdd_governance_engine._internal.factories import (
    AgileMvpPolicyFactory,
    StrictEnterprisePolicyFactory,
)
from sdd_governance_engine._internal.strategies import (
    DomainExpertiseStrategy,
    LeastWorkloadStrategy,
    RoundRobinStrategy,
)
from sdd_governance_engine.contracts import (
    IAssignmentStrategy,
    IAuditSink,
    IGovernanceEngine,
    IGovernancePolicyFactory,
    IReportExporter,
    IValidationRule,
)
from sdd_governance_engine.models import (
    AssignmentDecision,
    GovernanceAuditRecord,
    ReviewerCandidate,
    SpecArtifact,
    TaskContext,
    TransitionContext,
    TransitionDecision,
    ValidationResult,
)

_POLICY_FACTORIES: dict[str, IGovernancePolicyFactory] = {
    "strict_enterprise": StrictEnterprisePolicyFactory(),
    "agile_mvp": AgileMvpPolicyFactory(),
}

_ASSIGNMENT_STRATEGIES: dict[str, IAssignmentStrategy] = {
    "domain_expertise": DomainExpertiseStrategy(),
    "least_workload": LeastWorkloadStrategy(),
    "round_robin": RoundRobinStrategy(),
}

_REPORT_EXPORTERS: dict[str, IReportExporter] = {
    "json": JsonReportExporter(),
    "markdown": MarkdownReportExporter(),
    "text": TextReportExporter(),
}


def register_policy_factory(factory: IGovernancePolicyFactory) -> None:
    """Register a custom IGovernancePolicyFactory (Open/Closed Principle)."""
    _POLICY_FACTORIES[factory.profile_name.strip().lower()] = factory


def register_assignment_strategy(strategy: IAssignmentStrategy) -> None:
    """Register a custom IAssignmentStrategy without modifying internal code."""
    _ASSIGNMENT_STRATEGIES[strategy.strategy_name.strip().lower()] = strategy


def register_report_exporter(exporter: IReportExporter) -> None:
    """Register a custom IReportExporter format without modifying internal code."""
    _REPORT_EXPORTERS[exporter.format_name.strip().lower()] = exporter


def list_registered_capabilities() -> dict[str, list[str]]:
    """Return currently available profiles, assignment strategies and export formats."""
    return {
        "profiles": sorted(_POLICY_FACTORIES.keys()),
        "strategies": sorted(_ASSIGNMENT_STRATEGIES.keys()),
        "formats": sorted(_REPORT_EXPORTERS.keys()),
    }


def create_governance_engine(
    audit_sink: IAuditSink | None = None,
    enable_metrics: bool = True,
    enable_audit: bool = True,
) -> IGovernanceEngine:
    """Assemble a decorated IGovernanceEngine instance (Factory + Decorator composition)."""
    engine: IGovernanceEngine = DefaultGovernanceEngine(
        factories=_POLICY_FACTORIES,
        strategies=_ASSIGNMENT_STRATEGIES,
        exporters=_REPORT_EXPORTERS,
    )
    if enable_metrics:
        engine = MetricsTrackerDecorator(engine)
    if enable_audit:
        engine = AuditedGovernanceDecorator(engine, sink=audit_sink or InMemoryAuditSink())
    return engine


_DEFAULT_ENGINE: IGovernanceEngine = create_governance_engine()


def validate_spec_artifact(
    artifact_data: SpecArtifact | Mapping[str, Any],
    profile_name: str = "strict_enterprise",
    custom_rules: Sequence[IValidationRule] | None = None,
    engine: IGovernanceEngine | None = None,
) -> ValidationResult:
    """Operation #1: Validate structural completeness, branch naming and EARS rigor of a spec."""
    artifact = (
        artifact_data
        if isinstance(artifact_data, SpecArtifact)
        else SpecArtifact.from_mapping(artifact_data)
    )
    target_engine = engine or _DEFAULT_ENGINE
    return target_engine.validate_artifact(
        artifact=artifact,
        profile_name=profile_name,
        custom_rules=custom_rules,
    )


def evaluate_workflow_transition(
    current_state: str,
    target_state: str,
    actor_role: str,
    context: Mapping[str, Any] | None = None,
    profile_name: str = "strict_enterprise",
    engine: IGovernanceEngine | None = None,
) -> TransitionDecision:
    """Operation #2: Authorize or reject SDD lifecycle state transitions under guardrails."""
    ctx_map = dict(context or {})
    trans_ctx = TransitionContext(
        current_state=current_state,
        target_state=target_state,
        actor_role=actor_role,
        human_gate_approved=bool(ctx_map.get("human_gate_approved", False)),
        tests_passing=bool(ctx_map.get("tests_passing", False)),
        coverage_percent=float(ctx_map.get("coverage_percent", 0.0)),
        has_independent_review=bool(ctx_map.get("has_independent_review", False)),
        author_id=str(ctx_map.get("author_id", "")),
        actor_id=str(ctx_map.get("actor_id", "")),
    )
    target_engine = engine or _DEFAULT_ENGINE
    return target_engine.evaluate_transition(trans_ctx, profile_name=profile_name)


def assign_best_reviewer(
    task_context: TaskContext | Mapping[str, Any],
    candidates: Sequence[ReviewerCandidate | Mapping[str, Any]],
    strategy_name: str = "domain_expertise",
    engine: IGovernanceEngine | None = None,
) -> AssignmentDecision:
    """Operation #3: Select the optimal reviewer using an interchangeable strategy."""
    task = (
        task_context
        if isinstance(task_context, TaskContext)
        else TaskContext.from_mapping(task_context)
    )
    normalized_candidates = [
        c if isinstance(c, ReviewerCandidate) else ReviewerCandidate.from_mapping(c)
        for c in candidates
    ]
    target_engine = engine or _DEFAULT_ENGINE
    return target_engine.assign_reviewer(
        task=task,
        candidates=normalized_candidates,
        strategy_name=strategy_name,
    )


def export_governance_report(
    audit_record: GovernanceAuditRecord,
    format_name: str = "markdown",
    engine: IGovernanceEngine | None = None,
) -> str:
    """Operation #4: Export a GovernanceAuditRecord in JSON, Markdown, Text or custom format."""
    target_engine = engine or _DEFAULT_ENGINE
    return target_engine.export_report(record=audit_record, format_name=format_name)
