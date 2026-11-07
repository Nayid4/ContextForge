---
id: MOD-ORCH-SPEC
title: "Módulo: agent-orchestrator — Especificación & Tarjetas CRC"
module: "agent-orchestrator"
status: "Publicado"
version: "4.2.0"
last_updated: "2026-11-07"
tags: ["orchestrator", "subagents", "crc-cards", "branching", "human-gate", "scrum-subtasks", "qa-evidence"]
---

# Módulo: agent-orchestrator — Especificación & Tarjetas CRC

> [!NOTE]
> Bounded Context encargado de la orquestación multi-agente, la observabilidad del ciclo de vida SDD, la imposición estricta de límites de ramas git, las puertas obligatorias de decisión humana y la gestión de subtareas Scrum Jira DEV/QA con capturas de evidencia de pruebas.

---

## 1. Alcance y Estado de Cobertura
- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`
- **Tareas Trazadas**: `INT-001` (Refactorización del arnés) e `INT-009` (Subtareas Scrum Jira DEV/QA y evidencias visuales).
- **Responsabilidad Primaria**: Coordinar la ejecución secuencial de agentes especializados (`leader`, `spec-author`, `implementer`, `reviewer`), validar convenciones de ramas git ($\le 80$ caracteres), forzar pausas interactivas mediante `ask_question`, y asegurar el desglose y cierre formal de subtareas Jira DEV/QA con screenshots automatizados.

---

## 2. Lenguaje Ubicuo Local
- **Leader**: Agente orquestador soberano que inicia la tarea y valida las ramas.
- **Spec-Author**: Agente redactor de especificaciones técnicas (EARS / IEEE 830).
- **Implementer**: Agente ejecutor que programa código y pruebas unitarias/integración.
- **Reviewer**: Agente auditor independiente e imparcial (prohibido editar código).
- **Human Gate**: Puerta obligatoria de aprobación humana con `ask_question`.
- **Subtareas Scrum DEV/QA**: Desglose operativo de cada historia de usuario en tareas de desarrollo e ingeniería de calidad.
- **Evidencias Visuales**: Capturas de pantalla headless de los flujos del sistema generadas por Playwright en `specs/{NNN}_{name}/evidence/`.

---

## 3. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)

| Clase / Agregado | Estereotipo | Responsabilidades | Colaboradores |
|---|---|---|---|
| `OrchestratorCoordinator` | `<<Service>>` | 1. Interpretar comando del usuario.<br/>2. Verificar si la rama actual es base (`master`/`main`).<br/>3. Crear la rama `{feature\|bugfix}/INT-{id}/{name}` ($\le 80$c). | `GitCLI`, `AgentRegistry` |
| `HumanGateController` | `<<Controller>>` | 1. Generar modal interactivo `ask_question`.<br/>2. Bloquear ejecución hasta recibir respuesta del usuario.<br/>3. Enrutar el flujo según la opción seleccionada. | `AntigravityAPI`, `LeaderAgent` |
| `SubagentDispatcher` | `<<Dispatcher>>` | 1. Invocar subagente con `Workspace: "inherit"`.<br/>2. Inyectar prompt contextualizado con la tarea activa. | `invoke_subagent`, `AgentSpec` |
| `ScrumEvidenceManager` | `<<Manager>>` | 1. Desglosar requerimientos en subtareas Jira `DEV` y `QA`.<br/>2. Ejecutar capturas headless en navegador con `capture-evidence.js`.<br/>3. Verificar que ambas subtareas y evidencias existan antes de autorizar cierre de tarea. | `PlaywrightRunner`, `EvidenceStorage`, `FeatureTableModal` |

---

## 4. Contratos de Entrada y Salida (DTOs / Interfaces)
- **Input**: `{ taskId: "INT-009", type: "feature", title: "Scrum Spec Subtasks and QA Evidence", baseBranch: "master" }`
- **Output**: `{ branch: "feature/INT-009/scrum_spec_subtasks_qa_evidence", length: 47, status: "created", agentDispatched: "spec-author" }`
- **Invariante**: Si `length > 80`, la operación aborta con excepción inmediata.
