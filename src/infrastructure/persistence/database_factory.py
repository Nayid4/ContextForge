"""Hexagonal Database Connection Factory using Strategy, Options, and Registry Patterns."""

from __future__ import annotations

import logging
import time
from domain.infrastructure_config.entities import DatabaseConfiguration, DatabaseProvider
from infrastructure.persistence.strategies import (
    DatabaseConnectionOptions,
    FirebaseDatabaseStrategy,
    IDatabaseStrategy,
    MongoDatabaseStrategy,
    PostgresDatabaseStrategy,
    SqliteDatabaseStrategy,
    SqlServerDatabaseStrategy,
    SupabaseDatabaseStrategy,
    extract_host_port,
    probe_tcp,
)

logger = logging.getLogger("infrastructure.persistence.database_factory")


class DatabaseFactory:
    """Factory and connection orchestrator for Relational and NoSQL database engines.

    Implements:
    - Factory Pattern: Resolves appropriate strategy based on DatabaseProvider.
    - Strategy Pattern: Delegates engine-specific ping/check logic to concrete strategies.
    - Options Pattern: Packages configuration parameters into DatabaseConnectionOptions.
    """

    _STRATEGIES: dict[DatabaseProvider, IDatabaseStrategy] = {
        DatabaseProvider.SQLITE: SqliteDatabaseStrategy(),
        DatabaseProvider.POSTGRESQL: PostgresDatabaseStrategy(),
        DatabaseProvider.SUPABASE: SupabaseDatabaseStrategy(),
        DatabaseProvider.SQLSERVER: SqlServerDatabaseStrategy(),
        DatabaseProvider.MONGODB: MongoDatabaseStrategy(),
        DatabaseProvider.FIREBASE: FirebaseDatabaseStrategy(),
    }

    @classmethod
    def register_strategy(cls, provider: DatabaseProvider, strategy: IDatabaseStrategy) -> None:
        """Register or override a database engine strategy (Open/Closed Principle)."""
        cls._STRATEGIES[provider] = strategy
        logger.info("Registered database strategy for %s: %s", provider, strategy.__class__.__name__)

    @classmethod
    def get_strategy(cls, provider: DatabaseProvider) -> IDatabaseStrategy | None:
        """Retrieve the registered strategy for a given provider."""
        return cls._STRATEGIES.get(provider)

    @classmethod
    async def test_connection(cls, config: DatabaseConfiguration) -> tuple[bool, str, float]:
        """Verify database reachability, credentials, and driver readiness using the Options and Strategy patterns."""
        t0 = time.perf_counter()
        options = DatabaseConnectionOptions.from_config(config)
        strategy = cls.get_strategy(options.provider)

        if not strategy:
            latency = round((time.perf_counter() - t0) * 1000.0, 2)
            return False, f"Proveedor de base de datos no soportado: {options.provider}", latency

        return await strategy.test_connection(options)

    # Backward compatibility helpers
    @staticmethod
    def _extract_host_port(url: str, default_host: str, default_port: int) -> tuple[str, int]:
        return extract_host_port(url, default_host, default_port)

    @staticmethod
    async def _probe_tcp(host: str, port: int, timeout: float = 3.0) -> tuple[bool, str]:
        return await probe_tcp(host, port, timeout)


__all__ = [
    "DatabaseConnectionOptions",
    "DatabaseFactory",
    "FirebaseDatabaseStrategy",
    "IDatabaseStrategy",
    "MongoDatabaseStrategy",
    "PostgresDatabaseStrategy",
    "SqliteDatabaseStrategy",
    "SqlServerDatabaseStrategy",
    "SupabaseDatabaseStrategy",
]
