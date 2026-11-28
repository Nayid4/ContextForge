# Especificación de Requisitos de Software (ERS) — ContextForge (`v2.0.0`)

Directorio oficial *Docs-as-Code* de Ingeniería de Requerimientos y Reingeniería Funcional del proyecto **ContextForge**, elaborado bajo los estándares **IEEE Std 830-1998**, **ISO/IEC/IEEE 29148:2018**, **ISO/IEC 25010:2023 (SQuaRE)**, **SWEBOK v4.0**, **FURPS+**, **UML 2.5**, **Modelo C4** y lineamientos académicos de la **Universidad Popular del Cesar (UPC)**.

## Estructura Documental Modular

| Archivo | Contenido Principal |
| :--- | :--- |
| [`ERS-MAESTRA.md`](./ERS-MAESTRA.md) | **Documento Maestro Consolidado** (integra de extremo a extremo los Capítulos 1 al 9, tablas, diagramas y referencias APA 7.ª ed.). |
| [`01_introduccion_y_marco_metodologico.md`](./01_introduccion_y_marco_metodologico.md) | Capítulo 1: Propósito, alcance dual (SDK + Plataforma), audiencias, definiciones/acrónimos y marco normativo/legal. |
| [`02_analisis_problema_elicitacion_stakeholders_reingenieria.md`](./02_analisis_problema_elicitacion_stakeholders_reingenieria.md) | Capítulo 2: Planteamiento del problema, visión, objetivos (`OG`/`OE`), elicitación, negociación de conflictos, stakeholders (Poder/Interés y RACI), reingeniería `AS-IS` vs. `TO-BE` y reglas de negocio (`BR-01`..`BR-16`). |
| [`03_casos_de_uso_y_requerimientos_funcionales.md`](./03_casos_de_uso_y_requerimientos_funcionales.md) | Capítulo 3: Actores, 14 Casos de Uso (`CU-01`..`CU-14`) y 25 fichas formales de Requerimientos Funcionales (`RF-*`) con Gherkin y errores RFC 7807. |
| [`04_requerimientos_no_funcionales_interfaces_y_otros.md`](./04_requerimientos_no_funcionales_interfaces_y_otros.md) | Capítulo 4: 18 `RNF-*` cuantificados (FURPS+ / ISO 25010), Interfaces Externas (`RIU`, `RIH`, `RIS`, `RIC`) y Requisitos Legales/IA (`OR-*`). |
| [`05_modelado_agil_spidr_hu_scrum_xp.md`](./05_modelado_agil_spidr_hu_scrum_xp.md) | Capítulo 5: Desglose de épicas con técnica **SPIDR**, 20 Historias de Usuario (`HU-01`..`HU-20`) bajo **INVEST** con tareas `TI-*`, Backlog y acuerdos `DoR`/`DoD`/`XP`. |
| [`06_arquitectura_trazabilidad_validacion_glosario_referencias.md`](./06_arquitectura_trazabilidad_validacion_glosario_referencias.md) | Capítulos 6–9: Modelos C4/UML/ERD, Lista de Chequeo de Validación, Matriz de Trazabilidad Bidireccional (**RTM**), Control de Cambios, Conclusiones y Referencias APA 7.ª ed. |

## Artefactos Relacionados

- **Diagramas Nativos Editables Draw.io + Exportaciones PNG:** [`docs/diagramas/`](../diagramas/) (`01_*.drawio` a `06_*.drawio` y sus respectivos `.png`).
- **Entregable Institucional Microsoft Word (`.docx`):** [`docs/entregables/ERS_Proyecto_Ingenieria_Software.docx`](../entregables/ERS_Proyecto_Ingenieria_Software.docx).
- **Scripts Reproducibles de Construcción:** `scripts/build_ers_maestra.py`, `scripts/generate_drawio_diagrams.py` y `scripts/generate_ers_docx.py`.
