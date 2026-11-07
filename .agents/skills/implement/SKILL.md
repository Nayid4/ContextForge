---
name: implement
description: >-
  Use this skill when the user invokes /implement or asks to execute the tasks
  in project-docs/specs/{NNN}_{name}/tasks.md, write the production code and tests, and
  record R-to-Tests traceability for the active feature or bugfix.
---

# `/implement` — Implementar las tasks de la tarea activa

Ejecuta la Fase 4 (Implementación) para la feature o bugfix activa siguiendo la base de conocimiento soberana `project-docs/knowledge/` y la especificación en `project-docs/specs/{NNN}_{name}/`.

---

## Precondiciones obligatorias

1. **Rama activa**: Debe ser `{feature|bugfix}/INT-{numero}/{nombre_rama}` (máx 80 caracteres, nunca `main`, `master` ni `dev`).
2. **Puerta humana cumplida**:
   - Si la tarea tiene `"sdd": true`, verifica que existan `project-docs/specs/{NNN}_{name}/{requirements,design,tasks}.md`.
   - Si el estado en `project-docs/feature_list.json` aún es `"spec_ready"`, confirma con el humano mediante `ask_question` que aprueba el spec al 100% antes de cambiarlo a `"in_progress"`.

---

## Procedimiento

1. **Asegura `status: "in_progress"`** en `project-docs/feature_list.json` y en `project-docs/progres/current.json`.
2. **Delega o ejecuta el rol `implementer`**:
   - Si estás en el agente `leader`, lanza el subagente `implementer` mediante `invoke_subagent`:
     - `TypeName`: `"implementer"`
     - `Role`: `"Implementer — {NNN}_{name}"`
     - `Workspace`: `"inherit"`
     - `Prompt`: Pasa la ruta `project-docs/specs/{NNN}_{name}/`, la rama activa, los comandos de `project-docs/project-spec.yaml` y las observaciones previas (si viene de una corrección de `reviewer`).
   - Si estás ejecutando directamente como `implementer`:
     - Lee `project-docs/specs/{NNN}_{name}/tasks.md`, `requirements.md`, `design.md` y `project-docs/knowledge/`.
     - Ejecuta cada task `T1..Tn` una a una en orden secuencial.
     - Escribe el código y los tests correspondientes.
     - Tras cada bloque de cambios, corre los comandos de compilación y pruebas definidos en `project-docs/project-spec.yaml`.
     - Marca `[x]` la task completada en `project-docs/specs/{NNN}_{name}/tasks.md` y en `project-docs/progres/current.json`.
3. **Documenta la trazabilidad `R<n> ↔ Tests` en `project-docs/progres/impl_{name}.md`**:
   - Incluye la tabla que mapea cada `R<n>` de `requirements.md` con el test concreto que lo verifica.
4. **Verificación previa a revisión**:
   - Build limpio (0 errores, 0 warnings bloqueantes).
   - 100% de tests en verde.
   - Sincronización del tablero: `node project-docs/sync-data.js`.
