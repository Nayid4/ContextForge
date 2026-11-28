"""OpenAI-compatible /v1/chat/completions payload."""
from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field


class OpenAiChatRequestPayload(BaseModel):
    model: str = Field("default/assistant", description="Formato: '{project_slug}/{agent_slug}'")
    messages: list[dict[str, Any]] = Field(..., min_length=1)
    stream: bool = False
    temperature: float | None = None
    max_tokens: int | None = None
    n: int = 1
    tools: Any = None
    tool_choice: Any = None
    response_format: Any = None
