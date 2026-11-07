# Checklist de Subtareas Scrum (Jira Style): INT-009

## Subtarea DEV: INT-009-DEV — Implementación Técnica, UI Scrum y Motor de Evidencias
- **Asignado a**: `implementer`
- **Estado**: done

- [x] **T1** — Extender el esquema JSON en `project-docs/feature_list.json` con `user_story`, `definition_of_ready`, `definition_of_done`, `subtasks` (`DEV` y `QA`) y `evidence`. Cubre: R1, R2.
- [x] **T2** — Actualizar `project-docs/src/shared/Modal.js` para renderizar la User Story Scrum, el desglose de Subtareas Jira DEV/QA, el checklist de DoD y la galería de screenshots. Cubre: R1, R3.
- [x] **T3** — Actualizar `project-docs/src/features/feature-list/FeatureTable.js` para mostrar badges compactos de estado de subtareas DEV y QA. Cubre: R3.
- [x] **T4** — Actualizar `project-docs/src/features/current-spec/CurrentSpecCard.js` para indicar la subtarea activa actual. Cubre: R3.
- [x] **T5** — Crear el script utilitario `scripts/capture-evidence.js` con Playwright para captura automatizada de screenshots headless. Cubre: R5.
- [x] **T6** — Actualizar las skills `generate-spec` y `verify-spec` (y espejos) para incorporar la plantilla Scrum y la exigencia de evidencias al cierre. Cubre: R4, R6.
- [x] **T7** — Recompilar y sincronizar tablero web con `node project-docs/sync-data.js`. Cubre: R1, R3.

---

## Subtarea QA: INT-009-QA — Validación de Criterios, Ejecución E2E y Captura de Evidencias
- **Asignado a**: `reviewer`
- **Estado**: done

- [x] **TC-01** — Validar renderizado correcto de la User Story Scrum (*Como / Quiero / Para*) en el modal de detalle de tarea. Cubre: R3.
- [x] **TC-02** — Validar visualización de subtareas Jira DEV y QA con sus estados y checkboxes independientes. Cubre: R2, R3.
- [x] **TC-03** — Ejecutar `scripts/capture-evidence.js` y verificar generación de capturas de pantalla `.png` reales en `specs/009_scrum_spec_subtasks_and_qa_evidence/evidence/`. Cubre: R5.
- [x] **TC-04** — Validar renderizado de las imágenes de captura en la galería de evidencias del modal. Cubre: R3, R5.
- [x] **TC-05** — Ejecutar suite completa de verificación con `verify.sh` asegurando 100% de tests en verde (unitarios, ATDD, caja blanca, caja negra, sistema, carga, Playwright). Cubre: R1, R6.
- [x] **TC-06** — Generar reporte consolidado `evidence.md` con el registro de qué se hizo, pruebas ejecutadas y capturas adjuntas. Cubre: R4, R5.
