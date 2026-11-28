"""Factory loading and caching strongly-typed AppSettings from environment variables."""

from __future__ import annotations

from infrastructure.config.app_settings import AppSettings
from infrastructure.config.env_file_loader import EnvFileLoader
from infrastructure.options import AiOptions, DatabaseOptions, EnvironmentOptions, StorageOptions


class SettingsFactory:
    _cached: AppSettings | None = None

    @classmethod
    def load(cls, *, force_reload: bool = False) -> AppSettings:
        if cls._cached is None or force_reload:
            EnvFileLoader.load_dotenv_if_present(force=force_reload)
            cls._cached = AppSettings(
                env=EnvironmentOptions.from_env(),
                db=DatabaseOptions.from_env(),
                ai=AiOptions.from_env(),
                storage=StorageOptions.from_env(),
            )
        return cls._cached
