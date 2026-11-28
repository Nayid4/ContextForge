"""Repository port for global SystemSettings."""

from __future__ import annotations

from typing import Protocol

from domain.users.system_settings_entity import SystemSettingsEntity


class ISettingsRepositoryPort(Protocol):
    async def get_settings(self) -> SystemSettingsEntity: ...
    async def save_settings(self, settings: SystemSettingsEntity) -> SystemSettingsEntity: ...
