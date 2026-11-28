---
id: "DOC-DATA-DICTIONARY_MD"
title: "Diccionario de Datos Relacional y ERD Crow's Foot — ContextForge"
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
labels: ["data-dictionary","erd","sqlite","sqlalchemy","chromadb","engineering"]
icon: "database"
---

# Diccionario de Datos Relacional, Almacén Vectorial y ERD

> [!NOTE]
> Esquema relacional verificado directamente contra los **12 modelos ORM SQLAlchemy Async** en `src/infrastructure/database/orm_models.py` y `src/infrastructure/persistence/models/*.py`, más la persistencia vectorial en ChromaDB (`./data/chroma/`).

---

## 1. Diagrama Entidad-Relación (ERD Crow's Foot)

```mermaid
erDiagram
  PROJECTS ||--o{ BOOKS : "contiene (library_slug)"
  PROJECTS ||--o{ MODULES : "clasifica (project_slug)"
  PROJECTS ||--o{ TAGS : "etiqueta (project_slug)"
  BOOKS ||--o{ ATTACHMENTS : "adjunta (book_id)"
  BOOKS ||--o{ CHAT_SESSIONS : "contextualiza (book_id)"
  CHAT_SESSIONS ||--o{ CHAT_MESSAGES : "registra (session_id)"
  BOOKS ||--o{ DOCUMENT_COMMENTS : "comenta (doc_path)"
  BOOKS ||--o{ DISCUSSION_THREADS : "discute (target_id)"
  BOOKS ||--o{ RATINGS : "califica (target_id)"

  PROJECTS {
    varchar slug PK
    varchar name
    text description
    varchar path
    boolean is_active
    datetime created_at
    datetime updated_at
  }

  BOOKS {
    varchar id PK
    varchar slug
    varchar title
    varchar library_slug
    varchar module_name
    varchar path
    text summary
    varchar status
    datetime created_at
    datetime updated_at
  }

  ATTACHMENTS {
    varchar id PK
    varchar book_id
    varchar file_name
    varchar file_path
    varchar mime_type
    integer size_bytes
    datetime uploaded_at
  }

  CHAT_SESSIONS {
    varchar session_id PK
    varchar book_id
    varchar library_id
    datetime created_at
  }

  CHAT_MESSAGES {
    varchar id PK
    varchar session_id
    varchar role
    text content
    text sources_json
    datetime created_at
  }

  LLM_CONFIGURATIONS {
    varchar provider PK
    varchar engine_type
    varchar name
    varchar api_key
    varchar base_url
    varchar default_model
    varchar cli_command
    varchar cli_args
    boolean is_active
    float temperature
    integer max_tokens
    datetime updated_at
  }

  SETTINGS {
    varchar id PK
    varchar active_llm_model
    varchar ollama_url
    varchar docs_path
    varchar embedding_model
    float temperature
    datetime updated_at
  }

  MODULES {
    varchar id PK
    varchar slug
    varchar name
    text description
    varchar color
    varchar icon
    varchar project_slug
    datetime created_at
    datetime updated_at
  }

  TAGS {
    varchar id PK
    varchar slug
    varchar name
    varchar color
    varchar project_slug
    datetime created_at
  }

  DOCUMENT_COMMENTS {
    varchar id PK
    varchar doc_path
    varchar user_name
    varchar user_email
    text content
    datetime created_at
  }

  DISCUSSION_THREADS {
    varchar id PK
    varchar target_id
    varchar title
    datetime created_at
    datetime updated_at
  }

  RATINGS {
    varchar id PK
    varchar target_id
    varchar user_name
    integer score
    datetime created_at
  }
```

---

## 2. Catálogo de Tablas Relacionales (`./data/contextforge.db`)

| Tabla | Clave Primaria | Columnas Principales | Propósito Funcional |
|---|---|---|---|
| `projects` | `slug` (`VARCHAR(50)`) | `name`, `description`, `path`, `is_active`, `created_at`, `updated_at` | Registro de librerías/proyectos aislados. Seed automático: `default`. |
| `books` | `id` (`VARCHAR(64)`) | `slug`, `title`, `library_slug`, `module_name`, `path`, `summary`, `status` | Metadatos de catálogo y estado editorial de documentos Markdown. |
| `attachments` | `id` (`VARCHAR(36)`) | `book_id`, `file_name`, `file_path`, `mime_type`, `size_bytes`, `uploaded_at` | Inventario de anexos (PDF, DOCX, XLSX, imágenes, audio `.ogg`/`.mp3`). |
| `chat_sessions` | `session_id` (`VARCHAR(64)`) | `book_id`, `library_id`, `created_at` | Sesiones persistentes de chat focalizado por documento. |
| `chat_messages` | `id` (`VARCHAR(64)`) | `session_id`, `role`, `content`, `sources_json`, `created_at` | Turnos conversacionales y citas JSON serializadas. |
| `llm_configurations` | `provider` (`VARCHAR(50)`) | `engine_type`, `name`, `api_key`, `base_url`, `default_model`, `cli_command`, `cli_args`, `is_active`, `temperature`, `max_tokens` | Configuración de los 15 proveedores LLM (auto-migración DDL en `connection.py`). |
| `settings` | `id` (`VARCHAR(50)`) | `active_llm_model`, `ollama_url`, `docs_path`, `embedding_model`, `temperature` | Preferencias globales del sistema (`id = "default"`). |
| `modules` | `id` (`VARCHAR(64)`) | `slug`, `name`, `description`, `color`, `icon`, `project_slug` | Taxonomía dinámica de módulos por proyecto. |
| `tags` | `id` (`VARCHAR(64)`) | `slug`, `name`, `color`, `project_slug` | Etiquetas semánticas por proyecto. |
| `document_comments` | `id` (`VARCHAR(36)`) | `doc_path`, `user_name`, `user_email`, `content`, `created_at` | Comentarios colaborativos sobre documentos. |
| `discussion_threads` | `id` (`VARCHAR(36)`) | `target_id`, `title`, `created_at`, `updated_at` | Hilos de discusión estructurados por recurso. |
| `ratings` | `id` (`VARCHAR(36)`) | `target_id`, `user_name`, `score`, `created_at` | Calificaciones de utilidad de documentación. |

---

## 3. Almacén Vectorial (`ChromaDB`) y Configuración de Infraestructura

- **ChromaDB (`./data/chroma/`)**: Particionado estrictamente por proyecto en colecciones nombradas `cf_project_{slug}`. Cada documento indexado almacena metadatos `file_path`, `project_slug`, `header`, `header_level` (`h1`–`h6`), `attachment_name` y `location` (ej. `Pág. 4`).
- **BM25Plus (En Memoria)**: Índice léxico particionado por `project_slug`, reconstruido al iniciar `lifespan` en `src/main.py` y actualizado incrementalmente por `BackgroundDocsWatcher`.
- **Infraestructura Hexagonal (`./data/infrastructure_configs.json`)**: Persiste las configuraciones activas de `DatabaseFactory` (SQLite, PostgreSQL, Supabase, SQL Server, MongoDB, Firebase) y `StorageFactory` (Local FS, Supabase Storage, S3, Firebase Storage).
