"""Scoped SHA-256 API Key entity supporting private secret keys and read-only origin-locked publishable widget keys."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from domain.users.user_role import UserRole


@dataclass(frozen=True)
class ApiKeyEntity:
    key_id: str
    user_id: str
    name: str
    key_prefix: str
    key_sha256: str
    role_scope: UserRole
    allowed_projects: tuple[str, ...]
    is_publishable: bool = False
    allowed_origins: tuple[str, ...] = ()
    allowed_agents: tuple[str, ...] = ()
    daily_quota_requests: int = 1000
    last_used_at: datetime | None = None
    expires_at: datetime | None = None
    revoked_at: datetime | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def is_valid(self) -> bool:
        if self.revoked_at is not None:
            return False
        if self.expires_at is not None and self.expires_at <= datetime.now(timezone.utc):
            return False
        return True

    def is_origin_allowed(self, origin: str | None) -> bool:
        if not self.allowed_origins or "*" in self.allowed_origins:
            return True
        if not origin:
            return False
        norm = origin.strip().rstrip("/").lower()
        return any(norm == o.strip().rstrip("/").lower() for o in self.allowed_origins)

    def is_agent_allowed(self, project_slug: str, agent_slug: str) -> bool:
        """Checks whether this key is explicitly scoped to invoke the requested agent (BR-18)."""
        if not self.allowed_agents:
            return not self.is_publishable
        full_id = f"{project_slug}/{agent_slug}".lower()
        short_id = agent_slug.lower()
        for entry in self.allowed_agents:
            norm = entry.strip().lower()
            if norm in {"*", f"{project_slug.lower()}/*", full_id, short_id}:
                return True
        return False
