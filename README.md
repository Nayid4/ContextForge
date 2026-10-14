# ContextForge 🧠

> **Local Knowledge RAG & Context Builder for Enterprise Engineering (Docs-as-Code)**

ContextForge is a sovereign, 100% local knowledge retrieval platform that ingests local Markdown documentation into a hybrid search engine (BM25 + ChromaDB) and local LLM pipeline (Ollama).

## Architectural Principles
- **Clean & Screaming Architecture**: Subdomains scream problem intent (`markdown_ingestion`, `rag_engine`, `context_builder`, `knowledge_governance`, `identity_access`).
- **CQRS & Unit of Work**: Strict segregation of command mutators and query handlers.
- **Event Sourcing**: Immutable audit log for knowledge access and automated Knowledge Gap detection.
- **RFC 7807 (Problem Details)**: Standardized HTTP error responses.
- **UI**: Server-Side Rendering with Jinja2, TailwindCSS v4, Preline UI, and HTMX SSE streaming.

# ContextForge
