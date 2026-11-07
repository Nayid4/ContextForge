# Design: Encapsulamiento Completo de Specs, verify.sh y project-spec.yaml en project-docs/

## 1. Arquitectura de Archivos y Raíz Canónica

```
<raíz-del-proyecto>/
├── .agents/                    # Agentes y reglas de Google Antigravity
│   ├── agents/                 # leader, spec-author, implementer, reviewer
│   ├── rules/                  # Reglas del arnés
│   ├── skills/                 # Espejo de skills Antigravity
│   └── ANTIGRAVITY.md          # Guía nativa Antigravity 2.0
├── .github/                    # Configuración de GitHub Copilot
│   ├── instructions/           # Instrucciones de Copilot
│   └── skills/                 # Espejo de skills Copilot
├── .opencode/                  # Configuración de OpenCode (Fuente de verdad)
│   ├── rules/                  # Reglas de OpenCode
│   └── skills/                 # Skills canónicas (Fuente de verdad)
├── project-docs/               # Encapsulación total del arnés
│   ├── specs/                  # Especificaciones SDD (001_*, 008_*, 009_*, 010_*, 011_*)
│   ├── tests/                  # Suites de prueba (unit, whitebox, blackbox, system, load, acceptance)
│   ├── scripts/                # Scripts auxiliares (capture-evidence.js)
│   ├── knowledge/              # Base de conocimiento Docs-as-Code
│   ├── progres/                # Registro de estado (current.json, history.json)
│   ├── src/                    # Código fuente del tablero interactivo
│   ├── dist/                   # Bundles compilados
│   ├── package.json            # Tooling y scripts npm
│   ├── package-lock.json       # Lockfile npm
│   ├── playwright.config.js    # Configuración de Playwright
│   ├── kickstart.json          # Plantilla de inicialización
│   ├── project-spec.yaml       # Especificación técnica del proyecto
│   ├── project-spec.json       # JSON de auditoría para el tablero
│   └── verify.sh               # Script de verificación integral autónomo
├── AGENTS.md                   # Reglas del arnés y orquestación
├── opencode.json               # Configuración OpenCode
├── README.md                   # Documentación general
└── .gitignore                  # Reglas de exclusión git
```

---

## 2. Decisiones de Arquitectura (ADRs)

### `ADR-001`: Specs alojados en `project-docs/specs/`
- **Contexto**: Anteriormente `specs/` estaba en la raíz, dejando carpetas de desarrollo sueltas.
- **Decisión**: Mover todas las especificaciones a `project-docs/specs/`. Todos los agentes y skills generan y leen specs en esta ruta.

### `ADR-002`: `verify.sh` auto-contenido en `project-docs/verify.sh`
- **Contexto**: `verify.sh` estaba en la raíz invocando `--prefix project-docs`.
- **Decisión**: Mover `verify.sh` a `project-docs/verify.sh`. Resuelve `SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"`, por lo que ejecutarlo desde la raíz (`bash project-docs/verify.sh`) o desde dentro de `project-docs/` funciona idénticamente con `npm run ...` nativo.

### `ADR-003`: `project-spec.yaml` en `project-docs/project-spec.yaml`
- **Contexto**: `project-spec.yaml` estaba en la raíz.
- **Decisión**: Moverlo a `project-docs/project-spec.yaml`. Los agentes y skills leen prioritariamente `project-docs/project-spec.yaml` (con fallback opcional a `project-spec.yaml` por retrocompatibilidad).
