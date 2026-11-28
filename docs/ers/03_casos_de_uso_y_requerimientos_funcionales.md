# 3. Modelo de Casos de Uso y Requerimientos Funcionales (`RF-*`) bajo IEEE 830 / ISO 29148

## 3.1 Especificación de Actores del Sistema

La interacción con **ContextForge** se modela a través de cuatro actores primarios (que inician casos de uso para obtener valor directo) y tres actores secundarios o sistemas colaboradores externos:

| ID Actor | Nombre del Actor | Clasificación | Descripción Técnica y Canal de Interacción |
| :--- | :--- | :---: | :--- |
| **`ACT-01`** | **Arquitecto / Curador Documental** | Primario (Humano) | Responsable de estructurar bibliotecas, redactar y editar especificaciones Markdown, cargar anexos, revisar borradores y publicar conocimiento certificado mediante la interfaz web o Git (*Docs-as-Code*). |
| **`ACT-02`** | **Desarrollador / Consumidor de Conocimiento** | Primario (Humano) | Ingeniero que explora el catálogo, ejecuta búsquedas híbridas, conversa con el asistente RAG con citas, comenta documentos y descarga *Context Bundles* desde la aplicación web. |
| **`ACT-03`** | **Agente de IA / Integrador SDK & MCP** | Primario (Sistema / Humano Técnico) | Copiloto de código, agente autónomo o aplicación Python anfitriona que consume programáticamente la API pública `contextforge` o invoca herramientas JSON-RPC 2.0 en el servidor `/mcp`. |
| **`ACT-04`** | **Administrador de Plataforma y Seguridad** | Primario (Humano) | Especialista que gestiona proyectos multi-tenant, políticas de soberanía, motores de base de datos, proveedores Multi-LLM, roles RBAC, API Keys y auditoría inmutable. |
| **`ACT-05`** | **Proveedor de Inferencia Multi-LLM** | Secundario (Sistema Externo) | Motor generativo local (Ollama) o servicio remoto (OpenAI, Google Gemini, Anthropic Claude) invocado a través del puerto `ILLMProvider` para síntesis RAG. |
| **`ACT-06`** | **Sistema de Archivos *Docs-as-Code*** | Secundario (Infraestructura) | Almacenamiento jerárquico de archivos `.md` y anexos monitorizado bidireccionalmente para mantener sincronía entre disco y base de datos. |
| **`ACT-07`** | **Proveedor de Identidad OIDC / Servicio Criptográfico JWT** | Secundario (Sistema Externo) | Servicio emisor/validador de tokens OAuth2/JWT y gestión de claves de cifrado para despliegues colaborativos empresariales (`TO-BE`). |

---

## 3.2 Catálogo y Fichas Descriptivas de Casos de Uso (`CU-01` a `CU-14`)

El modelo general de casos de uso (representado gráficamente en la **Figura 3** del Capítulo 6) comprende catorce casos de uso esenciales articulados mediante relaciones estereotipadas `<<include>>` y `<<extend>>`:

| ID | Caso de Uso | Actor(es) Principal(es) | Relaciones UML | Precondición | Flujo Normal Resumido | Flujo Alternativo / Excepción | Postcondición |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`CU-01`** | **Gestionar Espacios de Proyecto y Taxonomía** | `ACT-04`, `ACT-01` | `<<include>>` `CU-14` (Autenticar y Autorizar) | Actor autenticado con rol `Admin` o `Curator`. | 1. El actor define nombre, `slug`, ruta documental, política `sovereign_only` y módulos/tags. 2. El sistema valida `BR-01` y `BR-03`. 3. Persiste el proyecto y estructura inicial. | **FA-1:** `slug` duplicado o ruta fuera de perímetro $\rightarrow$ retorna `409` / `422` RFC 7807 sin crear registros. | Espacio de proyecto aislado y activo para ingesta y consulta. |
| **`CU-02`** | **Crear e Ingestar Documento Markdown** | `ACT-01`, `ACT-03` | `<<include>>` Validar Reglas (`IDocumentRule`); `<<include>>` `CU-06` (Indexar) | Proyecto existente; actor con permiso de escritura. | 1. El actor envía metadatos y cuerpo Markdown (vía editor web, API o `engine.ingest()`). 2. El sistema ejecuta la cadena `DocumentRuleChain` (`BR-02`). 3. Guarda archivo `.md`, crea versión `v1` y encola indexación si es publicable. | **FA-1:** Documento vacío o excede tamaño máximo $\rightarrow$ lanza `DocumentValidationError` indicando la regla infringida. | Documento persistido en disco y BD con versión inicial e integridad verificada. |
| **`CU-03`** | **Editar Documento con Control de Concurrencia** | `ACT-01` | `<<include>>` `CU-11` (Notificar Presencia WS) | Documento existente no retirado (`status != DEPRECATED`). | 1. El actor abre el editor dividido con vista previa en vivo y `ETag` actual. 2. Modifica contenido y pulsa guardar (`Ctrl+S`). 3. El sistema verifica `BR-11`, incrementa versión y sincroniza disco/BD. | **FA-1:** `ETag` desactualizado por edición concurrente $\rightarrow$ responde `409 Conflict` y ofrece comparador de diferencias (*diff*). | Nueva instantánea `DocumentVersion` almacenada sin sobrescritura silenciosa. |
| **`CU-04`** | **Aprobar y Publicar Flujo Editorial** | `ACT-01` | `<<include>>` `CU-06` (Indexar al publicar) | Documento en estado `DRAFT` o `IN_REVIEW`. | 1. El autor solicita revisión (`IN_REVIEW`). 2. El curador audita el contenido y aprueba publicación (`PUBLISHED`). 3. El sistema habilita el documento para recuperación RAG/MCP (`BR-04`, `BR-05`). | **FA-1:** Curador rechaza con observaciones $\rightarrow$ retorna a `DRAFT` manteniendo activa en RAG la versión publicada previa si existía. | Estado actualizado, evento auditado y versión publicada disponible en el índice híbrido. |
| **`CU-05`** | **Cargar y Extraer Anexos Técnicos** | `ACT-01` | `<<include>>` `CU-06` | Libro/documento padre registrado. | 1. El actor adjunta archivo (`.pdf`, `.docx`, `.txt`, `.drawio`). 2. El sistema valida MIME, límite `<= 25 MB` y calcula `SHA-256` (`BR-16`). 3. Almacena binario, extrae texto plano e indexa fragmentos. | **FA-1:** Extensión prohibida, archivo corrupto o tamaño excesivo $\rightarrow$ rechaza con `415` / `413` y limpia temporal. | Anexo vinculado al libro y su contenido textual incorporado al buscador. |
| **`CU-06`** | **Segmentar e Indexar Incrementalmente** | `ACT-01`, `ACT-06` | Invocado por `CU-02`, `CU-04`, `CU-05` | Documento válido con cambio de contenido detectado. | 1. Calcula hash `SHA-256` y compara contra el último indexado. 2. Segmenta con `IChunkingStrategy` (`HeadingAware`). 3. Actualiza almacén léxico BM25 y vectorial ChromaDB/InMemory. | **FA-1:** Fallo transitorio del motor vectorial $\rightarrow$ reintenta con *backoff* exponencial (3 intentos) y si persiste envía a `DLQ`. | Índices léxico y vectorial consistentes con la última versión publicada. |
| **`CU-07`** | **Ejecutar Búsqueda Híbrida Léxico-Vectorial** | `ACT-02`, `ACT-03` | `<<extend>>` Filtrar por colección/tag | Proyecto con al menos un documento publicado. | 1. El actor ingresa consulta, `top_k`, modo (`hybrid`) y estrategia (`rrf` o `weighted`). 2. El sistema consulta BM25 y vectores aislados por proyecto (`BR-10`), fusiona (`BR-07`) y retorna `SearchHit[]`. | **FA-1:** Estrategia desconocida o `query` vacía $\rightarrow$ retorna `400` / `UnknownStrategyError`. | Lista determinista de fragmentos relevantes con puntaje normalizado y ruta de encabezados. |
| **`CU-08`** | **Consultar Asistente RAG con Citas en *Streaming*** | `ACT-02`, `ACT-03` | `<<include>>` `CU-07`; `<<extend>>` Degradación Extractiva (`BR-12`) | Sesión activa o consulta puntual sobre proyecto con corpus. | 1. Recupera fragmentos relevantes publicados (`BR-04`). 2. Verifica umbral de evidencia (`BR-08`) y política de soberanía (`BR-13`). 3. Invoca `ILLMProvider` transmitiendo tokens vía SSE junto a `SourceCitation[]`. | **FA-1:** Proveedor LLM caído $\rightarrow$ conmuta a `ExtractiveFallbackLLMProvider` notificando modo degradado. **FA-2:** Sin evidencia $\rightarrow$ declara abstención controlada. | Respuesta fundamentada, trazable a documentos exactos y persistida en el historial de sesión. |
| **`CU-09`** | **Compilar y Exportar *Context Bundle*** | `ACT-02`, `ACT-03` | `<<include>>` `CU-07` (si es por consulta) | `max_tokens >= 50` y documentos disponibles. | 1. El actor selecciona documentos o define consulta semántica, `max_tokens` y formato (`markdown`, `json`, `xml` o custom). 2. Empaqueta respetando `BR-09` y serializa vía `IBundleExporter`. | **FA-1:** `max_tokens < 50` $\rightarrow$ lanza `TokenBudgetExceededError`. **FA-2:** Documentos exceden cupo $\rightarrow$ los reporta en `omitted_doc_ids`. | Paquete inmutable generado con conteo exacto de tokens y manifiesto de versiones incluidas. |
| **`CU-10`** | **Servir Contexto a Agentes vía Protocolo MCP** | `ACT-03` | `<<include>>` `CU-07`; `<<include>>` `CU-14` | Cliente MCP conectado a `/mcp` con credenciales válidas. | 1. El agente descubre herramientas (`tools/list`). 2. Invoca `search_project_context`, `get_document_full` o `list_project_structure`. 3. El servidor valida alcance de `project_slug` y devuelve Markdown estructurado. | **FA-1:** Documento inexistente o proyecto no autorizado $\rightarrow$ devuelve respuesta de error JSON-RPC tipada sin filtrar rutas internas. | Agente de IA provisto de contexto arquitectónico certificado en milisegundos. |
| **`CU-11`** | **Colaborar en Tiempo Real y Anotar Documentos** | `ACT-01`, `ACT-02` | — | Conexión WebSocket activa sobre el proyecto/documento. | 1. Registra presencia en vivo de lectores/editores. 2. Permite publicar comentarios anclados a sección y calificar utilidad (1–5). 3. Difunde eventos en tiempo real a los suscriptores conectados. | **FA-1:** Caída temporal de red $\rightarrow$ cliente WebSocket aplica reconexión automática exponencial y resincroniza estado. | Comentarios, hilos y calificaciones persistidos y visibles instantáneamente sin recargar página. |
| **`CU-12`** | **Extender el Componente SDK sin Modificar el Núcleo** | `ACT-03` | — | Paquete `contextforge` instalado en proyecto consumidor. | 1. El integrador implementa una subclase de `IBundleExporter`, `IHybridRankingStrategy`, `IChunkingStrategy`, `IDocumentRule` o `ILLMProvider`. 2. La registra en `ContextForgeBuilder`. 3. Ejecuta operaciones usando su extensión. | **FA-1:** Subclase no implementa método abstracto requerido $\rightarrow$ Python ABC impide instanciación en tiempo temprano (`TypeError`). | Comportamiento extendido cumpliendo estrictamente el Principio Abierto/Cerrado (**OCP**, `BR-15`). |
| **`CU-13`** | **Configurar y Diagnosticar Motores Multi-LLM y BD** | `ACT-04` | `<<include>>` `CU-14` | Actor autenticado con rol `Admin`. | 1. Configura proveedor de BD (`DatabaseFactory`) o LLM (Ollama, OpenAI, Gemini, CLI local). 2. Cifra secretos con `AES-256-GCM`. 3. Ejecuta sonda `test_connection` midiendo `latency_ms`. | **FA-1:** Host inalcanzable o credencial inválida $\rightarrow$ retorna diagnóstico accionable sin activar el proveedor fallido. | Infraestructura verificada y conmutada en caliente sin pérdida de configuración previa. |
| **`CU-14`** | **Autenticar Identidad, Gestionar RBAC y Auditar** | `ACT-04`, `ACT-01`..`03` | Transversal (`<<include>>`) | Sistema en modo `enterprise_rbac` o bitácora activa. | 1. Valida JWT/OIDC o `X-API-Key` y verifica permiso RBAC sobre el recurso. 2. Envuelve la operación con `AuditingOperationDecorator` / persistencia `audit_logs` (`BR-14`). | **FA-1:** Token expirado (`401`) o rol insuficiente (`403`) $\rightarrow$ deniega operación y registra intento fallido en auditoría. | Acceso controlado bajo mínimo privilegio y trazabilidad completa no repudiable. |

---

## 3.3 Especificación Formal de Requerimientos Funcionales (`RF-[MOD]-[NNN]`)

Cada requerimiento funcional se redacta aplicando rigurosamente la gramática formal exigida por las guías de Ingeniería de Requerimientos e ISO/IEC/IEEE 29148:
> *[En el contexto/módulo X, cuando ocurre el evento o condición Y], el sistema [debe / deberá / no debe] [acción técnica precisa] [sobre el objeto/sujeto Z] [para lograr el resultado esperado W].*

---

### 3.3.1 Módulo `PRJ`: Gobernanza Multi-Proyecto y Taxonomía

#### Ficha `RF-PRJ-001` — Registro y Aprovisionamiento de Espacio de Proyecto

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-PRJ-001` — Registro y aprovisionamiento de espacio de proyecto aislado** |
| **Prioridad / Origen** | **Alta** · **Mixto** (`Base AS-IS` + políticas de cuota y soberanía `Mejora Propuesta TO-BE`) |
| **Enunciado Formal** | En el módulo de gobernanza multi-proyecto (`PRJ`), cuando un administrador solicita registrar un nuevo espacio de conocimiento, el sistema **debe** validar la unicidad del `slug` y la seguridad de la ruta documental, aprovisionando el registro del proyecto y su directorio base aislado para habilitar la gestión independiente de libros, índices y sesiones RAG. |
| **Precondiciones** | El actor posee rol `Admin` (o ejecuta en modo local autorizado) y el motor de persistencia relacional se encuentra disponible. |
| **Entradas** | `name: str` (3–100 car.), `slug: str` (3–50 car., regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`), `description: str` (opcional, $\le 500$ car.), `path: str` (ruta relativa dentro del workspace permitido), `sovereign_only: bool = false`, `max_quota_mb: int = 1024`. |
| **Procesamiento Paso a Paso** | 1. Normalizar `slug` y verificar invariante `BR-01` consultando `projects.slug`.<br>2. Resolver canónicamente `path` y comprobar `BR-03` (ausencia de *path traversal* y no colisión con otro proyecto).<br>3. Crear directorio físico si no existe e inicializar subcarpetas de documentos y anexos.<br>4. Persistir entidad `ProjectORM` dentro de transacción `UnitOfWork` y emitir evento de auditoría `project.created`. |
| **Salidas** | **Éxito (`201 Created`):** DTO JSON del proyecto creado con `slug`, `path`, `sovereign_only` y `created_at` UTC.<br>**Errores (`application/problem+json` RFC 7807):** `409 Conflict` (`type: "/errors/duplicate-project-slug"`), `422 Unprocessable Entity` (`type: "/errors/invalid-project-path"`). |
| **Postcondiciones** | El proyecto queda registrado, con directorio físico válido y colección lógica aislada lista para indexación. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un administrador autenticado en la vista `/projects` o API `/api/v1/projects`<br>**Cuando** envía `name="Pagos Core"`, `slug="pagos-core"` y `path="./docs/pagos-core"` sin colisiones previas<br>**Entonces** el sistema responde `201 Created`, crea la carpeta física y lista el proyecto sin mezclar documentos de `default`. |

#### Ficha `RF-PRJ-002` — Conmutación de Proyecto Activo y Aislamiento de Contexto

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-PRJ-002` — Conmutación de contexto activo y aislamiento estricto multi-tenant** |
| **Prioridad / Origen** | **Alta** · **Base (`AS-IS`)** |
| **Enunciado Formal** | En el módulo de gobernanza multi-proyecto (`PRJ`), cuando un usuario o agente selecciona o parametriza un `project_slug` activo, el sistema **debe** acotar todas las consultas documentales, búsquedas híbridas, sesiones de chat y compilaciones de bundles exclusivamente a dicho proyecto para impedir fugas cruzadas de información entre espacios distintos. |
| **Precondiciones** | El `project_slug` solicitado existe en la tabla `projects` y el actor tiene permiso de lectura sobre él. |
| **Entradas** | `project_slug: str` (vía selector global de UI, query param, cuerpo JSON o parámetro de herramienta MCP). |
| **Procesamiento Paso a Paso** | 1. Verificar existencia de `project_slug` y membresía/permiso del solicitante.<br>2. Fijar el contexto activo en el estado de sesión del cliente o en el comando/query CQRS.<br>3. Aplicar obligatoriamente predicado `WHERE library_slug = :project_slug` en SQL y filtro de metadatos `{"project_slug": project_slug}` en BM25 y ChromaDB (`BR-10`). |
| **Salidas** | **Éxito (`200 OK`):** Confirmación del proyecto activo con contadores actualizados de documentos, módulos y estado del índice.<br>**Errores (RFC 7807):** `404 Not Found` (`type: "/errors/project-not-found"`), `403 Forbidden` (`type: "/errors/project-access-denied"`). |
| **Postcondiciones** | Ninguna vista ni respuesta posterior expone registros pertenecientes a un `project_slug` diferente al seleccionado. |
| **Criterios de Aceptación (Gherkin)** | **Dado** que existen los proyectos `alfa` y `beta` con documentos propios<br>**Cuando** el usuario conmuta el selector activo a `beta` y ejecuta una búsqueda en `/docs/browser`<br>**Entonces** el sistema retorna únicamente documentos de `beta` y cero coincidencias provenientes de `alfa`. |

#### Ficha `RF-PRJ-003` — Gestión de Taxonomía de Módulos y Etiquetas

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-PRJ-003` — Administración de módulos funcionales y etiquetas de clasificación** |
| **Prioridad / Origen** | **Media** · **Base (`AS-IS`)** |
| **Enunciado Formal** | En el módulo de gobernanza multi-proyecto (`PRJ`), cuando un curador documental crea o actualiza un módulo funcional o una etiqueta dentro de un proyecto, el sistema **debe** normalizar su identificador `slug` y persistir sus atributos visuales y semánticos sobre el catálogo taxonómico para estructurar la navegación y el filtrado focalizado en búsquedas RAG. |
| **Precondiciones** | Proyecto válido seleccionado y usuario con rol `Curator` o `Admin`. |
| **Entradas** | `entity_type: "module" | "tag"`, `name: str` (2–100 car.), `slug: str | None`, `description: str` (para módulos), `color: str` (token cromático permitido), `project_slug: str`. |
| **Procesamiento Paso a Paso** | 1. Derivar `slug` canónico en `snake_case`/`kebab-case` si no fue suministrado.<br>2. Validar ausencia de colisión de `slug` dentro del mismo `project_slug`.<br>3. Persistir `ModuleORM` o `TagORM` y refrescar facetas de filtrado del explorador. |
| **Salidas** | **Éxito (`201 Created` / `200 OK`):** Objeto `ModuleEntity` o `TagEntity` serializado.<br>**Errores (RFC 7807):** `409 Conflict` por `slug` repetido; `422 Unprocessable Entity` por nombre vacío. |
| **Postcondiciones** | El módulo o etiqueta queda disponible inmediatamente para clasificar libros/documentos y acotar búsquedas (`collection`). |
| **Criterios de Aceptación (Gherkin)** | **Dado** un curador ubicado en el proyecto `default`<br>**Cuando** registra el módulo `Seguridad OAuth2` con color `emerald`<br>**Entonces** el sistema genera el `slug` `seguridad_oauth2`, lo persiste y lo habilita como filtro en el navegador documental y en el chat RAG. |

#### Ficha `RF-PRJ-004` — Sincronización Bidireccional con Directorio *Docs-as-Code*

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-PRJ-004` — Descubrimiento y sincronización segura de archivos Markdown en disco** |
| **Prioridad / Origen** | **Alta** · **Mixto** (`Base AS-IS` + reconciliación por hash `TO-BE`) |
| **Enunciado Formal** | En el módulo de gobernanza multi-proyecto (`PRJ`), cuando se detectan cambios en el directorio físico del proyecto o se solicita una sincronización manual, el sistema **debe** escanear recursivamente los archivos `.md`, reconciliar sus metadatos *frontmatter* YAML con la base de datos y programar la reindexación únicamente de los archivos modificados para preservar coherencia entre Git y la plataforma. |
| **Precondiciones** | Directorio `project.path` existente y accesible con permisos de lectura/escritura por el proceso de aplicación. |
| **Entradas** | `project_slug: str`, `pattern: str = "*.md"`, `dry_run: bool = false`. |
| **Procesamiento Paso a Paso** | 1. Recorrer archivos coincidentes validando `BR-03` (ningún enlace simbólico fuera de raíz).<br>2. Extraer *frontmatter* YAML opcional (`title`, `module`, `tags`, `status`) y calcular `SHA-256` del contenido.<br>3. Insertar nuevos documentos, actualizar aquellos cuyo hash difiera y marcar como archivados/huérfanos los eliminados en disco.<br>4. Emitir resumen `SyncReport` y encolar trabajos incrementales de indexación (`RF-RAG-001`). |
| **Salidas** | **Éxito (`200 OK`):** `SyncReport` (`added_count`, `updated_count`, `unchanged_count`, `archived_count`, `duration_ms`).<br>**Errores (RFC 7807):** `403 Forbidden` si se detecta intento de escape de directorio; `500` con detalle de E/S si el volumen no está montado. |
| **Postcondiciones** | El catálogo relacional refleja fielmente el árbol de archivos Markdown del repositorio sin reprocesar archivos intactos. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un repositorio con 50 archivos `.md` previamente sincronizados donde solo 2 fueron editados vía `git pull`<br>**Cuando** se ejecuta la sincronización del proyecto<br>**Entonces** el sistema reporta `updated_count = 2`, `unchanged_count = 48` y reindexa únicamente los 2 documentos alterados. |

---

### 3.3.2 Módulo `DOC`: Gestión Documental *Docs-as-Code*, Ciclo Editorial y Versionado

#### Ficha `RF-DOC-001` — Creación e Ingesta Validada de Documento Técnico

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-DOC-001` — Creación e ingesta de documento Markdown con cadena de reglas `IDocumentRule`** |
| **Prioridad / Origen** | **Alta** · **Base (`AS-IS`)** |
| **Enunciado Formal** | En el módulo de gestión documental (`DOC`), cuando un actor envía un nuevo documento para su incorporación al repositorio o al motor `ContextForge`, el sistema **debe** evaluar secuencialmente todas las reglas registradas en `DocumentRuleChain` antes de persistir el contenido para garantizar que ningún documento inválido o malformado ingrese a la base de conocimiento. |
| **Precondiciones** | Proyecto válido; en el SDK `ContextForge` instanciado; en plataforma web actor con rol `Curator` o `Admin`. |
| **Entradas** | `doc_id / path: str`, `title: str` (1–200 car.), `collection / module_name: str`, `tags: Sequence[str]`, `content: str` (Markdown no vacío, $\le 500\,000$ car.), `status: str = "draft"`. |
| **Procesamiento Paso a Paso** | 1. Construir objeto de dominio `KnowledgeDocument` / comando `CreateDocumentCommand`.<br>2. Ejecutar `DocumentRuleChain.validate_all(document)` verificando `NonEmptyIdRule`, `TitleRequiredRule`, `NonEmptyContentRule`, `MaxContentLengthRule` y cualquier `IDocumentRule` personalizada (`BR-02`, `BR-15`).<br>3. Escribir archivo `.md` con *frontmatter* normalizado (en modo plataforma) y registrar `BookORM` + versión `v1`.<br>4. Publicar evento `knowledge.ingested` en `KnowledgeEventBus`. |
| **Salidas** | **Éxito (`201 Created` / `IngestionReport`):** Identificador del documento, `version = 1`, `chunks_created` y `latency_ms`.<br>**Errores:** En SDK lanza `DocumentValidationError(message, rule_name)`; en HTTP retorna `422 Unprocessable Entity` RFC 7807 indicando `rule_name`. |
| **Postcondiciones** | El documento válido queda almacenado de forma atómica; si infringe alguna regla, no se escribe en disco ni en los almacenes de búsqueda. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un motor ContextForge con las reglas estándar activas<br>**Cuando** un cliente intenta ingestar un `KnowledgeDocument` con `title=""` o `content="   "`<br>**Entonces** el sistema rechaza la operación con `DocumentValidationError` (`rule_name="non_empty_title"` o `"non_empty_content"`) y mantiene intacto el conteo de documentos. |

#### Ficha `RF-DOC-002` — Edición Enriquecida con Vista Dividida y Concurrencia Optimista

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-DOC-002` — Edición de documentos Markdown con prevención de sobrescritura concurrente** |
| **Prioridad / Origen** | **Alta** · **Mixto** (`Editor dividido Base AS-IS` + concurrencia optimista `ETag` `Mejora Propuesta TO-BE`) |
| **Enunciado Formal** | En el módulo de gestión documental (`DOC`), cuando un curador guarda modificaciones sobre un documento existente, el sistema **debe** verificar la coincidencia del número de versión o cabecera `If-Match (ETag)` antes de persistir el nuevo contenido para impedir la pérdida silenciosa de ediciones concurrentes realizadas por otros colaboradores. |
| **Precondiciones** | El documento existe, no se encuentra en estado `DEPRECATED` (`BR-05`) y el usuario posee permisos de edición. |
| **Entradas** | `doc_id: str`, `title: str`, `content_markdown: str`, `module_name: str`, `tags: list[str]`, `expected_version: int` (o header HTTP `If-Match`), `change_summary: str` (opcional, $\le 250$ car.). |
| **Procesamiento Paso a Paso** | 1. Consultar versión actual del documento dentro de transacción.<br>2. Comprobar `BR-05` (`status != DEPRECATED`) y `BR-11` (`current_version == expected_version`). Si difiere, abortar con conflicto.<br>3. Validar reglas `BR-02` sobre el nuevo contenido.<br>4. Incrementar `current_version`, insertar fila inmutable en `document_versions`, sincronizar archivo físico `.md` y emitir notificación WebSocket `document.updated`. |
| **Salidas** | **Éxito (`200 OK`):** Documento actualizado con nuevo `ETag` / `current_version` y marca temporal `updated_at`.<br>**Errores (RFC 7807):** `409 Conflict` (`type: "/errors/concurrent-modification"`, incluye `server_version` y `server_content` para *merge*), `423 Locked` si está `DEPRECATED`. |
| **Postcondiciones** | El archivo Markdown y la base de datos quedan sincronizados en la versión $N+1$ conservando intacta la versión $N$. |
| **Criterios de Aceptación (Gherkin)** | **Dado** que dos arquitectos abrieron simultáneamente `arch/eventos.md` en la versión `3`<br>**Cuando** el primero guarda pasando a versión `4` y segundos después el segundo intenta guardar enviando `expected_version = 3`<br>**Entonces** el sistema responde `409 Conflict`, evita sobrescribir la versión `4` y presenta al segundo usuario las diferencias para conciliar sus cambios. |

#### Ficha `RF-DOC-003` — Gestión del Flujo de Estados Editoriales y Compuerta RAG

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-DOC-003` — Transición gobernada de estados editoriales y elegibilidad para RAG** |
| **Prioridad / Origen** | **Alta** · **Mejora Propuesta (`TO-BE`)** |
| **Enunciado Formal** | En el módulo de gestión documental (`DOC`), cuando un actor autorizado solicita cambiar el estado editorial de un documento, el sistema **debe** validar que la transición respete el autómata finito del ciclo documental y actualizar su visibilidad en los índices productivos de búsqueda y MCP para asegurar que los agentes de IA consuman exclusivamente conocimiento certificado (`PUBLISHED`). |
| **Precondiciones** | Documento registrado; rol `Author/Curator` para enviar a revisión y rol `Curator/Admin` para publicar o retirar. |
| **Entradas** | `doc_id: str`, `target_status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "DEPRECATED"`, `review_comment: str | None`. |
| **Procesamiento Paso a Paso** | 1. Verificar que el par `(current_status, target_status)` sea válido conforme a `BR-05`.<br>2. Si `target_status == "PUBLISHED"`, promover la versión actual como versión publicada vigente y disparar indexación en el índice activo de RAG (`BR-04`).<br>3. Si `target_status == "DEPRECATED"`, remover sus fragmentos del índice activo de RAG para evitar respuestas obsoletas, preservando el documento para consulta histórica.<br>4. Asentar registro en `audit_logs` con actor, estado previo, estado nuevo y justificación. |
| **Salidas** | **Éxito (`200 OK`):** Estado actualizado, versión publicada vigente y estado de indexación.<br>**Errores (RFC 7807):** `409 Conflict` (`type: "/errors/invalid-editorial-transition"`), `403 Forbidden` si carece de rol aprobador. |
| **Postcondiciones** | El índice productivo RAG/MCP contiene todos y solo los fragmentos correspondientes a versiones `PUBLISHED`. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un documento `seguridad/jwt.md` recién creado en estado `DRAFT`<br>**Cuando** un desarrollador pregunta al chat RAG por el contenido de dicho documento antes de su aprobación<br>**Entonces** el motor RAG no incluye fragmentos de `seguridad/jwt.md`; y **Cuando** un curador lo transiciona a `IN_REVIEW` y luego a `PUBLISHED`, la consulta RAG subsiguiente sí recupera y cita dicho documento. |

#### Ficha `RF-DOC-004` — Historial Inmutable de Versiones, Comparación (*Diff*) y Reversión

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-DOC-004` — Consulta de historial de versiones, comparación de diferencias y *rollback*** |
| **Prioridad / Origen** | **Media** · **Mejora Propuesta (`TO-BE`)** |
| **Enunciado Formal** | En el módulo de gestión documental (`DOC`), cuando un curador inspecciona la evolución de un documento o solicita restaurar una versión anterior, el sistema **debe** presentar las diferencias línea por línea (*unified diff*) entre revisiones y ejecutar la restauración creando una nueva versión secuencial a partir de la instantánea elegida para preservar trazabilidad histórica inalterable. |
| **Precondiciones** | Documento existente con al menos una entrada en `document_versions`. |
| **Entradas** | Para comparación: `doc_id: str`, `from_version: int`, `to_version: int`. Para reversión: `doc_id: str`, `target_version: int`, `reason: str` (obligatorio, 5–250 car.). |
| **Procesamiento Paso a Paso** | 1. Recuperar instantáneas inmutables solicitadas desde `document_versions`.<br>2. En modo comparación, calcular `unified_diff` determinista con conteo de líneas añadidas/eliminadas.<br>3. En modo reversión (`BR-06`), copiar el contenido de `target_version` hacia una nueva versión $N+1$ (`change_summary = "Rollback a v{target}: {reason}"`), actualizar el archivo `.md` y reencolar indexación si aplica. |
| **Salidas** | **Éxito (`200 OK`):** Listado paginado de versiones, estructura `DiffResult` o confirmación de nueva versión restaurada.<br>**Errores (RFC 7807):** `404 Not Found` si `target_version` no existe para ese documento. |
| **Postcondiciones** | El documento vuelve al contenido deseado sin haber destruido ninguna versión intermedia del historial. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un documento en versión `5` donde se introdujo un error accidental respecto a la versión `3`<br>**Cuando** el curador ejecuta *rollback* hacia la versión `3` indicando el motivo<br>**Entonces** el sistema crea la versión `6` idéntica en contenido a la `3`, mantiene las versiones `1..5` auditables y actualiza el archivo en disco. |

#### Ficha `RF-DOC-005` — Carga, Validación y Extracción Textual de Anexos Técnicos

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-DOC-005` — Gestión segura y extracción de texto de archivos adjuntos técnicos** |
| **Prioridad / Origen** | **Media** · **Mixto** (`Carga y extracción Base AS-IS` + firma MIME y `SHA-256` `TO-BE`) |
| **Enunciado Formal** | En el módulo de gestión documental (`DOC`), cuando un usuario adjunta un archivo complementario a un libro o especificación, el sistema **debe** verificar su tipo MIME real, tamaño máximo y suma criptográfica `SHA-256`, almacenarlo de forma aislada y extraer su contenido textual indexable para enriquecer la búsqueda híbrida sobre artefactos PDF, Word y diagramas. |
| **Precondiciones** | Libro o documento contenedor existente; cuota disponible en el proyecto; actor con permiso de edición. |
| **Entradas** | Flujo multiparte `file: UploadFile`, `book_id: str`, `project_slug: str`. |
| **Procesamiento Paso a Paso** | 1. Validar tamaño `<= 25 MB` y extensión/cabecera mágica MIME permitida conforme a `BR-16` y ruta segura `BR-03`.<br>2. Calcular huella `SHA-256` durante la lectura por bloques (*chunks* de 64 KB).<br>3. Guardar binario en el almacén del proyecto y persistir `AttachmentORM`.<br>4. Invocar extractor documental correspondiente (PDF/DOCX/TXT/XML Draw.io) y enviar el texto extraído al pipeline de indexación vinculado a `book_id`. |
| **Salidas** | **Éxito (`201 Created`):** Metadatos del anexo (`id`, `file_name`, `mime_type`, `size_bytes`, `sha256_checksum`, `extracted_chars`).<br>**Errores (RFC 7807):** `413 Payload Too Large` (> 25 MB), `415 Unsupported Media Type` (ejecutables `.exe`, `.bat`, `.sh` rechazados). |
| **Postcondiciones** | El anexo es descargable de forma segura y sus párrafos relevantes pueden ser recuperados y citados en consultas híbridas. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un libro de arquitectura en el proyecto `default`<br>**Cuando** el arquitecto sube un manual técnico en PDF de `4 MB` válido<br>**Entonces** el sistema responde `201 Created` con su `sha256_checksum` e indexa su texto; pero si intenta subir un archivo `script.exe`, responde `415 Unsupported Media Type`. |

---

### 3.3.3 Módulo `RAG`: Indexación Incremental, Búsqueda Híbrida y Generación RAG con Citas

#### Ficha `RF-RAG-001` — Segmentación Semántica e Indexación Incremental Asíncrona con DLQ

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-RAG-001` — Segmentación sensible a encabezados y reindexación incremental con DLQ** |
| **Prioridad / Origen** | **Alta** · **Mixto** (`Chunking e indexación dual Base AS-IS` + cola incremental/DLQ `Mejora Propuesta TO-BE`) |
| **Enunciado Formal** | En el módulo de recuperación e inteligencia (`RAG`), cuando un documento publicado se crea o modifica su huella `SHA-256`, el sistema **deberá** dividirlo mediante la estrategia `IChunkingStrategy` configurada y actualizar asíncronamente los índices léxico y vectorial con política de reintentos y cola de fallos (`DLQ`) para mantener la frescura de búsqueda sin bloquear las operaciones del usuario. |
| **Precondiciones** | Documento válido en estado elegible para indexación; estrategia de *chunking* registrada (`heading_aware` o `sliding_window`). |
| **Entradas** | `document: KnowledgeDocument`, `chunking_strategy: str = "heading_aware"`, `content_hash: str`. |
| **Procesamiento Paso a Paso** | 1. Comparar `content_hash` contra el último hash indexado; si coincide, omitir trabajo por idempotencia.<br>2. Resolver estrategia en `StrategyFactory.get_chunker()` y generar `DocumentChunk[]` preservando jerarquía de encabezados Markdown (`headers: tuple[str, ...]`).<br>3. Reemplazar atómicamente los chunks previos del `doc_id` en `ILexicalStore` (BM25) y `IVectorStore` (ChromaDB / embeddings).<br>4. Ante error de infraestructura en modo servidor, aplicar hasta 3 reintentos con *backoff* exponencial (1 s, 3 s, 9 s); si persiste, mover `IndexingJob` a estado `DEAD_LETTER` con traza diagnóstica. |
| **Salidas** | **Éxito:** `IngestionReport` / `IndexingJobStatus` (`chunks_created`, `chunking_strategy`, `latency_ms`, `status="COMPLETED"`).<br>**Errores:** `UnknownStrategyError` (`400`) ante estrategia inexistente; registro en `DLQ` consultable en `/settings` si falla el almacén externo. |
| **Postcondiciones** | Los fragmentos actualizados quedan indexados sin duplicados residuales de versiones anteriores del mismo documento. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un documento Markdown con tres secciones `## Contexto`, `## Decisión` y `## Consecuencias`<br>**Cuando** se indexa con la estrategia `heading_aware`<br>**Entonces** cada `DocumentChunk` generado conserva en su tupla `headers` la ruta exacta de encabezados a la que pertenece. |

#### Ficha `RF-RAG-002` — Búsqueda Híbrida Léxico-Vectorial con Fusión RRF / Ponderada

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-RAG-002` — Recuperación híbrida configurable (BM25 + Vectorial) con fusión determinista** |
| **Prioridad / Origen** | **Alta** · **Base (`AS-IS`)** |
| **Enunciado Formal** | En el módulo de recuperación e inteligencia (`RAG`), cuando un consumidor ejecuta una consulta de búsqueda especificando modo y política de ranking, el sistema **debe** recuperar candidatos desde los almacenes léxico y vectorial filtrados por proyecto y fusionarlos mediante `IHybridRankingStrategy` para entregar fragmentos relevantes tanto por coincidencia exacta de identificadores como por similitud semántica. |
| **Precondiciones** | `query` no vacía tras recortar espacios y `top_k >= 1`. |
| **Entradas** | `query: str` (1–1 000 car.), `top_k: int = 5` (1–50), `mode: "lexical" | "vector" | "hybrid" = "hybrid"`, `ranking: str = "rrf"` (`"rrf"`, `"weighted"` o custom), `collection: str | None = None`, `project_slug: str = "default"`. |
| **Procesamiento Paso a Paso** | 1. Validar parámetros (`query.strip() != ""`, `1 <= top_k <= 50`) y existencia de modo/estrategia en `StrategyFactory`.<br>2. Aplicar filtro estricto de aislamiento `project_slug` (`BR-10`), estado `PUBLISHED` (`BR-04`) y colección opcional.<br>3. En modo `hybrid`, consultar candidatos ampliados ($\max(top\_k \times 2, 10)$) en `ILexicalStore` y `IVectorStore`, e invocar `ranker.fuse(lexical_hits, vector_hits, top_k)` conforme a `BR-07`.<br>4. Emitir evento `knowledge.searched` y registrar `latency_ms` mediante `AuditingOperationDecorator`. |
| **Salidas** | **Éxito (`200 OK` / `list[SearchHit]`):** Arreglo ordenado de `SearchHit(chunk_id, doc_id, title, text, score, source_type, collection, headers)`.<br>**Errores:** `ValueError` / `400 Bad Request` si `query` vacía o `top_k < 1`; `UnknownStrategyError` / `422` si modo o ranker no registrado. |
| **Postcondiciones** | Operación de solo lectura libre de efectos colaterales sobre el corpus, registrada en métricas de latencia. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un corpus que contiene el código exacto `ERR_WEBHOOK_504` y párrafos conceptuales sobre resiliencia de pasarelas<br>**Cuando** se consulta `"ERR_WEBHOOK_504 reintentos pasarela"` con `mode="hybrid"` y `ranking="rrf"`<br>**Entonces** el primer resultado fusionado recupera el fragmento exacto con `source_type="hybrid"` y puntaje estrictamente mayor a cero. |

#### Ficha `RF-RAG-003` — Generación RAG con *Streaming* SSE, Citas Verificables y Abstención

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-RAG-003` — Consulta conversacional RAG con atribución exacta de fuentes y abstención controlada** |
| **Prioridad / Origen** | **Alta** · **Mixto** (`Pipeline RAG + SSE + Citas Base AS-IS` + umbral de abstención `Mejora Propuesta TO-BE`) |
| **Enunciado Formal** | En el módulo de recuperación e inteligencia (`RAG`), cuando un usuario o agente formula una pregunta técnica al motor `ask()` o al endpoint conversacional, el sistema **debe** anclar la síntesis generativa exclusivamente en los fragmentos recuperados, transmitir progresivamente la respuesta junto con citas estructuradas (`SourceCitation`) y abstenerse de inventar afirmaciones cuando la evidencia supere por debajo el umbral mínimo de relevancia. |
| **Precondiciones** | Base de conocimiento no vacía; proveedor `ILLMProvider` activo (o proveedor extractivo local habilitado). |
| **Entradas** | `question: str` (2–4 000 car.), `top_k: int = 5`, `mode: str = "hybrid"`, `ranking: str = "rrf"`, `system_prompt: str | None`, `session_id: str | None`, `stream: bool = true`. |
| **Procesamiento Paso a Paso** | 1. Verificar que el proyecto posea documentos indexados; de lo contrario lanzar `EmptyKnowledgeBaseError`.<br>2. Recuperar los `top_k` fragmentos publicados mediante `RF-RAG-002` y evaluar umbral de evidencia `BR-08` (`max_score >= min_grounding_score`). Si ningún fragmento califica, retornar mensaje de abstención fundamentada con `grounded=false`.<br>3. Construir `SourceCitation[]` inmutables y ensamblar prompt acotado instruyendo citación explícita `[doc_id]`.<br>4. Invocar `ILLMProvider.generate()` (o flujo SSE token a token con soporte de cancelación por cliente); ante fallo externo aplicar `BR-12` (*fallback* controlado o `ProviderUnavailableError`). |
| **Salidas** | **Éxito (`200 OK` JSON / `text/event-stream` SSE / `RagResponse`):** `answer`, `citations: tuple[SourceCitation, ...]`, `provider_name`, `grounded: bool`, `latency_ms`.<br>**Errores:** `EmptyKnowledgeBaseError` (`409`), `ProviderUnavailableError` (`503 Service Unavailable` RFC 7807 con sugerencia de activar modo local). |
| **Postcondiciones** | Si `session_id` fue provisto, tanto la pregunta del usuario como la respuesta y su JSON de citas quedan persistidos en `chat_messages`. |
| **Criterios de Aceptación (Gherkin)** | **Dado** que el documento publicado `engineering/retries.md` especifica `"máximo 5 intentos con backoff exponencial"`<br>**Cuando** el usuario pregunta `"¿Cuántos reintentos aplica un webhook?"`<br>**Entonces** el sistema responde mencionando los 5 intentos, establece `grounded=true` e incluye `engineering/retries.md` dentro de `citations`. |

#### Ficha `RF-RAG-004` — Sesiones Conversacionales Acotadas y Filtro de Soberanía / DLP

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-RAG-004` — Gestión de historial de sesiones RAG y protección soberana contra fuga de secretos** |
| **Prioridad / Origen** | **Alta** · **Mixto** (`Sesiones acotadas Base AS-IS` + redacción DLP y bloqueo `sovereign_only` `Mejora Propuesta TO-BE`) |
| **Enunciado Formal** | En el módulo de recuperación e inteligencia (`RAG`), cuando se inicia o continúa una sesión de chat sobre un proyecto o libro específico, el sistema **debe** conservar la memoria conversacional aislada y aplicar políticas de soberanía (`sovereign_only`) y enmascaramiento preventivo de secretos antes de contactar cualquier LLM externo para proteger información confidencial y datos personales. |
| **Precondiciones** | Proyecto válido existente; usuario autenticado o sesión local activa. |
| **Entradas** | `project_slug: str`, `book_id: str | None` (alcance opcional a un libro), `session_id: str | None`, `message: str`. |
| **Procesamiento Paso a Paso** | 1. Crear o recuperar `ChatSessionORM` verificando correspondencia con `project_slug` (`BR-10`).<br>2. Si `project.sovereign_only == true` y el proveedor activo apunta fuera de red local, bloquear envío externo conforme a `BR-13` y redirigir a Ollama local / modo extractivo.<br>3. Si el destino es un LLM remoto permitido, ejecutar escáner de patrones sensibles (claves privadas PEM, tokens `sk-*`, documentos de identidad/correos personales según configuración DLP) reemplazándolos por marcadores `[REDACTED]`.<br>4. Permitir reiniciar o eliminar sesiones obsoletas limpiando `chat_messages` asociados. |
| **Salidas** | **Éxito (`200 OK`):** Historial de turnos de la sesión con citas hidratadas e indicador de modo soberano.<br>**Errores (RFC 7807):** `403 Forbidden` (`type: "/errors/sovereign-policy-violation"` si se fuerza proveedor externo prohibido). |
| **Postcondiciones** | Ningún fragmento confidencial de un proyecto `sovereign_only` abandona el perímetro local en peticiones HTTP salientes. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un proyecto marcado con `sovereign_only = true` y un proveedor global OpenAI configurado<br>**Cuando** un desarrollador realiza una consulta en `/chat` sobre dicho proyecto<br>**Entonces** el sistema impide cualquier llamada hacia `api.openai.com`, procesa la consulta con el motor local autorizado y muestra la insignia de ejecución soberana. |

---

### 3.3.4 Módulo `BND`: Compilación de *Context Bundles*, SDK Reutilizable y Servidor MCP

#### Ficha `RF-BND-001` — Compilación Determinista de *Context Bundles* con Presupuesto de Tokens

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-BND-001` — Compilación de paquetes de contexto gobernados por presupuesto `max_tokens`** |
| **Prioridad / Origen** | **Alta** · **Base (`AS-IS`)** |
| **Enunciado Formal** | En el módulo de empaquetado e integración (`BND`), cuando un consumidor solicita compilar un *Context Bundle* mediante selección explícita de documentos o consulta semántica, el sistema **debe** calcular determinísticamente el costo en tokens de cada documento candidato e incluir únicamente aquellos que quepan dentro de `max_tokens` para prevenir el desbordamiento de la ventana de contexto del agente consumidor. |
| **Precondiciones** | `name` no vacío, `max_tokens >= 50` y al menos un documento publicado disponible en el alcance solicitado. |
| **Entradas** | `name: str` (1–150 car.), `query: str | None`, `document_ids: Sequence[str] | None`, `max_tokens: int = 4000`, `export_format: str = "markdown"`, `project_slug: str = "default"`. |
| **Procesamiento Paso a Paso** | 1. Validar nombre y verificar invariante `BR-09` (`max_tokens >= 50`; si es menor lanzar `TokenBudgetExceededError`).<br>2. Seleccionar documentos candidatos en orden de prioridad (explícitos en `document_ids` o ranqueados vía `RF-RAG-002` si se indicó `query`).<br>3. Acumular documentos mientras `running_tokens + doc_tokens + overhead <= max_tokens`; clasificar los restantes en `omitted_doc_ids`.<br>4. Invocar el exportador registrado y construir `ContextBundle` inmutable con `estimated_tokens <= max_tokens`. |
| **Salidas** | **Éxito (`201 Created` / `ContextBundle`):** `bundle_id`, `name`, `export_format`, `content`, `included_doc_ids`, `omitted_doc_ids`, `estimated_tokens`, `max_tokens`, `created_at`.<br>**Errores:** `TokenBudgetExceededError` (`422`), `EmptyKnowledgeBaseError` (`409`). |
| **Postcondiciones** | El paquete resultante cumple matemáticamente `estimated_tokens <= max_tokens` y reporta con transparencia cualquier documento omitido por cupo. |
| **Criterios de Aceptación (Gherkin)** | **Dado** tres documentos cuyos tamaños equivalen a `600`, `600` y `600` tokens respectivamente<br>**Cuando** se compila un bundle con `max_tokens = 1350`<br>**Entonces** el sistema incluye los dos primeros en `included_doc_ids`, registra el tercero en `omitted_doc_ids` y garantiza `estimated_tokens <= 1350`. |

#### Ficha `RF-BND-002` — Exportación Polimórfica y Manifiesto Reproducible de Bundles

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-BND-002` — Serialización multi-formato (`Markdown`, `JSON`, `XML`) y persistencia de manifiesto** |
| **Prioridad / Origen** | **Media** · **Mixto** (`Exportadores polimórficos Base AS-IS` + manifiesto relacional de versiones `TO-BE`) |
| **Enunciado Formal** | En el módulo de empaquetado e integración (`BND`), cuando se genera o descarga un *Context Bundle*, el sistema **debe** delegar su serialización al `IBundleExporter` correspondiente al formato elegido y persistir un manifiesto con los hashes de versión exactos de los documentos incluidos para asegurar interoperabilidad y reproducibilidad forense del contexto entregado a la IA. |
| **Precondiciones** | Formato solicitado registrado en `BundleExporterRegistry` (`markdown`, `json`, `xml` o extensión custom). |
| **Entradas** | `bundle_id` o solicitud de compilación con `export_format: str`, `persist_manifest: bool = true`. |
| **Procesamiento Paso a Paso** | 1. Resolver exportador en `BundleExporterRegistry.get(export_format)`; si no existe lanzar `UnknownExportFormatError`.<br>2. Serializar estructura limpia con cabeceras de trazabilidad, delimitadores claros para LLMs y escape válido (JSON RFC 8259 / XML bien formado).<br>3. Calcular `bundle_hash` (`SHA-256`) y guardar registro maestro `context_bundles` junto con `bundle_items` (`book_id`, `version_number`, `content_hash`). |
| **Salidas** | **Éxito (`200 OK`):** Archivo descargable o payload con tipo MIME apropiado (`text/markdown`, `application/json`, `application/xml`) y cabecera `X-Bundle-SHA256`.<br>**Errores:** `UnknownExportFormatError` / `422 Unprocessable Entity` ante formato no registrado. |
| **Postcondiciones** | El paquete exportado puede inyectarse directamente en prompts de agentes y su composición exacta queda registrada para auditoría futura. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un conjunto de especificaciones técnicas seleccionadas en `/bundles`<br>**Cuando** el usuario exporta el paquete en formato `xml`<br>**Entonces** el sistema produce un documento XML sintácticamente válido con nodos `<bundle>` y `<document>`, persistiendo el manifiesto con el `bundle_hash` verificable. |

#### Ficha `RF-BND-003` — Exposición de Herramientas Contextuales vía Servidor Universal MCP

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-BND-003` — Provisión estandarizada de herramientas de conocimiento sobre Model Context Protocol (MCP)** |
| **Prioridad / Origen** | **Alta** · **Mixto** (`Servidor FastMCP Base AS-IS` + autenticación por API Key / alcance `TO-BE`) |
| **Enunciado Formal** | En el módulo de empaquetado e integración (`BND`), cuando un agente de IA externo o IDE invoca el servidor MCP de ContextForge, el sistema **debe** exponer y ejecutar las herramientas `search_project_context`, `get_document_full` y `list_project_structure` respetando el aislamiento del proyecto y el estado publicado de los documentos para dotar al agente de contexto fáctico en tiempo de codificación. |
| **Precondiciones** | Servidor MCP montado en `/mcp` (o transporte stdio); cliente autenticado si rige modo empresarial. |
| **Entradas** | Mensajes JSON-RPC 2.0 estándar MCP (`tools/list`, `tools/call` con argumentos tipados `query`, `doc_path`, `project_slug`, `top_k`). |
| **Procesamiento Paso a Paso** | 1. Validar esquema JSON-RPC y alcance autorizado de la `API Key` del agente sobre `project_slug`.<br>2. Para `search_project_context`, ejecutar búsqueda híbrida sobre documentos `PUBLISHED` (`BR-04`, `BR-10`) y formatear fragmentos Markdown con rutas y títulos.<br>3. Para `get_document_full` y `list_project_structure`, retornar el contenido íntegro o el árbol jerárquico validando ausencia de *path traversal* (`BR-03`).<br>4. Registrar invocación del agente en auditoría con latencia y herramienta utilizada. |
| **Salidas** | **Éxito (`200 OK` JSON-RPC):** Objeto `CallToolResult` con bloques `TextContent` en Markdown listos para consumo por el agente.<br>**Errores:** Código de error JSON-RPC estándar (`-32602` parámetros inválidos, `-32001` acceso no autorizado al proyecto). |
| **Postcondiciones** | El agente externo recibe reglas y contratos vigentes del proyecto sin requerir copia manual de archivos por parte del programador. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un IDE conectado al endpoint `/mcp` de ContextForge<br>**Cuando** el agente invoca `tools/call` sobre `search_project_context` con `query="convención de ramas"` y `project_slug="default"`<br>**Entonces** el servidor retorna en menos de `300 ms` los fragmentos relevantes en Markdown citando la ruta exacta del documento fuente. |

#### Ficha `RF-BND-004` — Registro Polimórfico de Extensiones en el Componente Reutilizable (OCP)

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-BND-004` — Inyección y registro de puntos de extensión de terceros en el SDK `contextforge`** |
| **Prioridad / Origen** | **Alta** · **Base (`AS-IS`)** |
| **Enunciado Formal** | En el componente reutilizable (`contextforge`), cuando una aplicación consumidora registra implementaciones propias de `IChunkingStrategy`, `IHybridRankingStrategy`, `IBundleExporter`, `IDocumentRule`, `IKnowledgeObserver`, `ILexicalStore`, `IVectorStore` o `ILLMProvider`, el sistema **debe** incorporarlas dinámicamente a través de `ContextForgeBuilder` o los métodos `register_*` sin requerir modificaciones al código interno del paquete para garantizar reutilización abierta y desacoplada. |
| **Precondiciones** | La clase externa hereda o satisface el contrato abstracto definido en `contextforge.contracts`. |
| **Entradas** | Instancia concreta de cualquiera de los ocho contratos públicos exportados en `contextforge.__all__`. |
| **Procesamiento Paso a Paso** | 1. Verificar conformidad estructural/nominal con el contrato abstracto correspondiente.<br>2. Registrar la instancia en `StrategyFactory`, `BundleExporterRegistry`, `DocumentRuleChain` o `KnowledgeEventBus` bajo su clave identificadora (`name`, `format_name`, `rule_name`).<br>3. Habilitar su invocación inmediata por nombre en `ingest()`, `search()`, `ask()` y `compile_bundle()` preservando la frontera privada `_internal/` (`BR-15`). |
| **Salidas** | **Éxito:** Instancia `ContextForge` configurada y operativa con las extensiones inyectadas.<br>**Errores:** `TypeError` si el objeto incumple la interfaz abstracta; `ValueError` si declara identificador vacío. |
| **Postcondiciones** | El proyecto anfitrión extiende formatos, algoritmos de ranking o almacenes manteniendo compatibilidad binaria y semántica con `contextforge v1.x`. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un proyecto externo que define `YamlBundleExporter(IBundleExporter)` importando únicamente desde `contextforge`<br>**Cuando** construye el motor con `ContextForgeBuilder().with_exporter(YamlBundleExporter()).build()` y llama `compile_bundle(..., export_format="yaml")`<br>**Entonces** el componente genera exitosamente la salida en YAML sin haberse tocado ningún archivo bajo `src/contextforge/`. |

---

### 3.3.5 Módulo `COL`: Colaboración en Tiempo Real, Anotaciones Técnicas y Auditoría

#### Ficha `RF-COL-001` — Difusión de Presencia Activa y Eventos Documentales vía WebSockets

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-COL-001` — Sincronización en tiempo real de presencia y cambios documentales por WebSockets** |
| **Prioridad / Origen** | **Media** · **Mixto** (`Infraestructura WS Base AS-IS` + indicadores de edición activa por documento `TO-BE`) |
| **Enunciado Formal** | En el módulo de colaboración (`COL`), cuando uno o varios usuarios visualizan o editan documentos dentro de un proyecto, el sistema **debe** mantener canales WebSocket suscritos por ámbito (`project_slug` y `doc_path`) y difundir en tiempo real los estados de presencia, comentarios nuevos y avisos de actualización para coordinar el trabajo simultáneo y evitar colisiones de edición. |
| **Precondiciones** | Cliente conectado al endpoint WebSocket `/ws/collaboration` con proyecto válido (y token válido si aplica RBAC). |
| **Entradas** | Mensajes JSON de control: `{"action": "subscribe" | "editing_start" | "editing_stop" | "ping", "project_slug": str, "doc_path": str}`. |
| **Procesamiento Paso a Paso** | 1. Registrar conexión en `ConnectionManager` agrupada por sala `(project_slug, doc_path)`.<br>2. Emitir lista actualizada de colaboradores activos (`viewers`, `active_editors`) al unirse o desconectarse un socket.<br>3. Cuando ocurre un guardado (`RF-DOC-002`) o nuevo comentario (`RF-COL-002`), publicar evento `document.updated` / `comment.added` en menos de `150 ms` a todos los clientes de la sala.<br>4. Limpiar suscripciones huérfanas ante cierre abrupto o *heartbeat timeout*. |
| **Salidas** | **Éxito (Tramas WS JSON):** Eventos tipados `presence.sync`, `editor.active`, `document.updated`, `comment.created`.<br>**Errores:** Código de cierre WebSocket `1008 Policy Violation` ante falta de autorización o payload malformado. |
| **Postcondiciones** | Los clientes conectados reflejan en vivo quién está editando cada documento y reciben alertas inmediatas si la versión en servidor cambió. |
| **Criterios de Aceptación (Gherkin)** | **Dado** que Ana visualiza `arch/pagos.md` y Carlos entra al editor del mismo documento<br>**Cuando** el navegador de Carlos emite `editing_start` sobre el canal WebSocket<br>**Entonces** Ana observa en menos de `200 ms` el indicador de edición activa sin recargar la página. |

#### Ficha `RF-COL-002` — Gestión de Hilos de Discusión y Comentarios Técnicos Anclados

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-COL-002` — Creación, respuesta y resolución de hilos de comentarios por documento o sección** |
| **Prioridad / Origen** | **Media** · **Mixto** (`Comentarios e hilos Base AS-IS` + anclaje por encabezado y estado `resolved` `TO-BE`) |
| **Enunciado Formal** | En el módulo de colaboración (`COL`), cuando un integrante del equipo registra una observación técnica sobre un documento o encabezado específico, el sistema **debe** persistir el comentario asociado a su hilo de discusión normalizado, sanitizar el texto contra inyección XSS y permitir marcar el hilo como resuelto para facilitar revisiones pares trazables sobre la documentación. |
| **Precondiciones** | Documento existente dentro del proyecto activo; usuario identificado con permiso de lectura/colaboración. |
| **Entradas** | `book_id / doc_path: str`, `section_anchor: str | None`, `thread_title: str | None`, `content: str` (1–2 000 car.), `resolved: bool = false`. |
| **Procesamiento Paso a Paso** | 1. Validar longitud no vacía de `content` y sanitizar etiquetas HTML/scripts peligrosos.<br>2. Crear o vincular `ThreadORM` normalizado al documento (`REI-12`) e insertar `CommentORM` con autor y timestamp UTC.<br>3. Notificar por WebSocket a los observadores activos del documento (`RF-COL-001`). |
| **Salidas** | **Éxito (`201 Created` / `200 OK`):** DTO del hilo y comentario con estado `resolved` y datos del autor.<br>**Errores (RFC 7807):** `404 Not Found` si el documento objetivo no existe; `422` si el comentario está vacío. |
| **Postcondiciones** | La discusión técnica queda vinculada permanentemente al documento y su estado resuelto/abierto es consultable por los revisores. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un documento en estado `IN_REVIEW`<br>**Cuando** un revisor publica un comentario anclado al encabezado `# Modelo de Datos` y posteriormente el autor corrige el texto y marca el hilo como `resolved=true`<br>**Entonces** el hilo persiste como resuelto y conserva íntegro el historial del intercambio. |

#### Ficha `RF-COL-003` — Calificación de Calidad y Utilidad Documental

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-COL-003` — Registro idempotente de calificaciones de utilidad sobre documentos** |
| **Prioridad / Origen** | **Baja** · **Mixto** (`Ratings Base AS-IS` + unicidad por usuario/documento `TO-BE`) |
| **Enunciado Formal** | En el módulo de colaboración (`COL`), cuando un consumidor evalúa la claridad y vigencia de un documento técnico, el sistema **debe** registrar o actualizar de forma idempotente su calificación entera en escala de 1 a 5 y recalcular el promedio ponderado del documento para visibilizar qué especificaciones requieren curaduría prioritaria. |
| **Precondiciones** | Documento existente y usuario identificado. |
| **Entradas** | `target_id (book_id): str`, `score: int` (rango estricto $1 \le \text{score} \le 5$). |
| **Procesamiento Paso a Paso** | 1. Validar que `score` sea un entero entre 1 y 5.<br>2. Realizar *upsert* sobre `ratings` por clave compuesta `(target_id, user_id)` evitando inflación artificial de votos repetidos por el mismo usuario.<br>3. Calcular promedio redondeado a dos decimales y total de valoraciones. |
| **Salidas** | **Éxito (`200 OK`):** `RatingSummary(target_id, average_score, total_ratings, user_score)`.<br>**Errores (RFC 7807):** `422 Unprocessable Entity` si `score < 1` o `score > 5`. |
| **Postcondiciones** | El indicador de calidad documental se actualiza sin duplicar votos del mismo actor. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un usuario que calificó previamente `api/errores.md` con `3`<br>**Cuando** vuelve a calificar el mismo documento con `5`<br>**Entonces** el sistema actualiza su voto existente en lugar de sumar un segundo registro y recalcula el promedio exacto. |

#### Ficha `RF-COL-004` — Bitácora Transaccional e Inmutable de Auditoría (*Append-Only*)

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-COL-004` — Registro y consulta filtrada de auditoría operativa inmutable** |
| **Prioridad / Origen** | **Alta** · **Mixto** (`Decorador en memoria Base AS-IS` + persistencia inmutable en BD `Mejora Propuesta TO-BE`) |
| **Enunciado Formal** | En el módulo de colaboración y gobernanza (`COL`), cuando se ejecuta cualquier comando de mutación, cambio de seguridad, consulta RAG o exportación de bundle, el sistema **debe** asentar de manera automática e inmutable un registro de auditoría con actor, operación, recurso, latencia, resultado y huella encadenada, sin ofrecer endpoints de edición ni borrado sobre dicha bitácora para garantizar trazabilidad forense y no repudio. |
| **Precondiciones** | Operación interceptada por `AuditingOperationDecorator` (SDK) o middleware/comportamiento CQRS (Servidor). |
| **Entradas** | Capturadas automáticamente del contexto de ejecución: `actor_id`, `role`, `project_slug`, `operation`, `resource_id`, `succeeded: bool`, `latency_ms: float`, `error_type: str | None`, `client_ip: str | None`. Para consulta: filtros `project_slug`, `operation`, `date_from`, `date_to`, `page`, `page_size`. |
| **Procesamiento Paso a Paso** | 1. Medir duración exacta con `time.perf_counter()` alrededor del caso de uso.<br>2. Calcular `entry_hash = SHA256(prev_hash + timestamp + actor_id + operation + resource_id + str(succeeded))` e insertar en `audit_logs` (`BR-14`).<br>3. Permitir consulta paginada y exportación CSV/JSON exclusivamente a usuarios con rol `Admin` o auditor de seguridad. |
| **Salidas** | **Éxito (`200 OK`):** Página de registros `AuditLogEntry[]` con metadatos de paginación e indicador de integridad de cadena.<br>**Errores (RFC 7807):** `403 Forbidden` si un rol sin privilegios intenta consultar la bitácora global; `405 Method Not Allowed` ante `PUT/PATCH/DELETE`. |
| **Postcondiciones** | Toda acción crítica deja evidencia persistente resistente a manipulación accidental o maliciosa. |
| **Criterios de Aceptación (Gherkin)** | **Dado** que un administrador modifica el proveedor LLM activo y un curador publica un documento<br>**Cuando** el oficial de seguridad consulta `/api/v1/audit-logs` tras reiniciar el servidor<br>**Entonces** ambos eventos permanecen íntegros en la base de datos con su `latency_ms` y cualquier petición `DELETE` sobre `/api/v1/audit-logs/{id}` es rechazada. |

---

### 3.3.6 Módulo `CFG`: Orquestación Multi-LLM, Conectividad Políglota y Seguridad RBAC

#### Ficha `RF-CFG-001` — Configuración y Diagnóstico Polimórfico de Motores de Base de Datos

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-CFG-001` — Gestión y verificación de conectividad de motores de persistencia (`DatabaseFactory`)** |
| **Prioridad / Origen** | **Media** · **Mixto** (`Factory + Strategies Base AS-IS` + cifrado de credenciales `TO-BE`) |
| **Enunciado Formal** | En el módulo de configuración e infraestructura (`CFG`), cuando un administrador registra o prueba los parámetros de un motor de datos (SQLite, PostgreSQL, Supabase, SQL Server, MongoDB o Firebase), el sistema **debe** resolver la estrategia concreta mediante `DatabaseFactory`, ejecutar una sonda segura con *timeout* acotado y cifrar las credenciales antes de guardarlas para validar disponibilidad real sin exponer secretos. |
| **Precondiciones** | Usuario autenticado con rol `Admin`. |
| **Entradas** | `provider: DatabaseProvider`, `name: str`, `host: str`, `port: int | None`, `database_name: str`, `username: str`, `password / api_key: str`, `timeout_seconds: float = 10.0`. |
| **Procesamiento Paso a Paso** | 1. Construir `DatabaseConnectionOptions` inmutable.<br>2. Invocar `DatabaseFactory.test_connection(config)` ejecutando la `IDatabaseStrategy` correspondiente (`SELECT 1` o sonda TCP/HTTPS controlada).<br>3. Al guardar configuración, cifrar `password` y `api_key` con `AES-256-GCM` y devolver en la respuesta únicamente máscara parcial (`****`). |
| **Salidas** | **Éxito (`200 OK`):** `ConnectionTestResult(reachable: bool, message: str, latency_ms: float)` o configuración guardada con secretos enmascarados.<br>**Errores (RFC 7807):** `422` por parámetros incompletos; `504 Gateway Timeout` controlado si supera `timeout_seconds`. |
| **Postcondiciones** | El administrador obtiene diagnóstico accionable de red/driver y ninguna contraseña viaja de regreso en texto claro hacia el navegador. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un administrador en `/settings` configurando una instancia PostgreSQL<br>**Cuando** pulsa `"Probar conexión"` contra un motor accesible<br>**Entonces** el sistema ejecuta `PostgresDatabaseStrategy`, reporta `reachable=true` junto con la latencia en milisegundos y oculta la contraseña al persistir. |

#### Ficha `RF-CFG-002` — Orquestación Dinámica de Proveedores Multi-LLM y Degradación Resiliente

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-CFG-002` — Administración en caliente de proveedores Multi-LLM con cifrado y *fallback*** |
| **Prioridad / Origen** | **Alta** · **Mixto** (`Multi-LLM + Ollama + CLI Base AS-IS` + cifrado `AES-256-GCM` y orden de *fallback* `TO-BE`) |
| **Enunciado Formal** | En el módulo de configuración e infraestructura (`CFG`), cuando un administrador configura o activa un proveedor generativo o de embeddings (Ollama local, OpenAI, Google Gemini, Anthropic o CLI local), el sistema **debe** cifrar su `api_key` en reposo, verificar conectividad del modelo objetivo y conmutar el adaptador `ILLMProvider` en caliente con cadena de respaldo para garantizar continuidad del servicio RAG. |
| **Precondiciones** | Usuario con rol `Admin`. |
| **Entradas** | `provider: str`, `engine_type: "local_http" | "cloud_api" | "local_cli" | "extractive_fallback"`, `base_url: str`, `api_key: str`, `default_model: str`, `temperature: float` ($0.0 \le T \le 2.0$), `max_tokens: int` ($64 \le M \le 32768$), `is_active: bool`. |
| **Procesamiento Paso a Paso** | 1. Validar rangos numéricos de `temperature` y `max_tokens` y formato de `base_url`.<br>2. Cifrar `api_key` mediante `AES-256-GCM` antes de escribir en `llm_configurations`.<br>3. Si `is_active = true`, desmarcar el proveedor activo anterior dentro de la misma transacción e instanciar el nuevo `ILLMProvider` manteniendo registrado `ExtractiveFallbackLLMProvider` como respaldo de última instancia (`BR-12`). |
| **Salidas** | **Éxito (`200 OK`):** Configuración activa con `api_key_masked` y estado de salud del modelo.<br>**Errores (RFC 7807):** `422` por parámetros fuera de rango; `502 Bad Gateway` en prueba de salud si el endpoint LLM rechaza autenticación. |
| **Postcondiciones** | Las consultas RAG subsiguientes utilizan el nuevo modelo sin necesidad de reiniciar el proceso del servidor. |
| **Criterios de Aceptación (Gherkin)** | **Dado** que el proveedor activo es Ollama (`llama3.1:8b`) en `http://localhost:11434`<br>**Cuando** el servicio Ollama se detiene inesperadamente y un usuario realiza una consulta con *fallback* habilitado<br>**Entonces** el sistema conmuta al proveedor secundario/extractivo sin arrojar error HTTP `500` no controlado e informa el `provider_name` utilizado. |

#### Ficha `RF-CFG-003` — Autenticación Híbrida (OAuth2/JWT + API Keys) y Control de Acceso RBAC

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-CFG-003` — Autenticación de usuarios y agentes con autorización basada en roles (RBAC)** |
| **Prioridad / Origen** | **Alta** · **Mejora Propuesta (`TO-BE`)** |
| **Enunciado Formal** | En el módulo de configuración y seguridad (`CFG`), cuando el sistema opera en perfil colaborativo empresarial (`AUTH_MODE=enterprise_rbac`), el sistema **deberá** autenticar usuarios humanos mediante tokens OAuth2/JWT (o proveedor OIDC institucional) y agentes autónomos mediante `API Keys` con alcance por proyecto, haciendo cumplir la matriz de permisos RBAC antes de ejecutar cualquier caso de uso. |
| **Precondiciones** | Claves criptográficas JWT configuradas; roles base inicializados (`Admin`, `Curator`, `Consumer`, `AgentClient`). |
| **Entradas** | Cabecera `Authorization: Bearer <jwt>` o `X-API-Key: cf_live_<token>`; para emisión de API Key: `name: str`, `role: "AgentClient" | "Consumer"`, `allowed_projects: list[str]`, `expires_at: datetime`. |
| **Procesamiento Paso a Paso** | 1. En peticiones entrantes (REST, SSE, WS, MCP), extraer credencial; validar firma RS256/HS256, expiración (`exp`) y estado no revocado, o comparar `SHA-256(api_key)` contra la tabla `api_keys`.<br>2. Evaluar política RBAC: `Admin` (control total), `Curator` (CRUD documental, publicación y taxonomía en proyectos asignados), `Consumer` (lectura, búsqueda, chat RAG, bundles y comentarios), `AgentClient` (solo lectura/búsqueda MCP y compilación de bundles en `allowed_projects`).<br>3. Rechazar cualquier violación de permiso o alcance de proyecto asentando evento de seguridad en `audit_logs`. |
| **Salidas** | **Éxito (`200` / `201`):** Contexto `AuthenticatedPrincipal` inyectado o `API Key` mostrada por única vez en su creación.<br>**Errores (RFC 7807):** `401 Unauthorized` (`WWW-Authenticate: Bearer`), `403 Forbidden` (`type: "/errors/insufficient-role-permissions"`). |
| **Postcondiciones** | Toda operación ejecutada en red compartida queda asociada de manera unívoca a una identidad humana o de agente autorizada. |
| **Criterios de Aceptación (Gherkin)** | **Dado** un agente IA autenticado con una `API Key` de rol `AgentClient` autorizada únicamente para el proyecto `pagos-core`<br>**Cuando** intenta invocar un endpoint de eliminación de documentos (`DELETE /api/v1/books/{id}`) o consultar el proyecto `rrhh-privado`<br>**Entonces** el sistema bloquea ambas solicitudes con `403 Forbidden` y registra el intento en `audit_logs`. |

#### Ficha `RF-CFG-004` — Observabilidad Operativa y Tablero de Salud del Ecosistema

| Atributo | Especificación Técnica |
| :--- | :--- |
| **ID y Nombre** | **`RF-CFG-004` — Exposición de métricas de salud, latencias P95 y estado de índices por proyecto** |
| **Prioridad / Origen** | **Media** · **Mixto** (`Analítica de settings Base AS-IS` + métricas de cola/DLQ y percentiles `TO-BE`) |
| **Enunciado Formal** | En el módulo de configuración e infraestructura (`CFG`), cuando un administrador o sistema de monitoreo consulta el estado de la plataforma, el sistema **debe** reportar en tiempo real la disponibilidad de sus subsistemas (BD relacional, almacén vectorial, motor BM25, proveedor LLM y cola de indexación), el volumen documental y los percentiles de latencia ($P50, P95$) para facilitar el diagnóstico preventivo. |
| **Precondiciones** | Servicio en ejecución; endpoint `/health/ready` público ligero y `/api/v1/analytics/system` protegido por rol `Admin`/`Curator`. |
| **Entradas** | `project_slug: str | None`, `window_minutes: int = 60`. |
| **Procesamiento Paso a Paso** | 1. Ejecutar sondas no intrusivas sobre almacén SQL, índice vectorial y estado del último *heartbeat* del proveedor LLM.<br>2. Agregar contadores de documentos por estado (`PUBLISHED`, `DRAFT`, `IN_REVIEW`, `DEPRECATED`), trabajos pendientes/fallidos en `DLQ` y latencias de operaciones `search`, `ask` y `compile_bundle`. |
| **Salidas** | **Éxito (`200 OK`):** Payload `SystemHealthReport` con estado global (`healthy | degraded | unhealthy`) y desglose por componente.<br>**Errores (`503 Service Unavailable`):** Si la base de datos primaria no responde en `/health/ready`. |
| **Postcondiciones** | Los orquestadores de contenedores (Docker / Kubernetes) y administradores cuentan con telemetría verificable del estado real del sistema. |
| **Criterios de Aceptación (Gherkin)** | **Dado** el sistema operando con SQLite WAL saludable pero con Ollama apagado y *fallback* extractivo activo<br>**Cuando** se consulta `/api/v1/analytics/system`<br>**Entonces** el reporte indica estado global `degraded`, marca `database="up"`, `primary_llm="down"`, `fallback_llm="ready"` y expone la latencia $P95$ de búsqueda. |
