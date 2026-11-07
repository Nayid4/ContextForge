# Diseno Tecnico y Decisiones Arquitectonicas (ADRs) — INT-014: Screaming Architecture Modular en Modules, Core y Shared

## Metadatos
- **ID de Feature**: INT-014
- **Nombre**: `screaming_modules_core_shared`
- **Rama**: `feature/INT-014/screaming_modules_core_shared`
- **Fecha**: 2026-11-07
- **Tecnica**: SDD

---

## 1. Arquitectura General y Screaming Domain Structure

El principio rector es **Screaming Architecture**: la organizacion del codigo grita el proposito del negocio y sus dominios funcionales principales.

```text
src/
├── core/                         # Infraestructura transversal y reactiva
│   ├── store.js                  # Almacen de estado reactivo Observer / Pub-Sub
│   ├── router.js                 # Enrutador cliente hash con extraccion de parametros
│   ├── event-bus.js              # Bus de eventos desacoplado entre dominios
│   ├── api-client.js             # Cliente HTTP con degradacion suave a modo offline
│   ├── db.js                     # Adaptador SQLite nativo (node:sqlite)
│   └── sqlite-sync.js            # Motor de sincronizacion bidireccional SQLite <-> MD/JSON
│
├── modules/                      # Dominios de Negocio (Screaming Architecture)
│   ├── Projects/                 # Dominio de Workspaces y Proyectos
│   │   ├── components/           # ProjectCard.js, ProjectHeader.js, ProjectSelector.js
│   │   ├── pages/                # ProjectsPage.js
│   │   ├── services/             # project.service.js
│   │   ├── store/                # project.store.js
│   │   └── index.js              # Interfaz publica del dominio
│   ├── Issues/                   # Dominio de Tareas e Issues
│   │   ├── components/           # IssueBoard.js, IssueList.js, IssueCard.js, IssueRow.js, IssueDetailModal.js, IssueControlsBar.js, IssueFilters.js
│   │   ├── pages/                # IssuesPage.js
│   │   ├── services/             # issue.service.js
│   │   ├── store/                # issue.store.js
│   │   └── index.js              # Interfaz publica del dominio
│   ├── Cycles/                   # Dominio de Sprints e Iteraciones
│   │   ├── components/           # BurnDownChart.js (SVG puro), CycleCard.js, CycleList.js
│   │   ├── pages/                # CyclesPage.js
│   │   ├── services/             # cycle.service.js
│   │   ├── store/                # cycle.store.js
│   │   └── index.js              # Interfaz publica del dominio
│   ├── Pages/                    # Dominio de Documentacion y Docs-as-Code
│   │   ├── components/           # PageShelfTree.js, PageReader.js, DualMarkdownEditor.js, KnowledgeBase.js
│   │   ├── pages/                # PagesPage.js
│   │   ├── services/             # page.service.js
│   │   ├── store/                # page.store.js
│   │   └── index.js              # Interfaz publica del dominio
│   ├── Harness/                  # Dominio del Arnes de Agentes y Gobernanza
│   │   ├── components/           # AgentCard.js, AgentList.js, SkillSyncStatus.js, HarnessOverview.js
│   │   ├── pages/                # HarnessPage.js
│   │   ├── services/             # harness.service.js
│   │   ├── store/                # harness.store.js
│   │   └── index.js              # Interfaz publica del dominio
│   └── index.js                  # Barril central exportador de todos los modulos
│
└── shared/                       # Componentes compartidos y utilidades sin logica de negocio
    ├── ui/                       # Icons.js (40+ SVG), Badge.js, BaseModal.js, MasterLayout.js, PlaneSidebar.js, PlaneTopBar.js, OmniboxModal.js
    └── utils/                    # renderList.js, dom.js, dates.js, markdown.js
```

---

## 2. Decisiones Arquitectonicas (ADRs)

### ADR-01: Modularidad Screaming en JavaScript Vanilla Puro
- **Contexto**: Se requiere evitar el acoplamiento cruzado de componentes y facilitar la comprension de la logica de negocio sin frameworks pesados (React, Vue, Angular).
- **Decision**: Cada dominio en `src/modules/` es autosuficiente con su propia capa de datos (`services/`), estado local (`store/`), componentes atomicos (`components/`) y pagina principal (`pages/`), exponiendo una API publica en `index.js`.
- **Consecuencias**: Alta cohesion, bajo acoplamiento, facilidad para pruebas unitarias aisladas y eliminacion de dependencias ciclicas.

### ADR-02: Patron Observer / Pub-Sub para Store Central y Modulares
- **Contexto**: La vista debe reaccionar ante cambios en el estado sin dependencias externas como Redux o MobX.
- **Decision**: Implementar `createStore()` nativo con `getState()`, `setState()`, `subscribe()` y `subscribeKey()` que notifica selectivamente a los suscriptores.
- **Consecuencias**: Rendimiento optimo, cero dependencias en tiempo de ejecucion y aislamiento de estado por clave.

### ADR-03: Enrutador Hash con Soporte para Query Parameters
- **Contexto**: Soporte para enlaces profundos y filtros en URL (por ejemplo `#issues?id=INT-001&view=board`) tanto en servidor HTTP como en modo `file:///`.
- **Decision**: `router.js` parsea el hash extrayendo la ruta base y un objeto de parametros usando `URLSearchParams`.
- **Consecuencias**: Permite compartir URLs con vistas y tareas especificas activas, manteniendo compatibilidad offline estricta.

### ADR-04: Iconografia 100% SVG Vectorial Pura (Cero Emojis)
- **Contexto**: Los emojis presentan variaciones graficas entre sistemas operativos y violan la identidad visual profesional.
- **Decision**: Toda la iconografia se consolida en `src/shared/ui/Icons.js` como funciones que retornan cadenas SVG nativas con `currentColor` y roles semanticos accesibles.
- **Consecuencias**: Consistencia estetica absoluta, compatibilidad dark/light theme nativa y cero caracteres emoji en el bundle.

### ADR-05: Persistencia Dual Determinista (SQLite WAL + Markdown en Disco)
- **Contexto**: Los agentes de IA operan de forma optima con archivos Markdown y JSON, mientras que la UI de gestion requiere consultas relacionales rapidas.
- **Decision**: SQLite relacional en `project-docs/data/harness.db` (modo WAL) para consultas estructuradas y sincronizacion bidireccional continua hacia `knowledge/` y `specs/`.
- **Consecuencias**: Los agentes y el CLI pueden leer directamente de disco o de SQLite sin inconsistencias.
