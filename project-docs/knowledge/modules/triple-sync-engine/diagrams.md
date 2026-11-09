---
id: "MOD-SYNC-DIAG"
title: "Módulo: triple-sync-engine — Suite de 6 Diagramas"
collection: "engineering"
parent: "modules/triple-sync-engine/module-spec.md"
owner: "leader"
module: "triple-sync-engine"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: false
is_favorite: false
full_width: true
last_updated: "2026-11-03"
tags: ["c3","class","sequence","state","activity","erd"]
labels: ["c3","class","sequence","state","activity","erd","engineering"]
---

# Módulo: triple-sync-engine — Suite de 6 Diagramas

---

## 1. Diagrama de Componentes C3 del Módulo

```mermaid
flowchart LR
  subgraph ModuleSync["triple-sync-engine"]
    compEngine["SkillsSyncEngine"]
    compValidator["FrontmatterValidator"]
  end

  sourceOpencode[(".opencode/skills/ (Source of Truth)")]
  mirrorCopilot[(".github/skills/ (Mirror 1)")]
  mirrorAgy[(".agents/skills/ (Mirror 2)")]

  sourceOpencode --> compEngine
  compEngine --> compValidator
  compEngine -->|"Replicación unidireccional"| mirrorCopilot
  compEngine -->|"Replicación unidireccional"| mirrorAgy
```

---

## 2. Diagrama de Clases UML del Módulo

```mermaid
classDiagram
  class SkillsSyncEngine {
    +syncAllSkills() SyncReport
    +compareSkill(string name) DiffResult
    +propagateSkill(string name) void
  }

  class FrontmatterValidator {
    +validateParity(string name) bool
    +extractMetadata(string content) SkillMeta
  }

  SkillsSyncEngine --> FrontmatterValidator : "valida antes de replicar"
```

---

## 3. Diagrama de Secuencia de Sincronización Triple

```mermaid
sequenceDiagram
  autonumber
  actor User as "Desarrollador / Agente"
  participant Sync as "sync-skills"
  participant Opencode as ".opencode/ (Source)"
  participant Copilot as ".github/ (Mirror)"
  participant Agy as ".agents/ (Mirror)"

  User->>Sync: "Ejecutar sync-skills"
  Sync->>Opencode: "Leer 18 skills canónicas"
  Opencode-->>Sync: "Contenido y Frontmatter"
  Sync->>Copilot: "Propagar a .github/skills/"
  Sync->>Agy: "Propagar a .agents/skills/"
  Sync-->>User: "Reporte: 18 skills sincronizadas al 100%"
```

---

## 4. Diagrama de Máquina de Estados de una Skill

```mermaid
stateDiagram-v2
  [*] --> SourceUpdated : "Edición en .opencode/skills/"
  SourceUpdated --> VerifyingParity : "sync-skills analiza diferencias"
  VerifyingParity --> MirrorsOutdated : "Diferencia detectada en espejos"
  MirrorsOutdated --> InSync : "Replicación a .github/ y .agents/"
  VerifyingParity --> InSync : "Espejos idénticos al origen"
  InSync --> [*]
```

---

## 5. Diagrama de Actividades de Sincronización

```mermaid
flowchart TD
  actStart(["Inicio sync-skills"])
  actRead["Lee skills en .opencode/"]
  actLoop["Itera sobre cada skill (1 a 18)"]
  checkDiff{"Hay diferencia con espejos?"}
  actCopy["Copia hacia .github/ y .agents/"]
  actReport["Genera reporte de paridad"]
  actEnd(["Fin: Espejos Homologados"])

  actStart --> actRead
  actRead --> actLoop
  actLoop --> checkDiff
  checkDiff -->|Sí| actCopy
  checkDiff -->|No| actLoop
  actCopy --> actLoop
  actLoop --> actReport
  actReport --> actEnd
```

---

## 6. Sub-Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
  SKILL_SOURCE ||--|| SKILL_MIRROR_COPILOT : "sincroniza a"
  SKILL_SOURCE ||--|| SKILL_MIRROR_AGY : "sincroniza a"

  SKILL_SOURCE {
    string name PK
    string description
    string platform
  }

  SKILL_MIRROR_COPILOT {
    string name PK
    string sync_status
  }

  SKILL_MIRROR_AGY {
    string name PK
    string sync_status
  }
```


