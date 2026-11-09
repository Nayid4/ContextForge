# AGENTS.md

## Proyecto
Arnés de ingeniería dirigida por specs (Spec Driven Development) para desarrollo con agentes de IA, diseñado para ser **agnóstico al proyecto** donde se use. El nombre del proyecto, el stack de backend/frontend y los servicios de infraestructura varían según la instancia; las configuraciones en `.agents/` (Google Antigravity), `.opencode/` (opencode) y `.github/` (GitHub Copilot) se mantienen homologadas en cualquier proyecto que adopte este sistema.

## Estructura

```
<raíz-del-proyecto>/
├── <backend>/           # API/servidor - nombre, lenguaje y framework dependen del proyecto
├── <frontend>/          # UI/cliente (opcional) - nombre, lenguaje y framework dependen del proyecto
├── infra/               # Infraestructura (Docker, IaC, etc.) - opcional según el proyecto
├── project-docs/        # Documentación, specs, tests, tooling, verify.sh y Tablero de seguimiento
│   ├── specs/           # Especificaciones técnicas SDD (requirements, design, tasks, evidence)
│   ├── tests/           # Suites de prueba multinivel (unit, whitebox, blackbox, system, load, e2e)
│   ├── scripts/         # Scripts de soporte y captura de evidencias (capture-evidence.js)
│   ├── project-spec.yaml # Especificación técnica del proyecto y arnés
│   └── verify.sh        # Script de verificación integral autónomo
├── .agents/             # Configuración homologada para Google Antigravity
│   ├── rules/           # Reglas de flujo, branching y arnés
│   ├── agents/          # Roles especializados (leader, spec-author, implementer, reviewer)
│   ├── skills/          # Skills homologadas para Antigravity
│   └── ANTIGRAVITY.md   # Guía de orquestación nativa para Antigravity 2.0
├── .github/             # Configuración homologada de GitHub Copilot
│   ├── instructions/    # Reglas homologadas (commits, branches, skills-sync, project-status)
│   └── skills/          # Skills homologadas para Copilot
├── .opencode/           # Configuración de opencode
│   ├── rules/           # Reglas de commits, branches y sincronización
│   └── skills/          # Skills de opencode (fuente de verdad)
├── AGENTS.md            # Reglas generales del arnés y orquestación
├── opencode.json        # Configuración principal de opencode
├── README.md            # Documentación general del arnés
└── .gitignore           # Exclusiones de control de versiones
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
| `project-knowledge` | Extracción de base de conocimiento y arquitectura | Generar modelo C4, UML, reglas de negocio y estándares anti-sesgo |
| `generate-verify` | Generar verify.sh | Crear script de verificación |
| `verification` | Documentación de verificación | Consultar estructura |
| `api-test-plan` | Plan de pruebas API REST | Generar plan markdown + archivos .http |
| `execute-api-test-plan` | Ejecutar plan de pruebas API | Correr pruebas con curl y documentar hallazgos |
| `acceptance-testing` | Pruebas de aceptación (Playwright), caja blanca/negra, sistema y carga | Automatización integral de QA y verificación end-to-end |
| `requirements-analysis` | Análisis de requerimientos | Generar feature_list.json |
| `generate-spec` | Generar spec técnico de una feature | Crear spec.md/tasks.md/decisions.md en project-docs + recomendar tdd/sdd/ftd |
| `implement-tdd` | Implementar un spec con TDD (tests primero) | Lógica con ramas y rutas de error |
| `implement-sdd` | Implementar un spec con SDD (spec → código) | Multi-módulo, migraciones, integraciones |
| `implement-ftd` | Implementar un cambio pequeño sin lógica nueva | Constantes, labels, estilos, config, tweaks UI |
| `write-unit-tests` | Escribir tests unitarios (agnóstico al lenguaje) | Cubrir código de un spec antes de verificarlo |
| `targeted-qa` | Pruebas focalizadas de QA bajo demanda | Diseñar y ejecutar suites de prueba puntuales (E2E, BVA, API, carga, a11y) a solicitud de QA |
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

---

## Reglas Permanentes: Wiki, Colecciones y Persistencia Dual

### 1. Taxonomía Canónica de Colecciones (Plane Wiki Spaces)
Toda página de la base de conocimiento (`pages`) debe clasificarse estrictamente en una de las 5 colecciones del arnés:
- `general`: Visión del proyecto, contexto de negocio, estándares transversales, glosario de términos y gobernanza global.
- `engineering`: Arquitectura AS-IS, modelo C4, diagramas UML, catálogo de reglas de negocio (`business-rules.md`), modelo relacional de datos y contratos de servicios externos (`external-services.md`).
- `product`: Visión del producto, especificaciones funcionales (SRS ISO 29148 / IEEE 830), épicas y requerimientos de usuario.
- `design`: Sistema de diseño, tokens visuales, especificaciones UX y maquetación de componentes.
- `customer_support`: Procedimientos operativos, guías de despliegue, troubleshooting, manuales de soporte y runbooks.

### 2. Fuente de Verdad Dual y Prioridad de Frontmatter
- **En disco**: El frontmatter YAML de los archivos `.md` en `project-docs/knowledge/` y `project-docs/specs/` es la fuente de verdad declarativa (`collection`, `parent`, `owner`, `access`, `is_locked`, `is_favorite`, `full_width`, `labels`).
- **En ejecución**: SQLite (`project-docs/data/harness.db`) materializa y consulta las relaciones en milisegundos. Toda mutación realizada desde la UI o API se sincroniza bidireccionalmente hacia el frontmatter del archivo `.md`.

### 3. Invariantes de Negocio BR-PAGE-*
- **`BR-PAGE-01`**: Visibilidad dual (`access = 0` Public vs `access = 1` Private).
- **`BR-PAGE-02`**: Bloqueo normativo e inmutabilidad de archivo. Prohibido editar título o contenido Markdown si `is_locked = 1` o `archived_at != NULL` sin operación explícita previa de desbloqueo o restauración.
- **`BR-PAGE-03`**: Archivar una página desmarca automáticamente `is_favorite = 0`.
- **`BR-PAGE-04`**: Inmutabilidad de visibilidad en documentos archivados. Prohibido alternar `access` mientras esté archivada.
- **`BR-PAGE-07`**: Herencia de colección. Toda subpágina hereda obligatoriamente el `collection_id` de su página padre.
- **`BR-PAGE-08`**: Límite jerárquico de profundidad a 4 niveles (`depth <= 4`) y prohibición matemática de ciclos circulares en `parent_id` (`Circular hierarchy detected`).
- **`BR-PAGE-09`**: Archivo en cascada. Archivar un padre propaga automáticamente `archived_at` y `is_favorite = 0` a todos sus descendientes.
- **`BR-PAGE-10`**: Slugs únicos por colección (`idx_pages_collection_slug`) calculados deterministamente con sufijos correlativos (`-2`, `-3`).

### 4. Política de Tolerancia Cero a Mocks ("Sin Mocks")
Queda estrictamente prohibido quemar nombres de personas ficticias ('Aria', 'Marcus', 'Ana', 'Priya Sharma', 'Alex', 'Jordan Kim') o identificadores no persistidos ('prod-1', 'prod-2'). Toda entidad debe provenir de las tablas relacionales de SQLite (`users`, `collections`, `pages`, `issues`).

### 5. Política de Cero Emojis ("0 Emojis")
Todo icono en la interfaz de usuario debe ser vectorial SVG tipado desde `Icons.*` (`w-3.5 h-3.5`, etc.). Queda terminantemente prohibido incluir caracteres emoji unicode en el código fuente o templates HTML.

### 6. Checklist de Cierre de Bloque (Obligatorio)
Antes de dar por concluido cualquier bloque o feature:
1. `npm --prefix project-docs run build`: Compilación con esbuild sin errores (0 advertencias).
2. `npm --prefix project-docs test`: 100% de pruebas unitarias en verde (`node --test`).
3. `npm --prefix project-docs run test:acceptance`: Pruebas de aceptación Playwright ejecutadas y en verde.
4. `node project-docs/sync-data.js`: Sincronización de datos para modo offline (`file:///`) y servidor.
5. Commit semántico (`feat`, `fix`) en la rama `{feature|bugfix}/INT-{num}/{name}` (≤ 80 caracteres).

### 7. Integridad de Evidencias, Auditoría y Transparencia
Declara toda edición a tests, benchmarks o documentos usados como evidencia; no marques un punto como resuelto sin salida literal de un comando; los informes muestran diffs reales, no código reescrito.
