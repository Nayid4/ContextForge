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

## Ejecutar la Plataforma Web en Local (sin Docker)

Levanta la aplicación completa (SPA web + API REST `/api/v1` + servidor MCP `/mcp`) con SQLite WAL y ChromaDB embebidos. Al arrancar aplica migraciones y, si `AUTO_SEED_DATA=true`, carga datos iniciales.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Nayid4/ContextForge.git
cd ContextForge
```

### 2. Crear el entorno virtual e instalar dependencias

**Windows (PowerShell):**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

**Linux / macOS:**

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

> `requirements.txt` instala el componente en modo editable (`-e .`) más todo el runtime web (FastAPI, ChromaDB, SQLAlchemy, JWT, etc.) y las herramientas de pruebas.

### 3. Configurar variables de entorno

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Valores relevantes en `.env`:

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `AUTH_MODE` | `local` | `local` para desarrollo; `enterprise_rbac` exige JWT / `X-API-Key` |
| `DATABASE_URL` | `sqlite+aiosqlite:///./data/database/contextforge.db` | Base de datos (SQLite por defecto) |
| `DOCS_ROOT_PATH` | `./docs` | Carpeta Markdown indexada como base de conocimiento |
| `AI_PROVIDER` | `ollama` | `ollama`, `openai`, `gemini`, `anthropic`, `extractive_fallback`, etc. |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | URL de Ollama si usas modelos locales |
| `JWT_SECRET_KEY` / `MASTER_VAULT_KEY` | valores de ejemplo | **Cámbialos** fuera de desarrollo |

> Si no tienes Ollama ni claves de API, usa `AI_PROVIDER=extractive_fallback` para que el RAG responda de forma extractiva sin LLM. Para usar Ollama: `ollama pull llama3.1:8b` y `ollama pull nomic-embed-text`.

### 4. Iniciar el servidor

```bash
uvicorn main:app --app-dir src --host 127.0.0.1 --port 8000 --reload
```

| Recurso | URL |
|---------|-----|
| Aplicación web | http://127.0.0.1:8000 |
| Documentación OpenAPI (Swagger) | http://127.0.0.1:8000/docs |
| Health check | http://127.0.0.1:8000/health/ready |
| Servidor MCP (SSE) | http://127.0.0.1:8000/mcp |

### 5. (Opcional) Servidor MCP por STDIO para Claude Code / Cursor / Antigravity

```bash
python run_mcp.py
```

### 6. Ejecutar las pruebas

```bash
pytest
pytest tests/unit/test_contextforge_component.py --cov=contextforge --cov-report=term-missing
```

---

## Ejecutar con Docker

Requisitos: [Docker](https://docs.docker.com/get-docker/) con Docker Compose v2 (`docker compose`).

### 1. Preparar la configuración

```bash
cp .env.example .env        # En PowerShell: Copy-Item .env.example .env
```

El `docker-compose.yml` ya fija las rutas internas (`/app/docs`, `/app/data`). Por defecto el servicio arranca con `AUTH_MODE=enterprise_rbac`; para pruebas locales sin autenticación define `AUTH_MODE=local` en `.env`.

### 2. Construir y levantar (SQLite WAL, modo standalone)

```bash
docker compose up -d --build
```

La aplicación queda disponible en http://127.0.0.1:8000 (el puerto se cambia con `CONTEXTFORGE_PORT` y la interfaz con `CONTEXTFORGE_BIND_HOST`). Los datos persisten en el volumen `cf_data` y la carpeta `./docs` se monta como base de conocimiento.

> Por defecto el contenedor busca Ollama en tu máquina (`http://host.docker.internal:11434`).

### 3. Perfiles opcionales

**Con PostgreSQL:**

```bash
# Linux / macOS
DB_PROVIDER=postgresql \
DATABASE_URL=postgresql+asyncpg://cfadmin:cfsecret@postgres:5432/contextforge \
docker compose --profile postgres up -d --build
```

```powershell
# Windows (PowerShell)
$env:DB_PROVIDER="postgresql"
$env:DATABASE_URL="postgresql+asyncpg://cfadmin:cfsecret@postgres:5432/contextforge"
docker compose --profile postgres up -d --build
```

**Con Ollama dentro de Docker (100% air-gapped):**

```bash
# Linux / macOS
OLLAMA_BASE_URL=http://ollama:11434 docker compose --profile ollama up -d --build
docker exec -it contextforge-ollama ollama pull llama3.1:8b
docker exec -it contextforge-ollama ollama pull nomic-embed-text
```

```powershell
# Windows (PowerShell)
$env:OLLAMA_BASE_URL="http://ollama:11434"
docker compose --profile ollama up -d --build
docker exec -it contextforge-ollama ollama pull llama3.1:8b
docker exec -it contextforge-ollama ollama pull nomic-embed-text
```

### 4. Comandos útiles

```bash
docker compose ps                         # Estado y healthcheck
docker compose logs -f contextforge       # Logs de la aplicación
docker compose restart contextforge       # Reiniciar tras cambiar .env
docker compose down                       # Detener (conserva datos)
docker compose down -v                    # Detener y BORRAR volúmenes de datos
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
