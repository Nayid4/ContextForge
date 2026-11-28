# Guía de Sustentación del MVP — ContextForge `v1.0.0` (10 minutos máximo)

Distribución sugerida del tiempo para la presentación en equipo (2 a 3 estudiantes) cubriendo los 4 criterios de evaluación de la Parte I.

---

## Agenda Cronometrada (10 min)

| Bloque | Duración | Responsable sugerido | Qué mostrar en pantalla |
| :--- | :---: | :--- | :--- |
| **1. Problema y Propuesta de Valor** | `1.5 min` | Integrante 1 | `README.md` y `docs/01-documentacion-funcional.md`: por qué los proyectos con agentes IA necesitan una base de conocimiento local reutilizable, sin acoplamiento a proveedor LLM ni BD, y qué 4 funcionalidades esenciales ofrece la API (`ingest`, `search`, `ask`, `compile_bundle`). |
| **2. Arquitectura C4, UML y Frontera Pública** | `2.5 min` | Integrante 1 / 2 | `docs/02-arquitectura-y-diseno.md` + árbol `src/contextforge/` (`__init__.py` con `__all__` vs `_internal/`): explicar C4 (Contexto, Contenedor, Componente), Diagrama de Clases UML y Secuencia de `ask()`. |
| **3. Principios SOLID, GRASP, GoF y ADRs** | `2.5 min` | Integrante 2 | Matriz en `docs/02-arquitectura-y-diseno.md` y `docs/03-adrs-y-pruebas.md`: señalar en código real cada principio SOLID, patrones GoF de las 3 categorías (Builder/Factory, Facade/Decorator, Strategy/Chain of Responsibility/Observer) explicando **beneficio y costo** de cada uno. |
| **4. Demostración en Vivo (Ejemplo + Pruebas)** | `2.5 min` | Integrante 2 / 3 | Ejecutar en consola `python examples/agent_knowledge_cli.py` (mostrando las 4 operaciones + 4 extensiones de terceros sin modificar la librería) y `pytest tests/unit/test_contextforge_component.py --cov=contextforge --cov-report=term-missing` (mostrando `96%` de cobertura y dobles de prueba: Mock, Stub, Fake, Spy). |
| **5. Cierre y Preguntas** | `1.0 min` | Equipo | Etiqueta `v1.0.0`, `CHANGELOG.md` y preparación para que el equipo par reutilice y extienda el componente en la Parte II. |

---

## Comandos Exactos para la Demo en Vivo

```bash
# 1. Confirmar paquete instalado v1.0.0 sin dependencias obligatorias
pip show contextforge

# 2. Ejecutar la aplicación de ejemplo (solo API pública + 4 extensiones externas)
python examples/agent_knowledge_cli.py

# 3. Ejecutar pruebas unitarias con dobles de prueba y reporte de cobertura (>= 70%)
pytest tests/unit/test_contextforge_component.py --cov=contextforge --cov-report=term-missing

# 4. Verificar tipado estricto
python -m mypy --strict src/contextforge
```
