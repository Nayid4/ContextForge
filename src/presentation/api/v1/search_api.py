"""Hybrid Search REST API Endpoint."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from application.rag_engine.handlers import SearchHybridQueryHandler
from application.rag_engine.queries import SearchHybridQuery
from presentation.api.dependencies import get_search_hybrid_handler

router = APIRouter(prefix="/search", tags=["Search"])


class SearchResultItem(BaseModel):
    chunk_id: str
    file_path: str
    text: str
    relevance_score: float
    source_type: str
    header_hierarchy: list[str]


@router.get("/hybrid", response_model=list[SearchResultItem])
async def search_hybrid(
    q: str = Query(..., min_length=1, description="Search query"),
    top_k: int = Query(5, ge=1, le=20),
    project: str = Query("default", description="Project slug for isolated search"),
    handler: SearchHybridQueryHandler = Depends(get_search_hybrid_handler),
) -> Any:
    """Execute Reciprocal Rank Fusion search across dense (ChromaDB) and lexical (BM25) indexes."""
    results = await handler.handle(SearchHybridQuery(query=q, top_k=top_k, project_slug=project))
    return results

