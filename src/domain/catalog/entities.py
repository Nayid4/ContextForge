"""Catalog Domain Entities: Library and Book."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class Library:
    """Domain Entity representing a sovereign Library or Engineering Project."""

    slug: str
    name: str
    description: str = ""
    path: str = ""
    is_active: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self) -> None:
        self.slug = self.slug.strip().lower()
        self.name = self.name.strip()
        if not self.slug:
            raise ValueError("Library slug cannot be empty.")
        if not self.name:
            raise ValueError("Library name cannot be empty.")
        if not self.path:
            self.path = f"./docs/{self.slug}"

    def activate(self) -> None:
        self.is_active = True
        self.updated_at = datetime.now(timezone.utc)

    def deactivate(self) -> None:
        self.is_active = False
        self.updated_at = datetime.now(timezone.utc)

    def to_dict(self) -> dict[str, Any]:
        return {
            "slug": self.slug,
            "name": self.name,
            "description": self.description,
            "path": self.path,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


@dataclass
class Book:
    """Domain Entity representing an engineering document / book."""

    id: str
    slug: str
    title: str
    library_slug: str
    module_name: str
    path: str
    summary: str = ""
    tags: list[str] = field(default_factory=list)
    status: str = "published"  # "published" | "draft" | "archived"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self) -> None:
        self.id = self.id.strip()
        self.slug = self.slug.strip().lower()
        self.title = self.title.strip()
        self.library_slug = self.library_slug.strip().lower()
        if not self.title:
            raise ValueError("Book title cannot be empty.")

    def update_status(self, new_status: str) -> None:
        valid_statuses = {"published", "draft", "archived"}
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid status '{new_status}'. Allowed: {valid_statuses}")
        self.status = new_status
        self.updated_at = datetime.now(timezone.utc)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "library_slug": self.library_slug,
            "module_name": self.module_name,
            "path": self.path,
            "summary": self.summary,
            "tags": list(self.tags),
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
