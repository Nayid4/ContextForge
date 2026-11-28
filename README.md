# ContextForge (`v1.0.0`)

**Componente de Software Reutilizable en Python para Base de Conocimiento Local, Búsqueda Híbrida (BM25 + Vectorial), RAG con Citas y Compilación de Context Bundles para Agentes IA.**

ContextForge centraliza el conocimiento técnico de los proyectos (*Docs-as-Code* en Markdown) y lo expone con IA verificable para que **cualquier integrante del equipo** o **servicio externo** pueda consultar información e integrar agentes sin depender de otras personas ni acoplarse a un framework o proveedor LLM concreto.

> Adicionalmente, el repositorio incluye de forma opcional la **Plataforma Web Self-Hosted** (`v2.0.0`, FastAPI + API REST `/api/v1` + Gateway OpenAI `/v1/chat/completions` + Servidor MCP `/mcp` + Widget embebible + Docker). El detalle integral del ecosistema está en [Context.md](Context.md).

---

## 1. Propósito, Problemática y Objetivos

### Problemática que resuelve
1. **Dependencia del conocimiento entre integrantes del equipo (*silos / bus factor*)**: las reglas de negocio, decisiones de arquitectura y acuerdos técnicos suelen vivir en la memoria de unos pocos desarrolladores, generando cuellos de botella, interrupciones constantes y *onboarding* lento.
2. **Búsqueda lenta e ineficiente de información de los proyectos**: revisar manualmente repositorios, wikis y archivos dispersos retrasa el desarrollo; además, la búsqueda solo léxica pierde sinonimia y la búsqueda solo vectorial falla en nombres exactos de endpoints o códigos de error.
3. **Alucinaciones y falta de contexto acotado en IA**: consultar modelos sin contexto verificado produce respuestas inventadas sin citas y desborda la ventana de tokens.
4. **Dificultad para que servicios externos consuman el conocimiento e integren agentes**: cada aplicación externa (chats, bots, portales, microservicios o IDEs) termina reimplementando la indexación, el RAG y la conexión a LLMs.

### Objetivos

**Objetivo General**  
Proveer un componente Python reutilizable (`contextforge`) y una capa API opcional que centralicen la documentación de los proyectos y la hagan consultable con IA de forma rápida y verificable, reduciendo la dependencia de conocimiento entre integrantes del equipo y permitiendo que servicios externos consuman las bases de conocimiento o integren agentes sin modificar el código del componente.

**Objetivos Específicos**
1. **Reducir la dependencia entre integrantes**: convertir la documentación Markdown del proyecto en una base de conocimiento viva y consultable en lenguaje natural con citas exactas (`ask()`).
2. **Agilizar la búsqueda y consulta de información con IA**: combinar recuperación léxica (BM25) y semántica (vectorial) con fusión configurable (`search()`) y compilación de *Context Bundles* ajustados a un presupuesto de tokens (`compile_bundle()`).
3. **Habilitar consumo por servicios externos y agentes**: ofrecer una frontera pública Python (`from contextforge import ...`, `0` dependencias obligatorias) y una API opcional (REST `/api/v1`, Gateway OpenAI `/v1/*`, MCP `/mcp` y Widget) para que sistemas externos integren agentes o consulten bases de conocimiento.
4. **Garantizar extensibilidad y calidad verificable**: separar la API pública de la implementación interna (`_internal/`), exponer contratos abiertos (OCP/DIP) y respaldar el componente con tipado estricto (`mypy --strict`) y pruebas unitarias (`>= 70%` de cobertura).

### Escenarios de reutilización
- **Equipos de desarrollo**: resolver dudas de arquitectura, reglas y *onboarding* con IA en segundos sin interrumpir a otros compañeros.
- **Servicios externos y bots**: consumir la API (REST / OpenAI `/v1` / MCP) o importar el paquete `contextforge` para incrustar agentes con conocimiento del proyecto.
- **Pipelines CI/CD y asistentes de código**: compilar *Context Bundles* acotados en tokens (`compile_bundle()`).
- **Pruebas automatizadas de RAG**: reemplazar almacenes y proveedor LLM por dobles de prueba sin acceso a red.

---

## 2. Requisitos e Instalación

- **Python**: `>= 3.11`
- **Dependencias obligatorias del componente (`src/contextforge/`)**: Ninguna (100% biblioteca estándar de Python).
- **Extras opcionales**:
  - `.[dev]`: `pytest`, `pytest-cov`, `pytest-asyncio`, `mypy`
  - `.[web]`: FastAPI, Uvicorn, Jinja2, ChromaDB, SQLAlchemy, Multi-LLM, MCP

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
| **RF-01** | `ingest()` / `ingest_directory()` | `documents`, `chunking_strategy` | `IngestionReport` | `DocumentValidationError`, `UnknownStrategyError`, `FileNotFoundError` | Valida reglas documentales, segmenta con `IChunkingStrategy`, indexa en ambos almacenes y emite `knowledge.ingested`. |
| **RF-02** | `search()` | `query`, `top_k`, `mode`, `ranking`, `collection` | `list[SearchHit]` | `ValueError`, `UnknownStrategyError` | Soporta `lexical`, `vector`, `hybrid` (`rrf` / `weighted`), filtra por colección y ordena por `score` descendente. |
| **RF-03** | `ask()` | `question`, `top_k`, `mode`, `ranking`, `system_prompt` | `RagResponse` | `ValueError`, `EmptyKnowledgeBaseError`, `ProviderUnavailableError` | Recupera contexto relevante, retorna citas exactas (`SourceCitation`) y opera sin LLM externo vía `ExtractiveFallbackLLMProvider`. |
| **RF-04** | `compile_bundle()` | `name`, `query`/`document_ids`, `max_tokens`, `export_format` | `ContextBundle` | `ValueError`, `TokenBudgetExceededError`, `UnknownExportFormatError` | Respeta `estimated_tokens <= max_tokens`, reporta incluidos/omitidos y exporta en `markdown`, `json`, `xml` o formato custom. |
| **RF-05** | `register_*()` / `ContextForgeBuilder` | Subclases de `contextforge.contracts` | `ContextForge` | `TypeError` / `ValueError` | Permite registrar estrategias, reglas, exportadores, observadores, almacenes y LLMs sin editar `src/contextforge/`. |

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
| **Facilidad de modificación** | Puntos de extensión abiertos (OCP) sin editar el núcleo. | Pruebas de extensión externa + `mypy --strict` |

### 5.2 Modelo C4 (Notación Oficial en Draw.io)

#### Nivel 1 — Diagrama de Contexto
![C4 Nivel 1 Contexto](docs/diagramas/componente/02_c4_contexto_n1.png)
*Justificación: Muestra cómo los integrantes del equipo y los servicios externos interactúan con ContextForge para consultar proyectos con IA e integrar agentes, aislando la lógica del repositorio Markdown y del proveedor LLM.* ([.drawio](docs/diagramas/componente/02_c4_contexto_n1.drawio))

#### Nivel 2 — Diagrama de Contenedores
![C4 Nivel 2 Contenedores](docs/diagramas/componente/03_c4_contenedores_n2.png)
*Justificación: Separa el paquete reutilizable (`API Pública` / `_internal/`), la capa opcional API/Web (para consumo externo vía REST, OpenAI `/v1` y MCP) y los almacenes de índices/documentos.* ([.drawio](docs/diagramas/componente/03_c4_contenedores_n2.drawio))

#### Nivel 3 — Diagrama de Componentes Internos
![C4 Nivel 3 Componentes](docs/diagramas/componente/04_c4_componentes_n3.png)
*Justificación: Descompone el paquete en componentes cohesivos conectados por interfaces para facilitar mantenimiento, pruebas unitarias y extensión.* ([.drawio](docs/diagramas/componente/04_c4_componentes_n3.drawio))

### 5.3 Diagrama de Clases UML y Patrones GoF

![Diagrama de Clases UML con Patrones GoF](docs/diagramas/componente/05_uml_clases_gof.png)

> Editable en Draw.io: [docs/diagramas/componente/05_uml_clases_gof.drawio](docs/diagramas/componente/05_uml_clases_gof.drawio)

#### Patrones GoF Principales (1 por categoría — Costo y Beneficio)

Para evitar sobreingeniería, el diseño del componente se apoya en **3 patrones GoF principales** (uno por categoría) que resuelven problemas concretos del dominio:

| Categoría | Patrón GoF | Evidencia en Código | Beneficio Técnico | Costo de Implementación |
| :--- | :--- | :--- | :--- | :--- |
| **Creacional** | **Builder** | `ContextForgeBuilder` (`src/contextforge/builder.py`) | Permite ensamblar configuración, almacenes, LLM y extensiones de forma legible sin constructores telescópicos. | Agrega una clase constructora y mantiene sincronía con los parámetros de `ContextForge`. |
| **Estructural** | **Facade** | `ContextForge` (`src/contextforge/client.py`) | Oculta la complejidad interna tras 4 operaciones públicas simples (`ingest`, `search`, `ask`, `compile_bundle`), facilitando la adopción por otros equipos. | Puede acumular responsabilidades si no delega correctamente en los módulos de `_internal/`. |
| **Comportamiento** | **Strategy** | `IChunkingStrategy`, `IHybridRankingStrategy`, `IBundleExporter` (`contracts.py`) | Permite intercambiar o extender algoritmos de fragmentación, fusión híbrida y exportación sin `if/elif` rígidos ni modificar el núcleo (OCP). | Incrementa la cantidad de clases pequeñas cuando un algoritmo es sencillo. |

**Patrones complementarios de soporte:** de forma puntual dentro de `_internal/` también se emplean **Factory / Registry** (`StrategyFactory`, `RetrieverFactory`, `BundleExporterRegistry`) para resolver implementaciones por nombre (costo: mantener registro y errores explícitos), **Chain of Responsibility** (`DocumentRuleChain` + `IDocumentRule`) para encadenar validaciones documentales extensibles (costo: el orden de registro importa), **Decorator** (`AuditingOperationDecorator`) para medir latencia sin mezclar telemetría con negocio (costo: una capa extra en depuración) y **Observer** (`KnowledgeEventBus` + `IKnowledgeObserver`) para desacoplar eventos del ciclo de vida (costo: observadores lentos afectan la llamada síncrona).

### 5.4 Diagrama de Secuencia UML — Operación Principal `ask()`

![Diagrama de Secuencia UML ask()](docs/diagramas/componente/06_uml_secuencia_ask.png)

> Editable en Draw.io: [docs/diagramas/componente/06_uml_secuencia_ask.drawio](docs/diagramas/componente/06_uml_secuencia_ask.drawio)

### 5.5 Principios SOLID, GRASP y ADRs (Resumen)

- **SOLID**: **S** (módulos dedicados en `_internal/`: `stores`, `strategies`, `exporters`, `rules`, `decorators`) · **O** (contratos en `contracts.py` + `register_*()`) · **L** (estrategias y exportadores intercambiables) · **I** (interfaces mínimas de 1–3 métodos) · **D** (`ContextForge` y `ContextForgeBuilder` dependen solo de abstracciones).
- **GRASP**: *Information Expert* (`KnowledgeDocument.word_count`, `InMemoryLexicalStore`), *Creator* (`StrategyFactory`, `ContextForgeBuilder`), *Controller* (`ContextForge`), *Polymorphism* (contratos ABC), *Low Coupling / High Cohesion* (`_internal/`), *Protected Variations* (`contracts.py`, `exceptions.py`).
- **ADRs**: `ADR-001` Frontera pública `__all__` vs `_internal/` · `ADR-002` Cero dependencias externas en el núcleo · `ADR-003` Búsqueda híbrida pluggable (RRF/Weighted) · `ADR-004` Reglas extensibles (`IDocumentRule`) · `ADR-005` Unificación del paquete `contextforge v1.0.0`.

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

## 7. Ejecutar la Plataforma Web y API Opcional (Local y Docker)

Además del componente Python reutilizable, el repositorio incluye la plataforma web y los endpoints para que servicios externos consuman bases de conocimiento e integren agentes (`REST /api/v1`, `OpenAI /v1/chat/completions`, `MCP /mcp` y Widget embebible).

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

- Disponible en http://127.0.0.1:8000 (datos persistidos en el volumen `cf_data` y `./docs` montado en `/app/docs`).
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
│   ├── domain/ · application/ · infrastructure/ · presentation/  # Plataforma web/API opcional
├── examples/agent_knowledge_cli.py        # App de consola usando solo la API pública
├── tests/unit/test_contextforge_component.py  # Pruebas unitarias + dobles (96% cobertura)
└── docs/
    ├── 01-documentacion-funcional.md      # Problemática, objetivos, RF, guía de uso y extensión
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
