# Plan de Tareas — INT-013: Screaming Architecture & Refactor Unificado Estilo Plane con CLI de Consulta Soberana

## Metadatos
- **ID de Feature**: INT-013
- **Nombre**: `screaming_architecture_plane_refactor`
- **Rama**: `feature/INT-013/screaming_architecture_plane_refactor`
- **Tecnica**: SDD
- **Estado**: done
- **Fecha**: 2026-11-07

---

## Subtareas Jira DEV & QA

### [DEV] INT-013-DEV: Screaming Architecture, Componentes Funcionales, UI Plane Unificada y CLI

- [x] **Task 1: Helper de Renderizado Funcional y Reorganización de Features**
  - [x] 1.1 Crear `src/shared/utils/renderList.js` para renderizado declarativo con `map` y manejo de estados vacíos.
  - [x] 1.2 Reorganizar `src/features/layout/` con `MasterLayout.js`, `PlaneSidebar.js`, `PlaneTopBar.js`, `PlaneControlsBar.js` y `OmniboxModal.js`.
  - [x] 1.3 Reorganizar `src/features/issues/` con `IssueRow.js`, `IssueCard.js`, `IssueDetailModal.js`, `IssueListView.js`, `IssueBoardView.js`, `IssueCalendarView.js` y `IssueSpreadsheetView.js`.
  - [x] 1.4 Reorganizar `src/features/cycles/` con `CyclesView.js`, `BurnDownChart.js` y `CycleCard.js`.
  - [x] 1.5 Reorganizar `src/features/modules/` con `ModulesView.js` y `ModuleCard.js`.
  - [x] 1.6 Reorganizar `src/features/pages/` con `PagesView.js`, `PageShelfTree.js`, `DynamicTOC.js` y `DualMarkdownEditor.js`.
  - [x] 1.7 Reorganizar `src/features/architecture/` con `ArchitectureView.js`, `C4DiagramViewer.js` y `TechStackTable.js`.
  - [x] 1.8 Reorganizar `src/features/graph/` con `DependencyGraphView.js` y `DependencyTreeView.js`.
  - [x] 1.9 Reorganizar `src/features/constellation/` con `Constellation3DView.js` manteniendo el ciclo de vida `mount`/`unmount` de Three.js.
  - [x] 1.10 Reorganizar `src/features/analytics/` con `AnalyticsView.js` y componentes de distribución de trabajo de agentes.

- [x] **Task 2: Punto de Entrada Unificado y Eliminación de Layout Legacy**
  - [x] 2.1 Actualizar `src/core/router.js` y `src/core/store.js` para gobernar las rutas unificadas de Plane (`issues`, `cycles`, `modules`, `pages`, `architecture`, `graph`, `constellation`, `analytics`).
  - [x] 2.2 Refactorizar `src/main.js` para renderizar únicamente el `MasterLayout` de Plane como experiencia por defecto.
  - [x] 2.3 Limpiar carpetas legacy obsoletas de `src/features/` garantizando Screaming Architecture pura.
  - [x] 2.4 Recompilar el bundle con esbuild y verificar tamaño y resolución de módulos.

- [x] **Task 3: Herramienta CLI Soberana (`project-docs/cli.js`)**
  - [x] 3.1 Implementar `project-docs/cli.js` conectada a SQLite (`node:sqlite`) y sincronización con disco para comandos `status`, `issue`, `cycle`, `module`, `page` y `sync`.
  - [x] 3.2 Añadir script `"cli": "node cli.js"` en `project-docs/package.json` para ejecución rápida con `npm run --prefix project-docs cli`.

---

### [QA] INT-013-QA: Pruebas Unitarias de Arquitectura, CLI y Aceptación Playwright

- [x] **Task 4: Pruebas Unitarias y de Integración**
  - [x] 4.1 Crear `project-docs/tests/unit/screaming-architecture.test.js` para auditar la estructura Screaming de cada feature.
  - [x] 4.2 Crear `project-docs/tests/unit/cli.test.js` para validar la ejecución de comandos y salidas de `cli.js`.
  - [x] 4.3 Validar Zero Emojis en código fuente, plantillas y CSS.
  - [x] 4.4 Validar pureza de raíz (4 carpetas, 4 archivos).

- [x] **Task 5: Pruebas de Aceptación Playwright y Verificación Integral**
  - [x] 5.1 Actualizar y expandir `project-docs/tests/acceptance/plane-views.spec.js` para validar la navegación integral de Plane (Issues, Cycles, Modules, Pages, Architecture C4, Graph, Constellation, Analytics).
  - [x] 5.2 Capturar evidencias fotográficas actualizadas en `project-docs/specs/013_screaming_architecture_plane_refactor/evidence/`.
  - [x] 5.3 Ejecutar `bash project-docs/verify.sh` validando los 9 niveles en verde (Exit Code 0).
