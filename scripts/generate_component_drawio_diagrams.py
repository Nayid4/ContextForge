"""Generates 6 native editable Draw.io (.drawio) XML diagrams and high-DPI (.png) exports
for the ContextForge v1.0.0 Reusable Component (Use Cases, C4 N1-N3, UML Classes with GoF, UML Sequence).
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

from PIL import ImageDraw

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import generate_drawio_diagrams as base  # noqa: E402
from generate_drawio_diagrams import (  # noqa: E402
    AMBER,
    AMBER_LIGHT,
    DrawioBuilder,
    INDIGO,
    INDIGO_LIGHT,
    NAVY,
    NAVY_LIGHT,
    PURPLE,
    PURPLE_LIGHT,
    SLATE,
    SLATE_LIGHT,
    TEAL,
    TEAL_LIGHT,
    TEXT_DARK,
    WHITE,
    _load_font,
)

ROOT = SCRIPT_DIR.parents[0]
COMP_OUT_DIR = ROOT / "docs" / "diagramas" / "componente"
base.OUT_DIR = COMP_OUT_DIR


# ============================================================================
# 1. USE CASE DIAGRAM — PUBLIC API (RF-01 .. RF-05)
# ============================================================================
def build_01_use_cases() -> tuple[Path, Path]:
    b = DrawioBuilder("comp_uc", "Casos de Uso API Publica - ContextForge v1.0.0", 1420, 760)
    b.add_banner(
        "Diagrama de Casos de Uso — API Pública de ContextForge (v1.0.0)",
        "4 funcionalidades esenciales + extensión abierta sin modificar el componente (OCP)",
    )

    # Actors
    a_app = b.add_actor(75, 220, 90, 110, "Aplicación Cliente", "Chat IA / CLI / Backend", stroke=NAVY)
    a_dev = b.add_actor(75, 495, 90, 110, "Equipo Integrador", "Implementa contratos OCP", stroke=TEAL)
    a_llm = b.add_actor(1235, 345, 100, 110, "ILLMProvider", "Ollama / Cloud / Fallback", stroke=AMBER)

    # System boundary
    b.add_container(
        260, 115, 895, 600,
        "Paquete Python: contextforge v1.0.0  (Frontera Pública __all__)",
        fill="#F8FAFC", stroke=NAVY, header_fill="#DBEAFE", header_text=NAVY, dashed=False,
    )

    # Use cases
    uc1 = b.add_box(335, 175, 340, 76, "<b>RF-01: Ingestar e Indexar</b><br><i>ingest() / ingest_directory()</i>", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse", font_size=12)
    uc2 = b.add_box(335, 290, 340, 76, "<b>RF-02: Búsqueda Híbrida</b><br><i>search(mode, ranking, collection)</i>", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse", font_size=12)
    uc3 = b.add_box(335, 405, 340, 76, "<b>RF-03: Consulta RAG con Citas</b><br><i>ask(question, top_k)</i>", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse", font_size=12)
    uc4 = b.add_box(335, 520, 340, 76, "<b>RF-04: Compilar Context Bundle</b><br><i>compile_bundle(max_tokens, format)</i>", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse", font_size=12)

    uc5 = b.add_box(770, 560, 340, 82, "<b>RF-05: Registrar Extensiones OCP</b><br><i>register_*() / ContextForgeBuilder</i>", fill=TEAL_LIGHT, stroke=TEAL, shape="ellipse", font_size=12)

    # Included internal use cases
    inc_val = b.add_box(780, 175, 320, 72, "<b>Validar Reglas Documentales</b><br><i>DocumentRuleChain (IDocumentRule)</i>", fill=AMBER_LIGHT, stroke=AMBER, shape="ellipse", font_size=11)
    inc_ret = b.add_box(780, 350, 320, 72, "<b>Recuperar y Fusionar (RRF)</b><br><i>RetrieverFactory + IHybridRanking</i>", fill=INDIGO_LIGHT, stroke=INDIGO, shape="ellipse", font_size=11)

    # Actor -> Use Cases
    b.add_edge(a_app, uc1, "", points=[(215, 275), (215, 213)], stroke=NAVY, arrow="none")
    b.add_edge(a_app, uc2, "", points=[(215, 275), (215, 328)], stroke=NAVY, arrow="none")
    b.add_edge(a_app, uc3, "", points=[(215, 275), (215, 443)], stroke=NAVY, arrow="none")
    b.add_edge(a_app, uc4, "", points=[(215, 275), (215, 558)], stroke=NAVY, arrow="none")

    b.add_edge(a_dev, uc5, "sin editar núcleo", points=[(165, 650), (940, 650)], label_pos_idx=1, stroke=TEAL, arrow="none")
    b.add_edge(uc3, a_llm, "genera respuesta", points=[(725, 443), (725, 485), (1200, 485), (1200, 400)], label_pos_idx=2, stroke=AMBER, arrow="open")

    # <<include>>
    b.add_edge(uc1, inc_val, "<<include>>", dashed=True, stroke=AMBER, arrow="open")
    b.add_edge(uc2, inc_ret, "<<include>>", points=[(725, 328), (725, 386)], dashed=True, stroke=INDIGO, arrow="open")
    b.add_edge(uc3, inc_ret, "<<include>>", points=[(725, 443), (725, 386)], dashed=True, stroke=INDIGO, arrow="open")

    return b.save_all("01_casos_de_uso_api")


# ============================================================================
# 2. C4 LEVEL 1 — SYSTEM CONTEXT DIAGRAM
# ============================================================================
def build_02_c4_context() -> tuple[Path, Path]:
    b = DrawioBuilder("c4_comp_n1", "C4 Nivel 1 Contexto - ContextForge v1.0.0", 1420, 740)
    b.add_banner(
        "Modelo C4 — Nivel 1: Contexto del Componente ContextForge (v1.0.0)",
        "Relación entre aplicaciones consumidoras, equipos integradores y sistemas externos opcionales",
    )

    app = b.add_box(
        70, 185, 320, 145,
        "<b>Aplicación Consumidora</b><br>[Software Externo]<br>Chat con agentes IA, CLI,<br>pipeline CI/CD o API FastAPI.",
        fill=NAVY_LIGHT, stroke=NAVY, font_size=12,
    )
    dev = b.add_box(
        70, 445, 320, 145,
        "<b>Equipo Integrador (Tercero)</b><br>[Persona / Desarrollador]<br>Extiende contratos OCP sin<br>modificar código del componente.",
        fill=TEAL_LIGHT, stroke=TEAL, font_size=12,
    )

    cf = b.add_box(
        525, 250, 370, 255,
        "<b>ContextForge (v1.0.0)</b><br>[Componente Python Reutilizable]<br><br>• Ingesta y chunking Markdown<br>• Búsqueda híbrida (BM25 + Vector)<br>• RAG con citas verificables<br>• Compilador de Context Bundles<br><i>0 dependencias externas obligatorias</i>",
        fill=NAVY, stroke="#0F172A", font_color=WHITE, font_size=12,
    )

    fs = b.add_box(
        1040, 185, 310, 145,
        "<b>Archivos Markdown</b><br>[Sistema Externo · Opcional]<br>Repositorio Docs-as-Code<br>(ADRs, reglas, manuales .md).",
        fill=SLATE_LIGHT, stroke=SLATE, font_size=12,
    )
    llm = b.add_box(
        1040, 445, 310, 145,
        "<b>Proveedor LLM Externo</b><br>[Sistema Externo · Opcional]<br>Ollama, Gemini, OpenAI, Claude<br>o Stub / Fallback extractivo local.",
        fill=AMBER_LIGHT, stroke=AMBER, font_size=12,
    )

    b.add_edge(app, cf, "Consume API Pública\n(from contextforge import ...)", points=[(455, 257), (455, 330)], stroke=NAVY)
    b.add_edge(dev, cf, "Implementa contratos\n(IBundleExporter, IDocumentRule, ...)", points=[(455, 517), (455, 430)], dashed=True, stroke=TEAL)
    b.add_edge(cf, fs, "Lee documentos\n(ingest_directory)", points=[(965, 330), (965, 257)], stroke=SLATE)
    b.add_edge(cf, llm, "Delega síntesis\n(vía ILLMProvider)", points=[(965, 430), (965, 517)], stroke=AMBER)

    return b.save_all("02_c4_contexto_n1")


# ============================================================================
# 3. C4 LEVEL 2 — CONTAINER DIAGRAM
# ============================================================================
def build_03_c4_containers() -> tuple[Path, Path]:
    b = DrawioBuilder("c4_comp_n2", "C4 Nivel 2 Contenedores - ContextForge v1.0.0", 1460, 740)
    b.add_banner(
        "Modelo C4 — Nivel 2: Contenedores del Paquete contextforge (v1.0.0)",
        "Frontera estricta entre API Pública exportada (__all__) e Implementación Interna Privada (_internal/)",
    )

    cli = b.add_box(
        60, 185, 310, 145,
        "<b>App de Ejemplo / Cliente</b><br>[Python >= 3.11]<br>examples/agent_knowledge_cli.py<br>Usa exclusivamente la API pública.",
        fill=NAVY_LIGHT, stroke=NAVY, font_size=12,
    )
    web = b.add_box(
        60, 445, 310, 145,
        "<b>Plataforma Web Opcional</b><br>[Extra .[web] · FastAPI + MCP]<br>src/presentation/web/ y /api/v1<br>Host self-hosted con UI y Docker.",
        fill=SLATE_LIGHT, stroke=SLATE, dashed=True, font_size=12,
    )

    b.add_container(
        470, 125, 930, 560,
        "Paquete Distribuible Python: contextforge v1.0.0  (pyproject.toml · dependencies = [])",
        fill="#F8FAFC", stroke=NAVY, header_fill="#DBEAFE", header_text=NAVY, dashed=False,
    )

    pub = b.add_box(
        525, 200, 360, 415,
        "<b>API Pública (Frontera __all__)</b><br>[src/contextforge/]<br><br>• <b>client.py</b>: Facade ContextForge<br>• <b>builder.py</b>: ContextForgeBuilder<br>• <b>contracts.py</b>: 8 interfaces ABC<br>• <b>models.py</b>: DTOs inmutables<br>• <b>exceptions.py</b>: Errores tipados<br><br><i>Contrato estable v1.x (mypy --strict)</i>",
        fill=NAVY_LIGHT, stroke=NAVY, font_size=12,
    )

    internal = b.add_box(
        985, 200, 360, 415,
        "<b>Núcleo Privado Encapsulado</b><br>[src/contextforge/_internal/]<br><br>• <b>stores.py</b>: BM25 + Vector coseno<br>• <b>strategies.py</b>: Chunking y RRF/Weighted<br>• <b>factories.py</b>: Strategy & Retriever<br>• <b>exporters.py</b>: MD, JSON, XML + Registry<br>• <b>rules.py</b>: DocumentRuleChain<br>• <b>decorators.py</b>: Auditoría y latencia<br>• <b>events.py</b>: KnowledgeEventBus<br>• <b>pipelines.py</b>: RAG + Context Bundler",
        fill=TEAL_LIGHT, stroke=TEAL, font_size=11,
    )

    b.add_edge(cli, pub, "Importa solo __all__", points=[(420, 257), (420, 340)], stroke=NAVY)
    b.add_edge(web, pub, "Consume y adapta", points=[(420, 517), (420, 465)], dashed=True, stroke=SLATE)
    b.add_edge(pub, internal, "Orquesta vía\ncontratos ABC", stroke=TEAL)

    return b.save_all("03_c4_contenedores_n2")


# ============================================================================
# 4. C4 LEVEL 3 — COMPONENT DIAGRAM
# ============================================================================
def build_04_c4_components() -> tuple[Path, Path]:
    b = DrawioBuilder("c4_comp_n3", "C4 Nivel 3 Componentes Internos - ContextForge v1.0.0", 1620, 920)
    b.add_banner(
        "Modelo C4 — Nivel 3: Componentes Internos de ContextForge (v1.0.0)",
        "Colaboración entre Facade, Builder, Decorator, Fábricas, Cadena de Reglas, EventBus y Estrategias OCP",
    )

    # Top: Entry & Assembly
    builder = b.add_box(
        70, 130, 310, 120,
        "<b>ContextForgeBuilder</b><br>[GoF: Builder]<br>Ensambla config, stores,<br>extensiones y proveedores.",
        fill=INDIGO_LIGHT, stroke=INDIGO, font_size=12,
    )
    facade = b.add_box(
        590, 120, 420, 140,
        "<b>ContextForge</b><br>[GoF: Facade · API Pública]<br>ingest() · search() · ask() · compile_bundle()<br>register_*() · subscribe() · set_llm_provider()",
        fill=NAVY, stroke="#0F172A", font_color=WHITE, font_size=12,
    )
    audit = b.add_box(
        1190, 130, 360, 120,
        "<b>AuditingOperationDecorator</b><br>[GoF: Decorator]<br>Envuelve operaciones registrando<br>latency_ms, éxito y trazabilidad.",
        fill=PURPLE_LIGHT, stroke=PURPLE, font_size=12,
    )

    # Middle row: Internal orchestrators
    b.add_container(
        50, 315, 1520, 225,
        "Orquestadores y Fábricas Internas (src/contextforge/_internal/)",
        fill="#F8FAFC", stroke=SLATE, header_fill="#E2E8F0", header_text=TEXT_DARK, dashed=True,
    )

    rules = b.add_box(80, 375, 265, 135, "<b>DocumentRuleChain</b><br>[GoF: Chain of Resp.]<br>Ejecuta IDocumentRule[]<br>antes de indexar.", fill=AMBER_LIGHT, stroke=AMBER, font_size=11)
    sfac = b.add_box(380, 375, 265, 135, "<b>StrategyFactory</b><br>[GoF: Factory]<br>Resuelve IChunkingStrategy<br>e IHybridRankingStrategy.", fill=INDIGO_LIGHT, stroke=INDIGO, font_size=11)
    rfac = b.add_box(680, 375, 265, 135, "<b>RetrieverFactory</b><br>[GoF: Factory]<br>Ejecuta lexical, vector<br>o hybrid (RRF/Weighted).", fill=INDIGO_LIGHT, stroke=INDIGO, font_size=11)
    ereg = b.add_box(980, 375, 265, 135, "<b>BundleExporterRegistry</b><br>[GoF: Factory / Registry]<br>Resuelve exportadores<br>Markdown, JSON, XML, etc.", fill=INDIGO_LIGHT, stroke=INDIGO, font_size=11)
    bus = b.add_box(1280, 375, 265, 135, "<b>KnowledgeEventBus</b><br>[GoF: Observer]<br>Notifica eventos del ciclo<br>de vida a observadores.", fill=PURPLE_LIGHT, stroke=PURPLE, font_size=11)

    # Bottom row: Pluggable contracts (OCP / DIP)
    b.add_container(
        50, 600, 1520, 275,
        "Puntos de Extensión Abiertos — Contratos Públicos (src/contextforge/contracts.py · OCP / DIP)",
        fill="#F0FDFA", stroke=TEAL, header_fill="#CCFBF1", header_text=TEAL, dashed=False,
    )

    p_rule = b.add_box(80, 665, 265, 175, "<b>IDocumentRule</b><br>[<<interface>>]<br>• NonEmptyContentRule<br>• MaxLengthRule<br>• ValidMetadataRule<br><i>+ Reglas de terceros</i>", fill=WHITE, stroke=AMBER, font_size=11)
    p_strat = b.add_box(380, 665, 265, 175, "<b>IChunking & IHybridRanking</b><br>[<<interface>> · Strategy]<br>• HeadingAware / SlidingWindow<br>• RRF / WeightedLinear<br><i>+ Algoritmos de terceros</i>", fill=WHITE, stroke=TEAL, font_size=11)
    p_store = b.add_box(680, 665, 265, 175, "<b>ILexicalStore & IVectorStore</b><br>[<<interface>> · DIP]<br>• InMemoryLexicalStore (BM25)<br>• InMemoryVectorStore (Cosine)<br><i>+ Fakes / ChromaDB / FTS5</i>", fill=WHITE, stroke=NAVY, font_size=11)
    p_exp = b.add_box(980, 665, 265, 175, "<b>IBundleExporter</b><br>[<<interface>> · Strategy]<br>• MarkdownBundleExporter<br>• JsonBundleExporter<br>• XmlBundleExporter<br><i>+ YAML / Custom</i>", fill=WHITE, stroke=TEAL, font_size=11)
    p_llm = b.add_box(1280, 665, 265, 175, "<b>ILLMProvider & IObserver</b><br>[<<interface>> · DIP]<br>• ExtractiveFallbackLLMProvider<br>• Observadores de auditoría<br><i>+ Ollama / OpenAI / Stubs</i>", fill=WHITE, stroke=PURPLE, font_size=11)

    # Top edges
    b.add_edge(builder, facade, "ensambla", stroke=INDIGO)
    b.add_edge(facade, audit, "envuelve ops", stroke=PURPLE)

    # Facade -> middle row via clean bus y=290
    b.add_edge(facade, rules, "", points=[(800, 290), (212, 290)], stroke=AMBER)
    b.add_edge(facade, sfac, "", points=[(800, 290), (512, 290)], stroke=INDIGO)
    b.add_edge(facade, rfac, "delega", points=[(800, 290), (812, 290)], stroke=INDIGO)
    b.add_edge(facade, ereg, "", points=[(800, 290), (1112, 290)], stroke=INDIGO)
    b.add_edge(facade, bus, "", points=[(800, 290), (1412, 290)], stroke=PURPLE)

    # Middle -> Bottom contracts
    b.add_edge(rules, p_rule, "valida", dashed=True, arrow="open", stroke=AMBER)
    b.add_edge(sfac, p_strat, "instancia", dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(rfac, p_store, "consulta", dashed=True, arrow="open", stroke=NAVY)
    b.add_edge(ereg, p_exp, "exporta", dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(bus, p_llm, "notifica / LLM", dashed=True, arrow="open", stroke=PURPLE)

    return b.save_all("04_c4_componentes_n3")


# ============================================================================
# 5. UML CLASS DIAGRAM — EXPLICIT GoF PATTERNS (3 CATEGORIES)
# ============================================================================
def build_05_uml_classes_gof() -> tuple[Path, Path]:
    b = DrawioBuilder("uml_cls_gof", "Diagrama de Clases UML con Patrones GoF - ContextForge v1.0.0", 1920, 1280)
    b.add_banner(
        "Diagrama de Clases UML — Componente ContextForge (v1.0.0) con Patrones GoF Explícitos",
        "Evidencia visual de las 3 categorías GoF: Creacionales (Builder, Factory/Registry), Estructurales (Facade, Decorator) y Comportamiento (Strategy, Chain of Responsibility, Observer)",
    )

    # ---- GROUP 1: CREATIONAL GoF (Top-Left) ----
    b.add_container(
        40, 110, 560, 495,
        "PATRONES CREACIONALES (GoF: Builder + Factory / Registry)",
        fill="#EEF2FF", stroke=INDIGO, header_fill="#C7D2FE", header_text=INDIGO, dashed=False,
    )
    c_builder = b.add_uml_class(
        65, 160, 510, 195,
        "GoF: Builder", "ContextForgeBuilder",
        ["- _config: ContextForgeConfig", "- _lexical_store: ILexicalStore | None", "- _llm_provider: ILLMProvider | None"],
        [
            "+ with_config(cfg): ContextForgeBuilder",
            "+ with_stores(lex, vec): ContextForgeBuilder",
            "+ with_llm_provider(llm): ContextForgeBuilder",
            "+ with_exporter(exp) / with_rule(r)",
            "+ build(): ContextForge",
        ],
        header_fill=INDIGO, body_fill=WHITE,
    )
    c_sfac = b.add_uml_class(
        65, 385, 245, 195,
        "GoF: Factory", "StrategyFactory",
        ["- _chunkers: dict[str, IChunking]", "- _rankers: dict[str, IRanking]"],
        [
            "+ register_chunker(s)",
            "+ register_ranker(s)",
            "+ get_chunker(name)",
            "+ get_ranker(name)",
        ],
        header_fill=INDIGO, body_fill=WHITE,
    )
    c_rfac = b.add_uml_class(
        330, 385, 245, 195,
        "GoF: Factory / Registry", "RetrieverFactory & ExporterRegistry",
        ["- _lexical: ILexicalStore", "- _vector: IVectorStore", "- _exporters: dict[str, IExporter]"],
        [
            "+ retrieve(q, top_k, mode, rank)",
            "+ register(exporter)",
            "+ get(format_name): IBundleExporter",
        ],
        header_fill=INDIGO, body_fill=WHITE,
    )

    # ---- GROUP 2: STRUCTURAL GoF (Top-Center & Top-Right) ----
    b.add_container(
        645, 110, 1235, 495,
        "PATRONES ESTRUCTURALES (GoF: Facade + Decorator) y Contratos DIP",
        fill="#EFF6FF", stroke=NAVY, header_fill="#BFDBFE", header_text=NAVY, dashed=False,
    )
    c_facade = b.add_uml_class(
        675, 160, 480, 275,
        "GoF: Facade · API Pública", "ContextForge",
        [
            "- _config: ContextForgeConfig",
            "- _decorator: AuditingOperationDecorator",
            "- _rule_chain: DocumentRuleChain",
            "- _event_bus: KnowledgeEventBus",
            "- _llm_provider: ILLMProvider",
        ],
        [
            "+ ingest(docs, chunking_strategy): IngestionReport",
            "+ ingest_directory(dir, pattern): IngestionReport",
            "+ search(query, top_k, mode, ranking): list[SearchHit]",
            "+ ask(question, top_k, mode, ranking): RagResponse",
            "+ compile_bundle(name, max_tokens, fmt): ContextBundle",
            "+ register_chunking_strategy(s) / register_ranking_strategy(s)",
            "+ register_exporter(e) / register_rule(r) / subscribe(obs)",
        ],
        header_fill=NAVY, body_fill=WHITE,
    )
    c_dec = b.add_uml_class(
        1215, 160, 325, 185,
        "GoF: Decorator", "AuditingOperationDecorator",
        ["- _audit_trail: list[AuditRecord]"],
        [
            "+ execute(op, fn, *args): TResult",
            "+ records(): list[AuditRecord]",
            "• Mide latency_ms y éxitos/fallos",
        ],
        header_fill=PURPLE, body_fill=PURPLE_LIGHT,
    )
    c_dip = b.add_uml_class(
        1565, 160, 290, 185,
        "interface · DIP", "ILLMProvider & Stores",
        ["+ provider_name: str"],
        [
            "+ generate(prompt, sys): str",
            "+ ILexicalStore.search(q, k)",
            "+ IVectorStore.search(q, k)",
        ],
        header_fill=SLATE, body_fill=WHITE,
    )
    c_dip_impl = b.add_uml_class(
        1215, 415, 640, 160,
        "Implementaciones por Defecto (0 deps · Biblioteca Estándar Python)", "Default Adapters",
        ["• InMemoryLexicalStore  (BM25 puro)  ..|> ILexicalStore", "• InMemoryVectorStore   (Coseno n-gramas)  ..|> IVectorStore"],
        ["• ExtractiveFallbackLLMProvider  (Síntesis local sin red)  ..|> ILLMProvider"],
        header_fill=SLATE, body_fill=SLATE_LIGHT,
    )

    # ---- GROUP 3: BEHAVIORAL GoF (Bottom Full Width) ----
    b.add_container(
        40, 665, 1840, 575,
        "PATRONES DE COMPORTAMIENTO (GoF: Strategy + Chain of Responsibility + Observer) — Puntos de Extensión OCP",
        fill="#F0FDFA", stroke=TEAL, header_fill="#99F6E4", header_text=TEAL, dashed=False,
    )

    # Strategy 1: Chunking
    i_chunk = b.add_uml_class(
        65, 720, 330, 155,
        "interface · GoF: Strategy", "IChunkingStrategy",
        ["+ name: str  {abstract}"],
        ["+ chunk(doc): list[DocumentChunk]"],
        header_fill=TEAL, body_fill=WHITE,
    )
    impl_chunk = b.add_uml_class(
        65, 955, 330, 130,
        "ConcreteStrategy", "Chunkers Incorporados",
        ["• HeadingAwareChunkingStrategy", "• SlidingWindowChunkingStrategy"],
        ["+ chunk(doc): list[DocumentChunk]"],
        header_fill=TEAL, body_fill=TEAL_LIGHT,
    )

    # Strategy 2: Hybrid Ranking
    i_rank = b.add_uml_class(
        430, 720, 340, 155,
        "interface · GoF: Strategy", "IHybridRankingStrategy",
        ["+ name: str  {abstract}"],
        ["+ fuse(lex, vec, top_k): list[SearchHit]"],
        header_fill=TEAL, body_fill=WHITE,
    )
    impl_rank = b.add_uml_class(
        430, 955, 340, 130,
        "ConcreteStrategy", "Rankers Incorporados",
        ["• ReciprocalRankFusionStrategy", "• WeightedLinearRankingStrategy"],
        ["+ fuse(lex, vec, top_k): list[SearchHit]"],
        header_fill=TEAL, body_fill=TEAL_LIGHT,
    )

    # Strategy 3: Bundle Exporter
    i_exp = b.add_uml_class(
        805, 720, 335, 155,
        "interface · GoF: Strategy", "IBundleExporter",
        ["+ format_name: str  {abstract}"],
        ["+ export(name, docs, est, max): str"],
        header_fill=TEAL, body_fill=WHITE,
    )
    impl_exp = b.add_uml_class(
        805, 955, 335, 145,
        "ConcreteStrategy", "Exporters Incorporados",
        ["• MarkdownBundleExporter", "• JsonBundleExporter", "• XmlBundleExporter"],
        ["+ export(...): str"],
        header_fill=TEAL, body_fill=TEAL_LIGHT,
    )

    # Chain of Responsibility: Document Rules
    c_chain = b.add_uml_class(
        1175, 720, 325, 155,
        "GoF: Chain of Responsibility", "DocumentRuleChain",
        ["- _rules: list[IDocumentRule]"],
        ["+ add_rule(rule: IDocumentRule)", "+ validate_all(doc): None"],
        header_fill=AMBER, body_fill=WHITE,
    )
    i_rule = b.add_uml_class(
        1175, 955, 325, 165,
        "interface · Handler", "IDocumentRule",
        ["+ rule_name: str  {abstract}"],
        ["+ validate(doc): None", "• NonEmptyContentRule", "• MaxLengthRule / ValidMetadataRule"],
        header_fill=AMBER, body_fill=AMBER_LIGHT,
    )

    # Observer: EventBus
    c_bus = b.add_uml_class(
        1535, 720, 320, 155,
        "GoF: Observer (Subject)", "KnowledgeEventBus",
        ["- _observers: list[IKnowledgeObserver]"],
        ["+ subscribe(observer)", "+ publish(event_type, payload)"],
        header_fill=PURPLE, body_fill=WHITE,
    )
    i_obs = b.add_uml_class(
        1535, 955, 320, 150,
        "interface · Observer", "IKnowledgeObserver",
        ["• Eventos: knowledge.ingested", "• knowledge.searched / rag_answered"],
        ["+ on_event(event: KnowledgeEvent)"],
        header_fill=PURPLE, body_fill=PURPLE_LIGHT,
    )

    # Legend strip at bottom of Behavioral container
    b.add_box(
        65, 1145, 1790, 70,
        "<b>Leyenda UML &amp; GoF:</b>   --&gt; Asociación / Uso   |   - - &gt; Dependencia (&lt;&lt;builds&gt;&gt; / resuelve)   |   - - |&gt; Implementación de Interfaz (..|&gt;)   |   <b>Colores:</b> Índigo = Creacionales · Azul/Morado = Estructurales · Verde/Ámbar/Morado = Comportamiento (Extensibles sin editar src/contextforge/)",
        fill=WHITE, stroke=SLATE, font_size=11,
    )

    # ---- RELATIONSHIPS ----
    # Builder -> Facade
    b.add_edge(c_builder, c_facade, "<<builds>>", dashed=True, arrow="open", stroke=INDIGO)
    # Facade -> Decorator
    b.add_edge(c_facade, c_dec, "wraps ops", stroke=PURPLE)
    # Facade -> Factories (routed cleanly via corridor below ContextForge)
    b.add_edge(c_facade, c_sfac, "usa", points=[(720, 592), (187, 592)], label_pos_idx=1, stroke=INDIGO)
    b.add_edge(c_facade, c_rfac, "usa", points=[(780, 480)], stroke=INDIGO)
    # Facade -> DIP
    b.add_edge(c_facade, c_dip, "inyecta (DIP)", points=[(1155, 375), (1710, 375)], stroke=SLATE)
    # Default Adapters ..|> DIP
    b.add_edge(c_dip_impl, c_dip, "..|>", points=[(1710, 415), (1710, 345)], dashed=True, arrow="hollow", stroke=SLATE)

    # Clean horizontal bus y=632 from Facade down to Behavioral GoF patterns
    b.add_edge(c_facade, i_chunk, "", points=[(915, 632), (230, 632)], dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(c_facade, i_rank, "", points=[(915, 632), (600, 632)], dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(c_facade, i_exp, "estrategias", points=[(915, 632), (972, 632)], label_pos_idx=2, dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(c_facade, c_chain, "valida", points=[(915, 632), (1337, 632)], label_pos_idx=2, stroke=AMBER)
    b.add_edge(c_facade, c_bus, "publica", points=[(915, 632), (1695, 632)], label_pos_idx=2, stroke=PURPLE)

    # Concrete implementations ..|> Interfaces
    b.add_edge(impl_chunk, i_chunk, "..|>", dashed=True, arrow="hollow", stroke=TEAL)
    b.add_edge(impl_rank, i_rank, "..|>", dashed=True, arrow="hollow", stroke=TEAL)
    b.add_edge(impl_exp, i_exp, "..|>", dashed=True, arrow="hollow", stroke=TEAL)
    b.add_edge(c_chain, i_rule, "encadena 1..*", stroke=AMBER)
    b.add_edge(c_bus, i_obs, "notifica 0..*", stroke=PURPLE)

    return b.save_all("05_uml_clases_gof")


# ============================================================================
# 6. UML SEQUENCE DIAGRAM — MAIN OPERATION ask()
# ============================================================================
def build_06_uml_sequence_ask() -> tuple[Path, Path]:
    b = DrawioBuilder("uml_seq_ask", "Diagrama de Secuencia UML ask() - ContextForge v1.0.0", 1720, 980)
    b.add_banner(
        "Diagrama de Secuencia UML — Funcionalidad Principal ask() (RAG Híbrido con Citas)",
        "Flujo cronológico a través de Facade, AuditingOperationDecorator, RetrieverFactory, Stores, Ranker, LLM y EventBus",
    )

    lifelines = [
        ("L1", 55, "App / Agente IA", "[Cliente]", NAVY_LIGHT, NAVY),
        ("L2", 290, "ContextForge", "[GoF: Facade]", NAVY_LIGHT, NAVY),
        ("L3", 525, "AuditingDecorator", "[GoF: Decorator]", PURPLE_LIGHT, PURPLE),
        ("L4", 760, "RetrieverFactory", "[GoF: Factory]", INDIGO_LIGHT, INDIGO),
        ("L5", 995, "Lexical & Vector", "[BM25 + Cosine]", TEAL_LIGHT, TEAL),
        ("L6", 1230, "IHybridRanking", "[GoF: Strategy]", TEAL_LIGHT, TEAL),
        ("L7", 1465, "ILLMProvider & Bus", "[LLM + Observer]", AMBER_LIGHT, AMBER),
    ]

    centers: list[int] = []
    lifeline_ids: list[str] = []
    for _, lx, title, sub, fill, stroke in lifelines:
        nid = b.add_box(lx, 110, 185, 62, f"<b>{title}</b><br><i>{sub}</i>", fill=fill, stroke=stroke, font_size=11)
        lifeline_ids.append(nid)
        centers.append(lx + 92)

    b.add_container(
        265, 595, 1395, 225,
        "alt [Evidencia encontrada -> Síntesis fundamentada con citas] / [else -> Error o Abstención]",
        fill="#FFFBEB", stroke=AMBER, header_fill="#FEF3C7", header_text=AMBER,
    )

    messages: list[tuple[int, int, int, str, bool, str]] = [
        (0, 1, 215, "1: ask(question, top_k=3, mode='hybrid', ranking='rrf')", False, NAVY),
        (1, 2, 255, "2: execute('ask', fn)", False, PURPLE),
        (2, 3, 305, "3: retrieve(question, top_k=3, mode='hybrid', ranking='rrf')", False, INDIGO),
        (3, 4, 355, "4: search(question, top_k) [Lexical BM25 + Vector Cosine]", False, TEAL),
        (4, 3, 405, "5: lexical_hits[], vector_hits[]", True, TEAL),
        (3, 5, 455, "6: fuse(lexical_hits, vector_hits, top_k=3)", False, TEAL),
        (5, 3, 505, "7: ranked_hits[] (ordenados por score RRF)", True, TEAL),
        (3, 1, 555, "8: ranked_hits[] + SourceCitation[]", True, INDIGO),
        (1, 6, 675, "9: generate(grounded_prompt, system_prompt) [ILLMProvider]", False, AMBER),
        (6, 1, 725, "10: answer (respuesta fundamentada con citas)", True, AMBER),
        (1, 6, 780, "11: publish('knowledge.rag_answered', payload) [Observer]", False, PURPLE),
        (1, 2, 855, "12: RagResponse(answer, citations, grounded=True)", True, PURPLE),
        (2, 2, 895, "13: registrar AuditRecord(latency_ms, succeeded=True)", False, PURPLE),
        (1, 0, 935, "14: RagResponse", True, NAVY),
    ]

    for s_idx, d_idx, my, mlabel, is_ret, mcol in messages:
        if s_idx != d_idx:
            b.add_edge(
                lifeline_ids[s_idx],
                lifeline_ids[d_idx],
                mlabel,
                points=[(centers[s_idx], my), (centers[d_idx], my)],
                dashed=is_ret,
                stroke=mcol,
                arrow="open" if is_ret else "block",
            )

    def seq_hook(draw: ImageDraw.ImageDraw, s: int, phase: str) -> None:
        if phase == "under":
            for cx in centers:
                b._draw_dashed_line(draw, (cx * s, 172 * s), (cx * s, 955 * s), "#94A3B8", 2, 10 * s, 7 * s)
            for ay1, ay2 in ((205, 575), (655, 805), (845, 945)):
                draw.rectangle([(centers[1] - 5) * s, ay1 * s, (centers[1] + 5) * s, ay2 * s], fill="#DBEAFE", outline=NAVY, width=2)
        elif phase == "over":
            f_msg = _load_font(10 * s, bold=True)
            for s_idx, d_idx, my, mlabel, is_ret, mcol in messages:
                y_px = my * s
                if s_idx == d_idx:
                    x0 = centers[s_idx] * s
                    loop_w, loop_h = 40 * s, 20 * s
                    draw.line([(x0, y_px - 8 * s), (x0 + loop_w, y_px - 8 * s), (x0 + loop_w, y_px + loop_h), (x0, y_px + loop_h)], fill=mcol, width=3)
                    b._draw_arrowhead(draw, (x0 + loop_w, y_px + loop_h), (x0, y_px + loop_h), mcol, "block", s)
                    bb = draw.textbbox((0, 0), mlabel, font=f_msg)
                    tw, th = bb[2] - bb[0], bb[3] - bb[1]
                    draw.rounded_rectangle([x0 + loop_w + 6 * s, y_px - 4 * s, x0 + loop_w + tw + 16 * s, y_px + th + 4 * s], radius=4 * s, fill=WHITE, outline="#CBD5E1")
                    draw.text((x0 + loop_w + 11 * s, y_px - 1 * s), mlabel, fill=TEXT_DARK, font=f_msg)
                    continue

                x1, x2 = centers[s_idx] * s, centers[d_idx] * s
                if is_ret:
                    b._draw_dashed_line(draw, (x1, y_px), (x2, y_px), mcol, 3, 10 * s, 6 * s)
                    b._draw_arrowhead(draw, (x1, y_px), (x2, y_px), mcol, "open", s)
                else:
                    draw.line([(x1, y_px), (x2, y_px)], fill=mcol, width=3)
                    b._draw_arrowhead(draw, (x1, y_px), (x2, y_px), mcol, "block", s)

                mx = (x1 + x2) / 2.0
                bb = draw.textbbox((0, 0), mlabel, font=f_msg)
                tw, th = bb[2] - bb[0], bb[3] - bb[1]
                draw.rounded_rectangle(
                    [mx - tw / 2 - 6 * s, y_px - th - 9 * s, mx + tw / 2 + 6 * s, y_px - 3 * s],
                    radius=4 * s,
                    fill=WHITE,
                    outline="#CBD5E1",
                )
                draw.text((mx - tw / 2, y_px - th - 7 * s), mlabel, fill=TEXT_DARK, font=f_msg)

    return b.save_all("06_uml_secuencia_ask", custom_draw_hook=seq_hook)


def main() -> None:
    COMP_OUT_DIR.mkdir(parents=True, exist_ok=True)
    builders = [
        build_01_use_cases,
        build_02_c4_context,
        build_03_c4_containers,
        build_04_c4_components,
        build_05_uml_classes_gof,
        build_06_uml_sequence_ask,
    ]
    for fn in builders:
        drawio_path, png_path = fn()
        print(f"OK: {drawio_path.relative_to(ROOT)} | {png_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
