---
id: "DOC-UML-DIAGRAMS_MD"
title: "Atlas UML 2.5: Clases, Secuencias, Estados, Casos de Uso y Actividades"
collection: "engineering"
parent: "c4-model.md"
owner: "spec-author"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: true
last_updated: "2026-11-25"
tags: []
labels: ["uml-2.5","class-diagram","sequence-diagram","state-diagram","engineering"]
icon: "layers"
---

# Atlas UML 2.5 — ContextForge (IntegrationLibrary)

> [!NOTE]
> Modelado conductual y estructural UML 2.5 verificado directamente contra las entidades en `src/domain/`, los handlers CQRS en `src/application/` y los adaptadores en `src/infrastructure/`.

---

## 1. Diagrama de Clases del Dominio ContextForge

```mermaid
classDiagram
  class Project {
    +ProjectSlug slug
    +string name
    +string description
    +string path
    +bool is_active
    +datetime created_at
    +to_dict() dict
  }

  class Document {
    +string path
    +string title
    +string module
    +string project_slug
    +string content_markdown
    +List~string~ tags
    +List~DocumentChunk~ chunks
  }

  class DocumentChunk {
    +string chunk_id
    +string doc_path
    +string project_slug
    +string header
    +string header_level
    +string content
  }

  class LLMConfiguration {
    +LLMProvider provider
    +EngineType engine_type
    +string name
    +string api_key
    +string base_url
    +string default_model
    +string cli_command
    +string cli_args
    +bool is_active
    +float temperature
    +int max_tokens
    +mask_api_key() string
  }

  class ILLMClient {
    <<interface>>
    +generate(prompt, system, model) string
    +stream_generate(prompt, system, model) AsyncGenerator
    +stream_chat(model, messages, system_prompt) AsyncGenerator
    +test_connection() tuple
  }

  class ScopedChatSession {
    +string session_id
    +string book_id
    +string library_id
    +List~ChatMessage~ messages
  }

  class ContextBundle {
    +string bundle_id
    +string project_slug
    +string format
    +string file_path
    +int token_count
  }

  Project "1" --> "*" Document : "aisla"
  Document "1" *-- "*" DocumentChunk : "compone"
  Document "1" --> "*" ScopedChatSession : "contextualiza"
  Project "1" --> "*" ContextBundle : "compila"
  LLMConfiguration "1" ..> "1" ILLMClient : "instancia via LLMFactory"
```

---

## 2. Diagrama de Secuencia: Ciclo de Consulta RAG Híbrido y Streaming SSE

```mermaid
sequenceDiagram
  autonumber
  actor User as "Desarrollador"
  participant ChatUI as "chat.html (EventSource)"
  participant Route as "rag_chat/routes.py"
  participant Handler as "AskRagQueryHandler"
  participant Hybrid as "HybridSearchService"
  participant Chroma as "ChromaDB (cf_project_{slug})"
  participant BM25 as "BM25LexicalRepository"
  participant Client as "ILLMClient Activo"

  User->>ChatUI: "Envía pregunta técnica"
  ChatUI->>Route: "GET /chat/stream?q=...&project={slug}"
  Route->>Handler: "prepare_context(AskRagQuery)"
  Handler->>Hybrid: "search(query, project_slug, top_k)"
  par Recuperación Vectorial y Léxica
    Hybrid->>Chroma: "query_similar(project_slug)"
    Hybrid->>BM25: "search_lexical(project_slug)"
  end
  Chroma-->>Hybrid: "Top-K semánticos"
  BM25-->>Hybrid: "Top-K léxicos"
  Hybrid-->>Handler: "Chunks fusionados con RRF (k=60)"
  Route-->>ChatUI: "event: citations (pills de archivos fuente)"
  Route->>Client: "stream_chat(model, messages, SYSTEM_PROMPT)"
  loop Por cada chunk UTF-8
    Client-->>Route: "token decodificado incrementalmente"
    Route-->>ChatUI: "event: token"
  end
  Route-->>ChatUI: "event: done"
```

---

## 3. Diagrama de Secuencia: Scoped Chat con Zero-RAG Bypass

```mermaid
sequenceDiagram
  autonumber
  actor User as "Desarrollador"
  participant API as "chat_router.py (/api/v1/chat/scoped)"
  participant Service as "ScopedChatService"
  participant Vector as "ChromaVectorRepository"
  participant LLM as "ILLMClient Activo"

  User->>API: "POST /api/v1/chat/scoped (raw_markdown, query, history)"
  API->>Service: "answer_question(library_id, book_id, raw_markdown, query)"
  alt len(raw_markdown) <= 32000 y no vacío
    Service->>LLM: "generate(documento completo + historial + query)"
    LLM-->>Service: "Respuesta con fuente Documento Completo"
  else Documento extenso (>32000) o vacío
    Service->>Vector: "search_scoped(library_id, book_id, query, limit=5)"
    Vector-->>Service: "Chunks del documento y anexos PDF/DOCX/XLSX"
    Service->>LLM: "generate(chunks focalizados + query)"
    LLM-->>Service: "Respuesta con citas de página/sección"
  end
  Service-->>API: "answer + sources[]"
  API-->>User: "200 OK JSON"
```

---

## 4. Diagrama de Máquina de Estados: Ciclo de Vida de un Documento (`Book`)

```mermaid
stateDiagram-v2
  [*] --> Draft : "Crear en Editor Dual / Scaffold IA"
  Draft --> Draft : "Guardar borrador / Adjuntar anexos"
  Draft --> Published : "[PATCH /api/v1/catalog/books/{id}/status]"
  Published --> Published : "Editar Markdown + Auto-reindexación watchdog"
  Published --> Archived : "[Archivar documento obsoleto]"
  Archived --> Draft : "[Restaurar para revisión]"
```

---

## 5. Diagrama de Casos de Uso UML

```mermaid
flowchart TD
  actorDev(["Desarrollador / Arquitecto"])
  actorIde(["Agente IA / IDE MCP"])
  actorQa(["Ingeniero QA"])

  subgraph ContextForgeUseCases["Casos de Uso de ContextForge"]
    ucAuthDoc(["Autoría Dual Markdown / Bloques"])
    ucAttach(["Adjuntar y Previsualizar PDF/DOCX/XLSX/Audio"])
    ucRag(["Consultar Chat RAG Híbrido con Citas"])
    ucScoped(["Consultar Copiloto Focalizado Zero-RAG"])
    ucConfigLlm(["Configurar y Activar Motor LLM (15 proveedores)"])
    ucBundle(["Compilar Context Bundle .cursorrules"])
    ucMcp(["Invocar Herramientas MCP (SSE / STDIO)"])
    ucPostman(["Descargar Colección Postman y Widget JS"])
  end

  actorDev --> ucAuthDoc
  actorDev --> ucAttach
  actorDev --> ucRag
  actorDev --> ucScoped
  actorDev --> ucConfigLlm
  actorDev --> ucBundle
  actorIde --> ucMcp
  actorQa --> ucPostman
```
