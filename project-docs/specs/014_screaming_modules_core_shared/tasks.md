# Plan de Tareas — INT-014: Screaming Architecture Modular en Modules, Core y Shared con Store Pub/Sub y Dual Persistence

## Metadatos
- **ID de Feature**: INT-014
- **Nombre**: `screaming_modules_core_shared`
- **Rama**: `feature/INT-014/screaming_modules_core_shared`
- **Tecnica**: SDD
- **Estado**: done
- **Fecha**: 2026-11-07

---

## Subtareas Jira DEV & QA

### [DEV] INT-014-DEV: Implementacion transversal modular en src/core, src/shared y src/modules

- [x] **Task 1: Nucleo Transversal y UI Base (`src/core/` y `src/shared/`)**
  - [x] 1.1 Implementar `src/core/store.js` con patron Observer/Pub-Sub reactivo (`getState`, `setState`, `subscribe`, `subscribeKey`, `resetState`).
  - [x] 1.2 Implementar `src/core/router.js` con soporte para rutas hash y query parameters defensivo ante entornos sin `window.addEventListener`.
  - [x] 1.3 Implementar `src/core/event-bus.js` para desacoplar la comunicacion entre modulos.
  - [x] 1.4 Implementar `src/core/api-client.js` con fallback inteligente a datos estaticos en modo `file:///`.
  - [x] 1.5 Implementar `src/shared/ui/Icons.js` con mas de 40 iconos vectoriales 100% SVG nativo (cero emojis).
  - [x] 1.6 Implementar `src/shared/utils/renderList.js` para renderizado declarativo funcional de colecciones.
  - [x] 1.7 Implementar `src/shared/ui/MasterLayout.js`, `PlaneSidebar.js`, `PlaneTopBar.js` y `OmniboxModal.js`.

- [x] **Task 2: Dominio de Tareas e Issues (`src/modules/Issues/`)**
  - [x] 2.1 Implementar `issue.service.js` con metodos CRUD y soporte dual REST / fallback.
  - [x] 2.2 Implementar `issue.store.js` con filtros reactivos (estado, prioridad, agente, texto) y selector de vista.
  - [x] 2.3 Implementar `IssueBoard.js` (Kanban agrupado por estado con tarjetas renderizadas via `renderList`).
  - [x] 2.4 Implementar `IssueList.js` (vista tabular compacta con badges e indicadores de progreso).
  - [x] 2.5 Implementar `IssueCard.js` e `IssueRow.js` atomicos y vectoriales.
  - [x] 2.6 Implementar `IssueDetailModal.js` accesible con User Story Scrum, EARS, subtareas Jira DEV/QA y Definition of Done.
  - [x] 2.7 Implementar `IssueControlsBar.js`, `IssueFilters.js`, `IssuesPage.js` y barril `src/modules/Issues/index.js`.

- [x] **Task 3: Dominios Complementarios (`src/modules/Projects/`, `Cycles/`, `Pages/`, `Harness/`)**
  - [x] 3.1 Implementar `src/modules/Projects/` (`project.service.js`, `project.store.js`, `ProjectCard.js`, `ProjectHeader.js`, `ProjectsPage.js`).
  - [x] 3.2 Implementar `src/modules/Cycles/` (`cycle.service.js`, `cycle.store.js`, `BurnDownChart.js` en SVG puro, `CycleCard.js`, `CyclesPage.js`).
  - [x] 3.3 Implementar `src/modules/Pages/` (`page.service.js`, `page.store.js`, `PageShelfTree.js`, `PageReader.js`, `DualMarkdownEditor.js`, `PagesPage.js`).
  - [x] 3.4 Implementar `src/modules/Harness/` (`harness.service.js`, `harness.store.js`, `AgentCard.js`, `AgentList.js`, `SkillSyncStatus.js`, `HarnessPage.js`).
  - [x] 3.5 Implementar barril central `src/modules/index.js` y recompilar `dist/app.bundle.js` con esbuild.

---

### [QA] INT-014-QA: Verificacion y Auditoria en 9 Niveles

- [x] **Task 4: Pruebas Unitarias de Arquitectura y Componentes**
  - [x] 4.1 Crear y ejecutar `project-docs/tests/unit/core-shared.test.js` (21 pruebas unitarias).
  - [x] 4.2 Crear y ejecutar `project-docs/tests/unit/issues.test.js` (11 pruebas unitarias).
  - [x] 4.3 Crear y ejecutar `project-docs/tests/unit/modules.test.js` (7 pruebas unitarias).
  - [x] 4.4 Verificar 66/66 pruebas unitarias en verde (`npm --prefix project-docs test`).
  - [x] 4.5 Auditar Zero Emojis en toda la base de codigo y documentacion.
  - [x] 4.6 Auditar pureza extrema de la raiz del proyecto (4 carpetas, 4 archivos).

- [x] **Task 5: Pruebas de Aceptacion Playwright y Verificacion Integral**
  - [x] 5.1 Ejecutar suite completa de aceptacion Playwright (14/14 pruebas en navegador Chromium real).
  - [x] 5.2 Capturar y registrar evidencias de ejecucion.
  - [x] 5.3 Ejecutar `bash project-docs/verify.sh` validando los 9 niveles en verde (Exit Code 0).
