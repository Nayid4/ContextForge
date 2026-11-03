---
trigger: always_on
description: Reglas de acoplamiento nativo del Harness con Google Antigravity (subagentes, puertas humanas, branching con tipos feature/bugfix e INT-{numero}, y skills SDD).
---

# Integración Nativa con Google Antigravity — Harness SDD

Estas reglas complementan `AGENTS.md` para acoplar el flujo **SDD (Spec Driven Development)** con las herramientas y capacidades nativas de **Google Antigravity** (Antigravity 2.0, Antigravity IDE y Antigravity CLI `agy`).

---

## 1. Convención de Branching (`feature` y `bugfix`)

Se manejan dos tipos de ramas: `feature` y `bugfix`.

- **Estructura obligatoria**:
  ```
  {feature o bugfix}/INT-{numero}/{nombre_rama_de_lo_realizado}
  ```
  - Ejemplos válidos:
    - `feature/INT-001/document_crud_api`
    - `bugfix/INT-002/fix_jwt_token_expiration`
- **Límite de longitud**: El nombre completo de la rama **no debe superar los 80 caracteres**.
- **Regla de creación**: La rama de trabajo se crea desde la rama base (`main`, `master` o `dev`). Si la rama actual no es una de estas, se debe consultar al humano con `ask_question`.
- **Ámbito del trabajo**: Todo el trabajo de especificación, código, tests y registro de progreso ocurre **dentro de la rama de la tarea**, nunca directamente en las ramas base.

---

## 2. Orquestación Multi-Agente (`invoke_subagent`)

El arnés define roles especializados en `.agents/agents/`:

| Rol (`TypeName`) | Modo | Responsabilidad exclusiva |
| ---------------- | ---- | ------------------------- |
| `leader` | Agente principal | Orquesta el ciclo SDD, valida entorno/ramas, coordina subagentes y puertas humanas. |
| `spec-author` | Subagente | Redacta especificaciones técnicas, decisiones y tareas. |
| `implementer` | Subagente | Implementa código y tests según la técnica recomendada (TDD, SDD o FTD). |
| `reviewer` | Subagente | Audita trazabilidad, arquitectura, build, tests y cobertura. No edita código. |

### Reglas al invocar subagentes con `invoke_subagent`

1. **Workspace compartido en la rama activa (`Workspace: "inherit"`)**:
   - Cuando el `leader` delegue en subagentes, **DEBE** pasar `Workspace: "inherit"` y `Model: "inherit"`.
   - **Nunca** uses `Workspace: "branch"` al invocar estos subagentes, ya que el `leader` crea previamente la rama `{type}/INT-{numero}/{nombre_rama}` y todos los artefactos deben escribirse directamente sobre dicha rama.
2. **Contexto explícito en el `Prompt`**:
   - Incluye siempre en el `Prompt` del subagente: el `id`, `type` y `name` de la tarea, la ruta de spec, la rama activa `{type}/INT-{numero}/{nombre_rama}` (máx 80 caracteres).

---

## 3. Puertas de Decisión Humana (`ask_question`)

En Antigravity, **toda pausa obligatoria del flujo SDD** debe utilizar la herramienta `ask_question` para bloquear la ejecución hasta recibir la decisión explícita del humano:

1. **Validación de rama base**:
   - Si la rama actual no es `main`, `master`, `dev` ni `{feature|bugfix}/INT-*`, usa `ask_question` para preguntar al humano desde qué rama base desea crear la rama de trabajo.
2. **⏸ Puerta de Aprobación Humana del Spec**:
   - Presenta enlaces clicables en Markdown a los archivos de spec generados junto con un resumen.
   - Llama obligatoriamente a `ask_question` con las opciones:
     - `(Recommended) Aprobar spec al 100% e iniciar implementación (pasar a in_progress)`
     - `Solicitar correcciones o ajustes en el spec (mantener en edición)`
     - `Rechazar spec y devolver la tarea a estado pending`
   - **Jamás** inicies la implementación sin que el humano haya aprobado el spec al 100%.
3. **Pregunta de Integración al Cierre**:
   - Una vez creado el commit semántico en la rama de trabajo y reconciliada la metadata, usa `ask_question` para preguntar:
     `¿Requiere integración a la rama original ({rama_base})?`
     - `No integrar por ahora (dejar la tarea completada en su rama)`
     - `Sí, proyecto local: fusionar (merge) a la rama base`
     - `Sí, proyecto en repositorio remoto/nube: preparar guía para Pull Request (PR)`

---

## 4. Tablero de Visualización de Seguimiento (`project-docs/`)

El tablero interactivo vive en `project-docs/index.html`:
- Construido con **Arquitectura Screaming** en **Vanilla JS** y **Tailwind CSS v4**.
- Modos de visualización: Métricas KPI, Spec activo, Tabla de tareas (con ramas INT-* ≤80c), Grafo de dependencias, Árbol jerárquico SVG y Constelación 3D en Three.js con ciclo de vida `mount`/`unmount`.

---

## 5. Skills SDD Homologadas

El proyecto expone 18 skills en `.agents/skills/` invocables con `/` o por detección semántica:

- `/technical-audit` — Auditoría técnica del proyecto (`project-spec.yaml`).
- `/project-knowledge` — Extracción de base de conocimiento (C4, UML, reglas de negocio, estándares).
- `/generate-verify` — Generación de `verify.sh`.
- `/requirements-analysis` — Generación o actualización de `project-docs/feature_list.json`.
- `/generate-spec` — Generación de especificación técnica, decisiones y tareas.
- `/implement-tdd` — Implementación guiada por pruebas (TDD).
- `/implement-sdd` — Implementación dirigida por spec por fases (SDD).
- `/implement-ftd` — Implementación ágil para cambios menores (FTD).
- `/write-unit-tests` — Cobertura de tests unitarios agnósticos al lenguaje.
- `/acceptance-testing` — Pruebas de aceptación con Playwright, caja blanca/negra, sistema y carga (k6).
- `/verify-spec` — Reconciliación de metadata y verificación de cierre.
- `/api-test-plan` y `/execute-api-test-plan` — Pruebas de API REST.
- `/sync-skills` — Sincronización masiva triple (`.opencode/skills/` → `.github/skills/` y `.agents/skills/`).
- `/start-feature` y `/sdd-workflow` — Orquestación del ciclo SDD completo.

---

## 6. Consulta Obligatoria de la Base de Conocimiento (`project-docs/knowledge/`)

Para eliminar el sesgo (bias) y evitar errores por falta de contexto:
- **Invariante de Conocimiento Obligatoria**: Antes de redactar especificaciones (`spec-author`), implementar código (`implementer`) o resolver consultas, el agente DEBE verificar si existe `project-docs/knowledge/`. Si existe, es OBLIGATORIO consultar `knowledge-index.json`, `c4-model.md`, `uml-diagrams.md`, `business-rules.md`, `external-services.md`, `coding-standards.md` y `modules/{modulo}/`.
- **Respeto a las reglas de negocio**: Ninguna implementación ni sugerencia puede violar las invariantes documentadas (`BR-*`).
- **Respeto a las convenciones**: Debe seguirse la forma de programar, patrones de inyección y librerías canónicas registradas. Queda estrictamente prohibido alucinar paquetes o librerías externas que no figuren en los estándares.
- **Sincronización Automática con el Tablero**: Toda skill que actualice o genere artefactos de auditoría o conocimiento (`technical-audit`, `project-knowledge`, `requirements-analysis`, `generate-verify`, `verify-spec`) debe ejecutar automáticamente `node project-docs/sync-data.js` para asegurar que el tablero interactivo refleje de inmediato los datos tanto en modo servidor (`serve.js`) como en modo offline (`file:///`).
