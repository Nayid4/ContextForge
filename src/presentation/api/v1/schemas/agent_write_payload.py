"""Agent create/update payload."""
from __future__ import annotations
from pydantic import BaseModel, Field


class AgentWritePayload(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    slug: str = ""
    description: str = ""
    system_prompt: str = ""
    llm_provider: str = ""
    llm_model: str = ""
    temperature: float = Field(0.2, ge=0.0, le=1.0)
    max_tokens: int = Field(2048, ge=128, le=32768)
    top_k: int = Field(6, ge=1, le=25)
    min_grounding_score: float = Field(0.15, ge=0.0, le=1.0)
    allowed_modules: list[str] = Field(default_factory=list)
    allowed_tags: list[str] = Field(default_factory=list)
    allowed_statuses: list[str] = Field(default_factory=lambda: ["published"])
    welcome_message: str = ""
    suggested_questions: list[str] = Field(default_factory=list)
    topic_boundaries: str = ""
    visibility: str = "internal"
    daily_quota_requests: int = Field(500, ge=10, le=100000)
    change_summary: str = ""
