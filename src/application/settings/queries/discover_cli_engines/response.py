"""Response DTOs for local CLI engine discovery."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class DiscoveredEngineDTO:
    """Represents a local CLI AI tool detected on the host machine."""

    provider: str
    command: str
    name: str
    is_installed: bool
    path: str
    recommended_args: str
    default_model: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "provider": self.provider,
            "command": self.command,
            "name": self.name,
            "is_installed": self.is_installed,
            "path": self.path,
            "recommended_args": self.recommended_args,
            "default_model": self.default_model,
        }

