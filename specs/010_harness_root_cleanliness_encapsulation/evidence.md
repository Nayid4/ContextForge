# Evidencias de Pruebas y Validación: INT-010 Encapsulamiento de Archivos y Limpieza de Raíz

## 1. Resumen de la Verificación

- **Feature**: `harness_root_cleanliness_encapsulation` (ID: 10)
- **Rama de Trabajo**: `feature/INT-010/harness_root_cleanliness_encapsulation` (54 caracteres)
- **Subtarea DEV**: `INT-010-DEV` — Estado: `done` (100% de refactorización y reubicación completada)
- **Subtarea QA**: `INT-010-QA` — Estado: `done` (100% de verificación y evidencias capturadas)
- **Resultado verify.sh**: `✅ Verificación completada con éxito. Todos los niveles en verde.`

---

## 2. Métricas de Ejecución Multinivel

| Nivel de Prueba | Herramienta / Runner | Casos Ejecutados | Resultado |
| :--- | :--- | :---: | :---: |
| **Compilación & Bundling** | `esbuild (v0.25.0)` | 1 bundle (374.2kb) | `PASS` (49ms) |
| **Pruebas Unitarias** | `node:test` | 16 tests | `PASS` (16/16) |
| **Pruebas Smoke ATDD** | `node:test` | 5 tests | `PASS` (5/5) |
| **Caja Blanca (Branching)** | `node:test` | 12 tests | `PASS` (12/12) |
| **Caja Negra (BVA/Resiliencia)** | `node:test` | 8 tests | `PASS` (8/8) |
| **Pruebas de Sistema** | `node:test` | 7 tests | `PASS` (7/7) |
| **Pruebas de Carga** | `node:test` (100 req con p95) | 1 test (258 RPS, p95 71ms) | `PASS` (1/1) |
| **Pruebas de Aceptación E2E** | `@playwright/test` (Chrome) | 10 tests | `PASS` (10/10) |
| **Consistencia y Sync Offline**| `sync-data.js` | 22 documentos vivos | `PASS` (CORS-free) |
| **TOTAL** | — | **60 verificaciones** | **100% EXITOSO** |

---

## 3. Verificación de Pureza del Directorio Raíz

Estructura canónica verificada en raíz tras la encapsulación:
- **Carpetas mínimas canónicas**:
  1. `.agents/`
  2. `.github/`
  3. `.opencode/`
  4. `project-docs/`
- **Archivos mínimos canónicos**:
  1. `AGENTS.md`
  2. `opencode.json`
  3. `project-spec.yaml`
  4. `verify.sh`
  5. `README.md`
  6. `.gitignore`

Todos los artefactos de desarrollo (`package.json`, `package-lock.json`, `playwright.config.js`, `kickstart.json`, `tests/`, `scripts/`, `node_modules/`) residen ahora exclusivamente dentro de `project-docs/`.

---

## 4. Capturas de Pantalla de Evidencia

### 4.1 Captura 1: Tablero de Seguimiento Visual con Subtareas DEV/QA
![Dashboard Scrum Table](evidence/01-dashboard-scrum-table.png)

### 4.2 Captura 2: Modal de Detalle con Especificación Scrum y Trazabilidad Jira
![Modal Scrum Subtasks](evidence/02-modal-scrum-subtasks.png)

### 4.3 Captura 3: Base de Conocimiento y Arquitectura DeepWiki
![Knowledge Base DeepWiki](evidence/03-knowledge-base-deepwiki.png)
