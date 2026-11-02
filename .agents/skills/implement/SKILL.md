---
name: implement
description: >-
  Use this skill when the user invokes /implement or asks to execute the tasks
  in specs/{NNN}_{name}/tasks.md, write the production code and tests, and
  record R-to-Tests traceability for the active feature or bugfix.
---

# `/implement` — Implementar las tasks de la tarea activa

Ejecuta la Fase 4 (Implementación) para la feature o bugfix activa siguiendo [docs/architecture.md](../../../docs/architecture.md), [docs/conventions.md](../../../docs/conventions.md) y [docs/verification.md](../../../docs/verification.md).

---

## Precondiciones obligatorias

1. **Rama activa**: Debe ser `{feature|bugfix}/INT-{numero}/{nombre_rama}` (máx 80 caracteres, nunca `main`, `master` ni `dev`).
2. **Puerta humana cumplida**:
   - Si la tarea tiene `"sdd": true`, verifica que existan `specs/{NNN}_{name}/{requirements,design,tasks}.md`.
   - Si el estado en `feature_list.json` aún es `"spec_ready"`, confirma con el humano mediante `ask_question` que aprueba el spec al 100% antes de cambiarlo a `"in_progress"`.

---

## Procedimiento

1. **Asegura `status: "in_progress"`** en `feature_list.json` y en `progress/current.md`.
2. **Delega o ejecuta el rol `implementer`**:
   - Si estás en el agente `leader`, lanza el subagente `implementer` mediante `invoke_subagent`:
     - `TypeName`: `"implementer"`
     - `Role`: `"Implementer — {NNN}_{name}"`
     - `Workspace`: `"inherit"`
     - `Prompt`: Pasa la ruta `specs/{NNN}_{name}/`, la rama activa, los parámetros de `kickstart.json` y las observaciones previas (si viene de una corrección de `reviewer`).
   - Si estás ejecutando directamente como `implementer`:
     - Lee `specs/{NNN}_{name}/tasks.md`, `requirements.md`, `design.md`, `docs/architecture.md` y `docs/conventions.md`.
     - Ejecuta cada task `T1..Tn` una a una en orden secuencial.
     - Escribe el código en `src/` y los tests en `tests/`.
     - Tras cada bloque de cambios, corre `dotnet build /warnaserror` y `dotnet test` con `run_command`.
     - Marca `[x]` la task completada en `specs/{NNN}_{name}/tasks.md` y en `progress/current.md`.
3. **Documenta la trazabilidad `R<n> ↔ Tests` en `progress/impl_{name}.md`**:
   - Incluye la tabla que mapea cada `R<n>` de `requirements.md` con el método de test concreto (`{TestClass}.{Método}_{Escenario}_{Resultado}`) que lo verifica.
4. **Verificación previa a revisión**:
   - `dotnet build /warnaserror` (0 errores, 0 warnings)
   - `dotnet format --verify-no-changes`
   - `dotnet test` (100% verde)
   - `dotnet list package --vulnerable` (0 vulnerabilidades)
