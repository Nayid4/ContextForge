---
name: start-feature
description: >-
  Use this skill when the user invokes /start-feature or asks to start, resume,
  or execute the complete SDD workflow for the next pending feature or bugfix in
  project-docs/feature_list.json.
---

# `/start-feature` — Iniciar o retomar el flujo SDD completo

Ejecuta el ciclo **SDD (Spec Driven Development)** completo actuando como **leader** (orquestador), siguiendo [AGENTS.md](../../../AGENTS.md) paso a paso.

---

## Procedimiento paso a paso

### Paso 1 — Verificación de entorno y lectura de estado
1. Ejecuta `bash project-docs/verify.sh` usando `run_command`. Si devuelve error, **detente** y reporta el fallo al humano.
2. Lee `project-docs/kickstart.json` (o `project-docs/project-spec.yaml`) para obtener `project` y `team` (`executorName`, `executorEmail`).
3. Lee `project-docs/feature_list.json`:
   - Si hay una tarea en `spec_ready` o `in_progress`, retómala en la fase correspondiente.
   - Si todas están en `pending` o `done`, selecciona la primera tarea con `status: "pending"`.

### Paso 2 — Validación de rama y limpieza
1. Comprueba la rama actual con `git branch --show-current`:
   - Si es `main`, `master` o `dev`: verifica que `project-docs/progres/current.json` esté vacío (o `{}`), y que `project-docs/progres/history.json` tenga entradas cerradas.
   - Construye el nombre de rama según la estructura obligatoria:
     `{feature o bugfix}/INT-{numero}/{nombre_rama_de_lo_realizado}` (máximo 80 caracteres).
     Ejemplo: `feature/INT-001/example_scaffold` o `bugfix/INT-002/fix_login_timeout`.
     ```bash
     git checkout -b {feature|bugfix}/INT-{numero}/{nombre_rama}
     ```
   - Si ya estás en `{feature|bugfix}/INT-*`: lee `project-docs/progres/current.json` para retomar el contexto.
   - Si es cualquier otra rama: **detente** y usa `ask_question` para preguntar al humano desde qué rama base crear la tarea.
2. Registra en `project-docs/progres/current.json` como primera acción los datos de la feature activa y ejecutor.

### Paso 3 — Redacción del Spec (`spec-author`)
1. Si la tarea tiene `"sdd": true` y no tiene spec completado:
   - Invoca al subagente `spec-author` con `invoke_subagent`:
     - `TypeName`: `"spec-author"`
     - `Role`: `"Spec Author — {NNN}_{name}"`
     - `Workspace`: `"inherit"`
     - `Prompt`: Pasa los datos de la tarea de `project-docs/feature_list.json`, la rama activa, los parámetros de `project-docs/project-spec.yaml` y la instrucción de crear `project-docs/specs/{NNN}_{name}/{requirements,design,tasks}.md` y actualizar `project-docs/feature_list.json` a `"spec_ready"`.

### Paso 4 — ⏸ Puerta de aprobación humana (`spec_ready`)
1. Presenta al humano enlaces clicables a:
   - `project-docs/specs/{NNN}_{name}/requirements.md`
   - `project-docs/specs/{NNN}_{name}/design.md`
   - `project-docs/specs/{NNN}_{name}/tasks.md`
2. Llama a `ask_question` para que el humano apruebe al 100% o solicite cambios:
   - Si solicita cambios o rechaza: relanza `spec-author` con el feedback y vuelve a presentar.
   - Si aprueba al 100%: actualiza `project-docs/feature_list.json` a `"in_progress"`, actualiza `project-docs/progres/current.json` y continúa al Paso 5.

### Paso 5 — Implementación (`implementer`) y Revisión (`reviewer`)
1. Invoca al subagente `implementer` (`TypeName: "implementer"`, `Workspace: "inherit"`) para ejecutar `project-docs/specs/{NNN}_{name}/tasks.md` una a una, correr los comandos de build y test de `project-docs/project-spec.yaml`, y generar `project-docs/progres/impl_{name}.md`.
2. Cuando `implementer` termine, invoca al subagente `reviewer` (`TypeName: "reviewer"`, `Workspace: "inherit"`) para verificar trazabilidad `R<n> ↔ Tests`, arquitectura, convenciones y pruebas, generando `project-docs/progres/review_{name}.md`.
3. Si `reviewer` rechaza: relanza `implementer` para corregir las observaciones de `project-docs/progres/review_{name}.md` y vuelve a pasar por `reviewer`.

### Paso 6 — Cierre e integración
1. Con el veredicto **Aprobado** del `reviewer`:
   - Ejecuta `bash project-docs/verify.sh`.
   - Marca `status: "done"` en `project-docs/feature_list.json`.
   - Sincroniza datos del tablero con `node project-docs/sync-data.js`.
   - Mueve el resumen de `project-docs/progres/current.json` al historial `project-docs/progres/history.json` y resetea `current.json` a `{}`.
   - Realiza el commit semántico en la rama: `feat({scope}): {descripción}` o `fix({scope}): {descripción}`.
2. Usa `ask_question` para preguntar al humano:
   `¿Requiere integración a la rama original ({rama_base})?`
   - Proyecto local → realiza merge a la rama base.
   - Proyecto en nube → indica crear un Pull Request (PR).
   - No → mantiene la tarea en su rama.
