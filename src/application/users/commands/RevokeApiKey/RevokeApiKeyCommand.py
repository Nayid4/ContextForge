from __future__ import annotations
from dataclasses import dataclass
from application.common import ICommand

@dataclass(frozen=True)
class RevokeApiKeyCommand(ICommand[bool]):
    key_id: str
