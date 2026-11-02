---
name: spec
description: >-
  Use this skill when the user invokes /spec or asks to write, generate, or
  update the SDD specification files (requirements.md, design.md, tasks.md) for
  the active feature or bugfix.
---

# `/spec` — Generar o actualizar el Spec de la tarea activa

Ejecuta la Fase 2 (Spec Driven Development) para la feature o bugfix activa en `feature_list.json`, apoyándote en [docs/specs.md](../../../docs/specs.md), [docs/architecture.md](../../../docs/architecture.md) y [docs/conventions.md](../../../docs/conventions.md).

---

## Procedimiento

1. **Verifica la rama activa (`git branch --show-current`)**:
   - Debe seguir la estructura `{feature o bugfix}/INT-{numero}/{nombre_rama}` (máximo 80 caracteres). Si estás en `main`, `master` o `dev`, crea primero la rama correspondiente y registra el ejecutor de `kickstart.json` en `progress/current.md`.
2. **Delega o ejecuta el rol `spec-author`**:
   - Si estás actuando como `leader` (agente principal), invoca al subagente `spec-author` mediante `invoke_subagent`:
     - `TypeName`: `"spec-author"`
     - `Role`: `"Spec Author — {NNN}_{name}"`
     - `Workspace`: `"inherit"`
     - `Prompt`: Incluye el contenido de la tarea en `feature_list.json`, la rama activa `{type}/INT-{numero}/{nombre_rama}`, los parámetros de `kickstart.json` y cualquier indicación adicional del humano.
   - Si ya estás ejecutando dentro del agente `spec-author`, crea directamente los 3 archivos.
3. **Verifica los 3 entregables obligatorios en `specs/{NNN}_{name}/`**:
   - `requirements.md` — Requirements numerados (`R1`, `R2`, ...) en notación **EARS estricta** (`Ubicuo`, `Evento`, `Estado`, `Opcional`, `No deseado`), con un único `DEBE` / `NO DEBE` por requirement y 100% verificables por test.
   - `design.md` — Resumen, archivos nuevos/modificados, tabla de tipos, decisiones técnicas como **ADRs** (`ADR-001`, ... con al menos una alternativa descartada cada uno), paquetes NuGet y riesgos.
   - `tasks.md` — Checklist secuencial (`- [ ] T1 — ... Cubre: R1.`), atómico, con tasks de código y de tests (unitarios + integración) que cubran todos los `R<n>` (máximo 20 tasks).
4. **Actualiza el estado a `spec_ready`**:
   - Asegúrate de que la tarea quede con `status: "spec_ready"` en `feature_list.json`.
5. **⏸ Puerta de aprobación humana**:
   - Presenta enlaces clicables a los 3 archivos generados y utiliza `ask_question` para solicitar la aprobación al 100% del humano antes de permitir cualquier paso a implementación.
