---
name: targeted-qa
description: Use when a QA engineer or developer requests targeted tests on a specific part of the software (endpoint, UI view, component, edge cases, load, resilience, accessibility). Plans, generates, executes, and reports results against the codebase.
---

# Skill: Pruebas Focalizadas de QA Bajo Demanda (Targeted QA)

## Proposito y Filosofia

Esta skill permite al arnes responder de forma autonoma y rigurosa cuando un **ingeniero de QA**, un desarrollador o el líder de equipo solicita pruebas especificas sobre un componente, endpoint, vista o flujo del software (ej. *"haz pruebas de limites al endpoint de login"*, *"verifica accesibilidad y navegacion por teclado en el editor de documentos"*, *"ejecuta pruebas de carga a la busqueda"*, *"prueba resiliencia ante cortes de conexion"*).

El arnes no requiere abrir una feature SDD completa para realizar estas validaciones de calidad. En su lugar, ejecuta un ciclo forense de QA:
1. **Delimita** el objetivo y el tipo de prueba.
2. **Consulta** las invariantes soberanas (`project-docs/knowledge/` y codigo real).
3. **Genera** la suite de pruebas adecuada (unit, api, e2e, load o a11y).
4. **Ejecuta** las pruebas en el entorno real.
5. **Genera** un reporte formal con hallazgos tecnicos reproducibles.

---

## 1. Matriz de Clasificacion de Pruebas QA

Segun lo solicitado por el usuario o QA, clasifica la tarea en uno o mas de los siguientes tipos:

| Tipo | Alcance | Herramienta / Tecnologia | Directorio Destino |
| ---- | ------- | ------------------------ | ------------------ |
| **BVA / Caja Negra** | Valores limite, strings vacios, desbordamientos, tipos invalidos | Runner de tests unitarios del proyecto (`npm test`, `pytest`, etc.) | `tests/unit/` o `tests/boundary/` |
| **API REST** | Codigos de estado (200, 400, 401, 403, 404, 422, 500), headers, injection | Archivos `.http` + `curl` o supertest | `tests/api/` |
| **UI E2E** | Flujos de usuario, formularios interactivos, reactividad DOM | Playwright (Headless / Chromium) | `tests/acceptance/` |
| **Accesibilidad** | WCAG 2.1 AA, roles ARIA, tabIndex, foco, contraste y tap targets | Playwright Axe (`@axe-core/playwright`) o auditoria manual DOM | `tests/acceptance/` |
| **Carga / Estres** | Concurrencia de usuarios, p95/p99 latencias, rendimiento RPS | k6, autocannon o artillery | `tests/load/` |
| **Resiliencia** | Caida de servicios externos, timeouts, reintentos, desconexion BD | Mocks de red / interceptores de errores | `tests/integration/` |

---

## 2. Protocolo de Ejecucion en 5 Pasos

### Paso 1: Triage y Delimitacion del Alcance
Extrae de la peticion del usuario:
- **Componente o modulo objetivo**: Archivo, vista o endpoint especifico.
- **Escenarios de interes**: Casos de exito, casos extremos, valores limite o condiciones de error.
- **Criterios de aceptacion de QA**: Comportamiento esperado segun las reglas de negocio.

### Paso 2: Consulta Forense de Contexto (Zero-Guess)
Antes de escribir cualquier prueba:
- Verifica `project-docs/knowledge/business-rules.md` para extraer invariantes `BR-*` que apliquen al objetivo.
- Revisa `project-docs/knowledge/03-capabilities-and-features.md` para entender el flujo end-to-end (User Journey).
- Inspecciona el codigo fuente real del componente para conocer contratos de datos, validaciones y firmas.

### Paso 3: Diseno y Generacion de la Suite de Pruebas
Genera el archivo de pruebas correspondiente siguiendo las convenciones del proyecto:
- **Nomenclatura**: `tests/{tipo}/{componente}-{escenario}.spec.js` (o extension segun el lenguaje).
- **Estructura Gherkin**: `GIVEN` (estado inicial), `WHEN` (accion ejercida), `THEN` (asercion verificada).
- **Cobertura exhaustiva**: Minimo 1 caso feliz, 2 casos limite / valores borde, y 2 casos de fallo controlado o rechazo.
- **Cero mocks ciegos**: Las pruebas deben interactuar con la interfaz o APIs reales salvo que se trate de aislamiento unitario estricto.

### Paso 4: Ejecucion Real en el Entorno
Ejecuta la suite con `run_command`:
- Para Playwright: `npx playwright test tests/acceptance/{archivo}.spec.js`
- Para unitarias/limites: `npm test` o el comando correspondiente en `project-docs/project-spec.yaml`.
- Para API: ejecucion con `curl` o runner de API.
- Para carga: `k6 run tests/load/{archivo}.js`

Si alguna prueba falla:
- Determina si el fallo es un **defecto real del software (BUG)** o un error en la formulacion del test.
- Si es un BUG, documenta la reproduccion exacta en el reporte.
- Si el usuario solicito corregirlo ademas de probarlo, aplica la correccion y re-ejecuta hasta verde.

### Paso 5: Generacion del Reporte Formal de QA
Escribe el reporte en `project-docs/qa/report-{target}-{timestamp}.md`:

```markdown
# Reporte de Auditoria de Calidad QA: {Componente o Flujo}

- **Fecha**: {YYYY-MM-DD HH:mm:ss}
- **Solicitante**: Ingeniero de QA / Usuario
- **Tipo de Prueba**: {BVA / API / E2E / A11y / Carga}
- **Objetivo**: {Descripcion del componente evaluado}
- **Estado General**: [PASADO] | [FALLOS DETECTADOS]

## 1. Matriz de Casos de Prueba Ejecutados

| ID | Escenario / Caso | Entrada / Accion | Resultado Esperado | Resultado Obtenido | Estado |
| -- | ---------------- | ---------------- | ------------------ | ------------------ | ------ |
| TC-01 | Camino feliz | Entrada valida | Respuesta 200 / Render correcto | Respuesta 200 | [PASS] |
| TC-02 | Valor limite maximo | String 500 chars | Truncado o validacion 422 | Error 422 capturado | [PASS] |
| TC-03 | Inyeccion o caracteres | `<script>alert(1)</script>` | Escape sanitizado | Render seguro | [PASS] |

## 2. Metricas Tecnicas Obtenidas
- Tiempo de respuesta promedio: {X} ms
- p95: {X} ms | p99: {X} ms
- Cobertura de branches evaluada: {X}%
- A11y Violations (axe): 0 detectadas

## 3. Defectos Identificados (Bugs)
*(Si no hay defectos, registrar: "Cero defectos detectados.")*
- **BUG-001**: [Descripcion corta]
  - Severidad: [Critica / Mayor / Menor / Trivial]
  - Pasos de reproduccion: ...
  - Comportamiento observado vs esperado: ...
  - Sugerencia de correccion: ...

## 4. Archivos de Prueba Creados o Actualizados
- `{ruta-al-test}`
```

### Paso 6: Envío del Reporte y Hallazgos al Modelo Plane SQLite + Markdown
Una vez generado el reporte en disco, persiste el documento y la trazabilidad de ejecución en `project-docs/data/harness.db` (`pages`, `page_versions`, `issue_evidences`, `ai_runs`) y en `knowledge/ai-runs-log.md`:
```bash
node project-docs/cli.js page upsert --path "knowledge/qa-report-{target}.md" --title "Reporte de Auditoria QA: {target}" --shelf requirements --file "project-docs/qa/report-{target}-{timestamp}.md" --role reviewer
node project-docs/cli.js ai log --skill targeted-qa --role reviewer --type TARGETED_QA_AUDIT --summary "Auditoria focalizada de QA sobre {target}" --artifacts "project-docs/qa/report-{target}-{timestamp}.md"
node project-docs/sync-data.js
```

---

## 3. Reglas Criticas

- **Cero aserciones simuladas**: Prohibido reportar una prueba como exitosa si no fue ejecutada contra el entorno real.
- **Cero emojis**: No uses emojis decorativos; emplea tags tecnicos como `[PASS]`, `[FAIL]`, `[WARN]`, `[OK]`.
- **Independencia**: Las pruebas no deben depender del orden de ejecucion entre si.
- **Limpieza de estado**: Toda prueba que modifique estado o cree datos de prueba debe limpiar tras de si (`afterEach` / `teardown`).
