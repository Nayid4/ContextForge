"""UpdateDocument Command Handler enforcing ETag optimistic concurrency & immutable versioning."""

from __future__ import annotations

from typing import Any, Callable, Coroutine

from application.documents.commands.UpdateDocument.UpdateDocumentCommand import UpdateDocumentCommand
from domain.common import DomainError, ErrorOr
from domain.documents import DocumentAggregate, EditorialStatus, IDocumentRepositoryPort
from domain.ports import IRealtimeNotifier


class UpdateDocumentCommandHandler:
    def __init__(
        self,
        doc_repo: IDocumentRepositoryPort,
        index_callback: Callable[[DocumentAggregate], Coroutine[Any, Any, Any]] | None = None,
        notifier: IRealtimeNotifier | None = None,
    ) -> None:
        self._doc_repo = doc_repo
        self._index_callback = index_callback
        self._notifier = notifier

    async def handle(self, request: UpdateDocumentCommand) -> ErrorOr[DocumentAggregate]:
        doc = await self._doc_repo.get_by_path(request.path, project_slug=request.project_slug)
        if doc is None:
            return ErrorOr.fail(DomainError.not_found("document_not_found", f"Documento '{request.path}' no encontrado."))
        edit_res = doc.apply_edit(
            title=request.title,
            content_markdown=request.content_markdown,
            module_name=request.module_name,
            tags=request.tags,
            summary=request.summary,
            author=request.author,
            expected_version=request.expected_version,
            is_locked=request.is_locked,
            explicit_unlock=request.explicit_unlock,
            change_summary=request.change_summary,
        )
        if edit_res.is_error:
            return ErrorOr.fail(*edit_res.errors)
        saved = await self._doc_repo.save(doc, edit_res.value)
        if self._index_callback and saved.status == EditorialStatus.PUBLISHED:
            await self._index_callback(saved)
        if self._notifier:
            await self._notifier.broadcast_project_event(
                saved.project_slug,
                "document.updated",
                {"path": saved.path, "title": saved.title, "version": saved.current_version, "etag": saved.etag},
            )
        return ErrorOr.ok(saved)
