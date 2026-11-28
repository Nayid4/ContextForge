"""CreateDocument Command Handler."""

from __future__ import annotations

from typing import Any, Callable, Coroutine

from application.documents.commands.CreateDocument.CreateDocumentCommand import CreateDocumentCommand
from domain.common import DomainError, ErrorOr
from domain.documents import DocumentAggregate, EditorialStatus, IDocumentRepositoryPort
from domain.ports import IRealtimeNotifier


class CreateDocumentCommandHandler:
    def __init__(
        self,
        doc_repo: IDocumentRepositoryPort,
        index_callback: Callable[[DocumentAggregate], Coroutine[Any, Any, Any]] | None = None,
        notifier: IRealtimeNotifier | None = None,
    ) -> None:
        self._doc_repo = doc_repo
        self._index_callback = index_callback
        self._notifier = notifier

    async def handle(self, request: CreateDocumentCommand) -> ErrorOr[DocumentAggregate]:
        existing = await self._doc_repo.get_by_path(request.path, project_slug=request.project_slug)
        if existing is not None:
            return ErrorOr.fail(DomainError.conflict("document_already_exists", f"Ya existe un documento en '{request.path}'."))
        st = EditorialStatus.parse(request.status)
        if st.is_error:
            return ErrorOr.fail(*st.errors)
        created = DocumentAggregate.create(
            project_slug=request.project_slug,
            path=request.path,
            title=request.title,
            content_markdown=request.content_markdown,
            module_name=request.module_name,
            author=request.author,
            tags=request.tags,
            status=st.value,
            summary=request.summary,
        )
        if created.is_error:
            return ErrorOr.fail(*created.errors)
        doc, v1 = created.value
        saved = await self._doc_repo.save(doc, v1)
        if self._index_callback and saved.status == EditorialStatus.PUBLISHED:
            await self._index_callback(saved)
        if self._notifier:
            await self._notifier.broadcast_project_event(
                saved.project_slug,
                "document.created",
                {"path": saved.path, "title": saved.title, "status": saved.status.value, "version": saved.current_version},
            )
        return ErrorOr.ok(saved)
