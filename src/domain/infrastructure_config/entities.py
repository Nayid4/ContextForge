"""Domain entities for Hexagonal Multi-Database & Multi-Storage Ports and Adapters."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any
from domain.llm.entities import is_masked_api_key, sanitize_api_key
from domain.shared_kernel.entities import Entity


class DatabaseProvider(str, Enum):
    """Supported relational (SQLAlchemy) and NoSQL/BaaS database engines."""

    SQLITE = "sqlite"            # Default local sovereign database (./data/contextforge.db)
    POSTGRESQL = "postgresql"    # Local or Remote PostgreSQL (postgresql+asyncpg://)
    SUPABASE = "supabase"        # Supabase PostgreSQL + PostgREST API
    SQLSERVER = "sqlserver"      # Microsoft SQL Server / Azure SQL (mssql+aioodbc://)
    MONGODB = "mongodb"          # MongoDB Local or Atlas (mongodb:// or mongodb+srv://)
    FIREBASE = "firebase"        # Google Firebase Firestore (NoSQL Document Store)


class StorageProvider(str, Enum):
    """Supported file and Markdown/attachment storage backends."""

    LOCAL_FS = "local_fs"                  # Default local filesystem (./docs)
    SUPABASE_STORAGE = "supabase_storage"  # Supabase Storage Buckets
    S3 = "s3"                              # AWS S3 / MinIO / Cloudflare R2
    FIREBASE_STORAGE = "firebase_storage"  # Google Firebase Cloud Storage


def mask_secret_value(secret: str | None) -> str:
    """Mask passwords, connection strings with credentials, and API keys for safe UI rendering."""
    if not secret:
        return ""
    if len(secret) <= 6:
        return "••••••••"
    return f"{secret[:3]}••••••••{secret[-3:]}"


@dataclass
class DatabaseConfiguration(Entity):
    """Configuration entity for a relational or NoSQL database adapter."""

    provider: DatabaseProvider = DatabaseProvider.SQLITE
    engine_category: str = "relational_sql"  # 'relational_sql' | 'nosql_document'
    name: str = "SQLite Local Soberano"
    connection_url: str = "sqlite+aiosqlite:///./data/contextforge.db"
    host: str = ""
    port: int = 0
    database_name: str = "contextforge"
    username: str = ""
    password: str = ""
    api_key: str = ""
    project_id: str = ""
    ssl_enabled: bool = False
    is_active: bool = False
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self) -> None:
        if isinstance(self.provider, str):
            self.provider = DatabaseProvider(self.provider)
        if self.provider in (DatabaseProvider.MONGODB, DatabaseProvider.FIREBASE):
            self.engine_category = "nosql_document"
        else:
            self.engine_category = "relational_sql"
        if self.provider != DatabaseProvider.SQLITE and self.connection_url == "sqlite+aiosqlite:///./data/contextforge.db":
            self.connection_url = ""

    def build_effective_url(self) -> str:
        """Build SQLAlchemy or driver connection URI from fields if connection_url is not explicitly overridden."""
        raw_url = (self.connection_url or "").strip()
        if self.provider == DatabaseProvider.SQLITE:
            return raw_url or "sqlite+aiosqlite:///./data/contextforge.db"

        if self.provider in (DatabaseProvider.POSTGRESQL, DatabaseProvider.SUPABASE):
            if raw_url and not is_masked_api_key(raw_url) and "://" in raw_url:
                if raw_url.startswith("postgres://"):
                    return "postgresql+asyncpg://" + raw_url[len("postgres://") :]
                if raw_url.startswith("postgresql://"):
                    return "postgresql+asyncpg://" + raw_url[len("postgresql://") :]
                return raw_url
            host = self.host or ("db.project.supabase.co" if self.provider == DatabaseProvider.SUPABASE else "localhost")
            port = self.port or 5432
            user = self.username or "postgres"
            pwd = self.password or ""
            db = self.database_name or "postgres"
            auth = f"{user}:{pwd}@" if pwd else f"{user}@"
            return f"postgresql+asyncpg://{auth}{host}:{port}/{db}"

        if self.provider == DatabaseProvider.SQLSERVER:
            if raw_url and not is_masked_api_key(raw_url) and "://" in raw_url:
                return raw_url
            host = self.host or "localhost"
            port = self.port or 1433
            user = self.username or "sa"
            pwd = self.password or ""
            db = self.database_name or "contextforge"
            auth = f"{user}:{pwd}@" if pwd else f"{user}@"
            return f"mssql+aioodbc://{auth}{host}:{port}/{db}?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"

        if self.provider == DatabaseProvider.MONGODB:
            if raw_url and not is_masked_api_key(raw_url) and "mongodb" in raw_url:
                return raw_url
            host = self.host or "localhost"
            port = self.port or 27017
            user = self.username
            pwd = self.password
            auth = f"{user}:{pwd}@" if (user and pwd) else ""
            return f"mongodb://{auth}{host}:{port}/{self.database_name or 'contextforge'}"

        return raw_url

    def to_dict(self, mask_secrets: bool = True) -> dict[str, Any]:
        return {
            "id": self.id or self.provider.value,
            "provider": self.provider.value,
            "engine_category": self.engine_category,
            "name": self.name,
            "connection_url": self.connection_url,
            "host": self.host,
            "port": self.port,
            "database_name": self.database_name,
            "username": self.username,
            "password": mask_secret_value(self.password) if mask_secrets else self.password,
            "has_password": bool(self.password and not is_masked_api_key(self.password)),
            "api_key": mask_secret_value(self.api_key) if mask_secrets else self.api_key,
            "has_api_key": bool(self.api_key and not is_masked_api_key(self.api_key)),
            "project_id": self.project_id,
            "ssl_enabled": self.ssl_enabled,
            "is_active": self.is_active,
            "effective_url_preview": self.build_effective_url().replace(self.password, "••••")
            if (mask_secrets and self.password)
            else self.build_effective_url(),
            "updated_at": self.updated_at.isoformat(),
        }


@dataclass
class StorageConfiguration(Entity):
    """Configuration entity for a Local or Cloud File Storage adapter."""

    provider: StorageProvider = StorageProvider.LOCAL_FS
    name: str = "Sistema de Archivos Local (./docs)"
    base_path: str = "./docs"
    endpoint_url: str = ""
    bucket_name: str = "contextforge-docs"
    region: str = "us-east-1"
    access_key: str = ""
    secret_key: str = ""
    project_id: str = ""
    sync_local_mirror: bool = True
    is_active: bool = False
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self) -> None:
        if isinstance(self.provider, str):
            self.provider = StorageProvider(self.provider)

    def to_dict(self, mask_secrets: bool = True) -> dict[str, Any]:
        return {
            "id": self.id or self.provider.value,
            "provider": self.provider.value,
            "name": self.name,
            "base_path": self.base_path,
            "endpoint_url": self.endpoint_url,
            "bucket_name": self.bucket_name,
            "region": self.region,
            "access_key": self.access_key,
            "secret_key": mask_secret_value(self.secret_key) if mask_secrets else self.secret_key,
            "has_secret_key": bool(self.secret_key and not is_masked_api_key(self.secret_key)),
            "project_id": self.project_id,
            "sync_local_mirror": self.sync_local_mirror,
            "is_active": self.is_active,
            "updated_at": self.updated_at.isoformat(),
        }


__all__ = [
    "DatabaseConfiguration",
    "DatabaseProvider",
    "StorageConfiguration",
    "StorageProvider",
    "is_masked_api_key",
    "mask_secret_value",
    "sanitize_api_key",
]

