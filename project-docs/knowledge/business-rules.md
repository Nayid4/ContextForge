---
id: "DOC-BUSINESS-RULES_MD"
title: "Catálogo Formal de Reglas de Negocio e Invariantes (BR-*) — ContextForge"
collection: "engineering"
parent: null
owner: "spec-author"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: true
full_width: false
last_updated: "2026-11-25"
tags: []
labels: ["business-rules","invariants","domain-rules","engineering"]
icon: "shield"
---

# Catálogo Maestro de Reglas de Negocio e Invariantes (`BR-*`)

> [!IMPORTANT]
> Toda nueva funcionalidad, refactorización o corrección en **ContextForge** DEBE respetar estrictamente estas invariantes verificadas en el código fuente y respaldadas por la suite de 158 pruebas automatizadas.

---

## 1. Reglas de Proyectos y Aislamiento Multi-Tenant (`BR-PROJ-*`)

| ID | Severidad | Regla / Invariante | Implementación Verificada |
|---|---|---|---|
| `BR-PROJ-001` | Crítica | **Normalización y Validación Estricta de `ProjectSlug`**: Todo identificador de proyecto se normaliza a minúsculas, debe cumplir `^[a-z0-9][a-z0-9-_]*[a-z0-9]$` y tener máximo 50 caracteres. | `src/core/domain/project.py` |
| `BR-PROJ-002` | Crítica | **Aislamiento Zero-Leakage entre Proyectos**: Ninguna búsqueda vectorial (ChromaDB `cf_project_{slug}`), léxica (BM25Plus) ni documental (`./docs/{slug}/`) puede retornar contenido perteneciente a otro proyecto. | `chroma_vector_repo.py`, `bm25_lexical_repo.py`, `tests/integration/test_multi_project_rag.py` |

---

## 2. Reglas de Documentación Docs-as-Code y Anexos (`BR-DOC-*`)

| ID | Severidad | Regla / Invariante | Implementación Verificada |
|---|---|---|---|
| `BR-DOC-001` | Crítica | **Markdown como Única Fuente de Verdad**: El contenido autoritativo reside en `./docs/{project_slug}/{module}/*.md`. SQLite únicamente mantiene metadatos de catálogo e índices auxiliares. | `local_filesystem_repo.py`, `src/main.py` |
| `BR-DOC-002` | Alta | **Fidelidad Bidireccional del Editor Dual**: La conversión Markdown $\leftrightarrow$ Bloques Visuales debe preservar encabezados, listas, bloques de código, diagramas Mermaid y enlaces de anexos. | `registry_api.py`, `doc_editor.html` |
| `BR-DOC-003` | Alta | **Soporte de Rutas con Espacios y Previsualización Inline**: Los enlaces Markdown con espacios en anexos (`.docx`, `.ogg`, `.pdf`, `.xlsx`) deben envolverse conforme a CommonMark (`<path>`) y servirse con `content_disposition_type="inline"` para previsualización/reproducción en navegador. | `markdown_parser.py`, `registry_api.py`, `attachment_card.html` |

---

## 3. Reglas del Motor RAG Híbrido y Chat (`BR-RAG-*`)

| ID | Severidad | Regla / Invariante | Implementación Verificada |
|---|---|---|---|
| `BR-RAG-001` | Crítica | **Fusión Determinista RRF ($k=60$)**: La recuperación híbrida combina rankings de ChromaDB y BM25Plus mediante $\text{score} = \sum \frac{1}{60 + \text{rank}}$. | `hybrid_searcher.py` |
| `BR-RAG-002` | Crítica | **Atribución Obligatoria de Fuentes**: Toda respuesta RAG debe incluir referencias exactas (`file_path`, `header` o `attachment_name` + `location`). En SSE, `event: citations` se emite antes del primer `event: token`. | `rag_chat/routes.py`, `prompt_builder.py` |
| `BR-RAG-003` | Alta | **Decodificación Incremental UTF-8 en Streaming**: El streaming de tokens CLI/HTTP debe usar `codecs.getincrementaldecoder("utf-8")` para no corromper caracteres multibyte (`¿`, `é`, `ñ`). | `cli_process_client.py` |
| `BR-RAG-004` | Crítica | **Zero-RAG Bypass ($\le 32.000$ caracteres)**: En `ScopedChatService`, si `raw_markdown` no está vacío y `len(raw_markdown) <= 32000`, se inyecta el documento completo sin invocar búsqueda vectorial; solo si excede 32.000 chars o está vacío se ejecuta `search_scoped`. | `scoped_chat_service.py`, `tests/unit/test_scoped_chat_service.py` |

---

## 4. Reglas de Orquestación Multi-LLM y CLI (`BR-LLM-*`)

| ID | Severidad | Regla / Invariante | Implementación Verificada |
|---|---|---|---|
| `BR-LLM-001` | Crítica | **Conmutación Atómica y Persistencia Permanente**: Al activar un proveedor LLM (`set_active_provider`), exactamente un registro en `llm_configurations` queda con `is_active = True`, se sincroniza `settings.active_llm_model` y se persiste entre reinicios del servidor. | `sql_llm_config_repo.py`, `handlers.py` |
| `BR-LLM-002` | Crítica | **Enmascaramiento y Preservación de API Keys**: Las claves API nunca se retornan en texto claro hacia la UI (`mask_api_key()`). Al guardar una configuración con clave enmascarada (`•••`), se conserva la clave real existente en SQLite. | `domain/llm/entities.py`, `sql_llm_config_repo.py` |
| `BR-LLM-003` | Crítica | **Seguridad de Subprocesos y Orden de Flags CLI (`agy`)**: Prohibido usar `shell=True`. En `CLIProcessClient._build_command`, los flags de prompt (`-p`, `--prompt`, `--print`) se depuran de `base_args`; para `agy`, `--dangerously-skip-permissions` y `--model` preceden siempre a `-p={full_prompt}`. | `cli_process_client.py`, `tests/unit/test_multi_llm_subsystem.py` |
| `BR-LLM-004` | Alta | **Resiliencia Async en Windows**: En `win32`, `main.py` configura `WindowsProactorEventLoopPolicy` y `CLIProcessClient` provee fallback multihilo `subprocess.Popen` + `asyncio.Queue` ante `NotImplementedError`. | `src/main.py`, `cli_process_client.py` |

---

## 5. Reglas de MCP, Bundler y UX (`BR-MCP-*`, `BR-UI-*`)

| ID | Severidad | Regla / Invariante | Implementación Verificada |
|---|---|---|---|
| `BR-MCP-001` | Alta | **Paridad Dual SSE y STDIO en FastMCP**: Las herramientas `search_project_context`, `get_document_full` y `list_project_structure` deben operar idénticamente vía JSON-RPC 2.0 sobre `/mcp/sse` y `run_mcp.py`. | `src/presentation/mcp/server.py`, `run_mcp.py` |
| `BR-UI-001` | Alta | **Cero `alert()` Nativos y Seguridad DOM**: Toda notificación de usuario se enruta por `window.$toast` y los botones dinámicos de chat usan `addEventListener` sin interpolación inline `onclick` vulnerable a fuga de HTML. | `base.html`, `chat.html`, `settings.html` |
| `BR-UI-002` | Media | **Paridad Visual Modo Claro y Oscuro**: Todo componente UI, editor, visor multimedia y barra lateral debe adaptarse coherentemente a ambos temas persistidos en `localStorage.contextforge_theme`. | `base.html`, `main.css` |
