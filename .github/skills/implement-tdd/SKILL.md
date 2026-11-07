---
name: implement-tdd
description: Use when implementing a spec with Test-Driven Development. Writes failing tests first, confirms they fail for the right reason, writes the minimum code to pass, then refactors within the spec scope. Language-agnostic. Pairs with generate-spec (when it recommends TDD) and hands closure to verify-spec.
---

# Skill: Implementación TDD

## Descripción

Implementa un spec activo siguiendo **Test-Driven Development**: escribir la prueba primero, confirmar que falla, escribir el código mínimo que la hace pasar, y recién entonces refactorizar. Es **agnóstico al lenguaje**: usa `project-docs/project-spec.yaml` (o `project-spec.yaml`, `checks.test`, `runtime.language`) o autodetección para elegir framework y comandos.

> **Cuándo usar:** cuando `spec.md` recomienda TDD en su Metadata (campo `Tecnica de Implementacion`), o cuando la feature introduce lógica con ramas y rutas de error. Para cambios sin lógica nueva ver `implement-ftd`; para integración multi-módulo ver `implement-sdd`.

## Entrada Requerida

- **Spec activo** en `project-docs/progres/current.json` (status `in_progress`) con su `directory` (en `project-docs/specs/`)

## Entrada Opcional

- `project-docs/project-spec.yaml` (o `project-spec.yaml`) — framework, comandos de test/build
- `<spec-dir>/spec.md`, `tasks.md`, `decisions.md`

## Restricciones

> **CRÍTICO:** El refactor (Fase 5) está **acotado al alcance del spec**. Solo se modifica código bajo `## Componentes Afectados`. Cualquier mejora que exhale trabajo de una feature futura se anota como hallazgo en el reporte y **no se implementa**. Esta restricción es la barrera contra el retrabajo: la tentación de "ya que estoy aquí" es la causa más común de specs que se salen de su alcance.

> **CRÍTICO:** El rojo debe **verificarse ejecutando** los tests. Nunca se declara el rojo sin ejecutarlo; un test que pasa de entrada no estaba probando nada.

> **CRÍTICO:** No modificar código fuera de `## Componentes Afectados` en las Fases 1-4. Si el tests-first revela que el spec es incorrecto, parar y reportar; no reescribir el spec sobre la marcha.

## Restricción de Alcance del Refactor (Fase 5)

La fase de refactor solo puede tocar archivos del spec. Para decidir si algo entra o no, aplicar esta regla:

| Situación | ¿Refactor? |
|-----------|-------------|
| El código nuevo tiene duplicación, nombres malos o complejidad evitable **dentro** de los archivos del spec | Sí, refactorizar |
| Un archivo del spec instancia una abstracción compartida con código de otra feature | No — anotar como hallazgo para la feature dueña |
| "Ya que estoy en este archivo, agregaría X que necesita la feature N" | No — anotar como hallazgo |
| Un bug real encontrado por los tests | No — reportar; corregir solo si el spec lo cubre explícitamente |

Los hallazgos van a `<spec-dir>/refactor-findings.md` (crear si no existe) con: descripción, archivo, feature que lo absorbe, y por qué no se hizo ahora.

## Flujo de Ejecución

### Fase 0: Pre-check

1. Leer `project-docs/progres/current.json`. Si es `{}` o no existe: **ABORTAR** con "No hay spec activo. Ejecutar generate-spec primero."
2. Leer `spec.md` → extraer `## Acceptance Criteria` y `## Componentes Afectados`.
3. Determinar framework y comando de test (prioridad: `project-docs/project-spec.yaml` → `project-docs/verify.sh` → autodetección).
4. **Snapshot del baseline**: ejecutar la suite de tests completa ANTES de escribir nada. Registrar tests totales y fallidos. Si ya hay fallos preexistentes, registrarlos — sin ese número no se puede distinguir un rojo propio de un rojo ajeno.

### Fase 1: Red — Escribir los tests

1. Derivar los casos de prueba de cada Acceptance Criterion. Un AC sin ningún caso es un AC sin probar: señalarlo.
2. Cubrir, por cada componente:
   - **Casos de éxito**: entrada válida → salida esperada
   - **Casos de error**: entrada inválida, dependencia ausente, regla de negocio violada
3. Delegar la redacción al skill `write-unit-tests` (respeta la convención de tests del proyecto, el mocking, y el idioma: código de test en inglés, documentación en español).
4. Marcar en `tasks.md` las tareas de tests de esta fase.

### Fase 2: Red — Confirmar el fallo

1. Ejecutar **solo los tests nuevos**.
2. Verificar que fallan, y registrar la salida real del fallo.
3. **Clasificar cada fallo** — este es el punto que hace útil la fase:

| Causa del fallo | Significado | Acción |
|-----------------|-------------|--------|
| El módulo/función aún no existe | Rojo legítimo | Continuar a Fase 3 |
| La función existe pero retorna lo incorrecto | Rojo legítimo | Continuar a Fase 3 |
| El test falla por error del propio test (import, mocks, setup) | **Rojo falso** | Corregir el test antes de continuar |
| El test pasa sin que exista implementación | **Test inútil** | Reescribir el test; está probando nada |

4. **Regla de no-tolerancia**: si un test pasa sin implementación, no se avanza. Un test verde sin código es peor que no tener test, porque da confianza falsa.
5. Adjuntar la salida del fallo a `<spec-dir>/tdd-log.md`.

### Fase 3: Green — Código mínimo

1. Escribir **solo lo necesario** para que los tests de la Fase 1 pasen. Nada más.
2. No agregar validaciones, logging, manejo de casos no requeridos ni abstracciones "para más adelante". Si una feature futura lo necesita, es trabajo futuro.
3. Ejecutar los tests nuevos. Si pasan, ejecutar la **suite completa** para detectar regresiones en el baseline de la Fase 0.
4. Iterar hasta verde.

### Fase 4: Refactor — Acotado al spec

Aplicar la tabla de "Restricción de Alcance del Refactor". Refactorizar solo lo permitido, reejecutando la suite completa después de cada cambio.

### Fase 5: Verificación

1. Ejecutar `project-docs/verify.sh` (o `verify.sh`) del módulo → exit 0.
2. Ejecutar la suite completa con cobertura → registrar números reales.
3. Confirmar que cada AC tiene al menos un test que lo cubra.

### Fase 6: Cierre (tests only) y handoff

1. Marcar en `tasks.md` las tareas de implementación y de tests como `[x]`.
2. Reportar al usuario: comando, tests agregados, rojo observado, cobertura, y el contenido de `refactor-findings.md` si hubo hallazgos.
3. **Entregar a `verify-spec`** — este skill **NO** cierra el spec. El cierre de metadata lo hace `verify-spec`, que debe:
   - Marcar los checkboxes de `spec.md` y `tasks.md`
   - Actualizar `Status` de `spec.md` a `Done`
   - `feature_list.json`: status → `done`, `closedAt` → fecha
   - Agregar el record a `history.json`
   - Resetear `current.json` a `{}`

> Si el usuario pide el cierre dentro de esta skill, delegar explícitamente a `verify-spec` en lugar de hacerlo aquí. `verify-spec` es la única que reconcilia las tres fuentes de verdad.

## Artefactos

| Archivo | Contenido |
|---------|-----------|
| `<spec-dir>/tdd-log.md` | Tests escritos, salida del rojo real, clasificación de cada fallo, código added en Fase 3 |
| `<spec-dir>/refactor-findings.md` | Hallazgos fuera de alcance (puede no existir si no hubo) |

## Notas

- **Agnóstico al lenguaje**: nunca asumir Jest/Node; siempre detectar primero
- **Un spec a la vez**
- **Idempotente**: si se reejecuta tras un fallo, no duplicar tests; leer `tdd-log.md` primero
- **Idioma**: código y nombres de test en inglés, documentación en español

## Siguiente Paso

`verify-spec` para el cierre completo del spec. Si el spec recomienda otra técnica y se restauró, usar `implement-sdd` o `implement-ftd` según corresponda.
