"""Domain event emitted whenever a DocumentAggregate is created, updated, transitioned, or rolled back."""

from __future__ import annotations

from dataclasses import dataclass

from domain.common import DomainEvent


@dataclass(frozen=True)
class DocumentUpdatedEvent(DomainEvent):
    doc_id: str = ""
    project_slug: str = "default"
    path: str = ""
    version_number: int = 1
    status: str = "published"
    action: str = "updated"
