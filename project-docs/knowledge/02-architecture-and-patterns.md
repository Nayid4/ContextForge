---
id: "DOC-02-ARCHITECTURE-AND-PATTERNS_MD"
title: "Diagnóstico AS-IS de Arquitectura, Flujos de Datos y Patrones — ContextForge"
collection: "engineering"
parent: "c4-model.md"
owner: "leader"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: true
last_updated: "2026-11-25"
tags: []
labels: ["architecture-as-is","clean-architecture","cqrs","design-patterns","screaming-ui","engineering"]
icon: "architecture"
---

# Diagnóstico AS-IS de Arquitectura, Flujos de Datos y Catálogo de Patrones

> [!NOTE]
> Diagnóstico forense real (*AS-IS*) de los **302 archivos Python** en `src/` y **28 plantillas HTML** en `src/presentation/frontend/` de **ContextForge (IntegrationLibrary)**.

---

## 1. Diagnóstico del Estilo Arquitectónico Implementado (AS-IS)

ContextForge implementa una **Arquitectura Híbrida Clean Architecture + Hexagonal (Puertos y Adaptadores) + CQRS Granular + Screaming Frontend**, en estado de convivencia controlada con una capa `src/core/` de transición (patrón *Strangler Fig*):

### 1.1 Organización de Directorios y Dirección de Dependencias

```text
src/
├── main.py                      # Composition Root: FastAPI Factory, Lifespan, CORS, Timing, RFC 7807, Mount /mcp
├── domain/                      # CAPA 1: Dominio Puro (12 bounded contexts, 0 dependencias de framework)
│   ├── book_registry/           # DraftBook, DocumentBlock, Attachment, BlockType
│   ├── catalog/                 # Book, Library, IBookRepository, ILibraryRepository
│   ├── chat/                    # ChatMessage, ScopedChatSession, DocumentSourceRef
│   ├── context_builder/         # ContextBundle, IBundleStorageRepository
│   ├── infrastructure_config/   # DatabaseConfiguration, StorageConfiguration (Hexagonal)
│   ├── knowledge_docs/          # Document, DocumentChunk, IDocumentRepository
│   ├── llm/                     # LLMConfiguration, LLMProvider (15), EngineType, ILLMClient
│   ├── rag_engine/              # RetrievalResult, Citation, PromptContext, IOllamaClient
│   ├── settings/                # SystemSettings, ISettingsRepository
│   ├── shared_kernel/           # Entity, ValueObject, DomainException
│   ├── social/                  # Comment, Rating, DiscussionThread, ISocialRepository
│   └── taxonomy/                # ModuleEntity, TagEntity, ITaxonomyRepository
├── application/                 # CAPA 2: Casos de Uso CQRS Granular (commands/queries/validators/handlers)
│   ├── commons/                 # Mediator, IUnitOfWork, Behaviors (Validation, Logging, Transaction)
│   ├── book_registry/           # create_book_from_blocks, save_raw_markdown, upload_attachment
│   ├── catalog/                 # get_library_catalog, get_books, update_book_status
│   ├── chat/                    # ask_project_context, ask_scoped_document, send_scoped_message, ScopedChatService
│   ├── context_bridge/          # export_agent_rules, mcp_query_context
│   ├── context_builder/         # ContextBundleCompiler
│   ├── knowledge_docs/          # IngestDocsCommand, CreateDocumentCommand, GetDocumentsQuery
│   ├── rag_engine/              # HybridSearchService (RRF k=60), PromptBuilder, AskRagQueryHandler
│   ├── settings/                # SaveLLMConfig, ActivateLLMProvider, TestLLMConnection, DiscoverCLIEngines
│   └── social/                  # add_comment, moderate_comment, get_book_comments
├── core/                        # CAPA LEGACY EN TRANSICIÓN (Strangler Fig): ProjectSlug, Blueprints, ScaffoldDocUseCase
├── infrastructure/              # CAPA 3: Adaptadores Concretos
│   ├── database/                # AsyncEngine SQLite/SQLAlchemy, auto-migraciones DDL, seed inicial
│   ├── persistence/             # ORM models desacoplados (models/*.py), DatabaseFactory + strategies
│   ├── storage/                 # StorageFactory + strategies (local_fs, supabase_storage, s3, firebase)
│   ├── repositories/            # Sql*, LocalFilesystem, ChromaVector, BM25Lexical, JsonInfraConfig, mongo/, firebase/
│   ├── external/                # llm/ (LLMFactory + strategies + CLIProcessClient + HTTP clients), extractors/ (PDF/DOCX/XLSX)
│   └── services/                # BackgroundDocsWatcher (watchdog con debounce 1.5s)
└── presentation/                # CAPA 4: Presentación Híbrida (REST v1 + MCP + Screaming UI)
    ├── api/v1/                  # 14 routers REST + RFC 7807 ProblemDetails + DI (dependencies.py)
    ├── mcp/                     # FastMCP server (SSE /mcp/sse y STDIO run_mcp.py)
    └── frontend/                # Screaming UI: Jinja2 + HTMX + Alpine.js + Tailwind v4 (8 módulos)
```

### 1.2 Estado de Evolución Arquitectónica
- **Migrado a Clean Architecture + CQRS Granular**: `book_registry`, `catalog`, `chat`, `social`, `context_bridge`, `llm`, `settings`, `taxonomy`, `infrastructure_config`.
- **Capa `src/core/` (Transición Activa)**: Mantiene `ProjectSlug`, `Project`, `blueprints.py`, `IngestDocsUseCase` y `ScaffoldDocUseCase`, consumidos desde `presentation/api/dependencies.py`. Planificada su consolidación paulatina en `src/domain/` y `src/application/`.

---

## 2. Catálogo Forense de Patrones de Diseño Detectados

| Patrón de Diseño | Categoría | Archivo / Clase Exacta | Problema que Resuelve en ContextForge |
|---|---|---|---|
| **Clean / Hexagonal (Ports & Adapters)** | Arquitectónico | `src/domain/*/repositories.py` + `src/infrastructure/` | Desacopla reglas de negocio de SQLite, ChromaDB, Ollama, APIs Cloud y CLIs. |
| **CQRS Granular** | Arquitectónico | `src/application/{mod}/commands/*`, `queries/*` | Separa lecturas y escrituras en DTOs inmutables, validadores y handlers atómicos. |
| **Factory + Strategy + Options + Registry** | Creacional / Comportamiento | `src/infrastructure/external/llm/llm_factory.py`, `database_factory.py`, `storage_factory.py` | Instancia dinámicamente 15 proveedores LLM, 4 estrategias de embeddings, 6 BD y 4 storages bajo principio Open/Closed. |
| **Repository Pattern** | Persistencia | `src/infrastructure/repositories/sql_*_repo.py`, `chroma_vector_repo.py`, `bm25_lexical_repo.py` | Abstrae consultas SQL, búsqueda vectorial, búsqueda léxica y filesystem Docs-as-Code. |
| **Unit of Work** | Persistencia | `src/application/commons/interfaces/unit_of_work.py`, `SqlAlchemyUnitOfWork` | Garantiza atomicidad transaccional sobre sesiones asíncronas de SQLAlchemy. |
| **Pipeline / Chain of Responsibility** | Comportamiento | `src/application/commons/behaviors/` (`Validation`, `Logging`, `Transaction`), `src/main.py` middlewares | Encadena validación, logging, timing (`X-Response-Time-Ms`) y captura RFC 7807. |
| **Adapter Pattern** | Estructural | `CLIProcessClient`, `GeminiHttpClient`, `AnthropicHttpClient`, `OpenAIHttpClient` | Uniformiza 15 motores heterogéneos (HTTP y procesos CLI) tras la interfaz única `ILLMClient`. |
| **Facade / Orchestrator** | Estructural | `HybridSearchService`, `ScopedChatService`, `ContextBundleCompiler` | Coordina múltiples repositorios (Chroma + BM25 + LLM) tras una fachada simple. |
| **Observer / Debounced File Watcher** | Comportamiento | `src/infrastructure/services/fs_watcher.py` (`BackgroundDocsWatcher`) | Detecta cambios en `./docs/` vía `watchdog` y dispara reindexación incremental tras debounce de `1.5s`. |
| **Zero-RAG Bypass (Adaptive Strategy)** | Dominio / IA | `src/application/chat/services/scoped_chat_service.py` | Inyecta el documento entero cuando tiene $\le 32.000$ caracteres y activa RAG focalizado cuando lo supera. |
| **RFC 7807 Problem Details** | Resiliencia / API | `src/presentation/api/middlewares/problem_details_middleware.py` | Normaliza errores de dominio y HTTP en respuestas JSON estándar RFC 7807. |
| **Threaded Subprocess Fallback** | Concurrencia / Resiliencia | `src/infrastructure/external/llm/cli_process_client.py` | Mitiga `NotImplementedError` en `SelectorEventLoop` de Windows mediante `subprocess.Popen` + `asyncio.Queue` + `call_soon_threadsafe`. |

---

## 3. Flujos de Datos Extremo a Extremo (Data Flows)

### 3.1 Flujo de Lectura RAG Streaming (SSE)
1. El usuario envía una consulta desde `chat.html` (`GET /chat/stream?q=...&project=...`).
2. `rag_chat/routes.py` resuelve `AskRagQueryHandler` mediante FastAPI DI (`get_ask_rag_handler`), que inyecta el `ILLMClient` activo desde `SqlLLMConfigRepository.get_active()`.
3. `HybridSearchService.search()` ejecuta en paralelo búsqueda vectorial (`ChromaVectorRepository`) y léxica (`BM25LexicalRepository`) estrictamente sobre `project_slug`, combinando resultados con **RRF ($k=60$)**.
4. `PromptBuilder` ensambla el contexto con citas exactas (`file_path`, `header`) y emite primero el evento SSE `event: citations`.
5. El cliente activo (`OllamaHttpClient`, `GeminiHttpClient`, `CLIProcessClient`, etc.) transmite tokens progresivamente vía `event: token` con decodificación UTF-8 incremental hasta emitir `event: done`.

### 3.2 Flujo de Escritura Docs-as-Code + Auto-Reindexación
1. El usuario guarda desde el Editor Dual (`POST /api/v1/books/save` o `POST /docs/new`).
2. `LocalFilesystemRepository` escribe el archivo `.md` con frontmatter YAML en `./docs/{project_slug}/{module}/{slug}.md` (única fuente de verdad).
3. `IngestDocsCommandHandler` (y en segundo plano `BackgroundDocsWatcher`) trocea el documento por encabezados `h1`–`h6`, extrae anexos vinculados (PDF/DOCX/XLSX) y actualiza atómicamente ChromaDB (`cf_project_{slug}`) y BM25Plus.
4. `SqlBookRepository` actualiza los metadatos de catálogo en SQLite (`books`).
