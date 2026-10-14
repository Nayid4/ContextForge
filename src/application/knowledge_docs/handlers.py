"""Knowledge Docs Application Handlers with Multi-Project Support."""

from __future__ import annotations

from domain.knowledge_docs.entities import Document, DocumentChunk
from domain.knowledge_docs.repositories import IDocumentRepository
from domain.rag_engine.repositories import ILexicalIndexRepository, IVectorRepository
from domain.shared_kernel.exceptions import EntityNotFoundException
from application.knowledge_docs.commands import CreateDocumentCommand, IngestDocsCommand
from application.knowledge_docs.queries import GetDocumentDetailQuery, GetDocumentsQuery


class GetDocumentsQueryHandler:
    """Handler for listing documentation files, optionally isolated by project."""

    def __init__(self, doc_repo: IDocumentRepository) -> None:
        self._doc_repo = doc_repo

    async def handle(self, query: GetDocumentsQuery) -> list[Document]:
        return await self._doc_repo.list_all(
            module=query.module,
            search=query.search,
            project_slug=query.project_slug,
        )


class GetDocumentDetailQueryHandler:
    """Handler for retrieving a single document."""

    def __init__(self, doc_repo: IDocumentRepository) -> None:
        self._doc_repo = doc_repo

    async def handle(self, query: GetDocumentDetailQuery) -> Document:
        doc = await self._doc_repo.get_by_path(
            query.relative_path,
            project_slug=query.project_slug,
        )
        if not doc:
            raise EntityNotFoundException(f"Documento no encontrado: {query.relative_path}")
        return doc


class IngestDocsCommandHandler:
    """Handler to index documents into vector and lexical stores with strict project partitioning."""

    def __init__(
        self,
        doc_repo: IDocumentRepository,
        vector_repo: IVectorRepository,
        lexical_repo: ILexicalIndexRepository,
    ) -> None:
        self._doc_repo = doc_repo
        self._vector_repo = vector_repo
        self._lexical_repo = lexical_repo

    async def handle(self, command: IngestDocsCommand) -> int:
        if command.project_slug and command.project_slug != "all":
            docs = await self._doc_repo.list_all(project_slug=command.project_slug)
            await self._vector_repo.clear_project(command.project_slug)
            await self._lexical_repo.clear_project(command.project_slug)

            all_chunks: list[DocumentChunk] = []
            for doc in docs:
                all_chunks.extend(doc.chunks)

            if all_chunks:
                await self._vector_repo.upsert_chunks(all_chunks, project_slug=command.project_slug)
                await self._lexical_repo.index_chunks(all_chunks, project_slug=command.project_slug)

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


class CreateDocumentCommandHandler:
    """Handler to persist a new document into Docs-as-Code filesystem."""

    def __init__(
        self,
        doc_repo: IDocumentRepository,
        vector_repo: IVectorRepository,
        lexical_repo: ILexicalIndexRepository,
    ) -> None:
        self._doc_repo = doc_repo
        self._vector_repo = vector_repo
        self._lexical_repo = lexical_repo

    async def handle(self, command: CreateDocumentCommand) -> Document:
        tags_str = ", ".join(command.tags)
        raw_markdown = f"""---
title: "{command.title}"
module: "{command.module}"
project_slug: "{command.project_slug}"
author: "{command.author}"
tags: [{tags_str}]
---

{command.content_markdown}
"""
        doc = await self._doc_repo.save_document(
            command.relative_path,
            raw_markdown,
            project_slug=command.project_slug,
        )
        if doc.chunks:
            await self._vector_repo.upsert_chunks(doc.chunks, project_slug=command.project_slug)
            await self._lexical_repo.index_chunks(doc.chunks, project_slug=command.project_slug)

        return doc
