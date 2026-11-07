# Tasks: Encapsulamiento Completo de Specs, verify.sh y project-spec.yaml en project-docs/

## Subtareas Jira (DEV & QA)

### Subtarea DEV: `INT-011-DEV` — Reubicación y Actualización de Agentes y Skills
- [x] T1 — Mover `specs/` a `project-docs/specs/`.
- [x] T2 — Mover `project-spec.yaml` a `project-docs/project-spec.yaml`.
- [x] T3 — Mover `verify.sh` a `project-docs/verify.sh` y adaptar auto-resolución de `SCRIPT_DIR`.
- [x] T4 — Actualizar agentes en `.agents/agents/` (`leader.md`, `spec-author.md`, `implementer.md`, `reviewer.md`).
- [x] T5 — Actualizar skills en `.opencode/skills/` (fuente de verdad) y sincronizar a `.github/skills/` y `.agents/skills/`.
- [x] T6 — Actualizar `AGENTS.md`, `.agents/ANTIGRAVITY.md` y `project-docs/project-spec.json`.

### Subtarea QA: `INT-011-QA` — Verificación Multinivel y Pureza Extrema
- [x] TC-01 — Validar que en la raíz del proyecto queden exclusivamente 4 carpetas y 4 archivos.
- [x] TC-02 — Ejecutar `project-docs/verify.sh` completo y validar que los 9 pasos pasen en verde (exit code 0).
- [x] TC-03 — Validar que la sincronización triple de skills tenga 100% de paridad.
- [x] TC-04 — Generar evidencias y actualizar reportes.
