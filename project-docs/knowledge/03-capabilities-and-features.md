---
id: "DOC-03-CAPABILITIES-AND-FEATURES_MD"
title: "Catálogo Exhaustivo de Capacidades, Features y Mapa Mental (DeepWiki) — ContextForge"
collection: "product"
parent: null
owner: "leader"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: true
full_width: true
last_updated: "2026-11-25"
tags: []
labels: ["deepwiki","capabilities","features","mindmap","user-journeys","product"]
icon: "target"
---

# Catálogo Exhaustivo de Capacidades, Features y Desglose Funcional (DeepWiki)

> [!NOTE]
> Descomposición funcional jerárquica de **ContextForge (IntegrationLibrary)** conectando capacidades de negocio, features granulares, recorridos de usuario (*User Journeys*), archivos fuente (*Deep Source Linking*) y cobertura de pruebas automatizadas (`158/158` tests pasando).

---

## 1. Mapa Mental de Capacidades del Sistema (Mermaid Mindmap)

```mermaid
mindmap
  root((ContextForge Platform))
    Docs-as-Code y Editor Dual
      Explorador Multi-Proyecto
      Editor Markdown Pro HTMX
      Constructor Visual de Bloques
      Blueprints y AI Scaffolding
      Extractores PDF DOCX XLSX Audio
      File Watcher Watchdog 1.5s
    RAG Hibrido y Chat Soberano
      Busqueda Vectorial ChromaDB
      Indice Lexico BM25Plus
      Fusion RRF k=60
      Zero-RAG Bypass 32k chars
      Scoped Chat por Documento
      Chat Global SSE con Citas
    Orquestacion Multi-LLM Universal
      Local HTTP Ollama LM Studio vLLM
      Cloud APIs Gemini OpenAI Claude DeepSeek
      CLI Soberanos agy claude opencode codex
      Auto-Discovery de Binarios por SO
      Embeddings Multi-Proveedor
      Persistencia Activa SQLite y LocalStorage
    Context Bundler y MCP Bridge
      Compilador .cursorrules y .md
      Servidor FastMCP SSE /mcp/sse
      Servidor FastMCP STDIO run_mcp.py
      Widget de Chat Embebible JS
      Coleccion Postman Auto-Generada
    Catalogo Taxonomia y Social
      Aislamiento por ProjectSlug
      Modulos y Etiquetas Dinamicas
      Comentarios y Moderacion
      Hilos de Discusion y Ratings
    UI Screaming y Persistencia Hexagonal
      Jinja2 HTMX Alpine Tailwind v4
      Tema Claro y Oscuro Persistente
      Command Palette Ctrl+K
      DatabaseFactory 6 Motores
      StorageFactory 4 Motores
```

---

## 2. Matriz de Capacidades y Features Granulares

### Capacidad 1 (`CAP-DOC`): Gestión Docs-as-Code, Editor Dual y Anexos Multiformato

| ID | Feature | Disparador / Endpoint | Invariantes (`BR-*`) | Código Fuente | Cobertura de Tests |
|---|---|---|---|---|---|
| `CAP-DOC-001` | Explorador y Visor Editorial con Lightbox/Audio/PDF/DOCX/XLSX | `GET /docs/browser`, `GET /docs/view/{path}` | `BR-DOC-001`, `BR-DOC-003` | [`docs_api.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/presentation/api/v1/docs_api.py), [`doc_detail.html`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/presentation/frontend/modules/knowledge_docs/views/doc_detail.html) | `tests/e2e/test_contextforge_e2e.py` |
| `CAP-DOC-002` | Editor Dual (Markdown Pro $\leftrightarrow$ Bloques Visuales) | `POST /api/v1/books/save`, `POST /api/v1/books/compile-blocks` | `BR-DOC-001`, `BR-DOC-002` | [`registry_api.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/presentation/api/v1/registry_api.py), [`doc_editor.html`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/presentation/frontend/modules/knowledge_docs/views/doc_editor.html) | `tests/e2e/test_dual_editor_and_scoped_rag.py` |
| `CAP-DOC-003` | Carga y Extracción Multiformato (PDF, DOCX, XLSX, Audio) | `POST /api/v1/books/upload-attachment`, `GET /api/v1/assets/{path}` | `BR-DOC-003` | [`src/infrastructure/external/extractors/`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/infrastructure/external/extractors) | `tests/unit/test_multiformat_extractors.py` |
| `CAP-DOC-004` | Scaffolding de Documentación con IA y Blueprints | `GET /api/v1/docs/templates`, `POST /api/v1/docs/scaffold-ai` | `BR-DOC-001` | [`scaffold_api.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/presentation/api/v1/scaffold_api.py), [`blueprints.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/core/templates/blueprints.py) | `tests/unit/test_blueprints_and_scaffold.py`, `tests/e2e/test_scaffold_api.py` |
| `CAP-DOC-005` | Sincronización Automática con File Watcher (`watchdog`) | Evento FS en `./docs/` (debounce `1.5s`) | `BR-RAG-001` | [`fs_watcher.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/infrastructure/services/fs_watcher.py) | `tests/integration/test_fs_watcher.py` |

### Capacidad 2 (`CAP-RAG`): Motor RAG Híbrido y Chat Conversacional

| ID | Feature | Disparador / Endpoint | Invariantes (`BR-*`) | Código Fuente | Cobertura de Tests |
|---|---|---|---|---|---|
| `CAP-RAG-001` | Búsqueda Híbrida BM25Plus + ChromaDB (RRF $k=60$) | `GET /api/v1/search/hybrid` | `BR-RAG-001`, `BR-RAG-002` | [`hybrid_searcher.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/application/rag_engine/services/hybrid_searcher.py) | `tests/integration/test_multi_project_rag.py` |
| `CAP-RAG-002` | Chat RAG Global con Streaming SSE y Citas | `GET /chat/stream`, `POST /api/v1/rag/ask` | `BR-RAG-002`, `BR-RAG-003` | [`rag_api.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/presentation/api/v1/rag_api.py), [`chat.html`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/presentation/frontend/modules/rag_chat/views/chat.html) | `tests/unit/test_contextforge_domain_and_app.py` |
| `CAP-RAG-003` | Chat Focalizado por Documento con Zero-RAG Bypass ($\le 32\text{k}$) | `POST /api/v1/chat/scoped`, `POST /api/v1/chat/messages` | `BR-RAG-004` | [`scoped_chat_service.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/application/chat/services/scoped_chat_service.py) | `tests/unit/test_scoped_chat_service.py`, `tests/e2e/test_dual_editor_and_scoped_rag.py` |

### Capacidad 3 (`CAP-LLM`): Orquestación Multi-LLM Universal y Agentes CLI

| ID | Feature | Disparador / Endpoint | Invariantes (`BR-*`) | Código Fuente | Cobertura de Tests |
|---|---|---|---|---|---|
| `CAP-LLM-001` | Gestión y Activación Persistente de 15 Proveedores LLM | `GET/POST /api/v1/settings/llm`, `POST /api/v1/settings/llm/activate` | `BR-LLM-001`, `BR-LLM-002` | [`llm_settings_api.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/presentation/api/v1/llm_settings_api.py), [`llm_factory.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/infrastructure/external/llm/llm_factory.py) | `tests/unit/test_multi_llm_subsystem.py` |
| `CAP-LLM-002` | Ejecución Segura y Streaming de Agentes CLI (`agy`, `claude`, `opencode`) | `CLIProcessClient.generate()`, `stream_generate()` | `BR-LLM-003`, `BR-LLM-004` | [`cli_process_client.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/infrastructure/external/llm/cli_process_client.py) | `tests/unit/test_multi_llm_subsystem.py` |
| `CAP-LLM-003` | Auto-Discovery de Binarios CLI y Test de Embeddings | `GET /api/v1/settings/llm/discover-cli`, `POST /api/v1/settings/llm/test-embedding` | `BR-LLM-002` | [`discover_cli_engines`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/application/settings/queries/discover_cli_engines) | `tests/test_universal_engines_and_mcp.py` |

### Capacidad 4 (`CAP-MCP`): Context Bundler, Servidor MCP e Integraciones

| ID | Feature | Disparador / Endpoint | Invariantes (`BR-*`) | Código Fuente | Cobertura de Tests |
|---|---|---|---|---|---|
| `CAP-MCP-001` | Compilación y Descarga de Context Bundles (`.cursorrules`/`.md`) | `POST /api/v1/bundles/export`, `GET /api/v1/bundles/{id}/download` | `BR-BND-001` | [`bundles_api.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/presentation/api/v1/bundles_api.py) | `tests/unit/test_projects_and_ui_bundler.py` |
| `CAP-MCP-002` | Servidor Universal FastMCP (SSE + STDIO JSON-RPC 2.0) | `GET /mcp/sse`, `POST /mcp/messages`, `python run_mcp.py` | `BR-MCP-001` | [`server.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/presentation/mcp/server.py), [`run_mcp.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/run_mcp.py) | `tests/test_universal_engines_and_mcp.py` |
| `CAP-MCP-003` | Widget Embebible JS y Colección Postman | `GET /api/v1/integrations/widget.js`, `GET /api/v1/integrations/postman-collection` | `BR-INT-001` | [`integrations_api.py`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20IntegrationLibrary/IntegrationLibrary/src/presentation/api/v1/integrations_api.py) | `tests/unit/test_integrations_and_widget.py` |

---

## 3. Flujo de Usuario de Extremo a Extremo (User Journey)

```mermaid
sequenceDiagram
  autonumber
  actor Dev as "Desarrollador"
  participant UI as "Screaming UI (HTMX/Alpine)"
  participant API as "FastAPI REST v1"
  participant RAG as "HybridSearch + ScopedChat"
  participant LLM as "LLMFactory (CLI/HTTP/Cloud)"
  participant MCP as "FastMCP Server"

  Dev->>UI: "Selecciona proyecto activo en Navbar"
  UI->>API: "POST /ui/projects/switch (cookie cf_active_project)"
  Dev->>UI: "Crea ADR en Editor Dual y adjunta PDF/DOCX/Audio"
  UI->>API: "POST /api/v1/books/save + upload-attachment"
  API-->>UI: "Guardado en ./docs/{slug}/ e indexado en ChromaDB + BM25"
  Dev->>UI: "Consulta regla de negocio en Chat Soberano"
  UI->>RAG: "GET /chat/stream?q=politica+reintentos"
  RAG->>LLM: "stream_generate() con citas exactas"
  LLM-->>UI: "Tokens SSE en tiempo real con pills de fuentes"
  Dev->>MCP: "IDE consulta search_project_context vía /mcp/sse"
  MCP-->>Dev: "Markdown estructurado con fuentes del proyecto"
```
