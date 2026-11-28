"""Console example application consuming ContextForge exclusively via its public API.

Demonstrates:
1. Ingesting technical Markdown documents into a reusable knowledge base.
2. Performing hybrid search (lexical + vector) with RRF and a custom third-party ranking strategy.
3. Grounded RAG Q&A for an AI agent with exact source citations and a pluggable LLM provider.
4. Compiling token-budgeted Context Bundles in built-in Markdown and a custom third-party YAML format.
5. Extending ContextForge (new exporter, new ranker, new governance rule, new observer)
   WITHOUT modifying a single line of the ContextForge library.
"""

from __future__ import annotations

from typing import Sequence

from contextforge import (
    ContextForgeBuilder,
    ContextForgeConfig,
    DocumentValidationError,
    IBundleExporter,
    IDocumentRule,
    IHybridRankingStrategy,
    IKnowledgeObserver,
    ILLMProvider,
    KnowledgeDocument,
    KnowledgeEvent,
    SearchHit,
    __version__,
)


# ── Third-Party Extension 1: Custom YAML Bundle Exporter (OCP) ───────────────


class YamlBundleExporter(IBundleExporter):
    """Example third-party exporter adding YAML Context Bundle output."""

    @property
    def format_name(self) -> str:
        return "yaml"

    def export(
        self,
        name: str,
        documents: Sequence[KnowledgeDocument],
        estimated_tokens: int,
        max_tokens: int,
    ) -> str:
        lines = [
            f"bundle_name: \"{name}\"",
            f"estimated_tokens: {estimated_tokens}",
            f"max_tokens: {max_tokens}",
            "documents:",
        ]
        for doc in documents:
            preview = doc.content.strip().splitlines()[0] if doc.content.strip() else ""
            lines.append(f"  - id: \"{doc.doc_id}\"")
            lines.append(f"    title: \"{doc.title}\"")
            lines.append(f"    collection: \"{doc.collection}\"")
            lines.append(f"    summary: \"{preview[:80]}\"")
        return "\n".join(lines) + "\n"


# ── Third-Party Extension 2: Custom Collection-Boost Ranking Strategy (OCP) ──


class ArchitectureBoostRankingStrategy(IHybridRankingStrategy):
    """Prioritizes documents belonging to the 'engineering' collection by 1.25x."""

    @property
    def name(self) -> str:
        return "engineering_boost"

    def fuse(
        self,
        lexical_hits: Sequence[SearchHit],
        vector_hits: Sequence[SearchHit],
        top_k: int,
    ) -> list[SearchHit]:
        scores: dict[str, float] = {}
        hits_by_id: dict[str, SearchHit] = {}
        for hit in list(lexical_hits) + list(vector_hits):
            multiplier = 1.25 if hit.collection == "engineering" else 1.0
            scores[hit.chunk_id] = scores.get(hit.chunk_id, 0.0) + hit.score * multiplier
            hits_by_id.setdefault(hit.chunk_id, hit)

        ordered = sorted(scores.keys(), key=lambda cid: scores[cid], reverse=True)[:top_k]
        return [
            SearchHit(
                chunk_id=hits_by_id[cid].chunk_id,
                doc_id=hits_by_id[cid].doc_id,
                title=hits_by_id[cid].title,
                text=hits_by_id[cid].text,
                score=round(scores[cid], 4),
                source_type="hybrid",
                collection=hits_by_id[cid].collection,
                headers=hits_by_id[cid].headers,
            )
            for cid in ordered
        ]


# ── Third-Party Extension 3: Custom Ingestion Governance Rule ────────────────


class RequireTagRule(IDocumentRule):
    """Requires every ingested knowledge document to declare at least one tag."""

    @property
    def rule_name(self) -> str:
        return "require_tag"

    def validate(self, document: KnowledgeDocument) -> None:
        if not document.tags:
            raise DocumentValidationError(
                f"Document '{document.doc_id}' must declare at least one tag.",
                rule_name=self.rule_name,
            )


# ── Third-Party Extension 4: Pluggable LLM Provider & Telemetry Observer ─────


class DemoAgentLLMProvider(ILLMProvider):
    """Simulated AI agent LLM backend showing DIP replaceability."""

    @property
    def provider_name(self) -> str:
        return "demo-agent-llm"

    def generate(self, prompt: str, *, system_prompt: str | None = None) -> str:
        first_ctx = next((line for line in prompt.splitlines() if line.startswith("[1]")), "")
        return (
            "Segun la base de conocimiento del proyecto, la politica oficial establece: "
            f"{first_ctx}. [1]"
        )


class ConsoleEventObserver(IKnowledgeObserver):
    """Records emitted KnowledgeEvents for observability."""

    def __init__(self) -> None:
        self.events: list[KnowledgeEvent] = []

    def on_event(self, event: KnowledgeEvent) -> None:
        self.events.append(event)


def run_demo() -> None:
    """Execute end-to-end demonstration of ContextForge v1.0.0 public API."""
    observer = ConsoleEventObserver()

    engine = (
        ContextForgeBuilder()
        .with_config(ContextForgeConfig(default_ranking_strategy="rrf"))
        .with_llm_provider(DemoAgentLLMProvider())
        .with_exporter(YamlBundleExporter())
        .with_ranking_strategy(ArchitectureBoostRankingStrategy())
        .with_rule(RequireTagRule())
        .with_observer(observer)
        .build()
    )

    print(f"=== ContextForge v{__version__} - AI Agent Knowledge Component Demo ===")
    print(f"Chunkers : {engine.available_chunkers}")
    print(f"Rankers  : {engine.available_rankers}")
    print(f"Exporters: {engine.available_export_formats}\n")

    docs = [
        KnowledgeDocument(
            doc_id="engineering/retry_policy.md",
            title="Politica de Reintentos en Webhooks",
            collection="engineering",
            tags=("webhooks", "resilience"),
            content=(
                "# Politica de Reintentos\n\n"
                "Todo webhook saliente aplica backoff exponencial con jitter hasta 5 intentos "
                "(1s, 2s, 4s, 8s, 16s) antes de mover el evento a la Dead-Letter Queue (DLQ)."
            ),
        ),
        KnowledgeDocument(
            doc_id="engineering/clean_arch.md",
            title="Reglas de Clean Architecture",
            collection="engineering",
            tags=("architecture", "solid"),
            content=(
                "# Reglas de Dependencia\n\n"
                "La capa de dominio es 100% pura y no puede importar FastAPI ni SQLAlchemy. "
                "Toda infraestructura se inyecta mediante puertos (DIP)."
            ),
        ),
        KnowledgeDocument(
            doc_id="general/onboarding.md",
            title="Guia de Onboarding para Agentes IA",
            collection="general",
            tags=("agents", "onboarding"),
            content=(
                "# Onboarding\n\n"
                "Los agentes IA deben consultar ContextForge antes de proponer cambios "
                "y adjuntar citas verificables a cada recomendacion tecnica."
            ),
        ),
    ]

    # 1. Ingest knowledge
    report = engine.ingest(docs)
    print(f"[1] Ingesta completada: {report.documents_indexed} docs, {report.chunks_created} chunks.")

    # Demonstrate custom Chain of Responsibility rule rejection
    try:
        engine.ingest([KnowledgeDocument(doc_id="bad.md", title="Sin tags", content="Texto")])
    except DocumentValidationError as err:
        print(f"    Regla custom '{err.rule_name}' bloqueo documento invalido correctamente.")

    # 2. Hybrid search with custom third-party ranker
    hits = engine.search("backoff exponencial webhooks DLQ", top_k=2, ranking="engineering_boost")
    print(f"\n[2] Busqueda hibrida ('engineering_boost'): {len(hits)} resultados")
    for h in hits:
        print(f"    - {h.doc_id} | score={h.score} | source={h.source_type}")

    # 3. Grounded RAG Q&A for AI Agent chat
    rag = engine.ask("Cual es la politica de reintentos para webhooks?")
    print(f"\n[3] Respuesta RAG (provider={rag.provider_name}, grounded={rag.grounded}):")
    print(f"    {rag.answer}")
    print(f"    Citas: {[c.doc_id for c in rag.citations]}")

    # 4. Compile & Export Context Bundle using custom third-party YAML exporter
    bundle = engine.compile_bundle(
        "Agent Sprint Context",
        query="webhooks clean architecture",
        max_tokens=500,
        export_format="yaml",
    )
    print(f"\n[4] Context Bundle ({bundle.export_format}, {bundle.estimated_tokens}/{bundle.max_tokens} tokens):")
    print(bundle.content)

    print(f"[5] Eventos observados: {[e.event_type for e in observer.events]}")
    print(f"    Registros de auditoria: {len(engine.audit_trail)}")


if __name__ == "__main__":
    run_demo()
