"""Unit and Application tests for ContextForge components."""

from typing import AsyncGenerator
import pytest
from domain.context_builder.entities import BundleSpecification, ContextBundle
from domain.knowledge_docs.entities import Document, DocumentChunk
from domain.rag_engine.entities import Citation, PromptContext, RetrievalResult
from domain.settings.entities import SystemSettings
from application.context_builder.commands import BuildContextBundleCommand
from application.context_builder.handlers import BuildContextBundleCommandHandler
from application.context_builder.services.bundle_compiler import BundleCompiler
from application.knowledge_docs.commands import CreateDocumentCommand, IngestDocsCommand
from application.knowledge_docs.handlers import (
    CreateDocumentCommandHandler,
    GetDocumentDetailQueryHandler,
    GetDocumentsQueryHandler,
    IngestDocsCommandHandler,
)
from application.knowledge_docs.queries import GetDocumentDetailQuery, GetDocumentsQuery
from application.rag_engine.handlers import AskRagQueryHandler, SearchHybridQueryHandler
from application.rag_engine.queries import AskRagQuery, SearchHybridQuery
from application.rag_engine.services.hybrid_searcher import HybridSearchService
from application.rag_engine.services.prompt_builder import PromptBuilder
from application.settings.commands import UpdateSettingsCommand
from application.settings.handlers import (
    GetOllamaModelsQueryHandler,
    GetSettingsQueryHandler,
    UpdateSettingsCommandHandler,
)
from application.settings.queries import GetOllamaModelsQuery, GetSettingsQuery
from infrastructure.external.bundle_exporter import LocalBundleExporter
from infrastructure.external.markdown_parser import MarkdownParserService
from infrastructure.repositories.bm25_lexical_repo import BM25LexicalRepository
from infrastructure.repositories.chroma_vector_repo import ChromaVectorRepository
from infrastructure.repositories.local_filesystem_repo import LocalFileSystemRepository


class InMemorySettingsRepo:
    def __init__(self, initial: SystemSettings | None = None) -> None:
        self.settings = initial or SystemSettings()

    async def get_settings(self) -> SystemSettings:
        return self.settings

    async def save_settings(self, settings: SystemSettings) -> SystemSettings:
        self.settings = settings
        return self.settings


class InMemoryOllamaClient:
    async def get_installed_models(self) -> list[dict[str, object]]:
        return [
            {
                "name": "llama3.1:8b",
                "model": "llama3.1:8b",
                "size_bytes": 4920753328,
                "parameter_size": "8.0B",
                "quantization_level": "Q4_K_M",
                "format": "gguf",
            },
            {
                "name": "llama3.2:1b",
                "model": "llama3.2:1b",
                "size_bytes": 1321098329,
                "parameter_size": "1.2B",
                "quantization_level": "Q8_0",
                "format": "gguf",
            },
        ]

    async def stream_chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[str, None]:
        yield f"Respuesta generada con {model}: Según [retry_policy.md], reintentar 3 veces."

    async def generate_embedding(self, model: str, text: str) -> list[float]:
        return [0.1, 0.2, 0.3, 0.4]


@pytest.mark.asyncio
async def test_settings_handlers_flow() -> None:
    repo = InMemorySettingsRepo()
    get_handler = GetSettingsQueryHandler(repo)  # type: ignore[arg-type]
    update_handler = UpdateSettingsCommandHandler(repo)  # type: ignore[arg-type]

    # Default
    settings = await get_handler.handle(GetSettingsQuery())
    assert settings.active_llm_model == "llama3.1:8b"

    # Update
    updated = await update_handler.handle(
        UpdateSettingsCommand(
            active_llm_model="llama3.2:1b",
            ollama_url="http://localhost:11434",
            docs_path="./docs",
            embedding_model="nomic-embed-text",
            temperature=0.1,
        )
    )
    assert updated.active_llm_model == "llama3.2:1b"
    assert updated.temperature == 0.1

    # Get updated
    after = await get_handler.handle(GetSettingsQuery())
    assert after.active_llm_model == "llama3.2:1b"


@pytest.mark.asyncio
async def test_ollama_models_query_handler() -> None:
    client = InMemoryOllamaClient()
    handler = GetOllamaModelsQueryHandler(client)  # type: ignore[arg-type]
    models = await handler.handle(GetOllamaModelsQuery())
    assert len(models) == 2
    assert models[0]["name"] == "llama3.1:8b"
    assert models[1]["name"] == "llama3.2:1b"


@pytest.mark.asyncio
async def test_knowledge_docs_and_hybrid_search() -> None:
    doc_repo = LocalFileSystemRepository(base_path="./docs")
    vector_repo = ChromaVectorRepository(persist_directory="./data/chroma_test")
    lexical_repo = BM25LexicalRepository()

    # 1. Ingest docs
    ingest_handler = IngestDocsCommandHandler(doc_repo, vector_repo, lexical_repo)
    total_chunks = await ingest_handler.handle(IngestDocsCommand(target_directory="./docs"))
    assert total_chunks > 0

    # 2. List docs
    list_handler = GetDocumentsQueryHandler(doc_repo)
    docs = await list_handler.handle(GetDocumentsQuery())
    assert len(docs) >= 3

    # 3. Get single doc
    detail_handler = GetDocumentDetailQueryHandler(doc_repo)
    sample_doc = await detail_handler.handle(GetDocumentDetailQuery(relative_path=docs[0].path))
    assert sample_doc.title is not None
    assert len(sample_doc.chunks) > 0

    # 4. Hybrid Search
    searcher = HybridSearchService(vector_repo=vector_repo, lexical_repo=lexical_repo)
    search_handler = SearchHybridQueryHandler(searcher)
    search_results = await search_handler.handle(SearchHybridQuery(query="stripe webhook retry", top_k=3))
    assert len(search_results) > 0


@pytest.mark.asyncio
async def test_context_bundler_compiler(tmp_path: object) -> None:
    doc_repo = LocalFileSystemRepository(base_path="./docs")
    bundle_repo = LocalBundleExporter(base_directory=str(tmp_path))
    compiler = BundleCompiler()

    handler = BuildContextBundleCommandHandler(doc_repo, bundle_repo, compiler)
    bundle = await handler.handle(
        BuildContextBundleCommand(
            modules=["billing", "architecture"],
            max_tokens=8000,
            include_toc=True,
            include_guidelines=True,
        )
    )

    assert bundle.id is not None
    assert bundle.token_count > 0
    assert bundle.token_count <= 8000
    assert "Directrices Operativas" in bundle.compiled_markdown
    assert "Tabla de Contenidos" in bundle.compiled_markdown


@pytest.mark.asyncio
async def test_rag_prompt_builder_and_ask_stream() -> None:
    builder = PromptBuilder()
    chunks = [
        RetrievalResult(
            chunk_id="chunk-1",
            file_path="modules/billing/retry_policy.md",
            text="Reintentos con backoff exponencial máximo 3 veces.",
            relevance_score=0.95,
            source_type="hybrid",
            header_hierarchy=["Facturación", "Reintentos"],
        ),
        RetrievalResult(
            chunk_id="chunk-2",
            file_path="modules/billing/retry_policy.md",
            text="Segundo chunk del mismo archivo de políticas.",
            relevance_score=0.90,
            source_type="hybrid",
            header_hierarchy=["Facturación", "Reintentos", "Detalle"],
        ),
    ]
    context = builder.build_prompt(query="¿Cómo son los reintentos?", chunks=chunks)
    assert len(context.citations) == 1
    assert context.citations[0].file_path == "modules/billing/retry_policy.md"
    assert "CONTEXTO RECUPERADO" in context.prompt_text

    # Test AskRagQueryHandler
    vector_repo = ChromaVectorRepository(persist_directory="./data/chroma_test")
    lexical_repo = BM25LexicalRepository()
    searcher = HybridSearchService(vector_repo=vector_repo, lexical_repo=lexical_repo)
    ollama_client = InMemoryOllamaClient()
    settings_repo = InMemorySettingsRepo()

    ask_handler = AskRagQueryHandler(searcher, builder, ollama_client, settings_repo)  # type: ignore[arg-type]
    ctx, model = await ask_handler.prepare_context(AskRagQuery(query="stripe reintentos"))
    assert model == "llama3.1:8b"

    tokens: list[str] = []
    async for token in ask_handler.stream_answer(ctx, model):
        tokens.append(token)

    full_text = "".join(tokens)
    assert len(full_text) > 0
    assert "llama3.1:8b" in full_text
