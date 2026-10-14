"""FastAPI Dependency Injection Providers for ContextForge."""

from __future__ import annotations

from typing import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker
from domain.context_builder.repositories import IBundleStorageRepository
from domain.knowledge_docs.repositories import IDocumentRepository
from domain.rag_engine.repositories import ILexicalIndexRepository, IOllamaClient, IVectorRepository
from domain.settings.repositories import ISettingsRepository
from domain.shared_kernel.unit_of_work import IUnitOfWork
from application.chat.services import ScopedChatService
from application.context_builder.handlers import BuildContextBundleCommandHandler
from application.context_builder.services.bundle_compiler import BundleCompiler
from application.knowledge_docs.handlers import (
    CreateDocumentCommandHandler,
    GetDocumentDetailQueryHandler,
    GetDocumentsQueryHandler,
    IngestDocsCommandHandler,
)
from application.rag_engine.handlers import AskRagQueryHandler, SearchHybridQueryHandler
from application.rag_engine.services.hybrid_searcher import HybridSearchService
from application.rag_engine.services.prompt_builder import PromptBuilder
from application.settings.handlers import (
    GetOllamaModelsQueryHandler,
    GetSettingsQueryHandler,
    UpdateSettingsCommandHandler,
)
from core.domain.project import IProjectRepository
from core.use_cases.ingest_docs import IngestDocsUseCase
from core.use_cases.scaffold_doc import ScaffoldDocUseCase
from infrastructure.database.connection import create_engine_instance, create_session_factory
from infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork
from infrastructure.external.bundle_exporter import LocalBundleExporter
from infrastructure.external.markdown_parser import MarkdownParserService
from infrastructure.external.ollama_client import OllamaHttpClient
from infrastructure.repositories.bm25_lexical_repo import BM25LexicalRepository
from infrastructure.repositories.chroma_vector_repo import ChromaVectorRepository
from infrastructure.repositories.local_filesystem_repo import LocalFileSystemRepository
from infrastructure.repositories.sql_settings_repo import SqlSettingsRepository
from infrastructure.repositories.sqlite_project_repo import SqliteProjectRepository
from infrastructure.repositories.sql_catalog_repo import (
    SqlBookRepository,
    SqlLibraryRepository,
)
from infrastructure.repositories.sql_book_registry_repo import (
    InMemoryDraftBookRepository,
    SqlAttachmentRepository,
)
from infrastructure.repositories.sql_social_repo import SqlSocialRepository
from infrastructure.repositories.sql_chat_repo import SqlChatSessionRepository

# Singletons for application lifecycle
_engine: AsyncEngine = create_engine_instance()
_session_factory: async_sessionmaker[AsyncSession] = create_session_factory(_engine)

_doc_repo = LocalFileSystemRepository(base_path="./docs")
_vector_repo = ChromaVectorRepository(persist_directory="./data/chroma")
_lexical_repo = BM25LexicalRepository()
_ollama_client = OllamaHttpClient(base_url="http://localhost:11434")
_bundle_repo = LocalBundleExporter(base_directory="./bundles")
_bundle_compiler = BundleCompiler()
_markdown_service = MarkdownParserService()
_prompt_builder = PromptBuilder()
_hybrid_searcher = HybridSearchService(vector_repo=_vector_repo, lexical_repo=_lexical_repo)


def get_engine() -> AsyncEngine:
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    return _session_factory


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with _session_factory() as session:
        yield session


def get_uow(session: AsyncSession = Depends(get_db_session)) -> IUnitOfWork:
    return SqlAlchemyUnitOfWork(session)


def get_settings_repo(session: AsyncSession = Depends(get_db_session)) -> ISettingsRepository:
    return SqlSettingsRepository(session)


def get_doc_repo() -> IDocumentRepository:
    return _doc_repo


def get_vector_repo() -> IVectorRepository:
    return _vector_repo


def get_lexical_repo() -> ILexicalIndexRepository:
    return _lexical_repo


def get_ollama_client() -> IOllamaClient:
    return _ollama_client


def get_bundle_repo() -> IBundleStorageRepository:
    return _bundle_repo


def get_markdown_parser() -> MarkdownParserService:
    return _markdown_service


def get_hybrid_searcher() -> HybridSearchService:
    return _hybrid_searcher


# Handlers DI
def get_documents_handler(doc_repo: IDocumentRepository = Depends(get_doc_repo)) -> GetDocumentsQueryHandler:
    return GetDocumentsQueryHandler(doc_repo)


def get_document_detail_handler(doc_repo: IDocumentRepository = Depends(get_doc_repo)) -> GetDocumentDetailQueryHandler:
    return GetDocumentDetailQueryHandler(doc_repo)


def get_ingest_docs_handler(
    doc_repo: IDocumentRepository = Depends(get_doc_repo),
    vector_repo: IVectorRepository = Depends(get_vector_repo),
    lexical_repo: ILexicalIndexRepository = Depends(get_lexical_repo),
) -> IngestDocsCommandHandler:
    return IngestDocsCommandHandler(doc_repo, vector_repo, lexical_repo)


def get_create_doc_handler(
    doc_repo: IDocumentRepository = Depends(get_doc_repo),
    vector_repo: IVectorRepository = Depends(get_vector_repo),
    lexical_repo: ILexicalIndexRepository = Depends(get_lexical_repo),
) -> CreateDocumentCommandHandler:
    return CreateDocumentCommandHandler(doc_repo, vector_repo, lexical_repo)


def get_search_hybrid_handler(
    searcher: HybridSearchService = Depends(get_hybrid_searcher),
) -> SearchHybridQueryHandler:
    return SearchHybridQueryHandler(searcher)


def get_ask_rag_handler(
    searcher: HybridSearchService = Depends(get_hybrid_searcher),
    ollama_client: IOllamaClient = Depends(get_ollama_client),
    settings_repo: ISettingsRepository = Depends(get_settings_repo),
) -> AskRagQueryHandler:
    return AskRagQueryHandler(searcher, _prompt_builder, ollama_client, settings_repo)


def get_bundle_handler(
    doc_repo: IDocumentRepository = Depends(get_doc_repo),
    bundle_repo: IBundleStorageRepository = Depends(get_bundle_repo),
) -> BuildContextBundleCommandHandler:
    return BuildContextBundleCommandHandler(doc_repo, bundle_repo, _bundle_compiler)


def get_settings_handler(
    settings_repo: ISettingsRepository = Depends(get_settings_repo),
) -> GetSettingsQueryHandler:
    return GetSettingsQueryHandler(settings_repo)


def get_update_settings_handler(
    settings_repo: ISettingsRepository = Depends(get_settings_repo),
) -> UpdateSettingsCommandHandler:
    return UpdateSettingsCommandHandler(settings_repo)


def get_ollama_models_handler(
    ollama_client: IOllamaClient = Depends(get_ollama_client),
) -> GetOllamaModelsQueryHandler:
    return GetOllamaModelsQueryHandler(ollama_client)


def get_ingest_docs_use_case(
    doc_repo: IDocumentRepository = Depends(get_doc_repo),
    vector_repo: IVectorRepository = Depends(get_vector_repo),
    lexical_repo: ILexicalIndexRepository = Depends(get_lexical_repo),
) -> IngestDocsUseCase:
    return IngestDocsUseCase(doc_repo, vector_repo, lexical_repo)


def get_scaffold_doc_use_case(
    doc_repo: IDocumentRepository = Depends(get_doc_repo),
    vector_repo: IVectorRepository = Depends(get_vector_repo),
    lexical_repo: ILexicalIndexRepository = Depends(get_lexical_repo),
    ollama_client: IOllamaClient = Depends(get_ollama_client),
    settings_repo: ISettingsRepository = Depends(get_settings_repo),
) -> ScaffoldDocUseCase:
    return ScaffoldDocUseCase(
        doc_repo=doc_repo,
        vector_repo=vector_repo,
        lexical_repo=lexical_repo,
        ollama_client=ollama_client,
        settings_repo=settings_repo,
    )


def get_project_repo(
    session: AsyncSession = Depends(get_db_session),
) -> IProjectRepository:
    return SqliteProjectRepository(session=session, docs_base_path="./docs")


def get_scoped_chat_service(
    vector_repo: IVectorRepository = Depends(get_vector_repo),
    ollama_client: IOllamaClient = Depends(get_ollama_client),
) -> ScopedChatService:
    return ScopedChatService(vector_store=vector_repo, ollama_client=ollama_client)


def get_library_repo(session: AsyncSession = Depends(get_db_session)) -> SqlLibraryRepository:
    return SqlLibraryRepository(session)


def get_book_repo(session: AsyncSession = Depends(get_db_session)) -> SqlBookRepository:
    return SqlBookRepository(session)


def get_attachment_repo(session: AsyncSession = Depends(get_db_session)) -> SqlAttachmentRepository:
    return SqlAttachmentRepository(session)


_in_memory_draft_repo = InMemoryDraftBookRepository()


def get_draft_repo() -> InMemoryDraftBookRepository:
    return _in_memory_draft_repo


def get_social_repo(session: AsyncSession = Depends(get_db_session)) -> SqlSocialRepository:
    return SqlSocialRepository(session)


def get_chat_session_repo(session: AsyncSession = Depends(get_db_session)) -> SqlChatSessionRepository:
    return SqlChatSessionRepository(session)



