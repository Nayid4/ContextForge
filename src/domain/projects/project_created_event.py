"""Domain event emitted when a new Project workspace is created."""

from __future__ import annotations

from dataclasses import dataclass

from domain.common import DomainEvent


@dataclass(frozen=True)
class ProjectCreatedEvent(DomainEvent):
    project_slug: str = ""
    path: str = ""
    sovereign_only: bool = False
