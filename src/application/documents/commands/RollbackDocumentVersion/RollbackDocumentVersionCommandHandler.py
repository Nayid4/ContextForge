from __future__ import annotations
from typing import Any, Callable, Coroutine
from application.documents.commands.RollbackDocumentVersion.RollbackDocumentVersionCommand import RollbackDocumentVersionCommand
from domain.common import DomainError, ErrorOr
from domain.documents import DocumentAggregate, EditorialStatus, IDocumentRepositoryPort

class RollbackDocumentVersionCommandHandler:
    def __init__(
        self,
        doc_repo: IDocumentRepositoryPort,
        index_callback: Callable[[DocumentAggregate], Coroutine[Any, Any, Any]] | None = None,
    ) -> None:
        self._doc_repo = doc_repo
        self._index_callback = index_callback

    async def handle(self, request: RollbackDocumentVersionCommand) -> ErrorOr[DocumentAggregate]:
        doc = await self._doc_repo.get_by_path(request.path, project_slug=request.project_slug)
        if doc is None:
            return ErrorOr.fail(DomainError.not_found("document_not_found", f"Documento '{request.path}' no encontrado."))
        snap = await self._doc_repo.get_version(doc.id, request.target_version)
        if snap is None:
            return ErrorOr.fail(DomainError.not_found("version_not_found", f"Versión v{request.target_version} no encontrada para '{request.path}'."))
        rb_res = doc.rollback_to_snapshot(snap, actor=request.actor, reason=request.reason)
        if rb_res.is_error:
            return ErrorOr.fail(*rb_res.errors)
        saved = await self._doc_repo.save(doc, rb_res.value)
        if self._index_callback and saved.status == EditorialStatus.PUBLISHED:
            await self._index_callback(saved)
        return ErrorOr.ok(saved)
