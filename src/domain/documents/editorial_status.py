"""Canonical editorial workflow states (RF-DOC-003, BR-04, BR-05)."""

from __future__ import annotations

from enum import Enum

from domain.common import DomainError, ErrorOr


class EditorialStatus(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    PUBLISHED = "published"
    DEPRECATED = "deprecated"

    @classmethod
    def parse(cls, raw: str) -> ErrorOr[EditorialStatus]:
        norm = raw.strip().lower()
        for member in cls:
            if member.value == norm:
                return ErrorOr.ok(member)
        return ErrorOr.fail(
            DomainError.validation(
                "invalid_editorial_status",
                f"Estado editorial '{raw}' no reconocido. Valores válidos: draft, in_review, published, deprecated.",
            )
        )
