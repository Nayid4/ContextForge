"""Firebase Firestore NoSQL Knowledge Adapter."""

from __future__ import annotations

from typing import Any


class FirestoreKnowledgeAdapter:
    def __init__(self, project_id: str, api_key: str = "") -> None:
        self.project_id = project_id
        self.api_key = api_key
        self._memory_mirror: dict[str, dict[str, Any]] = {}
