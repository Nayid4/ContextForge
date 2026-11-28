# 📜 Constitución de ContextForge (Fase 0: Guardrails Inmutables)

> **Proyecto:** ContextForge — Local Knowledge RAG (Docs-as-Code)  
> **Rol:** Principal Software Architect & Senior Full-Stack Engineer  
> **Versión:** 1.0.0 (Enterprise Specification Framework)  
> **Estado:** Aprobado / Inmutable  
> **Metodología:** Spec-Driven Development (SDD) — Fase 0  

---

## 1. Declaración de Misión y Filosofía de Diseño

**ContextForge** es la infraestructura soberana de gestión y explotación del conocimiento de ingeniería de software basada en el paradigma **Docs-as-Code**. Transforma documentación plana Markdown en un cerebro cognitivo consultable por desarrolladores e inyectable en asistentes de IA, eliminando la dependencia de personas clave (*Bus Factor*) y previniendo la alucinación de código.

Esta Constitución establece los **principios arquitectónicos, de seguridad y de ingeniería inmutables** que rigen todas las especificaciones, decisiones técnicas, tareas e implementaciones del proyecto. Ningún componente o cambio de código podrá infringir estas cláusulas.

---

## 2. Barandillas Inmutables de Seguridad y Soberanía (Zero-Leakage Policy)

> [!CAUTION]
> **POLÍTICA DE FUGA CERO DE DATOS (DATA LEAKAGE PREVENTION)**  
> Queda terminantemente prohibido el envío de código fuente, documentación interna, esquemas o consultas a APIs públicas de modelos de lenguaje en la nube (OpenAI, Anthropic, Gemini Cloud, etc.).

1. **Inferencia y Embeddings 100% Locales (Air-Gapped Ready):**
   - Todos los embeddings vectoriales deben generarse exclusivamente a través de la instancia local de **Ollama** utilizando modelos soberanos (ej. `nomic-embed-text` o `bge-m3`).
   - Toda la inferencia de generación y chat RAG debe ejecutarse localmente con **Ollama** (ej. `llama3.1:8b` o `qwen2.5-coder:7b`).
2. **Persistencia Vectorial Local:**
   - La base de datos vectorial es **ChromaDB** ejecutándose en modo cliente persistente embebido local (`PersistentClient`). Queda prohibida la dependencia de bases vectoriales como servicio (SaaS) en la nube.
3. **Control de Acceso e Identidad Empresarial:**
   - La autenticación corporativa se delega en **Microsoft Entra ID** mediante tokens Bearer OAuth2/OIDC (MSAL), validando firmas, emisor (`iss`), audiencia (`aud`) y roles para mitigar accesos no autorizados en la red corporativa.

---

## 3. Principio Rector: Docs-as-Code como Fuente Única de Verdad (SSoT)

> [!IMPORTANT]
> **EL ARCHIVO MARKDOWN ES EL REY (SINGLE SOURCE OF TRUTH)**  
> La verdad técnica y funcional reside en archivos planos Markdown (`.md`) almacenados en el sistema de archivos local y versionados mediante Git.

1. **Metadatos Obligatorios (YAML Frontmatter):**
   - Todo archivo procesable debe incluir cabecera YAML obligatoria con `title`, `module`, `tags`, `author`, `version` y `last_updated`.
2. **Prohibición de Bases de Datos Relacionales para el Contenido:**
   - No se almacenará texto o documentación en bases de datos SQL. Si un archivo `.md` es borrado del sistema de archivos, el sistema debe reflejar su eliminación vectorial en el siguiente ciclo de sincronización.
3. **Respeto a la Jerarquía y Bloques de Código:**
   - El parser de Markdown debe respetar el árbol sintáctico (AST): los encabezados (`#`, `##`, `###`) delimitan fronteras semánticas y los bloques de código (```...```) se preservan intactos junto con su contexto circundante.

---

## 4. Arquitectura de Software: Clean Architecture & Screaming Architecture

El código fuente se estructurará de forma que **grite el dominio del negocio** y no los frameworks web.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  FastAPI Endpoints │ Jinja2 Templates │ HTMX Partials │ Preline UI CSS │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Usa casos de uso / Queries / Commands
┌───────────────────────────────────▼────────────────────────────────────┐
│                           APPLICATION LAYER                            │
│    Command Handlers │ Query Handlers │ Unit of Work │ Services DTOs   │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
       Depende de   │                               │ Implementa
                    ▼                               ▼
┌───────────────────────────────────────┐ ┌──────────────────────────────┐
│             DOMAIN LAYER              │ │    INFRASTRUCTURE LAYER      │
│  Entities │ Value Objects │ Events    │ │  ChromaDB Repo │ Ollama SDK  │
│  Repository Interfaces │ Aggregates   │ │  Local FileSystem │ SQLite ES │
└───────────────────────────────────────┘ └──────────────────────────────┘
```

### Reglas de Dependencias:
1. **Dominio (`domain`):** Núcleo puro de Python sin dependencias de frameworks externos (sin FastAPI, sin ChromaDB, sin Ollama). Contiene entidades, value objects, domain events e interfaces abstractas (`Protocol` / `ABC`).
2. **Aplicación (`application`):** Orquesta los casos de uso separando estrictamente **Commands** de **Queries** (CQRS). Coordina el Unit of Work y los servicios de dominio.
3. **Infraestructura (`infrastructure`):** Implementa las interfaces del dominio para comunicarse con el sistema de archivos, ChromaDB, Ollama y SQLite.
4. **Presentación (`presentation`):** Expone endpoints HTTP/SSE en FastAPI, renderiza templates SSR con Jinja2, sirve HTMX y maneja middlewares.

---

## 5. Patrones de Diseño Obligatorios

### 5.1. CQRS (Command Query Responsibility Segregation)
- **Commands (Escritura):**
  - Mutaciones de estado e indexación (`IngestDirectoryCommand`, `IndexDocumentCommand`, `ReindexAllCommand`, `BuildContextBundleCommand`).
  - No retornan entidades pesadas de lectura, únicamente identificadores o confirmación de éxito.
- **Queries (Lectura):**
  - Recuperación e inferencia (`HybridSearchQuery`, `AskRagQuery`, `GetKnowledgeAuditQuery`).
  - Optimizadas para velocidad y lectura de datos proyectados sin mutar el almacenamiento.

### 5.2. Repository Pattern & Unit of Work (UoW)
- Todas las fuentes de persistencia (ChromaDB, FileSystem, EventStore) deben aislarse tras interfaces (`IVectorRepository`, `IDocumentRepository`, `IEventStoreRepository`).
- La indexación masiva o atómica debe gestionarse mediante un **Unit of Work (UoW)** con soporte para context manager (`with uow:`), garantizando consistencia transaccional (si falla la generación de vectores, se revierte el estado transaccional).
- Se exigirán implementaciones en memoria (`InMemory*Repository`) para tests unitarios ultrarrápidos sin I/O real.

### 5.3. Event Sourcing Adaptado para Gobernanza del Conocimiento
- Los eventos de negocio son objetos inmutables (`@dataclass(frozen=True)`):
  - `DocumentIngested`, `ChunkIndexed`, `VectorUpdated`, `QueryExecuted`, `ContextBundleGenerated`, `DocumentDeprecated`.
- Se registrarán en un almacén de eventos append-only (`IEventStoreRepository`) para auditoría, telemetría de preguntas frecuentes, detección de vacíos de conocimiento y trazabilidad de cambios en la documentación.

### 5.4. Estandarización de Errores: RFC 7807 (Problem Details)
- Todos los errores HTTP de la API REST devolverán obligatoriamente el formato estándar **RFC 7807 (Problem Details for HTTP APIs)** con el `Content-Type: application/problem+json`:
  ```json
  {
    "type": "https://contextforge.dev/errors/document-not-found",
    "title": "Document Not Found",
    "status": 404,
    "detail": "The markdown file 'billing/stripe-retry.md' does not exist in the knowledge base.",
    "instance": "/api/v1/documents/billing/stripe-retry.md",
    "invalid_params": []
  }
  ```

### 5.5. Inyección de Dependencias Nativa (DI)
- Ningún endpoint o servicio instanciará directamente clientes o repositorios. Todo acoplamiento se resolverá usando el sistema nativo `Depends()` de FastAPI en la capa de presentación.

---

## 6. Stack de Interfaz de Usuario y Experiencia (Frontend)

> [!NOTE]
> **PROHIBICIÓN DE SPAs PESADAS EN RUNTIME**  
> Para garantizar bajo consumo de recursos, cero dependencias de Node.js en producción y máxima velocidad en máquinas de desarrollo, queda descartado el uso de SPAs complejas (React, Angular, Vue).

1. **Arquitectura:** Server-Side Rendering (SSR) con **Jinja2** integrado en FastAPI.
2. **Estilos y Componentes:** **TailwindCSS v4** complementado con **Preline UI** (componentes accesibles y headless ideales para Tailwind sin frameworks pesados).
3. **Reactividad Asíncrona:** **HTMX** para interacciones dinámicas:
   - Streaming SSE de respuestas de Chat RAG token a token.
   - Búsqueda en vivo con debounce.
   - Modales interactivos para exportación de *Context Bundles*.
   - Árbol de navegación de archivos interactivo.

---

## 7. Estándares de Calidad de Código, Tipado y TDD

1. **Tipado Estricto (Python 3.11+):**
   - Configuración de `mypy` en modo estricto (`strict = true`).
   - Cero uso de `Any` no controlado.
   - Uso intensivo de `typing.Annotated`, `pydantic.BaseModel` v2 para DTOs y validaciones de entrada.
2. **Test-Driven Development (TDD):**
   - Flujo obligatorio: *Red ➔ Green ➔ Refactor*.
   - Toda funcionalidad debe contar primero con su suite de tests en `pytest`.
   - Cobertura mínima obligatoria: **85%** en las capas de Dominio y Aplicación.
3. **Middlewares Obligatorios en FastAPI:**
   - `TimingMiddleware`: Registra cabecera `X-Response-Time-Ms` en cada petición.
   - `ProblemDetailsExceptionMiddleware`: Captura excepciones no controladas y las transforma al esquema RFC 7807.
   - `EntraIdAuthMiddleware`: Inspecciona y valida tokens JWT de Microsoft Entra ID.

---

## 8. Criterios de Aceptación del Marco Constitucional (Gates)

| Gate | Descripción | Mecanismo de Verificación |
| :--- | :--- | :--- |
| **G1: Soberanía** | Ninguna llamada HTTP saliente a servicios de LLM en la nube. | Inspección de dependencias y tests de red aislada. |
| **G2: Arquitectura** | Separación absoluta entre capas y dominios "gritantes". | Linter de imports (no imports cruzados de infraestructura en dominio). |
| **G3: Tipado** | 0 errores en `mypy --strict`. | Ejecución de `mypy src/` en pre-commit / CI. |
| **G4: Errores RFC 7807**| 100% de las respuestas de error en formato Problem Details. | Suite de tests de integración de API en `tests/integration`. |
| **G5: TDD** | Tests unitarios para cada handler y servicio antes del código. | Suite completa de `pytest` pasando en verde. |

