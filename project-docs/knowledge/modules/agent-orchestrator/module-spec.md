---
id: MOD-ORCH-SPEC
title: "Módulo: agent-orchestrator — Especificación & Tarjetas CRC"
module: "agent-orchestrator"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["orchestrator", "subagents", "crc-cards", "branching", "human-gate"]
---

# Módulo: agent-orchestrator — Especificación & Tarjetas CRC

> [!NOTE]
> Bounded Context encargado de la orquestación multi-agente, la observabilidad del ciclo de vida SDD, la imposición estricta de límites de ramas git y las puertas obligatorias de decisión humana.

---

## 1. Alcance y Estado de Cobertura
- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`
- **Responsabilidad Primaria**: Coordinar la ejecución secuencial de agentes especializados (`leader`, `spec-author`, `implementer`, `reviewer`), validar convenciones de ramas git ($\le 80$ caracteres) y forzar pausas interactivas mediante `ask_question`.

---

## 2. Lenguaje Ubicuo Local
- **Leader**: Agente orquestador soberano que inicia la tarea y valida las ramas.
- **Spec-Author**: Agente redactor de especificaciones técnicas (EARS / IEEE 830).
- **Implementer**: Agente ejecutor que programa código y pruebas unitarias/integración.
- **Reviewer**: Agente auditor independiente e imparcial (prohibido editar código).
- **Human Gate**: Puerta obligatoria de aprobación humana con `ask_question`.

---

## 3. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)

| Clase / Agregado | Estereotipo | Responsabilidades | Colaboradores |
|---|---|---|---|
| `OrchestratorCoordinator` | `<<Service>>` | 1. Interpretar comando del usuario.<br/>2. Verificar si la rama actual es base (`master`/`main`).<br/>3. Crear la rama `{feature\|bugfix}/INT-{id}/{name}` ($\le 80$c). | `GitCLI`, `AgentRegistry` |
| `HumanGateController` | `<<Controller>>` | 1. Generar modal interactivo `ask_question`.<br/>2. Bloquear ejecución hasta recibir respuesta del usuario.<br/>3. Enrutar el flujo según la opción seleccionada. | `AntigravityAPI`, `LeaderAgent` |
| `SubagentDispatcher` | `<<Dispatcher>>` | 1. Invocar subagente con `Workspace: "inherit"`.<br/>2. Inyectar prompt contextualizado con la tarea activa. | `invoke_subagent`, `AgentSpec` |

---

## 4. Contratos de Entrada y Salida (DTOs / Interfaces)
- **Input**: `{ taskId: "INT-001", type: "feature", title: "Document CRUD API", baseBranch: "master" }`
- **Output**: `{ branch: "feature/INT-001/document_crud_api", length: 33, status: "created", agentDispatched: "spec-author" }`
- **Invariante**: Si `length > 80`, la operación aborta con excepción inmediata.
