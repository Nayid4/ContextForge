"""Storage connection test payload."""
from __future__ import annotations
from pydantic import BaseModel

class StorageTestPayload(BaseModel):
    provider: str = "local_fs"
    base_path: str = "./data/storage"
    endpoint_url: str = ""
    bucket_name: str = ""
    project_id: str = ""
