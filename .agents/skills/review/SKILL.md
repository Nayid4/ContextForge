---
name: review
description: >-
  Use this skill when the user invokes /review or asks to audit and verify the
  implementation of the active feature against its spec, R-to-Tests
  traceability, Clean Architecture rules, and .NET verification levels.
---

# `/review` — Auditar calidad, arquitectura y trazabilidad de la feature activa

Ejecuta la Fase 5 (Revisión) para la feature activa actuando con criterio de juez independiente según [docs/verification.md](../../../docs/verification.md) y [CHECKPOINTS.md](../../../CHECKPOINTS.md). **No edita código fuente ni tests.**

---

## Procedimiento

1. **Identifica la feature activa** en `feature_list.json` y su carpeta `specs/{NNN}_{name}/`.
2. **Delega o ejecuta el rol `reviewer`**:
   - Si estás en el agente `leader`, lanza el subagente `reviewer` mediante `invoke_subagent`:
     - `TypeName`: `"reviewer"`
     - `Role`: `"Reviewer — {NNN}_{name}"`
     - `Workspace`: `"inherit"`
     - `Prompt`: Solicita auditar `specs/{NNN}_{name}/`, `progress/impl_{name}.md`, `src/` y `tests/`, y escribir el informe en `progress/review_{name}.md`.
3. **Verificaciones obligatorias del `reviewer`**:
   - **Trazabilidad `R<n> ↔ Tests`**: comprobar que `progress/impl_{name}.md` mapea todos los `R<n>` de `specs/{NNN}_{name}/requirements.md` a tests reales en `tests/` con nomenclatura `<Método>_<Escenario>_<Resultado>`.
   - **Comandos de verificación (`run_command`)**:
     - `dotnet build /warnaserror`
     - `dotnet format --verify-no-changes`
     - `dotnet test`
     - `dotnet list package --vulnerable`
   - **Arquitectura y convenciones**:
     - Cumplimiento de `docs/architecture.md` (dependencias entre capas, Value Objects `sealed record`, Entidades `sealed class` con factory, Handlers `sealed class`).
     - Cumplimiento de `docs/conventions.md` (`Async` + `CancellationToken`, patrón `Result<T>`, tests con `// Arrange`, `// Act`, `// Assert`).
     - Ausencia total de `#pragma warning disable`, código muerto/comentado y secretos hardcodeados.
   - **Tasks**: todas las tasks en `specs/{NNN}_{name}/tasks.md` están marcadas `[x]`.
4. **Documenta el resultado en `progress/review_{name}.md`**:
   - Emite el veredicto explícito (`Aprobado` o `Rechazado`), la tabla de evidencia y, en caso de rechazo, la lista numerada de correcciones accionables para el `implementer`.
