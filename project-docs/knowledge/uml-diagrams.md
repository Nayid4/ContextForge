# Diagramas UML — AI Agentic SDD Engineering Harness

---

## 1. Diagrama de Clases del Dominio SDD

Muestra las entidades, value objects y relaciones del modelo conceptual del arnés:

```mermaid
classDiagram
  class Feature {
    +int id
    +string type
    +string name
    +string title
    +string description
    +string module
    +string priority
    +string branch
    +string status
    +List~string~ acceptance
    +markCompleted()
  }

  class Subagent {
    +string name
    +string role
    +List~string~ tools
    +executeTask(Task task)
  }

  class KnowledgeDocument {
    +string key
    +string filename
    +string title
    +string shelf
    +int readingTime
    +int wordCount
    +int ruleCount
    +extractTOC() List~Heading~
  }

  class BusinessRule {
    +string id
    +string title
    +string module
    +string severity
    +string description
    +validate() bool
  }

  class ArchitecturalDecisionRecord {
    +string id
    +string title
    +string status
    +string context
    +string decision
    +string consequences
  }

  Feature "1" --> "*" BusinessRule : "satisface"
  Feature "1" --> "1" Subagent : "asignada a"
  KnowledgeDocument "*" --> "*" BusinessRule : "documenta"
  KnowledgeDocument "*" --> "*" ArchitecturalDecisionRecord : "registra"
```

---

## 2. Diagrama de Secuencia: Ciclo de Vida Completo SDD

```mermaid
sequenceDiagram
  autonumber
  actor User as "Usuario (Humano)"
  participant Leader as "Leader Agent"
  participant Git as "Git System"
  participant SpecAuthor as "Spec-Author"
  participant Implementer as "Implementer"
  participant Reviewer as "Reviewer"

  User->>Leader: "Iniciar tarea INT-001"
  Leader->>Git: "git checkout -b feature/INT-001/{name}"
  Leader->>SpecAuthor: "Redactar requerimientos y tasks"
  SpecAuthor-->>Leader: "specs/001/ completado (spec_ready)"
  Leader->>User: "ask_question: Aprobar spec al 100%?"
  alt Spec Aprobado
    User-->>Leader: "Aprobado (in_progress)"
    Leader->>Implementer: "Implementar código y tests"
    Implementer->>Implementer: "Ejecutar checks.test y checks.build"
    Implementer-->>Leader: "Trazabilidad R<->Tests completa"
    Leader->>Reviewer: "Auditar calidad y consistencia"
    alt Reviewer Aprueba
      Reviewer-->>Leader: "APROBADO (0 errores)"
      Leader->>User: "ask_question: Integrar a rama base?"
    else Reviewer Rechaza
      Reviewer-->>Leader: "RECHAZADO (hallazgos)"
      Leader->>Implementer: "Corregir observaciones"
    end
  else Spec Rechazado
    User-->>Leader: "Rechazar o solicitar cambios"
    Leader->>SpecAuthor: "Ajustar especificación"
  end
```

---

## 3. Diagrama de Secuencia: Editor Dual ContextForge con Scroll Sincronizado

```mermaid
sequenceDiagram
  autonumber
  actor User as "Desarrollador"
  participant UI as "Tablero Web (main.js)"
  participant Textarea as "Panel Editor Markdown"
  participant Preview as "Panel Live Preview"
  participant Blocks as "Panel Bloques Visuales"
  participant Storage as "sync-data.js / data-fallback.js"

  User->>UI: "Pulsar [ Modo Editor ]"
  UI->>Textarea: "Cargar markdown actual"
  UI->>Preview: "renderMarkdown(content)"
  
  alt Usuario edita en Textarea (Markdown)
    User->>Textarea: "Escribir texto y hacer scroll"
    Textarea->>Preview: "Sincronizar scroll proporcionalmente (isScrollingFromEditor)"
    Textarea->>Preview: "Actualizar HTML en vivo"
  else Usuario conmuta a [ Modo Bloques ]
    User->>UI: "Pulsar [ Modo Bloques Visuales ]"
    UI->>Blocks: "parseMarkdownToBlocks(markdown)"
    Blocks-->>User: "Renderizar tarjetas interactivas (H1, BR, Callouts)"
    User->>Blocks: "Reordenar bloques o añadir bloque"
    Blocks->>Textarea: "blocksToMarkdown(blocks)"
    Blocks->>Preview: "Actualizar previsualización en vivo"
  end

  User->>UI: "Pulsar [ Guardar Cambios ]"
  UI->>Storage: "store.saveDoc(key, content) + sync-data.js"
  Storage-->>User: "Documento persistido local y offline"
```

---

## 4. Diagrama de Casos de Uso del Arnés SDD

```mermaid
flowchart TD
  actorDev["Desarrollador"]
  actorAgent["Agente de IA"]

  subgraph UseCases["Casos de Uso del Arnés de Ingeniería"]
    ucAudit["Auditar Stack Técnico (/technical-audit)"]
    ucKnowledge["Extraer Base de Conocimiento (/project-knowledge)"]
    ucSpec["Redactar Requerimientos EARS (/generate-spec)"]
    ucHumanGate["Aprobar Puerta Humana (ask_question)"]
    ucImplement["Implementar Código & Tests (/implement)"]
    ucReview["Auditar Calidad & Trazabilidad (/review)"]
    ucViewDash["Navegar Tablero & Constelación 3D"]
    ucOmnibox["Búsqueda Global Omnibox (Ctrl+K)"]
    ucEditDual["Edición Dual Markdown / Bloques"]
  end

  actorDev --> ucAudit
  actorDev --> ucKnowledge
  actorDev --> ucHumanGate
  actorDev --> ucViewDash
  actorDev --> ucOmnibox
  actorDev --> ucEditDual

  actorAgent --> ucSpec
  actorAgent --> ucImplement
  actorAgent --> ucReview
  actorAgent --> ucKnowledge
```
