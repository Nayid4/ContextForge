"""Documents Bounded Context (pure re-exports)."""

from __future__ import annotations

from domain.documents.attachment_entity import AttachmentEntity
from domain.documents.diff_comparison_vo import DiffComparisonVO
from domain.documents.document_aggregate import DocumentAggregate
from domain.documents.document_governance_rule_port import IDocumentGovernanceRule
from domain.documents.document_policies import (
    ALLOWED_ATTACHMENT_EXTENSIONS,
    FORBIDDEN_EXECUTABLE_EXTENSIONS,
    compute_sha256_text,
    compute_unified_diff,
    validate_attachment_policy,
)
from domain.documents.document_repository_port import IDocumentRepositoryPort
from domain.documents.document_updated_event import DocumentUpdatedEvent
from domain.documents.document_version_entity import DocumentVersionEntity
from domain.documents.editorial_state_machine import ALLOWED_EDITORIAL_TRANSITIONS, EditorialStateMachine
from domain.documents.editorial_status import EditorialStatus
from domain.documents.standard_governance_pipeline import StandardGovernancePipeline

__all__ = [
    "ALLOWED_ATTACHMENT_EXTENSIONS",
    "ALLOWED_EDITORIAL_TRANSITIONS",
    "AttachmentEntity",
    "DiffComparisonVO",
    "DocumentAggregate",
    "DocumentUpdatedEvent",
    "DocumentVersionEntity",
    "EditorialStateMachine",
    "EditorialStatus",
    "FORBIDDEN_EXECUTABLE_EXTENSIONS",
    "IDocumentGovernanceRule",
    "IDocumentRepositoryPort",
    "StandardGovernancePipeline",
    "compute_sha256_text",
    "compute_unified_diff",
    "validate_attachment_policy",
]
