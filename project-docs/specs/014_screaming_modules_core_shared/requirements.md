# Especificacion de Requerimientos — INT-014: Screaming Architecture Modular en Modules, Core y Shared con Store Pub/Sub y Dual Persistence

## Metadatos
- **ID de Feature**: INT-014
- **Nombre**: `screaming_modules_core_shared`
- **Titulo**: Screaming Architecture Modular en Modules, Core y Shared con Store Pub/Sub y Dual Persistence
- **Rama Git**: `feature/INT-014/screaming_modules_core_shared`
- **Ruta de Spec**: `project-docs/specs/014_screaming_modules_core_shared`
- **Estado**: done
- **Tecnica de Implementacion**: SDD
- **Modulo**: dashboard-visualizer
- **Prioridad**: P0
- **Creado**: 2026-11-07

---

## 1. Contexto y Formulacion del Problema
Tras la unificacion inicial del tablero con estetica Plane en INT-013, se requiere formalizar y desacoplar la arquitectura frontend siguiendo una estricta **Screaming Architecture orientada a dominios de negocio** en `src/modules/` (`Projects`, `Issues`, `Cycles`, `Pages`, `Harness`), un nucleo transversal en `src/core/` y componentes compartidos sin logica de negocio en `src/shared/`.

El arnes debe permitir que:
1. **Cada dominio de negocio** en `src/modules/<Domain>/` encapsule sus propios componentes UI, vistas/paginas, servicios de datos, estado reactivo local y un barril `index.js` como interfaz publica.
2. **El nucleo transversal** (`src/core/`) proporcione un store reactivo Observer/Pub-Sub (`store.js`), un enrutador hash cliente con soporte de parametros de URL (`router.js`), un bus de eventos desacoplado (`event-bus.js`) y un cliente HTTP resiliente con resolucion de modo offline (`api-client.js`).
3. **La capa compartida** (`src/shared/`) provea componentes UI agnosticos (iconos 100% SVG nativo, MasterLayout, Sidebar, TopBar, Omnibox, badges, modales base) y utilidades de renderizado funcional (`renderList.js`).
4. **Persistencia Dual**: Soporte integral para SQLite relacional WAL (`harness.db`) con respaldo bidireccional en archivos Markdown en disco (`knowledge/` y `specs/`) e ingesta automatica en `data-fallback.js`.
5. **Calidad y Restricciones del Arnes**: Cero emojis unicode en toda la base de codigo y documentacion, pureza absoluta en la raiz del repositorio (4 carpetas, 4 archivos) y verificacion en 9 niveles sin regresiones.

---

## 2. Historias de Usuario (Scrum)

### US-1: Modularidad Screaming en Dominios de Negocio
**Como** desarrollador frontend y mantenedor del arnes,  
**Quiero** que la estructura de carpetas de `src/modules/` exprese de forma explicita los conceptos de negocio (Projects, Issues, Cycles, Pages, Harness),  
**Para** que cualquier cambio de logica, vista o estado de un dominio quede estrictamente encapsulado sin alterar los demas modulos.

### US-2: Reactividad Pub-Sub y Enrutamiento con Parametros
**Como** usuario del tablero de seguimiento y agente de IA,  
**Quiero** navegar mediante rutas hash con parametros (como `#issues?id=INT-001&view=board`) y contar con un store observable Pub-Sub,  
**Para** interactuar con filtros dinamicos, aperturas de modales profundos y sincronizaciones en tiempo real sin recarga de pagina.

### US-3: Iconografia Vectorial Pura y Cero Emojis
**Como** equipo de ingenieria y auditor de accesibilidad,  
**Quiero** una libreria integral de mas de 40 iconos vectoriales 100% SVG nativos con atributos de accesibilidad,  
**Para** garantizar una experiencia visual profesional consistente y la total ausencia de caracteres emoji.

---

## 3. Criterios de Aceptacion (EARS)

### Ubiquitous (Requerimientos Universales)
- **EARS-UB-01**: El sistema debe estructurar los modulos de negocio en `src/modules/Projects/`, `src/modules/Issues/`, `src/modules/Cycles/`, `src/modules/Pages/`, `src/modules/Harness/` y exportarlos mediante un barril central `src/modules/index.js`.
- **EARS-UB-02**: El sistema debe mantener cero emojis en codigo fuente, plantillas de texto, logs, CSS y documentacion.
- **EARS-UB-03**: El repositorio debe preservar estrictamente 4 carpetas (`.agents`, `.github`, `.opencode`, `project-docs`) y 4 archivos (`.gitignore`, `AGENTS.md`, `opencode.json`, `README.md`) en su raiz.

### Event-Driven (Requerimientos Disparados por Eventos)
- **EARS-EV-01**: CUANDO el usuario navega a una ruta con parametros hash (por ejemplo `#issues?id=INT-014&view=board`), EL enrutador `router.js` debe extraer los parametros y notificar a los suscriptores.
- **EARS-EV-02**: CUANDO se modifica el estado de un issue en `issue.store.js`, EL sistema debe despachar un evento en `event-bus.js` y sincronizar los cambios via `issue.service.js`.
- **EARS-EV-03**: CUANDO se presiona el atajo `Ctrl+K` o `Cmd+K`, EL modal de busqueda global Omnibox debe abrirse inmediatamente y recibir el foco accesible.

### State-Driven (Requerimientos Basados en Estado)
- **EARS-ST-01**: MIENTRAS el tablero se encuentre en modo offline (`file:///`), EL cliente `api-client.js` debe resolver las consultas utilizando los datos estaticos de `data-fallback.js` sin arrojar excepciones de red.
- **EARS-ST-02**: MIENTRAS un modal de detalle de tarea este abierto, EL dialogo debe presentar la User Story Scrum, los criterios EARS, las subtareas Jira DEV/QA y el checklist de Definition of Done (DoD).

### Unwanted-Behavior (Manejo de Errores y Comportamiento no Deseado)
- **EARS-UW-01**: SI se ejecuta una navegacion en un entorno sin DOM o sin `window.addEventListener`, EL enrutador no debe lanzar un `TypeError` y debe operar de forma segura.
- **EARS-UW-02**: SI la API REST local no esta disponible, EL servicio debe degradar suavemente hacia los datos precargados en memoria.

---

## 4. Definition of Ready (DoR)
- [x] Contexto de negocio y reglas Screaming Architecture alineadas con el patron de Plane.
- [x] Contratos de datos (DTOs) para Project, Issue, Cycle y AgentState documentados.
- [x] Criterios EARS claros y sin ambiguedades.

---

## 5. Definition of Done (DoD)
- [x] Estructura modular `src/modules/`, `src/core/` y `src/shared/` implementada al 100%.
- [x] Suite de 66 pruebas unitarias pasando en verde (`npm --prefix project-docs test`).
- [x] Suite de 14 pruebas de aceptacion Playwright pasando en verde (`npm --prefix project-docs run test:acceptance`).
- [x] Verificacion completa en 9 niveles de `project-docs/verify.sh` con exit code 0.
- [x] Cero emojis unicode verificados por gate automatizado.
- [x] Limpieza estricta de la raiz del proyecto certificada.
