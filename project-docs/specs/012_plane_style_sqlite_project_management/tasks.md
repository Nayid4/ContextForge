# Plan de Tareas — INT-012: Ingenieria Inversa Plane (Makeplane)

## Metadatos
- **ID de Feature**: INT-012
- **Nombre**: `plane_style_sqlite_project_management`
- **Rama**: `feature/INT-012/plane_style_sqlite_project_management`
- **Tecnica**: SDD
- **Estado**: completed
- **Fecha**: 2026-11-07

---

## Subtareas Jira DEV & QA

### [DEV] INT-012-DEV: Implementacion del Motor SQLite y Vistas de Plane

- [x] **Task 1: Motor de Base de Datos SQLite Relacional (`node:sqlite`)**
  - [x] 1.1 Crear `project-docs/src/core/db.js` con inicialización del esquema SQLite (`workspaces`, `projects`, `states`, `cycles`, `modules`, `issues`, `subtasks`, `pages`).
  - [x] 1.2 Implementar `project-docs/src/core/sqlite-sync.js` para sincronización bidireccional entre SQLite y archivos `.md` / `.json`.
  - [x] 1.3 Integrar SQLite en `project-docs/sync-data.js` para que cada compilación sincronice la base de datos `project-docs/data/harness.db`.

- [x] **Task 2: Endpoints REST en `serve.js` para Plane**
  - [x] 2.1 Agregar rutas `GET /api/plane/data`, `GET /api/plane/issues`, `GET /api/plane/cycles`, `GET /api/plane/modules`, `GET /api/plane/pages`.
  - [x] 2.2 Agregar mutaciones `PATCH /api/plane/issues/:id` y `PUT /api/plane/pages/:id` con persistencia en SQLite y actualización inmediata en archivos `.json` y `.md`.

- [x] **Task 3: Componentes de Interfaz Plane (Vanilla JS + Tailwind v4)**
  - [x] 3.1 Crear `src/features/plane-layout/PlaneSidebar.js` y `PlaneTopBar.js` con estética minimalista de Plane.
  - [x] 3.2 Crear `src/features/plane-issues/IssueListView.js` con acordeones por estado/prioridad y badges de agente.
  - [x] 3.3 Crear `src/features/plane-issues/IssueBoardView.js` con columnas Kanban (*Backlog, Todo, In Progress, In Review, Done, Cancelled*).
  - [x] 3.4 Crear `src/features/plane-issues/IssueCalendarView.js` y `IssueSpreadsheetView.js` para vista de calendario y hoja de cálculo.
  - [x] 3.5 Crear `src/features/plane-cycles/CyclesView.js` con gráfico de burn-down y métricas de sprint.
  - [x] 3.6 Crear `src/features/plane-modules/ModulesView.js` para agrupar requerimientos por Bounded Contexts.
  - [x] 3.7 Crear `src/features/plane-pages/PlanePagesView.js` integrando la base de conocimiento Docs-as-Code estilo Plane Pages.
  - [x] 3.8 Crear `src/features/plane-issues/IssueDetailModal.js` para inspeccionar y transicionar tareas y subtareas DEV/QA.

- [x] **Task 4: Integracion en el Core del Frontend**
  - [x] 4.1 Conectar las vistas en `src/main.js` y actualizar el enrutador `src/core/router.js` y `store.js`.
  - [x] 4.2 Compilar el bundle con `npx esbuild src/main.js --bundle --outfile=dist/app.bundle.js --format=iife`.

---

### [QA] INT-012-QA: Suite de Pruebas y Aseguramiento de Calidad

- [x] **Task 5: Pruebas Unitarias y de Integracion**
  - [x] 5.1 Crear `project-docs/tests/unit/sqlite-db.test.js` para validar esquema SQLite, queries de agrupación y sincronización de archivos.
  - [x] 5.2 Validar Zero-Emoji Gate en código fuente y plantillas HTML.
  - [x] 5.3 Validar pureza de la raíz (4 carpetas, 4 archivos).

- [x] **Task 6: Pruebas de Aceptacion Playwright y Verificacion Integral**
  - [x] 6.1 Crear `project-docs/tests/acceptance/plane-views.spec.js` validando la navegación por List, Board, Cycles, Modules y Pages.
  - [x] 6.2 Capturar evidencias fotográficas en `project-docs/specs/012_plane_style_sqlite_project_management/evidence/`.
  - [x] 6.3 Ejecutar `bash project-docs/verify.sh` superando los 9 niveles con exit code 0.
