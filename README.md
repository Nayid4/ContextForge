# 📚 ContextForge / Library System — Contexto Arquitectónico y Especificación Técnica

> **Codename:** ContextForge (Local Knowledge RAG & Sovereign Engineering Library)  
> **Arquitectura:** Clean Architecture + Granular CQRS + Screaming UI (Blog & Claude AI Aesthetic)  
> **Stack:** FastAPI, Jinja2, HTMX, TailwindCSS v4, SQLite, ChromaDB, BM25, Ollama  
> **Política de Soberanía:** Zero-Leakage (100% On-Premise / Localhost)

---

## 1. Propósito del Sistema

**ContextForge** es una plataforma soberana de gestión de conocimiento de ingeniería diseñada bajo el paradigma **Docs-as-Code**. Su propósito principal es eliminar la fricción cognitiva, las preguntas repetitivas y la dependencia oral de desarrolladores veteranos mediante un repositorio de documentación técnica viva en Markdown plano (`.md`), complementado con:

- **Catálogo de Librerías / Proyectos:** Organización jerárquica y aislada del conocimiento técnico por librerías o proyectos (`./docs/{library_slug}/`).
- **Editor Dual de Documentos:** Autoría híbrida mediante **Markdown Pro** (código directo con split-screen preview) y **Constructor Dinámico** (editor de bloques Notion-style compilado bidireccionalmente a Markdown).
- **Ingesta Multiformato de Anexos:** Detección y extracción estructurada de archivos PDF (por páginas), DOCX (párrafos y tablas), Excel/CSV (tablas Markdown) e imágenes vinculadas a documentos.
- **RAG Focalizado (Scoped RAG) con Zero-RAG Bypass:** Chat de IA local asistido por Ollama con ventana de contexto inteligente:
  - Documentos pequeños ($\le 32.000$ caracteres / ~8k tokens): Inyección completa en el prompt sin fragmentación ni pérdida de coherencia.
  - Documentos extensos ($> 32.000$ caracteres): Búsqueda vectorial y léxica aislada estrictamente al documento y sus anexos directos.
- **Context Bundler Jerárquico:** Generación instantánea de contexto curado para LLMs e IDEs de programación (`.cursorrules`, Markdown compilado).
- **Capa Social de Discusión:** Comentarios, calificaciones y retroalimentación técnica colaborativa sobre la documentación viva.

---

## 2. Decisiones Fundacionales de Diseño

1. **Única Fuente de Verdad (Single Source of Truth):**
   Los archivos Markdown planos (`.md`) almacenados en `./docs/{library_slug}/{module}/*.md` son la única fuente de verdad definitiva. La base de datos SQLite solo almacena índices, metadatos relacionales, hilos de comentarios y sesiones de chat.
2. **CQRS Estricto y Granular:**
   La capa de aplicación (`src/application/`) no utiliza archivos acumulativos gigantescos. Cada comando y consulta dispone de su propio directorio atómico que contiene exactamente:
   - `command.py` o `query.py` (DTO inmutable).
   - `response.py` (DTO tipado de respuesta).
   - `validator.py` (Reglas de validación previa).
   - `handler.py` (Manejador del caso de uso).
3. **Desacoplamiento Total de Modelos ORM:**
   La capa de persistencia (`src/infrastructure/persistence/models/`) organiza cada modelo SQLAlchemy en su propio archivo (`base_model.py`, `library_model.py`, `book_model.py`, `attachment_model.py`, `comment_model.py`, `chat_session_model.py`), unificados a través de `UnitOfWork`.
4. **Presentación Híbrida (SSR + REST API):**
   Presentación ligera y reactiva basada en FastAPI, Jinja2, HTMX y TailwindCSS v4, sin complejidades innecesarias de SPA o bundlers pesados de Node.js.
5. **Experiencia de Usuario: Blog de Ingeniería + Claude AI:**
   - Paleta neutra y cálida (dark mode en tonos zinc/slate con tipografía refinada).
   - Barra lateral izquierda colapsable inspirada en Claude AI: selector de proyectos/librerías, árbol de navegación, buscador rápido (`Ctrl+K`) y acceso a herramientas.
   - Columna central con legibilidad editorial de nivel blog de ingeniería (`prose` tipográfico, tablas fluidas, bloques de código estilizados y diagramas Mermaid.js reactivos).
   - Panel lateral deslizable (drawer) para chat focalizado y modal de previsualización sin descarga de adjuntos.

---

## 3. Árbol de Directorios del Proyecto

```text
library_system/
├── docs/                                    # Repositorio soberano de archivos Markdown y anexos (.md, .pdf, .docx, .xlsx)
│   └── {library_or_project_slug}/           # Aislamiento por librería / proyecto
│       ├── {module_name}/
│       │   └── {doc_name}.md
│       └── assets/
│           └── {doc_name}/
│               ├── imagen.png
│               └── anexo.pdf
│
├── data/                                    # Persistencia local SQLite y ChromaDB
│   ├── contextforge.db
│   └── chroma/
│
├── src/
│   ├── domain/                              # 1. NÚCLEO DE NEGOCIO (Puro, sin dependencias externas)
│   │   ├── shared_kernel/                   # Value Objects, Entity base, Domain Events, Domain Exceptions
│   │   │   ├── entities.py
│   │   │   ├── value_objects.py
│   │   │   └── exceptions.py
│   │   ├── catalog/                         # Entidades e interfaces del Catálogo
│   │   │   ├── entities.py                  # Book, Library
│   │   │   ├── repositories.py              # IBookRepository, ILibraryRepository
│   │   │   └── exceptions.py
│   │   ├── book_registry/                   # Entidades e interfaces del Creador de Documentos/Libros
│   │   │   ├── entities.py                  # DraftBook, DocumentBlock, Attachment, BlockType
│   │   │   ├── repositories.py              # IBookRegistryRepository, IAttachmentRepository
│   │   │   └── exceptions.py
│   │   ├── social/                          # Entidades e interfaces de la capa Social
│   │   │   ├── entities.py                  # Comment, Rating, Thread
│   │   │   ├── repositories.py              # ISocialRepository
│   │   │   └── exceptions.py
│   │   └── chat/                            # Entidades e interfaces de Chat y RAG Focalizado
│   │       ├── entities.py                  # ChatMessage, ScopedChatSession, DocumentSourceRef
│   │       ├── repositories.py              # IChatSessionRepository
│   │       └── exceptions.py
│   │
│   ├── application/                         # 2. CASOS DE USO (Orquestación - CQRS Granular)
│   │   ├── commons/                         # Componentes transversales de aplicación
│   │   │   ├── behaviors/                   # ValidationBehavior, LoggingBehavior, TransactionBehavior
│   │   │   │   ├── base_behavior.py
│   │   │   │   ├── validator_behavior.py
│   │   │   │   ├── logging_behavior.py
│   │   │   │   └── transaction_behavior.py
│   │   │   ├── interfaces/                  # Mediador, IUnitOfWork, ICurrentUserService
│   │   │   │   ├── mediator.py
│   │   │   │   ├── unit_of_work.py
│   │   │   │   └── current_user_service.py
│   │   │   └── exceptions/                  # ApplicationException, NotFoundException, ValidationException
│   │   │       └── application_exceptions.py
│   │   │
│   │   ├── mappers/                         # Mapeadores globales entre Domain Entities y DTOs
│   │   │   ├── catalog_mapper.py
│   │   │   ├── book_registry_mapper.py
│   │   │   ├── social_mapper.py
│   │   │   └── chat_mapper.py
│   │   │
│   │   ├── catalog/                         # Feature: Catalog CQRS
│   │   │   ├── commands/
│   │   │   │   └── update_book_status/      # [command.py, response.py, validator.py, handler.py]
│   │   │   └── queries/
│   │   │       ├── get_books/               # [query.py, response.py, validator.py, handler.py]
│   │   │       └── get_library_catalog/     # [query.py, response.py, validator.py, handler.py]
│   │   │
│   │   ├── book_registry/                   # Feature: Book Registry CQRS
│   │   │   ├── commands/
│   │   │   │   ├── create_book_from_blocks/ # Compilación de bloques dinámicos a .md
│   │   │   │   ├── save_raw_markdown/       # Guardado directo de Markdown Pro
│   │   │   │   └── upload_attachment/       # Carga y almacenamiento en assets
│   │   │   └── queries/
│   │   │       ├── get_book_draft/          # [query.py, response.py, validator.py, handler.py]
│   │   │       └── get_doc_templates/       # Blueprints: ADR, Business Flow, API, Runbook
│   │   │
│   │   ├── social/                          # Feature: Social CQRS
│   │   │   ├── commands/
│   │   │   │   ├── add_comment/             # [command.py, response.py, validator.py, handler.py]
│   │   │   │   └── moderate_comment/        # [command.py, response.py, validator.py, handler.py]
│   │   │   └── queries/
│   │   │       └── get_book_comments/       # [query.py, response.py, validator.py, handler.py]
│   │   │
│   │   └── chat/                            # Feature: Scoped Chat CQRS
│   │       ├── commands/
│   │       │   └── send_scoped_message/     # [command.py, response.py, validator.py, handler.py]
│   │       └── queries/
│   │           ├── get_chat_history/        # [query.py, response.py, validator.py, handler.py]
│   │           └── ask_scoped_document/     # [query.py, response.py, validator.py, handler.py]
│   │
│   ├── infrastructure/                      # 3. INFRAESTRUCTURA (Persistencia y adaptadores)
│   │   ├── persistence/
│   │   │   ├── database.py                  # Engine SQLAlchemy y sesión
│   │   │   ├── unit_of_work.py              # Implementación concreta de IUnitOfWork
│   │   │   └── models/                      # Modelos ORM desacoplados
│   │   │       ├── __init__.py
│   │   │       ├── base_model.py            # DeclarativeBase y campos comunes
│   │   │       ├── library_model.py         # LibraryORM (ProjectORM)
│   │   │       ├── book_model.py            # BookORM (DocumentORM)
│   │   │       ├── attachment_model.py      # AttachmentORM
│   │   │       ├── comment_model.py         # CommentORM, ThreadORM
│   │   │       └── chat_session_model.py    # ChatSessionORM, ChatMessageORM
│   │   │
│   │   ├── repositories/                    # Implementación de repositorios
│   │   │   ├── sql_catalog_repo.py
│   │   │   ├── sql_book_registry_repo.py
│   │   │   ├── sql_social_repo.py
│   │   │   ├── sql_chat_repo.py
│   │   │   ├── chroma_vector_repo.py
│   │   │   ├── bm25_lexical_repo.py
│   │   │   └── local_filesystem_repo.py
│   │   │
│   │   ├── external/                        # Integraciones técnicas y adaptadores de IA
│   │   │   ├── markdown/
│   │   │   │   ├── block_serializer.py      # Serializador de bloques visuales a Markdown
│   │   │   │   └── frontmatter_parser.py    # Parser de metadatos YAML
│   │   │   ├── vector_store/
│   │   │   │   └── chroma_service.py        # Wrapper y gestión de colecciones aisladas
│   │   │   ├── llm/
│   │   │   │   └── ollama_client.py         # Cliente HTTP hacia Ollama local
│   │   │   └── extractors/                  # Ingesta multiformato de anexos
│   │   │       ├── pdf_extractor.py         # Extracción de PDF página por página
│   │   │       ├── docx_extractor.py        # Extracción de párrafos y tablas DOCX
│   │   │       ├── excel_extractor.py       # Conversión de hojas Excel/CSV a Markdown
│   │   │       └── text_extractor.py        # Lectura de texto plano
│   │   │
│   │   └── services/
│   │       └── fs_watcher.py                # File Watcher con Watchdog para auto-sincronización
│   │
│   └── presentation/                        # 4. PRESENTACIÓN (FastAPI + TailwindCSS v4)
│       ├── api/                             # Endpoints REST v1
│       │   ├── dependencies.py              # Inyección de dependencias
│       │   ├── middlewares/                 # Manejo RFC 7807 y CORS
│       │   └── v1/
│       │       ├── catalog_router.py
│       │       ├── registry_router.py
│       │       ├── social_router.py
│       │       ├── chat_router.py
│       │       └── scaffold_api.py
│       │
│       └── frontend/                        # Vistas SSR con Jinja2 y HTMX
│           ├── layouts/
│           │   └── base.html                # Layout con estética Claude AI + Blog
│           ├── shared/
│           │   ├── assets/css/main.css      # TailwindCSS v4 (@import "tailwindcss";)
│           │   ├── ui/navbar.html           # Barra de navegación limpia con selector
│           │   └── ui/footer.html
│           └── modules/                     # Módulos Screaming Architecture
│               ├── Catalog/                 # Vistas y componentes del catálogo
│               ├── BookRegistry/            # Editor Dual (Markdown Pro y Bloques)
│               ├── Chat/                    # Drawer de Chat Focalizado
│               ├── knowledge_docs/          # Lector editorial de documentos
│               └── context_bundler/         # Compilador de contexto para LLMs
│
├── tests/                                   # Suites de pruebas (unit, integration, e2e)
├── main.py                                  # Punto de entrada de la aplicación FastAPI
└── pyproject.toml                           # Configuración y dependencias del proyecto
```

---

## 4. Guía de Ejecución y Validación

- **Iniciar servidor de desarrollo:**
  ```powershell
  .\.venv\Scripts\uvicorn src.main:app --reload --port 8000
  ```
- **Ejecutar verificación de tipos estricta:**
  ```powershell
  .\.venv\Scripts\mypy --strict src
  ```
- **Ejecutar suite completa de pruebas y cobertura:**
  ```powershell
  .\.venv\Scripts\pytest -v --cov=src
  ```

