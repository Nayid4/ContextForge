# Checklist de Tareas de Implementación: INT-001

- [x] **T1** — Auditar y reescribir `project-spec.yaml` y `project-spec.json` con la arquitectura real del arnés SDD.
- [x] **T2** — Desacoplar `.agents/agents/implementer.md` y `.agents/agents/reviewer.md` para ser 100% stack-agnósticos.
- [x] **T3** — Actualizar `kickstart.json` con template universal multi-lenguaje.
- [x] **T4** — Reemplazar `feature_list.json` eliminando tareas dummy de e-commerce y definiendo el backlog real del arnés.
- [x] **T5** — Crear `package.json` con scripts de compilación, sincronización y testing.
- [x] **T6** — Implementar suite de pruebas unitarias (`tests/unit/markdown-parser.test.js`, `tests/unit/sync-data.test.js`, `tests/unit/branching-rules.test.js`).
- [x] **T7** — Implementar prueba de aceptación funcional tipo smoke (`tests/e2e/dashboard-smoke.test.js`).
- [x] **T8** — Ejecutar pruebas (`npm test`) y verificar pase 100% en verde.
- [x] **T9** — Sincronizar datos del tablero con `node project-docs/sync-data.js` y regenerar bundle.
- [x] **T10** — Generar reporte de auditoría de calidad con `reviewer` y reconciliar metadata.
