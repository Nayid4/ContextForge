# Especificación de Requerimientos Scrum & SDD: 016

- **Ticket ID**: INT-016
- **Nombre**: plane_data_model_ai_tracking
- **Módulo**: Harness Core & Dashboard Visualizer
- **Prioridad**: P0
- **Estado**: Done
- **Rama Git**: feature/INT-016/plane_data_model_ai_tracking (44 caracteres <= 80)
- **Persistencia Dual**: SQLite Relacional (`project-docs/data/harness.db` - 26 tablas) + Espejo Markdown (`.md`) / JSON

## 1. Historia de Usuario (Scrum User Story)
> **COMO** Arquitecto de Software, Desarrollador y Agente de IA,
> **QUIERO** implementar el modelo de datos relacional completo de Plane (26 tablas incluyendo entidades de IA, agentes bot, tokens API, ejecuciones de skills, evidencias QA, actividades, comentarios, relaciones, etiquetas, estimaciones Fibonacci, vistas y versiones de páginas) sincronizado bidireccionalmente con archivos Markdown y conectado a las 21 skills SDD,
> **PARA** que toda información, documentación, especificación, evidencia y reporte generado por las skills o agentes se persista automáticamente en SQLite y en archivos `.md` listos para consumo cognitivo y visualización en el tablero Plane.

## 2. Definición de Listo (Definition of Ready - DoR)
- [x] Ingeniería inversa completa del modelo de datos y relaciones IA del repositorio Plane (`apps/api/plane/db/models/` y `packages/services/src/ai/`).
- [x] Arquitectura Screaming consolidada en `project-docs/src/modules/`, `src/core/` y `src/shared/`.
- [x] Rama semántica `feature/INT-016/plane_data_model_ai_tracking` creada cumpliendo el límite <= 80 caracteres.

## 3. Definición de Hecho (Definition of Done - DoD)
- [x] 26 tablas relacionales de Plane e IA creadas y migradas limpiamente en `project-docs/src/core/db.js`.
- [x] Motor de sincronización bidireccional `project-docs/src/core/sqlite-sync.js` poblando agentes bot (`is_bot=1`), tokens API, configuraciones IA (`ai_configs`), bitácora de ejecuciones (`ai_runs` <-> `knowledge/ai-runs-log.md`), evidencias (`issue_evidences`), actividades (`issue_activities`), comentarios (`issue_comments`), relaciones (`issue_relations`) y versiones documentales (`page_versions`).
- [x] CLI soberana (`project-docs/cli.js`) y servidor HTTP (`project-docs/serve.js`) ampliados con comandos y endpoints para registrar ejecuciones IA, evidencias, comentarios, relaciones y páginas Markdown.
- [x] las 21 skills SDD homologadas en `.opencode/skills/`, `.github/skills/` y `.agents/skills/` y los 4 subagentes en `.agents/agents/` actualizados para enviar sus artefactos, reportes y evidencias al proyecto mediante `cli.js` y `sync-data.js`.
- [x] 100% de tests en verde en los 9 niveles de `project-docs/verify.sh` y cero emojis en todo el código.

## 4. Requerimientos en Notación EARS Estricta
- **R1 [UBIQUOUS]**: El sistema DEBE mantener las 26 tablas del modelo relacional de Plane e IA en `project-docs/data/harness.db` con integridad referencial (`FOREIGN KEY`) y modo `WAL`.
- **R2 [EVENT]**: CUANDO una skill SDD o subagente genere información, especificaciones, documentación, evidencias o reportes de prueba, el sistema DEBE persistir el registro tanto en SQLite (`ai_runs`, `issue_evidences`, `issue_activities`, `pages`, `page_versions`) como en archivos Markdown (`knowledge/ai-runs-log.md`, `specs/`, `feature_list.json`).
- **R3 [STATE]**: MIENTRAS el usuario inspeccione el detalle de una tarea (`IssueDetailModal`) o el panel de gobernanza (`HarnessPage`), la interfaz DEBE mostrar las etiquetas Plane, puntos Fibonacci, relaciones de dependencia, evidencias QA verificadas, configuraciones IA, tokens de agentes bot y bitácora de skills ejecutadas.
- **R4 [UNWANTED]**: SI una base de datos SQLite previa existe con un esquema anterior de 8 tablas, ENTONCES `initDatabase` DEBE aplicar migraciones seguras de columnas (`ensureColumn`) y crear las nuevas tablas sin pérdida de datos.
