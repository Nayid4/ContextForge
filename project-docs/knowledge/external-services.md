---
id: "DOC-EXTERNAL-SERVICES_MD"
title: "Servicios Externos, Proveedores LLM y Contratos API/MCP — ContextForge"
collection: "engineering"
parent: "c4-model.md"
owner: "spec-author"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-25"
tags: []
labels: ["external-services","api-contracts","mcp","multi-llm","rfc-7807","engineering"]
icon: "link"
---

# Servicios Externos, Contratos API REST v1 y Servidor MCP

> [!NOTE]
> Catálogo completo de integraciones externas, 15 motores LLM soportados, estrategias de embeddings, adaptadores de persistencia/almacenamiento y contratos HTTP/MCP verificados en el repositorio.

---

## 1. Catálogo de Proveedores LLM y Embeddings (`LLMFactory`)

| Categoría (`EngineType`) | Proveedor (`LLMProvider`) | Protocolo / Binario | Modelo por Defecto | Estrategia en `LLMFactory` |
|---|---|---|---|---|
| `local_http` | `ollama`, `ollama_http` | HTTP (`localhost:11434`) | `llama3.1:8b` | `OllamaLLMStrategy` |
| `local_http` | `lm_studio` | OpenAI-Compat (`localhost:1234/v1`) | Configurable | `OpenAICompatibleLLMStrategy` |
| `local_http` | `vllm` | OpenAI-Compat (`localhost:8000/v1`) | `Qwen/Qwen3-Coder-30B-A3B-Instruct` | `OpenAICompatibleLLMStrategy` |
| `local_http` | `localai` | OpenAI-Compat (`localhost:8080/v1`) | `llama-3.1-8b-instruct` | `OpenAICompatibleLLMStrategy` |
| `cloud_api` | `gemini` | HTTPS (`generativelanguage.googleapis.com/v1beta`) | `gemini-2.5-flash` | `GeminiLLMStrategy` |
| `cloud_api` | `openai` | HTTPS (`api.openai.com/v1`) | `gpt-4o-mini` | `OpenAICloudLLMStrategy` |
| `cloud_api` | `anthropic` | HTTPS (`api.anthropic.com/v1`) | `claude-sonnet-4-5` | `AnthropicLLMStrategy` |
| `cloud_api` | `deepseek` | HTTPS (`api.deepseek.com`) | `deepseek-chat` | `DeepSeekLLMStrategy` |
| `local_cli` | `antigravity_cli` | Subproceso `agy` (`--dangerously-skip-permissions -p=...`) | `gemini-3.8-flash` | `CliLLMStrategy` |
| `local_cli` | `claude_code_cli` | Subproceso `claude` (`--output-format text -p ...`) | `claude-sonnet-4-5` | `CliLLMStrategy` |
| `local_cli` | `open_code_cli` | Subproceso `opencode` (`run --model ...`) | `anthropic/claude-sonnet-4-5` | `CliLLMStrategy` |
| `local_cli` | `codex_cli` | Subproceso `codex` (`-p ...`) | `gpt-5.4` | `CliLLMStrategy` |
| `local_cli` | `gemini_cli` | Subproceso `gemini` (`-p ...`) | `gemini-2.5-pro` | `CliLLMStrategy` |
| `local_cli` | `aider_cli` | Subproceso `aider` (`--message ...`) | `qwen2.5-coder` | `CliLLMStrategy` |
| `local_cli` | `ollama_cli` | Subproceso `ollama` (`run <model> ...`) | `llama3.1:8b` | `CliLLMStrategy` |

### Estrategias de Embeddings (`_EMBEDDING_STRATEGIES`)
- `ollama` (`OllamaEmbeddingStrategy` — `nomic-embed-text`)
- `gemini` (`GeminiEmbeddingStrategy`)
- `openai`, `lm_studio`, `localai` (`OpenAICompatibleEmbeddingStrategy`)
- `voyage`, `anthropic` (`AnthropicVoyageEmbeddingStrategy` — variable opcional `VOYAGE_API_KEY`)

---

## 2. Contratos REST API v1 (`src/presentation/api/v1/`)

Todos los errores de dominio y validación retornan respuestas normalizadas bajo **RFC 7807 (`application/problem+json`)** y cabecera de telemetría `X-Response-Time-Ms`.

| Grupo | Endpoints Principales |
|---|---|
| **Knowledge Docs** | `GET /api/v1/docs-api`, `GET /api/v1/docs-api/{path}`, `POST /api/v1/docs-api`, `POST /api/v1/docs-api/ingest` |
| **Book Registry & Assets** | `POST /api/v1/books/save`, `POST /api/v1/books/parse-markdown`, `POST /api/v1/books/compile-blocks`, `POST /api/v1/books/upload-attachment`, `GET /api/v1/assets/{path}` |
| **Scaffolding IA** | `GET /api/v1/docs/templates`, `POST /api/v1/docs/scaffold-ai` |
| **RAG & Search** | `GET /api/v1/search/hybrid`, `POST /api/v1/rag/ask`, `GET /api/v1/rag/stream`, `GET /chat/stream` |
| **Scoped & Project Chat** | `POST /api/v1/chat/scoped`, `POST /api/v1/chat/messages`, `GET /api/v1/chat/session/{session_id}`, `POST /api/v1/chat/project` |
| **Multi-LLM Settings** | `GET /api/v1/settings/llm`, `POST /api/v1/settings/llm`, `POST /api/v1/settings/llm/activate`, `POST /api/v1/settings/llm/test`, `POST /api/v1/settings/llm/test-embedding`, `GET /api/v1/settings/llm/discover-cli` |
| **Infraestructura & Settings** | `GET/POST /api/v1/settings`, `GET /api/v1/settings/ollama-models`, `GET /api/v1/settings/infrastructure`, `POST /api/v1/settings/database/{activate\|test}`, `POST /api/v1/settings/storage/{activate\|test}` |
| **Catalog & Taxonomy** | `GET /api/v1/catalog/libraries`, `GET /api/v1/catalog/books`, `PATCH /api/v1/catalog/books/{book_id}/status`, `GET/POST /api/v1/taxonomy/modules`, `GET/POST /api/v1/taxonomy/tags` |
| **Context Bundles** | `POST /api/v1/bundles/export`, `GET /api/v1/bundles/{bundle_id}/download`, `POST /api/v1/bundles/export-agent-rules` |
| **Social** | `POST /api/v1/social/comments`, `GET /api/v1/social/comments`, `DELETE /api/v1/social/comments/{comment_id}` |
| **Integraciones & Salud** | `GET /health`, `GET /api/v1/integrations/postman-collection`, `GET /api/v1/integrations/widget.js` |

---

## 3. Contrato del Servidor Universal MCP (`FastMCP`)

- **Protocolo**: JSON-RPC 2.0 (`protocolVersion: "2024-11-05"`), nombre `ContextForge-Knowledge-Hub`.
- **Transportes**:
  1. **SSE HTTP**: `GET /mcp/info`, `GET /mcp/sse`, `POST /mcp/messages?session_id={id}`.
  2. **STDIO Local**: `python run_mcp.py` para Cursor, Claude Code y Antigravity.
- **Herramientas Registradas**:
  - `search_project_context(query: str, project_slug: str = "default", top_k: int = 5)`
  - `get_document_full(doc_path: str, project_slug: str = "default")`
  - `list_project_structure(project_slug: str = "default")`
