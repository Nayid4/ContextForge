"""Public Facade for ContextForge reusable knowledge, RAG, and context-bundling component."""

from __future__ import annotations

from pathlib import Path
import time
from typing import Callable, Sequence, TypeVar

from contextforge._internal.decorators import AuditRecord, AuditingOperationDecorator, OperationExecutor
from contextforge._internal.events import ExtractiveFallbackLLMProvider, KnowledgeEventBus
from contextforge._internal.exporters import BundleExporterRegistry
from contextforge._internal.factories import RetrieverFactory, StrategyFactory
from contextforge._internal.pipelines import execute_bundle_pipeline, execute_rag_pipeline
from contextforge._internal.rules import (
    DocumentRuleChain, MaxDocumentSizeRule, NonEmptyContentRule, TitleRequiredRule,
)
from contextforge._internal.stores import InMemoryLexicalStore, InMemoryVectorStore, parse_markdown_file
from contextforge.contracts import (
    IBundleExporter, IChunkingStrategy, IDocumentRule, IHybridRankingStrategy,
    IKnowledgeObserver, ILexicalStore, ILLMProvider, IVectorStore,
)
from contextforge.exceptions import EmptyKnowledgeBaseError, TokenBudgetExceededError
from contextforge.models import (
    ContextBundle, ContextForgeConfig, IngestionReport, KnowledgeDocument, RagResponse, SearchHit,
)

TRes = TypeVar("TRes")


class ContextForge:
    """Primary public Facade for local knowledge ingestion, hybrid search, RAG Q&A, and Context Bundles.

    All collaborators (stores, LLM provider, chunkers, rankers, exporters, rules, observers)
    are replaceable via constructor injection, :class:`ContextForgeBuilder`, or ``register_*`` hooks.
    """

    def __init__(
        self,
        *,
        config: ContextForgeConfig | None = None,
        lexical_store: ILexicalStore | None = None,
        vector_store: IVectorStore | None = None,
        llm_provider: ILLMProvider | None = None,
        rules: Sequence[IDocumentRule] | None = None,
    ) -> None:
        self._config = config or ContextForgeConfig()
        self._lexical: ILexicalStore = lexical_store or InMemoryLexicalStore()
        self._vector: IVectorStore = vector_store or InMemoryVectorStore()
        self._llm: ILLMProvider = llm_provider or ExtractiveFallbackLLMProvider()
        self._strategies = StrategyFactory(
            max_chunk_chars=self._config.max_chunk_chars,
            chunk_overlap_chars=self._config.chunk_overlap_chars,
        )
        self._retriever = RetrieverFactory(self._lexical, self._vector, self._strategies)
        self._exporters = BundleExporterRegistry()
        self._events = KnowledgeEventBus()
        self._audit_records: list[AuditRecord] = []
        self._documents: dict[str, KnowledgeDocument] = {}

        default_rules: list[IDocumentRule] = (
            list(rules)
            if rules is not None
            else [TitleRequiredRule(), NonEmptyContentRule(), MaxDocumentSizeRule(self._config.max_document_chars)]
        )
        self._rule_chain = DocumentRuleChain(default_rules)

    def _run_audited(self, operation: str, fn: Callable[[], TRes]) -> TRes:
        executor: OperationExecutor[TRes] = OperationExecutor(operation, fn)
        decorated = AuditingOperationDecorator(executor, self._audit_records, enabled=self._config.enable_audit_trail)
        return decorated.execute()

    # ── Extension Registration Hooks (OCP) ────────────────────────────────────

    def register_chunking_strategy(self, strategy: IChunkingStrategy, *, alias: str | None = None) -> None:
        """Register a custom :class:`IChunkingStrategy` without modifying ContextForge."""
        self._strategies.register_chunker(strategy, alias=alias)

    def register_ranking_strategy(self, strategy: IHybridRankingStrategy, *, alias: str | None = None) -> None:
        """Register a custom :class:`IHybridRankingStrategy` without modifying ContextForge."""
        self._strategies.register_ranker(strategy, alias=alias)

    def register_exporter(self, exporter: IBundleExporter, *, alias: str | None = None) -> None:
        """Register a custom :class:`IBundleExporter` format without modifying ContextForge."""
        self._exporters.register(exporter, alias=alias)

    def register_rule(self, rule: IDocumentRule) -> None:
        """Append a custom :class:`IDocumentRule` to the ingestion Chain of Responsibility."""
        self._rule_chain.add_rule(rule)

    def subscribe(self, observer: IKnowledgeObserver) -> None:
        """Attach an :class:`IKnowledgeObserver` to receive lifecycle events."""
        self._events.subscribe(observer)

    def set_llm_provider(self, provider: ILLMProvider) -> None:
        """Swap the active :class:`ILLMProvider` at runtime."""
        self._llm = provider

    # ── Introspection Helpers ─────────────────────────────────────────────────

    @property
    def document_count(self) -> int:
        """Number of documents currently stored in this ContextForge instance."""
        return len(self._documents)

    @property
    def available_chunkers(self) -> tuple[str, ...]:
        """Registered chunking strategy identifiers."""
        return self._strategies.chunker_names

    @property
    def available_rankers(self) -> tuple[str, ...]:
        """Registered hybrid ranking strategy identifiers."""
        return self._strategies.ranker_names

    @property
    def available_export_formats(self) -> tuple[str, ...]:
        """Registered Context Bundle export format identifiers."""
        return self._exporters.available_formats

    @property
    def audit_trail(self) -> tuple[dict[str, object], ...]:
        """Read-only snapshot of recorded operation telemetry."""
        return tuple(
            {
                "operation": r.operation,
                "succeeded": r.succeeded,
                "latency_ms": r.latency_ms,
                "timestamp": r.timestamp,
                "error_code": r.error_code,
            }
            for r in self._audit_records
        )

    # ── Feature 1: Ingest & Index Knowledge ───────────────────────────────────

    def ingest(
        self,
        documents: Sequence[KnowledgeDocument],
        *,
        chunking_strategy: str | None = None,
    ) -> IngestionReport:
        """Validate, chunk, and index documents into lexical and vector stores."""

        def _op() -> IngestionReport:
            started = time.perf_counter()
            strategy_name = chunking_strategy or self._config.default_chunking_strategy
            chunker = self._strategies.get_chunker(strategy_name)
            total_chunks = 0
            doc_ids: list[str] = []

            for doc in documents:
                self._rule_chain.validate_all(doc)
                chunks = chunker.chunk(doc)
                self._lexical.index(chunks)
                self._vector.index(chunks)
                self._documents[doc.doc_id] = doc
                total_chunks += len(chunks)
                doc_ids.append(doc.doc_id)

            elapsed = round((time.perf_counter() - started) * 1000.0, 2)
            report = IngestionReport(
                documents_indexed=len(doc_ids),
                chunks_created=total_chunks,
                chunking_strategy=chunker.name,
                doc_ids=tuple(doc_ids),
                latency_ms=elapsed,
            )
            self._events.publish(
                "knowledge.ingested",
                {"documents_indexed": report.documents_indexed, "chunks_created": report.chunks_created},
            )
            return report

        return self._run_audited("ingest", _op)

    def ingest_directory(
        self,
        directory: str | Path,
        *,
        pattern: str = "*.md",
        chunking_strategy: str | None = None,
    ) -> IngestionReport:
        """Recursively parse Markdown files from ``directory`` and index them."""
        root = Path(directory).resolve()
        if not root.exists() or not root.is_dir():
            raise FileNotFoundError(f"Knowledge directory not found: {root}")
        docs = [parse_markdown_file(p, root) for p in sorted(root.rglob(pattern)) if p.is_file()]
        return self.ingest(docs, chunking_strategy=chunking_strategy)

    def _retrieve(
        self, query: str, *, top_k: int, mode: str | None = None, ranking: str | None = None, collection: str | None = None
    ) -> tuple[list[SearchHit], str, str]:
        use_mode = mode or self._config.default_retrieval_mode
        use_ranking = ranking or self._config.default_ranking_strategy
        hits = self._retriever.retrieve(
            query.strip(), top_k=top_k * 2 if collection else top_k, mode=use_mode, ranking_strategy=use_ranking
        )
        if collection:
            target = collection.strip().lower()
            hits = [h for h in hits if h.collection.lower() == target][:top_k]
        return hits, use_mode, use_ranking

    # ── Feature 2: Hybrid Knowledge Search ────────────────────────────────────

    def search(
        self,
        query: str,
        *,
        top_k: int = 5,
        mode: str | None = None,
        ranking: str | None = None,
        collection: str | None = None,
    ) -> list[SearchHit]:
        """Search indexed knowledge using lexical, vector, or hybrid retrieval."""
        if not query or not query.strip():
            raise ValueError("Search query cannot be empty.")
        if top_k < 1:
            raise ValueError("top_k must be >= 1.")

        def _op() -> list[SearchHit]:
            hits, use_mode, _ = self._retrieve(query, top_k=top_k, mode=mode, ranking=ranking, collection=collection)
            self._events.publish("knowledge.searched", {"query": query.strip(), "mode": use_mode, "hits": len(hits)})
            return hits

        return self._run_audited("search", _op)

    # ── Feature 3: Grounded RAG Q&A for AI Agents ─────────────────────────────

    def ask(
        self,
        question: str,
        *,
        top_k: int = 5,
        mode: str | None = None,
        ranking: str | None = None,
        system_prompt: str | None = None,
    ) -> RagResponse:
        """Answer a question grounded in retrieved knowledge with exact source citations."""
        if not question or not question.strip():
            raise ValueError("Question cannot be empty.")
        if not self._documents:
            raise EmptyKnowledgeBaseError()

        def _op() -> RagResponse:
            hits, use_mode, use_ranking = self._retrieve(question, top_k=top_k, mode=mode, ranking=ranking)
            response = execute_rag_pipeline(
                question=question.strip(),
                hits=hits,
                llm_provider=self._llm,
                retrieval_mode=use_mode,
                ranking_strategy=use_ranking,
                system_prompt=system_prompt,
            )
            self._events.publish(
                "knowledge.rag_answered",
                {"provider": self._llm.provider_name, "citations": len(response.citations)},
            )
            return response

        return self._run_audited("ask", _op)

    # ── Feature 4: Compile & Export Context Bundles ───────────────────────────

    def compile_bundle(
        self,
        name: str,
        *,
        query: str | None = None,
        document_ids: Sequence[str] | None = None,
        max_tokens: int = 4000,
        export_format: str | None = None,
    ) -> ContextBundle:
        """Compile a token-budgeted Context Bundle for AI agents in a pluggable format."""
        if not name or not name.strip():
            raise ValueError("Bundle name cannot be empty.")
        if max_tokens < 50:
            raise TokenBudgetExceededError(f"max_tokens must be >= 50 (received {max_tokens}).")
        if not self._documents:
            raise EmptyKnowledgeBaseError()

        def _op() -> ContextBundle:
            bundle = execute_bundle_pipeline(
                name=name.strip(),
                documents_by_id=self._documents,
                exporters=self._exporters,
                export_format=export_format or self._config.default_export_format,
                max_tokens=max_tokens,
                query=query,
                document_ids=document_ids,
                search_fn=lambda q, k: self._retrieve(q, top_k=k)[0],
            )
            self._events.publish(
                "knowledge.bundle_compiled",
                {"bundle_id": bundle.bundle_id, "format": bundle.export_format, "tokens": bundle.estimated_tokens},
            )
            return bundle

        return self._run_audited("compile_bundle", _op)
