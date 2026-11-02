# Harness Engineering — Spec Driven Development con Agentes de IA

> **Esto no es un proyecto de software, es un arnés de control para desarrollo dirigido por specs.**
>
> Un repositorio plantilla que cualquier proyecto puede adoptar para desarrollar
> features y bugfixes con agentes de IA (**Google Antigravity**, **opencode**, **GitHub Copilot**, Claude Code) de forma
> **autónoma, verificable y trazable**. Es agnóstico al stack: funciona con
> Node, .NET, Python, Go o cualquier tecnología.

---

## ¿Para qué sirve este repositorio?

Descárgalo cuando quieras que un agente de IA desarrolle features de tu proyecto siguiendo:

- **Spec Driven Development** — primero se escribe el qué (spec), los pasos (tasks) y las decisiones; luego se codifica. Todo aprobado por un humano.
- **Flujo completo por skills** — `requirements-analysis` → `generate-spec` → técnica (`implement-tdd`/`implement-sdd`/`implement-ftd`) → `verify-spec`.
- **Verificación real** — `technical-audit` genera `project-spec.yaml` y `generate-verify` crea `verify.sh` con los comandos reales del proyecto (test, build, lint).
- **Tablero de visualización de seguimiento** — interfaz interactiva modular (`project-docs/`) con arquitectura screaming, componentes React-like en Vanilla JS y Tailwind CSS v4.
- **Agnóstico al proyecto** — el stack, puertos y servicios los defines tú; el arnés aporta el estándar de ingeniería.

---

## Cómo instalar este arnés

El harness **no debe clonarse como repositorio independiente** dentro de tu
proyecto. Los archivos deben copiarse **sin el historial git** del harness
para no interferir con el control de versiones de tu proyecto.

<details>
<summary>📦 Opción A — Descargar ZIP (recomendada, sin git)</summary>

```bash
# Desde la raíz de tu proyecto (el que ya tiene su propio .git):
# 1. Descarga el ZIP y extráelo en una carpeta temporal
curl -L https://github.com/AndresOsorio0710/harness_anginnering/archive/master.tar.gz \
  | tar xz --strip=1 -C /tmp/harness-temp

# 2. Copia los archivos del harness a tu proyecto (sin .git)
cp -r /tmp/harness-temp/* /tmp/harness-temp/.* .

# 3. Limpia
rm -rf /tmp/harness-temp
```
</details>

<details>
<summary>🔀 Opción B — Clone shallow + copia (si tienes git)</summary>

```bash
git clone --depth 1 https://github.com/AndresOsorio0710/harness_anginnering.git /tmp/harness-temp

# Copia a tu proyecto (sin .git — no se cruza con tu historial)
cp -r /tmp/harness-temp/* /tmp/harness-temp/.* /ruta/de/tu/proyecto/

rm -rf /tmp/harness-temp
```
</details>

<details>
<summary>🔄 Opción C — Nuevo proyecto desde cero</summary>

```bash
git clone --depth 1 https://github.com/AndresOsorio0710/harness_anginnering.git mi-proyecto
cd mi-proyecto
rm -rf .git   # ← importante: elimina el git del harness
git init      # ← inicia tu propio repositorio
git add -A && git commit -m "feat: initialize project with harness"
```
</details>

---

## Puesta en marcha

1. **Audita el proyecto** — skill `technical-audit` → genera `project-spec.yaml` (runtime, dependencias, servicios).
2. **Genera la verificación** — skill `generate-verify` → crea `verify.sh` con los comandos reales.
3. **Define las features** — skill `requirements-analysis` → genera `project-docs/feature_list.json`.
4. **Abre con tu agente de IA:**

   | Herramienta | Comando |
   |-------------|---------|
   | **Google Antigravity** | Abre en Antigravity 2.0 / IDE o ejecuta `agy` (usa `.agents/` y `ANTIGRAVITY.md`) |
   | **opencode** | `opencode` (usa `opencode.json` y `.opencode/`) |
   | **GitHub Copilot** | `code .` (usa `.github/instructions/` y `.github/skills/`) |
   | **Claude Code / Cursor** | usan `AGENTS.md` |

5. **Pide una feature o bugfix:**

   ```
   genera el spec de la feature 1
   ```

   El flujo completo queda a cargo de las skills: `generate-spec` (spec aprobado por ti) → `implement-tdd`/`implement-sdd`/`implement-ftd` → `verify-spec` (cierre con tests y `verify.sh`), siempre trabajando dentro de una rama `{feature|bugfix}/INT-{numero}/{nombre}` (≤ 80 caracteres).

---

## Convención de Ramas Git (Obligatoria)

Toda tarea debe realizarse en su propia rama con límite estricto de longitud:

```
{feature o bugfix}/INT-{numero}/{nombre_rama_de_lo_realizado}
```

- **Tipos permitidos**: `feature` o `bugfix`.
- **Límite de longitud**: **máximo 80 caracteres**.
- **Ejemplos válidos**:
  - `feature/INT-001/document_crud_api`
  - `bugfix/INT-002/fix_jwt_token_expiration`

---

## Tablero de Seguimiento Visual (`project-docs/`)

El repositorio incluye un visualizador interactivo desacoplado para monitorear el avance de la IA:
- **Tecnologías**: Vanilla JS modular (ES Modules nativos sin build step), **Tailwind CSS v4** (`@tailwindcss/browser@4`) y Three.js.
- **Arquitectura Screaming (`project-docs/src/`)**:
  - `features/stats/`: Tarjetas de KPI (total, progreso %, pendientes, completadas, bloqueadas).
  - `features/current-spec/`: Tarjeta interactiva del spec que la IA está ejecutando en tiempo real.
  - `features/feature-list/`: Tabla reactiva de tareas con filtrado en tiempo real, búsqueda y paginación.
  - `features/dependency-graph/`: Matriz de dependencias y análisis de bloqueos.
  - `features/dependency-tree/`: Árbol jerárquico SVG con controles de zoom y pan.
  - `features/space-view-3d/`: Constelación espacial 3D con ciclo de vida `mount`/`unmount` para liberar memoria GPU.
  - `features/history-timeline/`: Bitácora histórica cronológica de entregas y commits.
- **Uso**: Abre directamente `project-docs/index.html` en tu navegador o sírvelo con cualquier servidor web estático.

---

## Arquitectura del arnés

```
.
├── AGENTS.md                    # Punto de entrada universal para cualquier agente
├── ANTIGRAVITY.md               # Guía de referencia rápida para Google Antigravity
├── README.md                    # Este archivo
├── opencode.json                # Configuración para opencode (instrucciones + skills)
├── .gitignore                   # Exclusiones del arnés
│
├── project-docs/                # Documentación y Tablero Visual de la IA
│   ├── index.html               # Shell HTML con Tailwind CSS v4 y Three.js
│   ├── feature_list.json        # Features y bugfixes (ramas INT-*, status, prioridad)
│   ├── progres/
│   │   ├── current.json         # Spec activo ({} = ninguno)
│   │   └── history.json         # Historial de specs cerrados
│   └── src/                     # Screaming Architecture en Vanilla JS (core, shared, features)
│
├── .agents/                     # Homologación para Google Antigravity
│   ├── rules/                   # Reglas de arnés y branching
│   ├── agents/                  # Roles (leader, spec-author, implementer, reviewer)
│   └── skills/                  # Skills homologadas para Antigravity
│
├── .opencode/                   # Configuración de opencode
│   ├── rules/                   # Reglas: branches, commits, skills-sync, project-status
│   └── skills/                  # 13 skills (FUENTE DE VERDAD)
│
└── .github/                     # Homologación para GitHub Copilot
    ├── instructions/            # Reglas (espejo de .opencode/rules/)
    └── skills/                  # Skills (espejo de .opencode/skills/)
```

---

## Flujo de trabajo (SDD)

Una feature completa el siguiente ciclo, siempre en su propia rama `{feature|bugfix}/INT-{numero}/{nombre}` (≤ 80c):

| Paso | Skill | Produce |
|------|-------|---------|
| 1. Auditoría | `technical-audit` | `project-spec.yaml` |
| 2. Verificación | `generate-verify` | `verify.sh` |
| 3. Requerimientos | `requirements-analysis` | `project-docs/feature_list.json` |
| 4. Spec | `generate-spec` | `spec.md`, `tasks.md`, `decisions.md` (+ `current.json`) |
| 5. ⏸ Aprobación | **Humano** | Aprueba o rechaza el spec en el chat |
| 6. Implementación | `implement-tdd` / `implement-sdd` / `implement-ftd` | Código + tests |
| 7. Pruebas API (opcional) | `api-test-plan` → `execute-api-test-plan` | Plan `.http` + hallazgos |
| 8. Tests unitarios | `write-unit-tests` | Cobertura de tests del spec |
| 9. Cierre | `verify-spec` | AC ✓, tasks ✓, tests ✓, `verify.sh` ✓ → cierra metadata |

### Técnicas de implementación

| Técnica | Skill | Cuándo |
|---------|-------|--------|
| **TDD** | `implement-tdd` | Lógica con ramas y rutas de error |
| **SDD** | `implement-sdd` | Multi-módulo, migraciones, integraciones |
| **FTD** | `implement-ftd` | Cambios sin lógica nueva (constantes, estilos, config) |

`generate-spec` recomienda la técnica al generar el spec. Las tres terminan en tests; el **cierre de metadata solo lo hace `verify-spec`**.

---

## Skills

| Skill | Descripción |
|-------|-------------|
| `technical-audit` | Auditoría técnica → `project-spec.yaml` |
| `generate-verify` | Genera `verify.sh` desde `project-spec.yaml` |
| `verification` | Cómo ejecutar la verificación |
| `requirements-analysis` | Análisis de docs → `feature_list.json` |
| `generate-spec` | Spec técnico por feature |
| `implement-tdd` | Implementación con TDD |
| `implement-sdd` | Implementación dirigida por spec |
| `implement-ftd` | Cambios pequeños sin lógica nueva |
| `write-unit-tests` | Tests unitarios (agnóstico al lenguaje) |
| `verify-spec` | Cierre completo de un spec |
| `api-test-plan` | Plan de pruebas API REST |
| `execute-api-test-plan` | Ejecución de pruebas API con curl |
| `sync-skills` | Sincroniza `.opencode/skills/` → `.github/skills/` y `.agents/skills/` |

---

## Reglas

- **Ramas estandarizadas**: `{feature|bugfix}/INT-{numero}/{nombre}` (máx 80c) → `.opencode/rules/branches.md`
- **Commits semánticos** en inglés: `feat(scope): description` → `.opencode/rules/commits.md`
- **Skills sincronizadas**: fuente `.opencode/skills/`, espejos `.github/skills/` y `.agents/skills/` → `.opencode/rules/skills-sync.md`
- **Estado del proyecto**: al pedir "estado del proyecto", el agente lee `project-docs/` → `.opencode/rules/project-status.md`
- **Sin push** sin confirmación explícita del usuario.

---

## Preguntas frecuentes

### ¿Puedo usar este arnés en un proyecto existente?

Sí. Copia los archivos (Opción A o B) en la raíz de tu proyecto. El `project-docs/` plantilla convive con tu documentación existente.

### ¿Necesito una herramienta específica (Antigravity u opencode)?

No. `AGENTS.md` es el punto de entrada universal (Claude Code, Cursor). El arnés incluye soporte de primera clase tanto para **Google Antigravity** (`.agents/`), como para **opencode** (`opencode.json`, `.opencode/`) y **GitHub Copilot** (`.github/`).

### ¿Dónde cambia el stack de mi proyecto?

En `project-spec.yaml` (lo genera `technical-audit`) y en la sección de convenciones de `AGENTS.md`. El arnés no asume lenguaje, puertos ni servicios.

### ¿Cómo agrego una skill nueva?

Crea `.opencode/skills/<name>/SKILL.md` (fuente de verdad) y propágala a `.github/skills/<name>/SKILL.md` y `.agents/skills/<name>/SKILL.md` — o ejecuta la skill `sync-skills`.
