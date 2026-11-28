# Registro de Decisiones de Diseño (ADRs) y Guía de Compilación y Pruebas

## 1. Registro de Decisiones de Diseño (ADRs)

### ADR-001: Separación Estricta entre API Pública (`contextforge`) e Implementación Privada (`_internal`)
- **Contexto**: Los consumidores y equipos pares (Parte II) deben reutilizar y extender el componente sin depender de detalles internos susceptibles de cambiar.
- **Decisión**: Exponer únicamente `ContextForge`, `ContextForgeBuilder`, DTOs inmutables (`models.py`), contratos (`contracts.py`) y excepciones (`exceptions.py`) mediante `__all__` en `src/contextforge/__init__.py`. Toda implementación concreta reside en `src/contextforge/_internal/`.
- **Alternativas consideradas**: Exponer todos los módulos del proyecto FastAPI directamente; descartado por alto acoplamiento y fuga de dependencias web/ORM.
- **Consecuencias**: Contratos estables y superficie de aprendizaje pequeña; obliga a mantener sincronizado `__all__` cuando se incorporan nuevos contratos públicos.

### ADR-002: Núcleo Reutilizable con Cero Dependencias Externas Obligatorias
- **Contexto**: El componente debe poder instalarse y probarse en cualquier proyecto Python sin exigir Docker, bases de datos ni servidores LLM.
- **Decisión**: Implementar `InMemoryLexicalStore` (BM25 puro en Python), `InMemoryVectorStore` (similitud coseno por n-gramas), `parse_markdown_file` y `ExtractiveFallbackLLMProvider` usando únicamente la biblioteca estándar de Python (`dependencies = []` en `pyproject.toml`), manteniendo FastAPI/ChromaDB/SQLite como extras opcionales (`[web]`).
- **Alternativas consideradas**: Requerir `chromadb` y `rank-bm25` en el núcleo; descartado por peso de instalación (~500 MB) y fricción en entornos académicos/CI.
- **Consecuencias**: Instalación instantánea (`pip install -e .`) y ejecución determinista en cualquier máquina; los equipos que necesiten embeddings neuronales inyectan su propio `IVectorStore` o usan el extra `[web]`.

### ADR-003: Búsqueda Híbrida Pluggable con Estrategias RRF y Ponderación Lineal
- **Contexto**: La documentación técnica mezcla términos exactos (códigos, endpoints, símbolos) con preguntas conceptuales en lenguaje natural.
- **Decisión**: Combinar recuperación léxica y vectorial mediante `IHybridRankingStrategy` con `ReciprocalRankFusionStrategy` por defecto y `WeightedLinearRankingStrategy` como alternativa, más registro abierto para estrategias de terceros.
- **Alternativas consideradas**: Usar únicamente búsqueda vectorial; descartado porque degrada coincidencias exactas de identificadores técnicos.
- **Consecuencias**: Mejor precisión general y extensibilidad total; introduce doble consulta sobre ambos almacenes en modo `hybrid`.

### ADR-004: Gobernanza Documental mediante Chain of Responsibility (`IDocumentRule`)
- **Contexto**: Cada proyecto que adopte ContextForge puede exigir metadatos distintos (tags obligatorios, límites de tamaño, convenciones de título).
- **Decisión**: Encapsular las validaciones de ingesta en `DocumentRuleChain` ejecutando instancias de `IDocumentRule`, con tres reglas predeterminadas y soporte para `register_rule()`.
- **Alternativas consideradas**: Validar con condicionales fijos dentro de `ingest()`; descartado por violar el principio Abierto/Cerrado (OCP).
- **Consecuencias**: Reglas altamente cohesivas y reutilizables; requiere definir claramente la prioridad/orden de las reglas registradas.

### ADR-005: Unificación de la Capa Web en `src/presentation/web/`
- **Contexto**: La coexistencia previa de `src/presentation/frontend/` y `src/presentation/web/` duplicaba convenciones y dificultaba el mantenimiento de la interfaz opcional del repositorio.
- **Decisión**: Migrar íntegramente `layouts/`, `modules/`, `shared/` y `web_router.py` a `src/presentation/web/` y eliminar el paquete anterior `packages/sdd_governance_engine/` para que el repositorio entero represente el componente reutilizable `contextforge v1.0.0`.
- **Alternativas consideradas**: Mantener dos paquetes independientes en el mismo repositorio; descartado porque fragmentaba el dominio real de base de conocimiento para agentes IA.
- **Consecuencias**: Árbol de directorios coherente y único paquete distribuible `contextforge v1.0.0`.

---

## 2. Instrucciones para Compilar, Instalar y Ejecutar Pruebas

### 2.1 Preparación del entorno e instalación del paquete

```bash
# Crear y activar entorno virtual (opcional si ya existe .venv)
python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Linux / macOS
source .venv/bin/activate

# Instalar el componente reutilizable y herramientas de desarrollo
pip install -e ".[dev]"
```

### 2.2 Ejecutar la aplicación de ejemplo de consola

```bash
python examples/agent_knowledge_cli.py
```

### 2.3 Ejecutar pruebas unitarias y verificar cobertura (>= 70%)

```bash
pytest tests/unit/test_contextforge_component.py --cov=contextforge --cov-report=term-missing
```

### 2.4 Ejecutar verificación de tipado estricto (`mypy --strict`)

```bash
python -m mypy --strict src/contextforge
```

### 2.5 Empaquetar distribución (wheel / sdist)

```bash
pip install build
python -m build
```

Los artefactos distribuibles (`contextforge-1.0.0-py3-none-any.whl` y `.tar.gz`) se generan en `dist/`.
