"""Database connection test payload."""
from __future__ import annotations
from pydantic import BaseModel

class DbTestPayload(BaseModel):
    provider: str = "sqlite"
    connection_url: str = ""
    host: str = ""
    port: int | None = None
