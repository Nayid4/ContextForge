# Especificación de Requerimientos — INT-017: Evolución de la Base de Conocimiento al Patrón Plane Pages, Grafo Relacional (`page_logs`, `page_labels`) y Asistente IA

| Atributo | Valor |
| --- | --- |
| **ID** | `INT-017` |
| **Nombre** | `plane_pages_knowledge_graph_ai` |
| **Rama** | `feature/INT-017/plane_pages_knowledge_graph_ai` |
| **Prioridad** | `P0` |
| **Técnica de Implementación** | `SDD` + `TDD` |
| **Estado** | `done` |

## 1. Historia de Usuario (Scrum)

- **Como:** Arquitecto de Software, Desarrollador y Agente de IA
- **Quiero:** gestionar la Base de Conocimiento del proyecto con la experiencia UI/UX completa de Plane Pages (`PageShelfTree` con pestañas de filtro, `PageHeaderActions` con `Ask Harness AI`, `PageReader` con Smart Entity Chips y `PageNavigationPane` de 4 pestañas) respaldada por las tablas relacionales `page_logs` y `page_labels` en SQLite (28 tablas)
- **Para que:** cada documento técnico de arquitectura, reglas o especificaciones exponga su telemetría en vivo, sus vínculos bidireccionales hacia tareas (`INT-*`), invariantes (`BR-*`/`RF-*`/`ADR-*`/`CAP-*`), diagramas Mermaid e historial de versiones (`page_versions`), alimentado automáticamente desde la skill `/project-knowledge`.

## 2. Requerimientos EARS

- **R1 (Ubicuo):** El motor SQLite (`project-docs/src/core/db.js` y `sqlite-sync.js`) deberá gestionar 28 tablas relacionales incluyendo `page_logs` (#24) y `page_labels` (#25), además de columnas de telemetría documental en `pages` (`word_count`, `char_count`, `paragraph_count`, `diagrams_count`, `module_id`, `updated_by_id`, `is_locked`, `is_favorite`, `view_props`).
- **R2 (Dirigido por eventos):** Cuando se sincronice o actualice una página Markdown, el sistema deberá extraer automáticamente todas sus menciones a tareas (`INT-XXX`), reglas (`BR-XXX`), requisitos (`RF-XXX`), decisiones (`ADR-XXX`), capacidades (`CAP-XXX`) y enlaces entre documentos (`forward_link` y `back_link`) en la tabla `page_logs`.
- **R3 (Ubicuo):** `PageShelfTree.js` deberá incluir las 4 pestañas de filtro rápido estilo Plane (`Todas`, `Favoritas`, `Normativas`, `Por Módulo`) e indicadores vectoriales SVG de página bloqueada (`lock`), favorita (`star`) y conteo de diagramas.
- **R4 (Ubicuo):** `PagesPage.js` y `KnowledgeBase.js` deberán incluir `PageHeaderActions` (badge `SQLite + .md Synced`, `Favorito`, `Bloquear/Desbloquear`, `Ancho Completo`, `Copiar Markdown`, `Ask Harness AI` y toggle del panel derecho) junto con `PageNavigationPane.js` de 4 pestañas (`Outline`, `Info`, `Assets`, `Historial`) y `PageReader.js` con Smart Entity Chips clicables.
- **R5 (Ubicuo):** La skill `/project-knowledge` deberá mantenerse sincronizada en triple espejo (`.opencode/skills/`, `.github/skills/`, `.agents/skills/`) documentando el envío de metadatos Plane (`--locked`, `--favorite`, `--full-width`, `--labels`, `--module`) hacia `cli.js page upsert`.
