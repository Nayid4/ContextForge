---
name: implement-sdd
description: Use when implementing a spec with Spec-Driven Development. Implements the approved spec phase by phase following its decisions, then delegates test coverage and closure. For multi-module features, data migrations, and external integrations. Language-agnostic. Pairs with generate-spec and hands closure to verify-spec.
---

# Skill: Implementación SDD

## Descripción

Implementa un spec activo siguiendo **Spec-Driven Development**: el spec aprobado es la fuente de verdad y se implementa en el orden de sus fases, respetando las decisiones ya tomadas. No escribe tests primero; la cobertura se genera al final, sobre el código ya implementado. Es **agnóstico al lenguaje**.

> **Cuándo usar:** cuando `spec.md` recomienda SDD en su Metadata, o cuando la feature toca varios módulos, incluye una migración de datos, o integra con sistemas externos. Para lógica aislada con rutas de error ver `implement-tdd`; para cambios sin lógica nueva ver `implement-ftd`.

## Entrada Requerida

- **Spec activo** en `project-docs/progres/current.json` (status `in_progress`) con su `directory`

## Entrada Opcional

- `project-spec.yaml` del módulo — framework, comandos de test/build
- `<spec-dir>/spec.md`, `tasks.md`, `decisions.md`

## Restricciones

> **CRÍTICO:** Las decisiones de `decisions.md` y del documento de decisiones de la fase son **vinculantes**. No se revierten durante la implementación. Si una decisión resulta mala en la práctica, se reporta y se propone una decisión nueva (D-0NN) en el spec, no se cambia en silencio.

> **CRÍTICO:** No ampliar el alcance. Si un componente no está en `## Componentes Afectados`, no se implementa, por obvio que parezca el momento de hacerlo. La tentación de "ya que este archivo se abre igual" es la causa más común de retrabajo.

> **CRÍTICO:** No cerrar el spec desde esta skill. El cierre (incluida la metadata) es de `verify-spec`.

## Flujo de Ejecución

### Fase 0: Pre-check

1. Leer `project-docs/progres/current.json`. Si es `{}` o no existe: **ABORTAR** con "No hay spec activo. Ejecutar generate-spec primero."
2. Leer `spec.md`, `tasks.md` y `decisions.md` completos.
3. **Extraer el contrato del spec** antes de escribir código:
   - `## Acceptance Criteria` → la lista de comportamientos que deben existir al terminar
   - `## Enfoque Tecnico` → arquitectura, modelos, endpoints, servicios, middleware
   - `## Impacto / Componentes Afectados` → **la lista cerrada de archivos a tocar**
   - `## Fuera de Alcance` → **la lista de lo que no se toca**
4. Verificar el estado de las dependencias declaradas. Si alguna está `pending` y el spec la requería, **parar y reportar**: implementar sobre una dependencia ausente produce código que no compila o no prueba nada.
5. Determinar framework y comandos (prioridad: `project-spec.yaml` → `verify.sh` → autodetección).

### Fase 1: Preparación

1. Ejecutar los comandos de build/lint del módulo para confirmar que el punto de partida está limpio. Un fallo preexistente hay que conocerlo antes de atribuirlo a los cambios propios.
2. Confirmar que existen los archivos base que el spec da por hechos (modelos, rutas registradas, variables de entorno). Si el spec se apoya en algo inexistente, parar y reportar.
3. Snapshot de la suite de tests completa (tests totales y fallidos) como baseline.

### Fase 2: Implementación por fases

Implementar **en el orden de `tasks.md`**, fase por fase:

1. Para cada fase de `tasks.md`, marcar las tareas a medida que se completan (`[x]`).
2. Respetar el orden: las tareas de Preparación antes que las de Implementación, etc. El orden existe porque cada fase suele asumir el estado que dejó la anterior.
3. Después de **cada fase**, ejecutar la suite de tests y el build. No acumular cambios de varias fases sin verificar: un fallo de compilación en la Fase 2 puede romper la Fase 3 y perder la trazabilidad de qué lo causó.
4. Si una tarea de `tasks.md` resulta ambigua o imposible, **parar y reportar**; no improvisar una interpretación silenciosa.

### Fase 3: Cobertura de tests

1. Delegar al skill `write-unit-tests` la generación de cobertura sobre el código implementado.
2. Este skill **no** invierte el orden a tests-first: los tests se escriben contra la implementación existente, para cubrir los AC y las rutas de error.
3. Si un AC queda sin cubrir, agregar el caso que falta. Es la diferencia entre "el código hace lo que dice el spec" y "el código tiene la forma que el spec describe".

### Fase 4: Verificación

1. Ejecutar `verify.sh` del módulo → exit 0.
2. Ejecutar la suite completa con cobertura → registrar números reales.
3. Para cada AC, señalar la evidencia (código + test) que lo respalda.

### Fase 5: Cierre (tests only) y handoff

1. Marcar en `tasks.md` las tareas de implementación y de tests como `[x]`.
2. Reportar: fases ejecutadas, archivos modificados, cobertura, y cualquier decisión que haya resultado contradictoria con la práctica.
3. **Entregar a `verify-spec`** — este skill **NO** cierra el spec. El cierre de metadata lo hace `verify-spec`, que debe:
   - Marcar los checkboxes de `spec.md` y `tasks.md`
   - Actualizar `Status` de `spec.md` a `Done`
   - `feature_list.json`: status → `done`, `closedAt` → fecha
   - Agregar el record a `history.json`
   - Resetear `current.json` a `{}`

> Si el usuario pide el cierre dentro de esta skill, delegar explícitamente a `verify-spec`. `verify-spec` es la única que reconcilia las tres fuentes de verdad.

## Diferencia con implement-tdd

| | implement-sdd | implement-tdd |
|---|---|---|
| Orden | código primero, tests después | tests primero (rojo verificado), código después |
| Riesgo principal | implementar más de lo que el spec pide | sobre-ingeniería para hacer pasar un test |
| Decisiones | se siguen al pie de la letra; se cuestionan por report | pueden ajustarse durante la implementación |
| Refactor | no hay fase propia; el código se escribe ya limpio | fase explícita acotada a los componentes del spec |

## Notas

- **Agnóstico al lenguaje**: nunca asumir Jest/Node; siempre detectar primero
- **Un spec a la vez**
- **Idioma**: código en inglés, documentación en español

## Siguiente Paso

`verify-spec` para el cierre completo del spec.
