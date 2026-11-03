---
name: verify-spec
description: Use when verifying that a spec/feature is fully implemented and ready to close. Checks acceptance criteria, task completion, unit test coverage, and runs verify.sh for technical dependencies. Language-agnostic. Suggested after generate-spec and execute-api-test-plan.
---

# Skill: Verificación de Spec

## Descripción

Verifica de forma exhaustiva que un spec (feature) generado por `generate-spec` esté completamente implementado, probado y listo para cerrarse. Es **agnóstico al lenguaje/stack**: se apoya en `verify.sh` y en `project-spec.yaml` (generados por `technical-audit` y `generate-verify`) para detectar comandos de test/build sin importar si el proyecto es Node, Python, Java, Go, etc.

> **Sugerencia:** Ejecutar después de `generate-spec` (implementación) y, si aplica, `execute-api-test-plan` (pruebas de API). Es el último paso antes de cerrar un spec (equivalente al "Paso 7: Cerrar el Spec" de `generate-spec`, pero solo si todo aprueba).

## Entrada Requerida

- **Directorio del spec** (obligatorio) - Ruta a `project-docs/<module>/specs/<NNN>-<feature-name>/`
- **Spec en `current.json`** (obligatorio) - Debe existir un spec activo (status `in_progress`) correspondiente

> **Nota:** Si `current.json` esta en `{}` pero el spec existe y esta implementado, es un spec cuya activacion quedo a medias. Reportarlo como hallazgo critico (H): el spec quedo sin registrar en `current.json` y probablemente tampoco en `feature_list.json`. No se puede verificar ni cerrar en ese estado; hay que re-activarlo primero.

## Entrada Opcional

- **project-spec.yaml** - Para conocer comando de test/build/lint configurado (si no está, se intenta autodetectar)
- **Directorio de tests-plan** (`project-docs/<module>/tests-plan/<recurso>/`) - Si el spec incluye endpoints probados con `api-test-plan`/`execute-api-test-plan`

## Restricciones

> **CRÍTICO:** Nunca resolver los problemas encontrados. Solo documentar hallazgos y reportar el estado de verificación (aprobado/no aprobado). El humano o un skill de implementación posterior corrige.

> **CRÍTICO:** Nunca marcar un spec como cerrado/`done` si alguna verificación falló.

## Parámetros de Verificación

La verificación cubre 5 dimensiones, TODAS deben aprobar para considerar el spec completo:

### 1. Cobertura de Acceptance Criteria

- Leer `spec.md` → sección `## Acceptance Criteria`
- Para cada criterio, buscar evidencia de cumplimiento:
  - Código implementado (revisar "Componentes Afectados" en `spec.md`)
  - Prueba que lo valide (unit test o prueba de `tests-plan/`)
- Marcar `[x]` los criterios verificados; dejar `[ ]` y reportar como hallazgo los que no tengan evidencia

### 2. Cobertura de Tasks

- Leer `tasks.md`
- Todas las tareas deben estar `[x]`
- **Debe existir una tarea explícita de tests unitarios** (ej. "Escribir tests unitarios con cobertura de código") en Fase 3: Testing
  - Si NO existe esa tarea: reportar hallazgo "Spec sin tarea de tests unitarios" y sugerir agregarla + ejecutar skill `write-unit-tests`
  - Si existe pero está `[ ]`: reportar como pendiente, no continuar con el cierre

### 3. Tests Unitarios (cobertura de código)

Agnóstico al lenguaje. Determinar el comando de test en este orden de prioridad:

1. `checks.test.command` en `project-spec.yaml` del módulo
2. Sección "Tests" del `verify.sh` del módulo (ya la ejecuta `verify.sh`, ver punto 5)
3. Autodetección por convención si no hay `project-spec.yaml`:
   - Node: `npm test` / `yarn test` (busca script `test` en `package.json`)
   - Python: `pytest --cov` / `python -m pytest --cov`
   - Java: `mvn test` / `gradle test`
   - Go: `go test ./... -cover`
   - Ruby: `bundle exec rspec`
   - .NET: `dotnet test`

Ejecutar el comando y verificar:

- Código de salida = 0 (todos los tests pasan)
- Si la herramienta reporta cobertura (texto tipo `Coverage: NN%`, `lines......: NN%`, `TOTAL ... NN%`), registrar el porcentaje
- Si NO hay ningún test unitario relacionado al módulo/feature (0 archivos de test detectados): reportar hallazgo CRÍTICO "Sin cobertura de tests unitarios" — el spec NO puede cerrarse

### 4. Pruebas de Integración/API (si aplica)

- Si el spec tiene endpoints (sección `### Endpoints` en `spec.md`), buscar `project-docs/<module>/tests-plan/<recurso>/checklist.md`
- Si existe: todas las pruebas deben estar `[x]` y "Fallidas: 0"
- Si no existe pero el spec define endpoints: reportar como advertencia (no bloqueante si los unit tests ya cubren la lógica), sugerir ejecutar `api-test-plan` + `execute-api-test-plan`

### 5. Dependencias Técnicas (verify.sh)

- Ubicar `verify.sh` en la raíz del módulo (ej. `backend/verify.sh`)
- Ejecutar: `./verify.sh`
- Revisar código de salida:
  - `0` → dependencias técnicas OK (entorno, servicios, build, docker)
  - `1` → reportar como hallazgo CRÍTICO cada línea con `✗` (fallo)
- Las advertencias (`⚠`) se reportan pero no bloquean el cierre

## Flujo de Ejecución

### Paso 1: Cargar contexto

1. Leer `current.json` → confirmar que el spec a verificar coincide con el spec activo
2. Leer `spec.md`, `tasks.md`, `decisions.md` del directorio del spec
3. Leer `project-spec.yaml` del módulo (si existe)
4. Ubicar `verify.sh` del módulo

### Paso 2: Ejecutar las 5 verificaciones

Ejecutar en orden: Tasks → Unit Tests → Integración/API → verify.sh → Acceptance Criteria (cruzando con evidencia de los pasos anteriores)

### Paso 3: Generar Reporte

Crear/actualizar `<spec-dir>/verification-report.md`:

```markdown
# Reporte de Verificación - <title>

## Resumen
- Fecha: <fecha>
- Spec: <name> (ID: <id>)
- Resultado: APROBADO / NO APROBADO

## 1. Acceptance Criteria
| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| ... | ✅/❌ | ... |

## 2. Tasks
- Total: N | Completadas: N | Pendientes: N
- Tarea de tests unitarios presente: Si/No

## 3. Tests Unitarios
- Comando ejecutado: `...`
- Resultado: PASS/FAIL
- Cobertura: NN% (si disponible)
- Archivos de test detectados: N

## 4. Pruebas de Integración/API
- Plan: <ruta o "No aplica">
- Resultado: X/Y aprobadas

## 5. verify.sh (Dependencias Técnicas)
- Exit code: 0/1
- Pass: N | Warn: N | Fail: N

## Hallazgos
### [H-001] <título>
- Severidad: crítico/alto/medio/bajo
- Descripción: ...
- Acción sugerida: ...
```

### Paso 4: Actualizar Estado del Spec

> **Este es el cierre real.** Aunque `generate-spec` tambien lo describe en su Paso 7, en la practica el cierre ocurre aqui. Las dos descripciones deben mantenerse sincronizadas: si se cambia una, cambiar la otra en el mismo commit.

- Si **APROBADO** (las 5 dimensiones pasan), ejecutar el cierre en este orden:

  1. Marcar todos los checkboxes de `spec.md` (Acceptance Criteria) y `tasks.md`
  2. **Actualizar `Status` de `spec.md` a `Done`** (tabla `## Metadata`)
     - Sin este paso el spec queda en `In Progress` para siempre mientras su feature dice `done`, y las tres fuentes de verdad dejan de coincidir
     - Vocabulario valido: `In Progress` / `Done`. No inventar otros valores
  3. Actualizar `feature_list.json`: `status` → `done`, `closedAt` → fecha actual
  4. Agregar registro a `history.json` (si no existe ya; no duplicar `featureId`)
  5. Resetear `current.json` a `{}`

  **6. Reconciliar antes de reportar APROBADO.** Ejecutar los asserts del Paso 5. Ningun spec se cierra con asserts en rojo.

- Si **NO APROBADO**: dejar todo en su estado actual (`in_progress`), NO cerrar el spec. Solo entregar el reporte de hallazgos.

### Paso 5: Reconciliacion de las tres fuentes de verdad

> **CRITICO:** Obligatorio antes de reportar APROBADO. El drift entre `spec.md`, `feature_list.json` y `history.json` es silencioso: no rompe nada en el momento y aparece despues como historial incompleto o features `done` sin registro.

| Assert | Consulta | Si falla |
|--------|----------|----------|
| El spec dice `Done` | `\| Status \| Done \|` en `spec.md` | Re-ejecutar Paso 4.2 |
| La feature dice `done` | `feature_list.json` → `status` | Re-ejecutar Paso 4.3 |
| Existe su record en el historial | `history.json` → `records[]` con ese `featureId` | Re-ejecutar Paso 4.4 |
| `current.json` quedo en `{}` | leer el JSON | Re-ejecutar Paso 4.5 |

**Si un assert no se puede satisfacer, el resultado NO es APROBADO.** Reportar el assert fallido como hallazgo en el `verification-report.md` en vez de dar el spec por cerrado.

## Notas

- **Un spec a la vez**, igual que `execute-api-test-plan`
- **Nunca resolver los hallazgos** desde este skill; solo reportar
- **Agnóstico al lenguaje**: nunca asumir `npm`/`node`; siempre preferir lo declarado en `project-spec.yaml` o `verify.sh`
- **Idempotente**: puede ejecutarse múltiples veces sin efectos secundarios si el resultado es NO APROBADO

## Siguiente Paso

- Si hay hallazgo de "Sin tests unitarios" o cobertura insuficiente: ejecutar skill `write-unit-tests`
- Si hay hallazgos de API: ejecutar skill `execute-api-test-plan` nuevamente tras corregir
- Si APROBADO: el spec queda cerrado, listo para iniciar el siguiente con `generate-spec`

> Si el spec **no** esta aprobado, la correccion se hace con la skill de implementacion que indique el Metadata de `spec.md` (fila `Tecnica de Implementacion`): `implement-tdd`, `implement-sdd` o `implement-ftd`. Este skill solo reporta hallazgos; no implementa la correccion.
