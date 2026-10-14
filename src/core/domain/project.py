"""Project domain entity and Value Objects."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
import re
from typing import Any


@dataclass(frozen=True)
class ProjectSlug:
    """Value Object representing a unique, sanitized project slug identifier."""

    value: str

    def __post_init__(self) -> None:
        normalized = self.value.strip().lower()
        if not normalized:
            raise ValueError("El slug del proyecto no puede estar vacío.")

        if len(normalized) > 50:
            raise ValueError(f"El slug '{normalized}' supera los 50 caracteres máximos permitidos.")

        # Must only contain lowercase alphanumeric characters, hyphens, and underscores
        if not re.match(r"^[a-z0-9][a-z0-9-_]*[a-z0-9]$|^[a-z0-9]$", normalized):
            raise ValueError(
                f"El slug '{normalized}' es inválido. Debe contener solo letras minúsculas, números, guiones o guiones bajos, "
                "y no puede comenzar ni terminar con símbolos."
            )

        object.__setattr__(self, "value", normalized)

    def __str__(self) -> str:
        return self.value

    def __repr__(self) -> str:
        return f"ProjectSlug('{self.value}')"


@dataclass
class Project:
    """Domain Entity representing an isolated engineering knowledge project."""

    slug: ProjectSlug
    name: str
    description: str = ""
    path: str = ""
    is_active: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self) -> None:
        clean_name = self.name.strip()
        if not clean_name:
            raise ValueError("El nombre del proyecto no puede estar vacío.")
        self.name = clean_name

        if not self.path:
            self.path = f"./docs/{self.slug.value}"

    def activate(self) -> None:
        """Mark this project as active."""
        self.is_active = True
        self.updated_at = datetime.now(timezone.utc)

    def deactivate(self) -> None:
        """Mark this project as inactive."""
        self.is_active = False
        self.updated_at = datetime.now(timezone.utc)

    @property
    def collection_name(self) -> str:
        """Isolated ChromaDB collection name for this project."""
        return f"cf_project_{self.slug.value}"

    def to_dict(self) -> dict[str, Any]:
        """Serialize project metadata for project.json."""
        return {
            "slug": self.slug.value,
            "name": self.name,
            "description": self.description,
            "path": self.path,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Project:
        """Construct project entity from dictionary or project.json content."""
        created_at_val = data.get("created_at")
        updated_at_val = data.get("updated_at")

        created_at = (
            datetime.fromisoformat(created_at_val)
            if isinstance(created_at_val, str)
            else (created_at_val or datetime.now(timezone.utc))
        )
        updated_at = (
            datetime.fromisoformat(updated_at_val)
            if isinstance(updated_at_val, str)
            else (updated_at_val or datetime.now(timezone.utc))
        )

        return cls(
            slug=ProjectSlug(data["slug"]),
            name=data["name"],
            description=data.get("description", ""),
            path=data.get("path", f"./docs/{data['slug']}"),
            is_active=bool(data.get("is_active", False)),
            created_at=created_at,
            updated_at=updated_at,
        )

    @classmethod
    def create(
        cls,
        name: str,
        slug: str | ProjectSlug | None = None,
        description: str = "",
        path: str | None = None,
        is_active: bool = False,
    ) -> Project:
        """Factory method to instantiate a new Project with automatic slug generation if omitted."""
        if slug is None:
            # Generate slug from name
            generated_slug = re.sub(r"[^a-zA-Z0-9_-]+", "-", name).strip("-").lower()
            project_slug = ProjectSlug(generated_slug)
        elif isinstance(slug, str):
            project_slug = ProjectSlug(slug)
        else:
            project_slug = slug

        target_path = path or f"./docs/{project_slug.value}"
        now = datetime.now(timezone.utc)

        return cls(
            slug=project_slug,
            name=name,
            description=description,
            path=target_path,
            is_active=is_active,
            created_at=now,
            updated_at=now,
        )


class IProjectRepository:
    """Port for Project persistence and lifecycle management."""

    async def get_by_slug(self, slug: str) -> Project | None:
        """Retrieve a project by its unique slug."""
        raise NotImplementedError

    async def list_all(self) -> list[Project]:
        """List all registered projects."""
        raise NotImplementedError

    async def save(self, project: Project) -> None:
        """Persist or update a project."""
        raise NotImplementedError

    async def delete(self, slug: str) -> bool:
        """Delete a project by slug."""
        raise NotImplementedError

    async def get_active(self) -> Project | None:
        """Retrieve the currently active project."""
        raise NotImplementedError

    async def set_active(self, slug: str) -> None:
        """Mark a project as active and deactivate all others."""
        raise NotImplementedError


