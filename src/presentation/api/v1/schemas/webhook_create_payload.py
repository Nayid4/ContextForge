"""Project webhook registration payload."""
from __future__ import annotations
from pydantic import BaseModel, Field


class WebhookCreatePayload(BaseModel):
    url: str = Field(..., min_length=8, max_length=500)
    events: list[str] = Field(default_factory=lambda: ["document.published", "document.indexed"])
    secret: str = ""
