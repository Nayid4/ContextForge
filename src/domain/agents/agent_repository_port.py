"""Repository port for project-scoped AI Agents with DB-level pagination and version snapshots."""

from __future__ import annotations

from typing import Protocol

from domain.agents.agent_entity import AgentEntity
from domain.agents.agent_version_entity import AgentVersionEntity
from domain.common import PagedResult, PageParams


class IAgentRepositoryPort(Protocol):
    async def list_paginated(
        self,
        *,
        project_slug: str | None = None,
        search: str | None = None,
        pagination: PageParams = PageParams(),
    ) -> PagedResult[AgentEntity]: ...
    async def list_all(self, project_slug: str | None = None) -> list[AgentEntity]: ...
    async def get_by_slug(self, project_slug: str, agent_slug: str) -> AgentEntity | None: ...
    async def get_by_id(self, agent_id: str) -> AgentEntity | None: ...
    async def save(
        self,
        agent: AgentEntity,
        *,
        author_id: str = "system",
        change_summary: str = "",
    ) -> AgentEntity: ...
    async def list_versions(self, agent_id: str) -> list[AgentVersionEntity]: ...
    async def get_version(self, agent_id: str, version_number: int) -> AgentVersionEntity | None: ...
    async def delete(self, project_slug: str, agent_slug: str) -> bool: ...
