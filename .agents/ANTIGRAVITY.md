# ANTIGRAVITY — Configuración nativa para Google Antigravity

Este proyecto está configurado para acoplarse de forma nativa con **Google Antigravity** (**Antigravity 2.0**, **Antigravity IDE** y **Antigravity CLI `agy`**) ejecutando el flujo **SDD (Spec Driven Development)** mediante reglas de workspace, subagentes especializados y skills invocables por comando `/` o descubrimiento semántico.

---

## Estructura de configuración (`.agents/`)

Antigravity descubre automáticamente la carpeta `.agents/` en la raíz del proyecto junto con `AGENTS.md`:

```text
.
├── AGENTS.md                                # Regla raíz universal del arnés (Always-On)
├── ANTIGRAVITY.md                           # Guía de referencia rápida para Antigravity
├── project-docs/                            # Tablero de seguimiento (Vanilla JS + Tailwind v4 + Screaming Arch)
└── .agents/
    ├── rules/
    │   └── antigravity-harness.md           # Branching {type}/INT-*, subagentes y ask_question
    ├── agents/
    │   ├── leader.md                        # Orquestador principal (mainAgent)
    │   ├── spec-author.md                   # Subagente redactor de specs (sin bash ni código)
    │   ├── implementer.md                   # Subagente implementador + tests
    │   └── reviewer.md                      # Subagente auditor de calidad y trazabilidad
    └── skills/                              # 18 Skills homologadas para Antigravity
        ├── technical-audit/SKILL.md         # Auditoría técnica → project-spec.yaml
        ├── generate-verify/SKILL.md         # Generar verify.sh
        ├── requirements-analysis/SKILL.md   # Análisis de docs → feature_list.json
        ├── generate-spec/SKILL.md           # Generar spec técnico
        ├── implement-tdd/SKILL.md           # Implementación TDD (tests primero)
        ├── implement-sdd/SKILL.md           # Implementación dirigida por spec
        ├── implement-ftd/SKILL.md           # Cambios pequeños sin lógica nueva
        ├── write-unit-tests/SKILL.md        # Escritura de tests unitarios
        ├── verify-spec/SKILL.md             # Cierre y verificación de spec
        ├── api-test-plan/SKILL.md           # Plan de pruebas API
        ├── execute-api-test-plan/SKILL.md   # Ejecución con curl
        ├── sync-skills/SKILL.md             # Sincronización de skills triple
        ├── start-feature/SKILL.md           # Orquestación de inicio de tarea
        └── sdd-workflow/SKILL.md            # Manual operativo del ciclo SDD
```

---

## Convención de Branching (Obligatoria)

Se manejan exclusivamente 2 tipos de tareas: `feature` y `bugfix`.
- **Estructura obligatoria:** `{feature o bugfix}/INT-{numero}/{nombre_rama_de_lo_realizado}`
- **Límite de longitud:** Máximo **80 caracteres**.
- **Ejemplos válidos:**
  - `feature/INT-001/example_scaffold`
  - `bugfix/INT-002/fix_jwt_token_expiration`

---

## Tablero de Seguimiento Visual (`project-docs/`)

El seguimiento visual y la constelación 3D del proyecto viven en `project-docs/`:
- **Arquitectura Screaming:** Componentes modularizados por dominio en `src/features/` (`stats`, `current-spec`, `feature-list`, `dependency-graph`, `dependency-tree`, `space-view-3d`, `history-timeline`).
- **Tecnologías:** Vanilla JS moderno, **Tailwind CSS v4** (`@tailwindcss/browser@4`) y Three.js.
- **Acceso:** Abre `project-docs/index.html` en el navegador directamente o mediante un servidor estático.

---

## Agentes disponibles (`.agents/agents/`)

| Agente | Rol en el flujo SDD | Modo en Antigravity | Herramientas habilitadas |
| ------ | ------------------- | ------------------- | ------------------------ |
| **`leader`** | Orquestador — detecta tareas, crea ramas `{type}/INT-{numero}/{nombre}` (máx 80 chars), coordina subagentes y puertas humanas | `mainAgent: true` | Lectura/escritura de estado, `run_command`, `invoke_subagent`, `ask_question` |
| **`spec-author`** | Redacta `requirements.md` / `spec.md`, `tasks.md` y `decisions.md` | `subagent: true` / `mainAgent: true` | Lectura y escritura de archivos (**sin `run_command`**) |
| **`implementer`** | Ejecuta `tasks.md` una a una, escribe código y tests | `subagent: true` / `mainAgent: true` | Lectura/escritura de código y tests + `run_command` |
| **`reviewer`** | Verifica criterios de aceptación, arquitectura, tests y calidad | `subagent: true` / `mainAgent: true` | Solo lectura de código + `run_command` (**sin edición de código**) |

---

## Comandos y Skills en Antigravity

Escribe `/` en el panel de chat de Antigravity para invocar cualquiera de los skills del arnés:

| Comando | Descripción |
| ------- | ----------- |
| `/start-feature` | Inicia o retoma el flujo SDD completo desde la primera tarea `pending` |
| `/generate-spec` | Genera el spec técnico, decisiones y tareas para la feature activa |
| `/implement-tdd` | Implementa con ciclo TDD (test rojo → código verde → refactor) |
| `/implement-sdd` | Implementa por fases según el spec y decisiones |
| `/implement-ftd` | Implementa cambios pequeños sin lógica nueva |
| `/write-unit-tests` | Escribe o completa tests unitarios |
| `/verify-spec` | Reconcilia metadata (`current.json`, `feature_list.json`, `history.json`) y cierra el spec |
| `/sync-skills` | Propaga skills entre `.opencode/skills/`, `.github/skills/` y `.agents/skills/` |
| `/sdd-workflow` | Carga la guía operativa del flujo SDD completo |

---

## Flujo típico en Antigravity

```text
1. Abre el proyecto en Antigravity 2.0, Antigravity IDE o ejecuta `agy` en la raíz.
2. Pide en lenguaje natural o con comando: "/generate-spec para la tarea 1".
3. El leader valida el estado y crea la rama {feature|bugfix}/INT-{numero}/{nombre} (≤80 chars).
4. El agente genera el spec técnico y tareas asociadas.
5. ⏸ Puerta humana interactiva (ask_question): revisas los archivos generados y apruebas.
6. Se implementa con la técnica recomendada (/implement-tdd o /implement-sdd).
7. Se audita y verifica el cierre con /verify-spec.
8. Cierre y registro en project-docs/progres/history.json.
```
