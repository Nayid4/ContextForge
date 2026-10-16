"""Taxonomy Domain Repository Interface."""

from __future__ import annotations

from typing import Protocol
from domain.taxonomy.entities import ModuleEntity, TagEntity


class ITaxonomyRepository(Protocol):
    """Protocol for managing project and global modules and tags."""

    async def list_modules(
        self,
        project_slug: str | None = None,
        search: str | None = None,
    ) -> list[ModuleEntity]:
        ...

    async def get_module_by_slug(self, slug: str) -> ModuleEntity | None:
        ...

    async def save_module(self, module: ModuleEntity) -> ModuleEntity:
        ...

    async def list_tags(
        self,
        project_slug: str | None = None,
        search: str | None = None,
    ) -> list[TagEntity]:
        ...

    async def get_tag_by_slug(self, slug: str) -> TagEntity | None:
        ...

    async def save_tag(self, tag: TagEntity) -> TagEntity:
        ...

