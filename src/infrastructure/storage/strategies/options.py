"""Options Pattern for File Storage Adapters."""

from __future__ import annotations

from dataclasses import dataclass
from domain.infrastructure_config.entities import StorageConfiguration, StorageProvider


@dataclass(frozen=True)
class StorageOptions:
    """Options Pattern: Strongly-typed parameters for file storage adapters."""

    provider: StorageProvider
    bucket_name: str = ""
    endpoint_url: str = ""
    access_key: str = ""
    secret_key: str = ""
    region: str = "us-east-1"
    base_path: str = "./docs"
    project_id: str = ""
    sync_local_mirror: bool = True
    timeout_seconds: float = 15.0

    @classmethod
    def from_config(cls, config: StorageConfiguration) -> StorageOptions:
        """Construct StorageOptions from domain StorageConfiguration."""
        return cls(
            provider=config.provider,
            bucket_name=config.bucket_name or "",
            endpoint_url=config.endpoint_url or "",
            access_key=config.access_key or "",
            secret_key=config.secret_key or "",
            region=config.region or "us-east-1",
            base_path=config.base_path or "./docs",
            project_id=config.project_id or "",
            sync_local_mirror=config.sync_local_mirror,
            timeout_seconds=15.0,
        )

