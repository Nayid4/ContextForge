# Especificación de Requerimientos: INT-008 playwright_acceptance_testing

- **Feature ID**: INT-008
- **Nombre**: `playwright_acceptance_testing`
- **Módulo**: `testing-qa-suite`
- **Prioridad**: P1
- **Estado**: spec_ready
- **Rama**: `feature/INT-008/playwright_acceptance_testing`

---

## 1. Requerimientos en Notación EARS

### Requerimientos Ubicuos
- **R1 [UBIQUOUS]**: El sistema DEBE contar con una suite completa de pruebas automatizadas que cubra los 5 niveles de calidad: Aceptación E2E (Playwright), Caja Blanca (ramificaciones lógicas y funciones internas), Caja Negra (partición de equivalencia, BVA y datos límite), Sistema/Integración (interacción entre subsistemas y servidor web) y Rendimiento/Carga (latencias y concurrencia).
- **R2 [UBIQUOUS]**: Todas las pruebas DEBEN ser ejecutables tanto de forma individual (`npm run test:acceptance`, `npm run test:whitebox`, `npm run test:blackbox`, `npm run test:load`) como de forma agregada (`npm run test:all` y `verify.sh`).

### Requerimientos de Evento
- **R3 [EVENT]**: **CUANDO** se ejecuten las pruebas de aceptación con Playwright, el sistema DEBE validar de punta a punta los escenarios críticos de la interfaz de usuario: carga del tablero en modo servidor/offline, navegación por pestañas, renderizado y filtrado de la biblioteca editorial con tarjeta Hero, conmutación y sincronización de scroll en el Editor Dual (Markdown/Bloques), apertura e indexación del modal Omnibox (`Ctrl+K`), y montaje limpio de la Constelación 3D en Three.js sin fugas de memoria.
- **R4 [EVENT]**: **CUANDO** se ejecuten las pruebas de caja blanca, el sistema DEBE verificar las ramas de decisión (`branch coverage`), control de flujo en parseo de markdown (`MarkdownViewer.js`), reactividad y mutación de estado en `store.js`, y resolución de metadatos en `sync-data.js`.

### Requerimientos de Estado
- **R5 [STATE]**: **MIENTRAS** se ejecuten las pruebas de caja negra, el sistema DEBE evaluar entradas extremas y de borde: payloads Markdown malformados, inyección de caracteres especiales o etiquetas HTML adversas, documentos vacíos, índices inexistentes y consultas vacías en el buscador Omnibox, garantizando que el sistema nunca lance excepciones no controladas.
- **R6 [STATE]**: **MIENTRAS** el servidor web local (`project-docs/serve.js`) esté bajo carga de peticiones concurrentes, el sistema DEBE mantener un p95 menor a 200ms y una tasa de error del 0% para servir activos estáticos y documentos de la base de conocimiento.

### Requerimientos No Deseados
- **R7 [UNWANTED]**: **SI** cualquiera de las suites de prueba falla o produce excepciones no capturadas, ENTONCES el script de verificación `verify.sh` DEBE detenerse inmediatamente con código de error y registrar la evidencia en el reporte consolidado `project-docs/testing/report-acceptance-testing.md`.
