"""NoSQL Adapters (pure re-exports)."""

from __future__ import annotations

from infrastructure.persistence.nosql.firestore_knowledge_adapter import FirestoreKnowledgeAdapter
from infrastructure.persistence.nosql.mongo_knowledge_adapter import MongoKnowledgeAdapter

__all__ = ["FirestoreKnowledgeAdapter", "MongoKnowledgeAdapter"]
