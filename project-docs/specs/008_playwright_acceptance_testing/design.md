# Diseño Técnico & Decisiones de Arquitectura (ADRs): INT-008

## Resumen
Diseño de la suite integral de aseguramiento de calidad y pruebas automatizadas para el arnés y su tablero de seguimiento interactivo, abarcando pruebas de Aceptación E2E con Playwright, Caja Blanca, Caja Negra, Integración de Sistema y Carga/Rendimiento con métricas cuantitativas de latencia.

---

## Arquitectura de la Suite de Pruebas

```
tests/
├── unit/                   # Tests unitarios nativos existentes (Node.js Test Runner)
├── e2e/                    # Pruebas smoke y evaluación ATDD existentes
├── acceptance/             # Pruebas de aceptación E2E con Playwright
│   ├── dashboard-navigation.spec.js
│   ├── editorial-reader.spec.js
│   ├── dual-editor.spec.js
│   └── omnibox-search.spec.js
├── whitebox/               # Cobertura estructural de ramas y grafos de decisión
│   ├── markdown-branches.test.js
│   ├── store-reactivity.test.js
│   └── sync-pipeline.test.js
├── blackbox/               # Partición de equivalencia, BVA y payloads adversos
│   ├── bva-inputs.test.js
│   └── malformed-payloads.test.js
├── system/                 # Interoperabilidad de subsistemas y servidor HTTP
│   ├── offline-fallback.test.js
│   └── server-lifecycle.test.js
└── load/                   # Simulación de estrés, concurrencia y latencias
    └── server-concurrency.test.js
```

---

## Decisiones de Arquitectura (ADRs)

### ADR-QA-001: Playwright como Motor Estándar de Aceptación E2E
- **Contexto**: Se requiere validar las historias de usuario y la experiencia visual completa (animaciones Three.js, scroll sincronizado en el editor dual, modal Omnibox y renderizado de Mermaid) en un navegador real.
- **Decisión**: Adoptar `@playwright/test` configurado con Chromium en modo headless, localizadores semánticos (`getByRole`, `getByTestId`), aserciones web-first con reintentos automáticos y captura de trazas.
- **Consecuencias**: Pruebas resilientes, deterministas y con diagnóstico visual ante regresiones.

### ADR-QA-002: Dualidad de Ejecución (Playwright + Node.js Native Test Runner)
- **Contexto**: Para pruebas de caja blanca, caja negra, sistema y carga no se requiere necesariamente un navegador headless completo, sino ejecución determinista y ultrarrápida (<500ms) compatible con CI/CD ligero.
- **Decisión**: Utilizar Playwright para los escenarios de aceptación de interfaz (`tests/acceptance/`) y el motor nativo `node --test` para las suites de caja blanca, caja negra, sistema y carga.
- **Consecuencias**: Velocidad extrema en el ciclo de desarrollo local sin sacrificar la rigurosidad E2E en el navegador.

### ADR-QA-003: Reporte Consolidado de Aseguramiento de Calidad
- **Contexto**: El arnés exige visibilidad total del estado de calidad sin depender de plataformas propietarias externas.
- **Decisión**: Generar automáticamente `project-docs/testing/report-acceptance-testing.md` integrando resultados cuantitativos, latencias p95/p99 y trazabilidad con los criterios de aceptación de `feature_list.json`.
- **Consecuencias**: Trazabilidad auditable y persistente integrada al repositorio y al visor documental.
