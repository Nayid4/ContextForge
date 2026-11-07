# Especificación de Requerimientos Scrum & SDD: INT-009

- **Ticket ID**: INT-009
- **Tipo**: Feature
- **Nombre**: `scrum_spec_subtasks_qa_evidence`
- **Módulo**: `agent-orchestrator`
- **Prioridad**: P0
- **Estado**: in_progress
- **Rama Git**: `feature/INT-009/scrum_spec_subtasks_qa_evidence` (48c <= 80c)
- **Persistencia**: 100% JSON (Cero SQL)

---

## 1. Historia de Usuario (User Story)

> **COMO** Líder Técnico, Desarrollador y Especialista de QA,  
> **QUIERO** documentar los specs de las tareas bajo el estándar formal de SCRUM (User Story, Definition of Ready, Definition of Done), desglosar cada tarea en Subtareas Jira independientes de Desarrollo (DEV) y de QA, y registrar al cierre qué se hizo, qué pruebas se ejecutaron y capturas de pantalla de evidencia,  
> **PARA** garantizar claridad absoluta, trazabilidad determinista, verificación visual comprobable y gestión ágil sin dependencias de bases de datos relacionales SQL.

---

## 2. Definición de Listo (Definition of Ready - DoR)

Antes de iniciar la implementación, se validó que:
- [x] El requerimiento funcional fue analizado y no presenta ambigüedades.
- [x] La rama de trabajo `feature/INT-009/scrum_spec_subtasks_qa_evidence` fue creada desde `master` cumpliendo el límite de 80 caracteres.
- [x] El modelo de datos JSON fue validado para retrocompatibilidad con las features existentes.
- [x] La herramienta Playwright está operativa para la captura automatizada de screenshots.

---

## 3. Definición de Hecho (Definition of Done - DoD)

La tarea se considerará formalmente concluida cuando:
- [ ] La **Subtarea de Desarrollo (`INT-009-DEV`)** esté al 100% implementada y en verde.
- [ ] La **Subtarea de QA (`INT-009-QA`)** esté al 100% verificada con casos de prueba ejecutados.
- [ ] Se capturen y almacenen **capturas de pantalla (screenshots)** reales en `specs/009_scrum_spec_subtasks_and_qa_evidence/evidence/`.
- [ ] El spec contenga el documento `evidence.md` con el resumen de cambios, pruebas y galería visual.
- [ ] El tablero web (`project-docs/`) visualice la User Story, las subtareas Jira y la galería de capturas.
- [ ] Cero emojis unicode en código fuente, comentarios e interfaz (estándar SVG).
- [ ] 100% de las pruebas automatizadas (unitarias, whitebox, blackbox, sistema, carga, Playwright) pasando en `verify.sh`.

---

## 4. Requerimientos en Notación EARS

### Requerimientos Ubicuos
- **R1 [UBIQUOUS]**: El arnés DEBE gestionar la totalidad de las tareas, historias de usuario, subtareas y evidencias de prueba exclusivamente mediante esquemas JSON sin requerir bases de datos SQL.
- **R2 [UBIQUOUS]**: Toda tarea principal en `feature_list.json` y en las especificaciones DEBE contener obligatoriamente una Subtarea de Desarrollo (`INT-XXX-DEV`) y una Subtarea de QA (`INT-XXX-QA`) estilo Jira.

### Requerimientos de Evento
- **R3 [EVENT]**: **CUANDO** un usuario o agente consulte el detalle de una tarea en el tablero interactivo, el sistema DEBE renderizar en una tarjeta destacada la User Story Scrum (*Como / Quiero / Para*), el estado individual de las subtareas DEV y QA, el checklist de DoD y la galería de capturas de pantalla adjuntas.
- **R4 [EVENT]**: **CUANDO** el agente o ingeniero concluya la subtarea de desarrollo (`DEV`), el sistema DEBE registrar en el spec y en JSON el resumen de archivos modificados y pruebas unitarias realizadas.
- **R5 [EVENT]**: **CUANDO** el agente o especialista de QA verifique la subtarea (`QA`), el sistema DEBE ejecutar la validación de aceptación, capturar automáticamente capturas de pantalla de la interfaz mediante Playwright, almacenarlas en `evidence/` y generar el reporte consolidado `evidence.md`.

### Requerimientos No Deseados
- **R6 [UNWANTED]**: **SI** un spec intenta cerrarse sin contar con la evidencia de pruebas o sin capturas de pantalla de la interfaz verificada, ENTONCES el subagente reviewer y el skill `verify-spec` DEBEN rechazar el cierre marcándolo como incompleto.
