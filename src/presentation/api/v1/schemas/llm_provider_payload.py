"""Multi-LLM provider save/test payload."""
from __future__ import annotations
from pydantic import BaseModel

class LlmProviderPayload(BaseModel):
    provider: str
    engine_type: str = "local_http"
    name: str = ""
    base_url: str = ""
    api_key: str = ""
    default_model: str = ""
    cli_command: str = ""
    cli_args: str = ""
    temperature: float = 0.2
    max_tokens: int = 4096
    is_active: bool = True
