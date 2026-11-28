from __future__ import annotations
from application.rag.queries.HybridSearchDocuments.HybridSearchDocumentsQuery import HybridSearchDocumentsQuery
from domain.common import DomainError

class HybridSearchDocumentsQueryValidation:
    def validate(self, request: HybridSearchDocumentsQuery) -> list[DomainError]:
        errs: list[DomainError] = []
        if not request.query.strip():
            errs.append(DomainError.validation("empty_search_query", "La consulta de búsqueda no puede estar vacía."))
        if request.top_k < 1 or request.top_k > 50:
            errs.append(DomainError.validation("invalid_top_k", "top_k debe estar entre 1 y 50."))
        if request.mode.lower() not in ("lexical", "vector", "hybrid"):
            errs.append(DomainError.validation("unknown_search_mode", f"Modo de búsqueda no soportado: '{request.mode}'."))
        if request.ranking.lower() not in ("rrf", "weighted"):
            errs.append(DomainError.validation("unknown_ranking_strategy", f"Estrategia de ranking no soportada: '{request.ranking}'."))
        return errs
