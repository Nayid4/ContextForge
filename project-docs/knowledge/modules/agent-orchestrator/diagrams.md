---
id: MOD-ORCH-DIAG
title: "Módulo: agent-orchestrator — Suite de 6 Diagramas"
module: "agent-orchestrator"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["c3", "class", "sequence", "state", "activity", "erd"]
---

# Módulo: agent-orchestrator — Suite de 6 Diagramas

---

## 1. Diagrama de Componentes C3 del Módulo

```mermaid
flowchart LR
  subgraph ModuleOrchestrator["agent-orchestrator"]
    compCoordinator["OrchestratorCoordinator<br/>(Valida ramas y estados)"]
    compDispatcher["SubagentDispatcher<br/>(Inyecta prompts y roles)"]
    compGate["HumanGateController<br/>(ask_question)"]
  end

  userDev(["Desarrollador Humano"])
  gitRepo[("Git Refs / Working Tree")]
  subagentPool[["Subagentes (Spec, Impl, Review)"]]

  userDev --> compCoordinator
  compCoordinator -->|"Valida INT-* (<=80c)"| gitRepo
  compCoordinator --> compDispatcher
  compDispatcher -->|"Workspace: inherit"| subagentPool
  compCoordinator --> compGate
  compGate -->|"Bloquea hasta confirmación"| userDev
```

---

## 2. Diagrama de Clases UML del Módulo

```mermaid
classDiagram
  class OrchestratorCoordinator {
    +validateBranchName(string branch) bool
    +createBranch(string type, int id, string name) BranchResult
    +requestHumanApproval(Spec spec) ApprovalStatus
  }

  class SubagentDispatcher {
    +dispatch(string role, string prompt) AgentSession
    +terminate(string conversationId) void
  }

  class HumanGateController {
    +promptApproval(string message, List~string~ options) string
    +handleResponse(string response) FlowAction
  }

  OrchestratorCoordinator --> SubagentDispatcher : "delega tareas"
  OrchestratorCoordinator --> HumanGateController : "solicita puerta"
```

---

## 3. Diagrama de Secuencia Transaccional

```mermaid
sequenceDiagram
  autonumber
  actor User as "Usuario Humano"
  participant Leader as "Leader Agent"
  participant Git as "Git System"
  participant Gate as "Human Gate (ask_question)"
  participant Subagent as "Subagente"

  User->>Leader: "Iniciar feature INT-010"
  Leader->>Git: "git checkout -b feature/INT-010/{name}"
  Leader->>Subagent: "Redactar spec"
  Subagent-->>Leader: "Spec completado (spec_ready)"
  Leader->>Gate: "ask_question: Aprobar spec al 100%?"
  Gate->>User: "Presenta opciones interactivas"
  User-->>Gate: "Aprobar al 100%"
  Gate-->>Leader: "Aprobado (in_progress)"
  Leader->>Subagent: "Implementar código y tests"
```

---

## 4. Diagrama de Máquina de Estados del Ciclo de Tarea

```mermaid
stateDiagram-v2
  [*] --> Pending : "Creación de tarea"
  Pending --> SpecReady : "spec-author completa specs"
  SpecReady --> InProgress : "Humano aprueba spec (ask_question)"
  SpecReady --> Pending : "Humano rechaza spec"
  InProgress --> Review : "implementer finaliza código y tests"
  Review --> Done : "reviewer valida al 100%"
  Review --> InProgress : "reviewer reporta hallazgos"
  Done --> [*] : "Reconciliación de metadata"
```

---

## 5. Diagrama de Actividades con Carriles (Swimlanes)

```mermaid
flowchart TD
  subgraph LaneHuman["Carril: Desarrollador Humano"]
    actRequest["Solicita Tarea"]
    actApprove["Aprueba Spec (ask_question)"]
    actIntegrate["Aprueba Fusión a Master"]
  end

  subgraph LaneLeader["Carril: Leader Agent"]
    actBranch["Crea Rama INT-*"]
    actDelegate["Invoca Subagentes"]
    actCheckReview["Verifica Dictamen Reviewer"]
  end

  subgraph LaneSubagent["Carril: Subagente Especializado"]
    actSpec["Redacta Requerimientos & Tasks"]
    actCode["Escribe Código & Tests TDD"]
    actAudit["Audita 100% de Trazabilidad"]
  end

  actRequest --> actBranch
  actBranch --> actDelegate
  actDelegate --> actSpec
  actSpec --> actApprove
  actApprove --> actCode
  actCode --> actAudit
  actAudit --> actCheckReview
  actCheckReview --> actIntegrate
```

---

## 6. Sub-Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
  FEATURE ||--|| TASK_STATE : "monitorea"
  FEATURE ||--|{ AGENT_SESSION : "asigna a"

  FEATURE {
    string id PK
    string branch
    string status
  }

  TASK_STATE {
    string status PK
    bool is_locked
    string gate_status
  }

  AGENT_SESSION {
    string conversation_id PK
    string role
    string workspace_mode
  }
```
