---
name: implement-ftd
description: Use when making a small low-risk change with no new logic - constants, labels, styles, copy, config values or minor UI tweaks. Edits, verifies manually, runs regression tests and hands closure to verify-spec. Language-agnostic. For changes that introduce a branch, use implement-tdd or implement-sdd.
---

# Skill: Implementación FTD (Fast Traditional Development)

## Descripción

Implementa cambios pequeños y de bajo riesgo que **no introducen lógica nueva**: valores de constantes, etiquetas, estilos, textos, configuración o retoques menores de UI. Aplica el cambio, lo verifica, y corre la suite existente como red de seguridad. Es **agnóstico al lenguaje**.

> **FTD no significa "sin verificar".** Significa que la verificación no necesita ser tests-first porque no hay comportamiento nuevo que probar. Un cambio de valor puede seguir siendo un bug si el valor estaba mal; por eso igual se ejecuta la suite.

> **Cuándo usar:** cuando `spec.md` recomienda FTD en su Metadata, o cuando el cambio es acotado y verificable por inspección. Si el cambio introduce una rama de decisión, no es FTD: ver la tabla de exclusión más abajo.

## Entrada Requerida

- **Spec activo** en `project-docs/progres/current.json` (status `in_progress`) con su `directory`

## Entrada Opcional

- `project-docs/project-spec.yaml` (o `project-spec.yaml`) del módulo
- `<spec-dir>/spec.md`, `tasks.md`

## Tabla de Exclusión — Cuándo NO usar FTD

FTD aplica solo si **todas** estas condiciones se cumplen:

| Condición | Por qué |
|-----------|---------|
| No introduce ninguna rama, condicional ni cálculo nuevo | Un condicional es comportamiento, y el comportamiento se prueba |
| No cambia un contrato de datos (schema, tipo, firma de función) | Un contrato roto falla lejos de su causa |
| No agrega un endpoint ni modifica uno existente | Un endpoint necesita pruebas de API (`api-test-plan`) |
| No toca lógica de negocio ni reglas de validación | Las reglas son donde TDD rinde |
| No requiere migración ni transformación de datos existentes | Una migración necesita verificación contra datos reales |
| El cambio es legible en una revisión de un minuto | Si hay que buscar para entender el diff, no es un cambio pequeño |

**Si al menos una condición falla, no es FTD.** Elegir `implement-tdd` (lógica con ramas y rutas de error) o `implement-sdd` (integración, migraciones, multi-módulo) según la feature.

Ejemplos que **sí** son FTD:

- Agregar un valor a un array de constantes ya existente
- Cambiar el texto de una etiqueta o el color de un badge
- Ajustar un token de estilo o el orden de un selector
- Cambiar un valor de configuración o un timeout
- Agregar un item a una lista de navegación estática

Ejemplos que **no** son FTD:

- Agregar un permiso que un middleware debe evaluar (regla de negocio)
- Cambiar la forma de un documento guardado (contrato de datos)
- Agregar un campo que se calcula según otro campo (rama)

## Restricciones

> **CRÍTICO:** No agregar tests nuevos de comportamiento para un cambio FTD. Lo que sí se hace es correr la suite existente completa, para confirmar que el cambio no rompió nada. Un test nuevo para "el color es azul" no aporta nada que la revisión del diff no dé.

> **CRÍTICO:** Si durante la implementación aparece que el cambio **sí** introduce lógica, parar. No continuar en FTD: cambiar a `implement-tdd` o `implement-sdd` y reportar el cambio de técnica. Descubrirlo a mitad de un cambio ya es caro; descubrirlo al revisar el diff, más.

> **CRÍTICO:** No cerrar el spec desde esta skill. El cierre (incluida la metadata) es de `verify-spec`.

## Flujo de Ejecución

### Fase 0: Pre-check

1. Leer `project-docs/progres/current.json`. Si es `{}` o no existe: **ABORTAR** con "No hay spec activo. Ejecutar generate-spec primero."
2. Leer `spec.md` → extraer `## Acceptance Criteria` y `## Componentes Afectados`.
3. **Validar la tabla de exclusión** contra el cambio concreto. Dejar por escrito cuál de las seis condiciones falla si fuera el caso. Si falla alguna, abortar y recomendar la técnica correcta.
4. Determinar framework y comandos de test/build.

### Fase 1: Baseline

1. Ejecutar la suite de tests completa **antes** de tocar nada. Registrar el número.
2. Ejecutar el build/lint del módulo para confirmar que el punto de partida está limpio.
3. Este número es la referencia: sin él, un fallo posterior no se puede atribuir.

### Fase 2: Implementación

1. Aplicar el cambio, acotado a `## Componentes Afectados`.
2. **Revisar el diff completo** al terminar. El diff de un cambio FTD debe leerse de un tirón; si no se entiende en una pasada, el cambio excede el alcance y hay que volver a evaluar la técnica.
3. Buscar en el código los otros lugares donde el valor editado aparece: un cambio en una constante suele tener un espejo en el frontend, y forgetting ese espejo es la causa más común de que un cambio "FTD" se manche a medio camino.

### Fase 3: Verificación

1. Ejecutar la suite de tests completa → comparar contra el baseline de la Fase 1. Cualquier test nuevo en rojo es regresión de este cambio.
2. Ejecutar `project-docs/verify.sh` (o `verify.sh`) del módulo → exit 0.
3. Verificar cada AC **por inspección del diff**, no por test nuevo. Para cada AC, señalar la línea del diff que lo satisface.
4. Si el cambio es visual, describir cómo comprobarlo a mano (ruta de la pantalla, qué mirar), porque la suite no lo cubre.

### Fase 4: Cierre (tests only), Registro en Modelo Plane SQLite + Markdown y Handoff

1. Marcar en `tasks.md` las tareas de implementación como `[x]`. La tarea de tests unitarios **no se marca como agregada por este skill**: si el spec la exige y este cambio no la satisface, es señal de que la técnica correcta era otra. Reportarlo.
2. Enviar el registro del cambio ágil FTD y la verificación de regresión al modelo relacional SQLite (`harness.db`) y al espejo Markdown:
   ```bash
   node project-docs/cli.js issue update INT-<NNN> --state in_review --role implementer
   node project-docs/cli.js issue comment INT-<NNN> --role implementer --skill implement-ftd --message "Cambio FTD aplicado y verificado contra suite de regresion"
   node project-docs/cli.js ai log --skill implement-ftd --role implementer --issue INT-<NNN> --type FTD_IMPLEMENTATION --summary "Implementacion agil FTD verificada por diff y suite de regresion"
   node project-docs/sync-data.js
   ```
3. Reportar: qué se cambió, evidencia por AC, resultado de la suite comparado con el baseline.
4. **Entregar a `verify-spec`** — este skill **NO** cierra el spec. El cierre de metadata lo hace `verify-spec`, que debe:
   - Marcar los checkboxes de `spec.md` y `tasks.md`
   - Actualizar `Status` de `spec.md` a `Done`
   - `feature_list.json`: status → `done`, `closedAt` → fecha
   - Agregar el record a `history.json`
   - Resetear `current.json` a `{}`

## Notas

- **Agnóstico al lenguaje**: nunca asumir Jest/Node; siempre detectar primero
- **Un spec a la vez**
- **Idioma**: código en inglés, documentación en español
- **Es la única de las tres técnicas donde la cobertura no es el mecanismo de verificación**; la revisión del diff y la suite de regresión lo son

## Siguiente Paso

`verify-spec` para el cierre completo del spec.
