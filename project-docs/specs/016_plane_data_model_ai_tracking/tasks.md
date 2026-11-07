# Checklist de Subtareas Scrum (Jira Style): 016 — Plane Data Model & AI Tracking

- **Feature**: `plane_data_model_ai_tracking` (ID: `INT-016`)
- **Rama**: `feature/INT-016/plane_data_model_ai_tracking`
- **Estado**: `Done`

## Subtarea DEV: INT-016-DEV — Implementación del Modelo Relacional Plane (26 Tablas), CLI, API, UI y Skills
- **Asignado a**: `implementer`
- **Estado**: `done`

- [x] T1 — Expandir `project-docs/src/core/db.js` con las 26 tablas del modelo de datos de Plane e IA y migración segura `ensureColumn`. Cubre: R1, R4.
- [x] T2 — Expandir `project-docs/src/core/sqlite-sync.js` con semillas de agentes bot (`is_bot=1`), `api_tokens`, `ai_configs`, `labels`, `estimates`, `issue_types`, `issue_views`, relaciones, evidencias, `ai_runs` y espejo `knowledge/ai-runs-log.md`. Cubre: R1, R2.
- [x] T3 — Ampliar `project-docs/cli.js` y `project-docs/serve.js` con comandos y endpoints para `issue create`, `issue evidence`, `issue comment`, `issue relate`, `issue activity`, `ai log`, `ai list`, `page upsert` y `user list`. Cubre: R2.
- [x] T4 — Actualizar `IssueDetailModal.js`, `AiEngineMonitor.js`, `HarnessPage.js` y `main.js` para visualizar etiquetas, puntos Fibonacci, relaciones, evidencias QA, configuraciones IA, tokens bot y bitácora de ejecuciones IA. Cubre: R3.
- [x] T5 — Actualizar las 21 skills SDD en `.opencode/skills/` y propagarlas a `.github/skills/` y `.agents/skills/` junto con `.agents/agents/` para enviar toda información, evidencia y reporte al proyecto. Cubre: R2.

---

## Subtarea QA: INT-016-QA — Validación Multinivel, Suite SQLite/CLI y Evidencias Playwright
- **Asignado a**: `reviewer`
- **Estado**: `done`

- [x] TC-01 — Validar creación y poblado de las 26 tablas relacionales en `tests/unit/sqlite-db.test.js`. Cubre: R1, R4.
- [x] TC-02 — Validar comandos CLI de IA, usuarios bot, etiquetas y evidencias en `tests/unit/cli.test.js`. Cubre: R2.
- [x] TC-03 — Validar paridad triple de las 21 skills entre `.opencode/skills/`, `.github/skills/` y `.agents/skills/`. Cubre: R2.
- [x] TC-04 — Ejecutar `bash project-docs/verify.sh` superando los 9 niveles de calidad (Build, Unit, Smoke, Whitebox, Blackbox, System, Load, Playwright E2E, Sync) y registrar evidencias. Cubre: R1, R2, R3, R4.
