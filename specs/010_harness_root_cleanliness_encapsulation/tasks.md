# Tasks: Encapsulamiento de Archivos y Limpieza de Raíz para Adopción del Arnés

## Resumen

- **Feature**: `harness_root_cleanliness_encapsulation` (ID: `10`)
- **Módulo**: `agent-orchestrator`
- **Técnica Recomendada**: `SDD` (Spec-Driven Development) — Reorganización de estructura, migración de módulos y scripts de infraestructura.
- **Responsable**: `leader` & `implementer` & `reviewer`
- **Total tareas**: 12
- **Completadas**: 12

---

## Subtareas Jira (Pistas DEV & QA)

### Subtarea DEV: `INT-010-DEV` — Encapsulamiento Técnico de Tooling en `project-docs/`
- **Asignado a**: `implementer`
- **Estado**: `done`
- [x] T1 — Mover `package.json`, `package-lock.json` y `playwright.config.js` a `project-docs/` y ajustar scripts y rutas relativas.
- [x] T2 — Mover `tests/` a `project-docs/tests/` y ajustar resolución de `ROOT_DIR` en cada suite de pruebas.
- [x] T3 — Mover `scripts/` a `project-docs/scripts/` y actualizar rutas de evidencias en `capture-evidence.js`.
- [x] T4 — Mover `kickstart.json` a `project-docs/kickstart.json` y actualizar `project-spec.yaml` y referencias.
- [x] T5 — Mover `ANTIGRAVITY.md` a `.agents/ANTIGRAVITY.md` y actualizar hipervínculos en `AGENTS.md` y `README.md`.
- [x] T6 — Actualizar `verify.sh` para usar `npm --prefix project-docs run <script>` de forma delegada.

### Subtarea QA: `INT-010-QA` — Validación de Pureza de Raíz, Ejecución Multinivel y Evidencias
- **Asignado a**: `reviewer`
- **Estado**: `done`
- [x] TC-01 — Validar que en la raíz del proyecto no quede ningún archivo de npm, tests ni configs secundarias.
- [x] TC-02 — Ejecutar compilación y bundling (`npm --prefix project-docs run build`) y verificar salida en `dist/app.bundle.js`.
- [x] TC-03 — Ejecutar suite completa de tests (unit, whitebox, blackbox, system, load) desde `project-docs/` (49 tests pasando).
- [x] TC-04 — Ejecutar pruebas de aceptación E2E con Playwright en Chrome headless (10 escenarios pasando).
- [x] TC-05 — Ejecutar `verify.sh` desde la raíz y verificar salida 100% verde sin advertencias.
- [x] TC-06 — Capturar screenshots de evidencia con `capture-evidence.js` y consolidar en `specs/010_harness_root_cleanliness_encapsulation/evidence/`.

---

## Tareas por Fases

### Fase 1: Preparación & Creación de Rama
- [x] 1.1 Crear y conmutar a la rama de trabajo `feature/INT-010/harness_root_cleanliness_encapsulation` ($\le 80$ caracteres).
- [x] 1.2 Verificar que el estado del working tree esté limpio y listo para refactorización.

### Fase 2: Implementación & Reubicación de Archivos
- [x] 2.1 Reubicar `package.json`, `package-lock.json` y `playwright.config.js` en `project-docs/`.
- [x] 2.2 Reubicar el directorio `tests/` en `project-docs/tests/` y ajustar imports/rutas en tests.
- [x] 2.3 Reubicar el directorio `scripts/` en `project-docs/scripts/` y ajustar rutas en `capture-evidence.js`.
- [x] 2.4 Reubicar `kickstart.json` a `project-docs/kickstart.json` y actualizar `project-spec.yaml`.
- [x] 2.5 Reubicar `ANTIGRAVITY.md` a `.agents/ANTIGRAVITY.md` y actualizar referencias en `AGENTS.md`.
- [x] 2.6 Actualizar `verify.sh` con `npm --prefix project-docs run ...`.
- [x] 2.7 Actualizar `.gitignore` para ignorar `project-docs/node_modules/` y `project-docs/test-results/`.

### Fase 3: Testing & Verificación Multinivel
- [x] 3.1 Probar `npm --prefix project-docs run build` y validar generación de bundle.
- [x] 3.2 Probar `npm --prefix project-docs test` (unit tests).
- [x] 3.3 Probar `npm --prefix project-docs run test:whitebox`, `test:blackbox`, `test:system`, `test:load`, `test:e2e`.
- [x] 3.4 Probar `npm --prefix project-docs run test:acceptance` (Playwright E2E con Chrome).
- [x] 3.5 Ejecutar `./verify.sh` completo y validar paso en verde de todas las 9 fases.

### Fase 4: Cierre, Documentación y Sincronización
- [x] 4.1 Generar capturas de pantalla de evidencia en `specs/010_harness_root_cleanliness_encapsulation/evidence/`.
- [x] 4.2 Redactar `specs/010_harness_root_cleanliness_encapsulation/evidence.md`.
- [x] 4.3 Ejecutar `node project-docs/sync-data.js` para sincronizar datos offline.
- [x] 4.4 Ejecutar skill `verify-spec` para reconciliar metadata (`feature_list.json`, `history.json`, `current.json`).
- [x] 4.5 Crear commit semántico `feat(harness): encapsulate tooling in project-docs and clean root directory`.
