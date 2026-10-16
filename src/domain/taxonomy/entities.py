"""Taxonomy Domain Entities (Modules and Tags)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import uuid


@dataclass(frozen=True)
class ModuleEntity:
    """Domain entity representing a functional module / category for documentation."""

    id: str
    slug: str
    name: str
    description: str = ""
    color: str = "indigo"
    icon: str = "fa-folder"
    project_slug: str | None = None
    created_at: datetime | None = None

    @classmethod
    def create(
        cls,
        name: str,
        slug: str | None = None,
        description: str = "",
        color: str = "indigo",
        icon: str = "fa-folder",
        project_slug: str | None = None,
    ) -> ModuleEntity:
        clean_slug = (slug or name).strip().lower().replace(" ", "_").replace("-", "_")
        return cls(
            id=str(uuid.uuid4())[:8],
            slug=clean_slug,
            name=name.strip(),
            description=description.strip(),
            color=color,
            icon=icon,
            project_slug=project_slug,
            created_at=datetime.now(timezone.utc),
        )


@dataclass(frozen=True)
class TagEntity:
    """Domain entity representing a classification tag for documentation."""

    id: str
    slug: str
    name: str
    color: str = "blue"
    project_slug: str | None = None
    created_at: datetime | None = None

    @classmethod
    def create(
        cls,
        name: str,
        slug: str | None = None,
        color: str = "blue",
        project_slug: str | None = None,
    ) -> TagEntity:
        clean_slug = (slug or name).strip().lower().replace(" ", "-").replace("_", "-")
        return cls(
            id=str(uuid.uuid4())[:8],
            slug=clean_slug,
            name=name.strip(),
            color=color,
            project_slug=project_slug,
            created_at=datetime.now(timezone.utc),
        )

