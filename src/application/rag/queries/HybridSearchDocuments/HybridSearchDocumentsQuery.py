from __future__ import annotations
from dataclasses import dataclass
from application.common import IQuery
from domain.rag import SearchHitVO

@dataclass(frozen=True)
class HybridSearchDocumentsQuery(IQuery[list[SearchHitVO]]):
    query: str
    project_slug: str = "default"
    top_k: int = 5
    mode: str = "hybrid"
    ranking: str = "rrf"
    module_name: str | None = None
    include_drafts: bool = False
