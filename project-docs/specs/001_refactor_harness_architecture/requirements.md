# Especificación de Requerimientos: INT-001 refactor_harness_architecture

- **Feature ID**: INT-001
- **Nombre**: `refactor_harness_architecture`
- **Módulo**: `agent-orchestrator`
- **Prioridad**: P0 (Crítica)
- **Estado**: in_progress
- **Rama**: `feature/INT-001/refactor_harness_architecture`

---

## 1. Requerimientos en Notación EARS

### Requerimientos Ubicuos
- **R1 [UBIQUOUS]**: El sistema DEBE operar de manera universal y agnóstica al lenguaje del proyecto cliente (.NET, Node.js, Python, Go, Rust), leyendo dinámicamente los comandos de compilación y pruebas desde `project-spec.yaml`.
- **R2 [UBIQUOUS]**: El sistema DEBE mantener paridad y coherencia estricta en la metadata y nombres de rama, respetando el formato `{type}/INT-{id}/{name}` con longitud máxima de 80 caracteres.

### Requerimientos de Evento
- **CUANDO** el arnés sea auditado o inicializado, el sistema DEBE generar artefactos `project-spec.yaml` y `project-spec.json` que representen con exactitud la arquitectura y stack del arnés, erradicando cualquier residuo de proyectos ficticios (CloudSaaS / e-commerce).
- **CUANDO** el subagente `implementer` o `reviewer` sea invocado, el sistema DEBE consultar los comandos de compilación y prueba especificados en `project-spec.yaml` (`checks.build` y `checks.test`) sin imponer `.NET` forzado si el stack es Node.js u otro entorno.

### Requerimientos de Estado
- **MIENTRAS** el arnés esté en ejecución en modo local o servidor, el script `project-docs/sync-data.js` DEBE sincronizar automáticamente los 22 documentos vivos de la base de conocimiento y el backlog real hacia `project-docs/data-fallback.js`.

### Requerimientos No Deseados
- **SI** un documento o tarea no pertenece al dominio del arnés de ingeniería, ENTONCES el sistema DEBE excluirlo de la base de conocimiento y del catálogo de reglas de negocio para evitar sesgos en los modelos de IA.
