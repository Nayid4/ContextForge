"""Widget ephemeral session token exchange payload."""
from __future__ import annotations
from pydantic import BaseModel, Field


class WidgetSessionPayload(BaseModel):
    publishable_key: str = Field(..., min_length=10)
    project_slug: str = "default"
    agent_slug: str = "assistant"
