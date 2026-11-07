# Plan de Tareas (DEV & QA) — INT-017

## Subtarea DEV (`INT-017-DEV`)
- [x] T1: Añadir tablas `page_logs` y `page_labels` y columnas de telemetría en `project-docs/src/core/db.js` y `project-docs/src/core/sqlite-sync.js` (28 tablas).
- [x] T2: Ampliar `project-docs/cli.js` (`page upsert --locked --favorite --full-width --labels --module`) y `project-docs/serve.js` (`PUT/PATCH /api/plane/pages/:id`).
- [x] T3: Crear `PageNavigationPane.js` (4 pestañas: `Outline`, `Info`, `Assets`, `Historial`) y actualizar `PageShelfTree.js`, `PageReader.js`, `PagesPage.js` y `KnowledgeBase.js`.
- [x] T4: Actualizar `.opencode/skills/project-knowledge/SKILL.md` y propagar a `.github/skills/` y `.agents/skills/`.

## Subtarea QA (`INT-017-QA`)
- [x] QA1: Validar las 28 tablas SQLite, `extractPageTelemetryAndLogs` y `updatePagePropertiesInSQLite` en `sqlite-db.test.js`.
- [x] QA2: Validar `PageNavigationPane`, `enrichMarkdownWithSmartChips` y `renderPageHeaderActions` en `pages.test.js`.
- [x] QA3: Ejecutar el pipeline completo de 9 niveles en `project-docs/verify.sh`.
