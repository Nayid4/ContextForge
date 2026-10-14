"""Use Case: Ingest and index documentation with multi-project isolation."""

from __future__ import annotations

from typing import Protocol
from domain.knowledge_docs.entities import Document, DocumentChunk
from domain.knowledge_docs.repositories import IDocumentRepository
from domain.rag_engine.repositories import ILexicalIndexRepository, IVectorRepository


class IngestDocsUseCase:
    """Orchestrates scanning, parsing, chunking, and isolated indexing of Docs-as-Code files."""

    def __init__(
        self,
        doc_repo: IDocumentRepository,
        vector_repo: IVectorRepository,
        lexical_repo: ILexicalIndexRepository,
    ) -> None:
        self._doc_repo = doc_repo
        self._vector_repo = vector_repo
        self._lexical_repo = lexical_repo

    async def execute(
        self,
        project_slug: str | None = None,
        target_directory: str = "./docs",
    ) -> int:
        """Execute isolated ingestion for a single project or all registered projects."""
        if project_slug and project_slug != "all":
            docs = await self._doc_repo.list_all(project_slug=project_slug)
            await self._vector_repo.clear_project(project_slug)
            await self._lexical_repo.clear_project(project_slug)

            all_chunks: list[DocumentChunk] = []
            for doc in docs:
                all_chunks.extend(doc.chunks)

            if all_chunks:
                await self._vector_repo.upsert_chunks(all_chunks, project_slug=project_slug)
                await self._lexical_repo.index_chunks(all_chunks, project_slug=project_slug)

            return len(all_chunks)

        # Ingest all projects partitioned
        docs = await self._doc_repo.list_all()
        chunks_by_project: dict[str, list[DocumentChunk]] = {}
        for doc in docs:
            slug = doc.project_slug or "default"
            if slug not in chunks_by_project:
                chunks_by_project[slug] = []
            chunks_by_project[slug].extend(doc.chunks)

        total_indexed = 0
        for p_slug, p_chunks in chunks_by_project.items():
            await self._vector_repo.clear_project(p_slug)
            await self._lexical_repo.clear_project(p_slug)
            if p_chunks:
                await self._vector_repo.upsert_chunks(p_chunks, project_slug=p_slug)
                await self._lexical_repo.index_chunks(p_chunks, project_slug=p_slug)
                total_indexed += len(p_chunks)

        return total_indexed
