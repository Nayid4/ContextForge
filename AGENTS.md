# AGENTS.md

## Proyecto
Arnés de ingeniería dirigida por specs (Spec Driven Development) para desarrollo con agentes de IA, diseñado para ser **agnóstico al proyecto** donde se use. El nombre del proyecto, el stack de backend/frontend y los servicios de infraestructura varían según la instancia; solo `.opencode/` y `.github/` deben mantenerse iguales en cualquier proyecto que adopte este sistema.

## Estructura

```
<raíz-del-proyecto>/
├── <backend>/           # API/servidor - nombre, lenguaje y framework dependen del proyecto
├── <frontend>/          # UI/cliente (opcional) - nombre, lenguaje y framework dependen del proyecto
├── infra/               # Infraestructura (Docker, IaC, etc.) - opcional según el proyecto
├── project-docs/        # Documentación del proyecto
├── .github/             # Configuración homologada de Copilot
│   ├── instructions/    # Reglas homologadas (commits, skills-sync, project-status)
│   └── skills/          # Skills homologadas (formato carpeta)
├── .opencode/           # Configuración de opencode
│   ├── rules/           # Reglas de commits y sincronización de skills
│   └── skills/          # Skills de opencode (formato carpeta)
└── opencode.json        # Config principal
```

> Las carpetas de backend/frontend/infra son ejemplos: su nombre, cantidad y tecnología cambian según el proyecto.

## Commits

**SIEMPRE** seguir el formato de commits semánticos definido en `.opencode/rules/commits.md`.

Pasos antes de commitear:
1. `git status` - Ver archivos
2. `git diff` - Revisar cambios
3. `git commit` - Formato: `feat(scope): descripción`

**NO hacer push** sin confirmación explícita del usuario.

## Skills Disponibles

Las skills están disponibles tanto para **opencode** (`.opencode/skills/`, fuente de verdad) como para **GitHub Copilot** (`.github/skills/`, espejo), con el mismo contenido y frontmatter (`name` + `description`).

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
| `sync-skills` | Sincronizar skills hacia el espejo de Copilot | Propaga de `.opencode/skills/` (fuente de verdad) a `.github/skills/` (espejo) |

En Copilot Chat, invócalas escribiendo `/` seguido del nombre de la skill, o dejando que el agente las cargue automáticamente según la descripción de la tarea.

Las reglas de commits (`.opencode/rules/commits.md`) están homologadas para Copilot en [.github/instructions/commits.instructions.md](.github/instructions/commits.instructions.md).

### Técnicas de implementación (tdd / sdd / ftd)

`generate-spec` recomienda una técnica al cerrar el Paso 9 y la escribe en el Metadata de `spec.md` (fila `Tecnica de Implementacion`). Cada técnica tiene su skill:

| Técnica | Skill | Ciclo |
|---------|-------|-------|
| **TDD** | `implement-tdd` | tests primero → rojo verificado → código mínimo → verde → refactor **acotado al spec** |
| **SDD** | `implement-sdd` | implementa el spec por fases, siguiendo `decisions.md`; tests al final |
| **FTD** | `implement-ftd` | cambios sin lógica nueva; verificación por diff + suite de regresión |

**Las tres `implement-*` terminan en tests, NO cierran el spec.** El cierre de metadata (`current.json`, `feature_list.json`, `history.json`, `Status` de `spec.md`) es de `verify-spec`, que es la única que reconcilia las tres fuentes de verdad.

> El refactor de `implement-tdd` está acotado a `## Componentes Afectados` del spec. Lo que exhale trabajo de una feature futura se anota como hallazgo, no se implementa — es la barrera contra el retrabajo.

### Regla de sincronización

**Toda skill nueva o modificada en `.opencode/skills/` (fuente de verdad) debe propagarse a `.github/skills/` (espejo de Copilot)**, con el mismo contenido y frontmatter. Detalle completo en [.opencode/rules/skills-sync.md](.opencode/rules/skills-sync.md) (homologado para Copilot en [.github/instructions/skills-sync.instructions.md](.github/instructions/skills-sync.instructions.md)).

## Reglas

Las reglas se cargan automáticamente al iniciar una sesión. Están en:
- **opencode**: `.opencode/rules/`
- **Copilot**: `.github/instructions/` (formato `<name>.instructions.md`)

| Regla | Descripción |
|-------|-------------|
| `commits` | Formato de commits semánticos |
| `skills-sync` | Sincronización de skills entre plataformas |
| `project-status` | Contexto completo del proyecto al pedir "estado del proyecto" |

## Convenciones

- **Idioma**: Inglés para código y commits, español para documentación

Las demás convenciones (puertos, red de Docker, formato de logs, etc.) dependen del proyecto concreto. Cuando este arnés se adopte en un proyecto, documenta su configuración concreta en una sección propia al final de este archivo (stack, servicios y comandos de verificación).
