from __future__ import annotations
from dataclasses import dataclass
import os

@dataclass(frozen=True)
class DatabaseOptions:
    db_provider: str = "sqlite"  # sqlite | postgresql | sqlserver | mysql | mongodb | firebase
    database_url: str = "sqlite+aiosqlite:///./data/database/contextforge.db"
    pool_size: int = 10
    busy_timeout_ms: int = 5000
    chroma_persist_dir: str = "./data/database/chroma"
    docs_root_path: str = "./docs"

    @classmethod
    def from_env(cls) -> DatabaseOptions:
        return cls(
            db_provider=os.getenv("DB_PROVIDER", "sqlite").lower(),
            database_url=os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./data/database/contextforge.db"),
            pool_size=int(os.getenv("DB_POOL_SIZE", "10")),
            busy_timeout_ms=int(os.getenv("DB_BUSY_TIMEOUT_MS", "5000")),
            chroma_persist_dir=os.getenv("CHROMA_PERSIST_DIR", "./data/database/chroma"),
            docs_root_path=os.getenv("DOCS_ROOT_PATH", "./docs"),
        )
