"""Immutable configuration snapshot entity for Agent versioning and rollback (BR-19)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class AgentVersionEntity:
    version_id: str
    agent_id: str
    version_number: int
    config_json: str
    author_id: str = "system"
    change_summary: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
