"""Module or Tag classification entity (RF-PRJ-003)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
import re
import uuid

from domain.common import DomainError, ErrorOr
from domain.projects.taxonomy_kind import TaxonomyKind


@dataclass(frozen=True)
class TaxonomyItemEntity:
    id: str
    project_slug: str
    slug: str
    kind: TaxonomyKind
    name: str
    description: str = ""
    color: str = "indigo"
    icon: str = "folder"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @classmethod
    def create(
        cls,
        *,
        project_slug: str,
        name: str,
        kind: TaxonomyKind,
        slug: str | None = None,
        description: str = "",
        color: str = "indigo",
        icon: str = "folder",
    ) -> ErrorOr[TaxonomyItemEntity]:
        clean_name = name.strip()
        if len(clean_name) < 2 or len(clean_name) > 100:
            return ErrorOr.fail(DomainError.validation("invalid_taxonomy_name", "Nombre taxonómico inválido (2-100 caracteres)."))
        norm_slug = re.sub(r"[^a-z0-9_-]+", "_", (slug or clean_name).strip().lower()).strip("_")
        if not norm_slug:
            return ErrorOr.fail(DomainError.validation("invalid_taxonomy_slug", "Slug taxonómico inválido."))
        return ErrorOr.ok(
            cls(
                id=str(uuid.uuid4())[:12],
                project_slug=project_slug,
                slug=norm_slug,
                kind=kind,
                name=clean_name,
                description=description.strip(),
                color=color.strip() or "indigo",
                icon=icon.strip() or "folder",
            )
        )
