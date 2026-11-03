---
id: MOD-KNOW-DIAG
title: "Módulo: knowledge-engine — Suite de 6 Diagramas"
module: "knowledge-engine"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["c3", "class", "sequence", "state", "activity", "erd"]
---

# Módulo: knowledge-engine — Suite de 6 Diagramas

---

## 1. Diagrama de Componentes C3 del Módulo

```mermaid
flowchart LR
  subgraph ModuleKnowledge["knowledge-engine"]
    compScanner["DocScanner (Escaneo recursivo)"]
    compExtractor["DiagramExtractor (Mermaid AST)"]
    compCompiler["MasterCompiler (Dossier Único)"]
    compSync["SyncEngine (sync-data.js)"]
  end

  docsDir[("project-docs/knowledge/**")]
  indexJson[("knowledge-index.json")]
  fallbackJs[("data-fallback.js")]
  masterMd[("MASTER-PROJECT-KNOWLEDGE.md")]

  docsDir --> compScanner
  docsDir --> compExtractor
  compScanner --> compCompiler
  compCompiler --> masterMd
  compExtractor --> compSync
  compSync --> indexJson
  compSync --> fallbackJs
```

---

## 2. Diagrama de Clases UML del Módulo

```mermaid
classDiagram
  class KnowledgeDocument {
    +string key
    +string title
    +string shelf
    +int readingTime
    +int wordCount
    +int ruleCount
  }

  class DiagramDefinition {
    +string id
    +string type
    +string level
    +string title
    +string mermaidCode
  }

  class KnowledgeEngine {
    +scanDocs(string dir) Map~string, string~
    +extractDiagrams(Map docs) List~DiagramDefinition~
    +compileMasterDocument(Map docs) string
  }

  KnowledgeEngine "1" --> "*" KnowledgeDocument : "indexa"
  KnowledgeEngine "1" --> "*" DiagramDefinition : "extrae"
```

---

## 3. Diagrama de Secuencia: Ingesta y Sincronización

```mermaid
sequenceDiagram
  autonumber
  actor User as "Agente / Dev"
  participant Engine as "sync-data.js"
  participant FS as "File System"
  participant Fallback as "data-fallback.js"
  participant Bundle as "app.bundle.js"

  User->>Engine: "node sync-data.js"
  Engine->>FS: "scanDocs(knowledgeDir)"
  FS-->>Engine: "docs, docMetadata, shelves"
  Engine->>Engine: "extractDiagrams(docs)"
  Engine->>FS: "write(knowledge-index.json)"
  Engine->>Fallback: "write(window.__FALLBACK_DATA__)"
  Engine->>Bundle: "npx esbuild (recompila bundle)"
  Engine-->>User: "[SUCCESS] Sincronización completada"
```

---

## 4. Diagrama de Máquina de Estados de un Documento

```mermaid
stateDiagram-v2
  [*] --> Borrador : "Creación inicial"
  Borrador --> EnRevision : "Completado por agente"
  EnRevision --> Publicado : "Aprobado por humano / QA"
  Publicado --> EnRevision : "Modificación o refactor"
  Publicado --> Retirado : "Deprecado por nueva versión"
  Retirado --> [*]
```

---

## 5. Diagrama de Actividades: Pipeline de Compilación

```mermaid
flowchart TD
  startScan(["Inicio Pipeline sync-data.js"])
  readDocs["Lee archivos .md recursivamente"]
  calcMetrics["Calcula WPM, readingTime, BR-* count"]
  extractDiagrams["Extrae bloques Mermaid c4/uml/erd"]
  updateIndex["Actualiza knowledge-index.json"]
  writeFallback["Genera data-fallback.js"]
  rebuildBundle["Recompila dist/app.bundle.js"]
  endNode(["Fin: Tablero Listo Offline"])

  startScan --> readDocs
  readDocs --> calcMetrics
  calcMetrics --> extractDiagrams
  extractDiagrams --> updateIndex
  updateIndex --> writeFallback
  writeFallback --> rebuildBundle
  rebuildBundle --> endNode
```

---

## 6. Sub-Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
  DOCUMENT ||--o{ DIAGRAM : "contiene"
  DOCUMENT ||--|| SHELF : "pertenece a"

  DOCUMENT {
    string key PK
    string title
    string shelf
    int word_count
  }

  DIAGRAM {
    string id PK
    string type
    string mermaid_code
  }

  SHELF {
    string id PK
    string title
  }
```
