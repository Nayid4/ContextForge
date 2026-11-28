from __future__ import annotations
from dataclasses import dataclass
import os

@dataclass(frozen=True)
class StorageOptions:
    storage_provider: str = "local"  # local | aws_s3 | azure_blob | gcs
    local_storage_path: str = "./data/storage"
    max_attachment_size_mb: int = 25
    cloud_bucket_name: str = ""

    @classmethod
    def from_env(cls) -> StorageOptions:
        return cls(
            storage_provider=os.getenv("STORAGE_PROVIDER", "local").lower(),
            local_storage_path=os.getenv("LOCAL_STORAGE_PATH", "./data/storage"),
            max_attachment_size_mb=int(os.getenv("MAX_ATTACHMENT_SIZE_MB", "25")),
            cloud_bucket_name=os.getenv("CLOUD_BUCKET_NAME", ""),
        )
