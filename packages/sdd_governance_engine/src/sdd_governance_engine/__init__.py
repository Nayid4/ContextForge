"""sdd_governance_engine — Reusable SDD Governance, Validation & Audit Component (v1.0.0)."""

from __future__ import annotations

from sdd_governance_engine.api import (
    assign_best_reviewer,
    create_governance_engine,
    evaluate_workflow_transition,
    export_governance_report,
    list_registered_capabilities,
    register_assignment_strategy,
    register_policy_factory,
    register_report_exporter,
    validate_spec_artifact,
)
from sdd_governance_engine.contracts import (
    IAssignmentStrategy,
    IAuditSink,
    IGovernanceEngine,
    IGovernancePolicyFactory,
    IReportExporter,
    IValidationRule,
)
from sdd_governance_engine.exceptions import (
    GovernanceEngineError,
    NoEligibleReviewerError,
    UnknownProfileError,
    UnknownStrategyError,
)
from sdd_governance_engine.models import (
    AssignmentDecision,
    GovernanceAuditRecord,
    ReviewerCandidate,
    Severity,
    SpecArtifact,
    TaskContext,
    TransitionContext,
    TransitionDecision,
    ValidationIssue,
    ValidationResult,
    WorkflowState,
)

__version__ = "1.0.0"

__all__ = [
    "__version__",
    "validate_spec_artifact",
    "evaluate_workflow_transition",
    "assign_best_reviewer",
    "export_governance_report",
    "create_governance_engine",
    "register_policy_factory",
    "register_assignment_strategy",
    "register_report_exporter",
    "list_registered_capabilities",
    "IValidationRule",
    "IAssignmentStrategy",
    "IReportExporter",
    "IAuditSink",
    "IGovernancePolicyFactory",
    "IGovernanceEngine",
    "GovernanceEngineError",
    "UnknownProfileError",
    "UnknownStrategyError",
    "NoEligibleReviewerError",
    "Severity",
    "WorkflowState",
    "SpecArtifact",
    "ValidationIssue",
    "ValidationResult",
    "TransitionContext",
    "TransitionDecision",
    "ReviewerCandidate",
    "TaskContext",
    "AssignmentDecision",
    "GovernanceAuditRecord",
]
