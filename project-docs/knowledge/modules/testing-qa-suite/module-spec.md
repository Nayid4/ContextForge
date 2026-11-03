# Módulo: testing-qa-suite (Suite de Pruebas & Calidad)

> [!NOTE]
> Bounded Context responsable de la verificación continua del arnés mediante pruebas unitarias nativas y pruebas de aceptación E2E con Playwright.

## 1. Responsabilidades del Módulo
- Ejecución de pruebas unitarias ultra-rápidas mediante Node.js Test Runner nativo (`npm test`).
- Pruebas de aceptación funcional tipo smoke (`npm run test:e2e`).
- Validación de convenciones de branching (`{type}/INT-{id}/{name}` $\le 80$c) y commits semánticos.
- Verificación de serialización bidireccional entre Markdown y Bloques Visuales.
- Cobertura de cálculos de tiempo de lectura y clasificación temática de estantes.

## 2. Componentes de Prueba
- `tests/unit/markdown-parser.test.js`: Pruebas de renderizado Markdown, TOC y serialización de bloques.
- `tests/unit/sync-data.test.js`: Pruebas de indexación y generación de `data-fallback.js`.
- `tests/unit/branching-rules.test.js`: Pruebas de reglas de ramas y formato de commits.
- `tests/e2e/dashboard-smoke.test.js`: Pruebas de evaluación del bundle y dependencias del DOM.
