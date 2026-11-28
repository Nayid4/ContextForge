"""MongoDB NoSQL Knowledge Adapter."""

from __future__ import annotations

from typing import Any


class MongoKnowledgeAdapter:
    def __init__(self, connection_url: str, database_name: str = "contextforge") -> None:
        self.connection_url = connection_url
        self.database_name = database_name
        self._memory_mirror: dict[str, dict[str, Any]] = {}
