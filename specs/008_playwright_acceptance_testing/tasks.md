# Checklist de Tareas de Implementación: INT-008

- [x] **T1** — Instalar y configurar `@playwright/test` creando `playwright.config.js` adaptado para ejecución headless local y CI.
- [x] **T2** — Desarrollar suite de Aceptación E2E Playwright (`tests/acceptance/`): navegación, biblioteca editorial, lector centrado, editor dual y omnibox modal.
- [x] **T3** — Desarrollar suite de Caja Blanca (`tests/whitebox/`): cobertura de bifurcaciones en `MarkdownViewer.js`, `store.js` y `sync-data.js`.
- [x] **T4** — Desarrollar suite de Caja Negra (`tests/blackbox/`): pruebas de valores límite (BVA), clases de equivalencia y payloads adversos.
- [x] **T5** — Desarrollar suite de Sistema e Integración (`tests/system/`): validación de paridad offline `file:///` y ciclo de vida de `serve.js`.
- [x] **T6** — Desarrollar suite de Carga y Concurrencia (`tests/load/`): medición de latencias p95/p99 y rendimiento (RPS).
- [x] **T7** — Configurar scripts npm (`test:acceptance`, `test:whitebox`, `test:blackbox`, `test:system`, `test:load`, `test:all`).
- [x] **T8** — Integrar la suite completa al script de verificación `verify.sh`.
- [x] **T9** — Generar reporte consolidado de auditoría en `project-docs/testing/report-acceptance-testing.md`.
- [x] **T10** — Sincronizar datos del tablero con `node project-docs/sync-data.js` y validar 100% de pruebas en verde.
