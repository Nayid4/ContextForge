---
id: "MOD-ORCH-RULES"
title: "Módulo: agent-orchestrator — Requerimientos & Reglas de Negocio"
collection: "engineering"
parent: "modules/agent-orchestrator/module-spec.md"
owner: "leader"
module: "agent-orchestrator"
status: "Publicado"
version: "4.2.0"
access: "public"
is_locked: false
is_favorite: false
full_width: false
last_updated: "2026-11-07"
tags: ["requirements","rules","stories","tasks","scrum-subtasks","qa-evidence"]
labels: ["requirements","rules","stories","tasks","scrum-subtasks","qa-evidence","engineering"]
---

# Módulo: agent-orchestrator — Requerimientos & Reglas de Negocio

---

## 1. Requerimientos Funcionales Formales (IEEE 830)

### `RF-ORCH-001`: Creación y Validación Estricta de Ramas Git
- **Enunciado Formal**: Cuando el usuario solicite iniciar una tarea de ingeniería, el sistema **debe** verificar que la rama de trabajo cumpla la estructura `{feature|bugfix}/INT-{numero}/{nombre_rama}` y su longitud total **no debe** exceder los 80 caracteres.
- **Criterio Gherkin**:
  - *Given* una tarea con tipo `feature`, id `INT-001` y nombre `document_crud_api`
  - *When* el orquestador genera la rama git
  - *Then* la rama creada es `feature/INT-001/document_crud_api` y su longitud es de 33 caracteres ($\le 80$).

### `RF-ORCH-002`: Puerta Humana Obligatoria para Aprobación de Spec
- **Enunciado Formal**: Antes de pasar una tarea a estado `in_progress` o iniciar la fase de implementación, el sistema **debe** invocar la herramienta `ask_question` para obtener la aprobación explícita y documentada del usuario humano al 100%.

### `RF-ORCH-003`: Partición en Subtareas Scrum Jira DEV/QA y Captura de Evidencias
- **Enunciado Formal**: Durante la redacción del spec y la verificación final, el sistema **debe** particionar la tarea en subtareas Jira de Desarrollo (`DEV`) y Aseguramiento de Calidad (`QA`), y **debe** generar capturas de pantalla visuales de los flujos principales en `project-docs/specs/{NNN}_{name}/evidence/`.
- **Criterio Gherkin**:
  - *Given* una tarea aprobada y probada
  - *When* se ejecuta la verificación de aceptación
  - *Then* se generan las capturas PNG en el directorio de evidencias y el modal de detalle del tablero muestra badges interactivos `DEV: done` y `QA: done`.

---

## 2. Reglas de Negocio Locales (BR-*)

| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |
|---|---|---|---|---|
| `BR-ORCH-001` | Crítica | `length(branch) <= 80 && type in ['feature', 'bugfix']` | `.opencode/rules/branches.md` | Aborta con error de convención |
| `BR-ORCH-002` | Crítica | `spec_approved == true` antes de delegar a `implementer` | `.agents/rules/antigravity-harness.md` | Bloquea ejecución con `ask_question` |
| `BR-ORCH-003` | Crítica | `reviewer.can_edit_code == false` | `.agents/agents/reviewer.md` | Prohibido editar código fuente |
| `BR-ORCH-004` | Alta | `subtasks.dev == 'done' && subtasks.qa == 'done' && evidence_files.length >= 1` | `verify-spec` y `Modal.js` | Impide marcar la tarea como `done` |

---

## 3. Historias de Usuario (HU-*) y Tareas de Ingeniería (TI-*)

### `HU-ORCH-01`: Orquestación Segura de Features
- *Como* desarrollador líder, *quiero* que el arnés cree automáticamente ramas con el formato y longitud estricta, *para* evitar colisiones de nombres y ramas rotas en repositorios compartidos.
- **Story Points**: 3 SP (Fibonacci)
- **Tareas de Ingeniería (TI-*)**:
  - `TI-ORCH-01`: Implementar validador regex de nombres de rama y contador de caracteres $\le 80$.
  - `TI-ORCH-02`: Añadir suite de pruebas BVA (79c, 80c, 81c) en `tests/blackbox/bva-inputs.test.js`.

### `HU-ORCH-02`: Desglose Scrum DEV/QA y Evidencias Visuales
- *Como* auditor de calidad / Scrum Master, *quiero* que cada User Story cuente con subtareas independientes de DEV y QA y evidencias gráficas generadas automáticamente, *para* auditar la aceptación visual sin ejecutar manualmente el navegador.
- **Story Points**: 5 SP (Fibonacci)
- **Tareas de Ingeniería (TI-*)**:
  - `TI-ORCH-03`: Implementar runner de capturas headless en `scripts/capture-evidence.js`.
  - `TI-ORCH-04`: Integrar visualización de subtareas DEV/QA y visor de evidencias en `project-docs/src/shared/Modal.js`.
  - `TI-ORCH-05`: Añadir pruebas E2E con Playwright en `tests/acceptance/scrum-evidence-capture.spec.js`.


