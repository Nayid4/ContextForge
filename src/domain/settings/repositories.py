"""Settings Domain Repository Interface."""

from __future__ import annotations

from typing import Protocol
from domain.settings.entities import SystemSettings


class ISettingsRepository(Protocol):
    """Protocol for persisting system configuration."""

    async def get_settings(self) -> SystemSettings:
        ...

    async def save_settings(self, settings: SystemSettings) -> None:
        ...

