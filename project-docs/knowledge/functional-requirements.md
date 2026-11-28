---
id: "DOC-FUNCTIONAL-REQUIREMENTS_MD"
title: "Especificación de Requisitos de Software (SRS IEEE 830 Sección 3) — ContextForge"
collection: "product"
parent: "03-capabilities-and-features.md"
owner: "spec-author"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-25"
tags: []
labels: ["ieee-830","srs","functional-requirements","furps","gherkin","product"]
icon: "clipboard"
---

# Especificación de Requisitos Funcionales y No Funcionales (SRS IEEE 830)

> [!NOTE]
> Requisitos funcionales (`RF-*`) con criterios verificables Gherkin, interfaces externas y requisitos no funcionales (`RNF-*` bajo FURPS+) extraídos forensicamente de **ContextForge**.

---

## 1. Requisitos Funcionales (`RF-*`)

### `RF-PROJ-001`: Gestión y Aislamiento Multi-Proyecto
- **Descripción**: El sistema debe permitir crear, listar y alternar proyectos aislados por `ProjectSlug`, particionando documentos en `./docs/{slug}/`, vectores en `cf_project_{slug}` e índices BM25.
- **Escenario Gherkin**:
  ```gherkin
  Given existen dos proyectos "iuristrack" y "fintech-core" con documentos propios
  When un usuario ejecuta una búsqueda híbrida sobre "fintech-core"
  Then los resultados contienen únicamente fragmentos de "fintech-core" sin fuga de "iuristrack"
  ```

### `RF-DOC-001`: Autoría Dual Docs-as-Code y Anexos Multiformato
- **Descripción**: El sistema debe permitir redactar documentos en Markdown Pro o Constructor de Bloques, adjuntar archivos (PDF, DOCX, XLSX/CSV, imágenes y audio `.ogg`/`.mp3`), extraer su texto para RAG y previsualizarlos inline sin descarga forzada.
- **Escenario Gherkin**:
  ```gherkin
  Given un documento con anexos ".docx" y ".ogg" cuyos nombres contienen espacios
  When el usuario visualiza el detalle del documento
  Then los enlaces se compilan como tarjetas interactivas con visor Mammoth.js y reproductor de audio nativo
  ```

### `RF-RAG-001`: Recuperación Híbrida RRF y Streaming SSE con Citas
- **Descripción**: El sistema debe combinar resultados de ChromaDB y BM25Plus mediante RRF ($k=60$) y transmitir la respuesta vía SSE emitiendo las fuentes (`citations`) antes de los tokens generados.

### `RF-RAG-002`: Chat Focalizado con Zero-RAG Bypass
- **Descripción**: El sistema debe inyectar el documento íntegro al LLM cuando su extensión sea $\le 32.000$ caracteres y conmutar automáticamente a búsqueda vectorial focalizada cuando supere dicho umbral.

### `RF-LLM-001`: Orquestación Multi-LLM Universal y Persistencia Activa
- **Descripción**: El sistema debe permitir configurar, probar conectividad/embeddings y activar cualquiera de los 15 proveedores LLM (Local HTTP, Cloud API, Local CLI) persistiendo la selección en SQLite tras reinicios.

### `RF-MCP-001`: Exposición Universal de Contexto vía Bundler y MCP
- **Descripción**: El sistema debe compilar Context Bundles (`.cursorrules`/`.md`) y exponer `search_project_context`, `get_document_full` y `list_project_structure` mediante `FastMCP` en SSE (`/mcp/sse`) y STDIO (`run_mcp.py`).

---

## 2. Requisitos de Interfaces Externas (IEEE 830 Sección 3.1)

- **Interfaces de Usuario (UI)**: Interfaz web responsiva SSR con Jinja2, HTMX, Alpine.js y TailwindCSS v4; tema claro/oscuro sincronizado; paleta de comandos `Ctrl+K`; notificaciones toast (`window.$toast`).
- **Interfaces de Software**: SQLite vía `SQLAlchemy 2.0 Async + aiosqlite`, ChromaDB persistente, Ollama HTTP API, APIs REST de Gemini/OpenAI/Anthropic/DeepSeek y subprocesos CLI sin `shell=True`.
- **Interfaces de Comunicaciones**: HTTP/1.1 REST JSON (puerto `8000`), Server-Sent Events (`text/event-stream`) para RAG y MCP, JSON-RPC 2.0 sobre STDIO (`run_mcp.py`).

---

## 3. Requisitos No Funcionales (`RNF-*` — FURPS+)

| ID | Categoría FURPS+ | Requisito Verificado | Métrica / Evidencia |
|---|---|---|---|
| `RNF-001` | **Confiabilidad / Tipado** | Todo el código fuente en `src/` debe compilar bajo tipado estricto sin errores. | `mypy --strict src`: 0 errores en 302 archivos. |
| `RNF-002` | **Mantenibilidad / QA** | Cobertura automatizada multinivel (unit, integration, e2e). | `pytest`: 158 pruebas pasando al 100%. |
| `RNF-003` | **Seguridad / Soberanía** | Cero exposición de API Keys en respuestas HTTP; prohibido `shell=True` en llamadas CLI; operación 100% offline con Ollama/SQLite/ChromaDB. | `mask_api_key()`, `CLIProcessClient._build_command()`. |
| `RNF-004` | **Rendimiento** | Cabecera `X-Response-Time-Ms` en todas las respuestas HTTP; debounce de `1.5s` en `BackgroundDocsWatcher` para evitar reindexaciones redundantes. | `src/main.py`, `fs_watcher.py`. |
| `RNF-005` | **Portabilidad** | Ejecución nativa en Windows, Linux y macOS con resolución automática de binarios CLI y política Proactor/fallback multihilo en Windows. | `cli_process_client.py`, `verify.sh`. |
