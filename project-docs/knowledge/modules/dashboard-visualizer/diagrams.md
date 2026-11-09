---
id: "MOD-DASH-DIAG"
title: "Módulo: dashboard-visualizer — Suite de 6 Diagramas"
collection: "engineering"
parent: "modules/dashboard-visualizer/module-spec.md"
owner: "leader"
module: "dashboard-visualizer"
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

# Módulo: dashboard-visualizer — Suite de 6 Diagramas

---

## 1. Diagrama de Componentes C3 del Módulo

```mermaid
flowchart LR
  subgraph ModuleDashboard["dashboard-visualizer"]
    compStore["Reactive Store (store.js)"]
    compRouter["Hash Router (router.js)"]
    compEditor["Dual Editor & MarkdownViewer"]
    comp3D["SpaceView3D (Three.js)"]
    compMermaid["MermaidViewer"]
  end

  compRouter --> compStore
  compStore --> compEditor
  compStore --> comp3D
  compStore --> compMermaid
```

---

## 2. Diagrama de Clases UML del Módulo

```mermaid
classDiagram
  class DashboardStore {
    -State state
    -List~Function~ listeners
    +getState() State
    +setData(Object data) void
    +subscribe(Function listener) Function
    +setSelectedFeature(Feature f) void
  }

  class MarkdownViewer {
    +renderMarkdown(string md) string
    +extractTableOfContents(string md) List~Heading~
    +parseMarkdownToBlocks(string md) List~Block~
    +blocksToMarkdown(List~Block~ blocks) string
  }

  class MermaidViewer {
    +renderMermaidViewer(Diagram diag) string
    +initMermaidDiagrams(int retries) Promise
  }

  DashboardStore --> MarkdownViewer : "alimenta contenido"
  DashboardStore --> MermaidViewer : "alimenta diagramas"
```

---

## 3. Diagrama de Secuencia: Editor Dual con Scroll Sincronizado

```mermaid
sequenceDiagram
  autonumber
  actor User as "Desarrollador"
  participant Editor as "Textarea Editor"
  participant Preview as "Live Preview"
  participant Store as "DashboardStore"

  User->>Editor: "Escribe markdown y desplaza scroll"
  Editor->>Preview: "Calcula ratio de scroll (scrollY / maxScroll)"
  Editor->>Preview: "Ajusta scrollTop de previsualización"
  Editor->>Store: "saveDoc(key, content)"
  Store-->>User: "Notificación: Guardado con éxito"
```

---

## 4. Diagrama de Máquina de Estados del Visor

```mermaid
stateDiagram-v2
  [*] --> LibraryView : "Carga inicial de Knowledge Base"
  LibraryView --> ReaderView : "Click en [ Leer Artículo ]"
  ReaderView --> EditorView : "Click en [ Modo Editor ]"
  EditorView --> ReaderView : "Click en [ Modo Lectura ]"
  ReaderView --> LibraryView : "Click en [ Volver a Biblioteca ]"
  EditorView --> LibraryView : "Click en [ Volver a Biblioteca ]"
```

---

## 5. Diagrama de Actividades de Inicialización

```mermaid
flowchart TD
  startNode(["Inicio Carga index.html"])
  checkProto{"window.location.protocol === 'file:'"}
  loadFallback["Lee window.__FALLBACK_DATA__"]
  loadHttp["fetchProjectData() HTTP"]
  initStore["store.setData(data)"]
  mountView["Monta Pestaña Activa"]
  initMermaid["initMermaidDiagrams() con Reintentos"]

  startNode --> checkProto
  checkProto -->|Sí| loadFallback
  checkProto -->|No| loadHttp
  loadFallback --> initStore
  loadHttp --> initStore
  initStore --> mountView
  mountView --> initMermaid
```

---

## 6. Sub-Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
  DASHBOARD_STATE ||--o{ FEATURE_VIEW : "renderiza"
  DASHBOARD_STATE ||--|| ACTIVE_DOC : "edita"

  DASHBOARD_STATE {
    string active_tab
    string theme
    int total_features
  }

  FEATURE_VIEW {
    int id PK
    string title
    string status
  }

  ACTIVE_DOC {
    string key PK
    string content
    int reading_time
  }
```


