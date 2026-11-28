"""Project-scoped RBAC Membership entity (project_members table, BR-09 / BR-10)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class ProjectMemberEntity:
    member_id: str
    project_slug: str
    user_id: str
    role: str
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
