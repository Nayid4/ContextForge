# 5. Modelado Ágil: Historias de Usuario (`HU-*`), Desglose `SPIDR` y Acuerdos `Scrum / XP`

## 5.1 Desglose de Épicas Complejas con la Técnica `SPIDR`

Para evitar historias monolíticas difíciles de estimar o probar en un solo Sprint, las seis épicas estructurales de **ContextForge** se descompusieron sistemáticamente empleando los cinco patrones de partición **SPIDR** formulados por Mike Cohn (*Spike, Paths, Interfaces, Data, Rules*):

| ID Épica | Nombre de la Épica | Vector(es) `SPIDR` Aplicados | Justificación Ingenieril de la División | Historias Resultantes |
| :--- | :--- | :--- | :--- | :--- |
| **`EP-01`** | **Gobernanza Multi-Proyecto y *Docs-as-Code*** | **Data** + **Rules** | Se separó la creación básica del espacio de datos (`Project` y taxonomía `Module/Tag`) de las reglas de sincronización incremental con el sistema de archivos y confinamiento de rutas (`BR-01`, `BR-03`, `BR-10`). | `HU-01`, `HU-02`, `HU-03` |
| **`EP-02`** | **Gestión Editorial, Versionado y Anexos** | **Paths** + **Data** + **Rules** | Se dividieron los caminos de autoría Markdown (`HU-04`), control de concurrencia y flujo de aprobación editorial (`HU-05`, `HU-06`), historial de diferencias/*rollback* (`HU-07`) y tipos de datos adjuntos PDF/DOCX (`HU-08`). | `HU-04`, `HU-05`, `HU-06`, `HU-07`, `HU-08` |
| **`EP-03`** | **Motor de Indexación y Búsqueda Híbrida** | **Spike** + **Paths** | Se ejecutó un *Spike* técnico de calibración de constantes BM25 ($k_1=1.5, b=0.75$) frente a RRF ($k=60$), dividiendo luego la cola de indexación incremental/DLQ (`HU-09`) de los caminos de consulta léxica, vectorial e híbrida (`HU-10`). | `HU-09`, `HU-10` |
| **`EP-04`** | **Asistente Conversacional RAG y Soberanía IA** | **Interfaces** + **Rules** | Se independizó el flujo principal de chat en *streaming* SSE con citas (`HU-11`) de las reglas avanzadas de abstención por umbral, sesiones acotadas y prevención de fuga de datos `sovereign_only` / DLP (`HU-12`, `HU-13`). | `HU-11`, `HU-12`, `HU-13` |
| **`EP-05`** | **Empaquetado de *Context Bundles*, SDK y MCP** | **Interfaces** + **Data** | Se particionó por interfaz de consumo y formato de salida: compilador con presupuesto de tokens (`HU-14`), exportadores multi-formato con manifiesto (`HU-15`), servidor JSON-RPC **MCP** (`HU-16`) y puntos de extensión públicos del SDK (`HU-17`). | `HU-14`, `HU-15`, `HU-16`, `HU-17` |
| **`EP-06`** | **Colaboración en Tiempo Real, Infraestructura y RBAC** | **Paths** + **Rules** | Se separó la colaboración síncrona por WebSockets/comentarios (`HU-18`) de la orquestación de proveedores Multi-LLM/BD cifrados (`HU-19`) y de las reglas de seguridad OAuth2/JWT, API Keys, RBAC y auditoría inmutable (`HU-20`). | `HU-18`, `HU-19`, `HU-20` |

---

## 5.2 Catálogo de Historias de Usuario (`HU-01` a `HU-20`) bajo Criterios `INVEST`

Todas las historias del catálogo cumplen los seis atributos **INVEST**:
- **I (*Independent*):** Pueden desarrollarse y demostrarse en incrementos verticales sin bloqueos circulares.
- **N (*Negotiable*):** Definen el valor y las invariantes sin rigidizar detalles internos accesorios de implementación.
- **V (*Valuable*):** Cada historia entrega valor verificable a un actor real (`Curador`, `Desarrollador`, `Integrador SDK/MCP` o `Administrador`).
- **E (*Estimable*):** Poseen alcance acotado, contratos conocidos y puntuación consensuada en escala Fibonacci (`2, 3, 5, 8`).
- **S (*Small*):** Ninguna historia supera `8 Story Points` (completable dentro de una iteración de 1 a 2 semanas).
- **T (*Testable*):** Cuentan con criterios de aceptación deterministas en formato Gherkin y tareas explícitas de QA.

---

### Épica `EP-01`: Gobernanza Multi-Proyecto y Taxonomía

#### `HU-01` — Creación y Aislamiento de Espacios de Proyecto
- **Enunciado:** *Como* Administrador de Plataforma, *quiero* registrar espacios de proyecto independientes con su propio `slug`, ruta documental y política de soberanía, *para* aislar el conocimiento de múltiples sistemas sin mezclar índices ni permisos.
- **Puntos de Historia:** `3 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Mixto (AS-IS + TO-BE)` · **Trazabilidad:** `RF-PRJ-001`, `RF-PRJ-002`, `CU-01`, `BR-01`, `BR-03`, `BR-10`.
- **Criterios de Aceptación:**
  - **Dado** un `slug` válido y no registrado, **cuando** creo el proyecto, **entonces** se aprovisiona su carpeta base y al seleccionarlo en la barra superior solo se listan sus recursos.
  - **Dado** un `slug` duplicado o una ruta con `../`, **cuando** envío el formulario, **entonces** se rechaza con error RFC 7807 sin crear archivos.
- **Tareas de Ingeniería (`TI`):**
  - `TI-01.1 [UI]:` Formulario modal accesible en `/projects` con previsualización en vivo de `slug` y selector global activo.
  - `TI-01.2 [Dominio]:` Comando `CreateProjectCommand`, validador de `slug`/ruta (`BR-01`, `BR-03`) y política `sovereign_only`.
  - `TI-01.3 [Persistencia]:` Repositorio asíncrono sobre `ProjectORM` y filtros de aislamiento por `project_slug`.
  - `TI-01.4 [Pruebas]:` Pruebas unitarias de validación de rutas y prueba de integración verificando cero fugas entre dos proyectos.

#### `HU-02` — Clasificación Taxonómica por Módulos y Etiquetas
- **Enunciado:** *Como* Arquitecto Documental, *quiero* definir módulos funcionales y etiquetas cromáticas por proyecto, *para* organizar la biblioteca técnica y acotar búsquedas por dominio arquitectónico.
- **Puntos de Historia:** `2 SP` · **Prioridad:** `Media (Should Have)` · **Estado:** `Implementada (AS-IS)` · **Trazabilidad:** `RF-PRJ-003`, `CU-01`.
- **Criterios de Aceptación:**
  - **Dado** el proyecto activo, **cuando** creo un módulo o etiqueta, **entonces** queda disponible como faceta de filtrado en `/docs/browser` y en el parámetro `collection` de búsqueda.
- **Tareas de Ingeniería (`TI`):**
  - `TI-02.1 [UI]:` Selectores y chips vectoriales de módulos y tags en explorador y editor.
  - `TI-02.2 [Dominio]:` Entidades inmutables `ModuleEntity` y `TagEntity` con normalización automática de `slug`.
  - `TI-02.3 [Persistencia]:` Mapeo `ModuleORM` y `TagORM` en SQLAlchemy.
  - `TI-02.4 [Pruebas]:` Pruebas unitarias de creación idempotente y filtrado taxonómico.

#### `HU-03` — Sincronización Incremental *Docs-as-Code* con Sistema de Archivos
- **Enunciado:** *Como* Curador Técnico, *quiero* sincronizar automáticamente los cambios realizados sobre archivos `.md` en el repositorio local mediante huella `SHA-256`, *para* mantener coherencia bidireccional entre Git y ContextForge sin reprocesar archivos intactos.
- **Puntos de Historia:** `5 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Mixto (AS-IS + TO-BE)` · **Trazabilidad:** `RF-PRJ-004`, `CU-06`, `BR-03`.
- **Criterios de Aceptación:**
  - **Dado** un directorio con archivos Markdown modificados externamente, **cuando** se ejecuta la sincronización, **entonces** solo se actualizan e indexan los documentos cuyo `SHA-256` cambió y se reporta `SyncReport`.
- **Tareas de Ingeniería (`TI`):**
  - `TI-03.1 [UI]:` Botón de sincronización con indicador de progreso e informe resumido en `/projects`.
  - `TI-03.2 [Dominio]:` Analizador de *frontmatter* YAML y reconciliador diferencial por hash.
  - `TI-03.3 [Persistencia]:` Servicio `fs_watcher` confinado a raíz canónica y actualización en lote `UnitOfWork`.
  - `TI-03.4 [Pruebas]:` Pruebas con directorios temporales simulando altas, ediciones, borrados e intentos de *symlink* externo.

---

### Épica `EP-02`: Gestión Documental, Flujo Editorial, Versionado y Anexos

#### `HU-04` — Ingesta Validada de Documentos mediante Cadena de Reglas
- **Enunciado:** *Como* Integrador o Autor Técnico, *quiero* que todo documento sea validado por una cadena extensible de reglas antes de almacenarse, *para* impedir la entrada de especificaciones vacías, sin título o sobredimensionadas.
- **Puntos de Historia:** `3 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Implementada (AS-IS)` · **Trazabilidad:** `RF-DOC-001`, `CU-02`, `BR-02`, `BR-15`.
- **Criterios de Aceptación:**
  - **Dado** un documento que incumple una regla activa, **cuando** se invoca `ingest()` o `POST /api/v1/books`, **entonces** se rechaza informando `rule_name` y no deja residuos parciales.
- **Tareas de Ingeniería (`TI`):**
  - `TI-04.1 [UI]:` Validación preventiva en cliente y despliegue claro de mensajes por campo en `/books/editor`.
  - `TI-04.2 [Dominio]:` Contrato `IDocumentRule` y `DocumentRuleChain` (*Chain of Responsibility*).
  - `TI-04.3 [Persistencia]:` Escritura atómica coordinada entre archivo `.md` y tabla `books`.
  - `TI-04.4 [Pruebas]:` Suite parametrizada de casos válidos, bordes y fallos por cada regla estándar y custom.

#### `HU-05` — Editor Dividido con Atajos y Control de Concurrencia Optimista
- **Enunciado:** *Como* Arquitecto Documental, *quiero* redactar en un editor Markdown con vista previa instantánea, guardado con `Ctrl+S` y verificación de versión `ETag`, *para* escribir con fluidez sin sobrescribir accidentalmente los cambios de otro colega.
- **Puntos de Historia:** `5 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Mixto (AS-IS + TO-BE)` · **Trazabilidad:** `RF-DOC-002`, `CU-03`, `BR-11`, `RIU-03`.
- **Criterios de Aceptación:**
  - **Dado** un documento modificado pero no guardado, **cuando** intento abandonar la vista, **entonces** se activa el aviso preventivo; y si otro usuario guardó antes una versión superior, recibo `409 Conflict` con asistente de conciliación.
- **Tareas de Ingeniería (`TI`):**
  - `TI-05.1 [UI]:` Editor dividido responsivo, TOC lateral, atajo `Ctrl+S`, guardia `dirty-state` y modal de conflicto.
  - `TI-05.2 [Dominio]:` Comando `UpdateDocumentCommand` con validación `expected_version`.
  - `TI-05.3 [Persistencia]:` Columna `current_version` en `BookORM` y verificación atómica en `UPDATE`.
  - `TI-05.4 [Pruebas]:` Pruebas de carrera concurrente verificando rechazo determinista del segundo escritor con `ETag` obsoleto.

#### `HU-06` — Flujo de Aprobación Editorial y Compuerta de Visibilidad RAG
- **Enunciado:** *Como* Curador Líder, *quiero* controlar las transiciones entre `Borrador`, `En Revisión`, `Publicado` y `Retirado`, *para* garantizar que los agentes de IA y desarrolladores solo reciban respuestas basadas en documentación oficialmente aprobada.
- **Puntos de Historia:** `5 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Propuesta (TO-BE)` · **Trazabilidad:** `RF-DOC-003`, `CU-04`, `BR-04`, `BR-05`.
- **Criterios de Aceptación:**
  - **Dado** un documento en `DRAFT` o `DEPRECATED`, **cuando** se ejecuta búsqueda o chat RAG estándar, **entonces** sus fragmentos son excluidos; al pasar a `PUBLISHED`, quedan inmediatamente disponibles.
- **Tareas de Ingeniería (`TI`):**
  - `TI-06.1 [UI]:` Barra de estado editorial, botones contextuales de envío/aprobación/retiro y badges en catálogo.
  - `TI-06.2 [Dominio]:` Máquina de estados documental (`BR-05`) y política de filtrado `PUBLISHED` (`BR-04`).
  - `TI-06.3 [Persistencia]:` Sincronización de metadato `status` en BD y en filtros de índice léxico/vectorial.
  - `TI-06.4 [Pruebas]:` Pruebas de todas las transiciones válidas/inválidas y verificación de no contaminación en RAG.

#### `HU-07` — Historial de Versiones Inmutable, Comparador *Diff* y *Rollback*
- **Enunciado:** *Como* Curador Documental, *quiero* visualizar las diferencias línea a línea entre dos revisiones de un documento y restaurar una versión previa si es necesario, *para* auditar cambios y recuperarme rápidamente de ediciones erróneas.
- **Puntos de Historia:** `5 SP` · **Prioridad:** `Media (Should Have)` · **Estado:** `Propuesta (TO-BE)` · **Trazabilidad:** `RF-DOC-004`, `BR-06`.
- **Criterios de Aceptación:**
  - **Dado** un documento con múltiples revisiones, **cuando** comparo `v2` y `v4` o ejecuto *rollback* a `v2`, **entonces** visualizo el *diff* exacto y la reversión crea `v5` preservando intactas `v1..v4`.
- **Tareas de Ingeniería (`TI`):**
  - `TI-07.1 [UI]:` Pestaña de historial con visor *diff* resaltado (adiciones/supresiones) y diálogo de confirmación de *rollback*.
  - `TI-07.2 [Dominio]:` Servicio `DocumentDiffService` (`difflib`) y comando `RollbackDocumentVersionCommand`.
  - `TI-07.3 [Persistencia]:` Tabla inmutable `document_versions` con clave compuesta `(book_id, version_number)`.
  - `TI-07.4 [Pruebas]:` Pruebas unitarias de generación de *diff* e invariante de no destrucción histórica (`BR-06`).

#### `HU-08` — Carga Segura y Extracción Textual de Anexos Técnicos
- **Enunciado:** *Como* Arquitecto de Soluciones, *quiero* adjuntar documentos complementarios (PDF, Word, diagramas `.drawio`) a un libro técnico e indexar su texto, *para* centralizar toda la evidencia documental y hacerla consultable en el buscador.
- **Puntos de Historia:** `3 SP` · **Prioridad:** `Media (Should Have)` · **Estado:** `Mixto (AS-IS + TO-BE)` · **Trazabilidad:** `RF-DOC-005`, `CU-05`, `BR-16`.
- **Criterios de Aceptación:**
  - **Dado** un archivo permitido $\le 25\text{ MB}$, **cuando** lo subo, **entonces** se valida su firma MIME, se registra su `SHA-256` y su texto se indexa; archivos ejecutables son rechazados con `415`.
- **Tareas de Ingeniería (`TI`):**
  - `TI-08.1 [UI]:` Zona de carga con validación previa de tamaño/tipo y lista de anexos descargables en el visor.
  - `TI-08.2 [Dominio]:` Validador MIME/extensión (`BR-16`) y adaptadores extractores de texto.
  - `TI-08.3 [Persistencia]:` Almacenamiento confinado en disco y registro `AttachmentORM` con `sha256_checksum`.
  - `TI-08.4 [Pruebas]:` Pruebas con PDF/DOCX válidos, archivos sobre límite y ejecutables renombrados.

---

### Épica `EP-03`: Indexación Incremental y Búsqueda Híbrida

#### `HU-09` — Segmentación Sensible a Encabezados y Cola Asíncrona con DLQ
- **Enunciado:** *Como* Administrador de Plataforma, *quiero* que los documentos se dividan respetando sus encabezados Markdown y se indexen en segundo plano con reintentos y cola de fallos (`DLQ`), *para* mantener alta precisión semántica sin degradar los tiempos de respuesta del editor.
- **Puntos de Historia:** `8 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Mixto (AS-IS + TO-BE)` · **Trazabilidad:** `RF-RAG-001`, `CU-06`, `RNF-11`.
- **Criterios de Aceptación:**
  - **Dado** un documento publicado, **cuando** cambia su contenido, **entonces** `HeadingAwareChunkingStrategy` preserva la jerarquía `headers` y, ante un fallo del motor vectorial, el trabajo reintenta 3 veces antes de registrarse en `DLQ`.
- **Tareas de Ingeniería (`TI`):**
  - `TI-09.1 [UI]:` Indicador de estado de indexación y visor de trabajos en `DLQ` con botón de reproceso en `/settings`.
  - `TI-09.2 [Dominio]:` Estrategias `HeadingAwareChunkingStrategy` y `SlidingWindowChunkingStrategy` + trabajador asíncrono con *backoff*.
  - `TI-09.3 [Persistencia]:` Tabla `indexing_jobs` e indexación idempotente en BM25 y ChromaDB.
  - `TI-09.4 [Pruebas]:` Pruebas unitarias de preservación de encabezados y prueba con *stub* fallido verificando paso a `DLQ`.

#### `HU-10` — Búsqueda Híbrida Léxico-Vectorial con Fusión RRF y Ponderada
- **Enunciado:** *Como* Desarrollador de Software, *quiero* buscar simultáneamente por palabras clave exactas (BM25) y por significado conceptual (vectores) fusionando puntajes con RRF, *para* localizar al instante tanto códigos de error literales como decisiones arquitectónicas relacionadas.
- **Puntos de Historia:** `5 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Implementada (AS-IS)` · **Trazabilidad:** `RF-RAG-002`, `CU-07`, `BR-07`, `RNF-12`.
- **Criterios de Aceptación:**
  - **Dado** un corpus indexado, **cuando** busco en modo `hybrid` con `ranking="rrf"` o `"weighted"`, **entonces** obtengo `SearchHit[]` deduplicados y ordenados en $P95 \le 250\text{ ms}$.
- **Tareas de Ingeniería (`TI`):**
  - `TI-10.1 [UI]:` Barra de búsqueda unificada con selector de modo, filtro de módulo y resaltado de coincidencias.
  - `TI-10.2 [Dominio]:` `RetrieverFactory`, `ReciprocalRankFusionStrategy` y `WeightedLinearRankingStrategy`.
  - `TI-10.3 [Persistencia]:` Implementaciones `InMemoryLexicalStore`/BM25 y adaptador vectorial ChromaDB/`InMemoryVectorStore`.
  - `TI-10.4 [Pruebas]:` Pruebas comparativas de precisión léxica vs. vectorial vs. híbrida y validación de latencia.

---

### Épica `EP-04`: Asistente Conversacional RAG y Soberanía de Datos

#### `HU-11` — Chat Conversacional RAG en *Streaming* SSE con Citas Exactas
- **Enunciado:** *Como* Desarrollador Consumidor, *quiero* formular preguntas en lenguaje natural y recibir respuestas en tiempo real acompañadas de tarjetas clicables hacia los documentos y secciones citadas, *para* resolver dudas arquitectónicas verificando inmediatamente la fuente original.
- **Puntos de Historia:** `8 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Implementada (AS-IS)` · **Trazabilidad:** `RF-RAG-003`, `CU-08`, `BR-08`, `RIU-04`, `RNF-13`.
- **Criterios de Aceptación:**
  - **Dado** un proyecto con especificaciones publicadas, **cuando** envío una pregunta en `/chat`, **entonces** visualizo los tokens vía SSE, puedo cancelar en curso y recibo las citas `SourceCitation` con enlace directo al visor documental.
- **Tareas de Ingeniería (`TI`):**
  - `TI-11.1 [UI]:` Vista `/chat` con *streaming* fluido, botón detener, reinicio de sesión y panel de citas verificables.
  - `TI-11.2 [Dominio]:` `execute_rag_pipeline`, ensamblador de prompts fundamentados y generador SSE.
  - `TI-11.3 [Persistencia]:` Persistencia de turnos y `sources_json` en `ChatSessionORM` / `ChatMessageORM`.
  - `TI-11.4 [Pruebas]:` Pruebas de pipeline RAG con proveedor simulado garantizando presencia obligatoria de citas.

#### `HU-12` — Abstención Fundamentada ante Ausencia de Evidencia Documental
- **Enunciado:** *Como* Líder Técnico, *quiero* que el asistente RAG declare explícitamente cuando la base documental no contiene evidencia suficiente en lugar de inventar respuestas genéricas, *para* eliminar alucinaciones que induzcan errores de diseño.
- **Puntos de Historia:** `3 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Propuesta (TO-BE)` · **Trazabilidad:** `RF-RAG-003`, `BR-08`, `OR-04`.
- **Criterios de Aceptación:**
  - **Dado** una pregunta ajena al corpus o cuyos fragmentos no alcancen `min_grounding_score`, **cuando** el sistema evalúa la recuperación, **entonces** retorna `grounded=false` informando ausencia de soporte documental sin fabricar datos.
- **Tareas de Ingeniería (`TI`):**
  - `TI-12.1 [UI]:` Aviso visual diferenciado de respuesta en abstención sugiriendo términos relacionados o creación de ADR.
  - `TI-12.2 [Dominio]:` Evaluador de umbral de relevancia previa a la invocación generativa (`BR-08`).
  - `TI-12.3 [Persistencia]:` Parámetro `min_grounding_score` configurable en `SettingsModel`.
  - `TI-12.4 [Pruebas]:` Pruebas negativas con consultas fuera de dominio verificando `grounded == False`.

#### `HU-13` — Modo Soberano por Proyecto y Redacción Preventiva DLP
- **Enunciado:** *Como* Oficial de Seguridad, *quiero* marcar proyectos sensibles como `sovereign_only` y redactar automáticamente patrones de credenciales antes de cualquier llamada externa, *para* impedir filtraciones de propiedad intelectual o datos regulados hacia nubes públicas.
- **Puntos de Historia:** `5 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Propuesta (TO-BE)` · **Trazabilidad:** `RF-RAG-004`, `BR-13`, `OR-01`, `OR-03`.
- **Criterios de Aceptación:**
  - **Dado** un proyecto con `sovereign_only=true`, **cuando** se ejecuta `ask()`, **entonces** queda bloqueada toda salida a APIs remotas y se utiliza exclusivamente inferencia local.
- **Tareas de Ingeniería (`TI`):**
  - `TI-13.1 [UI]:` Interruptor e insignia de *"Modo Soberano Estricto"* en configuración de proyecto y cabecera de chat.
  - `TI-13.2 [Dominio]:` Guardia `SovereignPolicyGuard` e interceptor regex DLP de secretos/PII en el pipeline RAG.
  - `TI-13.3 [Persistencia]:` Atributo `sovereign_only` en tabla `projects` y trazabilidad de bloqueos en auditoría.
  - `TI-13.4 [Pruebas]:` Pruebas con espía HTTP confirmando `0` solicitudes externas y enmascaramiento `[REDACTED]`.

---

### Épica `EP-05`: Compilación de *Context Bundles*, SDK Reutilizable y Servidor MCP

#### `HU-14` — Compilador de *Context Bundles* con Barra en Vivo de Presupuesto de Tokens
- **Enunciado:** *Como* Ingeniero de IA, *quiero* compilar paquetes de contexto seleccionando documentos o consultas con un techo estricto `max_tokens`, *para* alimentar agentes de código aprovechando al máximo su ventana de atención sin truncamientos arbitrarios.
- **Puntos de Historia:** `5 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Implementada (AS-IS)` · **Trazabilidad:** `RF-BND-001`, `CU-09`, `BR-09`, `RIU-05`.
- **Criterios de Aceptación:**
  - **Dado** un presupuesto `max_tokens = 2000`, **cuando** compilo el paquete, **entonces** `estimated_tokens <= 2000`, la barra UI refleja el porcentaje exacto y cualquier exceso queda listado en `omitted_doc_ids`.
- **Tareas de Ingeniería (`TI`):**
  - `TI-14.1 [UI]:` Vista `/bundles` con barra progresiva de tokens en tiempo real y selección asistida de documentos.
  - `TI-14.2 [Dominio]:` Pipeline `compile_context_bundle` con estimador determinista y validación `TokenBudgetExceededError`.
  - `TI-14.3 [Persistencia]:` Consultas optimizadas de lectura de documentos seleccionados por proyecto.
  - `TI-14.4 [Pruebas]:` Pruebas de valores límite (`max_tokens = 49`, `50`, presupuesto exacto y omisión parcial).

#### `HU-15` — Exportación Multi-Formato y Manifiesto Forense de Bundles
- **Enunciado:** *Como* Integrador de Pipelines CI/CD, *quiero* exportar *Context Bundles* en Markdown, JSON o XML conservando el manifiesto criptográfico de las versiones empaquetadas, *para* integrarlos en distintos agentes y auditar qué reglas recibió cada ejecución.
- **Puntos de Historia:** `3 SP` · **Prioridad:** `Media (Should Have)` · **Estado:** `Mixto (AS-IS + TO-BE)` · **Trazabilidad:** `RF-BND-002`, `CU-09`.
- **Criterios de Aceptación:**
  - **Dado** un bundle compilado, **cuando** elijo formato `markdown`, `json` o `xml`, **entonces** descargo un artefacto válido con su `bundle_hash` y registro relacional de versiones incluidas.
- **Tareas de Ingeniería (`TI`):**
  - `TI-15.1 [UI]:` Selector de formato, previsualización con botón copiar y historial de bundles generados.
  - `TI-15.2 [Dominio]:` `BundleExporterRegistry` + `MarkdownBundleExporter`, `JsonBundleExporter`, `XmlBundleExporter`.
  - `TI-15.3 [Persistencia]:` Tablas `context_bundles` y `bundle_items` con huella `SHA-256`.
  - `TI-15.4 [Pruebas]:` Validación de parseo estricto JSON/XML y verificación de hash reproducible.

#### `HU-16` — Servidor Universal Model Context Protocol (MCP) para IDEs y Agentes
- **Enunciado:** *Como* Desarrollador que usa agentes de codificación en su IDE, *quiero* conectar mi agente al servidor `/mcp` de ContextForge, *para* que consulte automáticamente la estructura, documentos y búsqueda híbrida del proyecto antes de escribir código.
- **Puntos de Historia:** `5 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Mixto (AS-IS + TO-BE)` · **Trazabilidad:** `RF-BND-003`, `CU-10`, `RIS-06`, `RIC-04`.
- **Criterios de Aceptación:**
  - **Dado** un cliente MCP conectado, **cuando** invoca `search_project_context`, `get_document_full` o `list_project_structure`, **entonces** recibe respuestas JSON-RPC conformes acotadas a documentos publicados del proyecto autorizado.
- **Tareas de Ingeniería (`TI`):**
  - `TI-16.1 [UI]:` Vista `/docs/integration-guide` con fragmentos listos para copiar de configuración MCP y SDK.
  - `TI-16.2 [Dominio]:` Caso de uso `MCPQueryContextQueryHandler` reutilizando el buscador híbrido.
  - `TI-16.3 [Persistencia]:` Motor `FastMCP` en `src/presentation/mcp/server.py` con validación de `API Key`.
  - `TI-16.4 [Pruebas]:` Pruebas de contrato JSON-RPC 2.0 para descubrimiento e invocación de las 3 herramientas.

#### `HU-17` — Extensibilidad Abierta del Paquete Reutilizable `contextforge` (OCP)
- **Enunciado:** *Como* Desarrollador de una aplicación Python externa, *quiero* instalar `contextforge` sin dependencias pesadas e inyectar mis propios exportadores, rankers, reglas o proveedores LLM mediante `ContextForgeBuilder`, *para* reutilizar el motor adaptándolo a mi dominio sin tocar su código fuente.
- **Puntos de Historia:** `5 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Implementada (AS-IS)` · **Trazabilidad:** `RF-BND-004`, `CU-12`, `BR-15`, `RNF-16`..`18`.
- **Criterios de Aceptación:**
  - **Dado** un entorno limpio con `pip install -e .`, **cuando** registro extensiones heredando de `contextforge.contracts` y ejecuto `examples/agent_knowledge_cli.py`, **entonces** todas operan con `0` errores en `mypy --strict` y cobertura $\ge 85 \%$.
- **Tareas de Ingeniería (`TI`):**
  - `TI-17.1 [UI / CLI]:` Aplicación de consola demostradora `examples/agent_knowledge_cli.py` usando solo `__all__`.
  - `TI-17.2 [Dominio]:` Fachada `ContextForge`, `ContextForgeBuilder` y 8 contratos abstractos en `contracts.py`.
  - `TI-17.3 [Persistencia]:` Subpaquete encapsulado `_internal/` con almacenes en memoria libre de dependencias.
  - `TI-17.4 [Pruebas]:` Suite `tests/unit/test_contextforge_component.py` con `MagicMock`, *Stubs*, *Fakes* y *Spies*.

---

### Épica `EP-06`: Colaboración en Tiempo Real, Infraestructura Multi-LLM y Seguridad RBAC

#### `HU-18` — Presencia Colaborativa por WebSockets, Comentarios y Calificaciones
- **Enunciado:** *Como* Integrante del Equipo Técnico, *quiero* ver en tiempo real quién está revisando o editando un documento, dejar comentarios por sección y calificar su utilidad, *para* coordinar mejoras documentales de forma ágil y colaborativa.
- **Puntos de Historia:** `5 SP` · **Prioridad:** `Media (Should Have)` · **Estado:** `Mixto (AS-IS + TO-BE)` · **Trazabilidad:** `RF-COL-001`, `RF-COL-002`, `RF-COL-003`, `CU-11`.
- **Criterios de Aceptación:**
  - **Dado** dos usuarios conectados al mismo documento, **cuando** uno comenta o inicia edición, **entonces** el otro recibe la actualización vía WebSocket en $\le 150\text{ ms}$ y las calificaciones se consolidan de forma idempotente por usuario.
- **Tareas de Ingeniería (`TI`):**
  - `TI-18.1 [UI]:` Indicadores de presencia en cabecera documental, panel de hilos con botón resolver y widget de rating.
  - `TI-18.2 [Dominio]:` Gestor de salas WebSocket y casos de uso de comentarios sanitizados y *upsert* de calificaciones.
  - `TI-18.3 [Persistencia]:` Esquema normalizado `discussion_threads`, `document_comments` y `ratings`.
  - `TI-18.4 [Pruebas]:` Pruebas asíncronas WebSocket multi-cliente y pruebas de sanitización XSS.

#### `HU-19` — Administración y Diagnóstico en Caliente de Motores BD y Multi-LLM
- **Enunciado:** *Como* Administrador de Infraestructura, *quiero* configurar proveedores de base de datos y modelos LLM (Ollama, OpenAI, Gemini, CLI) probando su latencia y cifrando sus claves con `AES-256-GCM`, *para* operar y conmutar motores con seguridad y cero tiempo de inactividad.
- **Puntos de Historia:** `5 SP` · **Prioridad:** `Alta (Must Have)` · **Estado:** `Mixto (AS-IS + TO-BE)` · **Trazabilidad:** `RF-CFG-001`, `RF-CFG-002`, `RF-CFG-004`, `CU-13`, `RNF-03`.
- **Criterios de Aceptación:**
  - **Dado** el panel `/settings`, **cuando** pruebo una conexión y guardo una `API Key`, **entonces** obtengo estado y `latency_ms` reales, la clave se almacena cifrada en reposo y las respuestas posteriores solo muestran máscara `****`.
- **Tareas de Ingeniería (`TI`):**
  - `TI-19.1 [UI]:` Pestañas de infraestructura en `/settings` con sondas interactivas y tablero de salud por componente.
  - `TI-19.2 [Dominio]:` `DatabaseFactory`, estrategias `IDatabaseStrategy`, servicio `SecretVaultAESGCM` y conmutador LLM.
  - `TI-19.3 [Persistencia]:` Tablas `llm_configurations` y `settings` con columnas de texto cifrado autenticado.
  - `TI-19.4 [Pruebas]:` Pruebas criptográficas de cifrado/descifrado y pruebas de *fallback* automático ante caída de LLM.

#### `HU-20` — Seguridad Empresarial OAuth2/JWT, API Keys para Agentes, RBAC y Auditoría Inmutable
- **Enunciado:** *Como* Oficial de Seguridad y Cumplimiento, *quiero* autenticar usuarios con JWT/OIDC y agentes con `API Keys` acotadas por rol y proyecto, registrando toda operación en una bitácora inmutable, *para* proteger activos críticos de software y contar con trazabilidad forense completa.
- **Puntos de Historia:** `8 SP` · **Prioridad:** `Alta (Must Have en Producción)` · **Estado:** `Propuesta (TO-BE)` · **Trazabilidad:** `RF-CFG-003`, `RF-COL-004`, `CU-14`, `BR-14`, `RNF-01`, `RNF-02`, `RNF-04`.
- **Criterios de Aceptación:**
  - **Dado** el modo `enterprise_rbac`, **cuando** un rol `Consumer` o `AgentClient` intenta ejecutar operaciones administrativas o borrar auditoría, **entonces** recibe `403`/`405` y el evento queda encadenado permanentemente en `audit_logs`.
- **Tareas de Ingeniería (`TI`):**
  - `TI-20.1 [UI]:` Flujo de sesión, vista de emisión/revocación de `API Keys` y explorador filtrable de auditoría para `Admin`.
  - `TI-20.2 [Dominio]:` Servicio JWT/API-Key, matriz declarativa de políticas RBAC y `AuditingOperationDecorator` persistente.
  - `TI-20.3 [Persistencia]:` Tablas `users`, `project_memberships`, `api_keys` y `audit_logs` (*append-only* con cadena `SHA-256`).
  - `TI-20.4 [Pruebas]:` Matriz de pruebas de autorización por cada uno de los 4 roles y verificación de integridad de hash en bitácora.

---

## 5.3 *Product Backlog* Priorizado y Plan de Entregas Incrementales

La planificación ágil organiza los **`96 Story Points`** totales del catálogo en dos grandes incrementos evolutivos (6 Sprints de 2 semanas):

| Orden | ID Historia | Título Resumido | Épica | Prioridad | Story Points | Horizonte / Release |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| 1 | `HU-17` | Núcleo SDK `contextforge` y contratos extensibles OCP | `EP-05` | Alta | 5 | **R1.0 — Línea Base Operativa (`AS-IS`)** |
| 2 | `HU-04` | Ingesta validada con cadena de reglas `IDocumentRule` | `EP-02` | Alta | 3 | **R1.0 — Línea Base Operativa (`AS-IS`)** |
| 3 | `HU-10` | Búsqueda híbrida BM25 + vectorial con fusión RRF/Weighted | `EP-03` | Alta | 5 | **R1.0 — Línea Base Operativa (`AS-IS`)** |
| 4 | `HU-11` | Chat conversacional RAG en *streaming* SSE con citas | `EP-04` | Alta | 8 | **R1.0 — Línea Base Operativa (`AS-IS`)** |
| 5 | `HU-14` | Compilador de *Context Bundles* con presupuesto de tokens | `EP-05` | Alta | 5 | **R1.0 — Línea Base Operativa (`AS-IS`)** |
| 6 | `HU-01` | Creación y aislamiento de espacios multi-proyecto | `EP-01` | Alta | 3 | **R1.0 / R2.0 (Ampliación cuotas)** |
| 7 | `HU-02` | Taxonomía de módulos funcionales y etiquetas | `EP-01` | Media | 2 | **R1.0 — Línea Base Operativa (`AS-IS`)** |
| 8 | `HU-16` | Servidor universal MCP para IDEs y agentes autónomos | `EP-05` | Alta | 5 | **R1.0 / R2.0 (Seguridad API Key)** |
| 9 | `HU-20` | Autenticación JWT/OIDC, API Keys, RBAC y auditoría inmutable | `EP-06` | Alta | 8 | **R2.0 — Reingeniería Empresarial (`TO-BE`)** |
| 10 | `HU-06` | Flujo de estados editoriales y compuerta de visibilidad RAG | `EP-02` | Alta | 5 | **R2.0 — Reingeniería Empresarial (`TO-BE`)** |
| 11 | `HU-05` | Editor dividido con concurrencia optimista `ETag` (`409`) | `EP-02` | Alta | 5 | **R2.0 — Reingeniería Empresarial (`TO-BE`)** |
| 12 | `HU-09` | Cola asíncrona de indexación incremental (`SHA-256`) + DLQ | `EP-03` | Alta | 8 | **R2.0 — Reingeniería Empresarial (`TO-BE`)** |
| 13 | `HU-19` | Orquestación Multi-LLM/BD con cifrado `AES-256-GCM` | `EP-06` | Alta | 5 | **R2.0 — Reingeniería Empresarial (`TO-BE`)** |
| 14 | `HU-13` | Modo soberano estricto por proyecto y filtro DLP | `EP-04` | Alta | 5 | **R2.0 — Reingeniería Empresarial (`TO-BE`)** |
| 15 | `HU-12` | Umbral de evidencia y abstención controlada en RAG | `EP-04` | Alta | 3 | **R2.0 — Reingeniería Empresarial (`TO-BE`)** |
| 16 | `HU-03` | Sincronización incremental bidireccional *Docs-as-Code* | `EP-01` | Alta | 5 | **R2.0 — Reingeniería Empresarial (`TO-BE`)** |
| 17 | `HU-07` | Historial de versiones inmutable, *diff* y *rollback* | `EP-02` | Media | 5 | **R2.0 — Reingeniería Empresarial (`TO-BE`)** |
| 18 | `HU-15` | Exportadores multi-formato y manifiesto forense de bundles | `EP-05` | Media | 3 | **R2.0 — Reingeniería Empresarial (`TO-BE`)** |
| 19 | `HU-18` | Colaboración WebSocket en vivo, hilos resueltos y ratings | `EP-06` | Media | 5 | **R2.0 — Reingeniería Empresarial (`TO-BE`)** |
| 20 | `HU-08` | Validación MIME/SHA-256 y extracción textual de anexos | `EP-02` | Media | 3 | **R2.0 — Reingeniería Empresarial (`TO-BE`)** |

---

## 5.4 Acuerdos de Calidad Ágil: `DoR`, `DoD` y Prácticas de Ingeniería `XP`

### 5.4.1 *Definition of Ready (DoR)* — Condiciones de Entrada al Sprint
Ninguna Historia de Usuario puede comprometerse en un *Sprint Planning* si no verifica el 100 % de la siguiente lista:
1. Redactada bajo plantilla estándar de rol, acción y beneficio cuantificable, cumpliendo los seis criterios **INVEST**.
2. Trazada explícitamente hacia al menos un `RF-*`, las invariantes `BR-*` aplicables y los requisitos de interfaz/calidad (`RIU`/`RNF`).
3. Provista de escenarios de aceptación **Gherkin (`Dado / Cuando / Entonces`)** que cubran tanto el camino feliz como las excepciones de negocio (RFC 7807).
4. Sin dependencias externas bloqueantes no resueltas (si existía incertidumbre algorítmica, el *Spike* previo de **SPIDR** ya fue cerrado).
5. Estimada colegiadamente por el equipo mediante *Planning Poker* con puntaje $\le 8\text{ SP}$ y desglosada en tareas técnicas `TI-*`.

### 5.4.2 *Definition of Done (DoD)* — Condiciones de Salida e Incremento Terminado
Una Historia de Usuario se declara formalmente **Terminada (*Done*)** únicamente cuando cumple sin excepción:
1. Código implementado respetando **Clean Architecture**, principios **SOLID/GRASP**, límite modular $\le 300$ líneas por archivo y cero emojis Unicode en interfaz.
2. Análisis estático de tipos (`mypy --strict`) ejecutado con **`0` errores** y revisión de seguridad sin vulnerabilidades críticas/altas.
3. Pruebas unitarias y de integración automatizadas en verde (`pytest`), sosteniendo cobertura de líneas $\ge 85 \%$ sobre el núcleo reutilizable y verificando dobles sin acceso a red externa.
4. Todos los escenarios Gherkin validados positivamente, incluyendo conformidad **RFC 7807** en respuestas de error y cumplimiento de accesibilidad **WCAG 2.1 AA** en vistas web.
5. Documentación *Docs-as-Code*, docstrings de API pública y Matriz de Trazabilidad (**RTM**) actualizadas en la rama de trabajo conforme a la convención semántica del repositorio.

### 5.4.3 Prácticas de *Extreme Programming (XP)* Adoptadas
- **Desarrollo Guiado por Pruebas (*Test-Driven Development* — TDD):** Ciclo corto *Rojo $\rightarrow$ Verde $\rightarrow$ Refactor* obligatorio para reglas de dominio (`IDocumentRule`), algoritmos de fusión (`RRF`/`Weighted`), control de presupuesto de tokens y políticas RBAC.
- **Diseño Simple y Refactorización Continua:** Eliminación sistemática de código muerto, duplicidad de modelos ORM (`REI-12`) y archivos monolíticos, manteniendo contratos pequeños y expresivos.
- **Integración Continua (CI) y Construcción Reproducible:** Ejecución automática en cada cambio de empaquetado editable, verificación de tipos estrictos, suite de pruebas con cobertura y ejemplo de consumidor externo aislado.
- **Estándares de Codificación Unificados y Revisión Cruzada:** Uso homogéneo de tipado moderno de Python 3.11+, DTOs inmutables (`@dataclass(frozen=True)`), nomenclatura ubicua en torno a ContextForge e inspección cruzada de arquitectura antes de fusionar.
