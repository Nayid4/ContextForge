"""Options Pattern for Database Connectivity."""

from __future__ import annotations

from dataclasses import dataclass
from domain.infrastructure_config.entities import DatabaseConfiguration, DatabaseProvider


@dataclass(frozen=True)
class DatabaseConnectionOptions:
    """Options Pattern: Strongly-typed connection options for database verification and connectivity."""

    provider: DatabaseProvider
    name: str
    connection_url: str = ""
    host: str = ""
    port: int | None = None
    database_name: str = ""
    username: str = ""
    password: str = ""
    api_key: str = ""
    project_id: str = ""
    timeout_seconds: float = 10.0

    @classmethod
    def from_config(cls, config: DatabaseConfiguration) -> DatabaseConnectionOptions:
        """Construct strongly-typed DatabaseConnectionOptions from a DatabaseConfiguration domain entity."""
        return cls(
            provider=config.provider,
            name=config.name,
            connection_url=config.build_effective_url(),
            host=config.host or "",
            port=config.port,
            database_name=config.database_name or "",
            username=config.username or "",
            password=config.password or "",
            api_key=config.api_key or "",
            project_id=config.project_id or "",
            timeout_seconds=10.0,
        )

