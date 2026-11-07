# Evidencias de Pruebas y Validación: INT-011 Encapsulamiento de Specs, verify.sh y project-spec.yaml

## 1. Resumen de la Verificación

- **Feature**: `harness_deep_encapsulation_specs_and_scripts` (ID: 11)
- **Rama de Trabajo**: `feature/INT-011/encapsulate_specs_and_scripts` (48 caracteres)
- **Subtarea DEV**: `INT-011-DEV` — Estado: `done` (100% de reubicación y actualización de agentes/skills completada)
- **Subtarea QA**: `INT-011-QA` — Estado: `done` (100% de validación multinivel, pureza extrema y evidencias)
- **Resultado project-docs/verify.sh**: `✅ Verificación completada con éxito. Todos los niveles en verde.`

---

## 2. Métricas de Ejecución Multinivel

| Nivel de Prueba | Herramienta / Runner | Casos Ejecutados | Resultado |
| :--- | :--- | :---: | :---: |
| **Compilación & Bundling** | `esbuild (v0.25.0)` | 1 bundle (374.4kb) | `PASS` (47ms) |
| **Pruebas Unitarias** | `node:test` | 16 tests | `PASS` (16/16) |
| **Pruebas Smoke ATDD** | `node:test` | 5 tests | `PASS` (5/5) |
| **Caja Blanca (Branching)** | `node:test` | 12 tests | `PASS` (12/12) |
| **Caja Negra (BVA/Resiliencia)** | `node:test` | 8 tests | `PASS` (8/8) |
| **Pruebas de Sistema** | `node:test` | 7 tests | `PASS` (7/7) |
| **Pruebas de Carga** | `node:test` (100 req con p95) | 1 test (345.8 RPS, p95 50ms) | `PASS` (1/1) |
| **Pruebas de Aceptación E2E** | `@playwright/test` (Chrome) | 10 tests | `PASS` (10/10) |
| **Sincronización y Sync Offline**| `sync-data.js` | 22 documentos vivos | `PASS` (CORS-free) |
| **TOTAL** | — | **60 verificaciones** | **100% EXITOSO** |

---

## 3. Verificación de Pureza Extrema del Directorio Raíz

La raíz del repositorio contiene estrictamente:
- **4 Carpetas**:
  1. `.agents/`
  2. `.github/`
  3. `.opencode/`
  4. `project-docs/`
- **4 Archivos**:
  1. `AGENTS.md`
  2. `opencode.json`
  3. `README.md`
  4. `.gitignore`

Todos los specs (`project-docs/specs/`), scripts de verificación (`project-docs/verify.sh`) y especificación técnica (`project-docs/project-spec.yaml`) residen encapsulados dentro de `project-docs/`.

---

## 4. Capturas de Pantalla de Evidencia

### 4.1 Captura 1: Tablero de Seguimiento Visual con Tarea INT-011
![Dashboard Scrum Table](evidence/01-dashboard-scrum-table.png)

### 4.2 Captura 2: Base de Conocimiento DeepWiki con Rutas Actualizadas
![Knowledge Base DeepWiki](evidence/03-knowledge-base-deepwiki.png)
