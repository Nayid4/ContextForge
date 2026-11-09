---
id: "DOC-C4-MODEL_MD"
title: "c4 model"
collection: "engineering"
parent: null
owner: "leader"
status: "Publicado"
version: "4.0.0"
access: "public"
is_locked: true
is_favorite: true
full_width: true
last_updated: "2026-11-09"
tags: []
labels: ["engineering"]
---

# Modelo C4 — AI Agentic SDD Engineering Harness

> [!NOTE]
> Arquitectura de Sistema, Contenedores y Componentes del Arnés de Ingeniería Dirigida por Especificaciones (SDD).

---

## Nivel 1: Diagrama de Contexto del Sistema (C1)

Muestra los límites del arnés, los actores principales y los sistemas externos con los que interactúa:

```mermaid
flowchart TD
  userDeveloper["Desarrollador / Ingeniero de Software"]
  agentLeader["Agente Principal (Leader)"]
  harnessSystem["AI Agentic SDD Engineering Harness"]
  gitSystem["Sistema de Control de Versiones (Git / GitHub)"]
  browserUser["Navegador Web (Dashboard / Tablero Visual)"]

  userDeveloper -->|"Define requerimientos y aprueba specs"| harnessSystem
  agentLeader -->|"Orquesta tareas e invoca subagentes"| harnessSystem
  harnessSystem -->|"Crea ramas INT-* y commits semánticos"| gitSystem
  harnessSystem -->|"Genera y sincroniza datos en tiempo real"| browserUser
  browserUser -->|"Permite lectura editorial y edición dual"| userDeveloper
```

---

## Nivel 2: Diagrama de Contenedores (C2)

Descompone el arnés en sus subsistemas y aplicaciones principales:

```mermaid
flowchart TD
  subgraph HarnessContainers["Contenedores del Arnés SDD"]
    containerOrchestrator["Orquestador Multi-Agente<br/>(Leader, Spec-Author, Implementer, Reviewer)"]
    containerTripleSync["Motor de Sincronización Triple<br/>(.opencode / .github / .agents)"]
    containerKnowledge["Motor de Base de Conocimiento<br/>(Docs-as-Code, C4, UML, BR-*, ADRs)"]
    containerDashboard["Tablero de Seguimiento Interactivo<br/>(Tailwind v4, Three.js, Editor Dual)"]
    containerTestRunner["Suite de Pruebas Automatizadas<br/>(Node.js Test Runner, Smoke Tests)"]
  end

  gitRepo["Repositorio Git Local"]
  userView["Navegador (file:/// o HTTP)"]

  containerOrchestrator -->|"Escribe specs y código"| gitRepo
  containerTripleSync -->|"Mantiene paridad de 18 skills"| containerOrchestrator
  containerKnowledge -->|"Alimenta contexto anti-sesgo"| containerOrchestrator
  containerDashboard -->|"Lee metadatos de specs y progreso"| gitRepo
  containerDashboard -->|"Renderiza vistas interactivas"| userView
  containerTestRunner -->|"Verifica build, tests y convenciones"| containerOrchestrator
```

---

## Nivel 3: Diagrama de Componentes del Tablero Web (C3)

Desglose interno de la aplicación web en `project-docs/` bajo Screaming Architecture modular:

```mermaid
flowchart TD
  subgraph ClientApp["Tablero Screaming Architecture (project-docs/src/)"]
    subgraph CoreLayer["Núcleo Transversal (src/core/)"]
      compStore["Store Observer Reactivo<br/>(store.js)"]
      compRouter["Hash Router con URL Params<br/>(router.js)"]
      compBus["EventBus Desacoplado<br/>(event-bus.js)"]
      compClient["API Client con Resiliencia<br/>(api-client.js)"]
      compSqlite["Adaptador SQLite WAL<br/>(db.js & sqlite-sync.js)"]
    end

    subgraph DomainModules["Módulos de Negocio Screaming (src/modules/)"]
      modProjects["Projects<br/>(Workspaces, Metadata, KPIs)"]
      modIssues["Issues<br/>(Kanban, Lista, Scrum, Jira DEV/QA)"]
      modCycles["Cycles<br/>(Sprints, SVG Burn-down)"]
      modPages["Pages<br/>(ContextForge Reader, Dual Editor)"]
      modHarness["Harness<br/>(Agentes, Gobernanza, Skills)"]
    end

    subgraph SharedLayer["Componentes Compartidos (src/shared/)"]
      sharedLayout["MasterLayout / Sidebar / TopBar"]
      sharedIcons["Iconografía 100% SVG Nativo"]
      sharedUtils["renderList / DOM / Markdown"]
    end
  end

  compRouter --> compStore
  compBus --> compStore
  DomainModules --> compStore
  DomainModules --> compClient
  compClient --> compSqlite
  DomainModules --> sharedLayer
```

---

## Nivel 4: Persistencia Dual Determinista (C4 / Data Storage)

```mermaid
flowchart LR
  subgraph DataSources["Fuentes de Persistencia Dual"]
    sqliteDB["SQLite Relacional WAL<br/>(project-docs/data/harness.db)"]
    markdownFiles["Documentos Vivos Markdown<br/>(project-docs/knowledge/ & specs/)"]
    jsonFallback["Data Fallback Resiliente<br/>(project-docs/data-fallback.js)"]
  end

  serverSync["Servidor Local & Sync Bridge<br/>(serve.js & sync-data.js)"]
  serverSync -->|"Persistencia Transaccional"| sqliteDB
  serverSync -->|"Exportación Soberana"| markdownFiles
  serverSync -->|"Bundle Offline"| jsonFallback
```


