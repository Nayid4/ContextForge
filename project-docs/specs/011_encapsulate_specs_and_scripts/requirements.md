# Requirements: Encapsulamiento Completo de Specs, verify.sh y project-spec.yaml en project-docs/

## Metadata

| Campo | Valor |
| :--- | :--- |
| **Feature ID** | `11` |
| **Feature Name** | `harness_deep_encapsulation_specs_and_scripts` |
| **Módulo** | `agent-orchestrator` |
| **Prioridad** | `P0` |
| **Tipo** | `feature` |
| **Estado** | `Done` |
| **Técnica Recomendada** | `SDD` (Spec-Driven Development) |
| **Rama Git** | `feature/INT-011/encapsulate_specs_and_scripts` (48 caracteres $\le 80$) |
| **Directorio de Spec** | `project-docs/specs/011_encapsulate_specs_and_scripts` |

---

## 1. Contexto

Para maximizar la portabilidad y limpieza al copiar el arnés en proyectos externos, el usuario solicita que la raíz del proyecto contenga **únicamente**:
- **4 Directorios**: `.agents/`, `.github/`, `.opencode/`, `project-docs/`.
- **4 Archivos**: `AGENTS.md`, `opencode.json`, `README.md`, `.gitignore`.

Para lograr esta meta arquitectónica:
1. `specs/` se reubica dentro de `project-docs/specs/`.
2. `project-spec.yaml` se reubica dentro de `project-docs/project-spec.yaml`.
3. `verify.sh` se reubica dentro de `project-docs/verify.sh`.
4. Todos los agentes (`.agents/agents/`) y las skills (`.opencode/skills/`, `.github/skills/`, `.agents/skills/`) deben actualizarse para crear y leer archivos en estas nuevas rutas canónicas dentro de `project-docs/`.

---

## 2. Historia de Usuario (Scrum User Story)

```gherkin
Como Arquitecto de Software y Desarrollador
Quiero que specs/, verify.sh y project-spec.yaml residan dentro de project-docs/ y que todas las skills y roles de agentes reconozcan estas nuevas rutas
Para que la raíz del proyecto quede con solo 4 carpetas y 4 archivos esenciales, facilitando mover, aislar o empaquetar el arnés en cualquier repositorio cliente sin interferencias.
```

---

## 3. Criterios de Aceptación (EARS & Gherkin)

### `AC-01`: Pureza Extrema de la Raíz
- **EARS**: La raíz del proyecto **debe** contener exclusivamente las carpetas `.agents/`, `.github/`, `.opencode/` y `project-docs/`, y los archivos `AGENTS.md`, `opencode.json`, `README.md` y `.gitignore`.
- **Gherkin**:
  ```gherkin
  Given la inspección del directorio raíz del proyecto
  When se listan los directorios y archivos de primer nivel
  Then solo existen las carpetas .agents, .github, .opencode y project-docs
  And solo existen los archivos AGENTS.md, opencode.json, README.md y .gitignore
  ```

### `AC-02`: Encapsulamiento de Specs en `project-docs/specs/`
- **EARS**: Todas las especificaciones de features actuales e históricas **deben** residir en `project-docs/specs/<NNN>_<name>/`.

### `AC-03`: Encapsulamiento de `verify.sh` y `project-spec.yaml`
- **EARS**: `verify.sh` **debe** residir en `project-docs/verify.sh` y auto-resolver su directorio base, ejecutando los 9 niveles de prueba en verde. `project-spec.yaml` **debe** residir en `project-docs/project-spec.yaml`.

### `AC-04`: Actualización Universal de Agentes y Skills
- **EARS**: Los agentes (`leader`, `spec-author`, `implementer`, `reviewer`) y las skills homologadas (`.opencode/skills/`, `.github/skills/`, `.agents/skills/`) **deben** apuntar a `project-docs/specs/`, `project-docs/project-spec.yaml` y `project-docs/verify.sh`.
