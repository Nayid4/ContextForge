"""Infrastructure Repository for Multi-Database and Multi-Storage Hexagonal Configurations."""

from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any
from domain.infrastructure_config.entities import (
    DatabaseConfiguration,
    DatabaseProvider,
    StorageConfiguration,
    StorageProvider,
    is_masked_api_key,
    sanitize_api_key,
)
from domain.infrastructure_config.repositories import IInfrastructureConfigRepository


DEFAULT_DATABASE_CONFIGS: dict[str, dict[str, Any]] = {
    "sqlite": {
        "name": "SQLite Local Soberano (Por Defecto)",
        "engine_category": "relational_sql",
        "connection_url": "sqlite+aiosqlite:///./data/contextforge.db",
        "host": "localhost",
        "port": 0,
        "database_name": "contextforge.db",
        "username": "",
        "password": "",
        "api_key": "",
        "project_id": "",
        "ssl_enabled": False,
        "is_active": True,
    },
    "postgresql": {
        "name": "PostgreSQL (Local o Remoto)",
        "engine_category": "relational_sql",
        "connection_url": "",
        "host": "localhost",
        "port": 5432,
        "database_name": "contextforge",
        "username": "postgres",
        "password": "",
        "api_key": "",
        "project_id": "",
        "ssl_enabled": False,
        "is_active": False,
    },
    "supabase": {
        "name": "Supabase (PostgreSQL + BaaS)",
        "engine_category": "relational_sql",
        "connection_url": "",
        "host": "aws-0-us-east-1.pooler.supabase.com",
        "port": 6543,
        "database_name": "postgres",
        "username": "postgres.tu_project_ref",
        "password": "",
        "api_key": "",
        "project_id": "",
        "ssl_enabled": True,
        "is_active": False,
    },
    "sqlserver": {
        "name": "Microsoft SQL Server / Azure SQL",
        "engine_category": "relational_sql",
        "connection_url": "",
        "host": "localhost",
        "port": 1433,
        "database_name": "contextforge",
        "username": "sa",
        "password": "",
        "api_key": "",
        "project_id": "",
        "ssl_enabled": True,
        "is_active": False,
    },
    "mongodb": {
        "name": "MongoDB (Local o MongoDB Atlas NoSQL)",
        "engine_category": "nosql_document",
        "connection_url": "mongodb://localhost:27017/contextforge",
        "host": "localhost",
        "port": 27017,
        "database_name": "contextforge",
        "username": "",
        "password": "",
        "api_key": "",
        "project_id": "",
        "ssl_enabled": False,
        "is_active": False,
    },
    "firebase": {
        "name": "Google Firebase Cloud Firestore (NoSQL)",
        "engine_category": "nosql_document",
        "connection_url": "",
        "host": "firestore.googleapis.com",
        "port": 443,
        "database_name": "(default)",
        "username": "",
        "password": "",
        "api_key": "",
        "project_id": "",
        "ssl_enabled": True,
        "is_active": False,
    },
}


DEFAULT_STORAGE_CONFIGS: dict[str, dict[str, Any]] = {
    "local_fs": {
        "name": "Sistema de Archivos Local (./docs)",
        "base_path": "./docs",
        "endpoint_url": "",
        "bucket_name": "docs",
        "region": "local",
        "access_key": "",
        "secret_key": "",
        "project_id": "",
        "sync_local_mirror": True,
        "is_active": True,
    },
    "supabase_storage": {
        "name": "Supabase Storage Bucket",
        "base_path": "./docs",
        "endpoint_url": "https://tu-proyecto.supabase.co",
        "bucket_name": "contextforge-docs",
        "region": "us-east-1",
        "access_key": "",
        "secret_key": "",
        "project_id": "",
        "sync_local_mirror": True,
        "is_active": False,
    },
    "s3": {
        "name": "AWS S3 / MinIO / Cloudflare R2",
        "base_path": "./docs",
        "endpoint_url": "https://s3.us-east-1.amazonaws.com",
        "bucket_name": "contextforge-knowledge",
        "region": "us-east-1",
        "access_key": "",
        "secret_key": "",
        "project_id": "",
        "sync_local_mirror": True,
        "is_active": False,
    },
    "firebase_storage": {
        "name": "Google Firebase Cloud Storage",
        "base_path": "./docs",
        "endpoint_url": "https://firebasestorage.googleapis.com",
        "bucket_name": "",
        "region": "us-central1",
        "access_key": "",
        "secret_key": "",
        "project_id": "",
        "sync_local_mirror": True,
        "is_active": False,
    },
}


class JsonInfrastructureConfigRepository(IInfrastructureConfigRepository):
    """Sovereign JSON-backed repository for bootstrap Database and Storage configurations."""

    def __init__(self, config_path: str | Path = "./data/infrastructure_configs.json") -> None:
        self._path = Path(config_path)

    def _load_raw(self) -> dict[str, Any]:
        if not self._path.exists():
            self._path.parent.mkdir(parents=True, exist_ok=True)
            initial = {
                "databases": DEFAULT_DATABASE_CONFIGS,
                "storages": DEFAULT_STORAGE_CONFIGS,
            }
            self._save_raw(initial)
            return initial

        try:
            data: dict[str, Any] = json.loads(self._path.read_text(encoding="utf-8"))
        except Exception:
            data = {}

        dbs = data.setdefault("databases", {})
        for k, v in DEFAULT_DATABASE_CONFIGS.items():
            if k not in dbs:
                dbs[k] = dict(v)

        stors = data.setdefault("storages", {})
        for k, v in DEFAULT_STORAGE_CONFIGS.items():
            if k not in stors:
                stors[k] = dict(v)

        return data

    def _save_raw(self, data: dict[str, Any]) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    @staticmethod
    def _dict_to_db(prov_key: str, raw: dict[str, Any]) -> DatabaseConfiguration:
        return DatabaseConfiguration(
            id=prov_key,
            provider=DatabaseProvider(prov_key),
            engine_category=str(raw.get("engine_category", "relational_sql")),
            name=str(raw.get("name", prov_key)),
            connection_url=str(raw.get("connection_url", "")),
            host=str(raw.get("host", "")),
            port=int(raw.get("port", 0) or 0),
            database_name=str(raw.get("database_name", "")),
            username=str(raw.get("username", "")),
            password=str(raw.get("password", "")),
            api_key=str(raw.get("api_key", "")),
            project_id=str(raw.get("project_id", "")),
            ssl_enabled=bool(raw.get("ssl_enabled", False)),
            is_active=bool(raw.get("is_active", False)),
        )

    @staticmethod
    def _dict_to_storage(prov_key: str, raw: dict[str, Any]) -> StorageConfiguration:
        return StorageConfiguration(
            id=prov_key,
            provider=StorageProvider(prov_key),
            name=str(raw.get("name", prov_key)),
            base_path=str(raw.get("base_path", "./docs")),
            endpoint_url=str(raw.get("endpoint_url", "")),
            bucket_name=str(raw.get("bucket_name", "")),
            region=str(raw.get("region", "")),
            access_key=str(raw.get("access_key", "")),
            secret_key=str(raw.get("secret_key", "")),
            project_id=str(raw.get("project_id", "")),
            sync_local_mirror=bool(raw.get("sync_local_mirror", True)),
            is_active=bool(raw.get("is_active", False)),
        )

    async def get_all_databases(self) -> list[DatabaseConfiguration]:
        data = self._load_raw()
        dbs = data.get("databases", {})
        order = list(DEFAULT_DATABASE_CONFIGS.keys())
        keys = sorted(dbs.keys(), key=lambda k: order.index(k) if k in order else 999)
        return [self._dict_to_db(k, dbs[k]) for k in keys]

    async def get_database_by_provider(self, provider: DatabaseProvider) -> DatabaseConfiguration | None:
        data = self._load_raw()
        raw = data.get("databases", {}).get(provider.value)
        if not raw:
            return None
        return self._dict_to_db(provider.value, raw)

    async def get_active_database(self) -> DatabaseConfiguration:
        all_dbs = await self.get_all_databases()
        for db in all_dbs:
            if db.is_active:
                return db
        return all_dbs[0]

    async def save_database(self, config: DatabaseConfiguration) -> DatabaseConfiguration:
        data = self._load_raw()
        dbs = data.setdefault("databases", {})
        existing = dbs.get(config.provider.value, {})

        pwd = config.password
        if is_masked_api_key(pwd):
            pwd = str(existing.get("password", ""))
        else:
            pwd = sanitize_api_key(pwd)

        api_key = config.api_key
        if is_masked_api_key(api_key):
            api_key = str(existing.get("api_key", ""))
        else:
            api_key = sanitize_api_key(api_key)

        dbs[config.provider.value] = {
            "name": config.name or existing.get("name", config.provider.value),
            "engine_category": config.engine_category,
            "connection_url": config.connection_url.strip(),
            "host": config.host.strip(),
            "port": int(config.port or 0),
            "database_name": config.database_name.strip(),
            "username": config.username.strip(),
            "password": pwd,
            "api_key": api_key,
            "project_id": config.project_id.strip(),
            "ssl_enabled": bool(config.ssl_enabled),
            "is_active": bool(existing.get("is_active", config.is_active)),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        self._save_raw(data)
        return self._dict_to_db(config.provider.value, dbs[config.provider.value])

    async def activate_database(self, provider: DatabaseProvider) -> DatabaseConfiguration:
        data = self._load_raw()
        dbs = data.setdefault("databases", {})
        for k, v in dbs.items():
            v["is_active"] = (k == provider.value)
        self._save_raw(data)
        return self._dict_to_db(provider.value, dbs[provider.value])

    async def get_all_storages(self) -> list[StorageConfiguration]:
        data = self._load_raw()
        stors = data.get("storages", {})
        order = list(DEFAULT_STORAGE_CONFIGS.keys())
        keys = sorted(stors.keys(), key=lambda k: order.index(k) if k in order else 999)
        return [self._dict_to_storage(k, stors[k]) for k in keys]

    async def get_storage_by_provider(self, provider: StorageProvider) -> StorageConfiguration | None:
        data = self._load_raw()
        raw = data.get("storages", {}).get(provider.value)
        if not raw:
            return None
        return self._dict_to_storage(provider.value, raw)

    async def get_active_storage(self) -> StorageConfiguration:
        all_stors = await self.get_all_storages()
        for st in all_stors:
            if st.is_active:
                return st
        return all_stors[0]

    async def save_storage(self, config: StorageConfiguration) -> StorageConfiguration:
        data = self._load_raw()
        stors = data.setdefault("storages", {})
        existing = stors.get(config.provider.value, {})

        sec_key = config.secret_key
        if is_masked_api_key(sec_key):
            sec_key = str(existing.get("secret_key", ""))
        else:
            sec_key = sanitize_api_key(sec_key)

        stors[config.provider.value] = {
            "name": config.name or existing.get("name", config.provider.value),
            "base_path": config.base_path.strip() or "./docs",
            "endpoint_url": config.endpoint_url.strip(),
            "bucket_name": config.bucket_name.strip(),
            "region": config.region.strip(),
            "access_key": config.access_key.strip(),
            "secret_key": sec_key,
            "project_id": config.project_id.strip(),
            "sync_local_mirror": bool(config.sync_local_mirror),
            "is_active": bool(existing.get("is_active", config.is_active)),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        self._save_raw(data)
        return self._dict_to_storage(config.provider.value, stors[config.provider.value])

    async def activate_storage(self, provider: StorageProvider) -> StorageConfiguration:
        data = self._load_raw()
        stors = data.setdefault("storages", {})
        for k, v in stors.items():
            v["is_active"] = (k == provider.value)
        self._save_raw(data)
        return self._dict_to_storage(provider.value, stors[provider.value])

