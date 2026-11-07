# Especificacion de Requerimientos — INT-015: Eliminacion Total de Features y Consolidacion Screaming en Modules con Diseno Plane

## Metadatos
- **ID de Feature**: INT-015
- **Nombre**: `screaming_modules_plane_unification`
- **Titulo**: Eliminacion Total de Features y Consolidacion Screaming en Modules con Diseno Plane
- **Rama Git**: `feature/INT-015/screaming_modules_plane_unification`
- **Ruta de Spec**: `project-docs/specs/015_screaming_modules_plane_unification`
- **Estado**: done
- **Tecnica de Implementacion**: SDD
- **Modulo**: dashboard-visualizer
- **Prioridad**: P0
- **Creado**: 2026-11-07

---

## 1. Contexto y Formulacion del Problema
Tras la creacion inicial de los primeros 5 modulos en `src/modules/` en INT-014, coexistia aun la carpeta `src/features/` conteniendo 5 dominios residuales (`architecture`, `graph`, `constellation`, `analytics`, `modules`, `layout`).
Para lograr una arquitectura pura y homogénea bajo **Screaming Architecture**:
1. **Eliminar por completo `src/features/`**: No debe existir ninguna carpeta `features/` en el proyecto.
2. **Consolidar los 10 dominios de negocio canónicos en `src/modules/`**:
   `Analytics`, `Architecture`, `Constellation`, `Cycles`, `Graph`, `Harness`, `Issues`, `Modules`, `Pages`, `Projects`.
3. **Aplicar el nuevo diseno unificado inspirado en Plane**:
   - Paleta dark slate consistente (`bg-zinc-950`, `border-zinc-800`, transparencias sutiles).
   - Componentes modulares con estructura estricta (`components/`, `pages/`, `services/`, `store/`, `index.js`).
   - Cero emojis y biblioteca 100% SVG nativo.
4. **Verificacion integral sin regresiones**: Pasar al 100% las 66 pruebas unitarias, 14 pruebas de aceptacion Playwright y los 9 niveles de `verify.sh`.

---

## 2. Historias de Usuario (Scrum)

### US-1: Frontend sin Directorios Hibridos ni Legacy
**Como** arquitecto de software y desarrollador frontend,  
**Quiero** eliminar definitivamente la carpeta `src/features/` y centralizar todos los dominios en `src/modules/`,  
**Para** que la estructura del codigo grite con maxima claridad y pureza los conceptos de negocio del arnes.

### US-2: Diseno Plane Unificado en Todos los Modulos
**Como** usuario del tablero de seguimiento y agente de IA,  
**Quiero** que todos los modulos (incluyendo Arquitectura C4, Grafo DAG, Constelacion 3D y Analitica) mantengan la misma voz, estetica y micro-interacciones inspiradas en Plane,  
**Para** disfrutar de una experiencia visual cohesiva, moderna y profesional.

---

## 3. Criterios de Aceptacion (EARS)

- **EARS-UB-01**: La carpeta `project-docs/src/features/` no debe existir bajo ninguna circunstancia.
- **EARS-UB-02**: El directorio `project-docs/src/modules/` debe contener exactamente los 10 dominios de negocio canonicos (`Analytics`, `Architecture`, `Constellation`, `Cycles`, `Graph`, `Harness`, `Issues`, `Modules`, `Pages`, `Projects`), cada uno con `components/`, `pages/`, `services/`, `store/` y `index.js`.
- **EARS-UB-03**: El punto de entrada `src/main.js` no debe contener ninguna importacion desde `./features/...`.
- **EARS-EV-01**: CUANDO se ejecuta `npm --prefix project-docs test`, LA prueba `screaming-architecture.test.js` debe verificar con exito la inexistencia de `features/` y la completitud de los 10 modulos.
- **EARS-ST-01**: MIENTRAS el tablero se encuentre montado, TODAS las vistas deben renderizar con diseno consistente estilo Plane y cero caracteres emoji.

---

## 4. Definition of Done (DoD)
- [x] Carpeta `src/features/` eliminada por completo.
- [x] 10 modulos canónicos en `src/modules/` con componentes, paginas, servicios y store.
- [x] Bundle `dist/app.bundle.js` recompilado en 413.6 KB sin advertencias.
- [x] 66/66 pruebas unitarias en verde.
- [x] 14/14 pruebas de aceptacion Playwright en verde.
- [x] 9 niveles de `verify.sh` certificados con exit code 0.
- [x] Invariante de pureza de raiz (4 carpetas, 4 archivos) preservada.
