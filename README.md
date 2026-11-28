# ContextForge (`v1.0.0`)

**Componente de Software Reutilizable en Python para Base de Conocimiento Local, Búsqueda Híbrida (BM25 + Vectorial), RAG con Citas y Compilación de Context Bundles para Agentes IA.**

ContextForge permite dotar a **cualquier proyecto en Python** (chats con agentes de IA, asistentes técnicos, pipelines CI/CD, backends o CLIs) de una base de conocimiento sobre Markdown (*Docs-as-Code*) sin acoplarse a un framework web, base de datos ni proveedor LLM específico.

> Adicionalmente, el repositorio incluye de forma opcional la **Plataforma Web Self-Hosted** (`v2.0.0`, FastAPI + Agent Studio + Gateway OpenAI `/v1/*` + Servidor MCP + Docker). El detalle completo del ecosistema está en [Context.md](Context.md).

---

## 1. Propósito, Problemática y Escenarios de Reutilización

### Problemática que resuelve
Al integrar agentes de IA o chats técnicos en proyectos reales se repiten cinco problemas:
1. **Documentación dispersa** en archivos Markdown desconectados de los agentes.
2. **Búsqueda limitada**: solo palabras clave pierde sinonimia; solo vectores falla en códigos exactos o nombres de clase.
3. **Alucinaciones sin trazabilidad**: respuestas sin citas verificables del documento fuente.
4. **Desbordamiento de contexto**: enviar toda la documentación excede la ventana de tokens.
5. **Acoplamiento a proveedores**: depender de un único LLM o base vectorial dificulta pruebas sin red y migraciones.

### Escenarios de reutilización
El componente `contextforge` (`src/contextforge/`) tiene **0 dependencias externas obligatorias** y puede reutilizarse sin modificar su código en:
- **Chats con agentes IA**: consultas RAG con citas exactas (`ask()`).
- **Pipelines CI/CD y asistentes de código**: compilación de *Context Bundles* acotados en tokens (`compile_bundle()`).
- **Buscadores técnicos locales**: recuperación híbrida BM25 + vectorial sin enviar datos a terceros (`search()`).
- **Pruebas automatizadas de RAG**: inyección de fakes/stubs en `ILexicalStore`, `IVectorStore` e `ILLMProvider` sin red.

---

## 2. Requisitos e Instalación

- **Python**: `>= 3.11`
- **Dependencias del componente núcleo (`src/contextforge/`)**: Ninguna (100% biblioteca estándar de Python).
- **Extras opcionales**:
  - `.[dev]`: `pytest`, `pytest-cov`, `pytest-asyncio`, `mypy`
  - `.[web]`: FastAPI, Uvicorn, Jinja2, ChromaDB, SQLAlchemy, Ollama/Multi-LLM, MCP

```bash
# 1. Clonar repositorio
git clone https://github.com/Nayid4/ContextForge.git
cd ContextForge

# 2. Instalar solo el componente reutilizable (0 dependencias externas)
pip install -e .

# 3. Instalar con herramientas de pruebas y tipado estricto
pip install -e ".[dev]"
```

---

## 3. Ejemplo de Uso Rápido y App de Consola

Consumiendo **únicamente la API pública** (`from contextforge import ...`):

```python
from contextforge import ContextForge, KnowledgeDocument

engine = ContextForge()

# 1. Ingesta e indexación dual (BM25 + vectorial)
engine.ingest([
    KnowledgeDocument(
        doc_id="engineering/retries.md",
        title="Política de Reintentos",
        collection="engineering",
        tags=("webhooks", "resilience"),
        content="# Reintentos\nBackoff exponencial hasta 5 intentos antes de DLQ.",
    ),
])

# 2. Búsqueda híbrida (RRF / Weighted)
hits = engine.search("backoff exponencial DLQ", top_k=3, mode="hybrid", ranking="rrf")

# 3. Consulta RAG con citas verificables
rag = engine.ask("¿Cuántos reintentos aplica un webhook?")
print(rag.answer)
print([c.doc_id for c in rag.citations])

# 4. Compilación de Context Bundle con presupuesto de tokens
bundle = engine.compile_bundle("Agent Context", query="webhooks", max_tokens=2000, export_format="markdown")
print(bundle.content)
```

### Ejecutar la aplicación de ejemplo (consola)

```bash
python examples/agent_knowledge_cli.py
```

Demuestra las **4 funcionalidades esenciales** y **4 extensiones externas** (exportador YAML, ranker con boost por colección, regla de validación y proveedor LLM simulado) sin modificar el código del componente.

---

## 4. Requerimientos Funcionales y Guía de Extensión

### Diagrama de Casos de Uso de la API Pública

![Casos de Uso API Pública](docs/diagramas/componente/01_casos_de_uso_api.png)

> Editable en Draw.io: [docs/diagramas/componente/01_casos_de_uso_api.drawio](docs/diagramas/componente/01_casos_de_uso_api.drawio)

| ID | Operación API | Entradas principales | Salida | Errores posibles | Criterios de aceptación |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RF-01** | `ingest()` / `ingest_directory()` | `documents`, `chunking_strategy` | `IngestionReport` | `DocumentValidationError`, `UnknownStrategyError`, `FileNotFoundError` | Valida con `DocumentRuleChain`, segmenta con `IChunkingStrategy`, indexa en ambos stores y emite `knowledge.ingested`. |
| **RF-02** | `search()` | `query`, `top_k`, `mode`, `ranking`, `collection` | `list[SearchHit]` | `ValueError`, `UnknownStrategyError` | Soporta `lexical`, `vector`, `hybrid` (`rrf` / `weighted`), filtra por colección y ordena por `score` descendente. |
| **RF-03** | `ask()` | `question`, `top_k`, `mode`, `ranking`, `system_prompt` | `RagResponse` | `ValueError`, `EmptyKnowledgeBaseError`, `ProviderUnavailableError` | Recupera contexto, construye prompt con citas (`SourceCitation`) y funciona sin LLM externo vía `ExtractiveFallbackLLMProvider`. |
| **RF-04** | `compile_bundle()` | `name`, `query`/`document_ids`, `max_tokens`, `export_format` | `ContextBundle` | `ValueError`, `TokenBudgetExceededError`, `UnknownExportFormatError` | Respeta `estimated_tokens <= max_tokens`, reporta incluidos/omitidos y exporta en `markdown`, `json`, `xml` o formato custom. |
| **RF-05** | `register_*()` / `ContextForgeBuilder` | Subclases de `contextforge.contracts` | `ContextForge` | `TypeError` / `ValueError` | Permite agregar estrategias, reglas, exportadores, observadores, stores y LLMs sin editar `src/contextforge/`. |

### Cómo extender el componente (sin modificar su código)

1. Importa el contrato desde `contextforge` (`IBundleExporter`, `IHybridRankingStrategy`, `IChunkingStrategy`, `IDocumentRule`, `ILLMProvider`, `IKnowledgeObserver`, `ILexicalStore`, `IVectorStore`).
2. Implementa tu clase en tu proyecto.
3. Regístrala con `ContextForgeBuilder().with_*()` o `engine.register_*()`.

```python
from typing import Sequence
from contextforge import ContextForgeBuilder, IBundleExporter, KnowledgeDocument

class YamlBundleExporter(IBundleExporter):
    @property
    def format_name(self) -> str:
        return "yaml"

    def export(self, name: str, documents: Sequence[KnowledgeDocument], estimated_tokens: int, max_tokens: int) -> str:
        lines = [f"bundle: {name}", f"tokens: {estimated_tokens}/{max_tokens}", "docs:"]
        lines.extend(f"  - id: {d.doc_id}" for d in documents)
        return "\n".join(lines) + "\n"

engine = ContextForgeBuilder().with_exporter(YamlBundleExporter()).build()
```

> Guía detallada con entradas, salidas y los 4 ejemplos completos de extensión: [docs/01-documentacion-funcional.md](docs/01-documentacion-funcional.md).

---

## 5. Arquitectura y Diseño Técnico

### 5.1 Calidad del Componente (ISO/IEC 25010)

| Característica | Enfoque en ContextForge | Verificación |
| :--- | :--- | :--- |
| **Reusabilidad** | Paquete Python independiente (`dependencies = []`, Python `>= 3.11`). | `pip install -e .` + `examples/agent_knowledge_cli.py` |
| **Modularidad** | Frontera estricta `__all__` (`src/contextforge/`) separada de `src/contextforge/_internal/`. | Pruebas de frontera pública y módulos enfocados |
| **Capacidad de prueba** | Stores, LLM y observadores inyectables mediante contratos ABC (DIP). | `pytest` con fakes/stubs y **96% de cobertura** |
| **Facilidad de modificación** | 8 puntos de extensión abiertos (OCP) sin editar el núcleo. | Pruebas de extensión externa + `mypy --strict` |

### 5.2 Modelo C4 (Diagramas Draw.io)

#### Nivel 1 — Contexto
![C4 Nivel 1 Contexto](docs/diagramas/componente/02_c4_contexto_n1.png)
*Justificación: Aísla las aplicaciones consumidoras de la indexación, el ranking híbrido y el proveedor LLM.* ([.drawio](docs/diagramas/componente/02_c4_contexto_n1.drawio))

#### Nivel 2 — Contenedores
![C4 Nivel 2 Contenedores](docs/diagramas/componente/03_c4_contenedores_n2.png)
*Justificación: Encapsula la implementación concreta en `_internal/` para evolucionar algoritmos sin romper contratos `v1.x`.* ([.drawio](docs/diagramas/componente/03_c4_contenedores_n2.drawio))

#### Nivel 3 — Componentes Internos
![C4 Nivel 3 Componentes](docs/diagramas/componente/04_c4_componentes_n3.png)
*Justificación: Descompone responsabilidades en fábricas, cadena de reglas, decorador de auditoría y bus de eventos desacoplados por interfaces.* ([.drawio](docs/diagramas/componente/04_c4_componentes_n3.drawio))

### 5.3 Diagrama de Clases UML con Patrones GoF

![Diagrama de Clases UML con Patrones GoF](docs/diagramas/componente/05_uml_clases_gof.png)

> Editable en Draw.io: [docs/diagramas/componente/05_uml_clases_gof.drawio](docs/diagramas/componente/05_uml_clases_gof.drawio)

#### Patrones GoF Aplicados (3 Categorías: Beneficios y Costos)

| Categoría | Patrón GoF | Evidencia en Código | Beneficio Técnico | Costo de Implementación |
| :--- | :--- | :--- | :--- | :--- |
| **Creacional** | **Builder** | `ContextForgeBuilder` (`builder.py`) | Ensamblaje fluido y legible de configuración, stores y extensiones sin constructores telescópicos. | Una clase adicional y validación duplicada frente a `ContextForge.__init__`. |
| **Creacional** | **Factory / Registry** | `StrategyFactory`, `RetrieverFactory`, `BundleExporterRegistry` (`_internal/`) | Selección dinámica de estrategias/formatos por nombre y registro abierto en caliente. | Gestión de claves y errores explícitos (`UnknownStrategyError`, `UnknownExportFormatError`). |
| **Estructural** | **Facade** | `ContextForge` (`client.py`) | Superficie pública pequeña (4 operaciones) fácil de aprender y reutilizar. | Riesgo de crecer si no delega en fábricas y pipelines internos. |
| **Estructural** | **Decorator** | `AuditingOperationDecorator` (`_internal/decorators.py`) | Registra `latency_ms`, éxitos y errores sin contaminar la lógica de negocio. | Capa adicional en la pila de llamadas al depurar. |
| **Comportamiento** | **Strategy** | `IChunkingStrategy`, `IHybridRankingStrategy`, `IBundleExporter` (`contracts.py`) | Intercambia algoritmos de chunking, fusión y exportación sin `if/elif` rígidos. | Mayor número de clases pequeñas para políticas simples. |
| **Comportamiento** | **Chain of Responsibility** | `DocumentRuleChain` + `IDocumentRule` (`_internal/rules.py`) | Encadena validaciones independientes extensibles vía `register_rule()`. | El orden de registro importa y un fallo temprano detiene la cadena. |
| **Comportamiento** | **Observer** | `KnowledgeEventBus` + `IKnowledgeObserver` (`_internal/events.py`) | Desacopla eventos del ciclo de vida (`knowledge.*`) de métricas, logs o notificaciones. | Observadores lentos o con fallos impactan la ejecución síncrona si no se aíslan. |

### 5.4 Diagrama de Secuencia UML — Operación Principal `ask()`

![Diagrama de Secuencia UML ask()](docs/diagramas/componente/06_uml_secuencia_ask.png)

> Editable en Draw.io: [docs/diagramas/componente/06_uml_secuencia_ask.drawio](docs/diagramas/componente/06_uml_secuencia_ask.drawio)

### 5.5 Principios SOLID, GRASP y ADRs (Resumen)

- **SOLID**: **S** (módulos dedicados en `_internal/`: `stores`, `strategies`, `exporters`, `rules`, `decorators`) · **O** (8 contratos en `contracts.py` + `register_*()`) · **L** (estrategias y exportadores intercambiables) · **I** (interfaces mínimas de 1–3 métodos) · **D** (`ContextForge` y `ContextForgeBuilder` dependen solo de abstracciones).
- **GRASP**: *Information Expert* (`KnowledgeDocument.word_count`, `InMemoryLexicalStore`), *Creator* (`StrategyFactory`, `ContextForgeBuilder`), *Controller* (`ContextForge`), *Polymorphism* (contratos ABC), *Low Coupling / High Cohesion* (`_internal/`), *Protected Variations* (`contracts.py`, `exceptions.py`).
- **ADRs**: `ADR-001` Frontera pública `__all__` vs `_internal/` · `ADR-002` Cero dependencias externas en el núcleo · `ADR-003` Búsqueda híbrida pluggable (RRF/Weighted) · `ADR-004` Reglas con Chain of Responsibility · `ADR-005` Unificación del paquete `contextforge v1.0.0`.

> Matrices completas y ADRs detallados: [docs/02-arquitectura-y-diseno.md](docs/02-arquitectura-y-diseno.md) y [docs/03-adrs-y-pruebas.md](docs/03-adrs-y-pruebas.md).

---

## 6. Compilación, Pruebas y Calidad

```bash
# Pruebas unitarias del componente con cobertura (actual: 96% >= 70% requerido)
pytest tests/unit/test_contextforge_component.py --cov=contextforge --cov-report=term-missing

# Verificación de tipado estricto (0 errores)
python -m mypy --strict src/contextforge

# Empaquetar distribución wheel / sdist en dist/
pip install build
python -m build
```

---

## 7. Ejecutar la Plataforma Web Opcional (Local y Docker)

Además del componente reutilizable, el repositorio incluye la aplicación web completa (SPA + API REST `/api/v1` + Gateway OpenAI `/v1/*` + servidor MCP `/mcp`).

### 7.1 En Local (sin Docker)

```powershell
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --app-dir src --host 127.0.0.1 --port 8000 --reload
```

```bash
# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --app-dir src --host 127.0.0.1 --port 8000 --reload
```

- **App Web**: http://127.0.0.1:8000
- **OpenAPI (Swagger)**: http://127.0.0.1:8000/api/docs
- **Health check**: http://127.0.0.1:8000/health/ready
- **Servidor MCP**: `http://127.0.0.1:8000/mcp` (SSE) o `python run_mcp.py` (STDIO)

> Sin Ollama ni claves de API, configura `AI_PROVIDER=extractive_fallback` en `.env`. Con Ollama local: `ollama pull llama3.1:8b` y `ollama pull nomic-embed-text`.

### 7.2 Con Docker (`docker compose`)

Requisitos: Docker + Docker Compose v2.

```bash
cp .env.example .env        # En PowerShell: Copy-Item .env.example .env
docker compose up -d --build
```

- Queda disponible en http://127.0.0.1:8000 (los datos persisten en el volumen `cf_data` y `./docs` se monta en `/app/docs`).
- Por defecto usa `AUTH_MODE=enterprise_rbac`; para pruebas locales sin login define `AUTH_MODE=local` en `.env`.
- **Perfiles opcionales**:
  - PostgreSQL: `docker compose --profile postgres up -d --build` (con `DB_PROVIDER=postgresql` y `DATABASE_URL=postgresql+asyncpg://cfadmin:cfsecret@postgres:5432/contextforge`).
  - Ollama en Docker: `OLLAMA_BASE_URL=http://ollama:11434 docker compose --profile ollama up -d --build`.
- **Gestión**: `docker compose logs -f contextforge` · `docker compose ps` · `docker compose down` (`-v` para borrar volúmenes).

---

## 8. Estructura del Repositorio y Documentación

```text
├── pyproject.toml                         # Empaquetado distribuible (contextforge v1.0.0)
├── README.md                              # Guía principal del componente y ejecución
├── CHANGELOG.md                           # Historial de versiones (v1.0.0)
├── Context.md                             # Contexto integral AS-IS del ecosistema
├── Dockerfile / docker-compose.yml        # Despliegue self-hosted opcional
├── src/
│   ├── contextforge/                      # COMPONENTE REUTILIZABLE (API Pública __all__)
│   │   ├── __init__.py, client.py, builder.py, contracts.py, models.py, exceptions.py
│   │   └── _internal/                     # Implementación privada encapsulada
│   ├── domain/ · application/ · infrastructure/ · presentation/  # Plataforma web opcional
├── examples/agent_knowledge_cli.py        # App de consola usando solo la API pública
├── tests/unit/test_contextforge_component.py  # Pruebas unitarias + dobles (96% cobertura)
└── docs/
    ├── 01-documentacion-funcional.md      # Problemática, RF, guía de uso y extensión
    ├── 02-arquitectura-y-diseno.md        # ISO 25010, C4, UML, matriz SOLID/GRASP/GoF
    ├── 03-adrs-y-pruebas.md               # ADRs y guía de compilación/pruebas
    ├── 04-guia-sustentacion.md            # Guion de sustentación (10 min)
    └── diagramas/componente/              # 6 diagramas nativos Draw.io (.drawio + .png)
```

- **Documentación Funcional**: [docs/01-documentacion-funcional.md](docs/01-documentacion-funcional.md)
- **Arquitectura, C4, UML y SOLID/GRASP/GoF**: [docs/02-arquitectura-y-diseno.md](docs/02-arquitectura-y-diseno.md)
- **ADRs, Compilación y Pruebas**: [docs/03-adrs-y-pruebas.md](docs/03-adrs-y-pruebas.md)
- **Guía de Sustentación (10 min)**: [docs/04-guia-sustentacion.md](docs/04-guia-sustentacion.md)
- **Contexto Integral del Sistema**: [Context.md](Context.md)
- **Historial de Versiones**: [CHANGELOG.md](CHANGELOG.md) · **Licencia**: [LICENSE](LICENSE)
