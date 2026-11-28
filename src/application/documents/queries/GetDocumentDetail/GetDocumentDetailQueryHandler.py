"""GetDocumentDetail Query Handler."""

from __future__ import annotations

from application.documents.queries.GetDocumentDetail.GetDocumentDetailQuery import GetDocumentDetailQuery
from domain.common import DomainError, ErrorOr
from domain.documents import DocumentAggregate, IDocumentRepositoryPort


class GetDocumentDetailQueryHandler:
    def __init__(self, doc_repo: IDocumentRepositoryPort) -> None:
        self._doc_repo = doc_repo

    async def handle(self, request: GetDocumentDetailQuery) -> ErrorOr[DocumentAggregate]:
        doc = await self._doc_repo.get_by_path(request.path, project_slug=request.project_slug)
        if doc is None:
            return ErrorOr.fail(DomainError.not_found("document_not_found", f"Documento '{request.path}' no encontrado."))
        return ErrorOr.ok(doc)
