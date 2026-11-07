---
name: review
description: >-
  Use this skill when the user invokes /review or asks to audit and verify the
  implementation of the active feature against its spec, R-to-Tests
  traceability, architecture rules, and verification levels.
---

# `/review` — Auditar calidad, arquitectura y trazabilidad de la feature activa

Ejecuta la Fase 5 (Revisión) para la feature activa actuando con criterio de juez independiente según `project-docs/knowledge/` y la especificación en `project-docs/specs/{NNN}_{name}/`. **No edita código fuente ni tests.**

---

## Procedimiento

1. **Identifica la feature activa** en `project-docs/feature_list.json` y su carpeta `project-docs/specs/{NNN}_{name}/`.
2. **Delega o ejecuta el rol `reviewer`**:
   - Si estás en el agente `leader`, lanza el subagente `reviewer` mediante `invoke_subagent`:
     - `TypeName`: `"reviewer"`
     - `Role`: `"Reviewer — {NNN}_{name}"`
     - `Workspace`: `"inherit"`
     - `Prompt`: Solicita auditar `project-docs/specs/{NNN}_{name}/`, `project-docs/progres/impl_{name}.md`, y escribir el informe en `project-docs/progres/review_{name}.md`.
3. **Verificaciones obligatorias del `reviewer`**:
   - **Trazabilidad `R<n> <-> Tests`**: comprobar que `project-docs/progres/impl_{name}.md` mapea todos los `R<n>` de `project-docs/specs/{NNN}_{name}/requirements.md` a tests reales.
   - **Comandos de verificación (`run_command`)**:
     - Ejecuta los comandos definidos en `project-docs/project-spec.yaml` (`checks.build`, `checks.test`, `checks.verify` o `bash project-docs/verify.sh`).
   - **Arquitectura y convenciones**:
     - Cumplimiento de `project-docs/knowledge/` (coding-standards, business-rules, diagramas).
     - Ausencia total de código muerto/comentado, secretos hardcodeados y emojis.
   - **Tasks**: todas las tasks en `project-docs/specs/{NNN}_{name}/tasks.md` están marcadas `[x]` (incluyendo subtareas Jira DEV y QA).
   - **Evidencias visuales**: capturas de pantalla reales en `project-docs/specs/{NNN}_{name}/evidence/` y documento `evidence.md`.
4. **Documenta el resultado en `project-docs/progres/review_{name}.md` y envía al Modelo Plane SQLite + Markdown**:
   - Emite el veredicto explícito (`Aprobado` o `Rechazado`), la tabla de evidencia y, en caso de rechazo, la lista numerada de correcciones accionables para el `implementer`.
   - Persiste el dictamen y las evidencias en `project-docs/data/harness.db` (`issue_evidences`, `issue_comments`, `ai_runs`):
     ```bash
     node project-docs/cli.js issue evidence INT-{NNN} --type verification-report --title "Auditoria Independiente Reviewer (review_{name}.md)" --file "project-docs/progres/review_{name}.md" --skill review
     node project-docs/cli.js ai log --skill review --role reviewer --issue INT-{NNN} --type INDEPENDENT_QA_REVIEW --summary "Auditoria independiente de calidad, arquitectura Screaming y evidencias QA" --artifacts "project-docs/progres/review_{name}.md"
     node project-docs/sync-data.js
     ```
