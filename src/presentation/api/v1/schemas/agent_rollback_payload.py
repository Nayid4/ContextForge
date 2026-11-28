"""Agent rollback request payload."""
from __future__ import annotations
from pydantic import BaseModel, Field


class AgentRollbackPayload(BaseModel):
    target_version: int = Field(..., ge=1)
    reason: str = "Rollback de configuración"
