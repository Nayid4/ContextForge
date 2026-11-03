# Modelo C4 — AI Agentic SDD Engineering Harness

> [!NOTE]
> Arquitectura de Sistema, Contenedores y Componentes del Arnés de Ingeniería Dirigida por Especificaciones (SDD).

---

## Nivel 1: Diagrama de Contexto del Sistema (C1)

Muestra los límites del arnés, los actores principales y los sistemas externos con los que interactúa:

```mermaid
flowchart TD
  userDeveloper["👤 Desarrollador / Ingeniero de Software"]
  agentLeader["⚡ Agente Principal (Leader)"]
  harnessSystem["🛡️ AI Agentic SDD Engineering Harness"]
  gitSystem["🐙 Sistema de Control de Versiones (Git / GitHub)"]
  browserUser["🌐 Navegador Web (Dashboard / Tablero Visual)"]

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
    containerOrchestrator["⚡ Orquestador Multi-Agente<br/>(Leader, Spec-Author, Implementer, Reviewer)"]
    containerTripleSync["🔄 Motor de Sincronización Triple<br/>(.opencode / .github / .agents)"]
    containerKnowledge["📚 Motor de Base de Conocimiento<br/>(Docs-as-Code, C4, UML, BR-*, ADRs)"]
    containerDashboard["💻 Tablero de Seguimiento Interactivo<br/>(Tailwind v4, Three.js, Editor Dual)"]
    containerTestRunner["🧪 Suite de Pruebas Automatizadas<br/>(Node.js Test Runner, Smoke Tests)"]
  end

  gitRepo["🐙 Repositorio Git Local"]
  userView["🌐 Navegador (file:/// o HTTP)"]

  containerOrchestrator -->|"Escribe specs y código"| gitRepo
  containerTripleSync -->|"Mantiene paridad de 18 skills"| containerOrchestrator
  containerKnowledge -->|"Alimenta contexto anti-sesgo"| containerOrchestrator
  containerDashboard -->|"Lee metadatos de specs y progreso"| gitRepo
  containerDashboard -->|"Renderiza vistas interactivas"| userView
  containerTestRunner -->|"Verifica build, tests y convenciones"| containerOrchestrator
```

---

## Nivel 3: Diagrama de Componentes del Tablero Web (C3)

Desglose interno de la aplicación web en `project-docs/`:

```mermaid
flowchart LR
  subgraph DashboardComponents["project-docs/src/"]
    compRouter["Enrutador por Pestañas<br/>(router.js)"]
    compStore["Store Reactivo Central<br/>(store.js)"]
    compDetector["Detector de Entorno & Agente<br/>(detector.js)"]
    compMarkdown["Lector Editorial & Parser Bloques<br/>(MarkdownViewer.js)"]
    compThree["Constelación 3D Piramidal<br/>(SpaceView3D.js)"]
    compMermaid["Visor & Editor Draw.io<br/>(MermaidViewer.js)"]
    compOmnibox["Buscador Global Ctrl+K<br/>(Omnibox Modal)"]
  end

  compRouter --> compStore
  compDetector --> compStore
  compStore --> compMarkdown
  compStore --> compThree
  compStore --> compMermaid
  compStore --> compOmnibox
```
