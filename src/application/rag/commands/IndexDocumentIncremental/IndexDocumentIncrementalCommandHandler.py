from __future__ import annotations
from typing import Callable
from application.rag.commands.IndexDocumentIncremental.IndexDocumentIncrementalCommand import IndexDocumentIncrementalCommand
from domain.common import ErrorOr
from domain.documents import DocumentAggregate, EditorialStatus
from domain.rag import ChunkVO, IIndexingJobRepositoryPort, ILexicalIndexPort, IVectorStorePort, IndexingJobEntity

class IndexDocumentIncrementalCommandHandler:
    def __init__(
        self,
        lexical_index: ILexicalIndexPort,
        vector_store: IVectorStorePort,
        job_repo: IIndexingJobRepositoryPort,
        chunker: Callable[[DocumentAggregate], list[ChunkVO]],
    ) -> None:
        self._lexical = lexical_index
        self._vector = vector_store
        self._jobs = job_repo
        self._chunker = chunker

    async def handle(self, request: IndexDocumentIncrementalCommand) -> ErrorOr[IndexingJobEntity]:
        doc = request.document
        job = IndexingJobEntity.create(
            book_id=doc.id,
            project_slug=doc.project_slug,
            path=doc.path,
            content_hash=doc.content_hash,
        )
        if doc.status != EditorialStatus.PUBLISHED:
            await self._lexical.remove_document(doc.id, doc.project_slug)
            await self._vector.remove_document(doc.id, doc.project_slug)
            job.mark_completed(0)
            await self._jobs.save_job(job)
            return ErrorOr.ok(job)

        if not request.force_reindex:
            last_hash = await self._jobs.get_last_indexed_hash(doc.id)
            lex_has = getattr(self._lexical, "has_document", None)
            vec_has = getattr(self._vector, "has_document", None)
            in_live_index = (
                (not callable(lex_has) or bool(lex_has(doc.id, doc.project_slug)))
                and (not callable(vec_has) or bool(vec_has(doc.id, doc.project_slug)))
            )
            if last_hash == doc.content_hash and in_live_index:
                job.mark_completed(0)
                return ErrorOr.ok(job)
            if last_hash == doc.content_hash and not in_live_index:
                # Re-hydrate volatile in-memory BM25/Vector indexes after server restart without duplicating DB jobs
                chunks = self._chunker(doc)
                await self._lexical.upsert_document_chunks(doc.id, doc.project_slug, chunks)
                await self._vector.upsert_document_chunks(doc.id, doc.project_slug, chunks)
                job.mark_completed(len(chunks))
                return ErrorOr.ok(job)

        chunks = self._chunker(doc)
        while job.attempts < job.max_attempts:
            try:
                await self._lexical.upsert_document_chunks(doc.id, doc.project_slug, chunks)
                await self._vector.upsert_document_chunks(doc.id, doc.project_slug, chunks)
                job.mark_completed(len(chunks))
                await self._jobs.save_job(job)
                return ErrorOr.ok(job)
            except Exception as exc:
                job.record_failure(str(exc))

        await self._jobs.save_job(job)
        return ErrorOr.ok(job)
