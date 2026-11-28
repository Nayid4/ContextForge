# 📝 Desglose de Tareas de Implementación: ContextForge (Fase 3: tasks.md)

> **Proyecto:** ContextForge — Local Knowledge RAG & Context Builder  
> **Rol:** Principal Software Architect & Senior Full-Stack Engineer  
> **Versión:** 1.0.0 (Work Breakdown Structure)  
> **Estado:** Aprobado para Ejecución  
> **Metodología:** Spec-Driven Development (SDD) — Fase 3  

---

## 1. Visión General del Desglose de Tareas

Las tareas están organizadas de forma atómica y estrictamente secuencial siguiendo los principios de **Clean Architecture**, **Screaming Architecture** y **TDD (Test-Driven Development)**:
1. **Épica 1:** Setup de Dependencias y Dominio Core (Modelos puros, Value Objects, Domain Events).
2. **Épica 2:** Infraestructura y Adaptadores (ChromaDB, Ollama HTTP, FileSystem, SQLite Event Store, y sus equivalentes en memoria para TDD).
3. **Épica 3:** Aplicación, CQRS y Casos de Uso (AST Parser, Semantic Chunker, RRF Hybrid Search, PromptBuilder, Context Bundler, UoW).
4. **Épica 4:** Capa de Presentación (FastAPI Endpoints, SSE Streaming, Middlewares RFC 7807 y Entra ID).
5. **Épica 5:** Interfaz de Usuario SSR (Jinja2, TailwindCSS v4, Preline UI, HTMX SSE).
6. **Épica 6:** Suite de Pruebas Automatizadas y Documentación Demo Docs-as-Code.

---

## 2. Matriz Detallada de Tareas

### Épica 1: Setup del Proyecto y Dominio Core (Pure Domain Layer)

- [x] **T-1.1: Configuración de Dependencias del Proyecto**
  - Configurar `pyproject.toml` con Python 3.11+.
  - Dependencias core: `fastapi`, `uvicorn[standard]`, `jinja2`, `python-multipart`, `chromadb`, `rank-bm25`, `httpx`, `pydantic>=2.0`, `pydantic-settings`, `tiktoken`, `python-frontmatter`, `marko`, `aiosqlite`.
  - Dependencias de desarrollo/QA: `pytest`, `pytest-asyncio`, `pytest-cov`, `mypy`.
  - Configurar `mypy` en modo estricto (`strict = true`).

- [x] **T-1.2: Shared Kernel (Dominio Base y Excepciones)**
  - Implementar `Entity` base y `DomainEvent` base inmutables (`dataclass(frozen=True)`).
  - Implementar Value Objects: `FilePath`, `TokenCount`, `RelevanceScore`.
  - Implementar excepciones base tipadas de dominio (`DomainException`, `EntityNotFoundException`, `ExternalServiceException`).
  - Unit tests para validación de value objects y contratos de excepciones.

- [x] **T-1.3: Subdominio `markdown_ingestion` (Dominio)**
  - Definir entidades: `MarkdownDocument`, `DocumentChunk`, `FrontmatterMetadata`.
  - Definir eventos de dominio: `DocumentDiscovered`, `DocumentIngested`, `DocumentParseFailed`.
  - Definir interfaz: `IDocumentFileSystemRepository` (Protocol asíncrono).
  - Unit tests para validación de invariantes de `MarkdownDocument` y `DocumentChunk`.

- [x] **T-1.4: Subdominio `rag_engine` (Dominio)**
  - Definir entidades y value objects: `VectorEmbedding`, `RetrievalResult`, `Citation`, `PromptContext`.
  - Definir eventos de dominio: `ChunkIndexed`, `QueryExecuted`, `KnowledgeGapIdentified`.
  - Definir interfaces de repositorio y servicios: `IVectorRepository`, `ILexicalIndexRepository`, `IOllamaClient`.
  - Unit tests para estructuras de citas y resultados de recuperación.

- [x] **T-1.5: Subdominio `context_builder` (Dominio)**
  - Definir entidades: `ContextBundle`, `BundleSpecification`, `TokenBudget`.
  - Definir eventos de dominio: `ContextBundleGenerated`, `TokenBudgetExceeded`.
  - Definir interfaz: `IBundleStorageRepository`.
  - Unit tests para cálculo de presupuesto y límites de tokens.

- [x] **T-1.6: Subdominio `knowledge_governance` (Dominio)**
  - Definir entidades: `StoredEvent`, `AuditLog`, `KnowledgeGapMetric`.
  - Definir interfaz: `IEventStoreRepository`.
  - Unit tests para serialización de eventos de dominio inmutables.

---

### Épica 2: Infraestructura y Adaptadores (Infrastructure Layer)

- [x] **T-2.1: Adaptador de FileSystem para Markdown**
  - Implementar `LocalFileSystemRepository` operando asíncronamente con `pathlib` y `aiofiles`.
  - Implementar `InMemoryFileSystemRepository` para aislamiento de tests unitarios.
  - Test de integración verificando lectura de archivos y listado recursivo de directorios.

- [x] **T-2.2: Adaptador de Base Vectorial (ChromaDB)**
  - Implementar `ChromaVectorRepository` utilizando `chromadb.PersistentClient` en ruta local `./data/chroma`.
  - Implementar `InMemoryVectorRepository` utilizando colecciones efímeras para tests TDD.
  - Tests unitarios y de integración para upsert, búsqueda por similitud coseno y borrado por documento.

- [x] **T-2.3: Adaptador de Búsqueda Léxica (BM25)**
  - Implementar `LexicalIndexRepository` utilizando `rank-bm25` (tokenización de código y texto).
  - Implementar `InMemoryLexicalRepository` con soporte para reset y reindexación.
  - Tests para concordancia exacta de identificadores técnicos (`ERR_GATEWAY_TIMEOUT`, nombres de variables).

- [x] **T-2.4: Cliente Local de Ollama (HTTP Asíncrono)**
  - Implementar `OllamaHttpClient` con `httpx.AsyncClient` para:
    - `/api/embeddings` con batching.
    - `/api/chat` con streaming asíncrono línea a línea.
  - Implementar `MockOllamaClient` para emular embeddings deterministas y streaming sin requerir Ollama encendido.
  - Tests de timeout y manejo de error cuando el servicio local está apagado.

- [x] **T-2.5: Almacén de Eventos de Gobernanza (SQLite Event Store)**
  - Implementar `SQLiteEventStore` usando `aiosqlite` con schema append-only (`domain_events`).
  - Implementar `InMemoryEventStore` para tests.
  - Tests unitarios verificando inmutabilidad, orden cronológico y consulta de proyecciones.

---

### Épica 3: Capa de Aplicación, CQRS y Casos de Uso (Application Layer)

- [x] **T-3.1: Parser AST de Markdown y Semantic Chunker**
  - Implementar `MarkdownASTParser`: extracción de frontmatter con `python-frontmatter` y jerarquía con `marko`.
  - Implementar `SemanticChunker`: división por encabezados H1/H2/H3 con regla de bloques de código cercados indivisibles y cálculo de tokens con `tiktoken`.
  - Tests unitarios validando que ningún bloque ```python ``` sea dividido a la mitad.

- [x] **T-3.2: Implementación de Unit of Work (UoW)**
  - Implementar `UnitOfWork` que coordine `ChromaVectorRepository`, `LexicalIndexRepository` y `EventStore`.
  - Manejo de contexto asíncrono (`async with uow:`) con rollback en caso de fallo durante embeddings.
  - Tests unitarios de consistencia transaccional.

- [x] **T-3.3: Comando `IngestDirectoryCommand` + Handler**
  - Implementar comando y DTOs de entrada/salida.
  - Implementar `IngestDirectoryCommandHandler`: orquesta escaneo, chunking AST, generación de embeddings en batch e indexación dual (Chroma + BM25).
  - Emisión de eventos `DocumentIngested` y `ChunkIndexed`.
  - Tests con fixtures de documentación Markdown reales y mockeadas.

- [x] **T-3.4: Servicio de Búsqueda Híbrida (Reciprocal Rank Fusion - RRF)**
  - Implementar `HybridSearchService` combinando `search_dense` y `search_lexical` con la fórmula RRF (\(k=60\), pesos \(0.6/0.4\)).
  - Tests unitarios comprobando que identificadores exactos y similitudes semánticas puntúen en el top del ranking fusionado.

- [x] **T-3.5: Servicio `PromptBuilder` con Grounding Estricto**
  - Implementar `PromptBuilder` con system prompt que prohíbe alucinaciones y exige citas exactas `[archivo.md]`.
  - Implementar poda descendente por score RRF en caso de que los chunks superen la ventana de contexto del LLM.
  - Tests unitarios comprobando la inyección adecuada de chunks y advertencias de tamaño.

- [x] **T-3.6: Query `AskRagQuery` + Handler (Streaming & Knowledge Gap)**
  - Implementar `AskRagQuery` y `AskRagQueryHandler`.
  - Orquestación: Búsqueda híbrida -> Evaluación de umbral (\(< 0.35\) emite `KnowledgeGapIdentified` y fallback) -> Inferencia streaming vía Ollama.
  - Tests comprobando el flujo completo de fallback y generación normal con citas.

- [x] **T-3.7: Comando `BuildContextBundleCommand` + Handler**
  - Implementar `TokenOptimizer` (algoritmo greedy para empaquetado bajo presupuesto).
  - Implementar `BundleCompiler`: ensambla `context_bundle_<module>.md` con tabla de contenidos, directrices para el IDE y metadatos.
  - Persistencia dual: guarda en disco (`./bundles/`) y genera buffer descargable.
  - Tests unitarios de empaquetado y control de límite de tokens.

- [x] **T-3.8: Query `GetKnowledgeAuditQuery` + Handler**
  - Implementar consulta agregada sobre el Event Store para listar preguntas sin respuesta y frecuencia.
  - Tests unitarios sobre proyecciones de eventos.

---

### Épica 4: Capa de Presentación (APIs REST, Middlewares, DI)

- [x] **T-4.1: Modelo y Middleware RFC 7807 (Problem Details)**
  - Implementar modelo Pydantic `ProblemDetails` (`type`, `title`, `status`, `detail`, `instance`, `code`, `invalid_params`).
  - Implementar `ProblemDetailsMiddleware` capturando `DomainException` y errores imprevistos 500, respondiendo con `application/problem+json`.
  - Tests de integración de respuestas de error.

- [x] **T-4.2: Middlewares de Rendimiento y Autenticación**
  - Implementar `TimingMiddleware` agregando cabecera `X-Response-Time-Ms`.
  - Implementar `EntraIdAuthMiddleware` para validar Bearer Tokens con flag de soporte `AUTH_DEV_BYPASS=true` para desarrollo local.
  - Tests unitarios de middleware.

- [x] **T-4.3: Contenedor e Inyección de Dependencias (FastAPI `Depends`)**
  - Crear `dependencies.py` con factorías que resuelvan repositorios, UoW y casos de uso leyendo variables de configuración (`config.py`).
  - Capacidad de sobrescritura de dependencias en `app.dependency_overrides` para tests.

- [x] **T-4.4: Endpoints REST API v1**
  - Implementar rutas:
    - `POST /api/v1/ingest/directory`: Inicia ingesta e indexación.
    - `GET /api/v1/search/hybrid`: Búsqueda instantánea con RRF.
    - `POST /api/v1/bundles/export`: Genera y descarga Context Bundle.
    - `GET /api/v1/governance/audit`: Consulta auditoría y vacíos de conocimiento.
  - Tests E2E con `httpx.AsyncClient`.

- [x] **T-4.5: Endpoint SSE de Streaming para Chat RAG**
  - Implementar `POST /api/v1/rag/ask`: Inicia sesión de consulta.
  - Implementar `GET /api/v1/rag/stream/{session_id}`: Transmite tokens en formato `text/event-stream` compatible con la extensión `hx-sse` de HTMX.
  - Tests E2E de streaming SSE.

---

### Épica 5: Frontend e Interfaz de Usuario SSR (Jinja2, Tailwind v4, Preline, HTMX)

- [x] **T-5.1: Plantilla Base y Layout Principal**
  - Crear `base.html` con CDN de TailwindCSS v4, Preline UI y HTMX (`htmx.min.js` + `ext/sse.js`).
  - Sidebar con navegación responsiva (Chat RAG, Buscador, Bundler, Métricas).

- [x] **T-5.2: Vista de Chat RAG Reactivo**
  - Crear `chat.html` con contenedor de conversación.
  - Implementar partial `chat_message.html` para renderizar burbujas de usuario y asistente.
  - Integrar HTMX SSE: formulario con `hx-post` conectando al streaming en tiempo real y partial `citation_pill.html` para mostrar fuentes interactivas.

- [x] **T-5.3: Explorador de Documentación (Doc Browser)**
  - Crear `browser.html` con árbol de navegación de archivos y visor de Markdown renderizado.
  - Integrar búsqueda rápida con debounce de 300ms vía HTMX (`hx-get="/api/v1/search/preview"`).

- [x] **T-5.4: Modal y Generador de Context Bundles**
  - Crear `bundles.html` con selección de módulos mediante checkboxes y slider de presupuesto de tokens.
  - Botón de exportación que dispara descarga directa y notificación toast mediante componentes Preline UI.

- [x] **T-5.5: Tablero de Gobernanza y Knowledge Gaps**
  - Crear `governance.html` mostrando tabla de preguntas no resueltas para que los líderes técnicos identifiquen vacíos documentales.

---

### Épica 6: Documentación Semilla, Verificación Integral y QA

- [x] **T-6.1: Directorio Semilla de Documentación (`docs/`)**
  - Crear ejemplos representativos de Docs-as-Code:
    - `docs/modules/billing/retry_policy.md` (con frontmatter y código Python).
    - `docs/architecture/adrs/001_event_driven_payments.md`.
    - `docs/troubleshooting/stripe_webhook_timeout.md`.

- [x] **T-6.2: Verificación de Cobertura y Quality Gates**
  - Ejecutar `mypy --strict src/` asegurando 0 errores de tipado.
  - Ejecutar `pytest --cov=src` asegurando cobertura \(\ge 85\%\).
  - Verificar tiempo de primer token (\(\le 2.0\) segundos) y búsqueda híbrida (\(\le 150\) ms).

