"""RAG Engine Application Query Handlers with Multi-Project Support."""

from __future__ import annotations

from typing import AsyncGenerator
from domain.rag_engine.entities import Citation, PromptContext, RetrievalResult
from domain.rag_engine.repositories import IOllamaClient
from domain.settings.repositories import ISettingsRepository
from application.rag_engine.queries import AskRagQuery, SearchHybridQuery
from application.rag_engine.services.hybrid_searcher import HybridSearchService
from application.rag_engine.services.prompt_builder import SYSTEM_PROMPT, PromptBuilder


class SearchHybridQueryHandler:
    """Handler for hybrid BM25 + ChromaDB search."""

    def __init__(self, search_service: HybridSearchService) -> None:
        self._search_service = search_service

    async def handle(self, query: SearchHybridQuery) -> list[RetrievalResult]:
        return await self._search_service.search(
            query=query.query,
            project_slug=query.project_slug,
            top_k=query.top_k,
        )


class AskRagQueryHandler:
    """Handler for executing Grounded RAG with the active Ollama model."""

    def __init__(
        self,
        search_service: HybridSearchService,
        prompt_builder: PromptBuilder,
        ollama_client: IOllamaClient,
        settings_repo: ISettingsRepository,
    ) -> None:
        self._search_service = search_service
        self._prompt_builder = prompt_builder
        self._ollama_client = ollama_client
        self._settings_repo = settings_repo

    async def prepare_context(self, query: AskRagQuery) -> tuple[PromptContext, str]:
        """Retrieve chunks and build the prompt context for the target project."""
        settings = await self._settings_repo.get_settings()
        target_model = query.model or settings.active_llm_model

        chunks = await self._search_service.search(
            query=query.query,
            project_slug=query.project_slug,
            top_k=query.top_k,
        )
        context = self._prompt_builder.build_prompt(query.query, chunks)
        return context, target_model

    def stream_answer(
        self,
        prompt_context: PromptContext,
        model: str,
    ) -> AsyncGenerator[str, None]:
        """Stream LLM response tokens."""
        messages = [
            {"role": "user", "content": prompt_context.prompt_text},
        ]
        return self._ollama_client.stream_chat(
            model=model,
            messages=messages,
            system_prompt=SYSTEM_PROMPT,
        )
