"""Canonical validated project slug value object (BR-01)."""

from __future__ import annotations

from dataclasses import dataclass
import re

from domain.common import DomainError, ErrorOr

SLUG_REGEX = re.compile(r"^[a-z0-9]+(?:[-_][a-z0-9]+)*$")


@dataclass(frozen=True)
class ProjectSlugVO:
    value: str

    @classmethod
    def create(cls, raw: str) -> ErrorOr[ProjectSlugVO]:
        cleaned = raw.strip().lower().replace(" ", "-")
        if len(cleaned) < 2 or len(cleaned) > 50 or not SLUG_REGEX.match(cleaned):
            return ErrorOr.fail(
                DomainError.validation(
                    "invalid_project_slug",
                    "El slug del proyecto debe tener entre 2 y 50 caracteres alfanuméricos en minúsculas (BR-01).",
                )
            )
        return ErrorOr.ok(cls(value=cleaned))
