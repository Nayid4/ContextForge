"""Registers all CQRS Commands, Queries, and Validators into the Mediator (0 classes)."""

from __future__ import annotations

from typing import TYPE_CHECKING

from application.bundles.commands.CompileContextBundle import (
    CompileContextBundleCommand,
    CompileContextBundleCommandHandler,
    CompileContextBundleCommandValidation,
)
from application.bundles.commands.ExportAgentRules import (
    ExportAgentRulesCommand,
    ExportAgentRulesCommandHandler,
    ExportAgentRulesCommandValidation,
)
from application.bundles.queries.GetContextBundleById import (
    GetContextBundleByIdQuery,
    GetContextBundleByIdQueryHandler,
    GetContextBundleByIdQueryValidation,
)
from application.bundles.queries.ListContextBundles import (
    ListContextBundlesQuery,
    ListContextBundlesQueryHandler,
    ListContextBundlesQueryValidation,
)
from application.bundles.queries.McpQueryContext import (
    McpQueryContextQuery,
    McpQueryContextQueryHandler,
    McpQueryContextQueryValidation,
)
from application.collaboration.commands.PostDocumentComment import (
    PostDocumentCommentCommand,
    PostDocumentCommentCommandHandler,
    PostDocumentCommentCommandValidation,
)
from application.collaboration.commands.RateDocument import (
    RateDocumentCommand,
    RateDocumentCommandHandler,
    RateDocumentCommandValidation,
)
from application.collaboration.commands.ResolveCommentThread import (
    ResolveCommentThreadCommand,
    ResolveCommentThreadCommandHandler,
    ResolveCommentThreadCommandValidation,
)
from application.collaboration.queries.ListAuditLogs import (
    ListAuditLogsQuery,
    ListAuditLogsQueryHandler,
    ListAuditLogsQueryValidation,
)
from application.collaboration.queries.ListDocumentThreads import (
    ListDocumentThreadsQuery,
    ListDocumentThreadsQueryHandler,
    ListDocumentThreadsQueryValidation,
)
from application.documents.commands.CreateDocument import (
    CreateDocumentCommand,
    CreateDocumentCommandHandler,
    CreateDocumentCommandValidation,
)
from application.documents.commands.DeleteDocument import (
    DeleteDocumentCommand,
    DeleteDocumentCommandHandler,
    DeleteDocumentCommandValidation,
)
from application.documents.commands.RollbackDocumentVersion import (
    RollbackDocumentVersionCommand,
    RollbackDocumentVersionCommandHandler,
    RollbackDocumentVersionCommandValidation,
)
from application.documents.commands.TransitionDocumentState import (
    TransitionDocumentStateCommand,
    TransitionDocumentStateCommandHandler,
    TransitionDocumentStateCommandValidation,
)
from application.documents.commands.UpdateDocument import (
    UpdateDocumentCommand,
    UpdateDocumentCommandHandler,
    UpdateDocumentCommandValidation,
)
from application.documents.commands.UploadAttachment import (
    UploadAttachmentCommand,
    UploadAttachmentCommandHandler,
    UploadAttachmentCommandValidation,
)
from application.documents.queries.CompareDocumentVersions import (
    CompareDocumentVersionsQuery,
    CompareDocumentVersionsQueryHandler,
    CompareDocumentVersionsQueryValidation,
)
from application.documents.queries.GetDocumentDetail import (
    GetDocumentDetailQuery,
    GetDocumentDetailQueryHandler,
    GetDocumentDetailQueryValidation,
)
from application.documents.queries.GetDocumentVersions import (
    GetDocumentVersionsQuery,
    GetDocumentVersionsQueryHandler,
    GetDocumentVersionsQueryValidation,
)
from application.documents.queries.ListDocumentsPaginated import (
    ListDocumentsPaginatedQuery,
    ListDocumentsPaginatedQueryHandler,
    ListDocumentsPaginatedQueryValidation,
)
from application.projects.commands.CreateProject import (
    CreateProjectCommand,
    CreateProjectCommandHandler,
    CreateProjectCommandValidation,
)
from application.projects.commands.SaveTaxonomyItem import (
    SaveTaxonomyItemCommand,
    SaveTaxonomyItemCommandHandler,
    SaveTaxonomyItemCommandValidation,
)
from application.projects.commands.SwitchActiveProject import (
    SwitchActiveProjectCommand,
    SwitchActiveProjectCommandHandler,
    SwitchActiveProjectCommandValidation,
)
from application.projects.commands.SyncFilesystemDocs import (
    SyncFilesystemDocsCommand,
    SyncFilesystemDocsCommandHandler,
    SyncFilesystemDocsCommandValidation,
)
from application.projects.queries.ListProjects import (
    ListProjectsQuery,
    ListProjectsQueryHandler,
    ListProjectsQueryValidation,
)
from application.projects.queries.ListTaxonomyItems import (
    ListTaxonomyItemsQuery,
    ListTaxonomyItemsQueryHandler,
    ListTaxonomyItemsQueryValidation,
)
from application.rag.commands.AskRagAssistant import (
    AskRagAssistantCommand,
    AskRagAssistantCommandHandler,
    AskRagAssistantCommandValidation,
)
from application.rag.commands.IndexDocumentIncremental import (
    IndexDocumentIncrementalCommand,
    IndexDocumentIncrementalCommandHandler,
    IndexDocumentIncrementalCommandValidation,
)
from application.rag.commands.RetryDeadLetterJobs import (
    RetryDeadLetterJobsCommand,
    RetryDeadLetterJobsCommandHandler,
    RetryDeadLetterJobsCommandValidation,
)
from application.rag.queries.AskScopedDocument import (
    AskScopedDocumentQuery,
    AskScopedDocumentQueryHandler,
    AskScopedDocumentQueryValidation,
)
from application.rag.queries.GetChatSessionHistory import (
    GetChatSessionHistoryQuery,
    GetChatSessionHistoryQueryHandler,
    GetChatSessionHistoryQueryValidation,
)
from application.rag.queries.HybridSearchDocuments import (
    HybridSearchDocumentsQuery,
    HybridSearchDocumentsQueryHandler,
    HybridSearchDocumentsQueryValidation,
)
from application.rag.queries.ListIndexingJobs import (
    ListIndexingJobsQuery,
    ListIndexingJobsQueryHandler,
    ListIndexingJobsQueryValidation,
)
from application.users.commands.AuthenticateUser import (
    AuthenticateUserCommand,
    AuthenticateUserCommandHandler,
    AuthenticateUserCommandValidation,
)
from application.users.commands.IssueApiKey import (
    IssueApiKeyCommand,
    IssueApiKeyCommandHandler,
    IssueApiKeyCommandValidation,
)
from application.users.commands.RevokeApiKey import (
    RevokeApiKeyCommand,
    RevokeApiKeyCommandHandler,
    RevokeApiKeyCommandValidation,
)
from application.users.commands.SaveLlmProviderConfig import (
    SaveLlmProviderConfigCommand,
    SaveLlmProviderConfigCommandHandler,
    SaveLlmProviderConfigCommandValidation,
)
from application.users.commands.UpdateSystemSettings import (
    UpdateSystemSettingsCommand,
    UpdateSystemSettingsCommandHandler,
    UpdateSystemSettingsCommandValidation,
)
from application.users.queries.DiscoverCliEngines import (
    DiscoverCliEnginesQuery,
    DiscoverCliEnginesQueryHandler,
    DiscoverCliEnginesQueryValidation,
)
from application.users.queries.GetSystemHealthKpis import (
    GetSystemHealthKpisQuery,
    GetSystemHealthKpisQueryHandler,
    GetSystemHealthKpisQueryValidation,
)
from application.users.queries.ListApiKeys import (
    ListApiKeysQuery,
    ListApiKeysQueryHandler,
    ListApiKeysQueryValidation,
)
from application.users.queries.ListLlmProviders import (
    ListLlmProvidersQuery,
    ListLlmProvidersQueryHandler,
    ListLlmProvidersQueryValidation,
)
from infrastructure.di.dynamic_primary_llm_proxy import DynamicPrimaryLlmProxy
from infrastructure.integrations import AgentRulesExporter, CliEngineDiscoveryService

if TYPE_CHECKING:
    from infrastructure.di.container import DependencyContainer


def register_all_cqrs_handlers(c: DependencyContainer) -> None:
    m = c.mediator
    dyn_llm = DynamicPrimaryLlmProxy(c)

    # Projects
    m.register(CreateProjectCommand, lambda: CreateProjectCommandHandler(c.project_repo), CreateProjectCommandValidation())
    m.register(SwitchActiveProjectCommand, lambda: SwitchActiveProjectCommandHandler(c.project_repo), SwitchActiveProjectCommandValidation())
    m.register(SaveTaxonomyItemCommand, lambda: SaveTaxonomyItemCommandHandler(c.project_repo), SaveTaxonomyItemCommandValidation())
    m.register(SyncFilesystemDocsCommand, lambda: SyncFilesystemDocsCommandHandler(c.project_repo, c.doc_repo, c.index_document_callback), SyncFilesystemDocsCommandValidation())
    m.register(ListProjectsQuery, lambda: ListProjectsQueryHandler(c.project_repo), ListProjectsQueryValidation())
    m.register(ListTaxonomyItemsQuery, lambda: ListTaxonomyItemsQueryHandler(c.project_repo), ListTaxonomyItemsQueryValidation())

    # Documents
    m.register(CreateDocumentCommand, lambda: CreateDocumentCommandHandler(c.doc_repo, c.index_document_callback, c.ws_manager), CreateDocumentCommandValidation())
    m.register(UpdateDocumentCommand, lambda: UpdateDocumentCommandHandler(c.doc_repo, c.index_document_callback, c.ws_manager), UpdateDocumentCommandValidation())
    m.register(TransitionDocumentStateCommand, lambda: TransitionDocumentStateCommandHandler(c.doc_repo, c.lexical_index, c.vector_store, c.index_document_callback), TransitionDocumentStateCommandValidation())
    m.register(RollbackDocumentVersionCommand, lambda: RollbackDocumentVersionCommandHandler(c.doc_repo, c.index_document_callback), RollbackDocumentVersionCommandValidation())
    m.register(UploadAttachmentCommand, lambda: UploadAttachmentCommandHandler(c.doc_repo, c.file_storage, c.text_extractor, c.index_attachment_callback), UploadAttachmentCommandValidation())
    m.register(DeleteDocumentCommand, lambda: DeleteDocumentCommandHandler(c.doc_repo, c.lexical_index, c.vector_store), DeleteDocumentCommandValidation())
    m.register(ListDocumentsPaginatedQuery, lambda: ListDocumentsPaginatedQueryHandler(c.doc_repo), ListDocumentsPaginatedQueryValidation())
    m.register(GetDocumentDetailQuery, lambda: GetDocumentDetailQueryHandler(c.doc_repo), GetDocumentDetailQueryValidation())
    m.register(GetDocumentVersionsQuery, lambda: GetDocumentVersionsQueryHandler(c.doc_repo), GetDocumentVersionsQueryValidation())
    m.register(CompareDocumentVersionsQuery, lambda: CompareDocumentVersionsQueryHandler(c.doc_repo), CompareDocumentVersionsQueryValidation())

    # RAG & Hybrid Search
    m.register(IndexDocumentIncrementalCommand, lambda: IndexDocumentIncrementalCommandHandler(c.lexical_index, c.vector_store, c.indexing_job_repo, c.chunker), IndexDocumentIncrementalCommandValidation())
    m.register(HybridSearchDocumentsQuery, lambda: HybridSearchDocumentsQueryHandler(c.lexical_index, c.vector_store), HybridSearchDocumentsQueryValidation())
    m.register(AskRagAssistantCommand, lambda: AskRagAssistantCommandHandler(c.lexical_index, c.vector_store, dyn_llm, c.fallback_llm, c.project_repo, c.settings_repo, c.chat_repo), AskRagAssistantCommandValidation())
    m.register(AskScopedDocumentQuery, lambda: AskScopedDocumentQueryHandler(dyn_llm, c.fallback_llm), AskScopedDocumentQueryValidation())
    m.register(RetryDeadLetterJobsCommand, lambda: RetryDeadLetterJobsCommandHandler(c.indexing_job_repo, c.doc_repo, c.index_document_callback), RetryDeadLetterJobsCommandValidation())
    m.register(GetChatSessionHistoryQuery, lambda: GetChatSessionHistoryQueryHandler(c.chat_repo), GetChatSessionHistoryQueryValidation())
    m.register(ListIndexingJobsQuery, lambda: ListIndexingJobsQueryHandler(c.indexing_job_repo), ListIndexingJobsQueryValidation())

    # Bundles & MCP
    m.register(CompileContextBundleCommand, lambda: CompileContextBundleCommandHandler(c.doc_repo, c.bundle_repo, c.file_storage), CompileContextBundleCommandValidation())
    m.register(ExportAgentRulesCommand, lambda: ExportAgentRulesCommandHandler(c.doc_repo, AgentRulesExporter.export), ExportAgentRulesCommandValidation())
    m.register(ListContextBundlesQuery, lambda: ListContextBundlesQueryHandler(c.bundle_repo), ListContextBundlesQueryValidation())
    m.register(GetContextBundleByIdQuery, lambda: GetContextBundleByIdQueryHandler(c.bundle_repo), GetContextBundleByIdQueryValidation())
    m.register(McpQueryContextQuery, lambda: McpQueryContextQueryHandler(c.doc_repo, c.lexical_index, c.vector_store), McpQueryContextQueryValidation())

    # Collaboration & Audit
    m.register(PostDocumentCommentCommand, lambda: PostDocumentCommentCommandHandler(c.collab_repo, c.ws_manager), PostDocumentCommentCommandValidation())
    m.register(ResolveCommentThreadCommand, lambda: ResolveCommentThreadCommandHandler(c.collab_repo), ResolveCommentThreadCommandValidation())
    m.register(RateDocumentCommand, lambda: RateDocumentCommandHandler(c.collab_repo), RateDocumentCommandValidation())
    m.register(ListDocumentThreadsQuery, lambda: ListDocumentThreadsQueryHandler(c.collab_repo), ListDocumentThreadsQueryValidation())
    m.register(ListAuditLogsQuery, lambda: ListAuditLogsQueryHandler(c.event_store), ListAuditLogsQueryValidation())

    # Users, RBAC, Multi-LLM & System Health (strict ISP repositories!)
    m.register(AuthenticateUserCommand, lambda: AuthenticateUserCommandHandler(c.user_repo, c.password_hasher.verify_password, c.jwt_service.issue_token_pair), AuthenticateUserCommandValidation())
    m.register(IssueApiKeyCommand, lambda: IssueApiKeyCommandHandler(c.api_key_repo), IssueApiKeyCommandValidation())
    m.register(RevokeApiKeyCommand, lambda: RevokeApiKeyCommandHandler(c.api_key_repo), RevokeApiKeyCommandValidation())
    m.register(SaveLlmProviderConfigCommand, lambda: SaveLlmProviderConfigCommandHandler(c.llm_config_repo, c.vault), SaveLlmProviderConfigCommandValidation())
    m.register(UpdateSystemSettingsCommand, lambda: UpdateSystemSettingsCommandHandler(c.settings_repo), UpdateSystemSettingsCommandValidation())
    m.register(GetSystemHealthKpisQuery, lambda: GetSystemHealthKpisQueryHandler(c.project_repo, c.doc_repo, c.bundle_repo, c.indexing_job_repo, c.event_store, dyn_llm), GetSystemHealthKpisQueryValidation())
    m.register(ListLlmProvidersQuery, lambda: ListLlmProvidersQueryHandler(c.llm_config_repo, c.vault), ListLlmProvidersQueryValidation())
    m.register(ListApiKeysQuery, lambda: ListApiKeysQueryHandler(c.api_key_repo), ListApiKeysQueryValidation())
    m.register(DiscoverCliEnginesQuery, lambda: DiscoverCliEnginesQueryHandler(CliEngineDiscoveryService.discover), DiscoverCliEnginesQueryValidation())
