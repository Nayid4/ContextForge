from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from application.common import ICommand


@dataclass(frozen=True)
class IssueApiKeyCommand(ICommand[dict[str, object]]):
    user_id: str
    name: str
    role_scope: str = "AgentClient"
    allowed_projects: tuple[str, ...] = ("default",)
    is_publishable: bool = False
    allowed_origins: tuple[str, ...] = ()
    allowed_agents: tuple[str, ...] = ()
    daily_quota_requests: int = 1000
    expires_at: datetime | None = None
