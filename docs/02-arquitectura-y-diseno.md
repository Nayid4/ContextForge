# Documentación Técnica, Arquitectura y Diseño — ContextForge (`v1.0.0`)

## 1. Requerimientos No Funcionales (ISO/IEC 25010)

| Característica ISO/IEC 25010 | Subcaracterística | Requisito Concreto en ContextForge | Mecanismo de Verificación |
| :--- | :--- | :--- | :--- |
| **Mantenibilidad** | **Reusabilidad** | El componente `contextforge` no depende de frameworks web, bases de datos ni APIs externas (`dependencies = []`) y funciona en cualquier proyecto Python `>= 3.11`. | Instalación aislada vía `pyproject.toml` y ejecución de `examples/agent_knowledge_cli.py`. |
| **Mantenibilidad** | **Modularidad** | Separación estricta entre API pública (`src/contextforge/{__init__,client,builder,contracts,models,exceptions}.py`) e implementación interna (`src/contextforge/_internal/`). Todo archivo fuente mantiene `<= 300` líneas. | Inspección de `__all__` en pruebas y auditoría automática de líneas por archivo. |
| **Mantenibilidad** | **Capacidad de prueba** | Toda dependencia colaboradora (`ILexicalStore`, `IVectorStore`, `ILLMProvider`, `IKnowledgeObserver`) es inyectable y reemplazable por dobles de prueba (fakes, stubs, spies). | Suite `pytest` con cobertura de líneas `>= 70%` sobre `src/contextforge/`. |
| **Mantenibilidad** | **Facilidad de modificación** | Agregar nuevos chunkers, rankers, exportadores o reglas de validación no exige editar código existente del núcleo (OCP). | Pruebas de extensión externa en `tests/unit/test_contextforge_component.py`. |
| **Adecuación Funcional** | **Corrección funcional** | Las operaciones `ingest`, `search`, `ask` y `compile_bundle` validan entradas y lanzan excepciones tipadas derivadas de `ContextForgeError`. | Tipado estricto `mypy --strict src` sin errores y pruebas de caminos de error. |
| **Eficiencia de Desempeño** | **Comportamiento temporal** | Las operaciones en memoria se ejecutan en milisegundos y registran `latency_ms` mediante `AuditingOperationDecorator`. | Inspección de `engine.audit_trail`. |

---

## 2. Arquitectura del Componente — Modelo C4

### Nivel 1: Diagrama de Contexto del Sistema

```mermaid
flowchart TB
    App["Aplicación Consumidora<br/>(Chat IA, CLI, Microservicio, FastAPI)"]
    Dev["Equipo Externo / Integrador<br/>(Extiende contratos sin editar código)"]
    CF["Componente ContextForge v1.0.0<br/>(Base de Conocimiento, RAG Híbrido y Context Bundles)"]
    FS["Archivos Markdown<br/>(Docs-as-Code)"]
    LLM["Proveedor LLM Externo<br/>(Ollama, Gemini, OpenAI o Stub)"]

    Dev -->|"Implementa contratos OCP"| CF
    App -->|"Usa API Pública (from contextforge import ...)"| CF
    CF -->|"Lee opcionalmente"| FS
    CF -->|"Delega generación vía ILLMProvider"| LLM
```

**Justificación**: El sistema consumidor depende únicamente de la frontera pública de `ContextForge`, aislando su lógica de negocio de los detalles de indexación, fusión de puntajes y proveedores generativos.

### Nivel 2: Diagrama de Contenedores

```mermaid
flowchart LR
    Consumer["Código Cliente / App Ejemplo<br/>(examples/agent_knowledge_cli.py)"]
    subgraph Pkg["Paquete Python Instalable: contextforge v1.0.0"]
        PublicAPI["API Pública<br/>(__init__, client, builder, contracts, models, exceptions)"]
        Internal["Núcleo Interno Privado<br/>(contextforge._internal)"]
    end
    OptionalWeb["Host Web Opcional<br/>(FastAPI + Screaming Web en src/presentation/web/)"]

    Consumer -->|"Importa solo símbolos en __all__"| PublicAPI
    OptionalWeb -->|"Consume y adapta"| PublicAPI
    PublicAPI -->|"Orquesta mediante interfaces"| Internal
```

**Justificación**: La separación física en subpaquete `_internal/` impide acoplamientos accidentales a clases concretas y permite evolucionar estructuras internas (p. ej. cambiar el índice BM25 o el vectorizador) preservando compatibilidad semántica (`v1.x`).

### Nivel 3: Diagrama de Componentes Internos

```mermaid
flowchart TD
    Builder["ContextForgeBuilder<br/>(Builder)"] -->|"Ensambla"| Facade["ContextForge<br/>(Facade)"]
    Facade -->|"Envuelve operaciones"| AuditDec["AuditingOperationDecorator<br/>(Decorator)"]
    Facade -->|"Valida documentos"| Rules["DocumentRuleChain<br/>(Chain of Responsibility)"]
    Facade -->|"Resuelve estrategias"| StratFac["StrategyFactory<br/>(Factory)"]
    Facade -->|"Ejecuta recuperación"| RetFac["RetrieverFactory<br/>(Factory)"]
    Facade -->|"Exporta bundles"| ExpReg["BundleExporterRegistry<br/>(Factory)"]
    Facade -->|"Emite eventos"| Bus["KnowledgeEventBus<br/>(Observer)"]

    StratFac --> Chunker["IChunkingStrategy<br/>(HeadingAware / SlidingWindow)"]
    StratFac --> Ranker["IHybridRankingStrategy<br/>(RRF / Weighted)"]
    RetFac --> Lex["ILexicalStore<br/>(InMemoryLexicalStore)"]
    RetFac --> Vec["IVectorStore<br/>(InMemoryVectorStore)"]
    Facade --> LLM["ILLMProvider<br/>(ExtractiveFallback / Externo)"]
```

---

## 3. Diagramas UML

### 3.1 Diagrama de Clases UML (API Pública y Colaboradores Internos)

```mermaid
classDiagram
    class ContextForge {
        +ingest(documents, chunking_strategy) IngestionReport
        +ingest_directory(directory, pattern) IngestionReport
        +search(query, top_k, mode, ranking, collection) list~SearchHit~
        +ask(question, top_k, mode, ranking, system_prompt) RagResponse
        +compile_bundle(name, query, document_ids, max_tokens, export_format) ContextBundle
        +register_chunking_strategy(strategy)
        +register_ranking_strategy(strategy)
        +register_exporter(exporter)
        +register_rule(rule)
        +subscribe(observer)
        +set_llm_provider(provider)
    }

    class ContextForgeBuilder {
        +with_config(config) ContextForgeBuilder
        +with_stores(lexical_store, vector_store) ContextForgeBuilder
        +with_llm_provider(provider) ContextForgeBuilder
        +with_chunking_strategy(strategy) ContextForgeBuilder
        +with_ranking_strategy(strategy) ContextForgeBuilder
        +with_exporter(exporter) ContextForgeBuilder
        +with_rule(rule) ContextForgeBuilder
        +with_observer(observer) ContextForgeBuilder
        +build() ContextForge
    }

    class IChunkingStrategy {
        <<interface>>
        +name str
        +chunk(document) list~DocumentChunk~
    }
    class HeadingAwareChunkingStrategy
    class SlidingWindowChunkingStrategy

    class IHybridRankingStrategy {
        <<interface>>
        +name str
        +fuse(lexical_hits, vector_hits, top_k) list~SearchHit~
    }
    class ReciprocalRankFusionStrategy
    class WeightedLinearRankingStrategy

    class IBundleExporter {
        <<interface>>
        +format_name str
        +export(name, documents, estimated_tokens, max_tokens) str
    }
    class MarkdownBundleExporter
    class JsonBundleExporter
    class XmlBundleExporter

    class ILLMProvider {
        <<interface>>
        +provider_name str
        +generate(prompt, system_prompt) str
    }
    class ExtractiveFallbackLLMProvider

    class IDocumentRule {
        <<interface>>
        +rule_name str
        +validate(document) None
    }
    class DocumentRuleChain {
        +add_rule(rule)
        +validate_all(document)
    }

    class ILexicalStore {
        <<interface>>
        +index(chunks)
        +search(query, top_k) list~SearchHit~
        +clear()
    }
    class InMemoryLexicalStore

    class IVectorStore {
        <<interface>>
        +index(chunks)
        +search(query, top_k) list~SearchHit~
        +clear()
    }
    class InMemoryVectorStore

    class IKnowledgeObserver {
        <<interface>>
        +on_event(event) None
    }
    class KnowledgeEventBus {
        +subscribe(observer)
        +publish(event_type, payload) KnowledgeEvent
    }

    class StrategyFactory {
        +get_chunker(name) IChunkingStrategy
        +get_ranker(name) IHybridRankingStrategy
    }
    class RetrieverFactory {
        +retrieve(query, top_k, mode, ranking_strategy) list~SearchHit~
    }
    class BundleExporterRegistry {
        +register(exporter)
        +get(format_name) IBundleExporter
    }
    class AuditingOperationDecorator {
        +execute() TResult
    }

    ContextForgeBuilder ..> ContextForge : builds
    ContextForge --> AuditingOperationDecorator : wraps ops
    ContextForge --> StrategyFactory
    ContextForge --> RetrieverFactory
    ContextForge --> BundleExporterRegistry
    ContextForge --> DocumentRuleChain
    ContextForge --> KnowledgeEventBus
    ContextForge --> ILLMProvider
    RetrieverFactory --> ILexicalStore
    RetrieverFactory --> IVectorStore
    RetrieverFactory --> StrategyFactory
    StrategyFactory --> IChunkingStrategy
    StrategyFactory --> IHybridRankingStrategy
    BundleExporterRegistry --> IBundleExporter
    DocumentRuleChain --> IDocumentRule
    KnowledgeEventBus --> IKnowledgeObserver

    HeadingAwareChunkingStrategy ..|> IChunkingStrategy
    SlidingWindowChunkingStrategy ..|> IChunkingStrategy
    ReciprocalRankFusionStrategy ..|> IHybridRankingStrategy
    WeightedLinearRankingStrategy ..|> IHybridRankingStrategy
    MarkdownBundleExporter ..|> IBundleExporter
    JsonBundleExporter ..|> IBundleExporter
    XmlBundleExporter ..|> IBundleExporter
    ExtractiveFallbackLLMProvider ..|> ILLMProvider
    InMemoryLexicalStore ..|> ILexicalStore
    InMemoryVectorStore ..|> IVectorStore
```

### 3.2 Diagrama de Secuencia UML — Funcionalidad Principal `ask()` (RAG Híbrido con Citas)

```mermaid
sequenceDiagram
    actor Client as Aplicación / Agente IA
    participant CF as ContextForge (Facade)
    participant Dec as AuditingOperationDecorator
    participant Ret as RetrieverFactory
    participant Lex as ILexicalStore
    participant Vec as IVectorStore
    participant Rank as IHybridRankingStrategy
    participant Pipe as execute_rag_pipeline
    participant LLM as ILLMProvider
    participant Bus as KnowledgeEventBus

    Client->>CF: ask("¿Cuál es la política de reintentos?", top_k=3)
    CF->>Dec: execute("ask")
    Dec->>CF: _retrieve(question, top_k=3, mode="hybrid", ranking="rrf")
    CF->>Ret: retrieve(query, top_k=3, mode="hybrid", ranking_strategy="rrf")
    Ret->>Lex: search(query, top_k=10)
    Lex-->>Ret: lexical_hits
    Ret->>Vec: search(query, top_k=10)
    Vec-->>Ret: vector_hits
    Ret->>Rank: fuse(lexical_hits, vector_hits, top_k=3)
    Rank-->>Ret: ranked_hits
    Ret-->>CF: ranked_hits
    CF->>Pipe: execute_rag_pipeline(question, hits, llm_provider, ...)
    Pipe->>Pipe: construir SourceCitation[] y prompt fundamentado
    Pipe->>LLM: generate(prompt, system_prompt)
    LLM-->>Pipe: answer
    Pipe-->>CF: RagResponse
    CF->>Bus: publish("knowledge.rag_answered", payload)
    Dec->>Dec: registrar AuditRecord (operation="ask", latency_ms, succeeded=True)
    Dec-->>CF: RagResponse
    CF-->>Client: RagResponse(answer, citations, grounded=True)
```

---

## 4. Matriz de Principios SOLID, Patrones GRASP y Patrones GoF

### 4.1 Principios SOLID

| Principio | Evidencia en Código (Clase / Módulo) | Justificación Técnica |
| :--- | :--- | :--- |
| **S — Single Responsibility** | `stores.py` (almacenamiento), `strategies.py` (algoritmos de chunking/ranking), `exporters.py` (serialización), `rules.py` (reglas de validación), `decorators.py` (telemetría). | Cada módulo tiene una única razón de cambio; modificar el formato XML no toca ni el índice BM25 ni el motor RAG. |
| **O — Open/Closed** | `contracts.py` + `register_chunking_strategy`, `register_ranking_strategy`, `register_exporter`, `register_rule`, `subscribe` en `client.py`. | Un tercero agrega un exportador YAML o una política de ranking nueva sin editar el código fuente de `contextforge`. |
| **L — Liskov Substitution** | `HeadingAwareChunkingStrategy` / `SlidingWindowChunkingStrategy` (`IChunkingStrategy`); `ReciprocalRankFusionStrategy` / `WeightedLinearRankingStrategy` (`IHybridRankingStrategy`); `Markdown/Json/XmlBundleExporter` (`IBundleExporter`). | Cualquier implementación (incorporada o externa) respeta pre/postcondiciones y es intercambiable transparentemente en tiempo de ejecución. |
| **I — Interface Segregation** | Contratos pequeños y focalizados en `src/contextforge/contracts.py` (`ILexicalStore`, `IVectorStore`, `ILLMProvider`, `IBundleExporter`, `IDocumentRule`, `IKnowledgeObserver`). | Ningún implementador se ve obligado a implementar métodos que no usa (por ejemplo, un exportador solo implementa `format_name` y `export`). |
| **D — Dependency Inversion** | `ContextForge.__init__()` y `ContextForgeBuilder` dependen de abstracciones (`ILexicalStore`, `IVectorStore`, `ILLMProvider`, `IDocumentRule`), no de implementaciones concretas. | Permite inyectar ChromaDB/Ollama en producción y fakes/stubs en pruebas unitarias sin alterar el núcleo. |

### 4.2 Patrones GRASP

| Patrón GRASP | Evidencia en Código | Justificación |
| :--- | :--- | :--- |
| **Information Expert** | `KnowledgeDocument.word_count` (`models.py`), `InMemoryLexicalStore.search()` (`stores.py`), `DocumentRuleChain.validate_all()` (`rules.py`). | La responsabilidad vive en la clase que posee los datos necesarios para calcularla. |
| **Creator** | `StrategyFactory` y `BundleExporterRegistry` (`factories.py`, `exporters.py`), `ContextForgeBuilder` (`builder.py`). | Centralizan la creación y ensamblaje de colaboradores con sus parámetros consistentes. |
| **Controller / Facade** | `ContextForge` (`client.py`). | Coordina los casos de uso públicos (`ingest`, `search`, `ask`, `compile_bundle`) ocultando la complejidad interna. |
| **Polymorphism** | `IChunkingStrategy.chunk()`, `IHybridRankingStrategy.fuse()`, `IBundleExporter.export()`, `IDocumentRule.validate()`. | Elimina cadenas `if/elif` por tipo de formato, ranker o regla. |
| **Low Coupling & High Cohesion** | Paquete `src/contextforge/_internal/` dividido en 7 módulos enfocados conectados solo por DTOs e interfaces públicas. | Minimiza impacto de cambios y facilita la auditoría y reutilización. |
| **Protected Variations** | Contratos en `src/contextforge/contracts.py` y excepciones en `src/contextforge/exceptions.py`. | Protege a los consumidores frente a cambios en motores LLM, almacenes vectoriales o formatos de exportación. |

### 4.3 Patrones GoF (3 Categorías: Beneficios y Costos Técnicos)

| Categoría | Patrón GoF | Implementación Exacta | Beneficio Técnico | Costo de Implementación |
| :--- | :--- | :--- | :--- | :--- |
| **Creacional** | **Builder** | `ContextForgeBuilder` (`src/contextforge/builder.py`) | Ensamblado legible y seguro de configuraciones complejas, dobles de prueba y extensiones sin constructores telescópicos. | Una clase adicional de configuración y leve duplicación de parámetros respecto a `ContextForge.__init__`. |
| **Creacional** | **Factory / Registry** | `StrategyFactory`, `RetrieverFactory`, `BundleExporterRegistry` (`factories.py`, `exporters.py`) | Desacopla la selección dinámica de algoritmos/formatos por nombre y permite registrar extensiones en caliente. | Requiere gestionar claves de registro y validación explícita (`UnknownStrategyError`, `UnknownExportFormatError`). |
| **Estructural** | **Facade** | `ContextForge` (`src/contextforge/client.py`) | API pública pequeña (4 operaciones principales) fácil de aprender y reutilizar en cualquier proyecto. | Puede crecer si se agregan responsabilidades no esenciales; se mitiga delegando en fábricas y servicios internos. |
| **Estructural** | **Decorator** | `AuditingOperationDecorator` (`src/contextforge/_internal/decorators.py`) | Añade medición de latencia y trazabilidad de éxitos/fallos sin contaminar la lógica de negocio de cada operación. | Introduce una capa extra de indirección en la pila de llamadas durante la depuración. |
| **Comportamiento** | **Strategy** | `IChunkingStrategy`, `IHybridRankingStrategy`, `IBundleExporter` (`contracts.py`, `strategies.py`) | Permite intercambiar algoritmos de chunking, fusión híbrida y serialización sin condicionales rígidos. | Incrementa el número de clases pequeñas para algoritmos simples. |
| **Comportamiento** | **Chain of Responsibility** | `DocumentRuleChain` + `IDocumentRule` (`rules.py`) | Permite encadenar reglas de validación documental independientes y que terceros agreguen nuevas reglas con `register_rule()`. | El orden de registro importa y un fallo temprano detiene la evaluación de reglas posteriores. |
| **Comportamiento** | **Observer** | `KnowledgeEventBus` + `IKnowledgeObserver` (`events.py`) | Desacopla la emisión de eventos del ciclo de vida (`knowledge.ingested`, `knowledge.searched`, etc.) de logging, métricas o WebSockets. | Si un observador lanza una excepción no controlada o realiza I/O lento, afecta la latencia síncrona de la operación. |
