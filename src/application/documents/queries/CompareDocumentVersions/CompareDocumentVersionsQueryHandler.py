from __future__ import annotations
from application.documents.queries.CompareDocumentVersions.CompareDocumentVersionsQuery import CompareDocumentVersionsQuery
from domain.common import DomainError, ErrorOr
from domain.documents import DiffComparisonVO, IDocumentRepositoryPort, compute_unified_diff

class CompareDocumentVersionsQueryHandler:
    def __init__(self, doc_repo: IDocumentRepositoryPort) -> None:
        self._doc_repo = doc_repo

    async def handle(self, request: CompareDocumentVersionsQuery) -> ErrorOr[DiffComparisonVO]:
        doc = await self._doc_repo.get_by_path(request.path, project_slug=request.project_slug)
        if doc is None:
            return ErrorOr.fail(DomainError.not_found("document_not_found", f"Documento '{request.path}' no encontrado."))
        v_from = await self._doc_repo.get_version(doc.id, request.from_version)
        v_to = await self._doc_repo.get_version(doc.id, request.to_version)
        if v_from is None or v_to is None:
            return ErrorOr.fail(DomainError.not_found("version_not_found", "Una de las versiones solicitadas no existe."))
        diff_txt, added, removed = compute_unified_diff(
            v_from.content_markdown,
            v_to.content_markdown,
            f"{request.path} (v{request.from_version})",
            f"{request.path} (v{request.to_version})",
        )
        return ErrorOr.ok(
            DiffComparisonVO(
                book_id=doc.id,
                from_version=request.from_version,
                to_version=request.to_version,
                unified_diff=diff_txt,
                added_lines=added,
                removed_lines=removed,
            )
        )
