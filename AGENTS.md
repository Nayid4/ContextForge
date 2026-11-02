# AGENTS.md

## Proyecto
Arnés de ingeniería dirigida por specs (Spec Driven Development) para desarrollo con agentes de IA, diseñado para ser **agnóstico al proyecto** donde se use. El nombre del proyecto, el stack de backend/frontend y los servicios de infraestructura varían según la instancia; las configuraciones en `.agents/` (Google Antigravity), `.opencode/` (opencode) y `.github/` (GitHub Copilot) se mantienen homologadas en cualquier proyecto que adopte este sistema.

## Estructura

```
<raíz-del-proyecto>/
├── <backend>/           # API/servidor - nombre, lenguaje y framework dependen del proyecto
├── <frontend>/          # UI/cliente (opcional) - nombre, lenguaje y framework dependen del proyecto
├── infra/               # Infraestructura (Docker, IaC, etc.) - opcional según el proyecto
├── project-docs/        # Documentación y Tablero de seguimiento (Screaming Arch + Tailwind v4 + Vanilla JS)
├── .agents/             # Configuración homologada para Google Antigravity
│   ├── rules/           # Reglas de flujo, branching y arnés
│   ├── agents/          # Roles especializados (leader, spec-author, implementer, reviewer)
│   └── skills/          # Skills homologadas para Antigravity
├── .github/             # Configuración homologada de GitHub Copilot
│   ├── instructions/    # Reglas homologadas (commits, branches, skills-sync, project-status)
│   └── skills/          # Skills homologadas para Copilot
├── .opencode/           # Configuración de opencode
│   ├── rules/           # Reglas de commits, branches y sincronización
│   └── skills/          # Skills de opencode (fuente de verdad)
├── ANTIGRAVITY.md       # Guía de referencia para Google Antigravity
├── opencode.json        # Configuración principal de opencode
└── README.md            # Documentación general del arnés
```

> Las carpetas de backend/frontend/infra son ejemplos: su nombre, cantidad y tecnología cambian según el proyecto.

## Reglas de Branching (Obligatorias)

Toda tarea (feature o corrección de error) debe realizarse en su propia rama de trabajo, creada desde la rama base (`main`, `master` o `dev`).

### Estructura
```
{feature o bugfix}/INT-{numero}/{nombre_rama_de_lo_realizado}
```

- **Tipos permitidos:** Exclusivamente 2 tipos: `feature` y `bugfix`.
- **Límite de longitud estricto:** El nombre completo de la rama debe tener **máximo 80 caracteres**.
- **Identificador de ticket:** `INT-` seguido del número de tarea (ej. `INT-001`, `INT-042`).
- **Nombres en minúsculas:** Usar `snake_case` o `kebab-case` descriptivo.

### Ejemplos válidos
- `feature/INT-001/document_crud_api` (33 caracteres)
- `bugfix/INT-002/fix_jwt_token_expiration` (40 caracteres)
- `feature/INT-015/add_oauth2_sso_authentication` (46 caracteres)

## Commits

**SIEMPRE** seguir el formato de commits semánticos definido en `.opencode/rules/commits.md` (homologado en `.github/instructions/commits.instructions.md`).

Pasos antes de commitear:
1. `git status` - Ver archivos
2. `git diff` - Revisar cambios
3. `git commit` - Formato: `feat(scope): descripción` o `fix(scope): descripción`

**NO hacer push** sin confirmación explícita del usuario.

## Skills Disponibles

Las skills están homologadas en **tres plataformas**:
- **opencode**: `.opencode/skills/` (**fuente de verdad**)
- **GitHub Copilot**: `.github/skills/` (espejo)
- **Google Antigravity**: `.agents/skills/` (espejo)

Todas mantienen el mismo contenido y frontmatter (`name` + `description`).

| Skill | Descripción | Uso |
|-------|-------------|-----|
| `technical-audit` | Auditoría técnica de proyecto | Generar project-spec.yaml |
| `generate-verify` | Generar verify.sh | Crear script de verificación |
| `verification` | Documentación de verificación | Consultar estructura |
| `api-test-plan` | Plan de pruebas API REST | Generar plan markdown + archivos .http |
| `execute-api-test-plan` | Ejecutar plan de pruebas API | Correr pruebas con curl y documentar hallazgos |
| `requirements-analysis` | Análisis de requerimientos | Generar feature_list.json |
| `generate-spec` | Generar spec técnico de una feature | Crear spec.md/tasks.md/decisions.md en project-docs + recomendar tdd/sdd/ftd |
| `implement-tdd` | Implementar un spec con TDD (tests primero) | Lógica con ramas y rutas de error |
| `implement-sdd` | Implementar un spec con SDD (spec → código) | Multi-módulo, migraciones, integraciones |
| `implement-ftd` | Implementar un cambio pequeño sin lógica nueva | Constantes, labels, estilos, config, tweaks UI |
| `write-unit-tests` | Escribir tests unitarios (agnóstico al lenguaje) | Cubrir código de un spec antes de verificarlo |
| `verify-spec` | Verificar cierre completo de un spec (agnóstico al lenguaje) | Acceptance criteria, tasks, tests unitarios y verify.sh |
| `sync-skills` | Sincronizar skills hacia los espejos (Copilot y Antigravity) | Propaga de `.opencode/skills/` a `.github/skills/` y `.agents/skills/` |

En Antigravity y Copilot Chat, invócalas escribiendo `/` seguido del nombre de la skill, o dejando que el agente las cargue automáticamente según la tarea.

### Técnicas de implementación (tdd / sdd / ftd)

`generate-spec` recomienda una técnica al cerrar el Paso 9 y la escribe en el Metadata de `spec.md` (fila `Tecnica de Implementacion`). Cada técnica tiene su skill:

| Técnica | Skill | Ciclo |
|---------|-------|-------|
| **TDD** | `implement-tdd` | tests primero → rojo verificado → código mínimo → verde → refactor **acotado al spec** |
| **SDD** | `implement-sdd` | implementa el spec por fases, siguiendo `decisions.md`; tests al final |
| **FTD** | `implement-ftd` | cambios sin lógica nueva; verificación por diff + suite de regresión |

**Las tres `implement-*` terminan en tests, NO cierran el spec.** El cierre de metadata (`current.json`, `feature_list.json`, `history.json`, `Status` de `spec.md`) es de `verify-spec`, que es la única que reconcilia las tres fuentes de verdad.

### Regla de sincronización triple

**Toda skill nueva o modificada en `.opencode/skills/` (fuente de verdad) debe propagarse a `.github/skills/` (espejo Copilot) y a `.agents/skills/` (espejo Antigravity)**. Detalle completo en [.opencode/rules/skills-sync.md](.opencode/rules/skills-sync.md).

## Reglas

Las reglas se cargan automáticamente al iniciar una sesión:
- **opencode**: `.opencode/rules/`
- **Copilot**: `.github/instructions/` (formato `<name>.instructions.md`)
- **Google Antigravity**: `.agents/rules/`

| Regla | Descripción |
|-------|-------------|
| `branches` | Estructura `{feature\|bugfix}/INT-{numero}/{nombre}` (máximo 80 caracteres) |
| `commits` | Formato de commits semánticos (`feat`, `fix`, etc.) |
| `skills-sync` | Sincronización de skills entre plataformas |
| `project-status` | Contexto completo del proyecto al pedir "estado del proyecto" |

## Tablero de Seguimiento Visual (`project-docs/`)

El seguimiento visual vive en `project-docs/`:
- **Tecnologías:** Vanilla JS (ES Modules), **Tailwind CSS v4** (`@tailwindcss/browser@4`) y Three.js.
- **Arquitectura Screaming:** Componentes modularizados por dominio en `src/features/` (`stats`, `current-spec`, `feature-list`, `dependency-graph`, `dependency-tree`, `space-view-3d`, `history-timeline`).
- **Ejecución:** Abrir `project-docs/index.html` en el navegador directamente o vía servidor local.

## Convenciones

- **Idioma**: Inglés para código y commits, español para documentación.
- **Ramas**: `{feature|bugfix}/INT-{id}/{nombre_rama}` (≤80 caracteres).
- Las demás convenciones (puertos, docker, etc.) dependen del proyecto concreto donde se adopte el arnés.
