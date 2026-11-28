# ContextForge (`v1.0.0`)

**Componente de Software Reutilizable de Base de Conocimiento Local, Búsqueda Híbrida (BM25 + Vectorial), RAG con Citas y Compilación de Context Bundles para Agentes IA.**

ContextForge permite dotar a **cualquier proyecto en Python** (chats con agentes de IA, asistentes técnicos, pipelines de ingeniería, backends o CLIs) de una base de conocimiento viva basada en Markdown (*Docs-as-Code*) sin acoplarse a un framework web, base de datos ni proveedor LLM específico.

---

## Propósito del Componente

Integrar agentes de IA y chats conversacionales en proyectos reales suele repetir siempre los mismos problemas: fragmentación de documentación, alucinaciones por falta de contexto verificable, límites de ventana de tokens y acoplamiento rígido a un proveedor LLM o base vectorial concreta.

**ContextForge** encapsula esas capacidades en un paquete Python **autocontenido y sin dependencias externas obligatorias en su núcleo** (`src/contextforge/`), exponiendo una **API pública mínima, fuertemente tipada y extensible** que separa por completo los contratos públicos de la implementación interna (`src/contextforge/_internal/`).

*(Adicionalmente, el repositorio incluye de forma opcional la aplicación web completa de referencia en FastAPI + Screaming Web Architecture bajo `src/presentation/web/` y servidor MCP en `/mcp`.)*

---

## Requisitos

- **Python**: `>= 3.11`
- **Dependencias obligatorias del componente**: Ninguna (100% biblioteca estándar de Python).
- **Extras opcionales**:
  - `.[dev]`: `pytest`, `pytest-cov`, `pytest-asyncio`, `mypy`
  - `.[web]`: FastAPI, Uvicorn, Jinja2, ChromaDB, SQLite WAL, Ollama/Multi-LLM, MCP

---

## Instalación

```bash
# 1. Instalar el componente reutilizable (modo editable para desarrollo/evaluación)
pip install -e .

# 2. Instalar con herramientas de pruebas y tipado estricto
pip install -e ".[dev]"

# 3. (Opcional) Instalar también el servidor Web SPA + REST + MCP
pip install -e ".[web]"
```

---

## Ejemplo de Uso Rápido (Solo API Pública)

```python
from contextforge import ContextForge, KnowledgeDocument

engine = ContextForge()

# 1. Ingesta e indexación dual (léxica BM25 + vectorial)
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

# 3. Consulta RAG con citas exactas para agentes IA
rag = engine.ask("¿Cuántos reintentos aplica un webhook?")
print(rag.answer)
print([c.doc_id for c in rag.citations])

# 4. Compilación de Context Bundle con presupuesto de tokens
bundle = engine.compile_bundle("Agent Context", query="webhooks", max_tokens=2000, export_format="markdown")
print(bundle.content)
```

---

## Ejecutar la Aplicación de Ejemplo (Consola)

```bash
python examples/agent_knowledge_cli.py
```

El ejemplo demuestra las **4 funcionalidades esenciales** y **4 extensiones de terceros** (exportador YAML, estrategia de ranking con boost por colección, regla de validación y proveedor LLM simulado) consumiendo exclusivamente `from contextforge import ...` sin modificar el componente.

---

## Estructura del Repositorio

```text
├── pyproject.toml                       # Empaquetado distribuible (contextforge v1.0.0)
├── README.md                            # Guía de entrada rápida del componente
├── CHANGELOG.md                         # Historial de versiones (v1.0.0)
├── src/
│   ├── contextforge/                    # COMPONENTE REUTILIZABLE (API Pública)
│   │   ├── __init__.py                  # Frontera pública estricta (__all__)
│   │   ├── client.py                    # Facade pública: ContextForge
│   │   ├── builder.py                   # Builder fluido: ContextForgeBuilder
│   │   ├── contracts.py                 # Puntos de extensión (ABC / DIP / OCP)
│   │   ├── models.py                    # DTOs inmutables públicos
│   │   ├── exceptions.py                # Jerarquía tipada de excepciones
│   │   └── _internal/                   # Implementación privada (no exportada)
│   ├── domain/                          # Capa de dominio de la app completa
│   ├── application/                     # Casos de uso CQRS granulares
│   ├── infrastructure/                  # Adaptadores SQLite, ChromaDB, Multi-LLM, WS
│   └── presentation/                    # API REST, MCP y Screaming Web (src/presentation/web/)
├── examples/
│   └── agent_knowledge_cli.py           # App de consola usando solo la API pública
├── tests/
│   └── unit/test_contextforge_component.py  # Pruebas unitarias + dobles (>=70% cobertura)
└── docs/
    ├── 01-documentacion-funcional.md    # Problemática, RF, guía de uso y extensión
    ├── 02-arquitectura-y-diseno.md      # ISO 25010, C4, UML, matriz SOLID/GRASP/GoF
    └── 03-adrs-y-pruebas.md             # ADRs y guía de compilación/pruebas
```

---

## Documentación Completa

- **Contexto Integral del Sistema (Informe Completo, RF/RNF, ER, Clases, Reglas e IA)**: [Context.md](Context.md)
- **Documentación Funcional**: [docs/01-documentacion-funcional.md](docs/01-documentacion-funcional.md)
- **Arquitectura, C4, UML y Matriz SOLID / GRASP / GoF**: [docs/02-arquitectura-y-diseno.md](docs/02-arquitectura-y-diseno.md)
- **Registro de Decisiones (ADRs), Compilación y Pruebas**: [docs/03-adrs-y-pruebas.md](docs/03-adrs-y-pruebas.md)
- **Guía de Sustentación (10 min)**: [docs/04-guia-sustentacion.md](docs/04-guia-sustentacion.md)
- **Historial de Versiones**: [CHANGELOG.md](CHANGELOG.md)
- **Licencia**: [LICENSE](LICENSE)
