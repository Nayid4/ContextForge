---
id: "DOC-C4-MODEL_MD"
title: "Atlas de Arquitectura C4 (C1 Contexto, C2 Contenedores, C3 Componentes, C4 Despliegue)"
collection: "engineering"
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
labels: ["c4-model","architecture","system-design","engineering"]
icon: "architecture"
---

# Atlas de Arquitectura C4 — ContextForge (IntegrationLibrary)

> [!NOTE]
> Modelado arquitectónico multinivel (C1 a C4) conforme a Simon Brown (C4 Model) e IEEE 830 Sección 2.1, reflejando con fidelidad el código fuente en `src/`.

---

## Nivel 1: Diagrama de Contexto de Sistema (C1)

Muestra los límites de **ContextForge**, los actores humanos y agentes de IA, y los sistemas externos con los que interactúa:

```mermaid
flowchart TD
  actorDev(["Desarrollador / Arquitecto de Software"])
  actorQa(["QA / Ingeniero de Integración"])
  actorIde(["IDE / Agente IA (Cursor, Antigravity, Claude Code)"])

  sysContextForge["ContextForge Platform<br/>(Docs-as-Code, RAG Híbrido & MCP Hub)"]

  extOllama[["Ollama / LM Studio / vLLM<br/>(Inferencia Local HTTP)"]]
  extCli[["Agentes CLI Locales<br/>(agy, claude, opencode, codex)"]]
  extCloud[["APIs Cloud Opcionales<br/>(Gemini, OpenAI, Anthropic, DeepSeek)"]]
  extFs[("Sistema de Archivos Local<br/>(./docs/ Markdown & Anexos)")]

  actorDev -->|"Autoría Dual, Chat RAG y Bundler (HTTP/HTML)"| sysContextForge
  actorQa -->|"Consulta API Docs y Colección Postman (REST)"| sysContextForge
  actorIde -->|"Consultas JSON-RPC 2.0 (MCP SSE / STDIO)"| sysContextForge
  sysContextForge -->|"Lee y sincroniza única fuente de verdad"| extFs
  sysContextForge -->|"Inferencia y embeddings locales"| extOllama
  sysContextForge -->|"Ejecución subproceso sin shell=True"| extCli
  sysContextForge -->|"Inferencia remota opcional HTTPS"| extCloud
```

---

## Nivel 2: Diagrama de Contenedores (C2)

Descompone **ContextForge** en sus contenedores de ejecución, motores de persistencia y protocolos reales:

```mermaid
flowchart TD
  browserClient(["Navegador Web<br/>(HTMX + Alpine.js + Tailwind v4)"])
  mcpClient(["Cliente MCP / IDE<br/>(SSE o STDIO)"])

  subgraph ContextForgeApp["Proceso ASGI FastAPI + Uvicorn (Puerto 8000)"]
    contWebUi["Screaming Frontend SSR<br/>(Jinja2 Templates + Light/Dark Mode)"]
    contRestApi["REST API v1<br/>(14 Routers + RFC 7807 ProblemDetails)"]
    contMcp["FastMCP Sub-App<br/>(/mcp/sse, /mcp/messages, run_mcp.py)"]
    contRag["Motor RAG Híbrido<br/>(HybridSearchService RRF k=60 + ScopedChat)"]
    contLlm["Orquestador Multi-LLM<br/>(LLMFactory + 15 Proveedores + CLIProcessClient)"]
    contWatcher[["BackgroundDocsWatcher<br/>(watchdog debounce 1.5s)"]]
  end

  dbSqlite[("SQLite Async WAL<br/>(./data/contextforge.db - 12 tablas)")]
  dbChroma[("ChromaDB Persistente<br/>(./data/chroma - cf_project_{slug})")]
  idxBm25[("Índice Léxico BM25Plus<br/>(En memoria particionado por slug)")]
  fsDocs[("Repositorio Docs-as-Code<br/>(./docs/{project_slug}/)")]

  browserClient -->|"HTTP / HTMX / SSE"| contWebUi
  browserClient -->|"JSON / Multipart"| contRestApi
  mcpClient -->|"JSON-RPC 2.0"| contMcp
  contWebUi --> contRag
  contRestApi --> contRag
  contMcp --> contRag
  contRag --> contLlm
  contRag --> dbChroma
  contRag --> idxBm25
  contRestApi --> dbSqlite
  contRestApi --> fsDocs
  contWatcher -->|"Auto-reindexa"| dbChroma
  contWatcher -->|"Auto-reindexa"| idxBm25
  contWatcher -->|"Observa"| fsDocs
```

---

## Nivel 3: Diagrama de Componentes Internos (C3)

Desglose de las 4 capas de **Clean Architecture** dentro de `src/`:

```mermaid
flowchart TD
  subgraph PresentationLayer["Capa de Presentación (src/presentation/)"]
    mwTiming{{"Timing & CORS Middleware"}}
    mwProblem{{"RFC 7807 ProblemDetails Handler"}}
    apiRouters["14 Routers REST v1<br/>(docs, rag, chat, llm_settings, bundles, taxonomy, social)"]
    mcpServer["FastMCP Server<br/>(search_project_context, get_document_full, list_project_structure)"]
    uiModules["8 Módulos Screaming UI<br/>(knowledge_docs, rag_chat, settings, projects, context_bundler)"]
  end

  subgraph ApplicationLayer["Capa de Aplicación CQRS (src/application/)"]
    cqrsHandlers["Command & Query Handlers Granulares"]
    svcHybrid["HybridSearchService (RRF k=60)"]
    svcScoped["ScopedChatService (Zero-RAG Bypass <=32k)"]
    svcBundler["ContextBundleCompiler (.cursorrules/.md)"]
  end

  subgraph DomainLayer["Capa de Dominio Puro (src/domain/)"]
    domEntities["Entidades & Value Objects<br/>(Document, ProjectSlug, LLMConfiguration, Book, Comment)"]
    domPorts["Puertos / Protocolos<br/>(ILLMClient, IDocumentRepository, IVectorRepository)"]
  end

  subgraph InfraLayer["Capa de Infraestructura (src/infrastructure/)"]
    facLlm["LLMFactory (Strategy + Options + Registry)"]
    facDb["DatabaseFactory & StorageFactory"]
    repoSql["Repositorios SQLAlchemy Async (12 modelos ORM)"]
    repoFs["LocalFilesystemRepository + Extractors (PDF/DOCX/XLSX)"]
    repoSearch["ChromaVectorRepository & BM25LexicalRepository"]
  end

  mwTiming --> mwProblem
  mwProblem --> apiRouters
  mwProblem --> uiModules
  apiRouters --> cqrsHandlers
  mcpServer --> svcHybrid
  uiModules --> cqrsHandlers
  cqrsHandlers --> svcHybrid
  cqrsHandlers --> svcScoped
  cqrsHandlers --> svcBundler
  cqrsHandlers --> domPorts
  domPorts -.->|"Implementado por"| facLlm
  domPorts -.->|"Implementado por"| repoSql
  domPorts -.->|"Implementado por"| repoFs
  domPorts -.->|"Implementado por"| repoSearch
  repoSql --> facDb
```

---

## Nivel 4: Topología de Despliegue e Infraestructura (C4)

```mermaid
flowchart LR
  subgraph HostOS["Host Local / On-Premise (Windows / Linux / macOS)"]
    procUvicorn[["Uvicorn ASGI Server<br/>127.0.0.1:8000 (Python >=3.11)"]]
    procMcp[["run_mcp.py (STDIO)<br/>Invocado por IDE Local"]]
    procCli[["Binarios CLI Locales<br/>(agy.EXE, claude, opencode)"]]
    procOllama[["Daemon Ollama<br/>localhost:11434"]]
    volData[("Volumen Local ./data/<br/>contextforge.db + chroma/")]
    volDocs[("Volumen Local ./docs/<br/>Markdown + Anexos")]
    volBundles[("Volumen Local ./bundles/<br/>.cursorrules / .md")]
  end

  procUvicorn --> volData
  procUvicorn --> volDocs
  procUvicorn --> volBundles
  procUvicorn --> procOllama
  procUvicorn --> procCli
  procMcp --> volData
  procMcp --> volDocs
```
