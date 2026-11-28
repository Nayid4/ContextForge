---
id: "DOC-ADR-CATALOG_MD"
title: "Catálogo Histórico de Decisiones de Arquitectura (ADRs) — ContextForge"
collection: "general"
parent: "01-project-overview-and-business.md"
owner: "leader"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-25"
tags: []
labels: ["adr","architecture-decisions","governance","general"]
icon: "fileText"
---

# Catálogo Consolidado de Decisiones de Arquitectura (ADRs)

| ID | Título | Estado | Decisión Clave | Consecuencia Principal |
|---|---|---|---|---|
| `ADR-001` | **Markdown Docs-as-Code como Única Fuente de Verdad** | Aceptado | Persistir todo documento en `./docs/{project_slug}/{module}/*.md` y usar SQLite únicamente para metadatos, catálogo, chat y configuración. | Portabilidad total con Git y cero vendor lock-in documental. |
| `ADR-002` | **Clean Architecture + CQRS Granular + Screaming UI** | Aceptado | Separar estrictamente `domain/`, `application/`, `infrastructure/` y `presentation/` con SSR Jinja2 + HTMX + Alpine.js + Tailwind v4. | Alta testabilidad (`158` tests), `mypy --strict` con 0 errores y cero sobrecarga de SPA. |
| `ADR-003` | **Motor RAG Híbrido (ChromaDB + BM25Plus) con RRF $k=60$** | Aceptado | Combinar búsqueda semántica y léxica particionadas por `project_slug` mediante *Reciprocal Rank Fusion*. | Alta precisión tanto en consultas conceptuales como en identificadores exactos (`BR-*`, códigos). |
| `ADR-004` | **Zero-RAG Bypass ($\le 32.000$ caracteres) en Scoped Chat** | Aceptado | Inyectar el documento íntegro al LLM cuando su tamaño es $\le 32\text{k}$ caracteres y usar RAG focalizado solo cuando lo supera. | Elimina pérdida de coherencia por chunking en documentos técnicos cortos y medianos. |
| `ADR-005` | **Hexagonal Multi-LLM Factory (Strategy + Options + Registry)** | Aceptado | Desacoplar 15 proveedores (Local HTTP, Cloud APIs y Local CLI) tras `ILLMClient` y `LLMFactory`, persistiendo el motor activo en SQLite. | Cambio en caliente entre Ollama, Gemini, Claude, OpenAI y `agy` sin reiniciar ni tocar casos de uso. |
| `ADR-006` | **Servidor Universal `FastMCP` Dual (SSE + STDIO)** | Aceptado | Implementar protocolo MCP JSON-RPC 2.0 ligero sin dependencias externas sobre `/mcp/sse` y `run_mcp.py`. | Integración nativa inmediata con Cursor, Claude Code y Antigravity. |
| `ADR-007` | **Resiliencia CLI Windows (`Proactor` + Threaded Fallback + Flag Ordering)** | Aceptado | Configurar `WindowsProactorEventLoopPolicy`, fallback multihilo `subprocess.Popen` ante `NotImplementedError` y orden estricto de flags (`--dangerously-skip-permissions` antes de `-p={prompt}` para `agy`). | Ejecución y streaming UTF-8 estable en Windows, Linux y macOS. |
