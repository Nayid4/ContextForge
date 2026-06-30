# AGENTS.md — Mapa de navegación para agentes de IA — .NET Harness

> Este archivo es el **punto de entrada** para cualquier agente. NO es una
> biblia de reglas: es un **mapa**. Lee solo lo que necesites cuando lo
> necesites (divulgación progresiva).
>
> `main` / `master` / `dev` son las **ramas base** del proyecto.
> Nunca se modifican directamente durante una feature.
> Cada feature tiene su **propia rama** `feature/{NNN}_{name}`.
> Todo el trabajo (spec, código, tests, ENGINES.md) vive en la rama de la feature.

---

## 1. Antes de empezar (obligatorio)

1. Ejecuta `./init.sh` y verifica que termina sin errores. Si falla, **para**
   y resuelve el entorno antes de tocar código.

2. Identifica la rama actual con `git branch --show-current`.

   | Situación | Acción |
   |-----------|--------|
   | `main`, `master` o `dev` | **No hagas ningún cambio.** Crea la rama de feature desde aquí. |
   | `feature/*` | Estás en modo trabajo para esa feature (specs + implementación). |
   | Otra rama (`develop`, `release/*`, etc.) | **Detente.** No es una rama base válida. Pregunta al humano desde qué rama crear la feature. |

3. **Verifica el estado de los archivos de progreso** para evitar cruce de
   información entre features:
   - Lee `progress/current.md` — debe estar vacío (solo plantilla). Si tiene
     contenido, la sesión anterior no se cerró correctamente.
   - Lee `progress/history.md` — verifica que la última entrada esté completa.
   - Lee `ENGINES.md` — verifica que esté en estado limpio.
   
   Si alguno no está en orden, **detente** y notifica al humano antes de continuar.

4. Lee `kickstart.json` para conocer los parámetros del proyecto.
   > ⚠️ `kickstart.json` NO está trackeado en git. Debe existir localmente.

5. Lee `feature_list.json`. Toda feature con `"sdd": true` pasa por
   **Spec Driven Development** — ver `docs/specs.md` y §4 de este archivo.

---

## 2. Mapa del repositorio

### Ramas base (`main` / `master` / `dev`) — solo lectura durante features

Punto de partida del proyecto. **Nunca se modifican directamente mientras una
feature está activa.** Todo el trabajo ocurre en `feature/*`.

| Archivo / carpeta         | ¿Trackeado? | Qué contiene                                                     | Cuándo leerlo                                                      |
| ------------------------- | ----------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| `kickstart.json`          | ❌ No (git) | Parámetros del proyecto: namespace, tipo, versión, metadatos     | Siempre, al empezar (debe existir localmente)                      |
| `feature_list.json`       | ✅ Sí       | Lista de features con estado, rama y ejecutor                    | Siempre, al empezar (solo lectura)                                 |
| `ENGINES.md`              | ✅ Sí       | Índice de features completadas: rama, commit SHA y fecha         | Al cerrar una feature — se actualiza **en la rama feature**        |
| `docs/architecture.md`    | ✅ Sí       | Principios SOLID, Clean Architecture, patrones, DDD, CQRS        | Antes de implementar (solo lectura)                                |
| `docs/conventions.md`     | ✅ Sí       | Reglas de estilo C#, nombres, estructura, nullables, LINQ, async | Antes de escribir código (solo lectura)                            |
| `docs/specs.md`           | ✅ Sí       | Proceso SDD: EARS notation, ADRs, 3 archivos, puerta humana      | Antes de redactar o leer un spec (solo lectura)                    |
| `docs/verification.md`    | ✅ Sí       | Los 10 niveles de verificación                                   | Antes de declarar una tarea como `done` (solo lectura)             |
| `CHECKPOINTS.md`          | ✅ Sí       | Criterios objetivos de "estado final correcto" (C1-C7)           | Para auto-evaluarse (solo lectura)                                 |

### Ramas `feature/{NNN}_{name}` (trabajo completo — specs + código)

Cada feature tiene su propia rama, creada **antes** de que `spec_author`
escriba una sola línea. Contiene **todo**: spec, progreso, código, tests y registro.

| Archivo / carpeta en `feature/*` | Qué contiene                                              |
| -------------------------------- | --------------------------------------------------------- |
| `specs/{NNN}_{name}/`            | `requirements.md` + `design.md` + `tasks.md`              |
| `progress/current.md`            | Estado de la sesión activa (incluye ejecutor obligatorio) |
| `progress/history.md`            | Bitácora append-only de sesiones                          |
| `ENGINES.md`                     | Registro de features completadas en esta rama             |
| `feature_list.json`              | Estado actual de las features                             |
| `src/`                           | Código fuente                                             |
| `tests/`                         | Tests del proyecto                                        |

---

## 3. Reglas duras (no negociables)

- **Una sola feature a la vez.** No mezcles cambios de varias features en la
  misma sesión.
- **No declares una tarea `done` sin pruebas verdes.** `dotnet build /warnaserror`
  y `dotnet test` deben pasar al 100%.
- **No saltes la fase de spec.** Toda feature con `"sdd": true` debe pasar por
  `spec_author` y obtener aprobación humana antes de tocar código.
- **No saltes la puerta de aprobación humana.** El leader detiene el flujo
  en `spec_ready` y espera. El spec debe estar 100% aprobado.
- **Documenta lo que haces** en `progress/current.md` mientras trabajas,
  no al final.
- **Deja el repositorio limpio** antes de cerrar la sesión (ver §5).
- **Si no sabes algo, busca en `docs/`** antes de inventarlo.
- **No introduzcas vulnerabilidades.** No hardcodees secrets ni credenciales.
- **`kickstart.json` no se trackea en git.** Está en `.gitignore`.

### Reglas de branching

- **Creación de rama:** La rama de feature se crea desde `main`, `master` o `dev`.
  Si la rama actual no es una de estas, **pregunta al humano** qué rama base usar.
- **Formato obligatorio:** `feature/{NNN}_{name}` con NNN de 3 dígitos
  (ej: `feature/001_user_registration`).
- **Todo el trabajo en `feature/*`:** Specs, código, tests, ENGINES.md y
  feature_list.json se actualizan **siempre dentro de la rama de la feature**.
  Nunca en `main`/`master`/`dev`.
- **Sin fusión directa a base:** Las ramas `feature/*` NUNCA se fusionan
  directamente. Si el humano solicita integración, se sugiere PR para proyectos
  en la nube o merge local para proyectos locales.
- **Rama existente:** Si la rama ya existe, reutilízala y lee `progress/current.md`
  para retomar el estado.

### Convención de nomenclatura

- Features en `feature_list.json` usan `id` entero (1, 2, 3...).
- Ramas y carpetas de specs usan id con 3 dígitos: `001`, `002`, `010`.
- Formato: `{NNN}_{snake_case_name}`.
  - `feature/001_user_registration`, `specs/002_jwt_auth/`

### Rastreo del ejecutor

Toda entrada en `progress/current.md` y `progress/history.md` DEBE incluir:

```
Ejecutado por: {nombre} ({email})
```

El agente que inicia el trabajo registra este dato **como primera acción**,
antes de cualquier otra.

---

## 4. Flujo de trabajo (SDD + Branching)

```
[RAMA BASE]  leader lee feature_list.json → detecta feature pending
  main/           │
  master/         │  leader verifica estado de current.md, history.md, ENGINES.md
  dev             │  leader pregunta al humano si la rama base no es main/master/dev
                  │
                  │  leader crea feature/{NNN}_{name} desde rama base  ← PRIMER PASO
                  │
[feature/*]  [spec_author] → crea 3 archivos en specs/{NNN}_{name}/
                  │
              status: spec_ready → ⏸ HUMANO
                  │
              ¿humano aprueba 100%?
              ├── Sí → status: in_progress
              └── No → correcciones y reescritura del spec
                  │
              [implementer] → ejecuta tasks.md una a una
                  │         → documenta trazabilidad R↔Tests
                  │
              [reviewer] → verifica trazabilidad + build + tests
                  │
              ¿reviewer aprueba?
              ├── Sí → status: done
              └── No → vuelve a in_progress
                  │
              leader actualiza ENGINES.md en la rama feature
              leader actualiza feature_list.json → status: done
                  │
              leader pregunta al humano:
              "¿Requiere integración a la rama original?"
                  │
              ├── Sí (local)  → leader hace merge a rama base
              ├── Sí (nube)   → leader sugiere crear un PR
              └── No          → feature queda en su rama
```

### Paso a paso detallado

#### Fase 1 — Preparación y validación inicial

1. **En la rama base** (`main`/`master`/`dev`): El leader lee `feature_list.json`
   y detecta la primera feature `pending`.

2. **Validación de rama base:**
   - Si la rama actual NO es `main`, `master` ni `dev`, el leader **pregunta al
     humano** desde qué rama debe crear la feature y espera instrucciones.

3. **Verificación de estado:**
   - `progress/current.md` debe estar vacío (solo plantilla).
   - `progress/history.md` debe tener entradas completas.
   - `ENGINES.md` debe estar en estado limpio.
   - Si algo no está en orden, **notifica al humano**.

4. **El leader crea la rama de feature:**
   ```bash
   git checkout -b feature/{NNN}_{name}
   ```
   Si la rama ya existe: `git checkout feature/{NNN}_{name}` y leer
   `progress/current.md` para retomar.

#### Fase 2 — Spec (Spec Driven Development)

5. **En `feature/{NNN}_{name}`:** El leader registra el ejecutor en
   `progress/current.md` y lanza `spec_author`.

6. **spec_author** crea los 3 archivos en `specs/{NNN}_{name}/`:
   - `requirements.md` — EARS notation estricta
   - `design.md` — decisiones técnicas con ADRs
   - `tasks.md` — checklist ejecutable

7. Marca la feature como `spec_ready` en `feature_list.json`.

#### Fase 3 — ⏸ Puerta de aprobación humana

8. **Pausa.** El humano lee el spec en `specs/{NNN}_{name}/`.

9. **Decisión humana:**
   - **Aprueba 100%** → status cambia a `in_progress`, comienza implementación.
   - **Rechaza / pide cambios** → el spec vuelve a edición. El spec_author hace
     correcciones y reescrituras hasta que el humano apruebe al 100%.

#### Fase 4 — Implementación

10. **En `feature/{NNN}_{name}`:** El leader cambia el status a `in_progress`
    y lanza `implementer`.

11. **implementer** ejecuta `tasks.md` una a una, marcándolas `[x]`:
    - Cada task produce código en `src/` y tests en `tests/`.
    - Documenta el mapa de trazabilidad R ↔ Tests en `progress/impl_<name>.md`.
    - Si descubre ambigüedad, vuelve a `spec_ready` para clarificar.

12. **Verificación durante implementación:**
    - `dotnet build /warnaserror` — Nivel 0
    - `dotnet test` — Niveles 1-3
    - Cobertura mínima por capa — Nivel 5
    - Sin dependencias vulnerables — Nivel 6

#### Fase 5 — Revisión

13. **reviewer** verifica:
    - Trazabilidad `R<n>` ↔ test completa.
    - `dotnet build /warnaserror` y `dotnet test` verdes.
    - Código alineado con `docs/architecture.md` y `docs/conventions.md`.
    - Sin código muerto, sin supresiones de warnings, sin secretos.

14. **Decisión del reviewer:**
    - **Aprueba** → status: `done`, se procede al cierre.
    - **Rechaza** → vuelve a `in_progress` con razones documentadas.

#### Fase 6 — Cierre

15. **En `feature/{NNN}_{name}`** (todos los cambios en la rama):
    - Genera el commit semántico: `feat({scope}): {descripción}`
    - Marca `status: "done"` en `feature_list.json`
    - Actualiza `ENGINES.md` con la nueva fila de feature completada
    - Mueve el resumen de `progress/current.md` al final de `progress/history.md`
    - Vacía `progress/current.md` dejando solo la plantilla

16. **Pregunta al humano sobre integración:**
    ```
    ¿Requiere integración a la rama original ({rama_base})?
    ```
    - **Sí, proyecto local** → el leader ejecuta el merge a la rama base.
    - **Sí, proyecto en nube** → el leader sugiere: "Este proyecto está vinculado
      a un repositorio remoto. La integración debería hacerse mediante un Pull
      Request (PR) para mantener trazabilidad y permitir revisión."
    - **No** → la feature queda en su rama. El registro en `ENGINES.md` y
      `feature_list.json` es suficiente para saber que está completada.

17. No dejes archivos temporales, warnings sin atender, ni TODOs sin contexto.

---

## 5. Cierre de sesión (lifecycle)

Antes de terminar:

1. Ejecuta `./init.sh` — todo verde.

2. Si la feature está acabada:
   - Commit semántico generado en `feature/{NNN}_{name}`.
   - `status: "done"` en `feature_list.json`.
   - `ENGINES.md` actualizado.
   - `progress/current → history.md` completado.
   - `progress/current.md` vacío con solo plantilla.

3. Verifica que no hay archivos temporales ni cambios sin commitear.

4. Pregunta al humano sobre integración a la rama original (ver paso 16 de §4).

---

## 6. Si te bloqueas

- Relee la sección relevante de `docs/`.
- Si la herramienta no hace lo que esperas, **no inventes un workaround**:
  documenta el bloqueo en `progress/current.md` y para la sesión.
