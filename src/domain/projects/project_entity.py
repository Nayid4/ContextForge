"""Isolated multi-tenant knowledge workspace aggregate (RF-PRJ-001, RF-PRJ-002)."""

from __future__ import annotations

from datetime import datetime, timezone

from domain.common import AggregateRoot, DomainError, ErrorOr
from domain.projects.project_created_event import ProjectCreatedEvent
from domain.projects.project_slug_vo import ProjectSlugVO
from domain.projects.safe_path_policy import validate_safe_relative_path


class ProjectEntity(AggregateRoot):
    def __init__(
        self,
        *,
        slug: str,
        name: str,
        path: str,
        description: str = "",
        sovereign_only: bool = False,
        max_quota_mb: int = 1024,
        is_active: bool = False,
        owner_id: str | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> None:
        super().__init__()
        self.slug = slug
        self.name = name
        self.path = path
        self.description = description
        self.sovereign_only = sovereign_only
        self.max_quota_mb = max_quota_mb
        self.is_active = is_active
        self.owner_id = owner_id
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)

    @classmethod
    def create(
        cls,
        *,
        name: str,
        slug: str | None,
        path: str,
        description: str = "",
        sovereign_only: bool = False,
        max_quota_mb: int = 1024,
        owner_id: str | None = None,
    ) -> ErrorOr[ProjectEntity]:
        clean_name = name.strip()
        if len(clean_name) < 2 or len(clean_name) > 100:
            return ErrorOr.fail(DomainError.validation("invalid_project_name", "El nombre debe tener entre 2 y 100 caracteres."))
        slug_res = ProjectSlugVO.create(slug or clean_name)
        if slug_res.is_error:
            return ErrorOr.fail(*slug_res.errors)
        path_res = validate_safe_relative_path(path)
        if path_res.is_error:
            return ErrorOr.fail(*path_res.errors)
        if max_quota_mb < 10:
            return ErrorOr.fail(DomainError.validation("invalid_quota", "La cuota mínima del proyecto es 10 MB."))

        proj = cls(
            slug=slug_res.value.value,
            name=clean_name,
            path=path_res.value,
            description=description.strip(),
            sovereign_only=sovereign_only,
            max_quota_mb=max_quota_mb,
            is_active=False,
            owner_id=owner_id,
        )
        proj.record_event(ProjectCreatedEvent(project_slug=proj.slug, path=proj.path, sovereign_only=sovereign_only))
        return ErrorOr.ok(proj)
