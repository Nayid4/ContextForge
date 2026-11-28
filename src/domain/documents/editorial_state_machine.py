"""Enforces valid editorial transitions and RAG visibility gate (BR-04, BR-05)."""

from __future__ import annotations

from domain.common import DomainError, ErrorOr
from domain.documents.editorial_status import EditorialStatus

ALLOWED_EDITORIAL_TRANSITIONS: dict[EditorialStatus, set[EditorialStatus]] = {
    EditorialStatus.DRAFT: {EditorialStatus.IN_REVIEW, EditorialStatus.PUBLISHED},
    EditorialStatus.IN_REVIEW: {EditorialStatus.PUBLISHED, EditorialStatus.DRAFT},
    EditorialStatus.PUBLISHED: {EditorialStatus.DEPRECATED, EditorialStatus.DRAFT, EditorialStatus.IN_REVIEW},
    EditorialStatus.DEPRECATED: set(),
}


class EditorialStateMachine:
    @staticmethod
    def validate_transition(current: EditorialStatus, target: EditorialStatus) -> ErrorOr[EditorialStatus]:
        if current == target:
            return ErrorOr.ok(target)
        allowed = ALLOWED_EDITORIAL_TRANSITIONS.get(current, set())
        if target not in allowed:
            return ErrorOr.fail(
                DomainError.conflict(
                    "invalid_editorial_transition",
                    f"Transición editorial no permitida: '{current.value}' -> '{target.value}' (BR-05).",
                    current_status=current.value,
                    target_status=target.value,
                )
            )
        return ErrorOr.ok(target)

    @staticmethod
    def is_rag_eligible(status: EditorialStatus, include_drafts: bool = False) -> bool:
        if status == EditorialStatus.PUBLISHED:
            return True
        if include_drafts and status in (EditorialStatus.DRAFT, EditorialStatus.IN_REVIEW):
            return True
        return False
