# 1. Introducción y Marco Metodológico

**Ficha de Control Documental**

| Atributo | Detalle Institucional y Técnico |
| :--- | :--- |
| **Proyecto / Producto** | **ContextForge**: Plataforma Soberana de Gestión Documental *Docs-as-Code*, Búsqueda Híbrida (BM25 + Vectorial), Generación Aumentada por Recuperación (RAG) con Citas, Compilación de *Context Bundles* y Componente de Software Reutilizable para Agentes de Inteligencia Artificial |
| **Tipo de Entregable** | Especificación de Requisitos de Software (ERS / SRS) y Propuesta de Reingeniería Funcional |
| **Código Documental** | `ERS-CF-UPC-2026-V2.0` |
| **Versión / Línea Base** | `2.0.0` (Integra Línea Base Operativa `AS-IS v1.0.0` y Reingeniería Objetivo `TO-BE v2.0.0`) |
| **Institución Académica** | Universidad Popular del Cesar (UPC) — Facultad de Ingenierías y Tecnológicas |
| **Posgrado** | Especialización en Ingeniería de Software |
| **Módulo Académico** | Ingeniería de Requerimientos |
| **Docente Titular** | Esp. / Msc. Maribel Romero Mestre |
| **Autores** | Kathy Carolina Sagbini Daza y Nayid Junior Castellar Agamez |
| **Estándares Aplicados** | IEEE Std 830-1998, ISO/IEC/IEEE 29148:2018, ISO/IEC 25010:2023 (SQuaRE), SWEBOK v4.0, FURPS+, UML 2.5, Modelo C4, Scrum/XP (INVEST, SPIDR), Normas APA 7.ª Edición |
| **Lugar y Fecha** | Valledupar, Cesar — 2026 |

---

## 1.1 Propósito del Documento

El presente documento constituye la **Especificación de Requisitos de Software (ERS)** formal, integral y verificable del sistema **ContextForge**, elaborada bajo los lineamientos metodológicos de los estándares internacionales **IEEE Std 830-1998** e **ISO/IEC/IEEE 29148:2018**, articulados con el modelo de calidad de producto **ISO/IEC 25010:2023 (SQuaRE)**, las áreas de conocimiento del **SWEBOK v4.0** y las prácticas ágiles de ingeniería de requisitos (**Scrum, Extreme Programming [XP], INVEST y SPIDR**).

Su propósito principal es establecer una **fuente única de verdad contractual, arquitectónica y de validación** entre los interesados del proyecto (*stakeholders*), el equipo de arquitectura y desarrollo, los ingenieros de aseguramiento de la calidad (QA) y los responsables de operación y mantenimiento. Adicionalmente, este documento trasciende la mera descripción pasiva de la versión implementada en el repositorio (**estado actual o `AS-IS v1.0.0`**) para incorporar un ejercicio riguroso de **reingeniería funcional y arquitectónica (`TO-BE v2.0.0`)**, identificando brechas estructurales de seguridad, gobernanza editorial, escalabilidad asíncrona, trazabilidad histórica e interoperabilidad multi-proveedor, y especificando formalmente los requerimientos que cierran dichas brechas.

## 1.2 Alcance del Producto

**ContextForge** es un ecosistema de software concebido bajo una arquitectura dual que resuelve la fragmentación de conocimiento técnico y la pérdida de contexto verificable al integrar agentes de Inteligencia Artificial (IA), copilotos de programación y asistentes conversacionales en proyectos de ingeniería de software:

1. **Núcleo Reutilizable Distribuible (`contextforge` Python SDK `v1.0.0+`):** Un componente de software autocontenido, instalable vía `pyproject.toml` (`pip install contextforge`) y libre de dependencias obligatorias de terceros en su núcleo, que expone una API pública pequeña, inmutable y extensible (`ContextForge`, `ContextForgeBuilder`, contratos abstractos en `contextforge.contracts`) separada estrictamente de su implementación interna (`contextforge._internal`). Provee validación documental por reglas encadenadas, segmentación semántica (*chunking*), indexación híbrida léxica (BM25) y vectorial, fusión de rankings (*Reciprocal Rank Fusion* [RRF] y combinación lineal ponderada), generación RAG con atribución exacta de citas y compilación determinista de paquetes de contexto (*Context Bundles*) sujetos a presupuestos estrictos de tokens.
2. **Plataforma Soberana Web, API REST/SSE, Tiempo Real y Servidor MCP (`ContextForge Hub`):** Una aplicación anfitriona construida bajo **Clean Architecture**, **CQRS granular** y **Screaming Web Architecture** (FastAPI, SQLAlchemy Async sobre SQLite WAL / PostgreSQL, ChromaDB, WebSockets y Tailwind CSS v4) que materializa sobre el motor central un entorno multi-proyecto de gestión documental *Docs-as-Code* (bibliotecas, libros, capítulos Markdown y anexos binarios), chat RAG en tiempo real con transmisión progresiva (*Server-Sent Events* [SSE]), compilador visual de *Context Bundles*, colaboración síncrona mediante WebSockets, administración dinámica de proveedores Multi-LLM (Ollama local, OpenAI, Google Gemini, Anthropic Claude o modo extractivo sin red) y un servidor nativo del **Model Context Protocol (MCP)** consumible por IDEs y agentes autónomos (Cursor, GitHub Copilot, Claude Code, Antigravity).

### Delimitación Explícita de Fronteras del Sistema

| Dimensión de Alcance | Capacidades Incluidas Dentro del Alcance (*In-Scope*) | Elementos Excluidos Fuera del Alcance (*Out-of-Scope*) |
| :--- | :--- | :--- |
| **Gobernanza y Espacios de Conocimiento (`PRJ`)** | Administración multi-proyecto (*workspaces* aislados por `project_slug`), taxonomía de colecciones/módulos y etiquetas, sincronización bidireccional con carpetas Markdown locales (*Docs-as-Code*) y control de cuotas por espacio (`TO-BE`). | Sistemas ERP financieros, facturación comercial por suscripción SaaS (pasarelas de pago Stripe/PSE) o gestión de nómina empresarial. |
| **Gestión Documental y Ciclo Editorial (`DOC`)** | Creación, edición enriquecida con vista previa dividida, carga y extracción de anexos técnicos (PDF, DOCX, TXT, código), flujo de estados editoriales (`DRAFT`, `IN_REVIEW`, `PUBLISHED`, `DEPRECATED`) e historial inmutable de versiones con *diff* y reversión (`TO-BE`). | Edición ofimática propietaria de hojas de cálculo complejas con macros VBA o diseño gráfico vectorial nativo dentro del navegador. |
| **Búsqueda Híbrida y Motor RAG (`RAG`)** | Segmentación sensible a encabezados Markdown, indexación dual BM25 + embeddings vectoriales, reindexación incremental por huella criptográfica `SHA-256` en cola asíncrona (`TO-BE`), consulta RAG con *streaming* SSE, citas verificables por fragmento y degradación extractiva local cuando no hay LLM disponible. | Entrenamiento desde cero (*pre-training*) o ajuste fino de pesos neuronales (*fine-tuning* con GPUs dedicadas) de modelos fundacionales de lenguaje. |
| **Empaquetado de Contexto e Integración IA (`BND`)** | Selección asistida o manual de documentos, cálculo en tiempo real de presupuesto de tokens (`max_tokens`), exportación extensible a Markdown, JSON, XML o formatos de terceros (`IBundleExporter`) y exposición de herramientas estandarizadas vía servidor **MCP** (`/mcp`). | Ejecución autónoma de despliegues en infraestructura productiva del cliente (CI/CD *runners* propios) sin supervisión de una herramienta externa. |
| **Colaboración en Tiempo Real y Auditoría (`COL`)** | Indicadores de presencia activa por documento vía WebSockets, hilos de comentarios y calificaciones técnicas por sección, notificaciones de cambios concurrentes y bitácora de auditoría transaccional de solo adición (*append-only*) (`TO-BE`). | Videoconferencia WebRTC integrada, llamadas de voz IP o mensajería instantánea corporativa generalista tipo Slack/Teams. |
| **Seguridad, Identidad y Multi-LLM (`CFG`)** | Configuración en caliente y diagnóstico de salud (*health-check*) de motores de base de datos y proveedores LLM, cifrado de secretos de API en reposo (`AES-256-GCM`, `TO-BE`), autenticación híbrida JWT/OIDC + API Keys para agentes y control de acceso basado en roles **RBAC** (`TO-BE`). | Aprovisionamiento físico de redes corporativas, gestión de directorios activos legados on-premise (LDAP v2 sin puente OIDC) o firewalls perimetrales de hardware. |

## 1.3 Audiencias Objetivo y Uso del Documento

Siguiendo la taxonomía clásica de lectores de una ERS formulada por Kotonya y Sommerville (1998) y estandarizada en ISO/IEC/IEEE 29148:2018, este documento ha sido estructurado para satisfacer las necesidades específicas de seis perfiles técnicos e institucionales:

1. **Patrocinadores Académicos, Directivos y Clientes (`Sponsors` / Evaluación Docente):** Utilizan las Secciones 1 y 2 para validar la pertinencia del problema abordado, la alineación con los objetivos estratégicos, el retorno técnico de las propuestas de reingeniería (`AS-IS` frente a `TO-BE`) y el alcance contractual del sistema.
2. **Líderes de Producto y Gestores de Proyecto (`Product Owners` / `Scrum Masters`):** Emplean las Secciones 2, 5 y 7 para gestionar las expectativas de los *stakeholders*, conducir la priorización del *Product Backlog*, planificar iteraciones basadas en puntos de historia Fibonacci, aplicar la descomposición **SPIDR** y auditar los criterios *Definition of Ready (DoR)* y *Definition of Done (DoD)*.
3. **Arquitectos de Software y Desarrolladores (`Backend`, `Frontend` e `Integradores SDK`):** Tienen en las Secciones 3, 4 y 6 su guía normativa de construcción; allí encuentran los contratos exactos de entradas, invariantes de negocio (`BR-*`), respuestas de error bajo **RFC 7807**, requisitos de interfaces externas (`RIU`, `RIH`, `RIS`, `RIC`) y los seis modelos arquitectónicos y de datos en **C4, UML 2.5 y ERD**.
4. **Ingenieros de Aseguramiento de Calidad (`QA` y Automatización de Pruebas):** Se apoyan en los criterios de aceptación **Gherkin (`Dado / Cuando / Entonces`)** de cada `RF-*` y `HU-*`, las métricas cuantitativas verificables de los `RNF-*` y la Matriz de Trazabilidad Bidireccional (**RTM**) de la Sección 7 para diseñar casos de prueba unitarios, de integración, de contrato MCP, de carga y de aceptación E2E.
5. **Ingenieros de Seguridad, Datos y Cumplimiento (`DevSecOps` / Oficial de Privacidad):** Consultan la Sección 4 para verificar los controles de autenticación OAuth2/JWT, autorización RBAC, prevención de fugas de información confidencial hacia LLMs externos, soberanía de datos y adherencia a la legislación colombiana de protección de datos personales.
6. **Equipos de Mantenimiento y Evolución de Plataforma:** Aprovechan la separación explícita de puntos de extensión bajo el Principio Abierto/Cerrado (**OCP**), el catálogo de reglas de negocio y el modelo relacional normalizado para incorporar nuevos proveedores generativos, almacenes vectoriales o exportadores sin introducir regresiones.

## 1.4 Definiciones, Acrónimos y Abreviaturas

Con el fin de eliminar cualquier ambigüedad léxica o semántica (criterio de *No Ambigüedad* de IEEE Std 830), la Tabla 1 establece las definiciones canónicas empleadas a lo largo de toda la especificación.

| Acrónimo / Término | Significado Técnico en el Dominio de ContextForge |
| :--- | :--- |
| **ADR** | *Architecture Decision Record*: Documento breve en Markdown que registra una decisión arquitectónica relevante, su contexto, alternativas evaluadas y consecuencias. |
| **API** | *Application Programming Interface*: Conjunto de contratos públicos (en Python SDK o endpoints HTTP REST) mediante los cuales consumidores externos interactúan con ContextForge. |
| **AS-IS** | Estado base actual del software auditado en el repositorio (`ContextForge v1.0.0`), funcional y verificado, sobre el cual se diagnostican oportunidades de mejora. |
| **BM25** | *Best Matching 25*: Función probabilística de recuperación de información léxica basada en frecuencia de términos (TF), frecuencia inversa de documento (IDF) y normalización por longitud. |
| **Bounded Context** | Contexto delimitado según *Domain-Driven Design* (DDD) dentro del cual un modelo de dominio, vocabulario ubicuo e invariantes mantienen significado unívoco (`PRJ`, `DOC`, `RAG`, `BND`, `COL`, `CFG`). |
| **C4 (Modelo)** | Notación jerárquica de arquitectura de software propuesta por Simon Brown compuesta por cuatro niveles de abstracción: Contexto (N1), Contenedores (N2), Componentes (N3) y Código (N4). |
| **Chunk / Chunking** | Fragmento cohesivo de texto extraído de un documento fuente mediante una estrategia de segmentación (`HeadingAware` o `SlidingWindow`) para maximizar la precisión de búsqueda e inyección RAG. |
| **Context Bundle** | Paquete determinista e inmutable de conocimiento compilado por ContextForge para un agente de IA, ajustado estrictamente a un presupuesto máximo de tokens (`max_tokens`) en formato Markdown, JSON o XML. |
| **CQRS** | *Command Query Responsibility Segregation*: Patrón arquitectónico que segrega las operaciones de mutación de estado (*Commands*) de las operaciones de lectura y proyección (*Queries*). |
| **DLQ** | *Dead-Letter Queue*: Cola de mensajes o tareas fallidas donde se aíslan documentos cuya extracción o indexación falló tras agotar la política de reintentos, permitiendo inspección y reprocesamiento. |
| **Docs-as-Code** | Filosofía de ingeniería documental donde la documentación técnica reside en texto plano (Markdown) junto al código fuente, sometida a control de versiones, validación automática y trazabilidad. |
| **DoD / DoR** | *Definition of Done* (Definición de Terminado) y *Definition of Ready* (Definición de Preparado): Acuerdos formales de calidad de entrada y salida de elementos del *Sprint Backlog* en Scrum. |
| **ERS / SRS** | Especificación de Requisitos de Software (*Software Requirements Specification*). |
| **FURPS+** | Modelo taxonómico de requisitos desarrollado por Robert Grady en Hewlett-Packard: *Functionality, Usability, Reliability, Performance, Supportability* más restricciones de diseño, interfaz, físicas y legales (`+`). |
| **GoF / GRASP / SOLID** | Catálogo de 23 patrones de diseño clásicos (*Gang of Four*), patrones de asignación de responsabilidades (*General Responsibility Assignment Software Patterns*) y los cinco principios de diseño orientado a objetos de Robert C. Martin. |
| **INVEST** | Criterio de calidad para Historias de Usuario formulado por Bill Wake: *Independent, Negotiable, Valuable, Estimable, Small, Testable*. |
| **MCP** | *Model Context Protocol*: Protocolo estándar abierto basado en JSON-RPC 2.0 que permite a agentes de IA e IDEs descubrir e invocar herramientas (`tools`), recursos y contextos expuestos por servidores locales o remotos. |
| **OCP** | *Open/Closed Principle* (Principio Abierto/Cerrado): Las entidades de software deben estar abiertas para su extensión mediante contratos polimórficos, pero cerradas para la modificación de su código fuente probado. |
| **P95 / P99** | Percentiles 95 y 99 de distribución de latencia; indican el tiempo máximo de respuesta garantizado para el 95 % y el 99 % de las peticiones bajo una carga concurrente dada. |
| **RAG** | *Retrieval-Augmented Generation*: Arquitectura híbrida que recupera fragmentos verificados de una base de conocimiento antes de invocar un modelo generativo (LLM), anclando la respuesta en evidencia trazable. |
| **RBAC** | *Role-Based Access Control*: Modelo de seguridad donde los permisos sobre operaciones se asignan a roles organizacionales (`Admin`, `Curator`, `Consumer`, `AgentClient`) y no a sujetos aislados. |
| **RFC 7807** | Estándar IETF (*Problem Details for HTTP APIs*, actualizado por RFC 9457) que define una estructura JSON uniforme (`type`, `title`, `status`, `detail`, `instance`) para reportar errores en APIs HTTP. |
| **RRF** | *Reciprocal Rank Fusion*: Algoritmo matemático de fusión de listas ordenadas heterogéneas definido por $\text{RRF}(d) = \sum_{r \in R} \frac{1}{k + \text{rank}_r(d)}$, capaz de combinar resultados BM25 y vectoriales sin requerir calibración de escalas. |
| **RPO / RTO** | *Recovery Point Objective* (pérdida máxima tolerable de datos medida en tiempo) y *Recovery Time Objective* (tiempo máximo tolerable para restaurar el servicio tras un incidente). |
| **RTM** | *Requirements Traceability Matrix*: Matriz de Trazabilidad Bidireccional que vincula objetivos de negocio, interesados, requisitos funcionales, reglas de negocio, casos de uso, historias de usuario, requisitos no funcionales y pruebas. |
| **SPIDR** | Técnica ágil propuesta por Mike Cohn para dividir épicas complejas en historias pequeñas mediante cinco vectores: *Spike, Paths, Interfaces, Data, Rules*. |
| **SSE** | *Server-Sent Events*: Estándar HTTP unidireccional (`text/event-stream`) utilizado por ContextForge para transmitir en tiempo real los tokens generados por el motor RAG y las citas asociadas. |
| **SUS** | *System Usability Scale*: Cuestionario psicométrico estandarizado de 10 ítems (escala 0 a 100) creado por John Brooke para medir objetivamente la usabilidad percibida de un sistema. |
| **TO-BE** | Estado objetivo propuesto mediante reingeniería funcional y arquitectónica en esta ERS (`ContextForge v2.0.0`) para elevar la seguridad, escalabilidad, gobernanza y auditabilidad del producto. |
| **WAL** | *Write-Ahead Logging*: Modo transaccional de motores relacionales como SQLite y PostgreSQL que permite lecturas concurrentes sin bloqueo mientras se ejecutan escrituras atómicas. |

## 1.5 Referencias Normativas y Metodológicas

La formulación, clasificación, análisis, validación y modelado de los requisitos contenidos en esta especificación se fundamentan en el siguiente marco normativo, técnico y legal:

- **Estándares Internacionales de Ingeniería de Software y Calidad:**
  - **IEEE Std 830-1998:** *IEEE Recommended Practice for Software Requirements Specifications*, adoptado para la organización estructural de secciones, criterios de completitud, consistencia, verificabilidad y especificación de interfaces externas.
  - **ISO/IEC/IEEE 29148:2018:** *Systems and software engineering — Life cycle processes — Requirements engineering*, empleado para la sintaxis formal libre de ambigüedades, atributos de requisitos, trazabilidad bidireccional y validación de necesidades de interesados.
  - **ISO/IEC 25010:2023 (SQuaRE):** *Systems and software engineering — Systems and software Quality Requirements and Evaluation — Product quality model*, utilizado para categorizar y cuantificar los atributos de calidad del producto (adecuación funcional, eficiencia de desempeño, compatibilidad, capacidad de interacción/usabilidad, fiabilidad, seguridad, mantenibilidad y flexibilidad).
  - **IEEE Computer Society — SWEBOK v4.0 (2024):** *Guide to the Software Engineering Body of Knowledge*, Capítulo 1 (*Software Requirements*), guía rectora del proceso de elicitación, análisis, negociación, especificación y validación.
  - **OMG UML 2.5.1 (2017) y Modelo C4 (Brown, 2018):** Estándares de notación visual para los diagramas de contexto, contenedores, casos de uso, clases de dominio y secuencia de interacciones.
  - **IETF RFC 7807 / RFC 9457, RFC 6749 (OAuth 2.0), RFC 7519 (JWT) y W3C WCAG 2.1 Nivel AA:** Estándares técnicos de interoperabilidad web, seguridad de APIs y accesibilidad de interfaces de usuario.
- **Marco Metodológico Ágil y de Diseño:**
  - **Guías Metodológicas Institucionales UPC (Romero Mestre, 2026):** Lineamientos de cátedra sobre gramática formal de requisitos, proceso de negociación en tres etapas, matriz de visión, especificación de interfaces externas y lista de chequeo de validación (`ER, N, Na, V, Cpo, Cto, Vb, Pb, Cte`).
  - **Scrum Guide (Schwaber & Sutherland, 2020), User Stories Applied / SPIDR (Cohn, 2004) y Extreme Programming Explained (Beck & Andres, 2004):** Marco para historias de usuario bajo criterios INVEST, estimación relativa Fibonacci, *Definition of Ready/Done*, TDD e integración continua.
- **Marco Normativo y Regulatorio Colombiano aplicable a Datos e IA:**
  - **Ley Estatutaria 1581 de 2012 y Decreto Reglamentario 1377 de 2013:** Régimen general de protección de datos personales (*Habeas Data*) en Colombia, aplicable al tratamiento de identidades de autores, registros de auditoría y prevención de exposición de datos sensibles en prompts generativos.
  - **Ley 1273 de 2009:** Protección de la información y de los datos frente a accesos abusivos, interceptación o daño informático.
  - **Ley 1712 de 2014 y Resolución MinTIC 1519 de 2020:** Lineamientos de transparencia, accesibilidad digital (conformidad WCAG 2.1 AA) y seguridad de la información cuando la plataforma se despliega en entornos institucionales o académicos.
  - **CONPES 4144 de 2025 / Marco Ético para la Inteligencia Artificial en Colombia:** Principios de transparencia algorítmica, explicabilidad (citas verificables obligatorias), supervisión humana y privacidad desde el diseño (*Privacy by Design*).

## 1.6 Visión General y Estructura de la Especificación

El resto de este documento se organiza en ocho capítulos cohesivos y mutuamente trazables:

- **Capítulo 2 (Análisis del Problema, Elicitación, Stakeholders y Reingeniería):** Examina la problemática raíz del manejo de contexto técnico para IA, formula la pregunta problema, la visión del producto y los objetivos medibles; documenta el proceso de elicitación y negociación de conflictos; caracteriza a los *stakeholders* mediante matrices Poder/Interés y RACI; expone el diagnóstico crítico comparativo `AS-IS` frente a `TO-BE` y consolida el catálogo maestro de reglas de negocio (`BR-01` a `BR-16`).
- **Capítulo 3 (Modelo de Casos de Uso y Requerimientos Funcionales):** Define los actores primarios y secundarios, las fichas descriptivas de 14 Casos de Uso (`CU-01` a `CU-14`) y especifica en tablas rigurosas 24 Requerimientos Funcionales (`RF-*`) distribuidos en seis *Bounded Contexts* (`PRJ`, `DOC`, `RAG`, `BND`, `COL`, `CFG`), siguiendo estrictamente la fórmula gramatical institucional, validaciones de entrada, procesamiento paso a paso, errores RFC 7807 y escenarios Gherkin.
- **Capítulo 4 (Requerimientos No Funcionales, Interfaces Externas y Otros Requisitos):** Cuantifica 18 Requerimientos No Funcionales (`RNF-01` a `RNF-18`) bajo el modelo **FURPS+** cruzado con **ISO/IEC 25010:2023**, detalla los requisitos de interfaces de usuario (`RIU-*`), hardware (`RIH-*`), software (`RIS-*`) y comunicaciones (`RIC-*`), e incorpora los requisitos legales, regulatorios y de gobernanza de IA (`OR-*`).
- **Capítulo 5 (Modelado Ágil: SPIDR, Historias de Usuario y Acuerdos Scrum/XP):** Presenta la partición de épicas complejas con la técnica **SPIDR**, el catálogo de 20 Historias de Usuario (`HU-01` a `HU-20`) verificadas con **INVEST** y desglosadas en tareas de ingeniería (`TI-*`), el *Product Backlog* priorizado y los acuerdos operativos *DoR*, *DoD* y prácticas *XP*.
- **Capítulo 6 (Modelado Arquitectónico y Diagramas de Ingeniería):** Integra y documenta los seis modelos gráficos nativos desarrollados en Draw.io (Contexto C4 N1, Contenedores C4 N2, Casos de Uso UML, Clases de Dominio UML, Secuencia Principal con fragmentos `alt`/`opt` y Modelo Entidad-Relación Normalizado ERD).
- **Capítulo 7 (Validación de Requisitos, Matriz de Trazabilidad RTM y Control de Cambios):** Aplica la lista de chequeo formal de validación de calidad sobre los requisitos, construye la Matriz de Trazabilidad Bidireccional completa y define el protocolo de gestión de línea base y control de cambios.
- **Capítulos 8 y 9 (Conclusiones y Referencias Bibliográficas):** Sintetizan los aportes ingenieriles de la especificación y la reingeniería propuesta, cerrando con las fuentes bibliográficas en formato **APA 7.ª edición**.
