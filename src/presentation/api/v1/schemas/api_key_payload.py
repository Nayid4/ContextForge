"""API Key creation payload."""
from __future__ import annotations
from pydantic import BaseModel, Field

class ApiKeyPayload(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    role_scope: str = "AgentClient"
    allowed_projects: list[str] = Field(default_factory=lambda: ["default"])
    is_publishable: bool = False
    allowed_origins: list[str] = Field(default_factory=list)
    allowed_agents: list[str] = Field(default_factory=list)
    daily_quota_requests: int = Field(1000, ge=10, le=100000)
