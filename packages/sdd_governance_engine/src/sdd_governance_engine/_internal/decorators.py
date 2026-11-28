"""Structural GoF (Decorator): immutable audit logging and latency metrics wrappers."""

from __future__ import annotations

from dataclasses import replace
from datetime import datetime, timezone
import time
from typing import Any, Sequence

from sdd_governance_engine.contracts import IAuditSink, IGovernanceEngine, IValidationRule
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


class InMemoryAuditSink(IAuditSink):
    """Default lightweight audit collector storing immutable snapshots in memory."""

    def __init__(self) -> None:
        self._entries: list[dict[str, Any]] = []

    def record(self, operation: str, payload: dict[str, Any]) -> None:
        self._entries.append(
            {
                "operation": operation,
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "payload": dict(payload),
            }
        )

    @property
    def entries(self) -> tuple[dict[str, Any], ...]:
        return tuple(self._entries)


class MetricsTrackerDecorator(IGovernanceEngine):
    """Structural Decorator measuring execution latency (ms) and invocation counters."""

    def __init__(self, wrapped: IGovernanceEngine) -> None:
        self._wrapped = wrapped
        self._call_counts: dict[str, int] = {
            "validate_artifact": 0,
            "evaluate_transition": 0,
            "assign_reviewer": 0,
            "export_report": 0,
        }

    @property
    def call_counts(self) -> dict[str, int]:
        return dict(self._call_counts)

    def validate_artifact(
        self,
        artifact: SpecArtifact,
        profile_name: str = "strict_enterprise",
        custom_rules: Sequence[IValidationRule] | None = None,
    ) -> ValidationResult:
        self._call_counts["validate_artifact"] += 1
        t0 = time.perf_counter()
        result = self._wrapped.validate_artifact(artifact, profile_name, custom_rules)
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        return replace(result, elapsed_ms=elapsed_ms)

    def evaluate_transition(
        self,
        context: TransitionContext,
        profile_name: str = "strict_enterprise",
    ) -> TransitionDecision:
        self._call_counts["evaluate_transition"] += 1
        t0 = time.perf_counter()
        decision = self._wrapped.evaluate_transition(context, profile_name)
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        return replace(decision, elapsed_ms=elapsed_ms)

    def assign_reviewer(
        self,
        task: TaskContext,
        candidates: Sequence[ReviewerCandidate],
        strategy_name: str = "domain_expertise",
    ) -> AssignmentDecision:
        self._call_counts["assign_reviewer"] += 1
        return self._wrapped.assign_reviewer(task, candidates, strategy_name)

    def export_report(
        self,
        record: GovernanceAuditRecord,
        format_name: str = "markdown",
    ) -> str:
        self._call_counts["export_report"] += 1
        return self._wrapped.export_report(record, format_name)


class AuditedGovernanceDecorator(IGovernanceEngine):
    """Structural Decorator recording every governance operation into an IAuditSink."""

    def __init__(self, wrapped: IGovernanceEngine, sink: IAuditSink | None = None) -> None:
        self._wrapped = wrapped
        self._sink: IAuditSink = sink if sink is not None else InMemoryAuditSink()

    @property
    def audit_sink(self) -> IAuditSink:
        return self._sink

    def validate_artifact(
        self,
        artifact: SpecArtifact,
        profile_name: str = "strict_enterprise",
        custom_rules: Sequence[IValidationRule] | None = None,
    ) -> ValidationResult:
        res = self._wrapped.validate_artifact(artifact, profile_name, custom_rules)
        self._sink.record(
            "validate_artifact",
            {
                "ticket_id": artifact.ticket_id,
                "profile_name": profile_name,
                "is_valid": res.is_valid,
                "error_count": res.error_count,
            },
        )
        return res

    def evaluate_transition(
        self,
        context: TransitionContext,
        profile_name: str = "strict_enterprise",
    ) -> TransitionDecision:
        decision = self._wrapped.evaluate_transition(context, profile_name)
        self._sink.record(
            "evaluate_transition",
            {
                "current_state": context.current_state,
                "target_state": context.target_state,
                "actor_role": context.actor_role,
                "allowed": decision.allowed,
            },
        )
        return decision

    def assign_reviewer(
        self,
        task: TaskContext,
        candidates: Sequence[ReviewerCandidate],
        strategy_name: str = "domain_expertise",
    ) -> AssignmentDecision:
        decision = self._wrapped.assign_reviewer(task, candidates, strategy_name)
        self._sink.record(
            "assign_reviewer",
            {
                "ticket_id": task.ticket_id,
                "selected_reviewer_id": decision.selected_reviewer_id,
                "strategy_used": decision.strategy_used,
            },
        )
        return decision

    def export_report(
        self,
        record: GovernanceAuditRecord,
        format_name: str = "markdown",
    ) -> str:
        output = self._wrapped.export_report(record, format_name)
        self._sink.record(
            "export_report",
            {
                "ticket_id": record.ticket_id,
                "format_name": format_name,
                "length": len(output),
            },
        )
        return output
