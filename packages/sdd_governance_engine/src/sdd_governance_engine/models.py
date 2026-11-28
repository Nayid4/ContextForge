"""Immutable value objects and DTOs exposed by the SDD Governance Engine public API."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Mapping


class Severity(str, Enum):
    """Severity level of a governance validation finding."""

    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class WorkflowState(str, Enum):
    """Canonical lifecycle states of an SDD specification / task."""

    PENDING = "pending"
    SPEC_READY = "spec_ready"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"
    BLOCKED = "blocked"


@dataclass(frozen=True)
class SpecArtifact:
    """Normalized representation of an SDD specification artifact."""

    ticket_id: str
    title: str
    branch_name: str
    sections: Mapping[str, str] = field(default_factory=dict)
    acceptance_criteria: tuple[str, ...] = field(default_factory=tuple)
    ears_requirements: tuple[str, ...] = field(default_factory=tuple)
    metadata: Mapping[str, Any] = field(default_factory=dict)

    @classmethod
    def from_mapping(cls, raw: Mapping[str, Any]) -> SpecArtifact:
        """Information Expert factory method converting raw dictionaries safely."""
        sections_raw = raw.get("sections") or {}
        sections = {str(k): str(v) for k, v in dict(sections_raw).items()}
        ac_raw = raw.get("acceptance_criteria") or ()
        ears_raw = raw.get("ears_requirements") or ()
        meta_raw = raw.get("metadata") or {}
        return cls(
            ticket_id=str(raw.get("ticket_id", "")).strip(),
            title=str(raw.get("title", "")).strip(),
            branch_name=str(raw.get("branch_name", "")).strip(),
            sections=sections,
            acceptance_criteria=tuple(str(item).strip() for item in ac_raw if str(item).strip()),
            ears_requirements=tuple(str(item).strip() for item in ears_raw if str(item).strip()),
            metadata=dict(meta_raw),
        )


@dataclass(frozen=True)
class ValidationIssue:
    """Single finding emitted by an IValidationRule."""

    rule_id: str
    severity: Severity
    message: str
    field_name: str = ""

    def to_dict(self) -> dict[str, str]:
        return {
            "rule_id": self.rule_id,
            "severity": self.severity.value,
            "message": self.message,
            "field_name": self.field_name,
        }


@dataclass(frozen=True)
class ValidationResult:
    """Aggregated outcome of validating a SpecArtifact against a policy profile."""

    ticket_id: str
    profile_name: str
    is_valid: bool
    score: float
    issues: tuple[ValidationIssue, ...] = field(default_factory=tuple)
    elapsed_ms: float = 0.0

    @property
    def error_count(self) -> int:
        return sum(1 for item in self.issues if item.severity == Severity.ERROR)

    @property
    def warning_count(self) -> int:
        return sum(1 for item in self.issues if item.severity == Severity.WARNING)

    def to_dict(self) -> dict[str, Any]:
        return {
            "ticket_id": self.ticket_id,
            "profile_name": self.profile_name,
            "is_valid": self.is_valid,
            "score": round(self.score, 2),
            "error_count": self.error_count,
            "warning_count": self.warning_count,
            "issues": [issue.to_dict() for issue in self.issues],
            "elapsed_ms": round(self.elapsed_ms, 3),
        }


@dataclass(frozen=True)
class TransitionContext:
    """Contextual evidence evaluated during an SDD workflow transition."""

    current_state: str
    target_state: str
    actor_role: str
    human_gate_approved: bool = False
    tests_passing: bool = False
    coverage_percent: float = 0.0
    has_independent_review: bool = False
    author_id: str = ""
    actor_id: str = ""


@dataclass(frozen=True)
class TransitionDecision:
    """Authorization decision for a requested SDD state transition."""

    allowed: bool
    current_state: str
    target_state: str
    actor_role: str
    reasons: tuple[str, ...] = field(default_factory=tuple)
    guardrails_checked: tuple[str, ...] = field(default_factory=tuple)
    elapsed_ms: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "allowed": self.allowed,
            "current_state": self.current_state,
            "target_state": self.target_state,
            "actor_role": self.actor_role,
            "reasons": list(self.reasons),
            "guardrails_checked": list(self.guardrails_checked),
            "elapsed_ms": round(self.elapsed_ms, 3),
        }


@dataclass(frozen=True)
class ReviewerCandidate:
    """Candidate human or AI reviewer with workload and domain skills."""

    reviewer_id: str
    display_name: str
    skills: tuple[str, ...] = field(default_factory=tuple)
    active_reviews: int = 0
    max_capacity: int = 5
    is_available: bool = True

    @classmethod
    def from_mapping(cls, raw: Mapping[str, Any]) -> ReviewerCandidate:
        skills_raw = raw.get("skills") or ()
        return cls(
            reviewer_id=str(raw.get("reviewer_id", "")).strip(),
            display_name=str(raw.get("display_name", raw.get("reviewer_id", ""))).strip(),
            skills=tuple(str(s).strip().lower() for s in skills_raw if str(s).strip()),
            active_reviews=int(raw.get("active_reviews", 0)),
            max_capacity=int(raw.get("max_capacity", 5)),
            is_available=bool(raw.get("is_available", True)),
        )


@dataclass(frozen=True)
class TaskContext:
    """Task metadata used to select the most suitable reviewer."""

    ticket_id: str
    module: str
    required_skills: tuple[str, ...] = field(default_factory=tuple)
    author_id: str = ""
    complexity: int = 3

    @classmethod
    def from_mapping(cls, raw: Mapping[str, Any]) -> TaskContext:
        req_skills = raw.get("required_skills") or ()
        return cls(
            ticket_id=str(raw.get("ticket_id", "")).strip(),
            module=str(raw.get("module", "general")).strip(),
            required_skills=tuple(str(s).strip().lower() for s in req_skills if str(s).strip()),
            author_id=str(raw.get("author_id", "")).strip(),
            complexity=int(raw.get("complexity", 3)),
        )


@dataclass(frozen=True)
class AssignmentDecision:
    """Selected reviewer and rationale produced by an IAssignmentStrategy."""

    ticket_id: str
    selected_reviewer_id: str
    selected_display_name: str
    strategy_used: str
    affinity_score: float
    rationale: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "ticket_id": self.ticket_id,
            "selected_reviewer_id": self.selected_reviewer_id,
            "selected_display_name": self.selected_display_name,
            "strategy_used": self.strategy_used,
            "affinity_score": round(self.affinity_score, 2),
            "rationale": self.rationale,
        }


@dataclass(frozen=True)
class GovernanceAuditRecord:
    """Consolidated audit record exportable to JSON, Markdown, Text or custom formats."""

    ticket_id: str
    title: str
    generated_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    )
    validation: ValidationResult | None = None
    transition: TransitionDecision | None = None
    assignment: AssignmentDecision | None = None
    notes: tuple[str, ...] = field(default_factory=tuple)

    def to_dict(self) -> dict[str, Any]:
        return {
            "ticket_id": self.ticket_id,
            "title": self.title,
            "generated_at": self.generated_at,
            "validation": self.validation.to_dict() if self.validation else None,
            "transition": self.transition.to_dict() if self.transition else None,
            "assignment": self.assignment.to_dict() if self.assignment else None,
            "notes": list(self.notes),
        }
