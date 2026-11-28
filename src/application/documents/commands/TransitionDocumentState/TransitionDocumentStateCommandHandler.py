"""TransitionDocumentState Command Handler enforcing BR-04 RAG visibility & BR-05 state machine."""

from __future__ import annotations

from typing import Any, Callable, Coroutine

from application.documents.commands.TransitionDocumentState.TransitionDocumentStateCommand import TransitionDocumentStateCommand
from domain.common import DomainError, ErrorOr
from domain.documents import DocumentAggregate, EditorialStatus, IDocumentRepositoryPort
from domain.rag import ILexicalIndexPort, IVectorStorePort


class TransitionDocumentStateCommandHandler:
    def __init__(
        self,
        doc_repo: IDocumentRepositoryPort,
        lexical_index: ILexicalIndexPort,
        vector_store: IVectorStorePort,
        index_callback: Callable[[DocumentAggregate], Coroutine[Any, Any, Any]] | None = None,
    ) -> None:
        self._doc_repo = doc_repo
        self._lexical = lexical_index
        self._vector = vector_store
        self._index_callback = index_callback

    async def handle(self, request: TransitionDocumentStateCommand) -> ErrorOr[DocumentAggregate]:
        doc = await self._doc_repo.get_by_path(request.path, project_slug=request.project_slug)
        if doc is None:
            return ErrorOr.fail(DomainError.not_found("document_not_found", f"Documento '{request.path}' no encontrado."))
        st = EditorialStatus.parse(request.target_status)
        if st.is_error:
            return ErrorOr.fail(*st.errors)
        tr = doc.transition_to(st.value, actor=request.actor, reason=request.reason)
        if tr.is_error:
            return ErrorOr.fail(*tr.errors)
        saved = await self._doc_repo.save(doc, tr.value)
        if saved.status == EditorialStatus.PUBLISHED:
            if self._index_callback:
                await self._index_callback(saved)
        else:
            await self._lexical.remove_document(saved.id, saved.project_slug)
            await self._vector.remove_document(saved.id, saved.project_slug)
        return ErrorOr.ok(saved)
