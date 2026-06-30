# Spec Driven Development (SDD)

> Este repositorio sigue un flujo Kiro-style: requirements → design → tasks → code.
> El código no se escribe hasta que el spec está aprobado por un humano.
> **El spec es el contrato.** Si no está en el spec, no existe.

---

## Tabla de contenidos

1. [Filosofía SDD](#1-filosofía-sdd)
2. [Estructura del spec](#2-estructura-del-spec)
3. [Ciclo de vida de una feature](#3-ciclo-de-vida-de-una-feature)
4. [La puerta de aprobación humana](#4-la-puerta-de-aprobación-humana)
5. [requirements.md — EARS](#5-requirementsmd--ears)
6. [design.md — decisiones técnicas](#6-designmd--decisiones-técnicas)
7. [tasks.md — checklist ejecutable](#7-tasksmd--checklist-ejecutable)
8. [Trazabilidad R ↔ Tests](#8-trazabilidad-r--tests)
9. [Definition of Ready (DoR)](#9-definition-of-ready-dor)
10. [Definition of Done (DoD)](#10-definition-of-done-dod)
11. [Manejo de cambios en el spec](#11-manejo-de-cambios-en-el-spec)
12. [Revisión del spec (spec review)](#12-revisión-del-spec-spec-review)
13. [Revisión de la implementación (reviewer)](#13-revisión-de-la-implementación-reviewer)
14. [Ejemplos completos](#14-ejemplos-completos)
15. [Anti-patrones](#15-anti-patrones)
16. [Checklist rápido del spec_author](#16-checklist-rápido-del-spec_author)

---

## 1. Filosofía SDD

### Por qué SDD

| Problema                                           | Solución SDD                                            |
| -------------------------------------------------- | ------------------------------------------------------- |
| El código no resuelve lo que el negocio necesita   | Requirements escritas en EARS antes de escribir código  |
| Ambigüedad entre lo que se pide y lo que se entrega | Spec revisado y aprobado por humano antes de codificar |
| Scope creep durante implementación                 | Design documenta decisiones, tasks acotan el alcance    |
| Tests que no prueban lo importante                 | Trazabilidad R ↔ Tests obligatoria                     |
| Dificultad para estimar                            | Tasks desglosan el trabajo en pasos discretos           |

### Principios

1. **Write specs, not code first.** El código es la implementación de una decisión,
   no la decisión misma. Las decisiones se capturan en `design.md`.
2. **Un spec, una feature.** Sin solapamiento. Sin mezclar features.
3. **El spec es binario: aprobado o no.** No hay "casi listo".
4. **El humano decide.** La IA propone, el humano dispone.
5. **Todo requirement es verificable.** Si no se puede testear, no es un requirement.

---

## 2. Estructura del spec

Cada feature con `"sdd": true` en `feature_list.json` tiene su carpeta dedicada:

```
specs/
└── {NNN}_{feature_name}/           ← nombre con id de 3 dígitos + snake_case
    ├── requirements.md             ← QUÉ (EARS notation)
    ├── design.md                   ← CÓMO (decisiones técnicas + ADRs)
    └── tasks.md                    ← PASOS (checkbox ejecutable)
```

### Convención de nombres

| Elemento              | Formato                          | Ejemplo                         |
| --------------------- | -------------------------------- | ------------------------------- |
| Carpeta de spec       | `{NNN}_{snake_case_name}`        | `001_user_registration`         |
| Rama de feature       | `feature/{NNN}_{snake_case_name}`  | `feature/001_user_registration` |
| Archivos del spec     | Fijos: `requirements.md`, `design.md`, `tasks.md` | —            |

El `NNN` es el id de 3 dígitos (001, 002, ..., 010, ...) que coincide con
`feature_list.json`.

---

## 3. Ciclo de vida de una feature

### Diagrama de estados

```
                ┌──────────────────────────────────────────────────────┐
                │                                                      │
                ▼                                                      │
┌─────────┐  ┌──────────┐  ⏸  ┌───────────────┐  ┌────────┐  ┌──────┐ │
│ pending │→│spec_author│→│HUMANO│→│in_progress│→│reviewer│→│ done │ │
│         │  │(3 archivos)│     │(aprueba/rechaza)│              │       │      │      │
└─────────┘  └──────────┘       └───────────────┘  └────────┘  └──────┘ │
       ▲                                           ▲                    │
       │                                           │                    │
       └───────────── blocked ◄────────────────────┘                    │
                                                                         │
        Si reviewer rechaza → vuelve a in_progress                      │
        Si humano rechaza spec → vuelve a pending                       │
        Si implementer descubre algo → vuelve a spec_ready              │
        └───────────────────────────────────────────────────────────────┘
```

### Estados

| Estado        | Quién actúa        | Qué significa                                                  |
| ------------- | ------------------ | -------------------------------------------------------------- |
| `pending`     | spec_author        | Sin spec. El spec_author debe crear los 3 archivos.            |
| `spec_ready`  | — ⏸ humano         | Spec escrito. **No se toca código.** El humano lee y aprueba.  |
| `in_progress` | implementer        | Spec aprobado. Implementación activa.                          |
| `done`        | —                  | Código verde, reviewer aprobó, trazabilidad documentada.       |
| `blocked`     | leader             | Atascado. Razón documentada en `progress/current.md`.          |

### Transiciones válidas

| Desde         | Hasta           | Gatillo                                                        |
| ------------- | --------------- | -------------------------------------------------------------- |
| `pending`     | `spec_ready`    | spec_author completa los 3 archivos.                             |
| `spec_ready`  | `in_progress`   | Humano aprueba el spec.                                        |
| `spec_ready`  | `pending`       | Humano rechaza el spec (vuelve a diseño).                      |
| `in_progress` | `spec_ready`    | implementer descubre ambigüedad que requiere redesign.         |
| `in_progress` | `done`          | implementer termina, reviewer aprueba.                         |
| `in_progress` | `blocked`       | implementer se bloquea.                                       |
| `blocked`     | `in_progress`   | Bloqueo resuelto.                                              |
| Any           | `blocked`       | Condición externa impide avanzar.                              |

---

## 4. La puerta de aprobación humana

El flujo automático se detiene **exactamente una vez**: cuando el spec_author
termina los tres archivos y marca la feature como `spec_ready`.

```
pending → [spec_author] → spec_ready → ⏸ HUMANO → in_progress
```

### Qué revisa el humano

| Elemento          | Qué validar                                                    |
| ----------------- | -------------------------------------------------------------- |
| requirements.md   | ¿Cada R<n> es claro, verificable y no ambiguo?                 |
| design.md         | ¿Las decisiones técnicas son correctas para el contexto?       |
| tasks.md          | ¿Los pasos cubren todos los R<n> y son ejecutables?            |
| Consistencia      | ¿requirements, design y tasks están alineados entre sí?        |
| Trazabilidad      | ¿Cada R<n> tiene al menos un task que lo cubre?                |

### Si el humano aprueba

El leader cambia el status a `in_progress` y lanza el implementer.

### Si el humano rechaza

El leader cambia el status a `pending` (o `blocked` con la razón).
El spec_author revisa y vuelve a presentar.

**El humano puede:**
- Aprobar tal cual.
- Aprobar con comentarios (el implementer los atiende durante implementación).
- Rechazar con razones específicas (el spec_author corrige).

---

## 5. requirements.md — EARS

### Formato EARS

Cada requirement se redacta en **EARS** (Easy Approach to Requirements Syntax).
Cinco patrones, sin excepción:

| Patrón         | Cuándo usarlo                       | Plantilla                                                   |
| -------------- | ----------------------------------- | ----------------------------------------------------------- |
| **Ubicuo**     | Siempre es verdad.                  | `El sistema DEBE <acción>.`                                 |
| **Evento**     | Reacciona a un disparador.          | `CUANDO <disparador>, el sistema DEBE <acción>.`            |
| **Estado**     | Se aplica mientras una condición se mantiene. | `MIENTRAS <estado>, el sistema DEBE <acción>.`           |
| **Opcional**   | Solo aplica si existe la feature.   | `DONDE <feature opcional>, el sistema DEBE <acción>.`       |
| **No deseado** | Respuesta a un evento extraordinario. | `SI <evento no deseado> ENTONCES el sistema DEBE <acción>.` |

### Reglas duras de requirements

| Regla                                                        | Consecuencia si se incumple                     |
| ------------------------------------------------------------ | ----------------------------------------------- |
| Cada requirement tiene id estable: `R1`, `R2`, ...           | El reviewer rechaza el spec.                    |
| Cada requirement DEBE ser verificable por al menos un test.  | El reviewer rechaza el spec.                    |
| Un requirement = un `DEBE`. Si hay más de uno, se separa.    | Spec devuelto a spec_author.                    |
| Sin verbos blandos ("podría", "puede", "soporta"). Solo `DEBE` / `NO DEBE`. | Spec devuelto a spec_author. |
| Requirements no funcionales se etiquetan con `[NF]` al inicio. | —                                               |
| El lenguaje es español o inglés, consistente en todo el archivo. | —                                             |

### Ejemplos EARS correctos

```markdown
## R1 [Ubicuo]

El sistema DEBE validar que el email del usuario tiene formato válido
antes de persistir el registro.

## R2 [Evento]

CUANDO se recibe `POST /api/users` con datos válidos,
el sistema DEBE crear el usuario, persistirlo y retornar HTTP 201
con el `id` en el body.

## R3 [Estado]

MIENTRAS el usuario tenga el estado `inactive`, el sistema DEBE
rechazar cualquier intento de autenticación.

## R4 [Opcional]

DONDE el usuario tenga el rol `admin`, el sistema DEBE permitir
acceso al endpoint `DELETE /api/users/{id}`.

## R5 [No deseado]

SI el campo `email` del request está malformado,
ENTONCES el sistema DEBE retornar HTTP 400 con un mensaje de error
en formato `ProblemDetails`.

## R6 [NF]

El sistema DEBE responder a cualquier request en menos de 500ms (p95).
```

### Ejemplos incorrectos (y por qué)

```markdown
## ❌ Ambigüedad
R1: El sistema debería validar emails correctamente.
    → "debería" no es DEBE. ¿Qué significa "correctamente"?

## ❌ Múltiples DEBE
R2: El sistema DEBE crear el usuario y DEBE enviar un email y DEBE loguear la acción.
    → Separar en R2, R3, R4.

## ❌ No verificable
R3: La interfaz debe ser intuitiva.
    → ¿Cómo se testea? Reformular como "el sistema DEBE completar el flujo
       de registro en ≤ 3 pasos".

## ❌ Solapamiento
R4: El sistema DEBE validar el email. (solapa con R1)
    → Si dos requirements dicen lo mismo, eliminar uno.
```

### Categorías de requirements

| Prefijo  | Tipo                     | Ejemplo                                               |
| -------- | ------------------------ | ----------------------------------------------------- |
| `[FN]`   | Funcional                | `[FN] R1: El sistema DEBE ...`                        |
| `[NF]`   | No funcional             | `[NF] R6: El sistema DEBE responder en <500ms.`       |
| `[SEC]`  | Seguridad                | `[SEC] R10: CUANDO se reciba un token expirado ...`   |
| `[PERF]` | Performance              | `[PERF] R12: El endpoint DEBE soportar 100 req/s.`   |
| `[UI]`   | Interfaz de usuario      | `[UI] R15: El sistema DEBE mostrar ...`               |

---

## 6. design.md — decisiones técnicas

### Estructura obligatoria

```markdown
# Feature: {nombre de la feature}

## Resumen

<2-4 líneas explicando qué se implementa y por qué>

## Proyectos y archivos

### Nuevos
- `src/{Project}.Domain/ValueObjects/Email.cs` — Value Object Email
- `src/{Project}.Domain/Entities/User.cs` — Entidad User
- ...

### Modificados
- `src/{Project}.Infrastructure/Data/AppDbContext.cs` — añadir DbSet<User>
- ...

## Nuevos tipos

| Tipo          | Nombre             | Ubicación                          |
| ------------- | ------------------ | ---------------------------------- |
| Value Object  | `Email`            | Domain/ValueObjects/               |
| Entity        | `User`             | Domain/Entities/                   |
| Interface     | `IUserRepository`  | Domain/Interfaces/                 |
| Command       | `CreateUserCommand`| Application/Commands/              |
| Handler       | `CreateUserHandler`| Application/Commands/              |
| Validator     | `CreateUserValidator`| Application/Validators/          |
| Controller    | `UsersController`  | Api/Controllers/                   |

## Decisiones técnicas

### ADR-001: Email como Value Object sellado

**Contexto:** El email necesita validación de formato y normalización a
minúsculas. No tiene identidad propia.

**Decisión:** `sealed record Email` con fábrica `static Result<Email> Create(string?)`.

**Alternativa descartada:** `string` plano — no garantiza formato válido
en todas las capas. Se descarta.

**Consecuencias:** +3 líneas de definición, -10 bugs potenciales por emails
mal formados.

---

### ADR-002: MediatR para casos de uso

**Contexto:** Necesitamos separar commands (write) de queries (read) y aplicar
cross-cutting concerns (logging, validación, caché).

**Decisión:** Usar MediatR con IPipelineBehavior para logging y validación.

**Alternativa descartada:** Controllers con lógica directa — viola SRP,
dificulta testear. Se descarta.

---

## Paquetes NuGet

| Paquete               | Versión | Capa           | Propósito                    |
| --------------------- | ------- | -------------- | ---------------------------- |
| `MediatR`             | 12.x    | Application    | CQRS + handlers              |
| `FluentValidation`    | 11.x    | Application    | Validación de commands       |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | 9.x | Infrastructure | Provider EF Core para Postgres |

## Riesgos y mitigaciones

| Riesgo                              | Probabilidad | Impacto | Mitigación                                     |
| ----------------------------------- | ------------ | ------- | ---------------------------------------------- |
| Migraciones conflictivas            | Baja         | Medio   | Hacer squash de migraciones antes de merge      |
| Rendimiento de validación de email  | Baja         | Bajo    | Benchmark si > 1000 req/s                       |
```

### Reglas de design.md

| Regla                                                        |
| ------------------------------------------------------------ |
| Captura **antes** de tocar código.                           |
| Cada ADR documenta: contexto, decisión, alternativa descartada, consecuencia. |
| Mínimo **una** alternativa descartada por decisión importante. |
| No es ingeniería desde primeros principios — apoyarse en `docs/architecture.md` y `docs/conventions.md`. |
| Si el design contradice `architecture.md`, justificarlo explícitamente. |
| Los paquetes NuGet nuevos deben estar aprobados por seguridad (sin vulnerabilidades conocidas). |

### Formato ADR (Architecture Decision Record)

```
### ADR-{NNN}: {Título corto}

**Contexto:** <por qué necesitamos tomar esta decisión>

**Decisión:** <qué elegimos>

**Alternativa descartada:** <qué no elegimos y por qué>

**Consecuencias:** <qué cambia después de esta decisión>
```

---

## 7. tasks.md — checklist ejecutable

### Estructura de cada task

```markdown
- [ ] T1 — Crear `Email` value object en `Domain/ValueObjects/`.
  Cubre: R1, R2.
```

| Elemento | Regla                                                    |
| -------- | -------------------------------------------------------- |
| ID       | `T1`, `T2`, ... secuencial.                               |
| Acción   | Verbo en infinitivo: "Crear", "Añadir", "Definir", "Implementar", "Testear". |
| Ubicación| Ruta relativa desde `src/` o `tests/`.                    |
| Cubre    | `R<n>` que verifica. Mínimo uno.                          |
| Estado   | `[ ]` pendiente, `[x]` completada.                        |

### Reglas de tasks.md

| Regla                                                        |
| ------------------------------------------------------------ |
| Tasks en orden de implementación (no alfabético).            |
| Cada task DEBE cubrir al menos un `R<n>`.                    |
| Cada `R<n>` DEBE tener al menos un task que lo cubra.        |
| Un task por acción atómica (no "Crear módulo de usuarios").  |
| Tasks de test para cada `R<n>` (unitario + integración).     |
| Tasks de documentación si el spec lo requiere.               |
| Máximo 20 tasks por feature. Si excede, la feature es demasiado grande. |

### Ejemplo completo

```markdown
# Tasks: 001 — User Registration

- [ ] T1 — Crear `UserId` value object en `Domain/ValueObjects/`.
  Cubre: R1.
- [ ] T2 — Crear `Email` value object con validación en `Domain/ValueObjects/`.
  Cubre: R1, R2.
- [ ] T3 — Crear `Name` value object en `Domain/ValueObjects/`.
  Cubre: R1.
- [ ] T4 — Crear entidad `User` con factory `User.Create(email, name)` en `Domain/Entities/`.
  Cubre: R1, R2.
- [ ] T5 — Definir `IUserRepository` en `Domain/Interfaces/`.
  Cubre: R1.
- [ ] T6 — Crear `CreateUserCommand` en `Application/Commands/`.
  Cubre: R1.
- [ ] T7 — Crear `CreateUserCommandHandler` en `Application/Commands/`.
  Cubre: R1, R2.
- [ ] T8 — Crear `CreateUserValidator` con FluentValidation en `Application/Validators/`.
  Cubre: R2.
- [ ] T9 — Implementar `UserRepository` con EF Core en `Infrastructure/Repositories/`.
  Cubre: R1.
- [ ] T10 — Añadir endpoint `POST /api/users` en `Api/Endpoints/`.
  Cubre: R1, R3.
- [ ] T11 — Test unitario: `EmailTests.Create_WithValidEmail_ReturnsSuccess`.
  Cubre: R1.
- [ ] T12 — Test unitario: `EmailTests.Create_WithInvalidEmail_ReturnsFailure`.
  Cubre: R2.
- [ ] T13 — Test unitario: `UserTests.Create_WithValidData_ReturnsUser`.
  Cubre: R1.
- [ ] T14 — Test unitario: `CreateUserHandlerTests.Handle_WithValidCommand_ReturnsUserId`.
  Cubre: R1.
- [ ] T15 — Test de integración: `UsersEndpointTests.PostUser_WithValidPayload_Returns201`.
  Cubre: R1.
- [ ] T16 — Test de integración: `UsersEndpointTests.PostUser_WithInvalidEmail_Returns400`.
  Cubre: R2.
- [ ] T17 — Test de integración: `UsersEndpointTests.PostUser_WithoutAuth_Returns401`.
  Cubre: R3.
```

### Granularidad correcta vs incorrecta

```markdown
## ❌ Demasiado grande (no ejecutable)
[ ] T1 — Implementar módulo de usuarios.

## ❌ Demasiado pequeña (ruido)
[ ] T1 — Abrir Visual Studio.
[ ] T2 — Crear archivo.

## ✓ Granularidad correcta
[ ] T1 — Crear `UserId` value object en `Domain/ValueObjects/`.
[ ] T2 — Definir `IUserRepository` en `Domain/Interfaces/`.
```

---

## 8. Trazabilidad R ↔ Tests

### Regla dura (no negociable)

- Cada test en `tests/` debe poder mapearse a un `R<n>` de su spec.
- Cada `R<n>` debe tener **al menos un test concreto**.
- El reviewer comprueba esta correspondencia explícitamente y rechaza si falta.

### Formato del mapa

El implementer documenta en `progress/impl_<feature>.md`:

```markdown
## Trazabilidad R<n> ↔ Tests

| Requirement | Test(s)                                                    |
| ----------- | ---------------------------------------------------------- |
| R1          | `CreateUserHandlerTests.Handle_WithValidCommand_ReturnsUserId` |
|             | `UsersEndpointTests.PostUser_WithValidPayload_Returns201`  |
| R2          | `EmailTests.Create_WithInvalidEmail_ReturnsFailure`         |
|             | `UsersEndpointTests.PostUser_WithInvalidEmail_Returns400`  |
| R3          | `UsersEndpointTests.PostUser_WithoutAuth_Returns401`       |

Cobertura:
- R1: 2 tests ✓
- R2: 2 tests ✓
- R3: 1 test ✓

Resultado: Todos los requirements cubiertos.
```

### Verificación automática (opcional)

```bash
# Script que extrae R<n> de requirements.md y busca en nombres de tests
for r in $(grep -oP '^## R\d+' specs/001_user_registration/requirements.md | tr -d '# '); do
  count=$(grep -r "$r" tests/ --include="*.cs" | wc -l)
  if [ "$count" -eq 0 ]; then
    echo "❌ $r no tiene tests"
  else
    echo "✅ $r → $count test(s)"
  fi
done
```

### Responsabilidades

| Rol           | Responsabilidad en trazabilidad                              |
| ------------- | ------------------------------------------------------------ |
| spec_author   | Asegurar que cada `R<n>` es verificable.                     |
| implementer   | Crear tests que cubran cada `R<n>` y documentar el mapa.     |
| reviewer      | Verificar que el mapa está completo y que cada test existe y pasa. |

---

## 9. Definition of Ready (DoR)

Una feature está **ready** para ser implementada cuando:

- [ ] `requirements.md` existe con todos los `R<n>` en EARS.
- [ ] Cada `R<n>` tiene un id único y es verificable.
- [ ] `design.md` existe con decisiones técnicas y ADRs.
- [ ] Cada ADR documenta al menos una alternativa descartada.
- [ ] `tasks.md` existe con tasks atomizados que cubren todos los `R<n>`.
- [ ] Los tres archivos son consistentes entre sí (mismos nombres, mismos alcances).
- [ ] El humano aprobó el spec (status = `in_progress`).
- [ ] No hay conflictos con specs de features paralelas.

Si alguna condición no se cumple, la feature **no está ready** y no debe
pasar a implementación.

---

## 10. Definition of Done (DoD)

Una feature está **done** cuando:

### Implementación

- [ ] Todas las tasks en `tasks.md` están marcadas `[x]`.
- [ ] El código sigue `docs/architecture.md` y `docs/conventions.md`.
- [ ] Build sin warnings (`dotnet build /warnaserror`).

### Tests

- [ ] Tests unitarios para el happy path y caminos de error.
- [ ] Tests de integración (si aplica).
- [ ] Todos los tests pasan (`dotnet test` verde).
- [ ] Trazabilidad R ↔ Tests documentada.

### Verificación

- [ ] `dotnet build /warnaserror` — pasa.
- [ ] `dotnet format --verify-no-changes` — pasa.
- [ ] `dotnet test` — 100% verde.
- [ ] Cobertura mínima por capa alcanzada.
- [ ] Sin dependencias vulnerables.

### Revisión

- [ ] El reviewer aprobó la implementación.
- [ ] El mapa de trazabilidad está completo.

### Cierre

- [ ] `feature_list.json` marcado como `done`.
- [ ] `progress/current.md` movido a `progress/history.md`.
- [ ] Commit semántico creado en la rama de feature.

---

## 11. Manejo de cambios en el spec

### Durante implementación

Si el implementer descubre que:

- **Un requirement es ambiguo** → pausa, vuelve a `spec_ready`, el spec_author
  clarifica y el humano reaprueba.
- **Una decisión técnica es inviable** → actualiza `design.md` con un nuevo ADR,
  documenta por qué la decisión original no funciona. Vuelve a `spec_ready`.
- **El alcance es mayor de lo estimado** → el implementer documenta el desvío
  en `progress/current.md`. El leader decide: aumentar tasks o partir la feature.

### Cambios aprobados vs no aprobados

| Cambio                                      | Procedimiento                                                 |
| ------------------------------------------- | ------------------------------------------------------------- |
| Nuevo requirement                           | Nuevo `R<n>` en `requirements.md` → spec_ready → humano.      |
| Eliminar requirement                        | Eliminar `R<n>` y actualizar tasks y tests.                   |
| Cambiar decisión técnica                    | Nuevo ADR en `design.md`.                                      |
| Task adicional dentro del alcance existente | Añadir task, notificar al reviewer.                           |
| Task fuera del alcance original             | Nueva feature o spec_ready + humano.                          |

### Regla de oro

**Si el cambio afecta a requirements o diseño, pasa por la puerta humana.**
No hay cambios unilaterales durante implementación.

---

## 12. Revisión del spec (spec review)

### Checklist del revisor humano

```markdown
## Spec Review Checklist

### requirements.md
- [ ] Todos los R<n> usan EARS (Ubicuo/Evento/Estado/Opcional/No deseado).
- [ ] Cada R<n> tiene un id único (R1, R2, ...).
- [ ] Cada R<n> es verificable por al menos un test.
- [ ] No hay verbos blandos ("podría", "puede", "soporta").
- [ ] Cada R<n> tiene un solo DEBE.
- [ ] No hay solapamiento entre requirements.
- [ ] El lenguaje es claro y sin ambigüedad.

### design.md
- [ ] Los proyectos/archivos a crear/modificar están listados.
- [ ] Las decisiones técnicas están documentadas como ADRs.
- [ ] Cada ADR incluye alternativa descartada.
- [ ] Los paquetes NuGet están especificados con versión.
- [ ] No contradice docs/architecture.md sin justificación.
- [ ] Los riesgos están identificados.

### tasks.md
- [ ] Todas las tasks cubren al menos un R<n>.
- [ ] Todos los R<n> están cubiertos por al menos una task.
- [ ] Las tasks están en orden de implementación.
- [ ] Las tasks son atómicas y ejecutables.
- [ ] Hay tasks de test para cada R<n>.
- [ ] ≤ 20 tasks (si excede, la feature es demasiado grande).

### Consistencia global
- [ ] requirements, design y tasks usan los mismos nombres.
- [ ] El alcance es el mismo en los 3 archivos.
- [ ] No hay nada en design o tasks que no responda a un R<n>.

### Decisión
[ ] Aprobado
[ ] Aprobado con comentarios (adjuntar)
[ ] Rechazado (razones abajo)
```

---

## 13. Revisión de la implementación (reviewer)

### Checklist del reviewer (code + trazabilidad)

```markdown
## Implementation Review Checklist

### Código
- [ ] Sigue docs/architecture.md (capas, dependencias, contratos).
- [ ] Sigue docs/conventions.md (nombres, estilo, estructura).
- [ ] Build sin warnings (`dotnet build /warnaserror`).
- [ ] Tests verdes (`dotnet test`).

### Trazabilidad
- [ ] El mapa R<n> ↔ Tests está documentado en `progress/impl_<feature>.md`.
- [ ] Cada R<n> tiene al menos un test.
- [ ] Los tests nombrados siguen `<Método>_<Escenario>_<Resultado>`.

### Calidad
- [ ] Sin código comentado.
- [ ] Sin supresiones de warning (`#pragma warning disable`).
- [ ] Sin dependencias vulnerables (`dotnet list package --vulnerable`).
- [ ] Tests de unidad + integración (si aplica).

### Decisión
[ ] Aprobado
[ ] Rechazado (razones debajo)
```

---

## 14. Ejemplos completos

### Template de requirements.md

```markdown
# Requirements: {NNN} — {Feature Name}

## R1 [Ubicuo]

El sistema DEBE ...

## R2 [Evento]

CUANDO ... , el sistema DEBE ...

## R3 [Estado]

MIENTRAS ... , el sistema DEBE ...

## R4 [No deseado]

SI ... ENTONCES el sistema DEBE ...
```

### Template de design.md

```markdown
# Design: {NNN} — {Feature Name}

## Resumen

...

## Archivos nuevos

- `path/to/file.cs` — ...

## Archivos modificados

- `path/to/file.cs` — ...

## Decisiones técnicas

### ADR-001: ...

**Contexto:** ...
**Decisión:** ...
**Alternativa descartada:** ...
**Consecuencias:** ...

## Paquetes NuGet

- `PackageName` — versión — propósito

## Riesgos

- Riesgo: ... → Mitigación: ...
```

### Template de tasks.md

```markdown
# Tasks: {NNN} — {Feature Name}

- [ ] T1 — Crear `{Type}` en `path/`. Cubre: R1.
- [ ] T2 — Crear `{Handler}` en `path/`. Cubre: R1, R2.
- [ ] T3 — Test: `{TestClass}.{TestMethod}`. Cubre: R1.
```

---

## 15. Anti-patrones

### ❌ En requirements

| Anti-patrón                                       | Alternativa                                        |
| ------------------------------------------------- | -------------------------------------------------- |
| Requirements escritas después del código           | Escribir requirements **antes** de codificar.      |
| Lenguaje técnico ("usar MediatR")                 | "El sistema DEBE procesar el comando de forma asíncrona." |
| Requirements sin id                               | Numerar R1, R2, R3...                              |
| Requirements que describen implementación         | "El sistema DEBE validar el email" (no "usar Regex"). |
| Requirements no verificables                      | "La interfaz DEBE cargar en menos de 500ms (p95)". |

### ❌ En design

| Anti-patrón                                       | Alternativa                                        |
| ------------------------------------------------- | -------------------------------------------------- |
| Design escrito durante/después de implementación   | Design **antes** de codificar.                     |
| No documentar alternativas descartadas            | Cada ADR incluye al menos una alternativa.         |
| Copiar y pegar de architecture.md                 | Referenciar, no copiar.                            |
| Decisiones sin justificación                      | Documentar contexto + decisión + consecuencia.     |

### ❌ En tasks

| Anti-patrón                                       | Alternativa                                        |
| ------------------------------------------------- | -------------------------------------------------- |
| Tasks sin referencia a R<n>                       | Cada task cubre al menos un R<n>.                  |
| Tasks que mezclan múltiples acciones              | Una task = una acción atómica.                     |
| Tasks que dependen de contexto externo            | "Añadir connection string" no es una task.         |
| Saltarse tasks de test                            | Task de test por cada R<n>.                        |

### ❌ En el proceso

| Anti-patrón                                       | Alternativa                                        |
| ------------------------------------------------- | -------------------------------------------------- |
| Saltar la puerta humana                           | Siempre esperar aprobación antes de codificar.     |
| Implementar sin spec                              | Spec completo + aprobado primero.                  |
| Cambiar requirements sin pasar por spec_ready     | Toda vuelta a requirements = spec_ready + humano.  |
| Mezclar features en un mismo spec                 | Una feature = un spec.                             |

---

## 16. Checklist rápido del spec_author

```markdown
## Antes de marcar spec_ready

### requirements.md
- [ ] IDs numéricos secuenciales (R1, R2, ...).
- [ ] Formato EARS (Ubicuo/Evento/Estado/Opcional/No deseado).
- [ ] Cada R<n> con un solo DEBE.
- [ ] Cada R<n> verificable por test.
- [ ] Sin verbos blandos.

### design.md
- [ ] Archivos nuevos y modificados listados.
- [ ] Decisiones técnicas como ADRs.
- [ ] Al menos una alternativa descartada por ADR.
- [ ] Paquetes NuGet listados con versión.
- [ ] Riesgos identificados (mínimo uno).

### tasks.md
- [ ] IDs secuenciales (T1, T2, ...).
- [ ] Cada task cubre al menos un R<n>.
- [ ] Todos los R<n> cubiertos por al menos una task.
- [ ] Tasks de test para cada R<n> (unitario + integración).
- [ ] Tasks en orden lógico de implementación.

### Consistencia
- [ ] Los 3 archivos se refieren a los mismos nombres y alcance.
- [ ] No hay nada en design/tasks que no responda a un R<n>.
```

---

## Anexo: Stack tecnológico para SDD

| Herramienta / archivo          | Propósito                                    |
| ------------------------------ | -------------------------------------------- |
| `docs/architecture.md`         | Marco arquitectónico de referencia            |
| `docs/conventions.md`          | Convenciones de estilo y código               |
| `docs/verification.md`         | Niveles de verificación                       |
| `feature_list.json`            | Estado y priorización de features             |
| `progress/current.md`          | Estado vivo de la sesión                      |
| `progress/history.md`          | Bitácora de sesiones                          |
| `progress/impl_<feature>.md`   | Trazabilidad y evidencia del implementer      |
| `progress/review_<feature>.md` | Checklist del reviewer                        |
