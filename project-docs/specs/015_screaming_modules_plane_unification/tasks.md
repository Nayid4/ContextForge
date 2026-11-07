# Plan de Tareas — INT-015: Eliminacion Total de Features y Consolidacion Screaming en Modules con Diseno Plane

## Metadatos
- **ID de Feature**: INT-015
- **Nombre**: `screaming_modules_plane_unification`
- **Rama**: `feature/INT-015/screaming_modules_plane_unification`
- **Tecnica**: SDD
- **Estado**: done
- **Fecha**: 2026-11-07

---

## Subtareas Jira DEV & QA

### [DEV] INT-015-DEV: Migracion modular de los 5 dominios restantes, eliminacion de features/ y unificacion en main.js

- [x] **Task 1: Migracion de Dominios Restantes a `src/modules/`**
  - [x] 1.1 Crear `src/modules/Architecture/` (`architecture.service.js`, `architecture.store.js`, `ArchitecturePage.js`, `index.js`).
  - [x] 1.2 Crear `src/modules/Graph/` (`graph.service.js`, `graph.store.js`, `DependencyGraph.js`, `DependencyTree.js`, `GraphPage.js`, `index.js`).
  - [x] 1.3 Crear `src/modules/Constellation/` (`constellation.service.js`, `constellation.store.js`, `SpaceView3D.js`, `ConstellationPage.js`, `index.js`).
  - [x] 1.4 Crear `src/modules/Analytics/` (`analytics.service.js`, `analytics.store.js`, `AnalyticsPage.js`, `index.js`).
  - [x] 1.5 Crear `src/modules/Modules/` (`module.service.js`, `module.store.js`, `ModuleCard.js`, `ModulesPage.js`, `index.js`).

- [x] **Task 2: Desacoplamiento de Componentes y Barriles**
  - [x] 2.1 Mudar `PlaneControlsBar.js` a `src/shared/ui/PlaneControlsBar.js` y exportar desde `src/shared/ui/index.js`.
  - [x] 2.2 Hacer nativo `KnowledgeBase.js` dentro de `src/modules/Pages/components/KnowledgeBase.js` eliminando el re-export hacia `features/`.
  - [x] 2.3 Actualizar `src/modules/index.js` exportando los 10 dominios de negocio.
  - [x] 2.4 Agregar `createStore()` funcional en `src/core/store.js` para almacenes reactivos aislados.

- [x] **Task 3: Refactorizacion de `src/main.js` y Eliminacion de `src/features/`**
  - [x] 3.1 Actualizar `src/main.js` para consumir vistas exclusivamente desde `src/modules/index.js` y `src/shared/ui/index.js`.
  - [x] 3.2 Eliminar fisicamente la carpeta `src/features/`.
  - [x] 3.3 Recompilar bundle `dist/app.bundle.js` con esbuild.

---

### [QA] INT-015-QA: Actualizacion de Tests y Verificacion Integral en 9 Niveles

- [x] **Task 4: Adaptacion de Suites de Prueba**
  - [x] 4.1 Actualizar `tests/unit/screaming-architecture.test.js` para certificar la no-existencia de `features/` y la presencia de los 10 modulos.
  - [x] 4.2 Actualizar `tests/e2e/atdd-frontend.test.js` para importar desde `src/modules/Architecture/` y `src/modules/Pages/`.
  - [x] 4.3 Ejecutar y certificar 66/66 pruebas unitarias (`npm --prefix project-docs test`).

- [x] **Task 5: Pruebas de Aceptacion Playwright y Verificacion Integral**
  - [x] 5.1 Ejecutar suite completa Playwright (14/14 pruebas en Chromium real headless en 34.5s).
  - [x] 5.2 Sincronizar datos y registrar evidencias.
  - [x] 5.3 Ejecutar `bash project-docs/verify.sh` validando los 9 niveles en verde (Exit Code 0).
