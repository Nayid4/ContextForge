"""Unit tests for the reusable ContextForge v1.0.0 component using mocks, stubs, and fakes."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Sequence
from unittest.mock import MagicMock

import pytest

import contextforge
from contextforge import (
    ContextForge,
    ContextForgeBuilder,
    ContextForgeConfig,
    DocumentChunk,
    DocumentValidationError,
    EmptyKnowledgeBaseError,
    IBundleExporter,
    IChunkingStrategy,
    IDocumentRule,
    IHybridRankingStrategy,
    IKnowledgeObserver,
    ILexicalStore,
    ILLMProvider,
    IVectorStore,
    KnowledgeDocument,
    KnowledgeEvent,
    ProviderUnavailableError,
    SearchHit,
    TokenBudgetExceededError,
    UnknownExportFormatError,
    UnknownStrategyError,
)


# ── Test Doubles (Fakes, Stubs, Spies) proving DIP replaceability ─────────────


class _StubLLMProvider(ILLMProvider):
    def __init__(self, reply: str = "Respuesta verificada [1]") -> None:
        self._reply = reply
        self.received_prompts: list[str] = []
        self.received_systems: list[str | None] = []

    @property
    def provider_name(self) -> str:
        return "stub-llm"

    def generate(self, prompt: str, *, system_prompt: str | None = None) -> str:
        self.received_prompts.append(prompt)
        self.received_systems.append(system_prompt)
        return self._reply


class _FailingLLMProvider(ILLMProvider):
    @property
    def provider_name(self) -> str:
        return "failing-llm"

    def generate(self, prompt: str, *, system_prompt: str | None = None) -> str:
        raise RuntimeError("upstream timeout")


class _FakeLexicalStore(ILexicalStore):
    def __init__(self) -> None:
        self.indexed: list[DocumentChunk] = []

    def index(self, chunks: Sequence[DocumentChunk]) -> None:
        self.indexed.extend(chunks)

    def search(self, query: str, top_k: int) -> list[SearchHit]:
        return [
            SearchHit(
                chunk_id=c.chunk_id,
                doc_id=c.doc_id,
                title=c.title,
                text=c.text,
                score=0.95,
                source_type="lexical",
                collection=c.collection,
                headers=c.headers,
            )
            for c in self.indexed[:top_k]
        ]

    def clear(self) -> None:
        self.indexed.clear()


class _FakeVectorStore(IVectorStore):
    def __init__(self) -> None:
        self.indexed: list[DocumentChunk] = []

    def index(self, chunks: Sequence[DocumentChunk]) -> None:
        self.indexed.extend(chunks)

    def search(self, query: str, top_k: int) -> list[SearchHit]:
        return [
            SearchHit(
                chunk_id=c.chunk_id,
                doc_id=c.doc_id,
                title=c.title,
                text=c.text,
                score=0.88,
                source_type="vector",
                collection=c.collection,
                headers=c.headers,
            )
            for c in reversed(self.indexed)
        ][:top_k]

    def clear(self) -> None:
        self.indexed.clear()


class _SpyObserver(IKnowledgeObserver):
    def __init__(self) -> None:
        self.events: list[KnowledgeEvent] = []

    def on_event(self, event: KnowledgeEvent) -> None:
        self.events.append(event)


# ── Custom Third-Party Extensions (OCP without modifying library code) ────────


class _SingleParagraphChunker(IChunkingStrategy):
    @property
    def name(self) -> str:
        return "single_paragraph"

    def chunk(self, document: KnowledgeDocument) -> list[DocumentChunk]:
        return [
            DocumentChunk(
                chunk_id=f"{document.doc_id}#p0",
                doc_id=document.doc_id,
                title=document.title,
                text=document.content.strip(),
                collection=document.collection,
            )
        ]


class _CsvBundleExporter(IBundleExporter):
    @property
    def format_name(self) -> str:
        return "csv"

    def export(
        self,
        name: str,
        documents: Sequence[KnowledgeDocument],
        estimated_tokens: int,
        max_tokens: int,
    ) -> str:
        rows = ["doc_id,title,collection"]
        for d in documents:
            rows.append(f"{d.doc_id},{d.title},{d.collection}")
        return "\n".join(rows) + "\n"


class _FixedBoostRanker(IHybridRankingStrategy):
    @property
    def name(self) -> str:
        return "fixed_boost"

    def fuse(
        self,
        lexical_hits: Sequence[SearchHit],
        vector_hits: Sequence[SearchHit],
        top_k: int,
    ) -> list[SearchHit]:
        return list(lexical_hits[:top_k]) or list(vector_hits[:top_k])


class _NoDraftRule(IDocumentRule):
    @property
    def rule_name(self) -> str:
        return "no_draft_tag"

    def validate(self, document: KnowledgeDocument) -> None:
        if "draft" in document.tags:
            raise DocumentValidationError("Draft documents are blocked.", rule_name=self.rule_name)


def _sample_docs() -> list[KnowledgeDocument]:
    return [
        KnowledgeDocument(
            doc_id="arch/webhooks.md",
            title="Webhooks Retry Policy",
            collection="engineering",
            tags=("webhooks", "retries"),
            content="# Retry Policy\n\nExponential backoff with 5 retries and dead-letter queue.",
        ),
        KnowledgeDocument(
            doc_id="product/onboarding.md",
            title="AI Agent Onboarding",
            collection="product",
            tags=("agents", "guide"),
            content="# Agent Setup\n\nConnect agents via hybrid RAG search and context bundles.",
        ),
    ]


def test_public_api_boundary_hides_internals() -> None:
    assert contextforge.__version__ == "1.0.0"
    assert all(not name.startswith("_internal") for name in contextforge.__all__)
    assert "ContextForge" in contextforge.__all__
    assert "ContextForgeBuilder" in contextforge.__all__


def test_ingest_search_modes_and_ranking_strategies() -> None:
    engine = ContextForge()
    report = engine.ingest(_sample_docs())
    assert report.documents_indexed == 2
    assert report.chunks_created >= 2
    assert engine.document_count == 2

    lex_hits = engine.search("exponential backoff webhooks", top_k=2, mode="lexical")
    vec_hits = engine.search("exponential backoff webhooks", top_k=2, mode="vector")
    rrf_hits = engine.search("exponential backoff webhooks", top_k=2, mode="hybrid", ranking="rrf")
    weighted_hits = engine.search("exponential backoff webhooks", top_k=2, mode="hybrid", ranking="weighted")
    filtered = engine.search("agent", top_k=5, collection="product")

    assert lex_hits and lex_hits[0].doc_id == "arch/webhooks.md"
    assert vec_hits and vec_hits[0].doc_id == "arch/webhooks.md"
    assert rrf_hits and rrf_hits[0].doc_id == "arch/webhooks.md"
    assert weighted_hits and weighted_hits[0].doc_id == "arch/webhooks.md"
    assert all(h.collection == "product" for h in filtered)


def test_ingest_directory_and_sliding_window_chunker(tmp_path: Path) -> None:
    md = tmp_path / "guide.md"
    md.write_text(
        "---\ntitle: Local Architecture\ncollection: engineering\ntags: [rag, clean]\n---\n\n"
        + ("ContextForge enables reusable local RAG for AI agents. " * 25),
        encoding="utf-8",
    )
    engine = ContextForge(config=ContextForgeConfig(max_chunk_chars=250, chunk_overlap_chars=40))
    report = engine.ingest_directory(tmp_path, chunking_strategy="sliding_window")
    assert report.documents_indexed == 1
    assert report.chunks_created >= 2
    assert report.chunking_strategy == "sliding_window"


def test_ask_with_stub_llm_fallback_and_failure_double() -> None:
    stub = _StubLLMProvider(reply="Backoff exponencial hasta 5 reintentos [1].")
    engine = ContextForge(llm_provider=stub)
    with pytest.raises(EmptyKnowledgeBaseError):
        engine.ask("retry policy")

    engine.ingest(_sample_docs())
    resp = engine.ask("What is the webhook retry policy?", top_k=2)
    assert resp.grounded is True
    assert resp.provider_name == "stub-llm"
    assert resp.citations and resp.citations[0].doc_id == "arch/webhooks.md"
    assert len(stub.received_prompts) == 1

    # Default extractive fallback works without external LLM
    fallback_engine = ContextForge()
    fallback_engine.ingest(_sample_docs())
    fb_resp = fallback_engine.ask("webhook retry")
    assert fb_resp.provider_name == "extractive-local"
    assert "Grounded synthesis" in fb_resp.answer

    # Failing provider raises ProviderUnavailableError and logs audit failure
    engine.set_llm_provider(_FailingLLMProvider())
    with pytest.raises(ProviderUnavailableError):
        engine.ask("trigger failure")
    assert any(not rec["succeeded"] for rec in engine.audit_trail)


def test_compile_bundle_formats_and_token_budget() -> None:
    engine = ContextForge()
    engine.ingest(
        [
            KnowledgeDocument(doc_id="small.md", title="Small", content="Short rule for agents."),
            KnowledgeDocument(doc_id="huge.md", title="Huge", content="token " * 300),
        ]
    )
    md_bundle = engine.compile_bundle("Agent Pack", document_ids=["small.md", "huge.md"], max_tokens=80)
    assert md_bundle.export_format == "markdown"
    assert md_bundle.included_doc_ids == ("small.md",)
    assert md_bundle.omitted_doc_ids == ("huge.md",)

    json_bundle = engine.compile_bundle("Json Pack", query="Short rule", max_tokens=500, export_format="json")
    parsed = json.loads(json_bundle.content)
    assert parsed["bundle_name"] == "Json Pack"

    xml_bundle = engine.compile_bundle("Xml Pack", max_tokens=500, export_format="xml")
    assert "<context_bundle" in xml_bundle.content

    with pytest.raises(TokenBudgetExceededError):
        engine.compile_bundle("Invalid Budget", max_tokens=10)
    with pytest.raises(UnknownExportFormatError):
        engine.compile_bundle("Unknown Format", export_format="pdf")


def test_builder_with_test_doubles_and_third_party_extensions() -> None:
    fake_lex = _FakeLexicalStore()
    fake_vec = _FakeVectorStore()
    spy = _SpyObserver()

    engine = (
        ContextForgeBuilder()
        .with_stores(lexical_store=fake_lex, vector_store=fake_vec)
        .with_llm_provider(_StubLLMProvider("Custom extension answer [1]"))
        .with_chunking_strategy(_SingleParagraphChunker())
        .with_ranking_strategy(_FixedBoostRanker())
        .with_exporter(_CsvBundleExporter())
        .with_rule(_NoDraftRule())
        .with_observer(spy)
        .build()
    )

    assert "single_paragraph" in engine.available_chunkers
    assert "fixed_boost" in engine.available_rankers
    assert "csv" in engine.available_export_formats

    engine.ingest(_sample_docs(), chunking_strategy="single_paragraph")
    assert len(fake_lex.indexed) == 2
    assert len(fake_vec.indexed) == 2

    hits = engine.search("anything", top_k=1, ranking="fixed_boost")
    assert len(hits) == 1

    bundle = engine.compile_bundle("CSV Pack", export_format="csv", max_tokens=500)
    assert "doc_id,title,collection" in bundle.content

    with pytest.raises(DocumentValidationError) as exc_info:
        engine.ingest([KnowledgeDocument(doc_id="d.md", title="Draft", content="x", tags=("draft",))])
    assert exc_info.value.rule_name == "no_draft_tag"

    event_types = [e.event_type for e in spy.events]
    assert "knowledge.ingested" in event_types
    assert "knowledge.searched" in event_types
    assert "knowledge.bundle_compiled" in event_types


def test_validation_and_unknown_strategy_errors() -> None:
    engine = ContextForge(config=ContextForgeConfig(max_document_chars=120))
    with pytest.raises(DocumentValidationError):
        engine.ingest([KnowledgeDocument(doc_id="", title="No ID", content="body")])
    with pytest.raises(DocumentValidationError):
        engine.ingest([KnowledgeDocument(doc_id="a.md", title="", content="body")])
    with pytest.raises(DocumentValidationError):
        engine.ingest([KnowledgeDocument(doc_id="a.md", title="Empty", content="   ")])
    with pytest.raises(DocumentValidationError):
        engine.ingest([KnowledgeDocument(doc_id="big.md", title="Big", content="x" * 200)])
    with pytest.raises(UnknownStrategyError):
        engine.ingest(_sample_docs(), chunking_strategy="missing_chunker")
    with pytest.raises(ValueError):
        engine.search("   ")
    with pytest.raises(UnknownStrategyError):
        engine.search("test", mode="invalid_mode")


def test_mock_llm_provider_and_exact_one_to_one_audit_events() -> None:
    mock_llm = MagicMock(spec=ILLMProvider)
    mock_llm.provider_name = "mock-llm"
    mock_llm.generate.return_value = "Respuesta generada por MagicMock [1]"
    spy = _SpyObserver()

    engine = ContextForgeBuilder().with_llm_provider(mock_llm).with_observer(spy).build()
    engine.ingest(_sample_docs())
    engine.search("webhooks", top_k=1)
    rag = engine.ask("How do webhooks retry?", top_k=1)
    engine.compile_bundle("Audit Pack", query="webhooks", max_tokens=500)

    assert rag.answer == "Respuesta generada por MagicMock [1]"
    mock_llm.generate.assert_called_once()
    assert [e.event_type for e in spy.events] == [
        "knowledge.ingested",
        "knowledge.searched",
        "knowledge.rag_answered",
        "knowledge.bundle_compiled",
    ]
    assert [rec["operation"] for rec in engine.audit_trail] == [
        "ingest",
        "search",
        "ask",
        "compile_bundle",
    ]
