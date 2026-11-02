---
name: sdd-workflow
description: >-
  Use this skill when the user asks to execute the Spec Driven Development (SDD)
  workflow, asks how the .NET Harness lifecycle works, or says 'implement',
  'start feature', 'new feature', 'complete feature', or 'start sdd'. Guides the
  complete multi-agent feature lifecycle (spec -> human gate -> implement -> review -> close).
---

# SDD Workflow — Spec Driven Development en Google Antigravity

Este skill guía el ciclo de vida completo **SDD (Spec Driven Development)** del `.NET Harness` en **Google Antigravity**, desde la detección de una feature o bugfix pendiente hasta su verificación y cierre, garantizando el cumplimiento estricto de la puerta de aprobación humana.

---

## Archivos de referencia del arnés

- [AGENTS.md](../../../AGENTS.md) — Mapa de navegación y reglas duras del arnés.
- [feature_list.json](../../../feature_list.json) — Backlog de tareas, ramas, estados y prioridades.
- [docs/specs.md](../../../docs/specs.md) — Especificación del proceso SDD (EARS, ADRs, Tasks, DoR, DoD).
- [docs/architecture.md](../../../docs/architecture.md) — Clean Architecture, DDD, CQRS y patrones .NET.
- [docs/conventions.md](../../../docs/conventions.md) — Convenciones de código C#, nomenclatura, async y testing.
- [docs/verification.md](../../../docs/verification.md) — Los 10 niveles de verificación de calidad.
- [CHECKPOINTS.md](../../../CHECKPOINTS.md) — Criterios objetivos de estado final correcto (`C1`–`C7`).

---

## Máquina de estados de una feature / bugfix

| Estado | Quién actúa | Significado |
| ------ | ----------- | ----------- |
| `pending` | `spec-author` | Tarea sin spec. Debe redactarse `requirements.md`, `design.md` y `tasks.md`. |
| `spec_ready` | ⏸ **Humano** | Spec redactado. **Prohibido tocar código.** El humano revisa y aprueba o pide ajustes. |
| `in_progress` | `implementer` → `reviewer` | Spec aprobado al 100%. Implementación de código/tests y auditoría de revisión. |
| `done` | `leader` | Verificado al 100%, commit semántico creado y registrado en `ENGINES.md`. |
| `blocked` | `leader` / **Humano** | Bloqueo documentado en `progress/current.md`. |

---

## Flujo de orquestación en Antigravity

```text
pending ──► [spec-author] ──► spec_ready ──► ⏸ HUMANO (ask_question) ──► in_progress ──► [implementer] ──► [reviewer] ──► done
```

1. **Preparación (`leader`)**:
   - Ejecuta `bash ./init.sh` mediante `run_command`.
   - Lee `kickstart.json` y `feature_list.json`.
   - Verifica rama base (`main` / `master` / `dev`) y estado limpio en `progress/current.md`, `progress/history.md` y `ENGINES.md`.
   - Crea o cambia a la rama `{feature|bugfix}/INT-{numero}/{nombre_rama}` (máximo 80 caracteres) y registra `Ejecutado por: {nombre} ({email})` en `progress/current.md`.
2. **Fase de Spec (`spec-author`)**:
   - Invoca `invoke_subagent(TypeName="spec-author", Workspace="inherit", ...)` (o usa `/spec`).
   - Genera `specs/{NNN}_{name}/{requirements,design,tasks}.md` y pasa la tarea a `spec_ready`.
3. **⏸ Puerta Humana (`ask_question`)**:
   - Presenta al humano los enlaces a los 3 archivos del spec y solicita aprobación explícita con `ask_question`.
4. **Fase de Implementación (`implementer`)**:
   - Invoca `invoke_subagent(TypeName="implementer", Workspace="inherit", ...)` (o usa `/implement`).
   - Ejecuta `tasks.md` una a una, escribe código en `src/` y tests en `tests/`, corre `dotnet build /warnaserror` y `dotnet test`, y documenta el mapa `R<n> ↔ Tests` en `progress/impl_<name>.md`.
5. **Fase de Revisión (`reviewer`)**:
   - Invoca `invoke_subagent(TypeName="reviewer", Workspace="inherit", ...)` (o usa `/review`).
   - Audita trazabilidad, arquitectura, convenciones y comandos de verificación, generando `progress/review_<name>.md`.
6. **Cierre (`leader`)**:
   - Actualiza `feature_list.json` (`done`), `ENGINES.md` y `progress/history.md`, limpia `progress/current.md`, crea el commit semántico en la rama de trabajo y consulta al humano sobre la integración a la rama base mediante `ask_question`.

---

## Reglas duras (no negociables)

- **Una sola tarea a la vez.**
- **Ramas obligatorias:** `{feature o bugfix}/INT-{numero}/{nombre_rama_de_lo_realizado}` con **máximo 80 caracteres**.
- **No saltar la puerta de aprobación humana (`spec_ready`).**
- **`dotnet build /warnaserror` y `dotnet test` al 100% en verde antes de declarar `done`.**
- **Trazabilidad `R<n> ↔ Tests` obligatoria y verificada.**
- **Todo el trabajo ocurre en la rama de trabajo, nunca en `main`, `master` ni `dev`.**
