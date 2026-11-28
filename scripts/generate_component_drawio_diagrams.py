"""Generates 6 native editable Draw.io (.drawio) XML diagrams and high-DPI (.png) exports
for ContextForge v1.0.0 using official C4 notation (Simon Brown) and focused UML + GoF.
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

# Official C4 Model palette (Simon Brown)
C4_PERSON_FILL = "#08427B"
C4_PERSON_STROKE = "#073B6F"
C4_SYSTEM_FILL = "#1168BD"
C4_SYSTEM_STROKE = "#0B4884"
C4_EXTERNAL_FILL = "#999999"
C4_EXTERNAL_STROKE = "#6B6B6B"
C4_CONTAINER_FILL = "#438DD5"
C4_CONTAINER_STROKE = "#2E6295"
C4_COMPONENT_FILL = "#85BBF0"
C4_COMPONENT_STROKE = "#5D9AD4"
C4_BOUNDARY_STROKE = "#666666"


class C4DrawioBuilder(DrawioBuilder):
    """Extends DrawioBuilder with authentic C4 shapes (Person, Software System, Container, Database, Component, Boundary)."""

    def add_c4_person(
        self,
        x: int,
        y: int,
        w: int,
        h: int,
        name: str,
        desc: str,
        external: bool = False,
    ) -> str:
        fill = C4_EXTERNAL_FILL if external else C4_PERSON_FILL
        stroke = C4_EXTERNAL_STROKE if external else C4_PERSON_STROKE
        cid = self._new_id("c4p")
        label = f"<b>{name}</b><br>[Person]<br><br>{desc}"
        style = (
            f"shape=mxgraph.c4.person2;align=center;metaEdit=1;points=[[0.5,0,0],[1,0.5,0],[1,0.75,0],[0.75,1,0],[0.5,1,0],[0.25,1,0],[0,0.75,0],[0,0.5,0]];"
            f"resizable=0;html=1;whiteSpace=wrap;fillColor={fill};strokeColor={stroke};fontColor=#FFFFFF;fontSize=12;"
        )
        self.nodes[cid] = {
            "id": cid,
            "x": x,
            "y": y,
            "w": w,
            "h": h,
            "label": label,
            "name": name,
            "desc": desc,
            "style": style,
            "fill": fill,
            "stroke": stroke,
            "font_color": WHITE,
            "kind": "c4_person",
            "z": 12,
        }
        return cid

    def add_c4_system(
        self,
        x: int,
        y: int,
        w: int,
        h: int,
        name: str,
        desc: str,
        external: bool = False,
    ) -> str:
        fill = C4_EXTERNAL_FILL if external else C4_SYSTEM_FILL
        stroke = C4_EXTERNAL_STROKE if external else C4_SYSTEM_STROKE
        tag = "[External Software System]" if external else "[Software System]"
        return self.add_box(
            x=x,
            y=y,
            w=w,
            h=h,
            label=f"<b>{name}</b><br><i>{tag}</i><br><br>{desc}",
            fill=fill,
            stroke=stroke,
            font_color=WHITE,
            rounded=True,
            font_size=12,
        )

    def add_c4_container(
        self,
        x: int,
        y: int,
        w: int,
        h: int,
        name: str,
        tech: str,
        desc: str,
        is_db: bool = False,
    ) -> str:
        return self.add_box(
            x=x,
            y=y,
            w=w,
            h=h,
            label=f"<b>{name}</b><br><i>[Container: {tech}]</i><br><br>{desc}",
            fill=C4_CONTAINER_FILL,
            stroke=C4_CONTAINER_STROKE,
            font_color=WHITE,
            rounded=not is_db,
            shape="cylinder" if is_db else "rect",
            font_size=11,
        )

    def add_c4_component(
        self,
        x: int,
        y: int,
        w: int,
        h: int,
        name: str,
        tech: str,
        desc: str,
    ) -> str:
        return self.add_box(
            x=x,
            y=y,
            w=w,
            h=h,
            label=f"<b>{name}</b><br><i>[Component: {tech}]</i><br><br>{desc}",
            fill=C4_COMPONENT_FILL,
            stroke=C4_COMPONENT_STROKE,
            font_color="#000000",
            rounded=True,
            font_size=11,
        )

    def add_c4_boundary(self, x: int, y: int, w: int, h: int, title: str, tag: str = "System Boundary") -> str:
        return self.add_container(
            x=x,
            y=y,
            w=w,
            h=h,
            title=f"{title}  [{tag}]",
            fill="#F8FAFC",
            stroke=C4_BOUNDARY_STROKE,
            header_fill="#E2E8F0",
            header_text="#1E293B",
            dashed=True,
        )

    def add_c4_legend(self, x: int, y: int, items: list[tuple[str, str, str]]) -> None:
        """Draws a compact C4 legend strip at the bottom."""
        w = len(items) * 245 + 24
        self.add_box(
            x=x,
            y=y,
            w=w,
            h=54,
            label="<b>Leyenda C4 (Notación Simon Brown)</b>",
            fill=WHITE,
            stroke="#CBD5E1",
            font_color=TEXT_DARK,
            rounded=True,
            font_size=10,
            kind="c4_legend",
        )
        # Store items on the last node
        last_id = list(self.nodes.keys())[-1]
        self.nodes[last_id]["legend_items"] = items

    def _draw_node(self, draw: ImageDraw.ImageDraw, node: dict[str, Any], s: int) -> None:
        kind = node.get("kind")
        if kind == "c4_person":
            self._draw_c4_person(draw, node, s)
            return
        if kind == "c4_legend":
            self._draw_c4_legend(draw, node, s)
            return
        super()._draw_node(draw, node, s)

    def _draw_c4_person(self, draw: ImageDraw.ImageDraw, node: dict[str, Any], s: int) -> None:
        x, y, w, h = node["x"] * s, node["y"] * s, node["w"] * s, node["h"] * s
        fill, stroke = node["fill"], node["stroke"]

        # Authentic C4 Person silhouette: circular head overlapping rounded torso card
        head_r = int(26 * s)
        head_cx = x + w // 2
        head_cy = y + head_r + int(4 * s)
        body_top = y + int(42 * s)

        # Torso card with rounded shoulders
        draw.rounded_rectangle(
            [x, body_top, x + w, y + h],
            radius=28 * s,
            fill=fill,
            outline=stroke,
            width=max(2, int(2 * s)),
        )
        # Head circle on top
        draw.ellipse(
            [head_cx - head_r, head_cy - head_r, head_cx + head_r, head_cy + head_r],
            fill=fill,
            outline=stroke,
            width=max(2, int(2 * s)),
        )

        # Text inside torso
        f_title = _load_font(12 * s, bold=True)
        f_tag = _load_font(10 * s, italic=True)
        f_desc = _load_font(10 * s)

        cy = body_top + int(24 * s)
        max_w = w - int(24 * s)
        for line in self._wrap_text(draw, node["name"], f_title, max_w):
            bb = draw.textbbox((0, 0), line, font=f_title)
            draw.text((head_cx - (bb[2] - bb[0]) / 2, cy), line, fill=WHITE, font=f_title)
            cy += int(17 * s)

        tag_txt = "[Person]"
        bb = draw.textbbox((0, 0), tag_txt, font=f_tag)
        draw.text((head_cx - (bb[2] - bb[0]) / 2, cy), tag_txt, fill="#DBEAFE", font=f_tag)
        cy += int(20 * s)

        for raw_line in node["desc"].split("<br>"):
            for line in self._wrap_text(draw, raw_line.strip(), f_desc, max_w):
                bb = draw.textbbox((0, 0), line, font=f_desc)
                draw.text((head_cx - (bb[2] - bb[0]) / 2, cy), line, fill=WHITE, font=f_desc)
                cy += int(14 * s)

    def _draw_c4_legend(self, draw: ImageDraw.ImageDraw, node: dict[str, Any], s: int) -> None:
        x, y, w, h = node["x"] * s, node["y"] * s, node["w"] * s, node["h"] * s
        draw.rounded_rectangle([x, y, x + w, y + h], radius=8 * s, fill=WHITE, outline="#CBD5E1", width=2)
        f_lbl = _load_font(10 * s, bold=True)
        cx = x + 16 * s
        cy = y + h // 2
        for label, fill, stroke in node.get("legend_items", []):
            box_w, box_h = 24 * s, 18 * s
            draw.rounded_rectangle([cx, cy - box_h // 2, cx + box_w, cy + box_h // 2], radius=4 * s, fill=fill, outline=stroke, width=2)
            draw.text((cx + box_w + 8 * s, cy - 7 * s), label, fill=TEXT_DARK, font=f_lbl)
            cx += 245 * s


# ============================================================================
# 1. USE CASE DIAGRAM — PUBLIC API (RF-01 .. RF-05)
# ============================================================================
def build_01_use_cases() -> tuple[Path, Path]:
    b = C4DrawioBuilder("comp_uc", "Casos de Uso API Publica - ContextForge v1.0.0", 1460, 780)
    b.add_banner(
        "Diagrama de Casos de Uso — API Pública de ContextForge (v1.0.0)",
        "Consulta ágil con IA, reducción de dependencia entre integrantes y consumo desde servicios externos",
    )

    a_team = b.add_actor(70, 175, 95, 110, "Integrante / App", "Consulta proyectos con IA", stroke=NAVY)
    a_ext = b.add_actor(70, 395, 95, 110, "Servicio Externo", "Agentes / Bots vía API", stroke=INDIGO)
    a_dev = b.add_actor(70, 585, 95, 110, "Equipo Integrador", "Extiende contratos OCP", stroke=TEAL)
    a_llm = b.add_actor(1270, 345, 100, 110, "ILLMProvider", "Ollama / Cloud / Fallback", stroke=AMBER)

    b.add_container(
        265, 115, 915, 625,
        "Paquete Python: contextforge v1.0.0  (Frontera Pública __all__)",
        fill="#F8FAFC", stroke=NAVY, header_fill="#DBEAFE", header_text=NAVY, dashed=False,
    )

    uc1 = b.add_box(340, 175, 340, 76, "<b>RF-01: Ingestar e Indexar</b><br><i>ingest() / ingest_directory()</i>", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse", font_size=12)
    uc2 = b.add_box(340, 290, 340, 76, "<b>RF-02: Búsqueda Híbrida</b><br><i>search(mode, ranking, collection)</i>", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse", font_size=12)
    uc3 = b.add_box(340, 405, 340, 76, "<b>RF-03: Consulta RAG con Citas</b><br><i>ask(question, top_k)</i>", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse", font_size=12)
    uc4 = b.add_box(340, 520, 340, 76, "<b>RF-04: Compilar Context Bundle</b><br><i>compile_bundle(max_tokens, format)</i>", fill=NAVY_LIGHT, stroke=NAVY, shape="ellipse", font_size=12)
    uc5 = b.add_box(795, 600, 340, 82, "<b>RF-05: Registrar Extensiones OCP</b><br><i>register_*() / ContextForgeBuilder</i>", fill=TEAL_LIGHT, stroke=TEAL, shape="ellipse", font_size=12)

    inc_val = b.add_box(795, 175, 330, 72, "<b>Validar Reglas Documentales</b><br><i>DocumentRuleChain (IDocumentRule)</i>", fill=AMBER_LIGHT, stroke=AMBER, shape="ellipse", font_size=11)
    inc_ret = b.add_box(795, 350, 330, 72, "<b>Recuperar y Fusionar (RRF)</b><br><i>RetrieverFactory + IHybridRanking</i>", fill=INDIGO_LIGHT, stroke=INDIGO, shape="ellipse", font_size=11)

    # Actor links
    b.add_edge(a_team, uc1, "", points=[(215, 230), (215, 213)], stroke=NAVY, arrow="none")
    b.add_edge(a_team, uc2, "", points=[(215, 230), (215, 328)], stroke=NAVY, arrow="none")
    b.add_edge(a_ext, uc3, "", points=[(225, 450), (225, 443)], stroke=INDIGO, arrow="none")
    b.add_edge(a_ext, uc4, "", points=[(225, 450), (225, 558)], stroke=INDIGO, arrow="none")
    b.add_edge(a_dev, uc5, "sin editar núcleo", points=[(165, 695), (965, 695)], label_pos_idx=1, stroke=TEAL, arrow="none")
    b.add_edge(uc3, a_llm, "genera respuesta", points=[(730, 443), (730, 495), (1235, 495), (1235, 400)], label_pos_idx=2, stroke=AMBER, arrow="open")

    # <<include>>
    b.add_edge(uc1, inc_val, "<<include>>", dashed=True, stroke=AMBER, arrow="open")
    b.add_edge(uc2, inc_ret, "<<include>>", points=[(730, 328), (730, 386)], dashed=True, stroke=INDIGO, arrow="open")
    b.add_edge(uc3, inc_ret, "<<include>>", points=[(730, 443), (730, 386)], dashed=True, stroke=INDIGO, arrow="open")

    return b.save_all("01_casos_de_uso_api")


# ============================================================================
# 2. C4 LEVEL 1 — SYSTEM CONTEXT DIAGRAM (AUTHENTIC C4 SHAPES)
# ============================================================================
def build_02_c4_context() -> tuple[Path, Path]:
    b = C4DrawioBuilder("c4_comp_n1", "C4 Nivel 1 Contexto - ContextForge v1.0.0", 1560, 880)
    b.add_banner(
        "Modelo C4 — Nivel 1: Diagrama de Contexto del Sistema (ContextForge)",
        "Reduce la dependencia de conocimiento entre integrantes y permite a servicios externos consultar bases de conocimiento e integrar agentes con IA",
    )

    # Top row: Persons (official C4 Person shapes)
    p_team = b.add_c4_person(
        180, 115, 290, 175,
        "Integrantes del Equipo",
        "Consultan reglas, arquitectura y docs<br>del proyecto con IA sin depender de<br>otros compañeros.",
    )
    p_dev = b.add_c4_person(
        1090, 115, 290, 175,
        "Equipo Integrador",
        "Reutiliza ContextForge y crea<br>extensiones OCP sin modificar<br>el código del componente.",
    )

    # Center: Software System in focus
    sys_cf = b.add_c4_system(
        560, 355, 440, 210,
        "ContextForge (v1.0.0)",
        "Componente reutilizable Python y Hub de<br>Conocimiento con búsqueda híbrida (BM25 +<br>Vectorial), RAG con citas verificables y<br>compilación de Context Bundles.",
        external=False,
    )

    # Left & Right & Bottom: External Software Systems
    ext_svc = b.add_c4_system(
        45, 375, 315, 170,
        "Servicios Externos y Agentes",
        "Apps, bots, portales o IDEs que<br>consumen la API (REST, OpenAI /v1,<br>MCP) o el paquete Python.",
        external=True,
    )
    ext_fs = b.add_c4_system(
        1200, 375, 315, 170,
        "Repositorio Docs-as-Code",
        "Archivos Markdown (.md), ADRs y<br>especificaciones técnicas de cada<br>proyecto.",
        external=True,
    )
    ext_llm = b.add_c4_system(
        590, 645, 380, 140,
        "Proveedores LLM (Opcional)",
        "Ollama, OpenAI, Gemini, Anthropic o<br>Fallback extractivo local sin red.",
        external=True,
    )

    # Relationships (concise single-line labels)
    b.add_edge(p_team, sys_cf, "Consulta proyectos con IA (RAG)", points=[(325, 325), (690, 325)], stroke=C4_PERSON_STROKE)
    b.add_edge(p_dev, sys_cf, "Extiende contratos (OCP)", points=[(1235, 325), (870, 325)], stroke=C4_PERSON_STROKE)
    b.add_edge(ext_svc, sys_cf, "Consume API / Agentes", stroke=C4_EXTERNAL_STROKE)
    b.add_edge(sys_cf, ext_fs, "Ingesta docs .md", stroke=C4_SYSTEM_STROKE)
    b.add_edge(sys_cf, ext_llm, "Síntesis (ILLMProvider)", stroke=C4_SYSTEM_STROKE)

    b.add_c4_legend(
        290, 805,
        [
            ("Person (Usuario)", C4_PERSON_FILL, C4_PERSON_STROKE),
            ("Software System (En foco)", C4_SYSTEM_FILL, C4_SYSTEM_STROKE),
            ("External System", C4_EXTERNAL_FILL, C4_EXTERNAL_STROKE),
        ],
    )
    return b.save_all("02_c4_contexto_n1")


# ============================================================================
# 3. C4 LEVEL 2 — CONTAINER DIAGRAM (AUTHENTIC C4 SHAPES + CYLINDERS)
# ============================================================================
def build_03_c4_containers() -> tuple[Path, Path]:
    b = C4DrawioBuilder("c4_comp_n2", "C4 Nivel 2 Contenedores - ContextForge v1.0.0", 1620, 920)
    b.add_banner(
        "Modelo C4 — Nivel 2: Diagrama de Contenedores (ContextForge)",
        "Separación entre el componente Python instalable (API Pública / _internal), la capa API/Web opcional y los almacenes",
    )

    # Left: Actors & External Consumers
    p_user = b.add_c4_person(
        55, 145, 250, 165,
        "Integrante del Equipo",
        "Consulta proyectos y<br>documentación con IA.",
    )
    ext_app = b.add_c4_system(
        55, 400, 250, 155,
        "Servicios Externos",
        "Microservicios, bots,<br>IDEs o scripts Python<br>que integran agentes.",
        external=True,
    )

    # System Boundary
    b.add_c4_boundary(385, 115, 850, 685, "ContextForge Ecosystem", "System Boundary")

    # Optional API/Web Container (Top inside boundary)
    c_api = b.add_c4_container(
        420, 170, 780, 130,
        "API REST / Gateway OpenAI / MCP & Web UI (Opcional · .[web])",
        "FastAPI + Uvicorn + Jinja2",
        "Expone /api/v1, /v1/chat/completions, /mcp y Widget para que servicios externos y equipos consuman agentes y bases de conocimiento.",
    )

    # Core Reusable Package Containers (wider gap for clean label)
    c_pub = b.add_c4_container(
        420, 365, 330, 185,
        "API Pública del Componente",
        "Python >= 3.11 · src/contextforge/",
        "Frontera __all__: Facade ContextForge, Builder, contratos ABC, DTOs y excepciones (0 deps).",
    )
    c_int = b.add_c4_container(
        870, 365, 330, 185,
        "Núcleo Interno Encapsulado",
        "Python · src/contextforge/_internal/",
        "Chunking, fusión RRF/Weighted, reglas, exportadores, auditoría y pipeline RAG.",
    )

    # Storage Containers (Cylinders!)
    c_db = b.add_c4_container(
        420, 615, 330, 145,
        "Índices Léxico y Vectorial",
        "InMemory BM25/Cosine o SQLite FTS5/Chroma",
        "Almacena fragmentos indexados y embeddings por proyecto.",
        is_db=True,
    )
    c_docs = b.add_c4_container(
        870, 615, 330, 145,
        "Base Documental Markdown",
        "Filesystem Docs-as-Code",
        "Archivos .md versionados con frontmatter YAML.",
        is_db=True,
    )

    # Right: External LLM
    ext_llm = b.add_c4_system(
        1330, 395, 245, 160,
        "Proveedor LLM",
        "Ollama, OpenAI,<br>Gemini o Fallback<br>extractivo local.",
        external=True,
    )

    # Edges (concise single-line labels)
    b.add_edge(p_user, c_api, "Web UI / Chat", stroke=C4_PERSON_STROKE)
    b.add_edge(ext_app, c_api, "REST / OpenAI / MCP", points=[(340, 445), (340, 255)], stroke=C4_EXTERNAL_STROKE)
    b.add_edge(ext_app, c_pub, "Paquete Python", stroke=C4_EXTERNAL_STROKE)
    b.add_edge(c_api, c_pub, "Consume API pública", points=[(585, 300), (585, 365)], stroke=C4_CONTAINER_STROKE)
    b.add_edge(c_pub, c_int, "Delega (ABC)", stroke=C4_CONTAINER_STROKE)
    b.add_edge(c_int, c_db, "Indexa y busca", points=[(1035, 580), (585, 580)], stroke=C4_CONTAINER_STROKE)
    b.add_edge(c_int, c_docs, "Lee Markdown", stroke=C4_CONTAINER_STROKE)
    b.add_edge(c_int, ext_llm, "ILLMProvider", stroke=C4_CONTAINER_STROKE)

    b.add_c4_legend(
        190, 835,
        [
            ("Person", C4_PERSON_FILL, C4_PERSON_STROKE),
            ("Container (App / Paquete)", C4_CONTAINER_FILL, C4_CONTAINER_STROKE),
            ("Container (Database / Store)", C4_CONTAINER_FILL, C4_CONTAINER_STROKE),
            ("External System", C4_EXTERNAL_FILL, C4_EXTERNAL_STROKE),
        ],
    )
    return b.save_all("03_c4_contenedores_n2")


# ============================================================================
# 4. C4 LEVEL 3 — COMPONENT DIAGRAM (AUTHENTIC C4 COMPONENT SHAPES)
# ============================================================================
def build_04_c4_components() -> tuple[Path, Path]:
    b = C4DrawioBuilder("c4_comp_n3", "C4 Nivel 3 Componentes Internos - ContextForge v1.0.0", 1620, 960)
    b.add_banner(
        "Modelo C4 — Nivel 3: Diagrama de Componentes Internos (Paquete contextforge v1.0.0)",
        "Componentes dentro del paquete Python instalable y sus puntos de extensión abiertos (OCP / DIP)",
    )

    b.add_c4_boundary(45, 110, 1530, 745, "Paquete Python: contextforge (v1.0.0)", "Container Boundary")

    # Top row: Entry points
    c_builder = b.add_c4_component(
        85, 165, 320, 130,
        "ContextForgeBuilder",
        "builder.py · GoF Builder",
        "Ensambla configuración, stores, LLM y extensiones externas.",
    )
    c_facade = b.add_c4_component(
        595, 155, 430, 150,
        "ContextForge",
        "client.py · GoF Facade",
        "Punto de entrada único: ingest(), search(), ask(), compile_bundle() y registro de extensiones.",
    )
    c_audit = b.add_c4_component(
        1215, 165, 320, 130,
        "AuditingOperationDecorator",
        "_internal/decorators.py",
        "Mide latencia y registra trazabilidad de cada operación.",
    )

    # Middle row: Internal orchestrators
    c_rules = b.add_c4_component(85, 380, 270, 135, "DocumentRuleChain", "_internal/rules.py", "Ejecuta reglas de validación (IDocumentRule) antes de indexar.")
    c_sfac = b.add_c4_component(385, 380, 270, 135, "StrategyFactory", "_internal/factories.py", "Resuelve estrategias de chunking y ranking híbrido.")
    c_rfac = b.add_c4_component(685, 380, 270, 135, "RetrieverFactory", "_internal/factories.py", "Ejecuta recuperación léxica, vectorial o híbrida (RRF).")
    c_ereg = b.add_c4_component(985, 380, 270, 135, "BundleExporterRegistry", "_internal/exporters.py", "Resuelve exportadores Markdown, JSON, XML o custom.")
    c_bus = b.add_c4_component(1285, 380, 255, 135, "KnowledgeEventBus", "_internal/events.py", "Emite eventos del ciclo de vida a observadores.")

    # Bottom row: Pluggable contracts & Stores
    c_p_rule = b.add_c4_component(85, 625, 270, 165, "Contratos de Reglas", "contracts.py · IDocumentRule", "NonEmpty, MaxLength, ValidMetadata + reglas de terceros.")
    c_p_strat = b.add_c4_component(385, 625, 270, 165, "Estrategias (GoF Strategy)", "contracts.py · Chunk & Rank", "HeadingAware, SlidingWindow, RRF, Weighted + custom.")
    c_p_store = b.add_c4_container(685, 625, 270, 165, "Almacenes de Índices", "ILexicalStore & IVectorStore", "BM25 + Cosine en memoria (reemplazables por FTS5/Chroma/Fakes).", is_db=True)
    c_p_exp = b.add_c4_component(985, 625, 270, 165, "Exportadores (GoF Strategy)", "contracts.py · IBundleExporter", "Markdown, JSON, XML + formatos de terceros (YAML).")
    c_p_llm = b.add_c4_system(1285, 625, 255, 165, "ILLMProvider", "ExtractiveFallback por defecto o Ollama / Cloud / Stub.", external=True)

    # Edges
    b.add_edge(c_builder, c_facade, "ensambla", stroke=C4_COMPONENT_STROKE)
    b.add_edge(c_facade, c_audit, "envuelve ops", stroke=C4_COMPONENT_STROKE)

    b.add_edge(c_facade, c_rules, "", points=[(810, 340), (220, 340)], stroke=C4_CONTAINER_STROKE)
    b.add_edge(c_facade, c_sfac, "", points=[(810, 340), (520, 340)], stroke=C4_CONTAINER_STROKE)
    b.add_edge(c_facade, c_rfac, "delega", points=[(810, 340), (820, 340)], stroke=C4_CONTAINER_STROKE)
    b.add_edge(c_facade, c_ereg, "", points=[(810, 340), (1120, 340)], stroke=C4_CONTAINER_STROKE)
    b.add_edge(c_facade, c_bus, "", points=[(810, 340), (1412, 340)], stroke=C4_CONTAINER_STROKE)

    b.add_edge(c_rules, c_p_rule, "valida", dashed=True, arrow="open", stroke=C4_COMPONENT_STROKE)
    b.add_edge(c_sfac, c_p_strat, "selecciona", dashed=True, arrow="open", stroke=C4_COMPONENT_STROKE)
    b.add_edge(c_rfac, c_p_store, "consulta", stroke=C4_CONTAINER_STROKE)
    b.add_edge(c_ereg, c_p_exp, "exporta", dashed=True, arrow="open", stroke=C4_COMPONENT_STROKE)
    b.add_edge(c_bus, c_p_llm, "LLM / Eventos", dashed=True, arrow="open", stroke=C4_EXTERNAL_STROKE)

    b.add_c4_legend(
        335, 880,
        [
            ("Component (Módulo)", C4_COMPONENT_FILL, C4_COMPONENT_STROKE),
            ("Container (Store / Índices)", C4_CONTAINER_FILL, C4_CONTAINER_STROKE),
            ("External System (LLM)", C4_EXTERNAL_FILL, C4_EXTERNAL_STROKE),
        ],
    )
    return b.save_all("04_c4_componentes_n3")


# ============================================================================
# 5. UML CLASS DIAGRAM — FOCUSED GoF PATTERNS (1 CORE PER CATEGORY + SUPPORT)
# ============================================================================
def build_05_uml_classes_gof() -> tuple[Path, Path]:
    b = C4DrawioBuilder("uml_cls_gof", "Diagrama de Clases UML con Patrones GoF - ContextForge v1.0.0", 1900, 1220)
    b.add_banner(
        "Diagrama de Clases UML — ContextForge (v1.0.0) con Patrones GoF Principales",
        "Diseño pragmático (sin sobreingeniería): 1 patrón GoF principal por categoría — Builder (Creacional), Facade (Estructural) y Strategy (Comportamiento)",
    )

    # ---- CORE 1: CREATIONAL (Builder) ----
    b.add_container(
        40, 110, 520, 445,
        "1. GoF CREACIONAL — Builder",
        fill="#EEF2FF", stroke=INDIGO, header_fill="#C7D2FE", header_text=INDIGO, dashed=False,
    )
    c_builder = b.add_uml_class(
        65, 160, 470, 210,
        "GoF Creacional: Builder", "ContextForgeBuilder",
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
    c_support_fac = b.add_uml_class(
        65, 395, 470, 135,
        "Soporte Interno (Resolución por nombre)", "StrategyFactory & ExporterRegistry",
        ["- _chunkers / _rankers / _exporters"],
        ["+ get_chunker(name) / get_ranker(name) / get(format)"],
        header_fill=SLATE, body_fill=SLATE_LIGHT,
    )

    # ---- CORE 2: STRUCTURAL (Facade) + DIP Contracts ----
    b.add_container(
        605, 110, 1255, 445,
        "2. GoF ESTRUCTURAL — Facade  +  Contratos Inyectables (DIP)",
        fill="#EFF6FF", stroke=NAVY, header_fill="#BFDBFE", header_text=NAVY, dashed=False,
    )
    c_facade = b.add_uml_class(
        635, 160, 520, 275,
        "GoF Estructural: Facade · API Pública", "ContextForge",
        [
            "- _config: ContextForgeConfig",
            "- _llm_provider: ILLMProvider",
            "- _rule_chain: DocumentRuleChain",
            "- _event_bus: KnowledgeEventBus",
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
    c_dip = b.add_uml_class(
        1215, 160, 615, 170,
        "interface · Dependency Inversion (DIP)", "ILLMProvider · ILexicalStore · IVectorStore",
        ["+ provider_name: str  |  + index(chunks)  |  + clear()"],
        [
            "+ generate(prompt, system_prompt): str",
            "+ search(query, top_k): list[SearchHit]",
        ],
        header_fill=SLATE, body_fill=WHITE,
    )
    c_dip_impl = b.add_uml_class(
        1215, 365, 615, 165,
        "Implementaciones por Defecto (0 deps) y Soporte", "Default Adapters & Utilities",
        [
            "• InMemoryLexicalStore (BM25)  ..|> ILexicalStore",
            "• InMemoryVectorStore (Cosine) ..|> IVectorStore",
            "• ExtractiveFallbackLLMProvider ..|> ILLMProvider",
        ],
        ["• Soporte: AuditingOperationDecorator, DocumentRuleChain, KnowledgeEventBus"],
        header_fill=SLATE, body_fill=SLATE_LIGHT,
    )

    # ---- CORE 3: BEHAVIORAL (Strategy) ----
    b.add_container(
        40, 615, 1820, 565,
        "3. GoF COMPORTAMIENTO — Strategy (Puntos de Extensión Abiertos · Principio OCP)",
        fill="#F0FDFA", stroke=TEAL, header_fill="#99F6E4", header_text=TEAL, dashed=False,
    )

    i_chunk = b.add_uml_class(
        70, 670, 540, 155,
        "interface · GoF Comportamiento: Strategy", "IChunkingStrategy",
        ["+ name: str  {abstract}"],
        ["+ chunk(document: KnowledgeDocument): list[DocumentChunk]"],
        header_fill=TEAL, body_fill=WHITE,
    )
    impl_chunk = b.add_uml_class(
        70, 900, 540, 150,
        "ConcreteStrategy", "Estrategias de Fragmentación",
        ["• HeadingAwareChunkingStrategy  (por encabezados Markdown)", "• SlidingWindowChunkingStrategy (ventana deslizante)"],
        ["+ chunk(document): list[DocumentChunk]   (+ extensibles por terceros)"],
        header_fill=TEAL, body_fill=TEAL_LIGHT,
    )

    i_rank = b.add_uml_class(
        680, 670, 540, 155,
        "interface · GoF Comportamiento: Strategy", "IHybridRankingStrategy",
        ["+ name: str  {abstract}"],
        ["+ fuse(lexical_hits, vector_hits, top_k): list[SearchHit]"],
        header_fill=TEAL, body_fill=WHITE,
    )
    impl_rank = b.add_uml_class(
        680, 900, 540, 150,
        "ConcreteStrategy", "Estrategias de Fusión Híbrida",
        ["• ReciprocalRankFusionStrategy  (RRF, k=60 por defecto)", "• WeightedLinearRankingStrategy (ponderación lineal)"],
        ["+ fuse(...): list[SearchHit]   (+ extensibles por terceros)"],
        header_fill=TEAL, body_fill=TEAL_LIGHT,
    )

    i_exp = b.add_uml_class(
        1290, 670, 540, 155,
        "interface · GoF Comportamiento: Strategy", "IBundleExporter",
        ["+ format_name: str  {abstract}"],
        ["+ export(name, documents, estimated_tokens, max_tokens): str"],
        header_fill=TEAL, body_fill=WHITE,
    )
    impl_exp = b.add_uml_class(
        1290, 900, 540, 150,
        "ConcreteStrategy", "Estrategias de Exportación",
        ["• MarkdownBundleExporter  |  • JsonBundleExporter", "• XmlBundleExporter  |  • Custom (ej. YamlBundleExporter)"],
        ["+ export(...): str   (+ extensibles sin editar el núcleo)"],
        header_fill=TEAL, body_fill=TEAL_LIGHT,
    )

    b.add_box(
        70, 1085, 1760, 65,
        "<b>Leyenda UML:</b>   --&gt; Asociación   |   - - &gt; Dependencia (&lt;&lt;builds&gt;&gt; / delega)   |   - - |&gt; Implementación (..|&gt;)   |   <b>Patrones GoF Núcleo:</b> Índigo = Creacional (Builder) · Azul = Estructural (Facade) · Verde = Comportamiento (Strategy)",
        fill=WHITE, stroke=SLATE, font_size=11,
    )

    # Relationships
    b.add_edge(c_builder, c_facade, "<<builds>>", dashed=True, arrow="open", stroke=INDIGO)
    b.add_edge(c_facade, c_support_fac, "usa", points=[(720, 465)], stroke=SLATE)
    b.add_edge(c_facade, c_dip, "inyecta (DIP)", stroke=SLATE)
    b.add_edge(c_dip_impl, c_dip, "..|>", dashed=True, arrow="hollow", stroke=SLATE)

    # Facade -> 3 Strategy interfaces via bus y=585
    b.add_edge(c_facade, i_chunk, "", points=[(895, 585), (340, 585)], dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(c_facade, i_rank, "delega estrategias", points=[(895, 585), (950, 585)], label_pos_idx=2, dashed=True, arrow="open", stroke=TEAL)
    b.add_edge(c_facade, i_exp, "", points=[(895, 585), (1560, 585)], dashed=True, arrow="open", stroke=TEAL)

    # ConcreteStrategy ..|> Strategy
    b.add_edge(impl_chunk, i_chunk, "..|>", dashed=True, arrow="hollow", stroke=TEAL)
    b.add_edge(impl_rank, i_rank, "..|>", dashed=True, arrow="hollow", stroke=TEAL)
    b.add_edge(impl_exp, i_exp, "..|>", dashed=True, arrow="hollow", stroke=TEAL)

    return b.save_all("05_uml_clases_gof")


# ============================================================================
# 6. UML SEQUENCE DIAGRAM — MAIN OPERATION ask()
# ============================================================================
def build_06_uml_sequence_ask() -> tuple[Path, Path]:
    b = C4DrawioBuilder("uml_seq_ask", "Diagrama de Secuencia UML ask() - ContextForge v1.0.0", 1720, 960)
    b.add_banner(
        "Diagrama de Secuencia UML — Funcionalidad Principal ask() (Consulta RAG con Citas)",
        "Flujo cronológico desde el consumidor o servicio externo hasta la recuperación híbrida, ranking y generación con citas",
    )

    lifelines = [
        ("L1", 55, "App / Servicio Externo", "[Cliente]", NAVY_LIGHT, NAVY),
        ("L2", 290, "ContextForge", "[GoF: Facade]", NAVY_LIGHT, NAVY),
        ("L3", 525, "AuditingDecorator", "[Trazabilidad]", PURPLE_LIGHT, PURPLE),
        ("L4", 760, "RetrieverFactory", "[Recuperación]", INDIGO_LIGHT, INDIGO),
        ("L5", 995, "Lexical & Vector", "[BM25 + Cosine]", TEAL_LIGHT, TEAL),
        ("L6", 1230, "IHybridRanking", "[GoF: Strategy]", TEAL_LIGHT, TEAL),
        ("L7", 1465, "ILLMProvider & Bus", "[LLM + Eventos]", AMBER_LIGHT, AMBER),
    ]

    centers: list[int] = []
    lifeline_ids: list[str] = []
    for _, lx, title, sub, fill, stroke in lifelines:
        nid = b.add_box(lx, 110, 185, 62, f"<b>{title}</b><br><i>{sub}</i>", fill=fill, stroke=stroke, font_size=11)
        lifeline_ids.append(nid)
        centers.append(lx + 92)

    b.add_container(
        265, 590, 1395, 220,
        "alt [Evidencia encontrada -> Síntesis fundamentada con citas] / [else -> EmptyKnowledgeBaseError]",
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
        (1, 6, 670, "9: generate(grounded_prompt, system_prompt) [ILLMProvider]", False, AMBER),
        (6, 1, 720, "10: answer (respuesta fundamentada con citas)", True, AMBER),
        (1, 6, 770, "11: publish('knowledge.rag_answered', payload)", False, PURPLE),
        (1, 2, 845, "12: RagResponse(answer, citations, grounded=True)", True, PURPLE),
        (2, 2, 885, "13: registrar AuditRecord(latency_ms, succeeded=True)", False, PURPLE),
        (1, 0, 925, "14: RagResponse", True, NAVY),
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
                b._draw_dashed_line(draw, (cx * s, 172 * s), (cx * s, 945 * s), "#94A3B8", 2, 10 * s, 7 * s)
            for ay1, ay2 in ((205, 575), (650, 795), (835, 935)):
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
    for fn in (
        build_01_use_cases,
        build_02_c4_context,
        build_03_c4_containers,
        build_04_c4_components,
        build_05_uml_classes_gof,
        build_06_uml_sequence_ask,
    ):
        drawio_path, png_path = fn()
        print(f"OK: {drawio_path.relative_to(ROOT)} | {png_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
