# Tareas de Implementación y QA — INT-019

## Subtarea DEV (`INT-019-DEV`)
- [x] Implementar `BR-PAGE-01`..`BR-PAGE-06` en `db.js`, `sqlite-sync.js`, `serve.js` y `cli.js`.
- [x] Extender `page.service.js` y `page.store.js` con soporte para `Public`/`Private`/`Archived`, `orderBy`, `sortBy`, `archivePage`, `restorePage` y `duplicatePage`.
- [x] Refactorizar `KnowledgeBase.js`, `PagesPage.js` y `main.js` con `PagesListHeaderRoot`, `PageOrderByDropdown`, `PageFiltersSelection`, `PageAppliedFiltersList`, `BlockItemAction`, menú contextual `...`, `ExportPageModal` y `#article-status-banner`.
- [x] Actualizar `.opencode/skills/project-knowledge/SKILL.md` y sincronizar hacia `.github/skills/` y `.agents/skills/`.

## Subtarea QA (`INT-019-QA`)
- [x] Añadir suite `Plane Library Business Rules Suite (BR-PAGE-01..06)` y `Plane Library UI/UX Suite` en `project-docs/tests/unit/pages.test.js`.
- [x] Ejecutar `project-docs/verify.sh` validando los 9 niveles de verificación sin regresiones y 0 emojis.
