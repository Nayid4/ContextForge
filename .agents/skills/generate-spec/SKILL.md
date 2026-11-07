---
name: generate-spec
description: Use when generating technical specifications for features. Reads feature_list.json, creates detailed spec with tasks and decisions in project-docs/<module>/specs/. Follows OpenSpec + Harness Engineering practices.
---

# Skill: Generador de Specs Tecnicos

## Descripcion

Genera especificaciones tecnicas detalladas para features del proyecto, combinando las practicas de **OpenSpec** (estructura clara, acceptance criteria, enfoque tecnico) y **Harness Engineering** (tasks detalladas, decisiones documentadas, impacto analizado).

Cada spec se almacena en un directorio organizado con contador dentro de `project-docs/<module>/specs/`.

Los archivos de progreso (`current.json`, `history.json`) estan en formato JSON para procesamiento programatico.

> **MODELO DE TRABAJO:** Este skill se ejecuta habitualmente en **modo plan**. La planeacion del spec es una discusion entre el agente y el usuario en el chat. **NO se escriben archivos** durante la planeacion. Solo al obtener la aprobacion del usuario (y si es necesario en modo build/agente) se escriben los archivos del spec y se actualizan los estados.

## Restricciones

> **CRITICO:** Solo ejecutar si se cumplen TODOS los prerequisitos. Nunca forzar la ejecucion.

> **CRITICO (Pre-check):** Antes de cualquier otra accion, verificar **solo mediante la lectura** de `project-docs/progres/current.json` si hay una feature en ejecucion. Si hay una feature activa, **interrumpir la interaccion** e informar al usuario; no continuar.

## Prerequisitos

### 1. No debe haber un spec en proceso (solo lectura)

Verificar: `project-docs/progres/current.json`
- Leer el archivo. Si tiene contenido (no es `{}`): **INTERRUMPIR** e informar al usuario "Ya hay un spec en proceso: [feature name] (status: [status]). Finalizar el spec actual antes de crear uno nuevo." No continuar.
- Si el archivo NO existe o es `{}`: puede continuar. (Paso obligatorio antes de cualquier cosa; no se modifica el archivo en este paso.)

### 2. feature_list.json debe existir

Verificar: `project-docs/feature_list.json`
Si NO existe: ABORTAR con mensaje "No existe feature_list.json. Ejecutar requirements-analysis primero."

### 3. history.json debe existir

Verificar: `project-docs/progres/history.json`
Si NO existe, anotarlo: se creara al momento de cerrar el spec (Paso de cierre). No requiere accion en la planeacion.

## Flujo de Ejecucion

> **IMPORTANTE:** Los Pasos 1 a 4 (planeacion) ocurren EN EL CHAT, sin escribir archivos. Solo al obtener aprobacion (Paso 5) y ejecutar en modo build/agente se persisten los archivos y estados (Paso 6).

### Paso 1: Recopilar Informacion

**1.1 Nombre de la feature** (input obligatorio)

Solicitar al usuario el nombre de la feature. Debe coincidir con el campo `name` de alguna feature en `feature_list.json`.

Si el usuario no sabe el nombre exacto, mostrar la lista de features pendientes:
- Leer feature_list.json
- Filtrar features donde status = "pending"
- Mostrar: id, name, title, module, priority

**1.2 Contexto adicional** (input opcional)

Preguntar: "Deseas agregar contexto adicional al spec? (URLs de referencia, notas, restricciones especiales)"
Si el usuario proporciona contexto, incluirlo en la seccion "Contexto Adicional" del spec (se mantiene esta seccion tal como estaba).

**1.3 Responsable** (input obligatorio)

Preguntar: "Quien es el responsable de este spec?"
El valor se guarda en el campo `responsable` de `current.json`. (Esta pregunta se mantiene tal como estaba.)

### Paso 2: Analizar la Feature (solo lectura, en el chat)

**2.1 Leer feature_list.json**

Cargar el JSON completo y ubicar la feature seleccionada por su campo `name`.

**2.2 Extraer datos de la feature**

- `id` - Numero de feature
- `name` - Nombre kebab-case
- `title` - Titulo descriptivo
- `type` - feature / user-story / use-case
- `description` - Descripcion detallada
- `module` - backend / frontend / infra / docs
- `priority` - alta / media / baja
- `acceptance` - Criterios de aceptacion
- `documentation` - Rutas a docs referenciadas
- `dependencies` - IDs de features dependientes
- `estimatedComplexity` - low / medium / high

**2.3 Leer documentacion referenciada**

Para cada ruta en `documentation`, leer el archivo correspondiente para obtener contexto adicional relevante al spec.

**2.4 Analizar dependencias**

Para cada ID en `dependencies`, buscar la feature correspondiente en `feature_list.json` y verificar su status:
- Si tiene status `done`: documentar como dependencia cumplida
- Si tiene status `pending` o `in_progress`: documentar como dependencia pendiente y advertir al usuario

### Paso 3: Planear el Spec (en el chat, NO escribir archivos)

Determinar, para la discusion con el usuario:

**3.1 Determinar modulo**

Usar el campo `module` de la feature (backend, frontend, infra, docs).

**3.2 Calcular contador del directorio**

- Listar los subdirectorios existentes en `project-docs/<module>/specs/` (solo lectura)
- Si no hay directorios: contador = `000`
- Si hay directorios: **`contador = max(NNN) + 1`**, donde `NNN` es el prefijo numérico de cada directorio, con ceros a la izquierda (3 dígitos)

> **CRITICO:** Usar `max(NNN) + 1`, **NO** la cantidad de directorios. Contar directorios solo coincide con `max+1` si la numeración es contigua desde 000 y no hay directorios vacíos ni abandonos. En cuanto existe un directorio sin archivos o un hueco, contar produce un número que colisiona con uno existente. Extraer el número con `ls | sed 's/-.*//'` y tomar el máximo.

- Verificar que el directorio calculado **no exista** antes de crearlo. Si existe, es una colisión: reportar y pedir confirmación en vez de sobrescribir.
- El nuevo directorio será: `<NNN>-<feature-name>/`

Ejemplo:
```
project-docs/backend/specs/
+-- 000-project-crud/
+-- 001-document-crud/      <- si este es el siguiente
+-- 002-rule-crud-recursive/ <- este seria el nuevo
```

**3.3 Elaborar el contenido del spec y presentarlo al usuario**

Redactar en el chat el contenido propuesto para:
- **spec.md** - Metadata, Contexto, Objetivo, Acceptance Criteria, Enfoque Tecnico, Dependencias, Impacto, Testing, Riesgos, Fuera de Alcance.
- **tasks.md** - Lista de tareas por fase (Preparacion, Implementacion, Testing, Cierre).
- **decisions.md** - Decisiones tecnicas con alternativas y razon.

Presentar este contenido al usuario como una propuesta de spec (**modo plan**). No crear aun directorios ni archivos.

### Paso 4: Discutir e Iterar con el Usuario

**4.1 Mostrar la propuesta**

Presentar al usuario:
- Feature seleccionada
- Directorio propuesto (con contador calculado)
- Resumen del enfoque tecnico
- Cantidad de tareas propuestas
- Dependencias identificadas
- Contenido detallado del spec (Enfoque Tecnico, Acceptance Criteria, Tasks, Decisiones)

**4.2 Discutir cambios**

Preguntar: "Que te parece esta propuesta de spec? Puedo ajustar el enfoque, las tareas, las decisiones o el alcance antes de aprobarla."

Iterar en el chat hasta que el usuario este satisfecho. Este skill, en modo plan, NO crea archivos durante esta discusion.

### Paso 5: Solicitar Aprobacion

**5.1 Confirmar aprobacion**

Preguntar explicitamente: "Confirmas y apruebas este spec para proceder a escribirlo y activarlo?"

Si el usuario NO aprueba: seguir discutiendo/ajustando en el chat. No escribir nada.

Si el usuario SI aprueba: continuar. **Si es necesario, pedir al usuario o confirmar pasar a modo build/agente** para escribir los archivos y actualizar estados.

### Paso 6: Escribir y Activar el Spec (SOLO tras aprobacion, en build/agente)

> **CRITICO:** Los pasos de este bloque SOLO se ejecutan DESPUES de la aprobacion humana y en modo build/agente. Nunca automaticamente en modo plan.

**6.1 Crear directorio del spec**

```
mkdir -p project-docs/<module>/specs/<NNN>-<feature-name>/
```

**6.2 Generar archivos del spec**

Crear 3 archivos dentro del directorio con el contenido acordado durante la discusion:
- `spec.md` (ver "Template spec.md") - con Status "In Progress"
- `tasks.md` (ver "Template tasks.md")
- `decisions.md` (ver "Template decisions.md")

**6.3 Actualizar current.json**

Sobrescribir `project-docs/progres/current.json` con la informacion del spec aprobado.

Ver "Template current.json" al final.

**6.4 Actualizar feature_list.json**

Actualizar el campo `status` de la feature en `feature_list.json` de "pending" a "in_progress".

**6.5 Gate de activacion (OBLIGATORIO, no omitir)**

> **CRITICO:** Este gate existe porque el modo plan/build hace que la activacion se ejecute a medias. Un spec con archivos escritos pero sin `current.json` ni `feature_list` actualizados deja el proyecto en un estado donde nadie sabe que hay un spec en curso, y el siguiente `generate-spec` abre otro en paralelo. **Nunca reportar "Spec activado" sin pasar por aca.**

Antes de confirmar la activacion, verificar las 5 condiciones:

| # | Condicion | Como verificar |
|---|-----------|----------------|
| 1 | El directorio del spec existe | `ls -d project-docs/<module>/specs/<NNN>-<name>/` |
| 2 | `spec.md`, `tasks.md` y `decisions.md` existen y estan **no vacios** | `wc -l` de cada uno; un archivo de 0 bytes es un spec a medio escribir |
| 3 | `current.json` NO es `{}` y su `directory` apunta al spec creado | leer el JSON y comparar |
| 4 | `feature_list.json` tiene la feature en `in_progress` | leer el JSON y comparar |
| 5 | La numeracion del directorio no colisiona con otro existente | `ls project-docs/<module>/specs/ \| grep '^<NNN>-'` debe devolver exactamente 1 linea |

Si **cualquiera** falla: **NO** confirmar la activacion. Reparar el paso que falta y volver a correr este gate. Si la falla viene de haber quedado en modo plan sin persistir, hay que pasar explicitamente a build/agente y ejecutar el Paso 6 completo.

**6.6 Confirmar activacion** (solo si el gate paso)

Informar al usuario:
- "Spec activado correctamente"
- "current.json actualizado"
- "feature_list.json actualizado a in_progress"
- "Directorio: project-docs/<module>/specs/<NNN>-<feature-name>/"
- "Tecnica de implementacion recomendada: **<tdd|sdd|ftd>** - ver Paso 9"

### Paso 7: Cerrar el Spec (cuando la implementacion termina)

> **Recomendado:** Ejecutar el skill `verify-spec` antes de este paso. Solo cierra el spec si `verify-spec` reporta el resultado como APROBADO (acceptance criteria, tasks, tests unitarios con cobertura, tests de API si aplica, y `project-docs/verify.sh` en verde).

Una vez que la implementacion esta completa y aprobada:

**7.1 Marcar checkboxes del spec**

Marcar `[x]` en `spec.md` (Acceptance Criteria) y en `tasks.md` (todas las tareas completadas).

**7.2 Actualizar Status del spec.md**

En la tabla `## Metadata` de `spec.md`, cambiar `| Status | In Progress |` por `| Status | Done |`.

> **CRITICO:** Este paso es obligatorio. Sin el, el spec queda marcado "In Progress" para siempre mientras la feature dice `done` en `feature_list.json`, y las tres fuentes de verdad dejan de coincidir. El vocabulario de Status es exactamente `In Progress` / `Done`; no inventar otros valores.

**7.3 Agregar registro a history.json**

Leer `project-docs/progres/history.json` y agregar un nuevo record al array `records`:

```json
{
  "featureId": <id>,
  "featureName": "<name>",
  "module": "<module>",
  "specDir": "<NNN>-<feature-name>",
  "responsable": "<responsable>",
  "status": "done",
  "date": "<fecha actual>"
}
```

**7.4 Limpiar current.json**

Sobrescribir `project-docs/progres/current.json` con `{}`.

**7.5 Actualizar feature_list.json**

Actualizar el campo `status` de la feature en `feature_list.json` de "in_progress" a "done", y `closedAt` a la fecha actual.

### Paso 8: Reconciliacion (OBLIGATORIO al cerrar)

> **CRITICO:** Ningun spec se considera cerrado hasta que las tres fuentes de verdad coinciden. El drift entre ellas es silencioso: no rompe nada en el momento, y aparece semanas despues como historial incompleto o features `done` sin registro.

Ejecutar esta comprobacion al cerrar, y **antes de reportar el cierre**:

| Assert | Consulta | Si falla |
|--------|----------|----------|
| El spec dice `Done` | `\| Status \| Done \|` en `spec.md` | Re-ejecutar 7.2 |
| La feature dice `done` | `feature_list.json` → `status` | Re-ejecutar 7.5 |
| Existe su record en el historial | `history.json` → `records[]` con ese `featureId` | Re-ejecutar 7.3 |
| No hay `done` sin record | todo `featureId` con `status: done` existe en `history.json` | Investigar: la feature se cerro sin registrar |
| No hay specs a medio escribir | ningun directorio de `specs/` sin `spec.md` | Eliminar el directorio vacio (nunca commiteado) o completar el spec |
| `current.json` quedo en `{}` | leer el JSON | Re-ejecutar 7.4 |

**Nunca cerrar un spec con asserts en rojo.** Si un assert no se puede satisfacer, reportarlo al usuario con el detalle en vez de dar por cerrado.

### Paso 9: Recomendar tecnica de implementacion

Con el spec ya escrito y activado, determinar con que técnica de las tres conviene implementarlo, y **escribir la recomendación en el Metadata de `spec.md`** (fila `| Tecnica de Implementacion |`), para que la skill de implementación correspondiente la lea al ejecutarse.

#### Criterios de seleccion

| Señal en el spec | Tecnica | Skill |
|------------------|---------|-------|
| Reglas de negocio, validaciones, permisos, cualquier rama con ruta de error; la logica se puede aislar en funciones puras | **TDD** | `implement-tdd` |
| Multi-modulo, migracion de datos, integracion con servicios externos, o decisiones tecnicas que deben seguirse al pie de la letra | **SDD** | `implement-sdd` |
| Sin logica nueva: constantes, labels, estilos, textos, config, retoques menores de UI; el diff se lee de una pasada | **FTD** | `implement-ftd` |

#### Como decidir cuando el spec es mixto

Un spec puede tener partes con tecnicas distintas. En ese caso **recomendar una sola tecnica principal** y justificar:

1. **La parte mas riesgosa manda.** Si hay una migracion de datos y ademas un ajuste de labels, la migracion define la tecnica (SDD), porque es lo que puede fallar de forma irreversible.
2. **El numero de AC con logica decide.** Si la mayoria de los AC son verificables por inspeccion, es FTD aunque uno exija un test.
3. **Ante la duda, elegir la mas rigida.** TDD o SDD sobre FTD. FTD es la unica que no produce tests de comportamiento nuevos, y equivocarse en esa direccion cuesta un retrabajo; equivocarse al revés cuesta un test de más.

#### Salida esperada

Reportar al usuario, con el razon en una linea:

```
Tecnica de implementacion recomendada: <tdd|sdd|ftd>
Razon: <por que esta feature califica en esa tecnica>
```

Si el usuario no acepta la recomendacion, registrarla igualmente en el Metadata de `spec.md` con la eleccion suya. El campo existe para que la decision quede escrita, no para que el agente la imponga.

## Estados del Spec

El sistema define 3 estados claros para un spec:

| Estado | Directorio existe | current.json | feature_list.json status | spec.md Status |
|--------|-------------------|--------------|--------------------------|----------------|
| **Definido, no aprobado** | No (solo propuesto en chat) | `{}` | `pending` | (no existe) |
| **Aprobado, en progreso** | Si (3 archivos, gate 6.5 aprobado) | Con datos | `in_progress` | `In Progress` |
| **Completado** | Si | `{}` | `done` | `Done` |

**Flujo:**
```
pending → (discutir en chat, modo plan) → pending (propuesto, sin archivos)
pending → (aprobar + build/agente + gate 6.5) → in_progress (activado con archivos)
in_progress → (implementar + verify-spec + reconciliar Paso 8) → done (completado)
```

> En modo plan, tras la aprobacion se pasan a build/agente para escribir el directorio y los archivos, y activar el spec. `current.json` deja de ser `{}` solo despues de la activacion, y solo se declara activada cuando el gate 6.5 pasa completo.

> **Nota sobre el cierre:** en la practica el cierre lo ejecuta `verify-spec` (su Paso 4), no este skill. Ambos describen el mismo cierre y ambos deben incluir el Status de `spec.md` y la reconciliacion del Paso 8. Si se modifican las reglas de cierre, hay que actualizarlos en los dos skills a la vez.

## Templates

### Template spec.md

```markdown
# Spec: <title de la feature>

## Metadata

| Campo | Valor |
|-------|-------|
| Feature ID | <id> |
| Feature Name | <name> |
| Module | <module> |
| Priority | <priority> |
| Complexity | <estimatedComplexity> |
| Type | <type> |
| Status | In Progress |
| Tecnica de Implementacion | (se completa en el Paso 9: tdd / sdd / ftd) |
| Responsable | <responsable> |
| Created | <fecha actual> |

## Contexto

<descripcion de la feature extraida de feature_list.json>

### Contexto Adicional

<si el usuario proveyo contexto adicional, incluirlo aqui. Si no, omitir esta sub-seccion.>

## Historia de Usuario (Scrum User Story)

> **COMO** <rol del usuario / desarrollador / QA>,
> **QUIERO** <capacidad tecnica o funcional>,
> **PARA** <beneficio de negocio o valor tecnico>.

## Definicion de Listo (Definition of Ready - DoR)

- [x] <criterio DoR 1: alcance claro, dependencias identificadas>
- [x] <criterio DoR 2: rama git INT-* creada>

## Definicion de Hecho (Definition of Done - DoD)

- [ ] Subtarea de desarrollo (DEV) completada con codigo y tests unitarios
- [ ] Subtarea de QA verificada con criterios de aceptacion y evidencias
- [ ] Capturas de pantalla generadas y guardadas en project-docs/specs/.../evidence/
- [ ] Documento evidence.md consolidado
- [ ] 100% de tests en verde en project-docs/verify.sh

## Objetivo

<objetivo claro y conciso de lo que se debe lograr con esta feature>

## Acceptance Criteria

<lista de acceptance criteria extraidos de feature_list.json, reformulados si es necesario>

- [ ] <criterio 1>
- [ ] <criterio 2>
- [ ] <criterio N>

## Enfoque Tecnico

### Arquitectura

<descripcion del enfoque tecnico propuesto>

### Modelos de Datos

<campos nuevos o modificaciones a modelos existentes. Incluir schema Mongoose si aplica.>

### Endpoints

<endpoints a crear o modificar, con metodo, ruta, body esperado, response esperado>

### Servicios

<logica de negocio a implementar, servicios a crear o modificar>

### Middleware

<middleware requerido (validacion, auth, upload, etc)>

## Dependencias

### Features Dependientes

<lista de features de las que depende este spec, con su status actual>

### Dependencias Tecnicas

<librerias, servicios externos, o configuraciones necesarias>

## Impacto

### Componentes Afectados

<lista de archivos/directorios que se veran afectados>

### Cambios Requeridos

<descripcion de los cambios necesarios en componentes existentes>

## Testing

<estrategia de testing para esta feature: unit tests, integration tests, API tests>

## Riesgos

<riesgos identificados y mitigaciones propuestas>

## Fuera de Alcance

<que NO se implementa en este spec>
```

### Template tasks.md

```markdown
# Tasks: <title de la feature>

## Resumen

- Feature: <name> (ID: <id>)
- Modulo: <module>
- Tecnica: <tdd | sdd | ftd> (ver Paso 9 de `generate-spec`)
- Responsable: <responsable>
- Total tareas: <N>
- Completadas: 0

## Subtareas Jira (Pistas DEV & QA)

### Subtarea DEV: INT-<id>-DEV — Implementacion Tecnica
- **Asignado a**: implementer
- **Estado**: in_progress
- [ ] T1 — <tarea tecnica 1>
- [ ] T2 — <tarea tecnica 2>
- [ ] T3 — <tests unitarios / integracion>

### Subtarea QA: INT-<id>-QA — Validacion de Criterios y Captura de Evidencias
- **Asignado a**: reviewer
- **Estado**: todo
- [ ] TC-01 — <caso de prueba feliz>
- [ ] TC-02 — <caso de prueba limites / BVA>
- [ ] TC-03 — <captura de screenshots en evidence/ y redaccion de evidence.md>

## Tareas por Fases

### Fase 1: Preparacion

- [ ] <tarea de preparacion 1>
- [ ] <tarea de preparacion 2>

### Fase 2: Implementacion

- [ ] <tarea de implementacion 1>
- [ ] <tarea de implementacion 2>
- [ ] <tarea de implementacion N>

### Fase 3: Testing

- [ ] <tarea de testing 1>
- [ ] <tarea de testing 2>
- [ ] Escribir tests unitarios (cobertura de codigo) - ver skill `write-unit-tests`
  - (TDD: la cobertura se escribe en la Fase 1, antes del codigo - ver `implement-tdd`)

### Fase 4: Cierre

- [ ] <tarea de cierre 1>
- [ ] Ejecutar skill `verify-spec` (valida acceptance criteria, tasks, tests unitarios, tests de API y project-docs/verify.sh antes de cerrar)
- [ ] Actualizar `Status` de `spec.md` a `Done`
- [ ] Actualizar feature_list.json status a "done" y `closedAt`
- [ ] Agregar record a history.json
- [ ] Resetear current.json a `{}`
- [ ] Reconciliar las tres fuentes de verdad (Paso 8 de `generate-spec`)
- [ ] Sincronizar skills si aplica
```

### Template decisions.md

```markdown
# Decisiones: <title de la feature>

## Feature

- ID: <id>
- Name: <name>
- Module: <module>

## Decisiones Tecnicas

### D-001: <titulo de la decision>

- **Fecha:** <fecha>
- **Contexto:** <por que se tomo esta decision>
- **Alternativas:**
  - <alternativa A> - <pros/contras>
  - <alternativa B> - <pros/contras>
- **Decision:** <que se decidio>
- **Razon:** <por que se decidio esto>

### D-002: <titulo de la decision>

...

## Notas

<notas adicionales o restricciones conocidas durante la creacion del spec>
```

### Template current.json

Estado vacio (sin spec en proceso):

```json
{}
```

Estado con spec en proceso:

```json
{
  "feature": {
    "id": 2,
    "name": "document-crud",
    "title": "CRUD de Documentos/Entregables",
    "module": "backend",
    "priority": "alta"
  },
  "responsable": "Andres Osorio",
  "status": "in_progress",
  "directory": "project-docs/backend/specs/001-document-crud",
  "created": "2026-08-19",
  "tasks": [
    { "title": "Crear documentController.js", "done": false },
    { "title": "Crear documents.js routes", "done": false },
    { "title": "Registrar rutas en index.js", "done": false },
    { "title": "Testing endpoints documentos", "done": false }
  ]
}
```

Campos de current.json:

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| feature.id | number | ID de la feature en feature_list.json |
| feature.name | string | Nombre kebab-case de la feature |
| feature.title | string | Titulo descriptivo |
| feature.module | string | Modulo afectado (backend, frontend, infra, docs) |
| feature.priority | string | Prioridad (alta, media, baja) |
| responsable | string | Nombre del responsable del spec |
| status | string | Siempre "in_progress" (se limpia a {} al cerrar) |
| directory | string | Ruta relativa al directorio del spec |
| created | string | Fecha de creacion YYYY-MM-DD |
| tasks | array | Lista de tareas con titulo y estado |

### Template history.json

Estado inicial:

```json
{
  "records": []
}
```

Estado con registros:

```json
{
  "records": [
    {
      "featureId": 1,
      "featureName": "project-crud",
      "module": "backend",
      "specDir": "000-project-crud",
      "responsable": "Andres Osorio",
      "status": "done",
      "date": "2026-08-19"
    },
    {
      "featureId": 2,
      "featureName": "document-crud",
      "module": "backend",
      "specDir": "001-document-crud",
      "responsable": "Andres Osorio",
      "status": "done",
      "date": "2026-08-20"
    }
  ]
}
```

Campos de cada record en history.json:

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| featureId | number | ID de la feature |
| featureName | string | Nombre kebab-case |
| module | string | Modulo afectado |
| specDir | string | Nombre del directorio del spec (sin ruta completa) |
| responsable | string | Nombre del responsable |
| status | string | "done" (solo specs completados entran al historial) |
| date | string | Fecha de cierre YYYY-MM-DD |
