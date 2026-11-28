from __future__ import annotations
from application.documents.commands.DeleteDocument.DeleteDocumentCommand import DeleteDocumentCommand
from domain.common import DomainError, ErrorOr
from domain.documents import IDocumentRepositoryPort
from domain.rag import ILexicalIndexPort, IVectorStorePort

class DeleteDocumentCommandHandler:
    def __init__(
        self,
        doc_repo: IDocumentRepositoryPort,
        lexical_index: ILexicalIndexPort,
        vector_store: IVectorStorePort,
    ) -> None:
        self._doc_repo = doc_repo
        self._lexical = lexical_index
        self._vector = vector_store

    async def handle(self, request: DeleteDocumentCommand) -> ErrorOr[bool]:
        doc = await self._doc_repo.get_by_path(request.path, project_slug=request.project_slug)
        if doc is None:
            return ErrorOr.fail(DomainError.not_found("document_not_found", f"Documento '{request.path}' no encontrado."))
        deleted = await self._doc_repo.delete(request.path, project_slug=request.project_slug)
        await self._lexical.remove_document(doc.id, request.project_slug)
        await self._vector.remove_document(doc.id, request.project_slug)
        return ErrorOr.ok(deleted)
