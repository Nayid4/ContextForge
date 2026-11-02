# project-docs — Documentación y Tablero Visual de Seguimiento de IA

> Plantilla de documentación y tablero interactivo del proyecto. Contiene las especificaciones, el seguimiento de avance del agente y la visualización por grafo, árbol y 3D.

## Estructura

- `feature_list.json` — Features y bugfixes del proyecto con status (`pending`, `spec_ready`, `in_progress`, `done`, `blocked`), tipos (`feature` o `bugfix`), prioridad y rama Git asignada bajo el formato `{type}/INT-{id}/{name}` (máx 80 caracteres).
- `index.html` — Shell de la aplicación SPA del tablero de visualización. Usa **Tailwind CSS v4** (`@tailwindcss/browser@4`) y Three.js.
- `src/` — Código fuente del tablero bajo **Arquitectura Screaming** en **Vanilla JS** (ES Modules sin bundler):
  - `core/`: Store reactivo (`store.js`), API fetcher (`api.js`), Router por hash (`router.js`).
  - `shared/`: Componentes comunes reutilizables (`Badge.js`, `Button.js`, `Icons.js`, `Modal.js`).
  - `features/`: Módulos por dominio de negocio:
    - `stats/`: Métricas y KPI cards (`StatsSummary.js`).
    - `current-spec/`: Tarjeta interactiva del spec en curso (`CurrentSpecCard.js`).
    - `feature-list/`: Tabla, filtros en tiempo real y paginación (`FeatureTable.js`, `FeatureFilters.js`, `FeaturePagination.js`).
    - `dependency-graph/`: Grafo de dependencias y análisis de bloqueos (`DependencyGraph.js`).
    - `dependency-tree/`: Árbol jerárquico SVG con zoom y pan (`DependencyTree.js`).
    - `space-view-3d/`: Constelación 3D en Three.js con ciclo de vida `mount`/`unmount` (`SpaceView3D.js`).
    - `history-timeline/`: Línea de tiempo cronológica de auditoría (`HistoryTimeline.js`).
- `progres/current.json` — Spec activo (`{}` = sin spec en proceso).
- `progres/history.json` — Historial de specs cerrados (`records[]`).
- `<module>/specs/<NNN>-<feature>/` — Specs técnicos por feature (`spec.md`, `tasks.md`, `decisions.md`), creados por `generate-spec`.
- `<module>/tests-plan/` — Planes de pruebas API (markdown + `.http`), creados por `api-test-plan`.
