"""RAG Assistant ask/stream payload."""
from __future__ import annotations
from pydantic import BaseModel

class RagAskPayload(BaseModel):
    question: str
    project_slug: str = "default"
    top_k: int = 5
    mode: str = "hybrid"
    ranking: str = "rrf"
    module_name: str | None = None
    session_id: str | None = None
    book_id: str | None = None
