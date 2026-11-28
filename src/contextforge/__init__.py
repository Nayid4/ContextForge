"""ContextForge - Reusable Local Knowledge Base, Hybrid RAG & Context Bundler Component.

Public API boundary (v1.0.0). External applications should import ONLY from
``contextforge`` and extend behavior via the contracts in :mod:`contextforge.contracts`.
Internal implementations live under ``contextforge._internal`` and are intentionally hidden.
"""

from __future__ import annotations

from contextforge.builder import ContextForgeBuilder
from contextforge.client import ContextForge
from contextforge.contracts import (
    IBundleExporter,
    IChunkingStrategy,
    IDocumentRule,
    IHybridRankingStrategy,
    IKnowledgeObserver,
    ILexicalStore,
    ILLMProvider,
    IVectorStore,
)
from contextforge.exceptions import (
    ContextForgeError,
    DocumentValidationError,
    EmptyKnowledgeBaseError,
    ProviderUnavailableError,
    TokenBudgetExceededError,
    UnknownExportFormatError,
    UnknownStrategyError,
)
from contextforge.models import (
    ContextBundle,
    ContextForgeConfig,
    DocumentChunk,
    IngestionReport,
    KnowledgeDocument,
    KnowledgeEvent,
    RagResponse,
    SearchHit,
    SourceCitation,
)

__version__ = "1.0.0"

__all__ = [
    "__version__",
    "ContextForge",
    "ContextForgeBuilder",
    "ContextForgeConfig",
    "KnowledgeDocument",
    "DocumentChunk",
    "SearchHit",
    "SourceCitation",
    "RagResponse",
    "ContextBundle",
    "IngestionReport",
    "KnowledgeEvent",
    "IChunkingStrategy",
    "IHybridRankingStrategy",
    "IBundleExporter",
    "ILLMProvider",
    "IDocumentRule",
    "ILexicalStore",
    "IVectorStore",
    "IKnowledgeObserver",
    "ContextForgeError",
    "DocumentValidationError",
    "UnknownStrategyError",
    "UnknownExportFormatError",
    "TokenBudgetExceededError",
    "ProviderUnavailableError",
    "EmptyKnowledgeBaseError",
]
