---
name: start-feature
description: >-
  Use this skill when the user invokes /start-feature or asks to start, resume,
  or execute the complete SDD workflow for the next pending feature or bugfix in
  feature_list.json.
---

# `/start-feature` — Iniciar o retomar el flujo SDD completo

Ejecuta el ciclo **SDD (Spec Driven Development)** completo actuando como **leader** (orquestador), siguiendo [AGENTS.md](../../../AGENTS.md) paso a paso.

---

## Procedimiento paso a paso

### Paso 1 — Verificación de entorno y lectura de estado
1. Ejecuta `bash ./init.sh` usando `run_command`. Si devuelve error, **detente** y reporta el fallo al humano.
2. Lee `kickstart.json` para obtener `project` y `team` (`executorName`, `executorEmail`).
3. Lee `feature_list.json`:
   - Si hay una tarea en `spec_ready` o `in_progress`, retómala en la fase correspondiente.
   - Si todas están en `pending` o `done`, selecciona la primera tarea con `status: "pending"`.

### Paso 2 — Validación de rama y limpieza
1. Comprueba la rama actual con `git branch --show-current`:
   - Si es `main`, `master` o `dev`: verifica que `progress/current.md` esté vacío (solo plantilla), `progress/history.md` tenga entradas cerradas y `ENGINES.md` esté limpio.
   - Construye el nombre de rama según la estructura obligatoria:
     `{feature o bugfix}/INT-{numero}/{nombre_rama_de_lo_realizado}` (máximo 80 caracteres).
     Ejemplo: `feature/INT-001/example_scaffold` o `bugfix/INT-002/fix_login_timeout`.
     ```bash
     git checkout -b {feature|bugfix}/INT-{numero}/{nombre_rama}
     ```
   - Si ya estás en `{feature|bugfix}/INT-*`: lee `progress/current.md` para retomar el contexto.
   - Si es cualquier otra rama: **detente** y usa `ask_question` para preguntar al humano desde qué rama base crear la tarea.
2. Registra en `progress/current.md` como primera acción:
   ```markdown
   Ejecutado por: {executorName} ({executorEmail})
   ```

### Paso 3 — Redacción del Spec (`spec-author`)
1. Si la tarea tiene `"sdd": true` y no tiene spec completado:
   - Invoca al subagente `spec-author` con `invoke_subagent`:
     - `TypeName`: `"spec-author"`
     - `Role`: `"Spec Author — {NNN}_{name}"`
     - `Workspace`: `"inherit"`
     - `Prompt`: Pasa los datos de la tarea de `feature_list.json`, la rama activa, los parámetros de `kickstart.json` y la instrucción de crear `specs/{NNN}_{name}/{requirements,design,tasks}.md` y actualizar `feature_list.json` a `"spec_ready"`.

### Paso 4 — ⏸ Puerta de aprobación humana (`spec_ready`)
1. Presenta al humano enlaces clicables a:
   - `specs/{NNN}_{name}/requirements.md`
   - `specs/{NNN}_{name}/design.md`
   - `specs/{NNN}_{name}/tasks.md`
2. Llama a `ask_question` para que el humano apruebe al 100% o solicite cambios:
   - Si solicita cambios o rechaza: relanza `spec-author` con el feedback y vuelve a presentar.
   - Si aprueba al 100%: actualiza `feature_list.json` a `"in_progress"`, copia las tasks a `progress/current.md` y continúa al Paso 5.

### Paso 5 — Implementación (`implementer`) y Revisión (`reviewer`)
1. Invoca al subagente `implementer` (`TypeName: "implementer"`, `Workspace: "inherit"`) para ejecutar `specs/{NNN}_{name}/tasks.md` una a una, correr `dotnet build /warnaserror` y `dotnet test`, y generar `progress/impl_{name}.md`.
2. Cuando `implementer` termine, invoca al subagente `reviewer` (`TypeName: "reviewer"`, `Workspace: "inherit"`) para verificar trazabilidad `R<n> ↔ Tests`, arquitectura, convenciones y pruebas, generando `progress/review_{name}.md`.
3. Si `reviewer` rechaza: relanza `implementer` para corregir las observaciones de `progress/review_{name}.md` y vuelve a pasar por `reviewer`.

### Paso 6 — Cierre e integración
1. Con el veredicto **Aprobado** del `reviewer`:
   - Ejecuta `bash ./init.sh`.
   - Marca `status: "done"` en `feature_list.json`.
   - Añade la fila de la tarea completada en `ENGINES.md`.
   - Mueve el resumen de `progress/current.md` al final de `progress/history.md` y limpia `progress/current.md` dejando solo la plantilla.
   - Realiza el commit semántico en la rama: `feat({scope}): {descripción}` o `fix({scope}): {descripción}`.
2. Usa `ask_question` para preguntar al humano:
   `¿Requiere integración a la rama original ({rama_base})?`
   - Proyecto local → realiza merge a la rama base.
   - Proyecto en nube → indica crear un Pull Request (PR).
   - No → mantiene la tarea en su rama.
