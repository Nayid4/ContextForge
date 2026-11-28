from __future__ import annotations
from application.rag.queries.HybridSearchDocuments.HybridSearchDocumentsQuery import HybridSearchDocumentsQuery
from domain.common import ErrorOr
from domain.rag import HybridFusionStrategy, ILexicalIndexPort, IVectorStorePort, SearchHitVO

class HybridSearchDocumentsQueryHandler:
    def __init__(self, lexical_index: ILexicalIndexPort, vector_store: IVectorStorePort) -> None:
        self._lexical = lexical_index
        self._vector = vector_store

    async def handle(self, request: HybridSearchDocumentsQuery) -> ErrorOr[list[SearchHitVO]]:
        mode = request.mode.lower()
        candidate_k = max(request.top_k * 2, 10)
        if mode == "lexical":
            hits = await self._lexical.search(
                request.query,
                project_slug=request.project_slug,
                top_k=request.top_k,
                module_name=request.module_name,
                include_drafts=request.include_drafts,
            )
            return ErrorOr.ok(hits[: request.top_k])
        if mode == "vector":
            hits = await self._vector.search(
                request.query,
                project_slug=request.project_slug,
                top_k=request.top_k,
                module_name=request.module_name,
                include_drafts=request.include_drafts,
            )
            return ErrorOr.ok(hits[: request.top_k])

        lex_hits = await self._lexical.search(
            request.query,
            project_slug=request.project_slug,
            top_k=candidate_k,
            module_name=request.module_name,
            include_drafts=request.include_drafts,
        )
        vec_hits = await self._vector.search(
            request.query,
            project_slug=request.project_slug,
            top_k=candidate_k,
            module_name=request.module_name,
            include_drafts=request.include_drafts,
        )
        if request.ranking.lower() == "weighted":
            fused = HybridFusionStrategy.fuse_weighted(lex_hits, vec_hits, request.top_k)
        else:
            fused = HybridFusionStrategy.fuse_rrf(lex_hits, vec_hits, request.top_k)
        return ErrorOr.ok(fused)
