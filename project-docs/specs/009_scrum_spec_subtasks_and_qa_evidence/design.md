# Diseño Técnico y Arquitectura: INT-009

## 1. Resumen Técnico
Este diseño formaliza la integración de las prácticas de **Scrum / Agile** y **Jira** dentro del ciclo de vida SDD (Spec Driven Development). Se define un modelo de subtareas desacoplado (`DEV` y `QA`), persistencia determinista 100% en JSON sin dependencias SQL, visualización enriquecida en el tablero Vanilla JS con Tailwind v4, y un motor de captura de capturas de pantalla para auditoría de evidencias en cada cierre de tarea.

---

## 2. Decisiones de Arquitectura (ADRs)

### ADR-001: Desglose Obligatorio de Subtareas DEV y QA Estilo Jira
- **Contexto**: En Scrum y en herramientas como Jira, una User Story no se considera completa únicamente con el código fuente; requiere una subtarea de desarrollo y una subtarea de aseguramiento de calidad (QA).
- **Decisión**: Toda tarea registrada en `feature_list.json` y en las especificaciones tendrá dos subtareas:
  - `INT-XXX-DEV`: Asignada a `implementer`. Abarca el desarrollo técnico, componentes, APIs y pruebas unitarias/caja blanca.
  - `INT-XXX-QA`: Asignada a `reviewer`. Abarca la formulación de casos de prueba, verificación de aceptación E2E, auditoría de Definition of Done (DoD) y captura de evidencias de prueba.
- **Alternativa descartada**: Manejar una lista plana de tareas. Descartada porque diluye la responsabilidad de QA y provoca que las tareas se cierren sin pruebas visuales ni de aceptación independientes.
- **Consecuencias**: Mayor rigor, separación clara de roles y trazabilidad transparente en el tablero de seguimiento.

### ADR-002: Persistencia Exclusiva en JSON (Zero SQL)
- **Contexto**: El arnés es una herramienta ligera, portable y agnóstica que debe funcionar en cualquier entorno sin requerir servicios de base de datos como Postgres, MySQL o SQLite.
- **Decisión**: Los datos de Scrum, subtareas, DoD y evidencias se persisten exclusivamente en `feature_list.json`, en los archivos de especificación Markdown (`requirements.md`, `tasks.md`, `evidence.md`) y en los metadatos de sincronización `data-fallback.js`.
- **Alternativa descartada**: Integrar SQLite o IndexedDB. Descartada porque añade dependencias de compilación nativas y dificulta la portabilidad directa vía `file:///` y git.
- **Consecuencias**: Facilidad de versionado con Git, legibilidad humana directa y compatibilidad offline total.

### ADR-003: Pipeline Automatizado de Captura de Screenshots con Playwright
- **Contexto**: Las evidencias de prueba deben ser irrefutables y visuales, especialmente para componentes de UI y flujos de usuario.
- **Decisión**: Implementar `scripts/capture-evidence.js` utilizando Playwright headless para navegar a las vistas relevantes, interactuar con el sistema, capturar imágenes `.png` en alta definición y guardarlas en `specs/{NNN}_{name}/evidence/`.
- **Alternativa descartada**: Captura manual por parte del usuario. Descartada para mantener la autonomía del arnés de agentes.
- **Consecuencias**: Automatización reproducible y generación de evidencias fotográficas lista para auditoría.

---

## 3. Modelo de Datos JSON

```json
{
  "id": 9,
  "type": "feature",
  "name": "scrum_spec_subtasks_qa_evidence",
  "title": "...",
  "user_story": {
    "as_a": "Líder Técnico y Especialista de QA",
    "i_want": "...",
    "so_that": "..."
  },
  "definition_of_ready": [ "..." ],
  "definition_of_done": [ "..." ],
  "subtasks": [
    {
      "id": "INT-009-DEV",
      "type": "development",
      "title": "...",
      "assignee": "implementer",
      "status": "in_progress",
      "tasks": [
        { "id": "T1", "title": "...", "done": true }
      ]
    },
    {
      "id": "INT-009-QA",
      "type": "qa",
      "title": "...",
      "assignee": "reviewer",
      "status": "todo",
      "test_cases": [
        { "id": "TC-01", "title": "...", "status": "pending" }
      ]
    }
  ],
  "evidence": {
    "completed_at": "ISO-TIMESTAMP",
    "dev_summary": "...",
    "files_modified": [ "..." ],
    "tests_executed": [ "..." ],
    "screenshots": [
      {
        "name": "modal-scrum-view.png",
        "path": "specs/009_scrum_spec_subtasks_and_qa_evidence/evidence/modal-scrum-view.png",
        "caption": "Modal de detalle visualizando User Story Scrum y subtareas Jira DEV/QA"
      }
    ]
  }
}
```

---

## 4. Componentes y Archivos Impactados
- `project-docs/feature_list.json`: Esquema JSON extendido con User Story, DoD, Subtareas Jira y Evidencias.
- `project-docs/src/shared/Modal.js`: Renderizado de User Story, subtareas Jira DEV/QA con badges de estado, checklist DoD y galería de capturas.
- `project-docs/src/features/feature-list/FeatureTable.js`: Indicadores de estado de subtareas DEV y QA en las filas de la tabla.
- `project-docs/src/features/current-spec/CurrentSpecCard.js`: Indicador de la subtarea activa.
- `scripts/capture-evidence.js`: Script utilitario de Playwright para tomar capturas automáticas de la interfaz.
- `.opencode/skills/generate-spec/SKILL.md`: Actualización de la plantilla con secciones Scrum.
- `.opencode/skills/verify-spec/SKILL.md`: Validación obligatoria de evidencias DEV/QA y screenshots.
