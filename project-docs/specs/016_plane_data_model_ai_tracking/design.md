# Diseño Técnico & ADRs: 016 — Modelo de Datos Completo de Plane & Trazabilidad IA

## 1. Resumen Arquitectónico
Esta especificación extiende el núcleo de datos del arnés (`project-docs/src/core/db.js` y `project-docs/src/core/sqlite-sync.js`), la CLI (`project-docs/cli.js`), la API REST (`project-docs/serve.js`), los módulos Screaming (`Issues` y `Harness`) y las 21 skills SDD para implementar el modelo relacional completo de Makeplane (Plane) junto con su subsistema de Inteligencia Artificial y trazabilidad documental en Markdown (`.md`).

## 2. Mapeo de las 26 Tablas SQLite (`project-docs/data/harness.db`)

| Dominio Plane | Tablas SQLite | Propósito en el Arnés SDD |
| :--- | :--- | :--- |
| **Workspace & Identidad IA** | `workspaces`, `users`, `workspace_members`, `api_tokens` | Modela el workspace soberano, usuarios humanos y agentes bot (`is_bot=1`, `bot_type` para `leader`, `spec-author`, `implementer`, `reviewer`) con sus `APIToken` (`user_type=1`). |
| **Motor & Auditoría IA** | `ai_configs`, `ai_runs` | `ai_configs` almacena la configuración LLM (`InstanceConfig` / `LLMProvider`); `ai_runs` registra cada ejecución de skill SDD y la espeja en `project-docs/knowledge/ai-runs-log.md`. |
| **Proyectos & Catálogos** | `projects`, `states`, `labels`, `estimates`, `estimate_points`, `issue_types`, `issue_views` | Estados Kanban, etiquetas semánticas, estimación Fibonacci (`1..13` pts), tipos (`Feature`, `Bugfix`, `Epic`) y vistas guardadas. |
| **Planificación Ágil** | `cycles`, `cycle_issues`, `modules`, `module_issues` | Sprints con burn-down y bounded contexts arquitectónicos vinculados a las tareas. |
| **Tareas, QA & Auditoría** | `issues`, `subtasks`, `issue_assignees`, `issue_labels`, `issue_relations`, `issue_activities`, `issue_comments`, `issue_evidences` | Tareas Scrum/EARS, subtareas Jira DEV/QA, grafo de bloqueos (`blocked_by`), historial de mutaciones (`IssueActivity`), comentarios de skills y galería de evidencias/reportes QA. |
| **Conocimiento & Versionado** | `pages`, `page_versions` | Páginas Markdown de `knowledge/` y `specs/` con snapshots históricos (`PageVersion`). |

## 3. Decisiones de Arquitectura (ADRs)

### ADR-016-01: Persistencia Dual Automática de Ejecuciones IA (`ai_runs` <-> `knowledge/ai-runs-log.md`)
- **Contexto**: Los agentes de IA leen archivos Markdown de forma nativa con máxima eficiencia contextual, mientras que el tablero Plane y la CLI requieren consultas relacionales estructuradas.
- **Decisión**: Cada vez que se invoca `recordSkillExecution(db, payload)` (vía `node project-docs/cli.js ai log` o `POST /api/plane/ai-runs`), se inserta la fila en `ai_runs`, se registra el evento en `issue_activities` y se regenera automáticamente el documento `project-docs/knowledge/ai-runs-log.md`, el cual a su vez se indexa como `Page` en la base de conocimiento.
- **Alternativa descartada**: Guardar logs únicamente en consola o en archivos sueltos no indexados (descartado por impedir trazabilidad relacional en `IssueDetailModal` y `HarnessPage`).

### ADR-016-02: Inyección de Comandos CLI en las 21 Skills SDD y 4 Agentes
- **Contexto**: Las skills generaban reportes, planes API, especificaciones, tests y evidencias en archivos locales, pero requerían un paso explícito para empujar los metadatos relacionales al modelo de Plane.
- **Decisión**: Estandarizar en las 21 skills de `.opencode/skills/` (y sus espejos en `.github/skills/` y `.agents/skills/`) los comandos `node project-docs/cli.js issue evidence`, `issue update`, `page upsert`, `ai log` y `node project-docs/sync-data.js`.
