# Diseno Tecnico y Decisiones Arquitectonicas (ADRs) — INT-015: Eliminacion Total de Features y Consolidacion Screaming en Modules

## Metadatos
- **ID de Feature**: INT-015
- **Nombre**: `screaming_modules_plane_unification`
- **Rama**: `feature/INT-015/screaming_modules_plane_unification`
- **Fecha**: 2026-11-07
- **Tecnica**: SDD

---

## 1. Topologia Final del Frontend (Screaming Architecture Pura)

```text
src/
├── core/                         # Infraestructura transversal y reactiva
│   ├── store.js                  # Almacen de estado reactivo Observer / Pub-Sub y createStore() factory
│   ├── router.js                 # Enrutador cliente hash con extraccion de parametros
│   ├── event-bus.js              # Bus de eventos desacoplado entre dominios
│   ├── api-client.js             # Cliente HTTP con degradacion suave a modo offline
│   ├── db.js                     # Adaptador SQLite nativo (node:sqlite)
│   └── sqlite-sync.js            # Motor de sincronizacion bidireccional SQLite <-> MD/JSON
│
├── modules/                      # 10 Dominios de Negocio Canonicos (Screaming Architecture)
│   ├── Analytics/                # Metricas, velocidad y balance de carga de agentes
│   ├── Architecture/             # Modelado C4, diagramas Mermaid, stack tecnologico y metas
│   ├── Constellation/            # Visualizador 3D interactivo en Three.js con niveles piramidales
│   ├── Cycles/                   # Sprints, iteraciones y grafico burn-down SVG
│   ├── Graph/                    # Topologia de dependencias (DAG en malla y arbol jerarquico)
│   ├── Harness/                  # Orquestacion de agentes, skills y reglas de gobernanza
│   ├── Issues/                   # Gestion de tareas, filtros, vistas y modales Scrum/Jira/DoD
│   ├── Modules/                  # Bounded Contexts y Epics de arquitectura estilo Plane
│   ├── Pages/                    # Docs-as-Code, estantes editoriales y lector ContextForge
│   ├── Projects/                 # Workspaces, proyectos y selector de entorno
│   └── index.js                  # Barril central exportador de los 10 dominios
│
└── shared/                       # Componentes compartidos y utilidades agnosticas
    ├── ui/                       # Icons.js (40+ SVG), Badge, BaseModal, MasterLayout, Sidebar, TopBar, PlaneControlsBar, OmniboxModal
    └── utils/                    # renderList.js, dom.js, dates.js, markdown.js
```

---

## 2. Decisiones Arquitectonicas (ADRs)

### ADR-01: Erradicacion Definitiva de Directorios Hibridos (`features/`)
- **Decision**: Eliminar fisicamente `src/features/` y canalizar todas las dependencias a traves de `src/modules/` y `src/shared/ui/`.
- **Beneficio**: Elimina la ambiguedad arquitectonica y asegura que cualquier desarrollador o agente de IA identifique inmediatamente la frontera de cada dominio de negocio.

### ADR-02: Patron Modular Estandarizado (5 Archivos por Dominio)
- **Decision**: Cada dominio en `src/modules/<Domain>/` contiene estrictamente:
  - `components/`: Componentes atomicos de presentacion.
  - `pages/`: Pagina o vista principal de la funcionalidad.
  - `services/`: Capa de datos y logica de negocio.
  - `store/`: Estado reactivo local desacoplado via `createStore()`.
  - `index.js`: API publica del dominio.
- **Beneficio**: Predictibilidad total, facilidad para pruebas aisladas y composicion escalable.
