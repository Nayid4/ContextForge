"""GetDocumentVersions Query Handler."""

from __future__ import annotations

from application.documents.queries.GetDocumentVersions.GetDocumentVersionsQuery import GetDocumentVersionsQuery
from domain.common import DomainError, ErrorOr
from domain.documents import DocumentVersionEntity, IDocumentRepositoryPort


class GetDocumentVersionsQueryHandler:
    def __init__(self, doc_repo: IDocumentRepositoryPort) -> None:
        self._doc_repo = doc_repo

    async def handle(self, request: GetDocumentVersionsQuery) -> ErrorOr[list[DocumentVersionEntity]]:
        doc = await self._doc_repo.get_by_path(request.path, project_slug=request.project_slug)
        if doc is None:
            return ErrorOr.fail(DomainError.not_found("document_not_found", f"Documento '{request.path}' no encontrado."))
        versions = await self._doc_repo.list_versions(doc.id)
        return ErrorOr.ok(versions)
