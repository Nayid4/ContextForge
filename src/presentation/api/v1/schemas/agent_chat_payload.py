"""Agent chat request payload."""
from __future__ import annotations
from pydantic import BaseModel, Field


class AgentChatPayload(BaseModel):
    question: str = Field(..., min_length=1, max_length=4000)
    mode: str = "hybrid"
    ranking: str = "rrf"
