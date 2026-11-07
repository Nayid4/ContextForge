# Especificacion de Diseño y Arquitectura — INT-012: Ingenieria Inversa Plane (Makeplane)

## Metadatos
- **ID de Feature**: INT-012
- **Nombre**: `plane_style_sqlite_project_management`
- **Estado**: spec_ready
- **Tecnica de Implementacion**: SDD
- **Modulo**: dashboard-visualizer
- **Fecha**: 2026-11-07

---

## 1. Decisiones de Arquitectura (ADRs)

### ADR-001: Persistencia Hibrida con SQLite (`node:sqlite`) y Espejo Markdown/JSON para Agentes IA
- **Contexto**:
  La plataforma requiere velocidad en consultas relacionales complejas (agrupación por estados, filtros multicriterio, relaciones padre-hijo, ordenamiento por prioridad y métricas de burn-down). A su vez, los agentes autónomos de IA (`leader`, `spec-author`, `implementer`, `reviewer`) interactúan de manera óptima leyendo y editando archivos Markdown (`.md`) y JSON estructurados directamente en el árbol de archivos sin requerir clientes de base de datos ni pools de conexión.
- **Decision**:
  Implementar una arquitectura de **persistencia hibrida de doble sincronizacion**:
  1. **SQLite (`project-docs/data/harness.db`)**: Base de datos relacional local gestionada mediante el módulo nativo `node:sqlite` de Node.js 24 (`import { DatabaseSync } from 'node:sqlite'`). Cero dependencias binarias externas (sin necesidad de node-gyp o C++ build tools).
  2. **Espejo Markdown y JSON**:
     - `project-docs/feature_list.json` se mantiene como fuente serializable de tareas y requerimientos.
     - `project-docs/knowledge/*.md` almacena los documentos de la base de conocimiento soberana.
     - `project-docs/specs/{NNN}_{name}/*.md` almacena las especificaciones formales (requirements, design, tasks, evidence).
  3. **Motor de Sincronizacion Bidireccional (`project-docs/src/core/sqlite-sync.js` y `sync-data.js`)**:
     - Al iniciar el servidor o ejecutar el build/sync, SQLite se alimenta de los archivos `.json` y `.md`.
     - Si se realiza una mutación vía la interfaz web (cambio de estado en el Kanban, creación de subtarea, edición de página), SQLite ejecuta la actualización relacional y automáticamente escribe los cambios al archivo `.json` o `.md` correspondiente en disco.
- **Consecuencias**:
  - Máxima velocidad y flexibilidad analítica en la interfaz web.
  - 100% de compatibilidad y máxima fidelidad semántica para los agentes de IA.
  - Control de versiones Git transparente sobre `.md` y `.json`.

---

### ADR-002: Modularizacion de Interfaz Screaming y Sistema de Vistas Inspirado en Plane
- **Contexto**:
  Plane destaca por una experiencia de usuario sumamente pulida, rápida y libre de fricción. Cuenta con un layout de 3 zonas principales:
  1. **Sidebar de Navegación**: Identificador de Workspace, selector de Proyectos, links rápidos a Issues, Cycles, Modules, Pages (Docs), Analytics y Ajustes.
  2. **TopBar & Controls**: Breadcrumbs, buscador Omnibox (`Ctrl+K`), selector de vistas (*List*, *Board/Kanban*, *Calendar*, *Spreadsheet*), botones de filtro (*Filter*), agrupación (*Group by: State, Priority, Assignee*), ordenación (*Order by*) y botón de nueva tarea.
  3. **Main Content Area**: El contenedor reactivo que renderiza la vista activa seleccionada.
- **Decision**:
  Estructurar el frontend en Vanilla JS con arquitectura Screaming en `project-docs/src/`:
  - `src/features/plane-layout/`:
    - `PlaneSidebar.js`: Barra lateral con switcher de proyectos, contadores reactivos e íconos SVG puros.
    - `PlaneTopBar.js`: Barra superior con breadcrumbs, search trigger, vista actual y selector de tema.
    - `PlaneControlsBar.js`: Selector de modo de vista (List, Board, Calendar, Spreadsheet), filtros desplegables y agrupación.
  - `src/features/plane-issues/`:
    - `IssueListView.js`: Vista de lista jerárquica con acordeones por estado/prioridad, badges de prioridad, badges de agente y avance de subtareas.
    - `IssueBoardView.js`: Tablero Kanban con columnas por Estado (*Backlog, Todo, In Progress, In Review, Done, Cancelled*), arrastre/clic de transición de estados y tarjetas con indicadores ricos.
    - `IssueCalendarView.js`: Vista cronológica de tareas con rangos de ejecución.
    - `IssueSpreadsheetView.js`: Vista tabular densa tipo Excel/Airtable con edición rápida.
    - `IssueDetailModal.js`: Drawer/modal detallado con descripción Markdown viva, selección de estado, prioridad, agente asignado, subtareas DEV/QA y evidencias.
  - `src/features/plane-cycles/`:
    - `CyclesView.js`: Gestión de ciclos/sprints con burn-down gráfico SVG interactivo y porcentaje de avance.
  - `src/features/plane-modules/`:
    - `ModulesView.js`: Visualización de Bounded Contexts y epics de arquitectura con progreso acumulado.
  - `src/features/plane-pages/`:
    - `PlanePagesView.js`: Base de conocimiento estilo Plane Pages/Notion, con árbol lateral de documentos, visor Markdown y vinculación a tareas.
  - `src/features/plane-analytics/`:
    - `AnalyticsView.js`: Panel de métricas con distribución de carga de trabajo por agente, ratio de defectos QA y velocidad de entrega.
- **Consecuencias**:
  - Código completamente modular, desacoplado y testeable.
  - Interfaz visualmente homogénea con Plane y Tailwind CSS v4.

---

### ADR-003: Esquema de Base de Datos Relacional SQLite

```sql
-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

-- States (Workflows)
CREATE TABLE IF NOT EXISTS states (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  group_name TEXT NOT NULL, -- backlog, unstarted, started, review, completed, cancelled
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Cycles (Sprints)
CREATE TABLE IF NOT EXISTS cycles (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL, -- upcoming, active, completed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Modules (Epics / Bounded Contexts)
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  lead_role TEXT,
  status TEXT NOT NULL, -- backlog, in_progress, completed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Issues (Work Items / Features)
CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY, -- e.g. INT-001, INT-012
  project_id TEXT NOT NULL,
  sequence_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  state_id TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'none', -- urgent, high, medium, low, none
  assignee_role TEXT, -- leader, spec-author, implementer, reviewer, qa-agent, human
  cycle_id TEXT,
  module_id TEXT,
  spec_folder TEXT,
  branch TEXT,
  user_story_as_a TEXT,
  user_story_i_want TEXT,
  user_story_so_that TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (state_id) REFERENCES states(id),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id),
  FOREIGN KEY (module_id) REFERENCES modules(id)
);

-- Subtasks (Jira DEV & QA Tasks)
CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY, -- e.g. INT-012-DEV, INT-012-QA-1
  issue_id TEXT NOT NULL,
  type TEXT NOT NULL, -- development, qa
  title TEXT NOT NULL,
  assignee_role TEXT,
  status TEXT NOT NULL, -- pending, in_progress, done, passed, failed
  sequence INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
);

-- Pages (Docs / Knowledge Base)
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  shelf TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  reading_time_min INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

---

### ADR-004: API REST en `serve.js` y Soporte Offline Transparente
- **Endpoints de la API Local (`serve.js`)**:
  - `GET /api/plane/data`: Devuelve el estado completo consolidado desde SQLite (o de fallback si no se usa servidor).
  - `GET /api/plane/issues`: Lista filtrada y paginada de issues con sub-tareas y estado.
  - `POST /api/plane/issues`: Crear nueva tarea (escribe en SQLite y actualiza `feature_list.json`).
  - `PATCH /api/plane/issues/:id`: Modificar estado, prioridad, ciclo o módulo de una tarea (persiste en SQLite y actualiza `feature_list.json`).
  - `GET /api/plane/cycles`: Lista de ciclos y burn-down acumulado.
  - `GET /api/plane/modules`: Lista de módulos y avance.
  - `GET /api/plane/pages`: Lista de documentos de la base de conocimiento y páginas.
  - `PUT /api/plane/pages/:id`: Guardar contenido Markdown de página (actualiza SQLite y escribe el archivo `.md` en disco).
- **Modo Offline (`file:///`)**:
  - El sistema detecta automáticamente con `detector.js` si está corriendo bajo protocolo `file:///`. En tal caso, lee `window.__DATA_FALLBACK__` y opera de forma idéntica en memoria con almacenamiento local (`localStorage`), manteniendo la experiencia 100% libre de errores.
