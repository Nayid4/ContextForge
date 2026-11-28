from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand

@dataclass(frozen=True)
class SaveLlmProviderConfigCommand(ICommand[dict[str, object]]):
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
