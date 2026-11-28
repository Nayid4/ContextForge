---
id: "page-knowledge_01-project-overview-and-business_md"
title: "Visión del Producto, Contexto de Negocio y Stakeholders — ContextForge"
collection: "general"
parent: null
owner: "leader"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: true
full_width: true
archived_at: null
last_updated: "2026-11-25"
tags: []
labels: ["ieee-830","business-context","product-vision","stakeholders","raci","general"]
icon: "rocket"
---

# Visión del Producto, Contexto de Negocio y Stakeholders (IEEE Std. 830-1998)

> [!NOTE]
> Especificación formal del propósito, alcance, límites, perfiles de usuario y gobernanza de **ContextForge (IntegrationLibrary)** — plataforma soberana de gestión de conocimiento técnico, recuperación híbrida RAG y construcción de contexto para agentes de IA bajo el paradigma **Docs-as-Code**.

---

## 1. Naturaleza y Propósito del Proyecto

**ContextForge** (`contextforge` v0.1.0) es una plataforma full-stack **100% soberana (Zero-Leakage / On-Premise)** diseñada para gestionar, indexar, consultar y empaquetar conocimiento técnico de ingeniería en formato **Markdown plano (`.md`)** junto con anexos multiformato (PDF, DOCX, XLSX/CSV, imágenes y audio).

### 1.1 Formulación del Problema

#### Dolor de Negocio
- **Dependencia Oral y Bus Factor Crítico**: El conocimiento arquitectónico, las reglas de negocio y las políticas de integración suelen dispersarse en wikis desactualizadas, chats efímeros o en la memoria de desarrolladores senior.
- **Riesgo de Fuga de Propiedad Intelectual**: Subir especificaciones propietarias, ADRs o documentos internos a servicios SaaS de IA en la nube viola políticas de confidencialidad y cumplimiento corporativo.
- **Alucinaciones de Asistentes de Código**: Los IDEs y agentes de IA (Cursor, Claude Code, Antigravity, OpenCode) generan implementaciones incompatibles cuando carecen de acceso estructurado y verificable a la documentación real del proyecto.

#### Dolor Técnico
- **Búsqueda Semántica vs. Léxica Incompleta**: Las búsquedas puramente vectoriales fallan con identificadores exactos (`BR-PAY-001`, códigos HTTP, slugs), mientras que las búsquedas puramente léxicas pierden intención conceptual.
- **Acoplamiento a un Único Proveedor de IA o Persistencia**: Los equipos necesitan alternar sin fricción entre motores locales offline (Ollama, LM Studio, vLLM), agentes CLI soberanos (`agy`, `claude`, `opencode`, `codex`, `gemini`, `aider`) y APIs comerciales (Gemini, OpenAI, Anthropic, DeepSeek).

---

## 2. Declaración Formal de la Visión del Producto

> **PARA** equipos de ingeniería de software, arquitectos de soluciones y desarrolladores asistidos por IA,  
> **QUIENES** necesitan centralizar documentación técnica viva, consultar reglas de negocio con atribución exacta de fuentes y suministrar contexto determinista a agentes de código sin fugar datos propietarios,  
> **EL** sistema **ContextForge (IntegrationLibrary)**,  
> **QUE ES UNA** plataforma soberana de conocimiento técnico Docs-as-Code, RAG Híbrido (ChromaDB + BM25Plus) y servidor universal MCP,  
> **QUE** mantiene archivos Markdown como única fuente de verdad, ofrece editor dual (Markdown Pro + Bloques visuales), recuperación híbrida con *Zero-RAG Bypass* ($\le 32.000$ caracteres), orquestación de 15 motores de IA y exportación directa de bundles de contexto (`.cursorrules` y MCP SSE/STDIO).

---

## 3. Ámbito del Producto (IEEE 830 Secciones 1.2 y 2.2)

### 3.1 Qué HACE el Sistema (Alcance Incluido)
1. **Gestión Multi-Proyecto / Multi-Librería Aislada**: Particionamiento físico de documentos (`./docs/{project_slug}/`), colecciones vectoriales (`cf_project_{slug}`) e índices léxicos BM25Plus por proyecto.
2. **Autoría Dual Docs-as-Code**: Editor Markdown Pro con vista previa HTMX en tiempo real y Constructor Dinámico de Bloques compilado bidireccionalmente a Markdown, más scaffolding asistido por IA mediante Blueprints (ADR, Business Flow, API Integration, Troubleshooting).
3. **Ingesta Multiformato y File Watcher**: Extracción estructurada de anexos PDF (`pypdf`), DOCX (`python-docx`), XLSX/CSV (`openpyxl`/`pandas`), soporte de audio/imágenes en visor modal y sincronización automática con `watchdog` (debounce `1.5s`).
4. **Motor RAG Híbrido y Chat Focalizado (Scoped RAG)**: Fusión *Reciprocal Rank Fusion* (RRF $k=60$) entre ChromaDB y BM25Plus, *Zero-RAG Bypass* para documentos $\le 32.000$ caracteres, streaming SSE y atribución obligatoria de citas.
5. **Orquestación Multi-LLM Universal (15 Proveedores)**: Soporte unificado para servidores locales HTTP (Ollama, LM Studio, vLLM, LocalAI), APIs Cloud (Gemini, OpenAI, Anthropic, DeepSeek) y agentes CLI locales (`agy`, `claude`, `opencode`, `codex`, `gemini`, `aider`, `ollama`) con persistencia en SQLite.
6. **Context Bundler & Servidor Universal MCP**: Compilación de archivos `.cursorrules`/`.md`, widget de chat embebible (`widget.js`), colección Postman auto-generada y servidor `FastMCP` sobre SSE (`/mcp/sse`) y STDIO (`run_mcp.py`).
7. **Taxonomía Dinámica y Capa Social**: Gestión de módulos y etiquetas (`modules`, `tags`), hilos de discusión (`discussion_threads`), comentarios (`document_comments`) y calificaciones (`ratings`).

### 3.2 Qué NO HACE el Sistema (Exclusiones Explícitas)
- **No sustituye a Git**: ContextForge gestiona archivos locales en `./docs/` preparados para versionamiento Git, pero no ejecuta `git push` ni reemplaza flujos de Pull Request.
- **No incluye autenticación empresarial SSO/OAuth2 nativa**: Opera orientado a entornos locales/intranet confiables; la exposición pública requiere un reverse proxy externo con autenticación.
- **No entrena ni realiza fine-tuning de modelos**: Utiliza inferencia RAG sobre modelos existentes (locales o cloud).

---

## 4. Catálogo de Stakeholders, Perfiles de Usuario y Matriz RACI

### 4.1 Stakeholders y Perfiles (IEEE 830 Sección 2.3)

| Stakeholder / Perfil | Formación y Experiencia | Responsabilidad Principal | Dolor / Necesidad Clave |
|---|---|---|---|
| **Arquitecto de Software / Tech Lead** | Ingeniería de Sistemas / >7 años | Definir ADRs, taxonomía de módulos y estándares de contexto | Evitar desalineación arquitectónica y mantener documentación viva |
| **Desarrollador Backend / Full-Stack** | Ingeniería o técnico / 1–6 años | Consultar reglas de negocio, redactar specs y consumir bundles en IDE | Reducir tiempo de búsqueda y obtener citas verificables sin interrumpir seniors |
| **Agente de IA / IDE (Cursor, Antigravity, Claude Code)** | Cliente automatizado MCP / REST | Consultar `search_project_context`, `get_document_full`, `list_project_structure` | Recibir contexto exacto y sin ruido antes de generar código |
| **QA / Especialista de Integración** | Ingeniería QA / 2–5 años | Validar contratos API, descargar colección Postman y auditar anexos | Acceder a endpoints documentados y pruebas reproducibles |

### 4.2 Matriz RACI

| Capacidad / Proceso | Tech Lead | Desarrollador | Agente IA (MCP) | QA |
|---|---|---|---|---|
| **Gobernanza de Proyectos y Taxonomía** | A / R | C | I | I |
| **Autoría y Mantenimiento Docs-as-Code** | A | R | C | C |
| **Configuración de Motores LLM / Storage** | A / R | C | I | I |
| **Consumo RAG / Scoped Chat / MCP** | C | R | R | R |
| **Validación API y Regresión (`pytest`/`mypy`)** | A | R | C | R |

---

## 5. Restricciones, Asunciones y Glosario Canónico

### 5.1 Restricciones y Asunciones (IEEE 830 Secciones 2.4 y 2.5)
- **Runtime**: Python `>=3.11` (validado en Python 3.13) con tipado estricto (`mypy --strict src` = 0 errores en 302 archivos).
- **Soberanía de Datos**: SQLite (`./data/contextforge.db`) y ChromaDB (`./data/chroma`) operan localmente sin requerir conectividad externa; las APIs cloud son estrictamente opcionales.
- **Compatibilidad Windows/Linux/macOS**: El adaptador `CLIProcessClient` resuelve ejecutables por SO y aplica `WindowsProactorEventLoopPolicy` más fallback multihilo `subprocess.Popen` ante `NotImplementedError`.

### 5.2 Glosario Canónico (IEEE 830 Sección 1.3)

| Término / Sigla | Definición Canónica en ContextForge |
|---|---|
| **Docs-as-Code** | Paradigma donde los archivos Markdown en `./docs/{project_slug}/` son la única fuente de verdad documental. |
| **Zero-RAG Bypass** | Estrategia de `ScopedChatService` que inyecta el documento completo al LLM cuando su tamaño es $\le 32.000$ caracteres, evitando fragmentación innecesaria. |
| **RRF ($k=60$)** | *Reciprocal Rank Fusion*, algoritmo determinista que combina rankings semánticos (ChromaDB) y léxicos (BM25Plus). |
| **Context Bundle** | Paquete compilado en `.cursorrules` o `.md` que consolida documentos seleccionados de un proyecto para inyección directa en IDEs. |
| **MCP (Model Context Protocol)** | Protocolo JSON-RPC 2.0 expuesto por `FastMCP` en `/mcp/sse` y `run_mcp.py` (STDIO) para consumo nativo por agentes IA. |
| **ProjectSlug** | Value Object normalizado (`^[a-z0-9][a-z0-9-_]*[a-z0-9]$`, máx. 50 chars) que aísla cada librería/proyecto. |
