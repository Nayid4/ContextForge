"""Infrastructure Integrations (pure re-exports)."""

from __future__ import annotations

from infrastructure.integrations.exporters.agent_rules_exporter import AgentRulesExporter
from infrastructure.integrations.exporters.markdown_block_serializer import MarkdownBlockSerializer
from infrastructure.integrations.exporters.markdown_renderer import RichMarkdownRenderer
from infrastructure.integrations.exporters.postman_collection_builder import PostmanCollectionBuilder
from infrastructure.integrations.extractors.attachment_text_extractor import extract_attachment_text
from infrastructure.integrations.llm.ai_strategy_factory import AIStrategyFactory
from infrastructure.integrations.llm.cli_engine_discovery import CliEngineDiscoveryService
from infrastructure.integrations.llm.cli_llm_adapter import CliLlmAdapter
from infrastructure.integrations.llm.extractive_fallback_adapter import ExtractiveFallbackAdapter
from infrastructure.integrations.llm.http_multi_llm_adapter import HttpMultiLlmAdapter
from infrastructure.integrations.llm.provider_model_discovery import ProviderModelDiscoveryService
from infrastructure.integrations.rag.bm25_lexical_index import SovereignBm25LexicalIndex
from infrastructure.integrations.rag.heading_aware_chunker import chunk_document_heading_aware
from infrastructure.integrations.rag.http_dense_embedding_provider import HttpDenseEmbeddingProvider
from infrastructure.integrations.rag.sqlite_fts5_lexical_index import SqliteFts5LexicalIndex
from infrastructure.integrations.rag.vector_store_adapter import SovereignVectorStoreAdapter
from infrastructure.integrations.storage.file_storage_factory import FileStorageFactory
from infrastructure.integrations.storage.local_file_storage import LocalFileStorageService
from infrastructure.integrations.storage.storage_connection_tester import StorageConnectionTester

__all__ = [
    "AIStrategyFactory",
    "AgentRulesExporter",
    "CliEngineDiscoveryService",
    "CliLlmAdapter",
    "ExtractiveFallbackAdapter",
    "FileStorageFactory",
    "HttpDenseEmbeddingProvider",
    "HttpMultiLlmAdapter",
    "LocalFileStorageService",
    "MarkdownBlockSerializer",
    "PostmanCollectionBuilder",
    "ProviderModelDiscoveryService",
    "RichMarkdownRenderer",
    "SovereignBm25LexicalIndex",
    "SovereignVectorStoreAdapter",
    "SqliteFts5LexicalIndex",
    "StorageConnectionTester",
    "chunk_document_heading_aware",
    "extract_attachment_text",
]
