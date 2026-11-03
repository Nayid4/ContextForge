---
id: MOD-ORCH-RULES
title: "Módulo: agent-orchestrator — Requerimientos & Reglas de Negocio"
module: "agent-orchestrator"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["requirements", "rules", "stories", "tasks"]
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

---

## 2. Reglas de Negocio Locales (BR-*)

| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |
|---|---|---|---|---|
| `BR-ORCH-001` | Crítica | `length(branch) <= 80 && type in ['feature', 'bugfix']` | `.opencode/rules/branches.md` | Aborta con error de convención |
| `BR-ORCH-002` | Crítica | `spec_approved == true` antes de delegar a `implementer` | `.agents/rules/antigravity-harness.md` | Bloquea ejecución con `ask_question` |
| `BR-ORCH-003` | Crítica | `reviewer.can_edit_code == false` | `.agents/agents/reviewer.md` | Prohibido editar código fuente |

---

## 3. Historias de Usuario (HU-*) y Tareas de Ingeniería (TI-*)

### `HU-ORCH-01`: Orquestación Segura de Features
- *Como* desarrollador líder, *quiero* que el arnés cree automáticamente ramas con el formato y longitud estricta, *para* evitar colisiones de nombres y ramas rotas en repositorios compartidos.
- **Story Points**: 3 SP (Fibonacci)
- **Tareas de Ingeniería (TI-*)**:
  - `TI-ORCH-01`: Implementar validador regex de nombres de rama y contador de caracteres $\le 80$.
  - `TI-ORCH-02`: Añadir suite de pruebas BVA (79c, 80c, 81c) en `tests/blackbox/bva-inputs.test.js`.
