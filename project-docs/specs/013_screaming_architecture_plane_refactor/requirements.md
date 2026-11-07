# Especificacion de Requerimientos — INT-013: Screaming Architecture & Refactor Unificado Estilo Plane con CLI de Consulta Soberana

## Metadatos
- **ID de Feature**: INT-013
- **Nombre**: `screaming_architecture_plane_refactor`
- **Titulo**: Screaming Architecture & Refactor Unificado Estilo Plane con CLI de Consulta Soberana
- **Rama Git**: `feature/INT-013/screaming_architecture_plane_refactor`
- **Ruta de Spec**: `project-docs/specs/013_screaming_architecture_plane_refactor`
- **Estado**: spec_ready
- **Tecnica de Implementacion**: SDD
- **Modulo**: dashboard-visualizer
- **Prioridad**: P0
- **Creado**: 2026-11-07

---

## 1. Contexto y Formulacion del Problema
Tras la implementación inicial de las vistas de Plane y el motor SQLite en INT-012, el arnés dispone de dos layouts simultáneos (el clásico y el modo Plane).
Para alcanzar un nivel de madurez de ingeniería superior, escalable y profesional, el usuario solicita:

1. **Eliminar la dependencia del tablero clásico legacy**: La interfaz unificada y soberana de la aplicación debe ser directamente la inspirada en **Makeplane (Plane)**, integrando todas las capacidades existentes (C4 diagrams, grafo y árbol de dependencias, constelación 3D Three.js, base de conocimiento editorial) como vistas nativas dentro de la barra de navegación lateral de Plane.
2. **Screaming Architecture en el Frontend**: La estructura de carpetas en `project-docs/src/features/` debe "gritar" el propósito del negocio (`issues`, `cycles`, `modules`, `pages`, `architecture`, `graph`, `constellation`, `analytics`, `layout`). Cada feature debe encapsular sus propios componentes UI, vistas principales y funciones auxiliares, evitando el acoplamiento técnico disperso.
3. **Componentes Funcionales y Bucles de Generación Repetitiva (Vanilla JS)**: Replicar el paradigma declarativo y componible (similar a React o Vue) pero en **100% JavaScript Vanilla**, empleando funciones puras de renderizado, bucles funcionales con `map()`, interpolación limpia y composición jerárquica libre de efectos secundarios descontrolados.
4. **Voz y Diseño UI/UX Coherente**: Unificación visual estricta en toda la plataforma: paleta dark slate, bordes con transparencias sutiles (`border-zinc-800`), micro-interacciones, tipografía Mono/Sans pulida, soporte de modo oscuro/claro y **cero emojis** garantizados en toda la interfaz.
5. **Herramienta CLI de Consulta y Manipulación Soberana (`project-docs/cli.js`)**: Los agentes autónomos de IA, las skills (`project-status`, `sdd-workflow`) y el desarrollador desde terminal deben poder consultar y manipular la base de tareas, estados, ciclos y páginas Markdown/SQLite de forma inmediata mediante comandos CLI limpios (`node project-docs/cli.js issue list`, `node project-docs/cli.js issue get <id>`, `node project-docs/cli.js page list`, `node project-docs/cli.js cycle current`).
6. **Mantenimiento del Espejo Bidireccional SQLite <-> Markdown**: Todo cambio realizado desde la CLI, la UI o la edición directa de archivos `.md` / `.json` se mantiene en continua sincronización mediante `sqlite-sync.js`.

---

## 2. Historias de Usuario (Scrum)

### US-1: Experiencia Unificada de Gestión de Proyectos Estilo Plane
**Como** desarrollador y líder técnico que opera con agentes de IA,  
**Quiero** que el tablero de seguimiento sea una experiencia única y nativa inspirada en Plane sin saltos ni dependencias de interfaces legacy,  
**Para** supervisar en un solo entorno profesional mis tareas, ciclos de sprint, módulos de arquitectura, diagramas C4 y constelación 3D.

### US-2: Frontend Modular con Screaming Architecture y Componentes Repetitivos
**Como** ingeniero de frontend,  
**Quiero** que cada dominio de negocio en `src/features/` esté modularizado con su propia estructura de `components/`, `views/` y `helpers/` usando bucles de renderizado declarativos,  
**Para** extender, mantener y testear cada funcionalidad de forma aislada sin acoplamientos técnicos.

### US-3: CLI Soberana para Agentes de IA y Terminal
**Como** agente de IA autónomo o desarrollador en consola,  
**Quiero** invocar `node project-docs/cli.js` para consultar el estado del proyecto, inspeccionar requerimientos, listar tareas por ciclo y actualizar estados,  
**Para** no depender de parsers frágiles y operar con rapidez tanto en chat como en visualización.

---

## 3. Criterios de Aceptacion (EARS)

- **AC-01 (Screaming Architecture Estricta)**:
  - *Cuando* se inspecciona la estructura `project-docs/src/features/`,
  - *El sistema debe* organizar las carpetas por dominios de negocio: `issues/`, `cycles/`, `modules/`, `pages/`, `architecture/`, `graph/`, `constellation/`, `analytics/`, `layout/`.
  - Cada carpeta de feature debe contener sus submódulos de componentes reutilizables y vista principal.

- **AC-02 (Bucles de Renderizado Funcional en Vanilla JS)**:
  - *Cuando* se renderizan listas repetitivas (tarjetas de tareas, columnas de Kanban, ítems de páginas, métricas, nodos de grafo o estantes),
  - *El sistema debe* utilizar funciones de componente puras y bucles declarativos `items.map(item => Component(item)).join('')`.

- **AC-03 (Interfaz Unificada Soberana Estilo Plane)**:
  - *Cuando* el usuario o los tests de aceptación ingresan a `project-docs/index.html` (con o sin hash),
  - *El sistema debe* cargar por defecto el layout soberano de Plane con su barra lateral colapsable, switcher de proyectos, breadcrumbs y selector de vistas.
  - La barra lateral debe ofrecer acceso directo a:
    1. *Work Items* (Issues con vistas Lista, Kanban, Calendario y Hoja de cálculo).
    2. *Cycles* (Sprints con gráfico burn-down).
    3. *Modules* (Epics / Bounded Contexts).
    4. *Pages* (Base de Conocimiento y Docs-as-Code).
    5. *Architecture* (Diagramas C4 C1/C2/C3 y tabla técnica del stack).
    6. *Dependency Graph & Tree* (Grafo interactivo y árbol jerárquico SVG).
    7. *3D Constellation* (Constelación piramidal Three.js con ciclo de vida mount/unmount).
    8. *Analytics* (Métricas de velocidad, carga de trabajo por agente y distribución de prioridades).

- **AC-04 (Mejora Gráfica Vectorial y UI/UX Coherente)**:
  - *Cuando* se visualizan gráficos (burn-down, diagramas Mermaid, visualizador 3D, barras de progreso),
  - *El sistema debe* utilizar el mismo sistema de diseño (tokens de color Tailwind v4, tipografía uniforme, bordes sutiles y ausencia absoluta de emojis).

- **AC-05 (CLI Soberana `node project-docs/cli.js`)**:
  - *Cuando* se ejecuta `node project-docs/cli.js <command>` desde consola o script de agente,
  - *El sistema debe* soportar los siguientes comandos con salida formateada (tabla limpia o `--json`):
    - `issue list [--state <state>] [--priority <priority>] [--cycle <id>] [--json]`
    - `issue get <id>`
    - `issue update <id> --state <state>`
    - `cycle list`
    - `cycle current`
    - `module list`
    - `page list`
    - `page get <slug>`
    - `status` (resumen integral KPI para agentes)
    - `sync` (ejecuta sincronización bidireccional SQLite <-> Markdown/JSON)

- **AC-06 (Compatibilidad con Agentes y Skills)**:
  - *Cuando* los agentes autónomos consultan el estado del proyecto,
  - *El sistema debe* permitir el uso de la CLI o la lectura directa de los archivos Markdown y JSON sincronizados con SQLite.

- **AC-07 (Cero Emojis y Pureza de Raíz)**:
  - *El sistema debe* mantener 0 emojis unicode en todo el código fuente, HTML, CSS, pruebas y documentación.
  - La raíz del proyecto debe mantener exactamente 4 directorios (`.agents/`, `.github/`, `.opencode/`, `project-docs/`) y 4 archivos (`AGENTS.md`, `opencode.json`, `README.md`, `.gitignore`).

- **AC-08 (Verificación Integral Exitosa)**:
  - *El sistema debe* superar el 100% de las pruebas unitarias, de integración, de caja blanca, de caja negra, de carga, de aceptación Playwright y los 9 niveles de `verify.sh` con código de salida 0.

---

## 4. Definicion de Listo (DoR)
- [x] Contexto técnico y justificación de Screaming Architecture documentados.
- [x] Criterios de aceptación EARS y alcance de refactorización definidos.
- [x] Comando CLI para agentes y desarrollador planificado en detalle.
- [x] Restricciones arquitectónicas (Pureza de raíz, Zero Emojis, SQLite + Markdown) validadas.

## 5. Definicion de Terminado (DoD)
- [ ] Estructura `project-docs/src/features/` reorganizada bajo Screaming Architecture pura.
- [ ] Componentes funcionales y bucles de renderizado implementados en todos los dominios.
- [ ] Experiencia visual unificada bajo Plane layout como vista primaria.
- [ ] CLI `project-docs/cli.js` implementada y testeada.
- [ ] Suite de pruebas Playwright actualizada para validar la navegación completa por todas las vistas integradas.
- [ ] Suite de pruebas unitarias cubriendo la CLI y los componentes refactorizados.
- [ ] `bash project-docs/verify.sh` ejecutado exitosamente con 9 niveles en verde (Exit code 0).
- [ ] Evidencias de capturas fotográficas actualizadas en `evidence/`.
- [ ] Commit semántico creado en la rama de la feature.
