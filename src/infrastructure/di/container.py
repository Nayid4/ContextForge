"""Composition Root assembling Options, Persistence, Security, Resilience, Integrations, and CQRS Mediator."""

from __future__ import annotations

from application.common import AuditEventStoreBehavior, LoggingAndTimingBehavior, Mediator
from domain.documents import AttachmentEntity, DocumentAggregate
from domain.rag import ChunkVO
from infrastructure.config import AppSettings, SettingsFactory
from infrastructure.integrations import (
    AIStrategyFactory,
    ExtractiveFallbackAdapter,
    FileStorageFactory,
    SovereignVectorStoreAdapter,
    SqliteFts5LexicalIndex,
    chunk_document_heading_aware,
    extract_attachment_text,
)
from infrastructure.persistence.database import create_async_db_engine, create_session_maker
from infrastructure.persistence.event_store import SqlAppendOnlyEventStore
from infrastructure.persistence.migrations import run_migrations
from infrastructure.persistence.repositories import (
    SqlAgentRepository,
    SqlApiKeyRepository,
    SqlBundleRepository,
    SqlChatRepository,
    SqlCollaborationRepository,
    SqlDocumentRepository,
    SqlFeedbackAndGapRepository,
    SqlIndexingJobRepository,
    SqlLlmConfigRepository,
    SqlProjectRepository,
    SqlSettingsRepository,
    SqlUserRepository,
    SqlWebhookRepository,
)
from infrastructure.integrations.webhooks.webhook_dispatcher import WebhookDispatcher
from infrastructure.telemetry.prometheus_metrics_registry import PrometheusMetricsRegistry
from infrastructure.persistence.seed_data import seed_initial_data
from infrastructure.persistence.sequence_generator import AtomicSequenceGenerator
from infrastructure.persistence.uow_factory import UnitOfWorkFactory
from infrastructure.realtime import WebSocketConnectionManager
from infrastructure.security import JwtTokenService, PasswordHasher, SecretVaultAesGcm, SlidingWindowRateLimiter


class DependencyContainer:
    def __init__(self, settings: AppSettings | None = None) -> None:
        self.settings = settings or SettingsFactory.load()
        self.engine = create_async_db_engine(self.settings.db)
        self.session_maker = create_session_maker(self.engine)
        self.uow_factory = UnitOfWorkFactory(self.settings.db.db_provider, self.session_maker)
        self.sequences = AtomicSequenceGenerator(self.session_maker)

        # Security & Resilience singletons
        self.vault = SecretVaultAesGcm(self.settings.env.master_vault_key)
        self.jwt_service = JwtTokenService(
            secret_key=self.settings.env.jwt_secret_key,
            algorithm=self.settings.env.jwt_algorithm,
            access_minutes=self.settings.env.access_token_expire_minutes,
            refresh_days=self.settings.env.refresh_token_expire_days,
        )
        self.password_hasher = PasswordHasher
        self.rate_limiter = SlidingWindowRateLimiter()

        # Realtime & Storage
        self.ws_manager = WebSocketConnectionManager()
        self.file_storage = FileStorageFactory.create(self.settings.storage)
        self.text_extractor = extract_attachment_text
        self.chunker = chunk_document_heading_aware

        # Persistence Repositories (strict ISP: 1 repository per responsibility)
        self.event_store = SqlAppendOnlyEventStore(self.session_maker)
        self.project_repo = SqlProjectRepository(self.session_maker)
        self.agent_repo = SqlAgentRepository(self.session_maker)
        self.doc_repo = SqlDocumentRepository(self.session_maker, default_docs_root=self.settings.db.docs_root_path)
        self.indexing_job_repo = SqlIndexingJobRepository(self.session_maker)
        self.chat_repo = SqlChatRepository(self.session_maker)
        self.bundle_repo = SqlBundleRepository(self.session_maker)
        self.collab_repo = SqlCollaborationRepository(self.session_maker)
        self.user_repo = SqlUserRepository(self.session_maker)
        self.api_key_repo = SqlApiKeyRepository(self.session_maker)
        self.llm_config_repo = SqlLlmConfigRepository(self.session_maker)
        self.settings_repo = SqlSettingsRepository(self.session_maker)
        self.feedback_repo = SqlFeedbackAndGapRepository(self.session_maker)
        self.webhook_repo = SqlWebhookRepository(self.session_maker)
        self.webhook_dispatcher = WebhookDispatcher()
        self.metrics = PrometheusMetricsRegistry()

        # Hybrid Retrieval (Persistent SQLite FTS5 + Dense/4-Gram Vector Store) & Fallback LLM
        self.lexical_index = SqliteFts5LexicalIndex(persist_dir=self.settings.db.chroma_persist_dir)
        self.vector_store = SovereignVectorStoreAdapter(persist_dir=self.settings.db.chroma_persist_dir)
        self.fallback_llm = ExtractiveFallbackAdapter()

        # CQRS Mediator
        self.mediator = Mediator(
            behaviors=[
                LoggingAndTimingBehavior(),
                AuditEventStoreBehavior(self.event_store),
            ]
        )
        from infrastructure.di.register_handlers import register_all_cqrs_handlers
        register_all_cqrs_handlers(self)

    async def get_primary_llm(self):
        cfg = await self.llm_config_repo.get_active()
        return AIStrategyFactory.create(cfg, self.vault, timeout_sec=self.settings.ai.timeout_seconds)

    async def index_document_callback(self, doc: DocumentAggregate) -> None:
        from application.rag.commands.IndexDocumentIncremental import IndexDocumentIncrementalCommand
        await self.mediator.send(IndexDocumentIncrementalCommand(document=doc))
        try:
            hooks = await self.webhook_repo.list_webhooks(doc.project_slug, active_only=True)
            if hooks:
                ev = "document.published" if doc.status.value == "published" else "document.indexed"
                res = await self.webhook_dispatcher.dispatch_event(
                    hooks,
                    ev,
                    {"project_slug": doc.project_slug, "doc_id": doc.id, "path": doc.path, "version": doc.current_version, "status": doc.status.value},
                    secret_decryptor=self.vault.decrypt,
                )
                self.metrics.observe_webhooks(len(res))
        except Exception:
            pass

    async def index_attachment_callback(self, attachment: AttachmentEntity, doc: DocumentAggregate | None) -> int:
        """Chunks and indexes attachment.extracted_text into both FTS5 and Vector stores so RAG cites binary annexes."""
        text_body = (attachment.extracted_text or "").strip()
        if not text_body:
            return 0
        doc_path = doc.path if doc else attachment.book_id
        mod_name = doc.module_name if doc else "general"
        status_val = doc.status.value if doc else "published"
        att_doc_id = f"att:{attachment.id}"
        att_path = f"{doc_path}#{attachment.file_name}"
        chunks: list[ChunkVO] = []
        step = 1400
        for idx, start in enumerate(range(0, len(text_body), step)):
            part = text_body[start : start + step].strip()
            if not part:
                continue
            chunks.append(
                ChunkVO(
                    chunk_id=f"{att_doc_id}:c{idx}",
                    doc_id=att_doc_id,
                    project_slug=attachment.project_slug,
                    path=att_path,
                    title=f"Adjunto: {attachment.file_name}",
                    module_name=mod_name,
                    status=status_val,
                    headers=("Adjunto", attachment.file_name),
                    text=part,
                )
            )
        if not chunks:
            return 0
        await self.lexical_index.upsert_document_chunks(att_doc_id, attachment.project_slug, chunks)
        await self.vector_store.upsert_document_chunks(att_doc_id, attachment.project_slug, chunks)
        return len(chunks)

    async def initialize_runtime(self) -> None:
        await run_migrations(self.engine)
        if self.settings.env.auto_seed_data:
            await seed_initial_data(self.session_maker, docs_root=self.settings.db.docs_root_path)

    async def shutdown(self) -> None:
        await self.engine.dispose()


_GLOBAL_CONTAINER: DependencyContainer | None = None


def get_container() -> DependencyContainer:
    global _GLOBAL_CONTAINER
    if _GLOBAL_CONTAINER is None:
        _GLOBAL_CONTAINER = DependencyContainer()
    return _GLOBAL_CONTAINER


def reset_container(container: DependencyContainer | None = None) -> DependencyContainer:
    global _GLOBAL_CONTAINER
    _GLOBAL_CONTAINER = container or DependencyContainer(SettingsFactory.load(force_reload=True))
    return _GLOBAL_CONTAINER
