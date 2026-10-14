# 📋 Especificación Ejecutable: ContextForge (Fase 1: spec.md)

> **Proyecto:** ContextForge — Local Knowledge RAG & Context Builder  
> **Rol:** Principal Software Architect & Senior Full-Stack Engineer  
> **Versión:** 1.0.0 (Executable Spec)  
> **Estado:** Listo para Revisión  
> **Metodología:** Spec-Driven Development (SDD) — Fase 1  

---

## 1. Resumen y Propósito del Producto (El Qué y el Por Qué)

### 1.1. Propósito
**ContextForge** es una plataforma de ingeniería soberana y local para la recuperación, síntesis y explotación del conocimiento técnico y funcional bajo el paradigma **Docs-as-Code**. Transforma repositorios de archivos Markdown (`.md`) en:
1. Un **Asistente Conversacional RAG local** con respuestas ancladas (*grounded*) y citas exactas a archivos fuente.
2. Un **Motor de Búsqueda Híbrida** (léxica BM25 + semántica ChromaDB) para localización instantánea de símbolos técnicos y conceptos de negocio.
3. Un **Compilador de Context Bundles** que genera archivos Markdown curados y optimizados en tokens para ser consumidos por asistentes de código (Cursor, Windsurf, Copilot, Aider).

### 1.2. Propuesta de Valor y Alineación con la Constitución
- **Soberanía y Fuga Cero (Zero-Leakage):** Inferencia y vectorización ejecutadas al 100% en local mediante **Ollama** (`nomic-embed-text`, `llama3.1:8b`, `qwen2.5-coder:7b`) y **ChromaDB**. Ningún byte de código o documentación sale a nubes públicas.
- **Reducción del Bus Factor:** El conocimiento tácito se formaliza en Markdown versionado en Git y se hace inmediatamente descubrible.

---

## 2. Personas y Actores del Sistema

```
┌─────────────────────────┬──────────────────────────┬─────────────────────────┐
│     Desarrollador Jr    │   Tech Lead / Architect  │       Agente / IDE      │
├─────────────────────────┼──────────────────────────┼─────────────────────────┤
│ • Consulta reglas de    │ • Valida consistencia de │ • Recibe paquetes de    │
│   negocio y arquitectura│   ADRs e integraciones.  │   contexto (.md)        │
│   sin interrumpir.      │ • Supervisa vacíos de    │   optimizados en tokens │
│ • Necesita citas claras │   documentación          │   para eliminar         │
│   para validar código.  │   (Knowledge Gaps).      │   alucinaciones.        │
└─────────────────────────┴──────────────────────────┴─────────────────────────┘
```

---

## 3. Historias de Usuario (INVEST) y Criterios de Aceptación (Gherkin)

### US-01: Consulta y Chat RAG con Atribución de Fuentes
> **Como** desarrollador de software,  
> **Quiero** realizar preguntas técnicas y funcionales en lenguaje natural sobre el sistema,  
> **Para** obtener explicaciones precisas con citas explícitas a los archivos Markdown fuente, reduciendo el tiempo de validación y la dependencia de otros ingenieros.

#### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Chat RAG con Citas Obligatorias

  Scenario: Consulta exitosa con respuesta respaldada por documentación
    Given que el directorio local contiene el documento "docs/modules/billing/retry_policy.md"
    And el documento describe que "tras 3 reintentos fallidos en cobro recurrente se emite evento PaymentDeadLetter"
    When el usuario consulta "¿Qué sucede cuando falla la pasarela de pagos tras los reintentos?"
    Then el sistema genera la respuesta explicando la emisión de PaymentDeadLetter
    And la respuesta incluye la píldora de cita con enlace relativo "[docs/modules/billing/retry_policy.md]"
    And la respuesta se transmite vía Server-Sent Events (SSE) token a token.

  Scenario: Fallback explícito ante desconocimiento o falta de contexto (No Alucinación)
    Given que la documentación local no contiene información sobre "criptomonedas"
    When el usuario consulta "¿Cómo se procesan pagos con Bitcoin?"
    Then el sistema responde explícitamente: "No se encontró información en la documentación local sobre este tema."
    And el sistema no genera suposiciones ni código ficticio
    And se registra un evento de dominio "KnowledgeGapIdentified" en la base de auditoría.
```

---

### US-02: Compilador y Exportador de Context Bundles para IDEs de IA
> **Como** ingeniero de software que utiliza herramientas de desarrollo asistido (Cursor, Windsurf, Copilot),  
> **Quiero** seleccionar uno o más módulos de la arquitectura y compilar un paquete de contexto Markdown optimizado,  
> **Para** inyectarlo directamente en los prompts de mi IDE, evitando que la IA alucine o desconozca las reglas del dominio empresarial.

#### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Generación y Exportación de Context Bundles

  Scenario: Exportación exitosa de contexto por módulo dentro del presupuesto de tokens
    Given que existen documentos pertenecientes al módulo "billing" y "crm_integration"
    And el presupuesto de tokens configurado es de 4,000 tokens
    When el usuario selecciona ambos módulos y presiona "Exportar Contexto"
    Then el sistema genera un archivo consolidado "context_bundle_billing_crm.md"
    And el archivo incluye metadatos de compilación, tabla de contenidos y los chunks Markdown originales
    And el total de tokens estimado del bundle es menor o igual a 4,000 tokens.

  Scenario: Poda inteligente (Pruning) cuando el contexto excede el presupuesto de tokens
    Given que el módulo "legacy_core" contiene documentos que suman 12,000 tokens
    And el presupuesto máximo configurado es de 6,000 tokens
    When el usuario solicita el bundle para "legacy_core"
    Then el sistema prioriza los documentos con tags "core" y "architecture"
    And poda o trunca las secciones de menor relevancia funcional
    And añade una nota al inicio del bundle indicando: "Bundle podado: 3 secciones secundarias omitidas por límite de tokens".
```

---

### US-03: Búsqueda Híbrida (Lexical BM25 + Vectorial ChromaDB)
> **Como** Tech Lead o desarrollador senior,  
> **Quiero** buscar identificadores técnicos exactos (nombres de funciones, variables de entorno, códigos de error) y conceptos semánticos simultáneamente,  
> **Para** localizar de inmediato la documentación técnica relevante sin falsos negativos.

#### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Búsqueda Híbrida con Reciprocal Rank Fusion (RRF)

  Scenario: Búsqueda exacta de identificador alfanumérico técnico
    Given un documento que define la constante "STRIPE_WEBHOOK_TOLERANCE_SECONDS"
    When el usuario busca exactamente "STRIPE_WEBHOOK_TOLERANCE_SECONDS"
    Then el componente BM25 asigna puntuación de relevancia máxima
    And el documento aparece en la primera posición de los resultados combinados.

  Scenario: Búsqueda conceptual en lenguaje natural
    Given documentos que detallan la "estrategia de mitigación ante caídas de proveedores de pago"
    When el usuario busca "resiliencia ante fallos en transacciones bancarias"
    Then el componente semántico de ChromaDB identifica la proximidad vectorial
    And el algoritmo RRF fusiona y ranquea los documentos en la parte superior.
```

---

### US-04: Ingesta Semántica Docs-as-Code y Chunking AST
> **Como** arquitecto de software,  
> **Quiero** que el sistema escanee el directorio de documentación respetando la jerarquía de encabezados (`#`, `##`, `###`) y el YAML frontmatter,  
> **Para** que los fragmentos vectorizados preserven la coherencia lógica y mantengan los bloques de código intactos.

#### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Ingesta y Chunking de Markdown

  Scenario: Procesamiento de documento estructurado con código
    Given un archivo Markdown con frontmatter YAML válido y una sección "### 2.1 Flujo de Reintentos"
    And dicha sección contiene una explicación de 10 líneas seguida de un bloque ```python ... ```
    When se ejecuta el comando de ingesta del directorio
    Then el parser AST genera un chunk que contiene el contexto jerárquico completo
    And el bloque de código no es cortado ni fragmentado a la mitad
    And los metadatos del chunk incluyen "module", "title", "header_path" y "source_file".

  Scenario: Archivo Markdown vacío o corrupto
    Given un archivo "empty.md" de 0 bytes en el directorio de documentación
    When se ejecuta la indexación
    Then el parser emite una advertencia en el log de auditoría
    And el proceso de indexación continúa sin fallar para el resto de archivos.
```

---

### US-05: Autenticación y Autorización con Microsoft Entra ID
> **Como** oficial de seguridad corporativa,  
> **Quiero** que todas las peticiones a la interfaz web y APIs REST estén protegidas por Microsoft Entra ID,  
> **Para** garantizar que solo los empleados autorizados de la organización accedan al conocimiento técnico interno.

#### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Protección con Microsoft Entra ID (RFC 7807)

  Scenario: Petición no autenticada a la API REST
    When un cliente HTTP realiza una petición a "POST /api/v1/rag/ask" sin cabecera Authorization
    Then el middleware responde con código HTTP 401 Unauthorized
    And el cuerpo de respuesta es un JSON con formato ProblemDetails (RFC 7807)
    And el campo "title" indica "Authentication Required".

  Scenario: Acceso web no autenticado
    When un usuario navega a "http://localhost:8000/chat" sin sesión activa
    Then el sistema redirige al flujo de login OAuth2/PKCE de Microsoft Entra ID.
```

---

## 4. Especificación Técnica de Requisitos Funcionales

### 4.1. Ingesta y Parser AST (Subdominio `markdown_ingestion`)
- **Contrato de Frontmatter YAML:**
  ```yaml
  ---
  title: "Políticas de Reintentos en Facturación"
  module: "billing"
  tags: ["payments", "stripe", "resilience"]
  author: "Arquitectura Pagos"
  version: "1.2.0"
  last_updated: "2026-10-10"
  ---
  ```
- **Reglas del Parser AST:**
  - Extrae metadatos con `python-frontmatter` o parser YAML seguro.
  - Recorre el árbol Markdown usando `marko` / `mistune` / `mistletoe`.
  - Delimitadores de chunk: Encabezados de nivel 1 a 3 (`#`, `##`, `###`).
  - Límite de chunk: Objetivo de 500 a 800 tokens con overlap de 100 tokens para transiciones de contexto.
  - **Invariante de Bloques de Código:** Los bloques delimitados por ```` ``` ```` jamás se dividen entre dos chunks; permanecen íntegros en el chunk donde inician.

---

### 4.2. Motor de Búsqueda Híbrida y RRF (Subdominio `rag_engine`)

#### Algoritmo de Fusión: Reciprocal Rank Fusion (RRF)
Para cada documento o chunk \(d\) presente en los resultados de búsqueda léxica (\(R_{\text{lex}}\)) o semántica (\(R_{\text{sem}}\)), se calcula:

$$\text{RRF Score}(d) = \sum_{m \in \{\text{lex}, \text{sem}\}} \frac{w_m}{k + \text{rank}_m(d)}$$

Donde:
- \(k = 60\) (constante estándar para estabilizar rangos).
- \(w_{\text{lex}} = 0.4\) (peso léxico BM25).
- \(w_{\text{sem}} = 0.6\) (peso semántico ChromaDB con embeddings `nomic-embed-text`).
- Si un documento no aparece en el top \(N\) de un ranking, su contribución en dicho modelo es 0.

#### Prompt Estricto de Generación RAG
```text
System Prompt:
Eres el Arquitecto Técnico Soberano de ContextForge.
Tu único propósito es responder la consulta del desarrollador utilizando EXCLUSIVAMENTE 
la información proporcionada en el bloque de contexto a continuación.

Reglas Inquebrantables:
1. Responde de forma técnica, concisa y estructurada.
2. Cada afirmación o regla explicada DEBE incluir la cita del archivo fuente exacto 
   en formato [ruta/archivo.md].
3. Si la respuesta no está contenida total o parcialmente en el contexto, declara:
   "No se encontró información en la documentación local sobre este tema."
   Queda estrictamente prohibido suponer, deducir o inventar reglas de negocio.
4. Preserva nombres de constantes, tipos y fragmentos de código exactamente como aparecen.

Contexto Recuperado:
{retrieved_chunks}

Pregunta del Usuario:
{user_query}
```

---

### 4.3. Compilador de Context Bundles (Subdominio `context_builder`)
- **Estructura del Bundle (`.md`):**
  1. Cabecera `# Context Bundle: [Nombre de Módulos]`.
  2. Frontmatter informativo con fecha de generación, hash de documentos incluidos y conteo estimado de tokens.
  3. Guía de inyección para el IDE (`Instrucciones para el Agente de Código`).
  4. Concatenación de secciones Markdown de los módulos seleccionados.
- **Optimizador de Presupuesto de Tokens:**
  - Calcula tokens usando `tiktoken` (codificador estándar de modelos de código).
  - Algoritmo Greedy con Knapsack funcional: prioriza documentos con metadato `importance: core` o con mayor densidad de definiciones de API y ADRs.

---

### 4.4. Interfaz de Usuario y Experiencia (Capa de Presentación)
- **Stack:** Jinja2 SSR + TailwindCSS v4 + Preline UI + HTMX.
- **Flujos Reactivos con HTMX:**
  - **Chat RAG:** `POST /api/v1/rag/ask` inicia un canal SSE (`hx-ext="sse"`) conectando con `/api/v1/rag/stream/{session_id}` para renderizar texto en tiempo real.
  - **Búsqueda en Vivo:** Input con `hx-get="/api/v1/search/preview"`, `hx-trigger="keyup changed delay:300ms"` para mostrar resultados instantáneos en un panel flotante.
  - **Exportador de Bundles:** Modal interactivo Preline UI (`hs-overlay`) que permite marcar checkboxes por módulo, calcular tokens en vivo (`hx-post="/api/v1/bundles/estimate"`) y descargar el `.md` generado.

---

## 5. Requisitos No Funcionales (NFRs) y Métricas de Calidad

| ID | Categoría | Requisito / Métrica | Criterio de Aceptación |
| :--- | :--- | :--- | :--- |
| **NFR-01** | Soberanía | Fuga Cero (Air-Gapped) | 0 peticiones salientes a IPs públicas para embeddings o inferencia. |
| **NFR-02** | Rendimiento | Time-To-First-Token (TTFT) | \(\le 2.0\) segundos para el primer token en streaming local. |
| **NFR-03** | Rendimiento | Latencia de Búsqueda Híbrida | \(\le 150\) ms para retornar el top 10 fusionado con RRF. |
| **NFR-04** | Confiabilidad | Cero fallos por archivos corruptos | 100% de tolerancia a fallos en archivos Markdown con frontmatter inválido. |
| **NFR-05** | Tipado | Mypy Estricto | 0 errores en `mypy --strict src/`. |
| **NFR-06** | Cobertura | Pruebas Unitarias & Integración | \(\ge 85\%\) de cobertura de código con `pytest`. |

---

## 6. Catálogo de Edge Cases y Especificación de Errores (RFC 7807)

Todos los errores HTTP devuelven `application/problem+json`:

### 6.1. Ollama Fuera de Línea (`OLLAMA_SERVICE_UNAVAILABLE`)
- **Disparador:** Timeout de conexión (`httpx.ConnectError` o timeout > 5s) hacia `http://localhost:11434`.
- **Respuesta RFC 7807:**
  ```json
  {
    "type": "https://contextforge.dev/errors/ollama-unavailable",
    "title": "Ollama Service Unavailable",
    "status": 503,
    "detail": "No se pudo conectar con la instancia local de Ollama en http://localhost:11434. Asegúrate de ejecutar 'ollama serve'.",
    "instance": "/api/v1/rag/ask",
    "code": "ERR_OLLAMA_OFFLINE"
  }
  ```

### 6.2. Documento No Encontrado (`DOCUMENT_NOT_FOUND`)
- **Disparador:** Petición de un archivo o bundle inexistente.
- **Respuesta RFC 7807:**
  ```json
  {
    "type": "https://contextforge.dev/errors/document-not-found",
    "title": "Document Not Found",
    "status": 404,
    "detail": "El archivo 'modules/billing/legacy_flow.md' no existe en el repositorio de documentación.",
    "instance": "/api/v1/documents/modules/billing/legacy_flow.md",
    "code": "ERR_DOC_NOT_FOUND"
  }
  ```

### 6.3. Presupuesto de Tokens Excedido (`TOKEN_BUDGET_OVERFLOW`)
- **Disparador:** Solicitud de bundle con configuración de rechazo estricto si el contenido mínimo supera el límite.
- **Respuesta RFC 7807:**
  ```json
  {
    "type": "https://contextforge.dev/errors/token-budget-overflow",
    "title": "Token Budget Exceeded",
    "status": 422,
    "detail": "Los documentos seleccionados suman 8,500 tokens, superando el presupuesto estricto de 4,000 tokens.",
    "instance": "/api/v1/bundles/export",
    "code": "ERR_TOKEN_OVERFLOW",
    "invalid_params": [
      { "name": "token_budget", "reason": "Debe ser al menos 8500 para incluir los documentos obligatorios." }
    ]
  }
  ```

### 6.4. Ventana de Contexto del LLM Saturada
- **Mecanismo de Mitigación en Dominio:** Si la suma de chunks recuperados excede la ventana de contexto permitida por el modelo seleccionado (ej. 8,192 tokens en `qwen2.5-coder`), el servicio `PromptBuilder` aplica truncamiento descendente por score RRF, manteniendo únicamente los chunks de mayor relevancia y registrando un log informativo.

---

## 7. Eventos de Dominio para Observabilidad (Event Sourcing)

| Evento | Atributos Clave | Disparador de Negocio |
| :--- | :--- | :--- |
| `DocumentIngested` | `doc_id`, `path`, `hash`, `token_count`, `module` | Archivo Markdown parseado y validado. |
| `ChunkIndexed` | `chunk_id`, `doc_id`, `header_path`, `vector_id` | Chunk persistido en ChromaDB y BM25. |
| `QueryExecuted` | `query_text`, `user_id`, `latency_ms`, `top_score` | Búsqueda o consulta RAG completada. |
| `KnowledgeGapIdentified` | `query_text`, `max_similarity`, `threshold` | Consulta con score RRF inferior a 0.35 (vacío documental). |
| `ContextBundleGenerated` | `bundle_id`, `modules`, `token_count`, `pruned` | Paquete de contexto exportado para IDE. |
