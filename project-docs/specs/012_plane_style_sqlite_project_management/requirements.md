# Especificacion de Requerimientos — INT-012: Ingenieria Inversa Plane (Makeplane) para Gestion de Tareas, Base de Conocimiento y SQLite con Copia Markdown

## Metadatos
- **ID de Feature**: INT-012
- **Nombre**: `plane_style_sqlite_project_management`
- **Titulo**: Ingenieria Inversa Plane: Gestion de Tareas Multi-Vista, Base de Conocimiento y SQLite con Copia Markdown
- **Rama Git**: `feature/INT-012/plane_style_sqlite_project_management`
- **Ruta de Spec**: `project-docs/specs/012_plane_style_sqlite_project_management`
- **Estado**: spec_ready
- **Tecnica de Implementacion**: SDD
- **Modulo**: dashboard-visualizer
- **Prioridad**: P0
- **Creado**: 2026-11-07

---

## 1. Contexto y Formulacion del Problema
El arnés actual cuenta con un tablero de seguimiento visual (`project-docs/index.html`) con una tabla de features, visor 3D Three.js, grafo de dependencias y base de conocimiento DeepWiki.
Sin embargo, para gestionar proyectos de software complejos con agentes autónomos de IA y equipos multidisciplinarios, se requiere un sistema de gestión de tareas y proyectos de nivel profesional inspirado en **Plane** (`makeplane/plane`), la plataforma open-source líder alternativa a Jira y Linear.

Las necesidades críticas son:
1. **Multi-vista de Tareas (Work Items)**:
   - Vista de Lista (List View) densa y jerárquica con estados, prioridades, sub-tareas y asignaciones a agentes o personas.
   - Tablero Kanban interactivo (Board View) organizado por Estados (*Backlog*, *Todo*, *In Progress*, *In Review*, *Done*, *Cancelled*) o por Prioridad.
   - Vista de Calendario / Cronograma (Calendar & Timeline/Gantt) para seguimiento temporal de iteraciones.
   - Vista de Hoja de Cálculo (Spreadsheet Table View) para visualización masiva rápida.
2. **Ciclos (Cycles / Sprints)**:
   - Gestión de iteraciones temporales fijas con métricas de burn-down, porcentaje de avance, fechas de inicio y fin.
3. **Módulos (Modules / Epics)**:
   - Agrupación temática de historias y tareas (Bounded Contexts / Módulos de arquitectura) con estado de entrega y responsable.
4. **Páginas / Docs (Knowledge Base & Specs estilo Plane Pages)**:
   - Documentación viva integrada (Docs-as-Code) en formato Markdown con navegación jerárquica, vinculación bidireccional entre documentos y tareas.
5. **Persistencia Híbrida: SQLite + Archivos Markdown (.md)**:
   - Los datos relacionales (entidades, relaciones foráneas, filtros dinámicos, agrupaciones) se gestionan en una base de datos SQLite local (`project-docs/data/harness.db`) utilizando el módulo nativo `node:sqlite` de Node.js 24 sin dependencias pesadas de compilación.
   - **Requisito Crítico para IA**: Los modelos de IA comprenden y procesan de forma más precisa y confiable archivos Markdown (`.md`) y JSON estructurados en el repositorio. Por ello, el sistema implementa una **sincronización bidireccional continua**: todo dato registrado en SQLite mantiene su contraparte sincronizada en archivos `.md` (`project-docs/knowledge/*.md`, `project-docs/specs/{NNN}_{name}/*.md`) y `.json` (`project-docs/feature_list.json`). Si un agente edita los `.md` o `.json`, SQLite se actualiza; si el usuario interactúa en la interfaz web, los archivos `.md` y `.json` se actualizan automáticamente.
6. **Stack y Restricciones Tecnológicas**:
   - JavaScript Vanilla (ES Modules, screaming architecture, modular).
   - Tailwind CSS v4 para estilizado moderno y minimalista estilo Plane (dark slate, borders sutiles, micro-interacciones, tipografía limpia).
   - Zero emojis en toda la interfaz, código, commits y documentación.
   - Raíz del proyecto 100% limpia (estrictamente 4 carpetas y 4 archivos canónicos).

---

## 2. Historias de Usuario

### US-1: Multi-vista de Tareas estilo Plane
**Como** desarrollador o líder de proyecto que trabaja con agentes de IA,  
**Quiero** visualizar las tareas y requerimientos del proyecto en múltiples vistas (Lista, Kanban, Calendario y Hoja de cálculo),  
**Para** supervisar el flujo de trabajo ágil con la misma experiencia y dinamismo que ofrece Plane.

### US-2: Gestión de Ciclos y Módulos
**Como** arquitecto de software o Scrum Master,  
**Quiero** organizar las tareas en Ciclos (Sprints) y Módulos (Epics/Bounded Contexts),  
**Para** medir la velocidad de entrega, controlar el burn-down y estructurar el alcance por componentes de arquitectura.

### US-3: Base de Conocimiento y Páginas Vinculadas (Plane Pages)
**Como** agente de IA o ingeniero de software,  
**Quiero** acceder a la base de conocimiento y especificaciones mediante un explorador de páginas jerárquico con editor Markdown integrado,  
**Para** consultar y actualizar las especificaciones y reglas de negocio manteniendo trazabilidad directa con las tareas.

### US-4: Persistencia Relacional SQLite con Copia Markdown para IA
**Como** sistema multi-agente,  
**Quiero** que la información relacional se almacene en SQLite y se sincronice en tiempo real con archivos `.md` y `.json`,  
**Para** que la interfaz web opere con consultas SQL ultrarrápidas y los agentes IA continúen leyendo y escribiendo directamente archivos Markdown con máxima fidelidad semántica.

---

## 3. Criterios de Aceptación (EARS)

### AC-01: Esquema Relacional SQLite (`node:sqlite`)
- **Dado** el servidor `serve.js` o el script de sincronización `sync-data.js` ejecutándose en Node.js 24,
- **Cuando** se inicializa el sistema,
- **Entonces** debe crearse y mantenerse la base de datos `project-docs/data/harness.db` con tablas: `workspaces`, `projects`, `states`, `cycles`, `modules`, `issues`, `subtasks`, `pages` y `relations`.

### AC-02: Sincronización Bidireccional SQLite <-> Markdown/JSON
- **Dado** un cambio en `project-docs/feature_list.json`, `project-docs/specs/` o `project-docs/knowledge/`,
- **Cuando** se ejecuta `node project-docs/sync-data.js` o se recibe una petición en el servidor,
- **Entonces** SQLite debe actualizar sus registros relacionales sin pérdida de datos.
- **Dado** una mutación desde la interfaz web (crear/actualizar estado de una tarea, agregar sub-tarea, editar página),
- **Cuando** se procesa la acción vía API,
- **Entonces** debe actualizarse SQLite e inmediatamente persistirse la copia correspondiente en los archivos `.json` y `.md` en disco.

### AC-03: Interfaz y UX Inspirada en Plane (Vanilla JS + Tailwind v4)
- **Dado** el usuario interactuando con `project-docs/index.html`,
- **Cuando** navega por la aplicación,
- **Entonces** debe disponer de:
  1. Barra lateral colapsable (Sidebar) con Workspace actual, Proyectos, accesos a Issues, Cycles, Modules, Pages (Docs) y Analytics.
  2. Barra superior con Breadcrumbs, buscador Omnibox (`Ctrl+K`), botón de tema y estado de sincronización SQLite.
  3. Selector de vistas para Issues: Lista, Kanban Board, Calendario/Gantt y Hoja de Cálculo.
  4. Selector de agrupación (*Group by State, Priority, Assignee*) y ordenación rápida.

### AC-04: Kanban Board con Columnas Dinámicas y Sub-tareas
- **Dado** la vista Tablero (Kanban Board),
- **Cuando** se cargan las tareas,
- **Entonces** deben agruparse en columnas correspondientes a los estados (*Backlog*, *Todo*, *In Progress*, *In Review*, *Done*, *Cancelled*), mostrando en cada tarjeta: ID, título, prioridad con badge distintivo, avatar/badge de agente asignado, barra de progreso de subtareas Jira DEV/QA e indicadores de evidencia.

### AC-05: Ciclos y Módulos Activos
- **Dado** la vista de Ciclos (Cycles),
- **Cuando** el usuario ingresa,
- **Entonces** debe visualizar los sprints activos, completados y futuros, con métricas de burn-down y porcentaje de avance.
- **Dado** la vista de Módulos (Modules),
- **Cuando** el usuario ingresa,
- **Entonces** debe ver las agrupaciones funcionales (ej. *Agent Orchestrator*, *Testing QA Suite*, *Knowledge Engine*) con su lista de requerimientos asociados.

### AC-06: Visor de Páginas (Plane Pages / Knowledge Base)
- **Dado** la vista de Páginas,
- **Cuando** se selecciona un documento,
- **Entonces** debe renderizarse el contenido Markdown con tabla de contenidos, badges de estante y soporte para edición o navegación con enlaces cruzados hacia tareas.

### AC-07: Respeto Estricto de Reglas del Arnés
- **Dado** el código fuente generado en `project-docs/src/`,
- **Cuando** se audita el proyecto,
- **Entonces**:
  1. La raíz del proyecto debe mantenerse limpia con exactamente 4 carpetas y 4 archivos.
  2. No debe haber ningún emoji unicode en código fuente, interfaz, documentación o tests (Zero-Emoji Gate).
  3. El 100% de los tests unitarios y suites de verificación deben pasar en verde sin regresiones.

---

## 4. Definición de Hecho (DoD)
- [ ] Esquema SQLite definido y probado con `node:sqlite`.
- [ ] Motor de sincronización bidireccional SQLite <-> Markdown/JSON probado.
- [ ] Endpoints de API REST en `project-docs/serve.js` implementados.
- [ ] Vistas de Plane implementadas en Vanilla JS con Tailwind v4.
- [ ] Suite de pruebas unitarias actualizada y superada (100% green).
- [ ] Pruebas de aceptación Playwright verificando las vistas.
- [ ] Evidencia fotográfica generada en `evidence/`.
- [ ] Verificación completa `project-docs/verify.sh` con exit code 0.
