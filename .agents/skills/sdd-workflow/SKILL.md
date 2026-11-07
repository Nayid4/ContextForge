---
name: sdd-workflow
description: >-
  Use this skill when the user asks to execute the Spec Driven Development (SDD)
  workflow, asks how the SDD Harness lifecycle works, or says 'implement',
  'start feature', 'new feature', 'complete feature', or 'start sdd'. Guides the
  complete multi-agent feature lifecycle (spec -> human gate -> implement -> review -> close).
---

# SDD Workflow — Spec Driven Development en Google Antigravity

Este skill guía el ciclo de vida completo **SDD (Spec Driven Development)** del arnés universal en **Google Antigravity**, desde la detección de una feature o bugfix pendiente hasta su verificación y cierre, garantizando el cumplimiento estricto de la puerta de aprobación humana.

---

## Archivos de referencia del arnés

- [AGENTS.md](../../../AGENTS.md) — Mapa de navegación y reglas duras del arnés.
- [project-docs/feature_list.json](../../../project-docs/feature_list.json) — Backlog de tareas, ramas, estados y prioridades.
- [project-docs/knowledge/](../../../project-docs/knowledge/) — Base de conocimiento Docs-as-Code (C4, UML, reglas de negocio, estándares).
- [project-docs/project-spec.yaml](../../../project-docs/project-spec.yaml) — Especificación técnica y auditoría del proyecto.
- [project-docs/verify.sh](../../../project-docs/verify.sh) — Script de verificación integral multinivel.

---

## Máquina de estados de una feature / bugfix

| Estado | Quién actúa | Significado |
| ------ | ----------- | ----------- |
| `pending` | `spec-author` | Tarea sin spec. Debe redactarse `requirements.md`, `design.md` y `tasks.md` en `project-docs/specs/{NNN}_{name}/`. |
| `spec_ready` | ⏸ **Humano** | Spec redactado. **Prohibido tocar código.** El humano revisa y aprueba o pide ajustes. |
| `in_progress` | `implementer` → `reviewer` | Spec aprobado al 100%. Implementación de código/tests y auditoría de revisión. |
| `done` | `leader` | Verificado al 100%, commit semántico creado y registrado en `project-docs/progres/history.json`. |
| `blocked` | `leader` / **Humano** | Bloqueo documentado en `project-docs/progres/current.json`. |

---

## Flujo de orquestación en Antigravity

```text
pending ──► [spec-author] ──► spec_ready ──► ⏸ HUMANO (ask_question) ──► in_progress ──► [implementer] ──► [reviewer] ──► done
```

1. **Preparación (`leader`)**:
   - Ejecuta `bash project-docs/verify.sh` mediante `run_command`.
   - Lee `project-docs/kickstart.json` y `project-docs/feature_list.json`.
   - Verifica rama base (`main` / `master` / `dev`) y estado limpio en `project-docs/progres/current.json` y `history.json`.
   - Crea o cambia a la rama `{feature|bugfix}/INT-{numero}/{nombre_rama}` (máximo 80 caracteres) y registra ejecutor en `current.json`.
2. **Fase de Spec (`spec-author`)**:
   - Invoca `invoke_subagent(TypeName="spec-author", Workspace="inherit", ...)` (o usa `/spec`).
   - Genera `project-docs/specs/{NNN}_{name}/{requirements,design,tasks}.md` y pasa la tarea a `spec_ready`.
3. **⏸ Puerta Humana (`ask_question`)**:
   - Presenta al humano los enlaces a los 3 archivos del spec y solicita aprobación explícita con `ask_question`.
4. **Fase de Implementación (`implementer`)**:
   - Invoca `invoke_subagent(TypeName="implementer", Workspace="inherit", ...)` (o usa `/implement`).
   - Ejecuta `tasks.md` una a una, escribe código y tests, corre los comandos de `project-docs/project-spec.yaml`, y documenta el mapa `R<n> ↔ Tests` en `project-docs/progres/impl_{name}.md`.
5. **Fase de Revisión (`reviewer`)**:
   - Invoca `invoke_subagent(TypeName="reviewer", Workspace="inherit", ...)` (o usa `/review`).
   - Audita trazabilidad, arquitectura, convenciones, subtareas Jira DEV/QA y capturas de pantalla, generando `project-docs/progres/review_{name}.md`.
6. **Cierre (`leader`)**:
   - Actualiza `project-docs/feature_list.json` (`done`), `project-docs/progres/history.json`, limpia `current.json` a `{}`, ejecuta `node project-docs/sync-data.js`, crea el commit semántico en la rama de trabajo y consulta al humano sobre la integración a la rama base mediante `ask_question`.

---

## Reglas duras (no negociables)

- **Una sola tarea a la vez.**
- **Ramas obligatorias:** `{feature o bugfix}/INT-{numero}/{nombre_rama_de_lo_realizado}` con **máximo 80 caracteres**.
- **No saltar la puerta de aprobación humana (`spec_ready`).**
- **Comandos de build y test al 100% en verde antes de declarar `done`.**
- **Trazabilidad `R<n> ↔ Tests` obligatoria y verificada.**
- **Todo el trabajo ocurre en la rama de trabajo, nunca en `main`, `master` ni `dev`.**
