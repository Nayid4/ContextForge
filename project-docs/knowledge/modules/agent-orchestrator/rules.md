# Reglas de Negocio Invariantes: agent-orchestrator

### BR-ORCH-001: Formato y Longitud Estricta de Ramas
- **Severidad**: Crítica
- **Fórmula / Restricción**: `length({type}/INT-{numero}/{nombre_rama}) <= 80`
- **Valores permitidos de type**: Exclusivamente `feature` o `bugfix`.
- **Comportamiento ante Violación**: La creación de la rama es rechazada de inmediato.

### BR-ORCH-002: Puerta Humana Obligatoria para Aprobación de Spec
- **Severidad**: Crítica
- **Restricción**: Jamás iniciar la fase de implementación sin que el humano haya seleccionado `Aprobar spec al 100% e iniciar implementación` mediante la herramienta `ask_question`.
- **Comportamiento ante Violación**: Detención total del agente e invocación inmediata de `ask_question`.

### BR-ORCH-003: Subagente Revisor No Modifica Código
- **Severidad**: Crítica
- **Restricción**: El subagente `reviewer` audita de forma imparcial la trazabilidad R↔Tests, la compilación y los tests, pero tiene prohibido editar archivos fuente (`src/`, `tests/`).
- **Comportamiento ante Violación**: Veredicto nulo y reasignación al `implementer`.
