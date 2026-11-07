# Requirements: Encapsulamiento de Archivos y Limpieza de Raíz para Adopción del Arnés

## Metadata

| Campo | Valor |
| :--- | :--- |
| **Feature ID** | `10` |
| **Feature Name** | `harness_root_cleanliness_encapsulation` |
| **Módulo** | `agent-orchestrator` |
| **Prioridad** | `P0` |
| **Tipo** | `feature` |
| **Estado** | `Done` |
| **Técnica Recomendada** | `SDD` (Spec-Driven Development) |
| **Rama Git** | `feature/INT-010/harness_root_cleanliness_encapsulation` (54 caracteres $\le 80$) |
| **Directorio de Spec** | `specs/010_harness_root_cleanliness_encapsulation` |

---

## 1. Contexto

El **AI Agentic SDD Engineering Harness** fue diseñado para ser agnóstico y adoptable mediante copy-paste en cualquier repositorio de software (Node.js, .NET, Python, Java, Go, Rust, etc.). Sin embargo, actualmente residen 21 archivos y carpetas en la raíz del repositorio, incluyendo dependencias de desarrollo (`package.json`, `package-lock.json`, `node_modules/`), configuraciones de pruebas (`playwright.config.js`), carpetas de tests (`tests/`, `test-results/`), scripts auxiliares (`scripts/`) y archivos de plantillas (`kickstart.json`).

Al copiar y pegar el arnés en un proyecto cliente:
1. Si el proyecto cliente ya usa Node/npm, `package.json` en la raíz genera colisiones destructivas con las dependencias del cliente.
2. Si el proyecto cliente es de otro lenguaje (.NET C#, Python, etc.), tener `package.json` y `node_modules/` en la raíz ensucia el repositorio y confunde las herramientas de CI/CD del cliente.
3. Las pruebas del tablero (`tests/`) se mezclan con los tests del dominio de la aplicación anfitriona.

---

## 2. Historia de Usuario (Scrum User Story)

> **COMO** Ingeniero / Arquitecto de Software que adopta el arnés en múltiples proyectos de diversas tecnologías (.NET, Python, Java, Go, Node),  
> **QUIERO** una raíz de repositorio limpia y minimalista donde todos los artefactos internos, dependencias npm, scripts y tests del tablero residan encapsulados dentro de `project-docs/`,  
> **PARA** poder copiar y pegar el arnés en cualquier repositorio sin colisiones de `package.json`, interferencias de testing o archivos sueltos en el directorio raíz.

---

## 3. Definición de Listo (Definition of Ready - DoR)

- [x] Problema de negocio y dolor de adopción multi-proyecto claramente documentados.
- [x] Identificación exhaustiva del inventario de 21 archivos actuales y su mapeo al directorio destino.
- [x] Rama de trabajo `feature/INT-010/harness_root_cleanliness_encapsulation` definida respetando la convención $\le 80$ caracteres.
- [x] Requerimientos funcionales formalizados bajo sintaxis EARS y criterios Gherkin.
- [x] Subtareas Scrum Jira DEV/QA definidas con asignación a `implementer` y `reviewer`.

---

## 4. Definición de Hecho (Definition of Done - DoD)

- [x] La raíz del repositorio contiene **únicamente** los 4 directorios canónicos (`.agents/`, `.github/`, `.opencode/`, `project-docs/`) y los archivos mínimos indispensables (`AGENTS.md`, `opencode.json`, `project-spec.yaml`, `verify.sh`, `README.md`, `.gitignore`).
- [x] `package.json`, `package-lock.json`, `playwright.config.js` y `node_modules/` residen de forma autónoma dentro de `project-docs/`.
- [x] La suite de pruebas del arnés reside en `project-docs/tests/` y los scripts en `project-docs/scripts/`.
- [x] `kickstart.json` reside en `project-docs/kickstart.json`.
- [x] `ANTIGRAVITY.md` se consolida en `.agents/ANTIGRAVITY.md` y se referencia desde `AGENTS.md`.
- [x] `verify.sh` se ejecuta desde la raíz delegando en `project-docs/` de forma transparente.
- [x] 100% de las pruebas automatizadas (unit, whitebox, blackbox, system, load, Playwright E2E) pasando en verde con las nuevas rutas.
- [x] El tablero interactivo `project-docs/index.html` funciona al 100% en modo servidor (`serve.js`) y en modo offline (`file:///`).
- [x] Capturas de pantalla de evidencia guardadas en `specs/010_harness_root_cleanliness_encapsulation/evidence/`.

---

## 5. Criterios de Aceptación (EARS & Gherkin)

### `AC-01`: Pureza y Minimalismo del Directorio Raíz
- **EARS**: Cuando se inspeccione la raíz del proyecto, el sistema **no debe** contener archivos de dependencias ni de testing de Node (`package.json`, `playwright.config.js`, `tests/`), conteniendo únicamente los 4 directorios canónicos del arnés y los archivos indispensables de orquestación.
- **Gherkin**:
  ```gherkin
  Given un proyecto que adopta el arnés SDD
  When se lista el contenido del directorio raíz
  Then solo existen los directorios .agents, .github, .opencode y project-docs
  And solo existen los archivos raíz AGENTS.md, opencode.json, project-spec.yaml, verify.sh, README.md y .gitignore
  ```

### `AC-02`: Encapsulamiento Autónomo de Tooling en `project-docs/`
- **EARS**: Cuando se ejecute la compilación del bundle o la instalación de dependencias, el sistema **debe** operar de forma autónoma desde el contexto de `project-docs/` sin requerir que la raíz del proyecto sea un paquete npm.
- **Gherkin**:
  ```gherkin
  Given las dependencias encapsuladas en project-docs/package.json
  When se ejecuta `npm --prefix project-docs run build`
  Then se genera exitosamente el bundle project-docs/dist/app.bundle.js
  ```

### `AC-03`: Preservación de la Suite Completa de Testing en `project-docs/tests/`
- **EARS**: Mientras la suite de pruebas resida dentro de `project-docs/tests/`, la ejecución de tests unitarios, caja blanca, caja negra, sistema, carga y Playwright **debe** ejecutarse con 0 fallos.
- **Gherkin**:
  ```gherkin
  Given la suite de pruebas reubicada en project-docs/tests/
  When se ejecutan los scripts de prueba vía npm --prefix project-docs test
  Then pasan las 16 pruebas unitarias, 12 de caja blanca, 8 de caja negra, 7 de sistema, 1 de carga y 10 de Playwright
  ```

### `AC-04`: Compatibilidad Transparente en `verify.sh`
- **EARS**: Cuando el desarrollador o CI invoque `./verify.sh` desde la raíz, el script **debe** delegar internamente las llamadas a `project-docs/` sin alterar la experiencia de usuario.

### `AC-05`: Reubicación de Archivos Auxiliares (`kickstart.json` y `ANTIGRAVITY.md`)
- **EARS**: `kickstart.json` **debe** residir en `project-docs/kickstart.json` y `ANTIGRAVITY.md` **debe** residir en `.agents/ANTIGRAVITY.md`, manteniendo sus referencias operativas en la documentación.
