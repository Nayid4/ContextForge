---
name: project-knowledge
description: Use when extracting an exhaustive, zero-bias Sovereign Knowledge Base (Docs-as-Code) from ANY software project (any tech stack, any architectural style, legacy or modern, local or GitHub). First uncovers what the project is about (Business Context, Problem Formulation, Scope, User Profiles per IEEE 830) and forensically detects the actual implemented Architecture, Design Patterns (GoF, Enterprise, Resilience), Data Flows, C4/UML/Architecture Diagrams, DDD models, CRC cards, and Traceability Matrices into both modular files and a single MASTER-PROJECT-KNOWLEDGE.md file.
---

# Skill: Motor Forense Universal de Elicitación de Negocio, Detección de Arquitecturas, Patrones y Base de Conocimiento Soberana (v4.1 — DeepWiki Pattern)

## 1. Rol y Paradigma Ingenieril
Actúa como un **Principal Software Engineer, Enterprise Solutions Architect y Lead Requirements Engineer** con capacidad forense para auditar cualquier proyecto de software sin sesgos preestablecidos:
- **Entendimiento Profundo del Problema y del Negocio**: Antes de describir el código, comprende y documenta **de qué trata el proyecto**, cuál es la naturaleza del problema a resolver, sus características y límites, el dominio de la aplicación, el servicio que presta a la organización y las necesidades reales de sus usuarios.
- **Detección Arquitectónica Agnóstica (*AS-IS Discovery*)**: Nunca asume ni fuerza una arquitectura que no esté en el código. Detecta con exactitud qué estilo arquitectónico (o combinación híbrida) tiene implementado el proyecto (MVC, N-Capas, Estructura Genérica Técnica, Screaming Architecture, Clean/Hexagonal, Cliente-Servidor, BFF Serverless, Microservicios, Event-Driven o Monolito Legacy) y qué patrones de diseño (GoF, Empresariales, Estado, Persistencia y Resiliencia) utiliza realmente.
- **Desglose Funcional Jerárquico y Deep Linking (Patrón DeepWiki / OpenDeepWiki)**: Descompone el sistema en capacidades de alto nivel y features granulares, acompañadas de un Mapa Mental visual en Mermaid (`mindmap`), flujos de usuario de extremo a extremo (*User Journeys*) y vínculos directos al código fuente (*Deep Source Linking*) para que agentes de IA y desarrolladores naveguen la solución sin puntos ciegos.
- **Rigor Estándar IEEE Std. 830-1998 / ISO 29148**: Cubre íntegramente las Secciones 1 (Introducción y Ámbito), 2 (Descripción General, Perspectiva del Producto, Características de Usuarios, Restricciones y Asunciones) y 3 (Requisitos Funcionales, de Interfaces Externas UI/HW/SW/Comunicaciones, Ejecución y Atributos de Calidad FURPS+).
- **Marcos Ágiles, DDD y XP**: Historias de usuario INVEST, desglose SPIDR, Tareas de Ingeniería (`TI-*`), Tarjetas CRC (*Class-Responsibility-Collaborator*), Lenguaje Ubicuo y detección de inconsistencias, ambigüedades o requisitos faltantes.
- **Soberanía Documental Dual**: Genera todos los archivos modulares en `project-docs/knowledge/` y compila adicionalmente el megadocumento unificado `MASTER-PROJECT-KNOWLEDGE.md` (con el 100% del contenido sin resumir).

---

## 2. Estructura Dual de Salida (`project-docs/knowledge/`)

```text
project-docs/knowledge/
├── MASTER-PROJECT-KNOWLEDGE.md          # [MEGADOCUMENTO ÚNICO] Contiene TODA la base de conocimiento consolidada de principio a fin
├── knowledge-index.json                 # Índice maestro, métricas reales detectadas y Grafo de Conocimiento (Nodos y Aristas)
├── 01-project-overview-and-business.md  # ¿De qué trata el proyecto?: Contexto del negocio, Problema, Objetivos, Qué hace/Qué NO hace, Usuarios y Glosario (IEEE 830 Secciones 1 y 2)
├── 02-architecture-and-patterns.md      # Diagnóstico AS-IS de la Arquitectura implementada, Flujos de Datos (Data Flows), Catálogo de Patrones detectados y ADRs
├── 03-capabilities-and-features.md      # [DEEPWIKI PATTERN] Desglose funcional jerárquico, Mapa Mental (Mermaid mindmap), User Journeys y Deep Source Linking
├── 04-domain-ddd-and-crc.md             # Modelo Conceptual del Dominio, Subdominios, Lenguaje Ubicuo, Context Map y Tarjetas CRC globales
├── 05-uml-diagrams.md                   # Atlas UML 2.5: Casos de Uso, Clases, Secuencias Transaccionales, Máquinas de Estado y Actividades (Swimlanes)
├── 06-architecture-diagrams.md          # Atlas de Diagramas de Arquitectura: C4 (C1-C4), Flujos de Datos, Paquetes y Resiliencia
├── 07-functional-requirements-srs.md    # SRS IEEE 830 Sección 3: RF-* (sintaxis formal + Gherkin), Interfaces Externas (UI/HW/SW/Com) y RNF-* (FURPS+)
├── 08-agile-stories-and-tasks.md        # Product Backlog: Historias INVEST (HU-*), partición SPIDR, Tareas de Ingeniería (TI-*), MVP, DoR/DoD y TDD
├── 09-data-dictionary-and-erd.md        # Diccionario de Datos, ERD Crow's Foot, mecanismo de persistencia (SQL/ORM/NoSQL/BC), concurrencia y auditoría
├── 10-business-rules-catalog.md         # Catálogo formal de Reglas de Negocio (BR-*), fórmulas matemáticas/legales y manejo de excepciones
├── 11-external-services-and-apis.md     # Integraciones externas, contratos API, seguridad (RBAC/JWT), RFC 7807 ProblemDetails y resiliencia
├── 12-code-quality-and-traceability.md  # Estándares detectados, Hotspots de deuda técnica, plan de mejora y Matriz RTM Bidireccional completa
└── modules/                             # Radiografía profunda por cada Módulo / Dominio detectado en el proyecto
    ├── {modulo_1}/
    │   ├── module-spec.md               # Qué hace el módulo, Lenguaje Ubicuo local, Patrones usados, Tarjetas CRC, Endpoints/Vistas y DTOs
    │   ├── requirements-and-rules.md    # RF-*, BR-*, Historias (HU-*) y Tareas de Ingeniería (TI-*) del módulo
    │   ├── data-and-transactions.md     # Tablas/Colecciones leídas o escritas, queries, fronteras transaccionales y eventos
    │   ├── diagrams.md                  # 6 Diagramas exclusivos del módulo (Arquitectura interna C3, Clases, Secuencia, Estados, Actividades y sub-ERD)
    │   └── technical-debt-refactoring.md# Auditoría de estado (Cubierto / Parcial / Pendiente), code smells y plan de refactorización
    └── {modulo_N}/
        └── ... (los 5 archivos por módulo)
```

---

## 3. Procedimiento de Ejecución Forense Paso a Paso

### Paso 0: Ingesta Universal (Local o GitHub) y Exploración sin Desbordamiento

1. **Origen Dual**:
   - **Workspace Local**: Escanea la estructura excluyendo directorios autogenerados (`node_modules/`, `bin/`, `obj/`, `dist/`, `.git/`, `.venv/`, `vendor/`).
   - **Repositorio GitHub**: Si se indica una URL de GitHub, usa herramientas MCP, `gh` CLI o `git clone --depth 1` y extrae primero el árbol de archivos (`git ls-tree -r HEAD --name-only`).
2. **Inspección Progresiva en 5 Capas**:
   - *Capa 0*: Documentos existentes (`README.md`, `plan.md`, `*.context.md`, actas, contratos), manifiestos de paquetes (`package.json`, `*.sln`, `*.vbproj`, `*.csproj`, `pom.xml`, `go.mod`, `pyproject.toml`) y configuración de despliegue (`Dockerfile`, `vercel.json`, `Web.config`).
   - *Capa 1*: Árbol de directorios completo para diagnosticar cómo está organizado el código.
   - *Capa 2*: Puntos de entrada (Controladores REST, rutas Frontend, páginas `.aspx`/`.vue`/`.tsx`, Gateways, Webhooks, Jobs/Cron).
   - *Capa 3*: Modelos de datos, migraciones SQL, esquemas NoSQL y adaptadores de persistencia.
   - *Capa 4*: Núcleo lógico y tests unitarios/integración.
   - *Regla para Archivos Gigantes (>800 líneas)*: Prohibido leerlos de golpe; extraer primero el índice de métodos/clases con búsqueda por expresiones regulares (`grep`) y luego leer por bloques de líneas (`offset` y `limit`).

---

### Paso 1: Elicitación del Negocio y "¿De Qué Trata el Proyecto?" (`01-project-overview-and-business.md`)

Aplica el proceso formal de ingeniería de requerimientos (Establecimiento de Objetivos -> Entendimiento del Dominio -> Organización del Conocimiento -> Recolección de Requisitos):

1. **Resumen Ejecutivo y Naturaleza del Proyecto**:
   - Explicación clara, en lenguaje natural comprensible tanto para directivos/negocio como para ingenieros, de **qué es el proyecto, qué servicio presta y en qué industria o contexto opera**.
2. **Formulación del Problema (Dolor de Negocio y Dolor Técnico)**:
   - ¿Qué problemas operativos, legales, comerciales o técnicos resuelve el sistema?
   - ¿Cuáles son sus características y límites?
3. **Visión Formal del Producto**:
   > **PARA** [usuarios/clientes objetivo], **QUIENES** [necesidad o problema a resolver], **EL** [nombre del sistema], **QUE ES UN(A)** [categoría del sistema], **QUE** [beneficio clave y diferenciador].
4. **Ámbito del Producto (IEEE 830 Sección 1.2 y 2.2)**:
   - **¿Qué HACE el software?** (Alcance incluido).
   - **¿Qué NO HACE el software?** (Exclusiones explícitas y límites del sistema).
5. **Catálogo de Stakeholders, Perfiles de Usuario (IEEE 830 Sección 2.3) y Matriz RACI**:
   - Tabla de interesados (Sponsors, Product Owner, Usuarios Directos, Usuarios Indirectos, Reguladores/Proveedores).
   - **Características del Usuario**: Para cada tipo de usuario, detallar su *Bagaje, Formación Académica, Experiencia operativa y Nivel de Especialización Técnica*.
   - **Personas del Sistema**: Fichas detalladas de cada perfil de usuario y sus dolores/necesidades.
   - **Matriz Poder/Interés** y **Matriz RACI** (*Responsable, Aprobador, Consultado, Informado*).
6. **Restricciones Generales, Asunciones y Dependencias (IEEE 830 Secciones 2.4 y 2.5)**:
   - Regulaciones legales/normativas (ej. leyes locales, impuestos DIAN/SAT, protección de datos, cadena de custodia), limitaciones de hardware/red y factores externos de los que depende el proyecto.
7. **Glosario Canónico de Términos, Siglas y Abreviaturas (IEEE 830 Sección 1.3)**.

---

### Paso 2: Radar Forense de Arquitecturas y Patrones de Diseño (`02-architecture-and-patterns.md`)

Analiza la evidencia real del repositorio y documenta con precisión quirúrgica:

#### A. Diagnóstico del Estilo Arquitectónico Implementado (*AS-IS*)
Determina cuál o cuáles de las siguientes arquitecturas están presentes (incluyendo si el proyecto es híbrido o está en transición/migración):
1. **Organización de Directorios (Screaming Architecture vs. Estructura Técnica Genérica)**:
   - Evalúa si el proyecto agrupa por **dominios/features de negocio autónomos** (`modules/Cases`, `Features/Provisioning` con sus propios `components/`, `pages/` o `views/`, `routes/`, `store/`, `services/`) o si usa una **estructura técnica genérica** (`controllers/`, `views/`, `services/`, `utils/`), explicando el impacto actual en cohesión y mantenibilidad.
2. **Topología Macro del Sistema**:
   - *Monolito (Clásico en Capas, Modular o Legacy WebForms/Server-Rendered)*.
   - *Arquitectura Cliente-Servidor Desacoplada (SPA/Mobile + REST/GraphQL API)*.
   - *Arquitectura Híbrida con BFF (Backend For Frontend) / API Gateway Resiliente*.
   - *Clean Architecture / Arquitectura Hexagonal (Puertos y Adaptadores) / Onion Architecture* (verificando la dirección de dependencias entre `Presentation`, `Application`, `Domain` e `Infrastructure`).
   - *Arquitectura Serverless / Stateless* (ej. Vercel Functions, AWS Lambda) con delegación de estado en servicios externos (Redis/Upstash, Firestore, Supabase).
   - *Arquitectura Orientada a Eventos (EDA) / Microservicios / Procesamiento Batch por Jobs*.
3. **Estado de Evolución o Migración**:
   - Si el proyecto está migrando (ej. de un monolito frontend a cliente-servidor, o de un legacy a vertical slices), documenta qué partes ya migraron, cuáles siguen en el esquema anterior y cómo se conectan (*Strangler Fig* / *Anti-Corruption Layer*).

#### B. Catálogo Forense de Patrones de Diseño Detectados
Inspecciona el código y construye una matriz con todos los patrones de diseño realmente implementados, indicando **Patrón**, **Categoría**, **Dónde está implementado (Archivos/Clases exactas)** y **Qué problema resuelve en el proyecto**:
- **Patrones Arquitectónicos y de Dominio**: CQRS (Command/Query Bus), DDD (Aggregate Root, Entity, Value Object, Domain Events), Event Sourcing, Mediator.
- **Patrones de Persistencia y Estado**: Repository Pattern, Unit of Work, Store Reactivo (Signals, SignalStore, Pinia, Redux), Data Mapper, Active Record, Anti-Corruption Layer sobre SDKs o componentes propietarios.
- **Patrones GoF (Creacionales, Estructurales, Comportamiento)**: Factory / Abstract Factory, Singleton, Builder, Adapter, Facade (Orquestadores), Proxy (ej. proxy de streaming binario), Decorator, Strategy, Template Method, Observer, Chain of Responsibility (Middlewares/Interceptors/Guards).
- **Patrones de Resiliencia, Concurrencia y Cloud**: Rate Limiting (*Token Bucket*), *Request Coalescing* (deduplicación de peticiones concurrentes), *Circuit Breaker*, *Exponential Backoff con Jitter*, *Distributed Lock* (con TTL), *Priority Queue / Staggered Batch*, *Outbox Pattern* y estandarización de errores (*RFC 7807 ProblemDetails*).

#### C. Flujos de Datos Extremo a Extremo (*Data Flows*)
Explica paso a paso cómo viaja una petición real a través de las capas detectadas en el proyecto (ej. desde el componente UI o llamada externa -> Interceptor/Guard -> Controller/Handler -> Bus/Facade -> Caso de Uso/Dominio -> Repositorio/Adaptador -> Base de Datos o Servicio Externo).

#### D. Registro de Decisiones de Arquitectura (`ADR-*`)
Documenta las decisiones arquitectónicas del proyecto (formato Michael Nygard: Contexto, Decisión, Estado, Consecuencias y Trade-offs).

---

### Paso 2.5: Desglose Funcional Jerárquico y Mapa Mental DeepWiki (`03-capabilities-and-features.md`)

Inspirado en la ingeniería inversa de **DeepWiki / OpenDeepWiki**, descompone el software a nivel funcional para conectar los componentes de código con el valor de negocio:

1. **Mapa Mental de Funcionalidades en Mermaid (`mindmap`)**:
   - Genera un árbol mental exhaustivo que organiza: `Sistema Central` $\to$ `Capacidades Principales (Subdominios)` $\to$ `Features Granulares` $\to$ `Subfunciones clave`.
2. **Matriz de Capacidades y Features Granulares**:
   - Por cada capacidad, define sus features con:
     * **Propósito y Persona**: A quién sirve y qué dolor resuelve.
     * **Entrada / Disparador**: CLI, API REST, Webhook, UI o evento interno.
     * **Precondiciones e Invariantes**: Reglas de negocio `BR-*` que protege.
     * **Ciclo de Ejecución**: Pasos secuenciales del algoritmo o procesamiento.
     * **Salidas y Mutaciones**: Efectos en base de datos, filesystem o estado.
     * **Deep Source Linking**: Enlace exacto a archivos y clases en el repositorio (`file:///...`).
     * **Mapeo de Tests**: Pruebas unitarias, de integración o Playwright que garantizan su funcionamiento.
3. **Flujos de Usuario de Extremo a Extremo (*User Journeys*)**:
   - Modela mediante `sequenceDiagram` los recorridos reales de los usuarios y agentes a través de las capacidades del sistema.
4. **Matriz de Trazabilidad Funcional**:
   - Tabla que mapea cada `CAP-XXX-NNN` con su feature, archivos fuente y suite de pruebas asociada.

---

### Paso 3: Atlas de Diagramas de Arquitectura y UML (`03-architecture-diagrams.md` y `05-uml-diagrams.md`)

> [!IMPORTANT]
> **REGLAS ESTRICTAS DE SINTAXIS Y GEOMETRÍA MERMAID**:
> * IDs estrictamente alfanuméricos sin guiones ni espacios (`nodeApiGateway`).
> * Todos los textos entre comillas dobles (`nodeA["Descripción (Segura)"]`).
> * Geometría semántica obligatoria: `["Rectángulo: Componente/Servicio"]`, `(["Estadio: Actor/Caso de Uso/Cliente"])`, `[["Subrutina: Job/Worker/Módulo Externo"]]`, `[("Cilindro: Base de Datos/Storage/Cache")]`, `>"Bandera: Cola/Evento/Webhook"]`, `{"Rombo: Decisión/Condicional"}`, `{{"Hexágono: Middleware/Guard/RateLimiter/CircuitBreaker"}}`, `[/"Paralelogramo: DTO/Archivo/Payload"/]`.

#### A. En `03-architecture-diagrams.md` (Diagramas de Arquitectura del Sistema):
1. **Diagrama de Perspectiva del Producto y Arquitectura Real (IEEE 830 Sección 2.1)**:
   - Un diagrama macro (`flowchart TD`) dividido en `subgraph` que refleje fielmente las capas reales del proyecto: Capa de Presentación/Dispositivos, Núcleo del Sistema (Frontend, Backend/BFF, Submódulos de Resiliencia o DLLs), Plataforma de Datos/Cloud (Bases de datos, Auth, Storage, Cache) y Entidades/APIs Externas.
2. **Modelo C4 Completo (Adaptado al Proyecto)**:
   - **Nivel 1 (Contexto C1)**: Usuarios/Actores, Sistema Central y Sistemas Externos/Hardware.
   - **Nivel 2 (Contenedores C2)**: Aplicaciones, APIs, Workers, Bases de Datos, Caches y Almacenamiento con protocolos y puertos exactos.
   - **Nivel 3 (Componentes C3)**: Módulos internos, controladores, buses, fachadas, servicios y adaptadores.
   - **Nivel 4 (Despliegue e Infraestructura C4)**: Topología física/cloud (Serverless, contenedores, servidores IIS/Node, redes).
3. **Diagrama de Flujo de Datos (*Data Flow Diagram*) y Pipeline de Petición**: Recorrido completo de lectura (Query) y escritura (Command) a través de la arquitectura.
4. **Diagrama de Paquetes y Grafo de Dependencias entre Módulos/Capas**: Dirección de referencias e inversión de dependencias.
5. **Diagrama de Arquitectura de Resiliencia, Concurrencia y Seguridad**: Cómo operan los Guards, Middlewares, Rate Limiters, Coalescing, Locks, Circuit Breakers y Caches.

#### B. En `05-uml-diagrams.md` (Diagramas UML de Ingeniería de Software):
1. **Diagrama de Casos de Uso UML**: Actores, frontera del sistema y relaciones `<<include>>` y `<<extend>>` (con puntos de extensión).
2. **Diagrama de Clases UML**: Entidades, Value Objects, Interfaces/Puertos, Repositorios, Servicios y Patrones con estereotipos (`<<AggregateRoot>>`, `<<ValueObject>>`, `<<Port>>`, `<<Adapter>>`), visibilidad (`+`, `-`, `#`), tipos y multiplicidades (`"1"`, `"0..*"`, `"1..*"`).
3. **Diagramas de Secuencia Transaccionales UML (`sequenceDiagram`)**: Con `autonumber`, barras de activación y bloques `alt/else`, `opt`, `loop`, `par` y `critical`.
4. **Diagramas de Máquina de Estados UML (`stateDiagram-v2`)**: Estados y transiciones con guardas `[Condición]` de las entidades principales.
5. **Diagramas de Actividades UML con Carriles (*Swimlanes*)**: Flujos algorítmicos y procesos de negocio paso a paso.

---

### Paso 4: Especificación Completa de Requisitos IEEE Std. 830-1998 (`07-functional-requirements-srs.md`)

Cubre rigurosamente toda la estructura del estándar IEEE 830 Sección 3:
1. **3.1 Requisitos Funcionales (`RF-*`)**:
   - Fórmula gramatical obligatoria: `[En el contexto/evento X], el sistema [debe / deberá / no debe] [acción técnica] [a quién / sujeto] [para lograr el resultado Y]`.
   - Detalle de **Introducción**, **Precondiciones**, **Entradas**, **Procesamiento algorítmico**, **Salidas**, **Postcondiciones** y **Escenarios Gherkin (`Given/When/Then`)**.
2. **3.2 Requisitos de Interfaces Externas**:
   - **3.2.1 Interfaces de Usuario (UI)**: Pantallas, layouts, componentes, mapas, tableros y experiencia de usuario.
   - **3.2.2 Interfaces de Hardware**: Dispositivos físicos, terminales, sensores o infraestructura física si aplica.
   - **3.2.3 Interfaces de Software**: Sistemas externos, SDKs, bases de datos (con nombre y versión), motores de IA, sistemas de almacenamiento.
   - **3.2.4 Interfaces de Comunicaciones**: Protocolos (HTTPS, REST, gRPC, SMTP STARTTLS, TCP puertos específicos, WebSockets), formatos de intercambio y cabeceras.
3. **3.3 Requisitos de Ejecución y 3.4 Restricciones de Diseño**: Acatamiento de estándares (RFC 7807, RFC 5545, leyes locales), limitaciones operativas y reglas de arquitectura.
4. **3.5 Atributos de Calidad / Requisitos No Funcionales (`RNF-*` bajo FURPS+)**: Seguridad, Fiabilidad/Resiliencia, Rendimiento, Mantenibilidad, Usabilidad y Portabilidad con métricas verificables.
5. **Detección de Requisitos Faltantes, Ambiguos o Contradictorios**: Sección de auditoría donde se señalan brechas entre lo que el negocio necesita y lo que el código implementa actualmente.

---

### Paso 5: Auditoría de Integridad de Módulos y Radiografía Profunda (`06-system-capabilities.md` y `modules/{modulo}/`)

1. **Informe de Auditoría de Módulos (Verificación de Integridad)**:
   Para cada módulo o capacidad del sistema, clasificar su estado real con semáforo ingenieril:
   - `COMPLETAMENTE CUBIERTO`: Implementado en dominio, infraestructura, presentación y probado.
   - `PARCIALMENTE CUBIERTO`: Ej. lógica de dominio lista pero falta exposición REST o conexión en UI, detallando la **Acción requerida para el siguiente sprint**.
   - `NO EXISTE / PENDIENTE`: Funcionalidad requerida o proyectada en el backlog que aún no está codificada.
2. **Carpeta por Módulo (`modules/{modulo}/`) con 5 Archivos Exhaustivos**:
   - `module-spec.md`: De qué trata el módulo, patrones que usa, Tarjetas CRC locales, contratos de API/vistas y estado de cobertura.
   - `requirements-and-rules.md`: Sus `RF-*`, reglas de negocio `BR-*`, Historias de Usuario (`HU-*`) y Tareas de Ingeniería (`TI-*`).
   - `data-and-transactions.md`: Tablas/colecciones que utiliza, consultas, bloqueos y transacciones.
   - `diagrams.md`: Sus **6 diagramas propios** (Componentes C3 del módulo, Clases UML, Secuencia, Máquina de Estados, Actividades y sub-ERD).
   - `technical-debt-refactoring.md`: Code smells detectados y plan de mejora o migración.

---

### Paso 6: Compilación del Megadocumento Único (`MASTER-PROJECT-KNOWLEDGE.md`) y Sincronización

1. **Generación de `MASTER-PROJECT-KNOWLEDGE.md`**:
   - Ensambla en un único archivo Markdown maestro (con Tabla de Contenidos navegable) la totalidad de los documentos `01` al `12` más el contenido íntegro de todos los módulos en `modules/{modulo}/*`.
   - Prohibido resumir o recortar diagramas o tablas al crear el archivo maestro; debe funcionar como el *gemelo cognitivo* completo del software en un solo archivo.
2. **Actualización de `knowledge-index.json` e Ingesta en el Modelo Relacional Plane (`pages`, `page_versions`, `page_logs`, `page_labels`, `ai_runs`)**:
   - Actualiza `project-docs/knowledge/knowledge-index.json` con todos los documentos, conteos reales y el grafo de relaciones.
   - Al escribir los documentos Markdown, utiliza menciones explícitas a tareas (`INT-001`..`INT-NNN`), reglas (`BR-XXX`), requisitos (`RF-XXX`), decisiones (`ADR-XXX`) y capacidades (`CAP-XXX`) para que el motor Plane SQLite construya automáticamente el grafo bidireccional en `page_logs` y los renderice como **Smart Entity Chips** interactivos en `PageReader.js` y en la pestaña **Info / Assets / Historial** de `PageNavigationPane.js`.
   - Registra las páginas clave con sus metadatos Plane (`--locked` para páginas normativas bloqueadas contra edición accidental, `--favorite` para documentos estrella, `--full-width` para pliegos con diagramas anchos, `--labels` para `page_labels` y `--module` para vincular al módulo DDD) y ejecuta la sincronización completa:
     ```bash
     node project-docs/cli.js page upsert --id "page-kb-c4-model_md" --title "Modelo de Arquitectura C4 (C1-C4)" --shelf "architecture" --file "project-docs/knowledge/c4-model.md" --locked --favorite --full-width --labels "c4-model,architecture,mermaid"
     node project-docs/cli.js page upsert --id "page-kb-business-rules_md" --title "Catalogo de Reglas de Negocio (BR-*)" --shelf "business_rules" --file "project-docs/knowledge/business-rules.md" --locked --favorite --labels "business-rules,invariants,ddd"
     node project-docs/cli.js page upsert --id "page-kb-MASTER-PROJECT-KNOWLEDGE_md" --title "Dossier Maestro Consolidado (Single-File Context)" --shelf "architecture" --file "project-docs/knowledge/MASTER-PROJECT-KNOWLEDGE.md" --locked --favorite --full-width --labels "master-bundle,ieee-830,c4-model,deepwiki"
     node project-docs/cli.js sync
     node project-docs/cli.js ai log --skill project-knowledge --role spec-author --type KNOWLEDGE_EXTRACTION --summary "Extraccion de base de conocimiento soberana C4, UML, reglas BR-*, grafo page_logs y etiquetas page_labels" --artifacts "project-docs/knowledge/MASTER-PROJECT-KNOWLEDGE.md,project-docs/knowledge/knowledge-index.json"
     node project-docs/sync-data.js
     ```

---

## 4. Puerta de Auditoría de Calidad (Self-Audit Checklist)

Antes de finalizar, verifica obligatoriamente:

- [ ] **Agnosticismo y Fidelidad al Proyecto Real**: Se analizaron tanto las partes modernas como las legacy (si existen), sin inventar tecnologías que no estén en el repositorio.
- [ ] **Manejo de Archivos Masivos**: Si hubo archivos >800 líneas, se inspeccionaron por símbolos y rangos sin perder reglas de negocio.
- [ ] **Doble Salida Completa**: Existen todos los archivos divididos en `project-docs/knowledge/` **Y** existe el megadocumento unificado `project-docs/knowledge/MASTER-PROJECT-KNOWLEDGE.md`.
- [ ] **Módulos Profundos (5 archivos + 6 diagramas por módulo)**: Cada módulo en `modules/{modulo}/` cuenta con `module-spec.md`, `requirements-and-rules.md`, `data-and-transactions.md`, `diagrams.md` y `technical-debt-refactoring.md`.
- [ ] **12 Tipos de Diagramas con Geometría Exacta**: Todos los diagramas Mermaid usan las formas geométricas correctas (cilindros, hexágonos, subrutinas, banderas, rombos) y tienen IDs alfanuméricos limpios con etiquetas entrecomilladas.
- [ ] **Grafo Relacional Plane (`page_logs`, `page_labels`, `page_versions`)**: `node project-docs/cli.js sync` y `node project-docs/sync-data.js` se ejecutaron poblando telemetría documental (`word_count`, `char_count`, `paragraph_count`, `diagrams_count`), etiquetas semánticas y vínculos cruzados hacia `INT-*`, `BR-*`, `RF-*`, `ADR-*` y `CAP-*`.
