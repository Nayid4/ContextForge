/**
 * Datos de respaldo embebidos (Fallback).
 * Permite que index.html funcione al 100% abriendo directamente con doble clic (file:///)
 * sin ser bloqueado por la directiva CORS de los navegadores.
 * Sincronizado automáticamente por project-docs/sync-data.js
 */
window.__FALLBACK_DATA__ = {
  featureList: {
  "project": "AI Agentic SDD Engineering Harness",
  "description": "Arnés universal y agnóstico de ingeniería de software dirigida por especificaciones (Spec Driven Development) para agentes de IA (Google Antigravity, Open Code, GitHub Copilot).",
  "version": "2.5.0",
  "tech_stack": "Node.js (Universal Tooling) & Multi-Stack Agnostic",
  "runtime": "Cross-Platform Agentic SDD",
  "rules": {
    "one_feature_at_a_time": true,
    "require_tests_to_close": true,
    "require_approved_spec_to_implement": true,
    "branch_pattern": "{type}/INT-{id}/{name}",
    "branch_types": [
      "feature",
      "bugfix"
    ],
    "max_branch_length": 80,
    "valid_status": [
      "pending",
      "spec_ready",
      "in_progress",
      "done",
      "blocked"
    ]
  },
  "features": [
    {
      "id": 1,
      "type": "feature",
      "name": "refactor_harness_architecture",
      "title": "Refactorización Integral y Desacoplamiento Agnóstico del Arnés",
      "description": "Auditoría real del repositorio, saneamiento de mocks e-commerce residuales, desacoplamiento universal de subagentes y configuración de tests automatizados.",
      "module": "agent-orchestrator",
      "priority": "P0",
      "weight": 100,
      "branch": "feature/INT-001/refactor_harness_architecture",
      "spec_folder": "specs/001_refactor_harness_architecture",
      "status": "done",
      "acceptance": [
        "project-spec.yaml y project-spec.json representan fielmente el arnés de IA sin mocks e-commerce",
        "Los subagentes implementer y reviewer son agnósticos al stack y leen checks de compilación/tests",
        "package.json y suite de tests unitarios están configurados y pasando en verde",
        "El tablero project-docs/ sincroniza en tiempo real los datos reales en modo offline y HTTP"
      ]
    },
    {
      "id": 2,
      "type": "feature",
      "name": "triple_mirror_skills_sync",
      "title": "Motor de Sincronización Triple de Skills",
      "description": "Mecanismo de replicación y paridad entre .opencode/skills/ (fuente de verdad), .github/skills/ y .agents/skills/.",
      "module": "triple-sync-engine",
      "priority": "P0",
      "weight": 90,
      "branch": "feature/INT-002/triple_mirror_skills_sync",
      "spec_folder": "specs/002_triple_mirror_skills_sync",
      "status": "done",
      "acceptance": [
        "18 skills homologadas en .opencode/skills/ replicadas exactamente a .github/ y .agents/",
        "Frontmatter name y description idénticos en los 3 espejos",
        "Skill sync-skills disponible para auditoría de discrepancias"
      ]
    },
    {
      "id": 3,
      "type": "feature",
      "name": "knowledge_base_dynamic_engine",
      "title": "Motor de Base de Conocimiento Anti-Sesgo y Protocolo de Descubrimiento",
      "description": "Protocolo de elicitación profunda en 2 fases con C4, UML, ERD, diccionario de datos, reglas BR-* y ADRs.",
      "module": "knowledge-engine",
      "priority": "P0",
      "weight": 90,
      "branch": "feature/INT-003/knowledge_base_dynamic_engine",
      "spec_folder": "specs/003_knowledge_base_dynamic_engine",
      "status": "done",
      "acceptance": [
        "Escaneo de topología en Fase 1 sin saturación de tokens",
        "Documentación profunda por módulo en Fase 2",
        "Catálogo de reglas de negocio BR-* e invariantes de dominio indexadas"
      ]
    },
    {
      "id": 4,
      "type": "feature",
      "name": "dashboard_editorial_dual_editor",
      "title": "Tablero Editorial Vectorial con Lector ContextForge, Editor Dual y Zero-Emojis",
      "description": "Interfaz visual con Tailwind CSS v4, iconografia SVG accesible (0 emojis), tabla tecnica de stack, columna de lectura 780px, scrollspy TOC y editor dual Markdown/Bloques.",
      "module": "dashboard-visualizer",
      "priority": "P0",
      "weight": 95,
      "branch": "feature/INT-004/refactor_frontend_zero_emojis_atdd",
      "spec_folder": "specs/004_dashboard_editorial_dual_editor",
      "status": "done",
      "acceptance": [
        "Biblioteca organizada por estantes temáticos con tarjeta Hero destacada",
        "Lector de artículos con ancho centrado a 780px e interlineado 1.75em",
        "Editor dual ContextForge con soporte de bloques visuales y scroll sincronizado proporcional",
        "Erradicacion 100% de emojis con iconografia SVG accesible y suite ATDD en verde",
        "Seccion de Stack Tecnologico compacta y estructurada en tabla tecnica"
      ]
    },
    {
      "id": 5,
      "type": "feature",
      "name": "pyramidal_3d_constellation",
      "title": "Constelación 3D en Jerarquía Piramidal Three.js",
      "description": "Visualización 3D espacial estructurada en 4 niveles arquitectónicos con anillos translúcidos y flujo de energía Bezier.",
      "module": "dashboard-visualizer",
      "priority": "P1",
      "weight": 80,
      "branch": "feature/INT-005/pyramidal_3d_constellation",
      "spec_folder": "specs/005_pyramidal_3d_constellation",
      "status": "done",
      "acceptance": [
        "4 niveles piramidales Y=+165 (Ápice), Y=+55 (Core), Y=-55 (Features), Y=-165 (Base)",
        "Distribución radial armónica para evitar colisión de etiquetas",
        "Curvas cuadráticas de Bezier y ciclo de vida mount/unmount sin memory leaks"
      ]
    },
    {
      "id": 6,
      "type": "feature",
      "name": "omnibox_global_search",
      "title": "Búsqueda Global Omnibox con Atajo de Teclado",
      "description": "Buscador omnibox modal (Ctrl+K / Cmd+K) con filtrado reactivo de tareas, documentos, reglas y módulos.",
      "module": "dashboard-visualizer",
      "priority": "P1",
      "weight": 85,
      "branch": "feature/INT-006/omnibox_global_search",
      "spec_folder": "specs/006_omnibox_global_search",
      "status": "done",
      "acceptance": [
        "Apertura inmediata con Ctrl+K o Cmd+K desde cualquier sección",
        "Indexación simultánea de tareas, documentos, reglas BR-* y bounded contexts",
        "Navegación fluida por teclado (Up, Down, Enter, Escape)"
      ]
    },
    {
      "id": 7,
      "type": "feature",
      "name": "automated_unit_testing_suite",
      "title": "Suite de Pruebas Unitarias para Motores del Arnés",
      "description": "Pruebas automatizadas con Node.js Test Runner para sync-data.js, serializadores de markdown, TOC y reglas de branching.",
      "module": "testing-qa-suite",
      "priority": "P0",
      "weight": 90,
      "branch": "feature/INT-007/automated_unit_testing_suite",
      "spec_folder": "specs/007_automated_unit_testing_suite",
      "status": "done",
      "acceptance": [
        "Suite de tests unitarios nativos ejecutables con npm test",
        "Cobertura de parser de markdown, parseMarkdownToBlocks y blocksToMarkdown",
        "Validación de cálculo de tiempos de lectura y clasificación en estantes"
      ]
    },
    {
      "id": 8,
      "type": "feature",
      "name": "playwright_acceptance_testing",
      "title": "Pruebas de Aceptación End-to-End con Playwright",
      "description": "Automatización integral de pruebas E2E, caja blanca y caja negra para validar el tablero, constelación 3D y editor dual.",
      "module": "testing-qa-suite",
      "priority": "P1",
      "weight": 85,
      "branch": "feature/INT-008/playwright_acceptance_testing",
      "spec_folder": "specs/008_playwright_acceptance_testing",
      "status": "done",
      "acceptance": [
        "Script de prueba automatizada verificando carga de index.html",
        "Verificación de renderizado de la constelación 3D y conmutación de pestañas",
        "Prueba de edición y persistencia en el editor dual"
      ]
    }
  ]
},
  currentSpec: {
  "feature": {
    "id": 1,
    "type": "feature",
    "name": "refactor_harness_architecture",
    "title": "Refactorización Integral y Desacoplamiento Agnóstico del Arnés",
    "description": "Auditoría real del repositorio, saneamiento de mocks e-commerce residuales, desacoplamiento universal de subagentes y configuración de tests automatizados.",
    "module": "agent-orchestrator",
    "priority": "P0",
    "branch": "feature/INT-001/refactor_harness_architecture",
    "spec_folder": "specs/001_refactor_harness_architecture"
  },
  "responsable": "leader (orquestador)",
  "started_at": "2026-11-02 22:00 UTC",
  "completed_at": "2026-11-02 22:15 UTC",
  "status": "completed",
  "tasks": [
    {
      "title": "Auditoría técnica real y actualización de project-spec.yaml / project-spec.json",
      "done": true
    },
    {
      "title": "Desacoplar subagentes implementer y reviewer para que sean stack-agnósticos",
      "done": true
    },
    {
      "title": "Saneamiento de feature_list.json eliminando mocks de e-commerce y CloudSaaS",
      "done": true
    },
    {
      "title": "Crear package.json con scripts de build, test y sync",
      "done": true
    },
    {
      "title": "Implementar suite de pruebas unitarias para motores del arnés (tests/unit/)",
      "done": true
    },
    {
      "title": "Configurar y ejecutar pruebas de aceptación (tests/e2e/)",
      "done": true
    },
    {
      "title": "Auditoría de calidad por subagente reviewer y cierre de spec",
      "done": true
    }
  ]
},
  historyData: {
  "records": [
    {
      "id": 2,
      "type": "feature",
      "name": "triple_mirror_skills_sync",
      "title": "Motor de Sincronización Triple de Skills",
      "branch": "feature/INT-002/triple_mirror_skills_sync",
      "completed_at": "2026-11-02 18:00 UTC",
      "commit": "c9e37ab",
      "executor": "implementer + reviewer",
      "summary": "Mecanismo de paridad estricta entre .opencode/skills/, .github/skills/ y .agents/skills/ implementado."
    },
    {
      "id": 3,
      "type": "feature",
      "name": "knowledge_base_dynamic_engine",
      "title": "Motor de Base de Conocimiento Anti-Sesgo y Protocolo de Descubrimiento",
      "branch": "feature/INT-003/knowledge_base_dynamic_engine",
      "completed_at": "2026-11-02 19:30 UTC",
      "commit": "c9e37ab",
      "executor": "implementer + reviewer",
      "summary": "Descubrimiento en 2 fases, diagrama ERD, catálogo de ADRs y matriz de trazabilidad RTM añadidos."
    },
    {
      "id": 4,
      "type": "feature",
      "name": "dashboard_editorial_dual_editor",
      "title": "Tablero Editorial con Lector ContextForge y Editor Dual",
      "branch": "feature/INT-004/dashboard_editorial_dual_editor",
      "completed_at": "2026-11-02 21:00 UTC",
      "commit": "08fe75c",
      "executor": "implementer + reviewer",
      "summary": "Hub editorial por estantes temáticos, columna 780px, TOC flotante con scrollspy y editor dual Markdown/Bloques con scroll sincronizado."
    },
    {
      "id": 5,
      "type": "feature",
      "name": "pyramidal_3d_constellation",
      "title": "Constelación 3D en Jerarquía Piramidal Three.js",
      "branch": "feature/INT-005/pyramidal_3d_constellation",
      "completed_at": "2026-11-02 21:30 UTC",
      "commit": "08fe75c",
      "executor": "implementer + reviewer",
      "summary": "Estructura piramidal en 4 niveles con anillos guía translúcidos, distribución armónica y curvas Bezier."
    },
    {
      "id": 6,
      "type": "feature",
      "name": "omnibox_global_search",
      "title": "Búsqueda Global Omnibox con Atajo de Teclado",
      "branch": "feature/INT-006/omnibox_global_search",
      "completed_at": "2026-11-02 21:45 UTC",
      "commit": "08fe75c",
      "executor": "implementer + reviewer",
      "summary": "Buscador modal omnibox (Ctrl+K) con búsqueda reactiva de tareas, documentos, reglas BR-* y módulos."
    },
    {
      "id": 1,
      "type": "feature",
      "name": "refactor_harness_architecture",
      "title": "Refactorización Integral y Desacoplamiento Agnóstico del Arnés",
      "branch": "feature/INT-001/refactor_harness_architecture",
      "completed_at": "2026-11-02 22:15 UTC",
      "commit": "HEAD",
      "executor": "implementer + reviewer",
      "summary": "Auditoría real del arnés, desacoplamiento universal de subagentes, erradicación de mocks e-commerce y suite de pruebas unitarias y e2e."
    }
  ]
},
  projectSpec: {
  "project": {
    "name": "AI Agentic SDD Engineering Harness",
    "description": "Arnés universal y agnóstico de ingeniería de software dirigida por especificaciones (Spec Driven Development). Provee orquestación multi-agente, sincronización de skills triple, base de conocimiento anti-sesgo y tablero de seguimiento interactivo en Screaming Architecture.",
    "version": "2.5.0",
    "type": "fullstack"
  },
  "runtime": {
    "language": "node",
    "version": "v18.0.0+",
    "packageManager": "npm"
  },
  "environment": {
    "required": [],
    "optional": [
      {
        "name": "PORT",
        "description": "Puerto para el servidor HTTP local de visualización",
        "defaultValue": "8080"
      },
      {
        "name": "CI",
        "description": "Indicador de ejecución en entorno de integración continua",
        "defaultValue": "false"
      }
    ]
  },
  "services": [],
  "dependencies": {
    "system": [
      {
        "name": "node",
        "version": ">=18.0.0",
        "required": true
      },
      {
        "name": "npm",
        "version": ">=9.0.0",
        "required": true
      },
      {
        "name": "git",
        "version": ">=2.30.0",
        "required": true
      }
    ],
    "packages": [
      {
        "name": "esbuild",
        "version": "^0.25.0",
        "required": true,
        "dev": true
      }
    ]
  },
  "structure": {
    "entryPoint": "project-docs/src/main.js",
    "srcDir": "project-docs/src",
    "testDir": "tests",
    "buildDir": "project-docs/dist",
    "configFiles": [
      {
        "filename": "package.json",
        "required": true,
        "description": "Manifiesto de dependencias, tipos ESM y scripts de ciclo de vida"
      },
      {
        "filename": "opencode.json",
        "required": true,
        "description": "Configuración principal para OpenCode"
      },
      {
        "filename": "kickstart.json",
        "required": false,
        "description": "Parámetros y metadatos de inicialización de proyectos cliente"
      },
      {
        "filename": "AGENTS.md",
        "required": true,
        "description": "Reglas de branching, commits semánticos y arquitectura de agentes"
      },
      {
        "filename": "ANTIGRAVITY.md",
        "required": true,
        "description": "Guía de orquestación para Google Antigravity 2.0"
      }
    ]
  },
  "architecture": {
    "style": "Multi-Agent System (MAS) + Screaming Architecture (Modular)",
    "patterns": [
      "Spec Driven Development (SDD)",
      "Triple-Mirror Skills Synchronization",
      "Docs-as-Code (Markdown + Mermaid C4/UML)",
      "Proportional Synchronized Dual Editor",
      "Pyramidal 3D Constellation"
    ],
    "layers": [
      {
        "name": "Platform Rules & Instructions",
        "description": "Reglas canónicas de branching ({type}/INT-{id}/{name} <=80c) y commits semánticos en .agents/, .opencode/ y .github/."
      },
      {
        "name": "Multi-Agent Orchestrator",
        "description": "Roles especializados: leader, spec-author, implementer y reviewer con puertas de decisión humana (ask_question)."
      },
      {
        "name": "Tri-Platform Skills Registry",
        "description": "Catálogo de 18 skills homologadas con fuente de verdad en .opencode/skills/ y espejos automáticos en .github/ y .agents/."
      },
      {
        "name": "Anti-Bias Sovereign Knowledge Base",
        "description": "Directorio project-docs/knowledge/ con modelo C4, diagramas UML, ERD, diccionario de datos, reglas BR-* y ADRs."
      },
      {
        "name": "Interactive Tracking Dashboard",
        "description": "Tablero web interactivo en project-docs/ con Tailwind CSS v4, Three.js 3D, Editorial Library Hub y Editor Dual ContextForge."
      }
    ]
  },
  "tech_stack": {
    "orchestration": "Google Antigravity 2.0 / OpenCode / GitHub Copilot",
    "tooling": "Node.js (ES Modules), esbuild",
    "frontend": "Vanilla JS, Tailwind CSS v4 (@tailwindcss/browser@4), Three.js r128",
    "documentation": "Docs-as-Code, Mermaid.js 10.9+, GitHub Flavored Markdown",
    "testing": "Node.js Test Runner, Playwright E2E"
  },
  "modules": [
    {
      "id": "agent-orchestrator",
      "name": "Orquestador Multi-Agente & Reglas de Plataforma",
      "tech": "Google Antigravity Roles, OpenCode Rules, Copilot Instructions",
      "description": "Coordina roles especializados (leader, spec-author, implementer, reviewer) con guardrails de ramas y commits."
    },
    {
      "id": "triple-sync-engine",
      "name": "Motor de Sincronización Triple de Skills",
      "tech": "Node.js, FileSystem Mirroring",
      "description": "Mantiene paridad estricta entre .opencode/skills/ (fuente de verdad), .github/skills/ y .agents/skills/."
    },
    {
      "id": "knowledge-engine",
      "name": "Motor de Base de Conocimiento Anti-Sesgo",
      "tech": "Docs-as-Code, Mermaid C4/UML, Markdown",
      "description": "Genera y audita modelos C4, diagramas UML, ERD, diccionario de datos, reglas de negocio BR-* y decisiones ADR."
    },
    {
      "id": "dashboard-visualizer",
      "name": "Tablero de Seguimiento Visual & Editor Dual",
      "tech": "Vanilla JS (ES Modules), Tailwind CSS v4, Three.js, ContextForge Dual Block Editor",
      "description": "Interfaz interactiva con métricas KPI, biblioteca por estantes, constelación 3D piramidal y buscador Omnibox (Ctrl+K)."
    },
    {
      "id": "testing-qa-suite",
      "name": "Suite de Pruebas & Calidad",
      "tech": "Node.js Test Runner, Playwright E2E, Static Analysis",
      "description": "Batería de tests unitarios, caja blanca/negra, aceptación end-to-end y auditoría de código."
    }
  ],
  "checks": {
    "build": {
      "command": "npm run build",
      "timeout": 60
    },
    "test": {
      "command": "npm test",
      "timeout": 120,
      "hasTests": true
    },
    "lint": {
      "command": "npm run test:unit",
      "hasLint": true
    },
    "verify": {
      "command": "node project-docs/sync-data.js",
      "timeout": 60
    }
  },
  "docker": {
    "hasDockerfile": false,
    "hasCompose": false,
    "services": []
  },
  "scripts": {
    "dev": "node project-docs/serve.js",
    "build": "npm run build",
    "start": "npm start",
    "test": "npm test",
    "lint": "npm run test:unit",
    "verify": "npm run sync"
  }
},
  knowledgeIndex: {
  "project": "AI Agentic SDD Engineering Harness",
  "version": "2.5.0",
  "last_updated": "2026-11-02",
  "modules": [
    "agent-orchestrator",
    "triple-sync-engine",
    "knowledge-engine",
    "dashboard-visualizer",
    "testing-qa-suite"
  ],
  "diagrams": [
    {
      "id": "c1",
      "type": "C4 Model",
      "level": "Nivel 1",
      "title": "Modelo C4 - Contexto de Sistema (C1)",
      "description": "Muestra los límites del arnés, los actores principales y los sistemas externos con los que interactúa:",
      "mermaid": "flowchart TD\r\n  userDeveloper[\"Desarrollador / Ingeniero de Software\"]\r\n  agentLeader[\"Agente Principal (Leader)\"]\r\n  harnessSystem[\"AI Agentic SDD Engineering Harness\"]\r\n  gitSystem[\"Sistema de Control de Versiones (Git / GitHub)\"]\r\n  browserUser[\"Navegador Web (Dashboard / Tablero Visual)\"]\r\n\r\n  userDeveloper -->|\"Define requerimientos y aprueba specs\"| harnessSystem\r\n  agentLeader -->|\"Orquesta tareas e invoca subagentes\"| harnessSystem\r\n  harnessSystem -->|\"Crea ramas INT-* y commits semánticos\"| gitSystem\r\n  harnessSystem -->|\"Genera y sincroniza datos en tiempo real\"| browserUser\r\n  browserUser -->|\"Permite lectura editorial y edición dual\"| userDeveloper"
    },
    {
      "id": "c2",
      "type": "C4 Model",
      "level": "Nivel 2",
      "title": "Modelo C4 - Contenedores del Arnés (C2)",
      "description": "Descompone el arnés en sus subsistemas y aplicaciones principales:",
      "mermaid": "flowchart TD\r\n  subgraph HarnessContainers[\"Contenedores del Arnés SDD\"]\r\n    containerOrchestrator[\"Orquestador Multi-Agente<br/>(Leader, Spec-Author, Implementer, Reviewer)\"]\r\n    containerTripleSync[\"Motor de Sincronización Triple<br/>(.opencode / .github / .agents)\"]\r\n    containerKnowledge[\"Motor de Base de Conocimiento<br/>(Docs-as-Code, C4, UML, BR-*, ADRs)\"]\r\n    containerDashboard[\"Tablero de Seguimiento Interactivo<br/>(Tailwind v4, Three.js, Editor Dual)\"]\r\n    containerTestRunner[\"Suite de Pruebas Automatizadas<br/>(Node.js Test Runner, Smoke Tests)\"]\r\n  end\r\n\r\n  gitRepo[\"Repositorio Git Local\"]\r\n  userView[\"Navegador (file:/// o HTTP)\"]\r\n\r\n  containerOrchestrator -->|\"Escribe specs y código\"| gitRepo\r\n  containerTripleSync -->|\"Mantiene paridad de 18 skills\"| containerOrchestrator\r\n  containerKnowledge -->|\"Alimenta contexto anti-sesgo\"| containerOrchestrator\r\n  containerDashboard -->|\"Lee metadatos de specs y progreso\"| gitRepo\r\n  containerDashboard -->|\"Renderiza vistas interactivas\"| userView\r\n  containerTestRunner -->|\"Verifica build, tests y convenciones\"| containerOrchestrator"
    },
    {
      "id": "c3",
      "type": "C4 Model",
      "level": "Nivel 3",
      "title": "Modelo C4 - Componentes del Tablero Web (C3)",
      "description": "Desglose interno de la aplicación web en `project-docs/`:",
      "mermaid": "flowchart LR\r\n  subgraph DashboardComponents[\"project-docs/src/\"]\r\n    compRouter[\"Enrutador por Pestañas<br/>(router.js)\"]\r\n    compStore[\"Store Reactivo Central<br/>(store.js)\"]\r\n    compDetector[\"Detector de Entorno & Agente<br/>(detector.js)\"]\r\n    compMarkdown[\"Lector Editorial & Parser Bloques<br/>(MarkdownViewer.js)\"]\r\n    compThree[\"Constelación 3D Piramidal<br/>(SpaceView3D.js)\"]\r\n    compMermaid[\"Visor & Editor Draw.io<br/>(MermaidViewer.js)\"]\r\n    compOmnibox[\"Buscador Global Ctrl+K<br/>(Omnibox Modal)\"]\r\n  end\r\n\r\n  compRouter --> compStore\r\n  compDetector --> compStore\r\n  compStore --> compMarkdown\r\n  compStore --> compThree\r\n  compStore --> compMermaid\r\n  compStore --> compOmnibox"
    },
    {
      "id": "class",
      "type": "UML Clases",
      "level": "Modelo de Dominio",
      "title": "Diagrama de Clases del Dominio SDD",
      "description": "Muestra las entidades, value objects y relaciones del modelo conceptual del arnés:",
      "mermaid": "classDiagram\r\n  class Feature {\r\n    +int id\r\n    +string type\r\n    +string name\r\n    +string title\r\n    +string description\r\n    +string module\r\n    +string priority\r\n    +string branch\r\n    +string status\r\n    +List~string~ acceptance\r\n    +markCompleted()\r\n  }\r\n\r\n  class Subagent {\r\n    +string name\r\n    +string role\r\n    +List~string~ tools\r\n    +executeTask(Task task)\r\n  }\r\n\r\n  class KnowledgeDocument {\r\n    +string key\r\n    +string filename\r\n    +string title\r\n    +string shelf\r\n    +int readingTime\r\n    +int wordCount\r\n    +int ruleCount\r\n    +extractTOC() List~Heading~\r\n  }\r\n\r\n  class BusinessRule {\r\n    +string id\r\n    +string title\r\n    +string module\r\n    +string severity\r\n    +string description\r\n    +validate() bool\r\n  }\r\n\r\n  class ArchitecturalDecisionRecord {\r\n    +string id\r\n    +string title\r\n    +string status\r\n    +string context\r\n    +string decision\r\n    +string consequences\r\n  }\r\n\r\n  Feature \"1\" --> \"*\" BusinessRule : \"satisface\"\r\n  Feature \"1\" --> \"1\" Subagent : \"asignada a\"\r\n  KnowledgeDocument \"*\" --> \"*\" BusinessRule : \"documenta\"\r\n  KnowledgeDocument \"*\" --> \"*\" ArchitecturalDecisionRecord : \"registra\""
    },
    {
      "id": "seq-sdd",
      "type": "UML Secuencia",
      "level": "Proceso SDD",
      "title": "Secuencia: Ciclo de Vida Completo SDD",
      "description": "sequenceDiagram",
      "mermaid": "sequenceDiagram\r\n  autonumber\r\n  actor User as \"Usuario (Humano)\"\r\n  participant Leader as \"Leader Agent\"\r\n  participant Git as \"Git System\"\r\n  participant SpecAuthor as \"Spec-Author\"\r\n  participant Implementer as \"Implementer\"\r\n  participant Reviewer as \"Reviewer\"\r\n\r\n  User->>Leader: \"Iniciar tarea INT-001\"\r\n  Leader->>Git: \"git checkout -b feature/INT-001/{name}\"\r\n  Leader->>SpecAuthor: \"Redactar requerimientos y tasks\"\r\n  SpecAuthor-->>Leader: \"specs/001/ completado (spec_ready)\"\r\n  Leader->>User: \"ask_question: Aprobar spec al 100%?\"\r\n  alt Spec Aprobado\r\n    User-->>Leader: \"Aprobado (in_progress)\"\r\n    Leader->>Implementer: \"Implementar código y tests\"\r\n    Implementer->>Implementer: \"Ejecutar checks.test y checks.build\"\r\n    Implementer-->>Leader: \"Trazabilidad R<->Tests completa\"\r\n    Leader->>Reviewer: \"Auditar calidad y consistencia\"\r\n    alt Reviewer Aprueba\r\n      Reviewer-->>Leader: \"APROBADO (0 errores)\"\r\n      Leader->>User: \"ask_question: Integrar a rama base?\"\r\n    else Reviewer Rechaza\r\n      Reviewer-->>Leader: \"RECHAZADO (hallazgos)\"\r\n      Leader->>Implementer: \"Corregir observaciones\"\r\n    end\r\n  else Spec Rechazado\r\n    User-->>Leader: \"Rechazar o solicitar cambios\"\r\n    Leader->>SpecAuthor: \"Ajustar especificación\"\r\n  end"
    },
    {
      "id": "seq-editor",
      "type": "UML Secuencia",
      "level": "Editor Dual",
      "title": "Secuencia: Editor Dual ContextForge",
      "description": "sequenceDiagram",
      "mermaid": "sequenceDiagram\r\n  autonumber\r\n  actor User as \"Desarrollador\"\r\n  participant UI as \"Tablero Web (main.js)\"\r\n  participant Textarea as \"Panel Editor Markdown\"\r\n  participant Preview as \"Panel Live Preview\"\r\n  participant Blocks as \"Panel Bloques Visuales\"\r\n  participant Storage as \"sync-data.js / data-fallback.js\"\r\n\r\n  User->>UI: \"Pulsar [ Modo Editor ]\"\r\n  UI->>Textarea: \"Cargar markdown actual\"\r\n  UI->>Preview: \"renderMarkdown(content)\"\r\n  \r\n  alt Usuario edita en Textarea (Markdown)\r\n    User->>Textarea: \"Escribir texto y hacer scroll\"\r\n    Textarea->>Preview: \"Sincronizar scroll proporcionalmente (isScrollingFromEditor)\"\r\n    Textarea->>Preview: \"Actualizar HTML en vivo\"\r\n  else Usuario conmuta a [ Modo Bloques ]\r\n    User->>UI: \"Pulsar [ Modo Bloques Visuales ]\"\r\n    UI->>Blocks: \"parseMarkdownToBlocks(markdown)\"\r\n    Blocks-->>User: \"Renderizar tarjetas interactivas (H1, BR, Callouts)\"\r\n    User->>Blocks: \"Reordenar bloques o añadir bloque\"\r\n    Blocks->>Textarea: \"blocksToMarkdown(blocks)\"\r\n    Blocks->>Preview: \"Actualizar previsualización en vivo\"\r\n  end\r\n\r\n  User->>UI: \"Pulsar [ Guardar Cambios ]\"\r\n  UI->>Storage: \"store.saveDoc(key, content) + sync-data.js\"\r\n  Storage-->>User: \"Documento persistido local y offline\""
    },
    {
      "id": "use-cases",
      "type": "UML Casos de Uso",
      "level": "Casos de Uso",
      "title": "Diagrama de Casos de Uso del Arnés SDD",
      "description": "flowchart TD",
      "mermaid": "flowchart TD\r\n  actorDev[\"Desarrollador\"]\r\n  actorAgent[\"Agente de IA\"]\r\n\r\n  subgraph UseCases[\"Casos de Uso del Arnés de Ingeniería\"]\r\n    ucAudit[\"Auditar Stack Técnico (/technical-audit)\"]\r\n    ucKnowledge[\"Extraer Base de Conocimiento (/project-knowledge)\"]\r\n    ucSpec[\"Redactar Requerimientos EARS (/generate-spec)\"]\r\n    ucHumanGate[\"Aprobar Puerta Humana (ask_question)\"]\r\n    ucImplement[\"Implementar Código & Tests (/implement)\"]\r\n    ucReview[\"Auditar Calidad & Trazabilidad (/review)\"]\r\n    ucViewDash[\"Navegar Tablero & Constelación 3D\"]\r\n    ucOmnibox[\"Búsqueda Global Omnibox (Ctrl+K)\"]\r\n    ucEditDual[\"Edición Dual Markdown / Bloques\"]\r\n  end\r\n\r\n  actorDev --> ucAudit\r\n  actorDev --> ucKnowledge\r\n  actorDev --> ucHumanGate\r\n  actorDev --> ucViewDash\r\n  actorDev --> ucOmnibox\r\n  actorDev --> ucEditDual\r\n\r\n  actorAgent --> ucSpec\r\n  actorAgent --> ucImplement\r\n  actorAgent --> ucReview\r\n  actorAgent --> ucKnowledge"
    },
    {
      "id": "erd",
      "type": "Database ERD",
      "level": "Persistencia",
      "title": "Diagrama Entidad-Relación (ERD)",
      "description": "erDiagram",
      "mermaid": "erDiagram\r\n  PROJECT ||--o{ FEATURE : \"contiene\"\r\n  PROJECT ||--|| PROJECT_SPEC : \"especificado por\"\r\n  FEATURE ||--|{ ACCEPTANCE_CRITERIA : \"valida con\"\r\n  FEATURE ||--o{ TASK : \"descompone en\"\r\n  FEATURE ||--o{ BUSINESS_RULE : \"satisface\"\r\n  KNOWLEDGE_INDEX ||--o{ DOCUMENT : \"cataloga\"\r\n  DOCUMENT ||--o{ SHELF : \"pertenece a\"\r\n  DOCUMENT ||--o{ BUSINESS_RULE : \"documenta\"\r\n\r\n  PROJECT {\r\n    string name PK\r\n    string description\r\n    string version\r\n    string tech_stack\r\n    string runtime\r\n  }\r\n\r\n  FEATURE {\r\n    int id PK\r\n    string type\r\n    string name\r\n    string title\r\n    string module\r\n    string priority\r\n    string branch\r\n    string status\r\n  }\r\n\r\n  TASK {\r\n    string id PK\r\n    string title\r\n    bool done\r\n  }\r\n\r\n  BUSINESS_RULE {\r\n    string id PK\r\n    string module\r\n    string severity\r\n    string title\r\n    string description\r\n  }\r\n\r\n  DOCUMENT {\r\n    string key PK\r\n    string filename\r\n    string title\r\n    string shelf\r\n    int readingTime\r\n    int wordCount\r\n    int ruleCount\r\n  }"
    }
  ],
  "business_rules": [
    {
      "id": "BR-ORCH-001",
      "module": "agent-orchestrator",
      "severity": "Crítica",
      "title": "Formato y Longitud Estricta de Ramas Git",
      "description": "Toda rama debe cumplir {feature|bugfix}/INT-{numero}/{nombre} y longitud <= 80 caracteres."
    },
    {
      "id": "BR-ORCH-002",
      "module": "agent-orchestrator",
      "severity": "Crítica",
      "title": "Puerta Humana Obligatoria para Aprobación de Spec",
      "description": "Prohibido pasar a in_progress o implementar sin aprobación explícita mediante ask_question."
    },
    {
      "id": "BR-ORCH-003",
      "module": "agent-orchestrator",
      "severity": "Crítica",
      "title": "Subagente Revisor No Modifica Código",
      "description": "El reviewer audita de forma independiente e imparcial sin editar código fuente ni tests."
    },
    {
      "id": "BR-SYNC-001",
      "module": "triple-sync-engine",
      "severity": "Crítica",
      "title": "Fuente de Verdad Inviolable en .opencode/",
      "description": ".opencode/skills/ es la única fuente canónica; las demás plataformas son espejos unidireccionales."
    },
    {
      "id": "BR-SYNC-002",
      "module": "triple-sync-engine",
      "severity": "Alta",
      "title": "Paridad Estricta de Frontmatter",
      "description": "El bloque YAML name y description de SKILL.md debe ser idéntico en los 3 espejos."
    },
    {
      "id": "BR-KNOW-001",
      "module": "knowledge-engine",
      "severity": "Crítica",
      "title": "Sintaxis Mermaid Ultra-Estricta",
      "description": "IDs de nodos alfanuméricos simples y etiquetas de texto obligatoriamente entre comillas dobles."
    },
    {
      "id": "BR-KNOW-002",
      "module": "knowledge-engine",
      "severity": "Crítica",
      "title": "Consulta Obligatoria Anti-Sesgo de la Base de Conocimiento",
      "description": "Obligatorio consultar project-docs/knowledge/ antes de proponer historias o implementar código."
    },
    {
      "id": "BR-DASH-001",
      "module": "dashboard-visualizer",
      "severity": "Crítica",
      "title": "Compatibilidad Offline Total (Protocolo file:///)",
      "description": "El tablero web debe operar con doble clic directo sin requerir servidor HTTP gracias a data-fallback.js."
    },
    {
      "id": "BR-DASH-002",
      "module": "dashboard-visualizer",
      "severity": "Alta",
      "title": "Scroll Sincronizado Proporcional Anti-Bloqueo",
      "description": "Sincronización de scroll proporcional basada en ratios con flags de exclusión mutua."
    },
    {
      "id": "BR-TEST-001",
      "module": "testing-qa-suite",
      "severity": "Crítica",
      "title": "100% de Tests en Verde para Cierre de Spec",
      "description": "Ningún spec se cierra sin el 100% de las pruebas automatizadas pasando en verde."
    },
    {
      "id": "BR-TEST-002",
      "module": "testing-qa-suite",
      "severity": "Alta",
      "title": "Ejecutor de Pruebas Nativo sin Bloat",
      "description": "Pruebas unitarias ejecutadas mediante node --test nativo en menos de 500ms."
    }
  ],
  "external_services": [
    {
      "name": "Google Antigravity",
      "type": "Agentic IDE & CLI",
      "protocol": "Native Subagent Protocol / IPC",
      "auth": "IDE Managed",
      "env_var": "N/A",
      "failover": "Ejecución mediante CLI local o scripts shell"
    },
    {
      "name": "OpenCode Engine",
      "type": "AI CLI & Rule Runner",
      "protocol": "CLI Exec",
      "auth": "Local Config",
      "env_var": "N/A",
      "failover": "Lectura directa de .opencode/rules/"
    },
    {
      "name": "GitHub Copilot",
      "type": "AI Assistant Mirror",
      "protocol": "Instructions / Markdown",
      "auth": "GitHub Auth",
      "env_var": "N/A",
      "failover": "Carga desde .github/instructions/"
    },
    {
      "name": "Git / GitHub Provider",
      "type": "Version Control",
      "protocol": "Git CLI / HTTPS / SSH",
      "auth": "SSH Key / Personal Access Token",
      "env_var": "GIT_AUTHOR_NAME, GIT_AUTHOR_EMAIL",
      "failover": "Modo local desconectado en ramas {type}/INT-*"
    }
  ],
  "coding_standards": {
    "naming_conventions": {
      "files": "kebab-case.js / PascalCase.js",
      "classes": "PascalCase",
      "branches": "{type}/INT-{id}/{name} (<=80c)",
      "commits": "feat(scope): desc / fix(scope): desc"
    },
    "guardrails": [
      "Prohibido instalar paquetes o bibliotecas no canónicas no registradas en package.json o project-spec.yaml.",
      "Toda regla de negocio BR-* debe estar validada por tests automatizados.",
      "Inversión de dependencias y modularidad estricta en controladores y features.",
      "Cero código comentado, variables huérfanas o secretos hardcodeados."
    ]
  },
  "docs": {
    "01-project-overview-and-business.md": "---\nid: DOC-BIZ-OVERVIEW\ntitle: \"Visión del Producto, Contexto de Negocio y Stakeholders\"\nmodule: \"global\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"ieee-830\", \"business-context\", \"product-vision\", \"stakeholders\", \"raci\"]\n---\n\n# Visión del Producto, Contexto de Negocio y Stakeholders (IEEE Std. 830-1998)\n\n> [!NOTE]\n> Especificación formal del propósito, alcance, límites, usuarios y gobernanza del **AI Agentic SDD Engineering Harness** bajo el estándar IEEE Std. 830-1998 / ISO/IEC/IEEE 29148.\n\n---\n\n## 1. Naturaleza y Propósito del Proyecto\n\nEl **AI Agentic SDD Engineering Harness** es un arnés universal y agnóstico de ingeniería de software dirigido por especificaciones (**Spec-Driven Development — SDD**) diseñado para permitir la colaboración autónoma, segura y determinista entre ingenieros humanos y agentes de inteligencia artificial (Google Antigravity, GitHub Copilot y OpenCode).\n\n### 1.1 Formulación del Problema\n\n#### Dolor de Negocio\n- **Fricción Cognitiva y Pérdida de Productividad**: En organizaciones de software, la rotación de desarrolladores y el conocimiento tácito atrapado en silos (*Bus Factor = 1*) provocan que los ingenieros senior pierdan entre 1.5 y 2.5 horas diarias respondiendo dudas operativas y validando reglas de negocio no documentadas.\n- **Alucinaciones y Regresiones por IA**: Los asistentes de programación tradicionales generan código sintácticamente correcto pero funcionalmente incompatible cuando carecen de un modelo formal del dominio, rompiendo invariantes de base de datos, violando reglas de negocio (`BR-*`) o importando librerías no autorizadas.\n\n#### Dolor Técnico\n- **Ceguera de Contexto en Proyectos Extensos**: A partir de 50.000 líneas de código, cargar archivos planos en prompts satura la atención del modelo y causa omisiones catastróficas.\n- **Falta de Trazabilidad RTM**: Ausencia de vinculación bidireccional entre requerimientos funcionales (`RF-*`), reglas de negocio (`BR-*`), historias de usuario (`HU-*`), código fuente y suites de prueba automatizadas.\n\n---\n\n## 2. Declaración Formal de la Visión del Producto\n\n> **PARA** ingenieros de software, arquitectos de soluciones y equipos de desarrollo asistidos por IA,  \n> **QUIENES** experimentan alucinaciones, código desalineado con el dominio y regresiones al usar agentes de programación en bases de código medianas y complejas,  \n> **EL** AI Agentic SDD Engineering Harness,  \n> **QUE ES UN** arnés de ingeniería de software agnóstico basado en Docs-as-Code, orquestación multi-agente y verificación formal en 8 niveles,  \n> **QUE** garantiza una precisión funcional $\\ge 95\\%$ en el código generado por IA mediante un ciclo cerrado y determinista (Especificación EARS $\\to$ Puerta Humana $\\to$ Implementación TDD/SDD $\\to$ Revisión Imparcial $\\to$ Verificación Automatizada), triple sincronización de skills y tablero visual offline.\n\n---\n\n## 3. Ámbito del Producto (IEEE 830 Secciones 1.2 y 2.2)\n\n### 3.1 Qué HACE el Sistema (Alcance Incluido)\n1. **Orquestación Multi-Agente Homologada**: Provee 4 roles especializados (`leader`, `spec-author`, `implementer`, `reviewer`) con responsabilidades estrictamente delimitadas.\n2. **Gobernanza de Ramas y Commits**: Impone la convención obligatoria `{feature|bugfix}/INT-{numero}/{nombre_rama}` con longitud máxima de 80 caracteres y commits semánticos (`feat`, `fix`).\n3. **Puertas de Decisión Humana Infranqueables**: Utiliza herramientas nativas (`ask_question`) para congelar la ejecución hasta obtener aprobación explícita del humano antes de implementar o integrar código.\n4. **Triple Sincronización de 18 Skills**: Mantiene paridad absoluta e instantánea entre la fuente de verdad (`.opencode/skills/`) y los espejos (`.github/skills/` y `.agents/skills/`).\n5. **Base de Conocimiento Soberana (Docs-as-Code)**: Elicita y estructura modelos C4, diagramas UML, diccionario de datos/ERD, catálogo de reglas de negocio (`BR-*`), ADRs y radiografía granular de módulos.\n6. **Tablero Visual Offline-First (`project-docs/`)**: Aplicación web en Vanilla JS y Tailwind v4 con arquitectura screaming, lector editorial, editor dual Markdown/Bloques ContextForge, grafos de dependencias y constelación 3D en Three.js con soporte nativo para protocolo `file:///`.\n7. **Pipeline de Calidad en 8 Niveles (`verify.sh`)**: Ejecuta pruebas unitarias, ATDD smoke, caja blanca, caja negra (BVA/resiliencia), integración/sistema, carga concurrente y aceptación E2E con Playwright.\n\n### 3.2 Qué NO HACE el Sistema (Exclusiones Explícitas)\n- **No Toma Decisiones de Arquitectura Autónomas**: Las decisiones de diseño, aprobación de especificaciones e integración a la rama base requieren siempre autorización del humano.\n- **No Realiza Push Remoto no Autorizado**: Queda terminantemente prohibido ejecutar `git push` a repositorios remotos sin confirmación explícita del usuario.\n- **No Modifica Código Durante la Fase de Revisión**: El subagente `reviewer` audita de forma imparcial y jamás edita código fuente ni tests.\n- **No Acopla el Proyecto a un Framework Específico**: El arnés es agnóstico al lenguaje (Node.js, .NET, Python, Go, Java, Rust); solo la carpeta de configuración `.agents/` y `project-docs/` forman el arnés.\n\n---\n\n## 4. Catálogo de Stakeholders y Matriz RACI (IEEE 830 Sección 2.3)\n\n### 4.1 Catálogo de Interesados\n\n| Stakeholder | Rol en el Sistema | Responsabilidad | Intereses Principales | Necesidades Clave |\n|---|---|---|---|---|\n| **Tech Lead / Arquitecto** | Sponsor & Owner | Diseñar la arquitectura base y aprobar specs/ADRs | Mantenibilidad, reducción de deuda técnica | Documentación AS-IS fidedigna, cero alucinaciones de IA |\n| **Ingeniero de Software (Dev)** | Usuario Directo | Implementar features y refactorizaciones | Velocidad de desarrollo, contexto claro | Búsqueda rápida de reglas BR-*, especificaciones unívocas |\n| **Agentes de IA (AGY/Copilot)** | Ejecutores Asistidos | Redactar specs, implementar código y auditar | Contexto sin truncamiento, instrucciones deterministas | YAML frontmatter, tarjetas CRC, lista blanca de dependencias |\n| **QA Automation Specialist** | Usuario Directo | Diseñar y supervisar la suite de pruebas | Cobertura en ramas, confiabilidad de regresión | Matriz RTM completa, pruebas BVA y Playwright E2E |\n| **Product Manager / Negocio** | Usuario Indirecto | Priorizar features y validar aceptación | Time-to-market, alineación con negocio | Visibilidad visual de progreso en el tablero interactivo |\n\n### 4.2 Matriz RACI de Componentes del Sistema\n\n| Componente / Proceso | Tech Lead | Dev Humano | Leader Agent | Implementer | Reviewer | QA |\n|---|---|---|---|---|---|---|\n| **Definición de Requerimientos** | A | C | R | I | C | C |\n| **Aprobación de Spec (Puerta)** | A / R | A / R | C | I | I | I |\n| **Implementación de Código** | I | C | C | R | I | I |\n| **Auditoría de Calidad / Review** | I | I | C | I | R | C |\n| **Ejecución de verify.sh** | I | C | I | R | R | A / R |\n| **Integración a Rama Base** | A | R | C | I | I | I |\n\n*Convención: R = Responsable de ejecutar, A = Aprobador final, C = Consultado, I = Informado.*\n\n---\n\n## 5. Perfiles de Usuario y Personas (IEEE 830 Sección 2.3)\n\n### Persona 1: Ingeniero Senior / Tech Lead\n- **Formación**: Licenciatura / Maestría en Ciencias de la Computación o Ingeniería de Sistemas.\n- **Experiencia**: >8 años en desarrollo de software y arquitectura distribuida.\n- **Punto de Dolor**: Dedica demasiado tiempo explicando arquitectura histórica y corrigiendo PRs generados por IA que inventan dependencias o violan reglas de negocio.\n- **Objetivo con el Arnés**: Disponer de un arnés que obligue a los agentes a ceñirse al contexto soberano antes de escribir una sola línea de código.\n\n### Persona 2: Desarrollador Junior / Nuevo Integrante\n- **Formación**: Grado en Ingeniería o egresado de Bootcamp técnico.\n- **Experiencia**: 6 meses a 2 años en programación.\n- **Punto de Dolor**: Alta fricción cognitiva al incorporarse a proyectos grandes; miedo a romper reglas tácitas no documentadas.\n- **Objetivo con el Arnés**: Reducir su *time-to-first-PR* a menos de una semana gracias a la documentación interactiva y las tarjetas CRC.\n",
    "02-architecture-and-patterns.md": "---\nid: DOC-ARCH-PATTERNS\ntitle: \"Diagnóstico AS-IS de Arquitectura, Flujos de Datos y Catálogo de Patrones\"\nmodule: \"global\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"architecture-as-is\", \"design-patterns\", \"gof\", \"screaming-architecture\", \"data-flows\"]\n---\n\n# Diagnóstico AS-IS de Arquitectura, Flujos de Datos y Catálogo de Patrones\n\n> [!NOTE]\n> Diagnóstico forense de la arquitectura real implementada en el repositorio, dirección de dependencias, flujos de datos paso a paso y matriz de patrones de diseño verificados en el código fuente.\n\n---\n\n## 1. Diagnóstico del Estilo Arquitectónico Implementado (AS-IS)\n\n### 1.1 Organización por Screaming Architecture\nEl repositorio implementa una **Arquitectura que Grita su Propósito (Screaming Architecture)**. El código no está organizado por capas genéricas superficiales (`controllers/`, `views/`), sino que separa claramente el motor del arnés, las configuraciones de agentes y los slices de dominio de la aplicación:\n\n```text\nharness_anginnering/\n├── .agents/             # Dominio: Orquestación Antigravity 2.0 (Reglas, Roles y Skills)\n├── .github/             # Dominio: Espejo GitHub Copilot (Instructions y Skills)\n├── .opencode/           # Dominio: Fuente Canónica OpenCode (Rules y Skills fuente de verdad)\n├── project-docs/        # Aplicación: Tablero de Seguimiento Interactivo & Docs-as-Code\n│   ├── src/             # Frontend Modular en Vanilla JS + Tailwind v4\n│   │   ├── core/        # Núcleo técnico (api, detector, router, store)\n│   │   ├── features/    # Vertical Slices del Dominio (stats, current-spec, knowledge-base, etc.)\n│   │   └── shared/      # Componentes UI reutilizables (Badge, Button, Icons, MarkdownViewer)\n│   ├── knowledge/       # Base de Conocimiento Soberana (Docs-as-Code)\n│   └── dist/            # Bundle autocontenido IIFE (app.bundle.js)\n└── tests/               # Suite de Verificación en 8 Niveles (Unit, E2E, Whitebox, Blackbox, System, Load, Acceptance)\n```\n\n### 1.2 Topología Macro y Dualidad Offline-First\n- **Modo Servidor Local HTTP**: Servidor nativo de Node.js (`project-docs/serve.js`) en puerto dinámico con cabeceras CORS permisivas, compresión y entrega estática.\n- **Modo Offline-First Puro (`file:///`)**: Invariante `BR-DASH-001`. El tablero web puede abrirse con doble clic directamente en el navegador sin servidor web ni conexión a internet, alimentado por el módulo de respaldo `project-docs/data-fallback.js` sincronizado automáticamente por `sync-data.js`.\n\n---\n\n## 2. Catálogo Forense de Patrones de Diseño Detectados\n\n| Patrón de Diseño | Categoría | Archivo / Componente | Propósito y Problema que Resuelve en el Arnés |\n|---|---|---|---|\n| **Reactive Store (Pub/Sub)** | Comportamiento | `project-docs/src/core/store.js` | Mantiene el estado inmutable del tablero y notifica reactivamente a los componentes suscritos ante cambios. |\n| **Fallback Data Cache** | Resiliencia / Datos | `project-docs/src/core/api.js` y `data-fallback.js` | Garantiza funcionamiento 100% offline y silencia errores CORS cuando el navegador ejecuta bajo protocolo `file:///`. |\n| **Triple Mirror Sync** | Arquitectónico | `.opencode/rules/skills-sync.md` y `sync-skills` | Mantiene una única fuente de verdad canónica (`.opencode/`) y replica unidireccionalmente hacia Copilot y Antigravity. |\n| **Dual Editor Mode** | UI / Interacción | `project-docs/src/shared/MarkdownViewer.js` | Permite alternar bidireccionalmente entre edición Markdown textual y bloques visuales interactivos con scroll sincronizado. |\n| **Component Factory / Renderer** | Creacional | `project-docs/src/shared/` (`Badge.js`, `Button.js`, `Icons.js`, `MermaidViewer.js`) | Genera elementos HTML vectoriales estándar con parametrización de estilos y sin dependencias de frameworks externos. |\n| **Asynchronous Retry Guard** | Resiliencia | `project-docs/src/main.js` (`initMermaidDiagrams`) | Reintenta de forma controlada la inicialización de librerías CDN (Mermaid) para evitar diagramas en blanco si la carga tarda milisegundos. |\n| **Separation of Concerns (SoC)** | Arquitectónico | `.agents/agents/` | Separa la especificación (`spec-author`), implementación (`implementer`) y revisión imparcial (`reviewer`) sin permitir edición cruzada. |\n\n---\n\n## 3. Flujos de Datos Extremo a Extremo (Data Flows)\n\n### 3.1 Flujo 1: Sincronización y Carga de Datos en el Tablero\n```text\n1. Agente o Desarrollador modifica specs, reglas o feature_list.json\n2. Ejecución de `node project-docs/sync-data.js`\n3. `sync-data.js` lee archivos markdown, extrae metadatos, tiempo de lectura y diagramas Mermaid\n4. Genera `project-docs/data-fallback.js` y actualiza `project-docs/dist/app.bundle.js`\n5. Al abrir `index.html`:\n   - Si es HTTP: `api.js` realiza fetch con cache-buster hacia los JSON\n   - Si es file:///: `api.js` lee instantáneamente `window.__FALLBACK_DATA__` sin red\n6. `store.js` recibe el payload, actualiza su estado interno y dispara re-render en las vistas activas\n```\n\n### 3.2 Flujo 2: Ciclo de Vida SDD Multi-Agente\n```text\n1. Usuario solicita nueva feature o bugfix\n2. Subagente `leader` valida entorno y crea rama `{type}/INT-{id}/{name}` (≤80c)\n3. Subagente `spec-author` redacta requirements.md, design.md y tasks.md\n4. Puerta Humana obligatoria: `ask_question` congela ejecución hasta aprobación 100%\n5. Subagente `implementer` escribe código de producción y tests automatizados\n6. Subagente `reviewer` audita build, tests, cobertura y trazabilidad (sin editar código)\n7. Puerta Humana de cierre: `ask_question` consulta si fusionar a rama base\n```\n",
    "04-domain-ddd-and-crc.md": "---\nid: DOC-DDD-CRC\ntitle: \"Modelo de Dominio DDD, Lenguaje Ubicuo y Tarjetas CRC\"\nmodule: \"global\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"ddd\", \"ubiquitous-language\", \"context-map\", \"crc-cards\", \"strategic-ddd\"]\n---\n\n# Modelo de Dominio DDD, Lenguaje Ubicuo y Tarjetas CRC\n\n> [!NOTE]\n> Especificación formal del diseño guiado por el dominio (DDD Estratégico y Táctico), mapa de contextos y catálogo de Tarjetas CRC (*Class-Responsibility-Collaborator*).\n\n---\n\n## 1. Clasificación de Subdominios (DDD Estratégico)\n\n1. **Core Domain (Dominio Central)**:\n   - **`agent-orchestrator`**: Orquestación del ciclo de vida SDD, ciclo de subagentes especializados, cumplimiento estricto de convenciones de branching y puertas humanas con `ask_question`.\n2. **Supporting Subdomains (Subdominios de Soporte)**:\n   - **`triple-sync-engine`**: Motor de sincronización triple y garantía de paridad entre OpenCode, Copilot y Antigravity.\n   - **`knowledge-engine`**: Motor de ingesta y preservación de contexto soberano Docs-as-Code anti-sesgo.\n   - **`dashboard-visualizer`**: Tablero interactivo, lector editorial, editor dual ContextForge y visualizador 3D.\n   - **`testing-qa-suite`**: Automatización del arnés de verificación en 8 niveles y runner de `verify.sh`.\n3. **Generic Subdomains (Subdominios Genéricos)**:\n   - Control de versiones (Git), motor de renderizado Markdown y Three.js.\n\n---\n\n## 2. Diccionario de Lenguaje Ubicuo (Ubiquitous Language)\n\n| Término Ubicuo | Definición Funcional y Técnica | Equivalente en Código / Artefactos |\n|---|---|---|\n| **Harness (Arnés)** | Conjunto de reglas, scripts, skills y roles que guían y restringen a los agentes de IA. | `.agents/`, `.opencode/`, `.github/`, `verify.sh` |\n| **Spec-Driven Development (SDD)** | Metodología donde ninguna línea de código se escribe antes de aprobar formalmente su spec. | `specs/{NNN}_{name}/`, `generate-spec` |\n| **Human Gate (Puerta Humana)** | Pausa obligatoria del flujo que bloquea la ejecución del agente hasta confirmación del humano. | Herramienta nativa `ask_question` |\n| **Rama INT-*** | Rama de trabajo dedicada que cumple `{feature\\|bugfix}/INT-{numero}/{nombre}` $\\le 80$ caracteres. | Convención en `AGENTS.md` y `branches.md` |\n| **Docs-as-Code** | Práctica de gestionar la documentación en Markdown versionado junto al código fuente. | `project-docs/knowledge/**` |\n| **Triple Sincronización** | Replicación unidireccional obligatoria desde `.opencode/` hacia Copilot y Antigravity. | `sync-skills` y `skills-sync.md` |\n| **Fallback Data** | Objeto embebido en JS que permite abrir el tablero vía `file:///` sin servidores ni CORS. | `project-docs/data-fallback.js` |\n\n---\n\n## 3. Catálogo Maestro de Tarjetas CRC (Class-Responsibility-Collaborator)\n\n### Tarjeta CRC 1: `LeaderAgent`\n- **Estereotipo DDD**: `<<AgentOrchestrator>>`\n- **Responsabilidades**:\n  1. Validar entorno de trabajo y rama base (`main`, `master`, `dev`).\n  2. Crear la rama de trabajo `{feature|bugfix}/INT-{numero}/{nombre_rama}` ($\\le 80$ caracteres).\n  3. Delegar tareas secuenciales en subagentes (`spec-author`, `implementer`, `reviewer`).\n  4. Detener el flujo y solicitar aprobación humana mediante `ask_question`.\n- **Colaboradores**: `GitCLI`, `SpecAuthorAgent`, `ImplementerAgent`, `ReviewerAgent`, `AskQuestionModal`.\n\n### Tarjeta CRC 2: `SpecAuthorAgent`\n- **Estereotipo DDD**: `<<RequirementsEngineer>>`\n- **Responsabilidades**:\n  1. Redactar especificaciones técnicas (`requirements.md`, `design.md`, `tasks.md`).\n  2. Aplicar sintaxis formal de requerimientos EARS e IEEE 830.\n  3. Recomendar técnica de implementación (TDD, SDD o FTD).\n  4. Marcar la tarea como `spec_ready` sin tocar código fuente ni tests.\n- **Colaboradores**: `KnowledgeIndex`, `FeatureList`, `LeaderAgent`.\n\n### Tarjeta CRC 3: `ImplementerAgent`\n- **Estereotipo DDD**: `<<SoftwareDeveloper>>`\n- **Responsabilidades**:\n  1. Implementar código de producción siguiendo la técnica aprobada.\n  2. Escribir tests unitarios y de integración según la convención del stack.\n  3. Ejecutar verificaciones automatizadas (`npm test`, `verify.sh`).\n  4. Registrar la trazabilidad bidireccional $R \\leftrightarrow Tests$ en `progress/impl_{name}.md`.\n- **Colaboradores**: `ProjectSpec`, `TestRunner`, `LeaderAgent`, `ReviewerAgent`.\n\n### Tarjeta CRC 4: `ReviewerAgent`\n- **Estereotipo DDD**: `<<QualityAuditor>>`\n- **Responsabilidades**:\n  1. Auditar de forma imparcial el cumplimiento del 100% de los criterios del spec.\n  2. Verificar cobertura de código, compilación y ausencia de errores de arquitectura.\n  3. Emitir reporte de aprobación o hallazgos sin editar código bajo ninguna circunstancia.\n- **Colaboradores**: `ProjectSpec`, `TasksList`, `LeaderAgent`.\n\n### Tarjeta CRC 5: `KnowledgeEngine`\n- **Estereotipo DDD**: `<<KnowledgeRepository>>`\n- **Responsabilidades**:\n  1. Escanear el código fuente y extraer modelos C4, UML, ERD y reglas `BR-*`.\n  2. Generar y mantener la base de conocimiento en `project-docs/knowledge/`.\n  3. Compilar el archivo maestro unificado `MASTER-PROJECT-KNOWLEDGE.md`.\n  4. Actualizar el grafo de relaciones en `knowledge-index.json`.\n- **Colaboradores**: `SyncDataScript`, `DashboardStore`, `MarkdownParser`.\n",
    "adr-catalog.md": "# Catálogo de Decisiones de Arquitectura (ADR Catalog)\r\n\r\n> [!NOTE]\r\n> Registro canónico de Decisiones de Arquitectura (ADR) según el formato Michael Nygard. Documenta el qué, el por qué y las consecuencias técnicas asumidas para evitar refactorizaciones regresivas por parte de agentes de IA.\r\n\r\n---\r\n\r\n## ADR-001: Desacoplamiento Universal de Subagentes (Multi-Stack Agnostic)\r\n- **Fecha**: 2026-11-02\r\n- **Estado**: Aceptado\r\n- **Contexto**: Anteriormente los subagentes `implementer` y `reviewer` ejecutaban comandos fijos de `.NET` (`dotnet build /warnaserror`), fallando en repositorios políglotas o basados en Node.js, Python o Go.\r\n- **Decisión**: Los subagentes inspeccionan dinámicamente el bloque `checks` de `project-spec.yaml` para obtener los comandos específicos de compilación y pruebas del proyecto objetivo.\r\n- **Consecuencias**: El arnés opera de manera transparente sobre cualquier stack tecnológico preservando la misma disciplina SDD.\r\n\r\n---\r\n\r\n## ADR-002: Sincronización Triple de Skills con Fuente de Verdad Única\r\n- **Fecha**: 2026-11-01\r\n- **Estado**: Aceptado\r\n- **Contexto**: El desarrollo asistido por IA ocurre a menudo en múltiples plataformas (Google Antigravity, OpenCode, GitHub Copilot). Mantener skills dispersas producía drift funcional.\r\n- **Decisión**: Establecer `.opencode/skills/` como la única fuente canónica y generar espejos automáticos en `.github/skills/` y `.agents/skills/` mediante la skill `/sync-skills`.\r\n- **Consecuencias**: Paridad total de capacidades en las tres herramientas sin duplicación manual.\r\n\r\n---\r\n\r\n## ADR-003: Pruebas Automatizadas Nativas con Node.js Test Runner\r\n- **Fecha**: 2026-11-02\r\n- **Estado**: Aceptado\r\n- **Contexto**: El arnés requería pruebas automatizadas para sus serializadores y sincronizadores, pero añadir frameworks pesados como Jest o Mocha introducía sobrecarga de instalación y dependencias vulnerables.\r\n- **Decisión**: Utilizar el ejecutor nativo `node --test` integrado en Node.js v18+.\r\n- **Consecuencias**: Tiempos de ejecución inferiores a 200ms con cero dependencias externas en tiempo de ejecución.\r\n\r\n---\r\n\r\n## ADR-004: Arquitectura Screaming & Tailwind CSS v4 en el Tablero Visual\r\n- **Fecha**: 2026-11-01\r\n- **Estado**: Aceptado\r\n- **Contexto**: La interfaz de seguimiento en `project-docs/` necesitaba ser modular, mantenible y liviana sin depender de frameworks de compilación SPA como React o Angular.\r\n- **Decisión**: Organizar el código bajo Screaming Architecture (`src/features/` por dominio) utilizando Vanilla JS moderno (ES Modules) y Tailwind CSS v4 en el navegador (`@tailwindcss/browser@4`).\r\n- **Consecuencias**: Modularidad limpia, código ligero y soporte nativo para temas claro/oscuro.\r\n\r\n---\r\n\r\n## ADR-005: Editor Dual ContextForge con Scroll Sincronizado Proporcional\r\n- **Fecha**: 2026-11-02\r\n- **Estado**: Aceptado\r\n- **Contexto**: Los desarrolladores y arquitectos requerían tanto la velocidad del editor de texto Markdown como la comodidad estructurada de bloques visuales para manipular requerimientos y diagramas.\r\n- **Decisión**: Implementar un conmutador de modo dual (`Modo Markdown` / `Modo Bloques`) con serialización bidireccional instantánea y sincronización de scroll proporcional basada en el ratio de desplazamiento con flags de exclusión mutua.\r\n- **Consecuencias**: Edición fluida sin pérdida de formato ni bloqueos por loops de eventos.\r\n\r\n---\r\n\r\n## ADR-006: Constelación 3D en Jerarquía Piramidal Three.js\r\n- **Fecha**: 2026-11-02\r\n- **Estado**: Aceptado\r\n- **Contexto**: La representación en grafo 3D anterior colocaba los nodos en un único plano caótico, provocando colisión de etiquetas e imposibilidad de comprender la jerarquía del sistema.\r\n- **Decisión**: Distribuir los nodos en 4 niveles arquitectónicos verticales ($Y=+165$ Ápice, $Y=+55$ Core, $Y=-55$ Features, $Y=-165$ Base) con distribución radial armónica y curvas cuadráticas de Bezier.\r\n- **Consecuencias**: Comprensión visual inmediata de la criticidad y dependencias del sistema.\r\n\r\n---\r\n\r\n## ADR-007: Compatibilidad Offline Total (Zero-Server Fallback)\r\n- **Fecha**: 2026-11-01\r\n- **Estado**: Aceptado\r\n- **Contexto**: En entornos restringidos o sin conexión a internet, los navegadores bloquean peticiones `fetch()` locales bajo el protocolo `file:///` por políticas de CORS.\r\n- **Decisión**: Generar automáticamente `project-docs/data-fallback.js` antes de cada compilación para embeber los datos en `window.__FALLBACK_DATA__`.\r\n- **Consecuencias**: El tablero funciona al 100% abriendo directamente `index.html` con doble clic.\r\n",
    "business-rules.md": "# Catálogo Canónico de Reglas de Negocio (Invariantes del Arnés)\r\n\r\n> [!IMPORTANT]\r\n> Invariantes de cumplimiento estricto para desarrolladores y agentes de IA. Ninguna implementación, spec o refactorización puede violar estas reglas.\r\n\r\n---\r\n\r\n## Módulo: agent-orchestrator\r\n\r\n### BR-ORCH-001: Formato y Longitud Estricta de Ramas Git\r\n- **Severidad**: Crítica\r\n- **Fórmula**: `length({type}/INT-{numero}/{nombre_rama}) <= 80`\r\n- **Valores permitidos de type**: Exclusivamente `feature` o `bugfix`.\r\n- **Descripción**: Toda rama de trabajo debe crearse desde la rama base, tener un prefijo `INT-` con número de ticket y no superar 80 caracteres.\r\n- **Comportamiento ante Violación**: La rama es rechazada y el agente debe solicitar corrección al humano.\r\n\r\n### BR-ORCH-002: Puerta Humana Obligatoria para Aprobación de Spec\r\n- **Severidad**: Crítica\r\n- **Descripción**: Queda estrictamente prohibido pasar una tarea a `in_progress` o iniciar implementación sin aprobación explícita del humano mediante la herramienta `ask_question`.\r\n- **Comportamiento ante Violación**: Detención inmediata del ciclo SDD.\r\n\r\n### BR-ORCH-003: Subagente Revisor No Modifica Código\r\n- **Severidad**: Crítica\r\n- **Descripción**: El subagente `reviewer` evalúa de forma independiente e imparcial la trazabilidad, build y tests. Bajo ninguna circunstancia edita código de producción o pruebas.\r\n- **Comportamiento ante Violación**: Se anula el veredicto y se reasigna al `implementer`.\r\n\r\n---\r\n\r\n## Módulo: triple-sync-engine\r\n\r\n### BR-SYNC-001: Fuente de Verdad Inviolable en .opencode/\r\n- **Severidad**: Crítica\r\n- **Descripción**: La carpeta `.opencode/skills/` es la única fuente de verdad para las 18 skills del arnés. Los cambios se propagan de forma unidireccional a `.github/skills/` y `.agents/skills/`.\r\n- **Comportamiento ante Violación**: Cualquier cambio aislado en espejos se sobrescribe al sincronizar.\r\n\r\n### BR-SYNC-002: Paridad Estricta de Frontmatter\r\n- **Severidad**: Alta\r\n- **Descripción**: Todo archivo `SKILL.md` debe contener exactamente el mismo bloque YAML `name` y `description` en las tres plataformas.\r\n- **Comportamiento ante Violación**: Reporte de inconsistencia en `/sync-skills`.\r\n\r\n---\r\n\r\n## Módulo: knowledge-engine\r\n\r\n### BR-KNOW-001: Sintaxis Mermaid Ultra-Estricta\r\n- **Severidad**: Crítica\r\n- **Descripción**: Para garantizar que los diagramas se rendericen sin errores en cualquier parser web o visor markdown, todo ID de nodo debe ser estrictamente alfanumérico sin guiones (`nodeAuth`) y todo texto descriptivo debe estar entre comillas dobles (`[\"Texto seguro\"]`).\r\n- **Comportamiento ante Violación**: Diagrama marcado como inválido en tiempo de validación.\r\n\r\n### BR-KNOW-002: Consulta Obligatoria Anti-Sesgo de la Base de Conocimiento\r\n- **Severidad**: Crítica\r\n- **Descripción**: Antes de proponer nuevas historias, redactar requerimientos o implementar código, los agentes DEBEN consultar `project-docs/knowledge/` para evitar reinventar capacidades o violar directrices.\r\n- **Comportamiento ante Violación**: Prohibición estricta de alucinar librerías externas o duplicar endpoints.\r\n\r\n---\r\n\r\n## Módulo: dashboard-visualizer\r\n\r\n### BR-DASH-001: Compatibilidad Offline Total (Protocolo file:///)\r\n- **Severidad**: Crítica\r\n- **Descripción**: El visor en `project-docs/index.html` debe ser 100% navegable con doble clic directo sin servidor local mediante la carga inmediata de `data-fallback.js`.\r\n- **Comportamiento ante Violación**: El script `sync-data.js` actualiza automáticamente el fallback tras cada compilación.\r\n\r\n### BR-DASH-002: Scroll Sincronizado Proporcional Anti-Bloqueo\r\n- **Severidad**: Alta\r\n- **Descripción**: La sincronización de scroll entre el editor Markdown y la vista previa utiliza flags de exclusión mutua para impedir bucles infinitos de eventos de scroll.\r\n- **Comportamiento ante Violación**: Desactivación temporal del listener para restaurar fluidez.\r\n\r\n---\r\n\r\n## Módulo: testing-qa-suite\r\n\r\n### BR-TEST-001: 100% de Tests en Verde para Cierre de Spec\r\n- **Severidad**: Crítica\r\n- **Descripción**: Ninguna feature o bugfix puede cerrarse como `done` si existe un solo test fallando en la suite de pruebas del proyecto.\r\n- **Comportamiento ante Violación**: `verify-spec` rechaza el cierre y exige corrección.\r\n\r\n### BR-TEST-002: Ejecutor de Pruebas Nativo sin Bloat\r\n- **Severidad**: Alta\r\n- **Descripción**: Las pruebas unitarias del arnés se ejecutan mediante `node --test` para asegurar tiempos de respuesta inferiores a 500ms y cero dependencias externas en testing.\r\n- **Comportamiento ante Violación**: Se rechaza la inclusión de dependencias redundantes.\r\n",
    "c4-model.md": "# Modelo C4 — AI Agentic SDD Engineering Harness\r\n\r\n> [!NOTE]\r\n> Arquitectura de Sistema, Contenedores y Componentes del Arnés de Ingeniería Dirigida por Especificaciones (SDD).\r\n\r\n---\r\n\r\n## Nivel 1: Diagrama de Contexto del Sistema (C1)\r\n\r\nMuestra los límites del arnés, los actores principales y los sistemas externos con los que interactúa:\r\n\r\n```mermaid\r\nflowchart TD\r\n  userDeveloper[\"Desarrollador / Ingeniero de Software\"]\r\n  agentLeader[\"Agente Principal (Leader)\"]\r\n  harnessSystem[\"AI Agentic SDD Engineering Harness\"]\r\n  gitSystem[\"Sistema de Control de Versiones (Git / GitHub)\"]\r\n  browserUser[\"Navegador Web (Dashboard / Tablero Visual)\"]\r\n\r\n  userDeveloper -->|\"Define requerimientos y aprueba specs\"| harnessSystem\r\n  agentLeader -->|\"Orquesta tareas e invoca subagentes\"| harnessSystem\r\n  harnessSystem -->|\"Crea ramas INT-* y commits semánticos\"| gitSystem\r\n  harnessSystem -->|\"Genera y sincroniza datos en tiempo real\"| browserUser\r\n  browserUser -->|\"Permite lectura editorial y edición dual\"| userDeveloper\r\n```\r\n\r\n---\r\n\r\n## Nivel 2: Diagrama de Contenedores (C2)\r\n\r\nDescompone el arnés en sus subsistemas y aplicaciones principales:\r\n\r\n```mermaid\r\nflowchart TD\r\n  subgraph HarnessContainers[\"Contenedores del Arnés SDD\"]\r\n    containerOrchestrator[\"Orquestador Multi-Agente<br/>(Leader, Spec-Author, Implementer, Reviewer)\"]\r\n    containerTripleSync[\"Motor de Sincronización Triple<br/>(.opencode / .github / .agents)\"]\r\n    containerKnowledge[\"Motor de Base de Conocimiento<br/>(Docs-as-Code, C4, UML, BR-*, ADRs)\"]\r\n    containerDashboard[\"Tablero de Seguimiento Interactivo<br/>(Tailwind v4, Three.js, Editor Dual)\"]\r\n    containerTestRunner[\"Suite de Pruebas Automatizadas<br/>(Node.js Test Runner, Smoke Tests)\"]\r\n  end\r\n\r\n  gitRepo[\"Repositorio Git Local\"]\r\n  userView[\"Navegador (file:/// o HTTP)\"]\r\n\r\n  containerOrchestrator -->|\"Escribe specs y código\"| gitRepo\r\n  containerTripleSync -->|\"Mantiene paridad de 18 skills\"| containerOrchestrator\r\n  containerKnowledge -->|\"Alimenta contexto anti-sesgo\"| containerOrchestrator\r\n  containerDashboard -->|\"Lee metadatos de specs y progreso\"| gitRepo\r\n  containerDashboard -->|\"Renderiza vistas interactivas\"| userView\r\n  containerTestRunner -->|\"Verifica build, tests y convenciones\"| containerOrchestrator\r\n```\r\n\r\n---\r\n\r\n## Nivel 3: Diagrama de Componentes del Tablero Web (C3)\r\n\r\nDesglose interno de la aplicación web en `project-docs/`:\r\n\r\n```mermaid\r\nflowchart LR\r\n  subgraph DashboardComponents[\"project-docs/src/\"]\r\n    compRouter[\"Enrutador por Pestañas<br/>(router.js)\"]\r\n    compStore[\"Store Reactivo Central<br/>(store.js)\"]\r\n    compDetector[\"Detector de Entorno & Agente<br/>(detector.js)\"]\r\n    compMarkdown[\"Lector Editorial & Parser Bloques<br/>(MarkdownViewer.js)\"]\r\n    compThree[\"Constelación 3D Piramidal<br/>(SpaceView3D.js)\"]\r\n    compMermaid[\"Visor & Editor Draw.io<br/>(MermaidViewer.js)\"]\r\n    compOmnibox[\"Buscador Global Ctrl+K<br/>(Omnibox Modal)\"]\r\n  end\r\n\r\n  compRouter --> compStore\r\n  compDetector --> compStore\r\n  compStore --> compMarkdown\r\n  compStore --> compThree\r\n  compStore --> compMermaid\r\n  compStore --> compOmnibox\r\n```\r\n",
    "coding-standards.md": "# Estándares de Codificación & Guardrails Anti-Sesgo\r\n\r\n> [!IMPORTANT]\r\n> Directrices obligatorias para desarrolladores y agentes de IA. Diseñadas para eliminar el sesgo algorítmico, prevenir alucinaciones de paquetes y mantener una arquitectura limpia.\r\n\r\n---\r\n\r\n## 1. Convenciones de Nomenclatura y Control de Versiones\r\n\r\n- **Ramas Git**:\r\n  - Exclusivamente dos tipos: `feature` y `bugfix`.\r\n  - Estructura obligatoria: `{type}/INT-{numero}/{nombre_rama_de_lo_realizado}`.\r\n  - Longitud máxima estricta: **80 caracteres**.\r\n  - Ejemplo: `feature/INT-001/refactor_harness_architecture`.\r\n- **Commits Semánticos**:\r\n  - Formato: `feat(scope): descripción` o `fix(scope): descripción`.\r\n  - Tipos válidos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.\r\n  - Idioma: Inglés para commits y código fuente; español para documentación técnica y comentarios explicativos.\r\n\r\n---\r\n\r\n## 2. Guardrails Anti-Alucinación (Inviolables para Agentes de IA)\r\n\r\n1. **Prohibición de Librerías Fantasma**: Los agentes tienen estrictamente prohibido sugerir, instalar o importar paquetes o librerías que no figuren en `package.json` o `project-spec.yaml`.\r\n2. **Invariante de Conocimiento Previo**: Antes de implementar una solución, el agente debe verificar si ya existe una función, componente o regla en `project-docs/knowledge/`.\r\n3. **Respeto a las Reglas de Negocio (BR-*)**: Ningún código puede modificar o relajar una regla de negocio sin una actualización previa y aprobada de la especificación.\r\n4. **Cero Código Muerto**: Prohibido dejar código comentado, banderas de depuración (`console.log`, `debugger`) o secretos hardcodeados.\r\n\r\n---\r\n\r\n## 3. Arquitectura del Código Frontend (`project-docs/src/`)\r\n\r\n- **Vanilla JS Modular**: Usar ES Modules puros (`import` / `export`) organizados por dominios en `src/features/`.\r\n- **Separación de Responsabilidades**: Las funciones de renderizado devuelven cadenas HTML puras; los controladores de eventos se enlazan mediante selectores o `data-action`.\r\n- **Inmutabilidad en el Store**: El estado global (`store.js`) se actualiza mediante acciones atómicas notificando a los suscriptores.\r\n",
    "data-dictionary.md": "# Diccionario de Datos & Persistencia Docs-as-Code\r\n\r\n> [!NOTE]\r\n> Especificación formal de los esquemas de persistencia JSON y YAML del arnés de ingeniería SDD.\r\n\r\n---\r\n\r\n## 1. Diagrama Entidad-Relación (ERD) del Arnés\r\n\r\n```mermaid\r\nerDiagram\r\n  PROJECT ||--o{ FEATURE : \"contiene\"\r\n  PROJECT ||--|| PROJECT_SPEC : \"especificado por\"\r\n  FEATURE ||--|{ ACCEPTANCE_CRITERIA : \"valida con\"\r\n  FEATURE ||--o{ TASK : \"descompone en\"\r\n  FEATURE ||--o{ BUSINESS_RULE : \"satisface\"\r\n  KNOWLEDGE_INDEX ||--o{ DOCUMENT : \"cataloga\"\r\n  DOCUMENT ||--o{ SHELF : \"pertenece a\"\r\n  DOCUMENT ||--o{ BUSINESS_RULE : \"documenta\"\r\n\r\n  PROJECT {\r\n    string name PK\r\n    string description\r\n    string version\r\n    string tech_stack\r\n    string runtime\r\n  }\r\n\r\n  FEATURE {\r\n    int id PK\r\n    string type\r\n    string name\r\n    string title\r\n    string module\r\n    string priority\r\n    string branch\r\n    string status\r\n  }\r\n\r\n  TASK {\r\n    string id PK\r\n    string title\r\n    bool done\r\n  }\r\n\r\n  BUSINESS_RULE {\r\n    string id PK\r\n    string module\r\n    string severity\r\n    string title\r\n    string description\r\n  }\r\n\r\n  DOCUMENT {\r\n    string key PK\r\n    string filename\r\n    string title\r\n    string shelf\r\n    int readingTime\r\n    int wordCount\r\n    int ruleCount\r\n  }\r\n```\r\n\r\n---\r\n\r\n## 2. Catálogo de Esquemas JSON / YAML\r\n\r\n### 2.1 `project-spec.yaml` (Especificación Técnica del Proyecto)\r\n- `project.name`: Nombre canónico del sistema.\r\n- `project.type`: Tipo de arquitectura (`universal-agentic-harness`, `web-api`, `microservices`).\r\n- `runtime.language`: Lenguaje de programación principal.\r\n- `modules[]`: Colección de módulos con `id`, `name`, `tech`, `features`.\r\n- `checks.build`: Comando de compilación (`npm run build`, `dotnet build`, etc.).\r\n- `checks.test`: Comando de pruebas (`npm test`, `pytest`, `dotnet test`).\r\n- `checks.verify`: Comando de verificación integral (`node project-docs/sync-data.js`).\r\n\r\n### 2.2 `feature_list.json` (Backlog Canónico de Tareas)\r\n- `features[].id`: Número secuencial único (`INT-001`).\r\n- `features[].type`: `feature` o `bugfix`.\r\n- `features[].name`: Identificador en `snake_case` descriptivo.\r\n- `features[].branch`: Rama Git `{type}/INT-{id}/{name}` ($\\le 80$ caracteres).\r\n- `features[].status`: `pending` | `spec_ready` | `in_progress` | `done` | `blocked`.\r\n- `features[].acceptance`: Lista de criterios de aceptación verificables.\r\n\r\n### 2.3 `knowledge-index.json` (Índice de la Base de Conocimiento)\r\n- `docs{}`: Mapa de clave de archivo a contenido Markdown completo.\r\n- `docMetadata{}`: Metadatos calculados (`readingTime`, `wordCount`, `ruleCount`, `reqCount`, `adrCount`, `shelf`).\r\n- `shelves{}`: Clasificación en 6 estantes temáticos (`architecture`, `business_rules`, `requirements`, `adrs`, `standards`, `modules`).\r\n- `business_rules[]`: Catálogo estructurado de invariantes con `id`, `module`, `severity`, `title`, `description`.\r\n- `coding_standards`: Guardrails anti-sesgo y directrices de nombrado.\r\n",
    "external-services.md": "# Catálogo de Integraciones y Servicios Externos\r\n\r\n> [!NOTE]\r\n> Matriz de servicios adyacentes, protocolos de comunicación, variables de configuración y políticas de contingencia del arnés de ingeniería.\r\n\r\n---\r\n\r\n## Matriz de Servicios y Dependencias\r\n\r\n| Servicio / Herramienta | Tipo | Protocolo | Variables Requeridas | Política de Contingencia / Failover |\r\n| :--- | :--- | :--- | :--- | :--- |\r\n| **Google Antigravity** | Agentic IDE & CLI | Native Subagent Protocol / IPC | N/A (Entorno IDE) | Operar mediante CLI estándar o shell local |\r\n| **OpenCode** | CLI Engine | CLI Exec / Local JSON | N/A | Lectura directa de `.opencode/rules/` |\r\n| **GitHub Copilot** | AI Assistant | Instructions / Markdown | N/A | Carga desde `.github/instructions/` |\r\n| **Git / GitHub** | Control de Versiones | CLI Git / HTTPS / SSH | `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL` | Modo local desconectado en rama `{type}/INT-*` |\r\n| **Tailwind CSS v4** | CSS Runtime | CDN `@tailwindcss/browser@4` | N/A | Estilos base incrustados en `<style>` |\r\n| **Three.js** | 3D Graphics Engine | CDN `three.min.js r128` | N/A | Vista alternativa en Árbol SVG y Grafo DAG |\r\n| **Mermaid.js** | Diagram Engine | CDN `mermaid.min.js v10` | N/A | Previsualización de código Mermaid con botón de copia |\r\n",
    "functional-requirements.md": "# Especificación de Requerimientos del Sistema (SRS IEEE 830 / ISO 29148)\r\n\r\n> [!NOTE]\r\n> Requerimientos Funcionales (`RF-*`) y Requerimientos No Funcionales (`RNF-*`) bajo clasificación FURPS+ para el Arnés de Ingeniería SDD.\r\n\r\n---\r\n\r\n## 1. Requerimientos Funcionales (`RF-*`)\r\n\r\n### Módulo: agent-orchestrator\r\n- **RF-ORCH-001**: El orquestador DEBE validar que toda rama de trabajo cumpla con la expresión regular `^(feature|bugfix)/INT-\\d{3,4}/[a-z0-9_]+$` y una longitud menor o igual a 80 caracteres.\r\n- **RF-ORCH-002**: El orquestador DEBE invocar de manera aislada al subagente `spec-author` con workspace heredado (`Workspace: \"inherit\"`) para redactar la especificación formal antes de escribir código.\r\n- **RF-ORCH-003**: El orquestador DEBE pausar la ejecución mediante `ask_question` para solicitar aprobación humana del spec generado antes de permitir el inicio de la fase de implementación.\r\n- **RF-ORCH-004**: Al concluir la implementación, el orquestador DEBE invocar de forma independiente al subagente `reviewer` para emitir veredicto formal de calidad y trazabilidad.\r\n\r\n### Módulo: triple-sync-engine\r\n- **RF-SYNC-001**: El motor DEBE comparar el árbol de skills en `.opencode/skills/` contra `.github/skills/` y `.agents/skills/` para identificar diferencias de contenido o metadatos.\r\n- **RF-SYNC-002**: La skill `/sync-skills` DEBE replicar archivos de forma no destructiva preservando el frontmatter YAML y el formato Markdown.\r\n\r\n### Módulo: knowledge-engine\r\n- **RF-KNOW-001**: La skill `/project-knowledge` DEBE realizar el descubrimiento en 2 fases para evitar desbordamiento de contexto (escaneo topológico previo a inspección de código).\r\n- **RF-KNOW-002**: El generador de diagramas DEBE sanitizar identificadores y textos en sintaxis Mermaid estricta con comillas dobles para evitar fallos del parser en tiempo de ejecución.\r\n\r\n### Módulo: dashboard-visualizer\r\n- **RF-DASH-001**: El tablero DEBE presentar una biblioteca organizada en 6 estantes temáticos con tarjeta Hero destacada y filtros rápidos por categoría.\r\n- **RF-DASH-002**: El lector de artículos DEBE renderizar el documento con columna centrada a 780px, interlineado de 1.75em, anclas de encabezados y barra lateral flotante con la Tabla de Contenidos (TOC).\r\n- **RF-DASH-003**: El editor dual DEBE permitir alternar instantáneamente entre modo Markdown split-pane y modo Bloques Visuales ContextForge con scroll sincronizado proporcional y reordenamiento de tarjetas.\r\n- **RF-DASH-004**: El buscador Omnibox DEBE responder al atajo `Ctrl+K` o `Cmd+K` y permitir búsqueda en tiempo real sobre tareas, documentos, reglas e índices.\r\n- **RF-DASH-005**: La vista 3D DEBE estructurar los nodos en 4 niveles piramidales en Three.js con anillos translúcidos y distribución armónica radial sin solapamiento de etiquetas.\r\n\r\n### Módulo: testing-qa-suite\r\n- **RF-TEST-001**: La suite DEBE ejecutar pruebas unitarias automatizadas mediante el ejecutor nativo `node --test` reportando resultados en menos de 500ms.\r\n- **RF-TEST-002**: La suite DEBE incluir pruebas de aceptación tipo smoke para validar la integridad del bundle web y la compatibilidad con el protocolo `file:///`.\r\n\r\n---\r\n\r\n## 2. Requerimientos No Funcionales (`RNF-*`) bajo FURPS+\r\n\r\n### Functionality (Seguridad e Integridad)\r\n- **RNF-SEC-001**: Prohibición estricta de credenciales, tokens de API o connection strings hardcodeados en los archivos de especificación o base de conocimiento.\r\n- **RNF-SEC-002**: Aislamiento estricto de subagentes impidiendo que el subagente `reviewer` modifique código de producción o pruebas.\r\n\r\n### Usability (Experiencia Editorial & Heurísticas)\r\n- **RNF-USAB-001**: Cumplimiento de WCAG AAA en contraste de texto y soporte nativo de modo claro y oscuro sin parpadeo (FOUC).\r\n- **RNF-USAB-002**: Búsqueda con debouncing para no bloquear la digitación del usuario en inputs de búsqueda (180ms - 260ms).\r\n\r\n### Reliability (Confiabilidad & Cero-Server)\r\n- **RNF-RELI-001**: Disponibilidad offline del 100% de la documentación y tablero interactivo mediante `data-fallback.js` sin requerir servidor HTTP ni sufrir bloqueos CORS.\r\n- **RNF-RELI-002**: Gestión adecuada del ciclo de vida en Three.js con limpieza completa de memoria (`mount`/`unmount`) al cambiar de pestaña para prevenir fugas de memoria.\r\n\r\n### Performance (Rendimiento)\r\n- **RNF-PERF-001**: Tiempo de carga inicial del tablero web inferior a 800ms en modo local.\r\n- **RNF-PERF-002**: Ejecución de la suite completa de pruebas unitarias en menos de 500ms.\r\n\r\n### Supportability (Mantenibilidad & Extensibilidad)\r\n- **RNF-SUPP-001**: Arquitectura modular Screaming Architecture en Vanilla JS sin dependencias de frameworks pesados de frontend (React, Vue, Angular) en tiempo de ejecución.\r\n- **RNF-SUPP-002**: Agnóstico al lenguaje: el arnés debe poder auditar e interactuar con proyectos en Node.js, .NET, Python, Go y Rust.\r\n",
    "MASTER-PROJECT-KNOWLEDGE.md": "---\nid: DOC-MASTER-KNOWLEDGE\ntitle: \"Dossier Maestro Consolidado de Ingeniería — AI Agentic SDD Engineering Harness\"\nmodule: \"global\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"master-dossier\", \"single-file-context\", \"sdd\", \"ieee-830\", \"c4-model\", \"uml\", \"ddd\"]\n---\n\n# Dossier Maestro Consolidado de Ingeniería Soberana (MASTER-PROJECT-KNOWLEDGE)\n\n> [!NOTE]\n> Documento unificado y autocontenido que consolida el 100% del conocimiento arquitectónico, de negocio, requerimientos, módulos y diagramas del **AI Agentic SDD Engineering Harness**. Diseñado para lectura continua, auditoría técnica integral e inyección en motores LLM de gran ventana de contexto (NotebookLM, Claude Projects, ChatGPT).\n\n---\n\n## Tabla de Contenidos\n\n1. [Capítulo 1: Visión del Producto, Contexto de Negocio y Stakeholders (IEEE 830)](#capítulo-1-visión-del-producto-contexto-de-negocio-y-stakeholders-ieee-830)\n2. [Capítulo 2: Diagnóstico AS-IS de la Arquitectura, Flujos de Datos y Patrones](#capítulo-2-diagnóstico-as-is-de-la-arquitectura-flujos-de-datos-y-patrones)\n3. [Capítulo 3: Atlas Completo de Diagramas de Arquitectura (C4) y UML 2.5](#capítulo-3-atlas-completo-de-diagramas-de-arquitectura-c4-y-uml-25)\n4. [Capítulo 4: Inventario de Capacidades y Especificación Formal de Requisitos (SRS)](#capítulo-4-inventario-de-capacidades-y-especificación-formal-de-requisitos-srs)\n5. [Capítulo 5: Catálogo Ágil INVEST, Desglose SPIDR y Tareas de Ingeniería (TI-*)](#capítulo-5-catálogo-ágil-invest-desglose-spidr-y-tareas-de-ingeniería-ti-)\n6. [Capítulo 6: Diccionario de Datos, ERD Crow's Foot y Persistencia Híbrida](#capítulo-6-diccionario-de-datos-erd-crows-foot-y-persistencia-híbrida)\n7. [Capítulo 7: Catálogo Maestro de Reglas de Negocio (BR-*), ADRs y Servicios Externos](#capítulo-7-catálogo-maestro-de-reglas-de-negocio-br--adrs-y-servicios-externos)\n8. [Capítulo 8: Enciclopedia de Módulos & Bounded Contexts](#capítulo-8-enciclopedia-de-módulos--bounded-contexts)\n   - [8.1 Módulo: agent-orchestrator](#81-módulo-agent-orchestrator)\n   - [8.2 Módulo: dashboard-visualizer](#82-módulo-dashboard-visualizer)\n   - [8.3 Módulo: knowledge-engine](#83-módulo-knowledge-engine)\n   - [8.4 Módulo: testing-qa-suite](#84-módulo-testing-qa-suite)\n   - [8.5 Módulo: triple-sync-engine](#85-módulo-triple-sync-engine)\n9. [Capítulo 9: Estándares de Código, Guardrails Anti-Sesgo y Matriz de Trazabilidad (RTM)](#capítulo-9-estándares-de-código-guardrails-anti-sesgo-y-matriz-de-trazabilidad-rtm)\n\n---\n\n## Capítulo 1: Visión del Producto, Contexto de Negocio y Stakeholders (IEEE 830)\n\n### 1.1 Declaración Formal de la Visión\n> **PARA** ingenieros de software, arquitectos de soluciones y equipos de desarrollo asistidos por IA,  \n> **QUIENES** experimentan alucinaciones, código desalineado con el dominio y regresiones al usar agentes de programación en bases de código medianas y complejas,  \n> **EL** AI Agentic SDD Engineering Harness,  \n> **QUE ES UN** arnés de ingeniería de software agnóstico basado en Docs-as-Code, orquestación multi-agente y verificación formal en 8 niveles,  \n> **QUE** garantiza una precisión funcional $\\ge 95\\%$ en el código generado por IA mediante un ciclo cerrado y determinista (Especificación EARS $\\to$ Puerta Humana $\\to$ Implementación TDD/SDD $\\to$ Revisión Imparcial $\\to$ Verificación Automatizada), triple sincronización de skills y tablero visual offline.\n\n### 1.2 Alcance del Sistema\n- **Qué HACE**: Orquesta 4 subagentes (`leader`, `spec-author`, `implementer`, `reviewer`), valida ramas git $\\le 80$ caracteres, impone pausas interactivas con `ask_question`, mantiene paridad triple en 18 skills, y provee un tablero interactivo offline-first con editor dual y verificación en 8 niveles.\n- **Qué NO HACE**: No sustituye el criterio de arquitectura humano, no realiza `git push` sin autorización, no edita código en fase de revisión y no acopla el código a un runtime particular.\n\n---\n\n## Capítulo 2: Diagnóstico AS-IS de la Arquitectura, Flujos de Datos y Patrones\n\n### 2.1 Screaming Architecture y Organización\nEl proyecto aplica el principio de **Screaming Architecture**:\n- La raíz separa claramente la orquestación (`.agents/`, `.opencode/`, `.github/`), la interfaz y documentación (`project-docs/`) y el arnés de verificación (`tests/`, `verify.sh`).\n- El frontend en `project-docs/src/` está modularizado por dominio: `core/`, `features/` y `shared/`, compilado en un bundle IIFE (`dist/app.bundle.js`).\n\n### 2.2 Patrones de Diseño Detectados\n1. **Reactive Store (Pub/Sub)**: `store.js` gestiona el estado y propaga cambios a la vista reactivamente.\n2. **Fallback Data Cache**: `api.js` y `data-fallback.js` garantizan funcionamiento offline en protocolo `file:///`.\n3. **Triple Mirror Sync**: `.opencode/skills/` funciona como fuente canónica y sincroniza unidireccionalmente a `.github/` y `.agents/`.\n4. **Dual Editor Mode**: `MarkdownViewer.js` soporta edición textual de Markdown y manipulación visual por bloques con scroll sincronizado.\n\n---\n\n## Capítulo 3: Atlas Completo de Diagramas de Arquitectura (C4) y UML 2.5\n\n### 3.1 Modelo C4 — Contexto de Sistema (C1)\n```mermaid\nflowchart TD\n  userDev[\"Desarrollador / Ingeniero de Software\"]\n  agentLeader[\"Agente Principal (Leader)\"]\n  harnessSystem[\"AI Agentic SDD Engineering Harness\"]\n  gitSystem[\"Control de Versiones (Git Local / GitHub)\"]\n  browserUser[\"Navegador Web (Dashboard / Tablero Visual)\"]\n\n  userDev -->|\"Define requerimientos y aprueba specs\"| harnessSystem\n  agentLeader -->|\"Orquesta tareas e invoca subagentes\"| harnessSystem\n  harnessSystem -->|\"Crea ramas INT-* y commits semánticos\"| gitSystem\n  harnessSystem -->|\"Genera y sincroniza datos en tiempo real\"| browserUser\n  browserUser -->|\"Permite lectura editorial y edición dual\"| userDev\n```\n\n### 3.2 Modelo C4 — Contenedores del Arnés (C2)\n```mermaid\nflowchart TD\n  subgraph HarnessContainers[\"Contenedores del Arnés SDD\"]\n    containerOrchestrator[\"Orquestador Multi-Agente<br/>(Leader, Spec, Impl, Review)\"]\n    containerTripleSync[\"Motor de Sincronización Triple<br/>(.opencode / .github / .agents)\"]\n    containerKnowledge[\"Motor de Base de Conocimiento<br/>(Docs-as-Code, C4, UML, BR-*)\"]\n    containerDashboard[\"Tablero de Seguimiento Interactivo<br/>(Tailwind v4, Three.js, Editor Dual)\"]\n    containerTestRunner[\"Suite de Pruebas Automatizadas<br/>(Node.js Test Runner, Playwright)\"]\n  end\n\n  gitRepo[\"Repositorio Git Local\"]\n  userView[\"Navegador (file:/// o HTTP)\"]\n\n  containerOrchestrator -->|\"Escribe specs y código\"| gitRepo\n  containerTripleSync -->|\"Mantiene paridad de 18 skills\"| containerOrchestrator\n  containerKnowledge -->|\"Alimenta contexto anti-sesgo\"| containerOrchestrator\n  containerDashboard -->|\"Lee metadatos de specs y progreso\"| gitRepo\n  containerDashboard -->|\"Renderiza vistas interactivas\"| userView\n  containerTestRunner -->|\"Verifica build, tests y convenciones\"| containerOrchestrator\n```\n\n### 3.3 Modelo C4 — Componentes del Tablero Web (C3)\n```mermaid\nflowchart LR\n  subgraph DashboardComponents[\"project-docs/src/\"]\n    compRouter[\"Enrutador por Pestañas (router.js)\"]\n    compStore[\"Store Reactivo Central (store.js)\"]\n    compDetector[\"Detector de Entorno & Agente (detector.js)\"]\n    compMarkdown[\"Lector Editorial & Parser Bloques (MarkdownViewer.js)\"]\n    compThree[\"Constelación 3D Piramidal (SpaceView3D.js)\"]\n    compMermaid[\"Visor & Editor Draw.io (MermaidViewer.js)\"]\n    compOmnibox[\"Buscador Global Ctrl+K (Omnibox Modal)\"]\n  end\n\n  compRouter --> compStore\n  compDetector --> compStore\n  compStore --> compMarkdown\n  compStore --> compThree\n  compStore --> compMermaid\n  compStore --> compOmnibox\n```\n\n---\n\n## Capítulo 4: Inventario de Capacidades y Especificación Formal de Requisitos (SRS)\n\n### Requerimientos Funcionales Nucleares\n- **RF-ORCH-001**: Creación y validación de ramas `{type}/INT-{id}/{name}` con longitud $\\le 80$ caracteres.\n- **RF-ORCH-002**: Puerta humana obligatoria con `ask_question` previa a la implementación.\n- **RF-DASH-001**: Operación offline nativa en protocolo `file:///` con carga instantánea de fallback.\n- **RF-DASH-002**: Editor dual Markdown/Bloques con scroll sincronizado.\n- **RF-SYNC-001**: Sincronización unidireccional de 18 skills desde `.opencode/`.\n- **RF-TEST-001**: Verificación integral en 8 niveles mediante `verify.sh`.\n\n---\n\n## Capítulo 5: Catálogo Ágil INVEST, Desglose SPIDR y Tareas de Ingeniería (TI-*)\n\n### Historias de Usuario Principales\n1. **HU-ORCH-01**: Gobernanza de ramas y puertas humanas (3 SP).\n   - `TI-ORCH-01`: Validador regex de nombres de rama y contador $\\le 80$c.\n   - `TI-ORCH-02`: Suite BVA de ramas límite en pruebas de caja negra.\n2. **HU-DASH-01**: Experiencia editorial y editor dual en el tablero (5 SP).\n   - `TI-DASH-01`: Parser bidireccional Markdown $\\leftrightarrow$ Bloques.\n   - `TI-DASH-02`: Detección de protocolo `file:///` en `api.js`.\n3. **HU-SYNC-01**: Homologación triple de skills (2 SP).\n   - `TI-SYNC-01`: Script verificador de paridad de frontmatter YAML.\n\n---\n\n## Capítulo 6: Diccionario de Datos, ERD Crow's Foot y Persistencia Híbrida\n\n### Diagrama Entidad-Relación Global\n```mermaid\nerDiagram\n  PROJECT ||--o{ FEATURE : \"contiene\"\n  PROJECT ||--|| PROJECT_SPEC : \"especificado por\"\n  FEATURE ||--|{ ACCEPTANCE_CRITERIA : \"valida con\"\n  FEATURE ||--o{ TASK : \"descompone en\"\n  FEATURE ||--o{ BUSINESS_RULE : \"satisface\"\n  KNOWLEDGE_INDEX ||--o{ DOCUMENT : \"cataloga\"\n  DOCUMENT ||--o{ SHELF : \"pertenece a\"\n  DOCUMENT ||--o{ BUSINESS_RULE : \"documenta\"\n\n  PROJECT {\n    string name PK\n    string version\n    string runtime\n  }\n\n  FEATURE {\n    int id PK\n    string type\n    string name\n    string branch\n    string status\n  }\n\n  BUSINESS_RULE {\n    string id PK\n    string module\n    string severity\n    string title\n  }\n\n  DOCUMENT {\n    string key PK\n    string title\n    string shelf\n    int wordCount\n  }\n```\n\n---\n\n## Capítulo 7: Catálogo Maestro de Reglas de Negocio (BR-*), ADRs y Servicios Externos\n\n### Invariantes Críticas\n- **BR-ORCH-001**: Ramas Git obligatoriamente `{feature|bugfix}/INT-{numero}/{nombre}` y longitud $\\le 80$ caracteres.\n- **BR-ORCH-002**: Prohibido implementar código sin aprobación del spec al 100% mediante `ask_question`.\n- **BR-ORCH-003**: El subagente `reviewer` audita de forma imparcial y no modifica código.\n- **BR-SYNC-001**: `.opencode/skills/` es la única fuente de verdad; los demás son espejos.\n- **BR-KNOW-001**: Sintaxis Mermaid ultra-estricta (IDs alfanuméricos simples y textos entrecomillados).\n- **BR-KNOW-002**: Consulta obligatoria de `project-docs/knowledge/` antes de codificar.\n- **BR-DASH-001**: Compatibilidad offline nativa en protocolo `file:///`.\n- **BR-DASH-002**: Cero emojis en interfaz y código; solo iconos SVG de `Icons.js`.\n\n---\n\n## Capítulo 8: Enciclopedia de Módulos & Bounded Contexts\n\n### 8.1 Módulo: agent-orchestrator\n- **Propósito**: Orquestación multi-agente, validación de ramas git y gobernanza de puertas humanas.\n- **Artefactos**: `module-spec.md`, `requirements-and-rules.md`, `data-and-transactions.md`, `diagrams.md`, `technical-debt-refactoring.md`.\n\n### 8.2 Módulo: dashboard-visualizer\n- **Propósito**: Tablero web interactivo, métricas KPI, editor dual ContextForge y soporte offline `file:///`.\n- **Artefactos**: `module-spec.md`, `requirements-and-rules.md`, `data-and-transactions.md`, `diagrams.md`, `technical-debt-refactoring.md`.\n\n### 8.3 Módulo: knowledge-engine\n- **Propósito**: Extracción, preservación y estandarización de la base de conocimiento Docs-as-Code.\n- **Artefactos**: `module-spec.md`, `requirements-and-rules.md`, `data-and-transactions.md`, `diagrams.md`, `technical-debt-refactoring.md`.\n\n### 8.4 Módulo: testing-qa-suite\n- **Propósito**: Automatización de pruebas en 8 niveles, runner de `verify.sh` y Playwright E2E.\n- **Artefactos**: `module-spec.md`, `requirements-and-rules.md`, `data-and-transactions.md`, `diagrams.md`, `technical-debt-refactoring.md`.\n\n### 8.5 Módulo: triple-sync-engine\n- **Propósito**: Sincronización triple y paridad absoluta de 18 skills entre OpenCode, Copilot y Antigravity.\n- **Artefactos**: `module-spec.md`, `requirements-and-rules.md`, `data-and-transactions.md`, `diagrams.md`, `technical-debt-refactoring.md`.\n\n---\n\n## Capítulo 9: Estándares de Código, Guardrails Anti-Sesgo y Matriz de Trazabilidad (RTM)\n\n### 9.1 Guardrails Anti-Sesgo para IA\n- **Lista Blanca Autorizada**: Vanilla JS (ES Modules), Tailwind CSS v4 (`@tailwindcss/browser@4`), Three.js (r128), Node.js Test Runner nativo (`node:test`), Playwright (`@playwright/test`), esbuild.\n- **Lista Negra Terminantemente Prohibida**: Frameworks pesados no autorizados (React, Vue o Angular en `project-docs`), librerías de estilos adicionales, emojis unicode en código de producción o commits directos a ramas base sin confirmación.\n\n### 9.2 Matriz de Trazabilidad Bidireccional (RTM)\n| Requerimiento (`RF-*`) | Regla (`BR-*`) | Historia (`HU-*`) | Componente Implementado | Suite de Pruebas | Estado |\n|---|---|---|---|---|---|\n| `RF-ORCH-001` | `BR-ORCH-001` | `HU-ORCH-01` | `.opencode/rules/branches.md` | `tests/unit/branching-rules.test.js`, `tests/blackbox/bva-inputs.test.js` | Cubierto |\n| `RF-ORCH-002` | `BR-ORCH-002` | `HU-ORCH-01` | `.agents/rules/antigravity-harness.md` | Manual con `ask_question` | Cubierto |\n| `RF-DASH-001` | `BR-DASH-001` | `HU-DASH-01` | `project-docs/src/core/api.js` | `tests/system/offline-fallback.test.js` | Cubierto |\n| `RF-DASH-002` | `BR-DASH-001` | `HU-DASH-01` | `project-docs/src/shared/MarkdownViewer.js` | `tests/acceptance/dual-editor.spec.js` | Cubierto |\n| `RF-DASH-003` | `BR-DASH-002` | `HU-DASH-01` | `project-docs/src/shared/Icons.js` | `tests/unit/ui-anti-emoji.test.js` | Cubierto |\n| `RF-SYNC-001` | `BR-SYNC-001` | `HU-SYNC-01` | `.agents/skills/sync-skills/` | `tests/whitebox/sync-pipeline.test.js` | Cubierto |\n| `RF-TEST-001` | `BR-TEST-001` | `HU-ORCH-01` | `verify.sh` | Suite de 8 niveles (56 tests) | Cubierto |\n",
    "modules/agent-orchestrator/data-and-transactions.md": "---\nid: MOD-ORCH-DATA\ntitle: \"Módulo: agent-orchestrator — Datos & Transacciones\"\nmodule: \"agent-orchestrator\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"data\", \"transactions\", \"git-refs\", \"concurrency\"]\n---\n\n# Módulo: agent-orchestrator — Datos & Transacciones\n\n---\n\n## 1. Entidades Persistidas y Referencias Git\n\nEl orquestador interactúa con dos fuentes de persistencia:\n1. **Referencias Git Locales (`.git/refs/heads/`)**:\n   - Punteros SHA-1 a los commits de trabajo en las ramas `{feature|bugfix}/INT-{id}/{name}`.\n2. **Archivos de Progreso JSON**:\n   - `progress/current.json`: Estado de la feature en curso, id, nombre, tareas completadas vs pendientes.\n   - `progress/history.json`: Bitácora histórica inmutable de specs completados y cerrados.\n\n---\n\n## 2. Fronteras Transaccionales y Concurrencia\n- **Atomicidad en Creación de Ramas**: La invocación `git checkout -b {branch}` es atómica en el sistema de archivos local de Git. Si la rama ya existe o el nombre es inválido, Git aborta sin mutar el HEAD actual.\n- **Concurrencia Multi-Agente**: Los subagentes se ejecutan con `Workspace: \"inherit\"`, lo que asegura que todos compartan el mismo working directory en la rama activa sin crear ramas fantasma o duplicadas.\n",
    "modules/agent-orchestrator/diagrams.md": "---\nid: MOD-ORCH-DIAG\ntitle: \"Módulo: agent-orchestrator — Suite de 6 Diagramas\"\nmodule: \"agent-orchestrator\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"c3\", \"class\", \"sequence\", \"state\", \"activity\", \"erd\"]\n---\n\n# Módulo: agent-orchestrator — Suite de 6 Diagramas\n\n---\n\n## 1. Diagrama de Componentes C3 del Módulo\n\n```mermaid\nflowchart LR\n  subgraph ModuleOrchestrator[\"agent-orchestrator\"]\n    compCoordinator[\"OrchestratorCoordinator<br/>(Valida ramas y estados)\"]\n    compDispatcher[\"SubagentDispatcher<br/>(Inyecta prompts y roles)\"]\n    compGate[\"HumanGateController<br/>(ask_question)\"]\n  end\n\n  userDev([\"Desarrollador Humano\"])\n  gitRepo[(\"Git Refs / Working Tree\")]\n  subagentPool[[\"Subagentes (Spec, Impl, Review)\"]]\n\n  userDev --> compCoordinator\n  compCoordinator -->|\"Valida INT-* (<=80c)\"| gitRepo\n  compCoordinator --> compDispatcher\n  compDispatcher -->|\"Workspace: inherit\"| subagentPool\n  compCoordinator --> compGate\n  compGate -->|\"Bloquea hasta confirmación\"| userDev\n```\n\n---\n\n## 2. Diagrama de Clases UML del Módulo\n\n```mermaid\nclassDiagram\n  class OrchestratorCoordinator {\n    +validateBranchName(string branch) bool\n    +createBranch(string type, int id, string name) BranchResult\n    +requestHumanApproval(Spec spec) ApprovalStatus\n  }\n\n  class SubagentDispatcher {\n    +dispatch(string role, string prompt) AgentSession\n    +terminate(string conversationId) void\n  }\n\n  class HumanGateController {\n    +promptApproval(string message, List~string~ options) string\n    +handleResponse(string response) FlowAction\n  }\n\n  OrchestratorCoordinator --> SubagentDispatcher : \"delega tareas\"\n  OrchestratorCoordinator --> HumanGateController : \"solicita puerta\"\n```\n\n---\n\n## 3. Diagrama de Secuencia Transaccional\n\n```mermaid\nsequenceDiagram\n  autonumber\n  actor User as \"Usuario Humano\"\n  participant Leader as \"Leader Agent\"\n  participant Git as \"Git System\"\n  participant Gate as \"Human Gate (ask_question)\"\n  participant Subagent as \"Subagente\"\n\n  User->>Leader: \"Iniciar feature INT-010\"\n  Leader->>Git: \"git checkout -b feature/INT-010/{name}\"\n  Leader->>Subagent: \"Redactar spec\"\n  Subagent-->>Leader: \"Spec completado (spec_ready)\"\n  Leader->>Gate: \"ask_question: Aprobar spec al 100%?\"\n  Gate->>User: \"Presenta opciones interactivas\"\n  User-->>Gate: \"Aprobar al 100%\"\n  Gate-->>Leader: \"Aprobado (in_progress)\"\n  Leader->>Subagent: \"Implementar código y tests\"\n```\n\n---\n\n## 4. Diagrama de Máquina de Estados del Ciclo de Tarea\n\n```mermaid\nstateDiagram-v2\n  [*] --> Pending : \"Creación de tarea\"\n  Pending --> SpecReady : \"spec-author completa specs\"\n  SpecReady --> InProgress : \"Humano aprueba spec (ask_question)\"\n  SpecReady --> Pending : \"Humano rechaza spec\"\n  InProgress --> Review : \"implementer finaliza código y tests\"\n  Review --> Done : \"reviewer valida al 100%\"\n  Review --> InProgress : \"reviewer reporta hallazgos\"\n  Done --> [*] : \"Reconciliación de metadata\"\n```\n\n---\n\n## 5. Diagrama de Actividades con Carriles (Swimlanes)\n\n```mermaid\nflowchart TD\n  subgraph LaneHuman[\"Carril: Desarrollador Humano\"]\n    actRequest[\"Solicita Tarea\"]\n    actApprove[\"Aprueba Spec (ask_question)\"]\n    actIntegrate[\"Aprueba Fusión a Master\"]\n  end\n\n  subgraph LaneLeader[\"Carril: Leader Agent\"]\n    actBranch[\"Crea Rama INT-*\"]\n    actDelegate[\"Invoca Subagentes\"]\n    actCheckReview[\"Verifica Dictamen Reviewer\"]\n  end\n\n  subgraph LaneSubagent[\"Carril: Subagente Especializado\"]\n    actSpec[\"Redacta Requerimientos & Tasks\"]\n    actCode[\"Escribe Código & Tests TDD\"]\n    actAudit[\"Audita 100% de Trazabilidad\"]\n  end\n\n  actRequest --> actBranch\n  actBranch --> actDelegate\n  actDelegate --> actSpec\n  actSpec --> actApprove\n  actApprove --> actCode\n  actCode --> actAudit\n  actAudit --> actCheckReview\n  actCheckReview --> actIntegrate\n```\n\n---\n\n## 6. Sub-Diagrama Entidad-Relación (ERD)\n\n```mermaid\nerDiagram\n  FEATURE ||--|| TASK_STATE : \"monitorea\"\n  FEATURE ||--|{ AGENT_SESSION : \"asigna a\"\n\n  FEATURE {\n    string id PK\n    string branch\n    string status\n  }\n\n  TASK_STATE {\n    string status PK\n    bool is_locked\n    string gate_status\n  }\n\n  AGENT_SESSION {\n    string conversation_id PK\n    string role\n    string workspace_mode\n  }\n```\n",
    "modules/agent-orchestrator/module-spec.md": "---\nid: MOD-ORCH-SPEC\ntitle: \"Módulo: agent-orchestrator — Especificación & Tarjetas CRC\"\nmodule: \"agent-orchestrator\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"orchestrator\", \"subagents\", \"crc-cards\", \"branching\", \"human-gate\"]\n---\n\n# Módulo: agent-orchestrator — Especificación & Tarjetas CRC\n\n> [!NOTE]\n> Bounded Context encargado de la orquestación multi-agente, la observabilidad del ciclo de vida SDD, la imposición estricta de límites de ramas git y las puertas obligatorias de decisión humana.\n\n---\n\n## 1. Alcance y Estado de Cobertura\n- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`\n- **Responsabilidad Primaria**: Coordinar la ejecución secuencial de agentes especializados (`leader`, `spec-author`, `implementer`, `reviewer`), validar convenciones de ramas git ($\\le 80$ caracteres) y forzar pausas interactivas mediante `ask_question`.\n\n---\n\n## 2. Lenguaje Ubicuo Local\n- **Leader**: Agente orquestador soberano que inicia la tarea y valida las ramas.\n- **Spec-Author**: Agente redactor de especificaciones técnicas (EARS / IEEE 830).\n- **Implementer**: Agente ejecutor que programa código y pruebas unitarias/integración.\n- **Reviewer**: Agente auditor independiente e imparcial (prohibido editar código).\n- **Human Gate**: Puerta obligatoria de aprobación humana con `ask_question`.\n\n---\n\n## 3. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)\n\n| Clase / Agregado | Estereotipo | Responsabilidades | Colaboradores |\n|---|---|---|---|\n| `OrchestratorCoordinator` | `<<Service>>` | 1. Interpretar comando del usuario.<br/>2. Verificar si la rama actual es base (`master`/`main`).<br/>3. Crear la rama `{feature\\|bugfix}/INT-{id}/{name}` ($\\le 80$c). | `GitCLI`, `AgentRegistry` |\n| `HumanGateController` | `<<Controller>>` | 1. Generar modal interactivo `ask_question`.<br/>2. Bloquear ejecución hasta recibir respuesta del usuario.<br/>3. Enrutar el flujo según la opción seleccionada. | `AntigravityAPI`, `LeaderAgent` |\n| `SubagentDispatcher` | `<<Dispatcher>>` | 1. Invocar subagente con `Workspace: \"inherit\"`.<br/>2. Inyectar prompt contextualizado con la tarea activa. | `invoke_subagent`, `AgentSpec` |\n\n---\n\n## 4. Contratos de Entrada y Salida (DTOs / Interfaces)\n- **Input**: `{ taskId: \"INT-001\", type: \"feature\", title: \"Document CRUD API\", baseBranch: \"master\" }`\n- **Output**: `{ branch: \"feature/INT-001/document_crud_api\", length: 33, status: \"created\", agentDispatched: \"spec-author\" }`\n- **Invariante**: Si `length > 80`, la operación aborta con excepción inmediata.\n",
    "modules/agent-orchestrator/requirements-and-rules.md": "---\nid: MOD-ORCH-RULES\ntitle: \"Módulo: agent-orchestrator — Requerimientos & Reglas de Negocio\"\nmodule: \"agent-orchestrator\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"requirements\", \"rules\", \"stories\", \"tasks\"]\n---\n\n# Módulo: agent-orchestrator — Requerimientos & Reglas de Negocio\n\n---\n\n## 1. Requerimientos Funcionales Formales (IEEE 830)\n\n### `RF-ORCH-001`: Creación y Validación Estricta de Ramas Git\n- **Enunciado Formal**: Cuando el usuario solicite iniciar una tarea de ingeniería, el sistema **debe** verificar que la rama de trabajo cumpla la estructura `{feature|bugfix}/INT-{numero}/{nombre_rama}` y su longitud total **no debe** exceder los 80 caracteres.\n- **Criterio Gherkin**:\n  - *Given* una tarea con tipo `feature`, id `INT-001` y nombre `document_crud_api`\n  - *When* el orquestador genera la rama git\n  - *Then* la rama creada es `feature/INT-001/document_crud_api` y su longitud es de 33 caracteres ($\\le 80$).\n\n### `RF-ORCH-002`: Puerta Humana Obligatoria para Aprobación de Spec\n- **Enunciado Formal**: Antes de pasar una tarea a estado `in_progress` o iniciar la fase de implementación, el sistema **debe** invocar la herramienta `ask_question` para obtener la aprobación explícita y documentada del usuario humano al 100%.\n\n---\n\n## 2. Reglas de Negocio Locales (BR-*)\n\n| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |\n|---|---|---|---|---|\n| `BR-ORCH-001` | Crítica | `length(branch) <= 80 && type in ['feature', 'bugfix']` | `.opencode/rules/branches.md` | Aborta con error de convención |\n| `BR-ORCH-002` | Crítica | `spec_approved == true` antes de delegar a `implementer` | `.agents/rules/antigravity-harness.md` | Bloquea ejecución con `ask_question` |\n| `BR-ORCH-003` | Crítica | `reviewer.can_edit_code == false` | `.agents/agents/reviewer.md` | Prohibido editar código fuente |\n\n---\n\n## 3. Historias de Usuario (HU-*) y Tareas de Ingeniería (TI-*)\n\n### `HU-ORCH-01`: Orquestación Segura de Features\n- *Como* desarrollador líder, *quiero* que el arnés cree automáticamente ramas con el formato y longitud estricta, *para* evitar colisiones de nombres y ramas rotas en repositorios compartidos.\n- **Story Points**: 3 SP (Fibonacci)\n- **Tareas de Ingeniería (TI-*)**:\n  - `TI-ORCH-01`: Implementar validador regex de nombres de rama y contador de caracteres $\\le 80$.\n  - `TI-ORCH-02`: Añadir suite de pruebas BVA (79c, 80c, 81c) en `tests/blackbox/bva-inputs.test.js`.\n",
    "modules/agent-orchestrator/rules.md": "# Reglas de Negocio Invariantes: agent-orchestrator\r\n\r\n### BR-ORCH-001: Formato y Longitud Estricta de Ramas\r\n- **Severidad**: Crítica\r\n- **Fórmula / Restricción**: `length({type}/INT-{numero}/{nombre_rama}) <= 80`\r\n- **Valores permitidos de type**: Exclusivamente `feature` o `bugfix`.\r\n- **Comportamiento ante Violación**: La creación de la rama es rechazada de inmediato.\r\n\r\n### BR-ORCH-002: Puerta Humana Obligatoria para Aprobación de Spec\r\n- **Severidad**: Crítica\r\n- **Restricción**: Jamás iniciar la fase de implementación sin que el humano haya seleccionado `Aprobar spec al 100% e iniciar implementación` mediante la herramienta `ask_question`.\r\n- **Comportamiento ante Violación**: Detención total del agente e invocación inmediata de `ask_question`.\r\n\r\n### BR-ORCH-003: Subagente Revisor No Modifica Código\r\n- **Severidad**: Crítica\r\n- **Restricción**: El subagente `reviewer` audita de forma imparcial la trazabilidad R-Tests, la compilación y los tests, pero tiene prohibido editar archivos fuente (`src/`, `tests/`).\r\n- **Comportamiento ante Violación**: Veredicto nulo y reasignación al `implementer`.\r\n",
    "modules/agent-orchestrator/sequence.md": "# Flujo de Orquestación Multi-Agente: agent-orchestrator\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor Humano as \"Usuario (Humano)\"\r\n  participant Leader as \"Leader Agent\"\r\n  participant SpecAuthor as \"Spec-Author\"\r\n  participant Implementer as \"Implementer\"\r\n  participant Reviewer as \"Reviewer\"\r\n\r\n  Humano->>Leader: \"Iniciar feature / INT-001\"\r\n  Leader->>Leader: \"Crear rama feature/INT-001/{nombre} (<=80c)\"\r\n  Leader->>SpecAuthor: \"invoke_subagent(spec-author)\"\r\n  SpecAuthor-->>Leader: \"specs/001_nombre/ listo (spec_ready)\"\r\n  Leader->>Humano: \"ask_question(Aprobar spec al 100%?)\"\r\n  Humano-->>Leader: \"Aprobado (in_progress)\"\r\n  Leader->>Implementer: \"invoke_subagent(implementer)\"\r\n  Implementer->>Implementer: \"Escribir código y tests (checks.test)\"\r\n  Implementer-->>Leader: \"Tasks completadas y trazabilidad R<->Tests\"\r\n  Leader->>Reviewer: \"invoke_subagent(reviewer)\"\r\n  Reviewer->>Reviewer: \"Auditoría imparcial sin editar código\"\r\n  alt Veredicto Aprobado\r\n    Reviewer-->>Leader: \"APROBADO (review_*.md)\"\r\n    Leader->>Humano: \"ask_question(Integrar a rama base?)\"\r\n  else Veredicto Rechazado\r\n    Reviewer-->>Leader: \"RECHAZADO (motivos documentados)\"\r\n    Leader->>Implementer: \"Reasignar correcciones\"\r\n  end\r\n```\r\n",
    "modules/agent-orchestrator/technical-debt-refactoring.md": "---\nid: MOD-ORCH-DEBT\ntitle: \"Módulo: agent-orchestrator — Deuda Técnica & Refactorización\"\nmodule: \"agent-orchestrator\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"technical-debt\", \"refactoring\", \"code-smells\", \"modernization\"]\n---\n\n# Módulo: agent-orchestrator — Deuda Técnica & Refactorización\n\n---\n\n## 1. Diagnóstico de Estado y Code Smells\n- **Estado de Deuda**: `Baja`\n- **Puntos Fuertes**: Lógica declarativa desacoplada en archivos markdown (`.agents/agents/`, `.agents/rules/`).\n- **Riesgos Mitigados**:\n  - Se previno el cuelgue en `git commit` mediante el parámetro `--no-gpg-sign` en entornos background de Windows.\n  - Se blindó la validación estricta de nombres de rama con la suite de pruebas BVA (79c, 80c, 81c).\n\n---\n\n## 2. Plan Táctico de Modernización\n1. **Paso 1**: Incorporar telemetría de tiempos de respuesta por subagente en `progress/history.json`.\n2. **Paso 2**: Extender la validación de ramas para soportar integración con Jira/Linear tags opcionales sin violar el límite de 80 caracteres.\n",
    "modules/dashboard-visualizer/data-and-transactions.md": "---\nid: MOD-DASH-DATA\ntitle: \"Módulo: dashboard-visualizer — Datos & Transacciones\"\nmodule: \"dashboard-visualizer\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"data\", \"state\", \"store\", \"persistence\"]\n---\n\n# Módulo: dashboard-visualizer — Datos & Transacciones\n\n---\n\n## 1. Estado en Memoria y Persistencia Local\n- **Store Reactivo**: El estado global reside en una instancia singleton de `Store` que almacena:\n  - `features`: Array normalizado de historias y tareas.\n  - `currentSpec`: Metadatos del spec en desarrollo.\n  - `knowledgeIndex`: Índice documental, estantes y diagramas.\n  - `ui`: Pestaña activa, modo oscuro/claro, filtros y paginación.\n- **Persistencia en LocalStorage**: Si el navegador tiene disponible `localStorage`, se preservan preferencias de tema (`theme: 'dark' | 'light'`) y documentos editados localmente.\n\n---\n\n## 2. Bloqueos de Concurrencia y Sincronización\n- **Flags Anti-Bucle en Scroll**: Variables booleanas `isScrollingFromEditor` e `isScrollingFromPreview` con temporizadores de 60ms para evitar que el evento `scroll` de una columna re-dispare recursivamente el de la otra.\n- **Auto-Sync Controlador**: Si se detecta `protocol === 'file:'`, el polling por temporizador se apaga por completo, evitando carreras de datos y saturación de la CPU.\n",
    "modules/dashboard-visualizer/diagrams.md": "---\nid: MOD-DASH-DIAG\ntitle: \"Módulo: dashboard-visualizer — Suite de 6 Diagramas\"\nmodule: \"dashboard-visualizer\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"c3\", \"class\", \"sequence\", \"state\", \"activity\", \"erd\"]\n---\n\n# Módulo: dashboard-visualizer — Suite de 6 Diagramas\n\n---\n\n## 1. Diagrama de Componentes C3 del Módulo\n\n```mermaid\nflowchart LR\n  subgraph ModuleDashboard[\"dashboard-visualizer\"]\n    compStore[\"Reactive Store (store.js)\"]\n    compRouter[\"Hash Router (router.js)\"]\n    compEditor[\"Dual Editor & MarkdownViewer\"]\n    comp3D[\"SpaceView3D (Three.js)\"]\n    compMermaid[\"MermaidViewer\"]\n  end\n\n  compRouter --> compStore\n  compStore --> compEditor\n  compStore --> comp3D\n  compStore --> compMermaid\n```\n\n---\n\n## 2. Diagrama de Clases UML del Módulo\n\n```mermaid\nclassDiagram\n  class DashboardStore {\n    -State state\n    -List~Function~ listeners\n    +getState() State\n    +setData(Object data) void\n    +subscribe(Function listener) Function\n    +setSelectedFeature(Feature f) void\n  }\n\n  class MarkdownViewer {\n    +renderMarkdown(string md) string\n    +extractTableOfContents(string md) List~Heading~\n    +parseMarkdownToBlocks(string md) List~Block~\n    +blocksToMarkdown(List~Block~ blocks) string\n  }\n\n  class MermaidViewer {\n    +renderMermaidViewer(Diagram diag) string\n    +initMermaidDiagrams(int retries) Promise\n  }\n\n  DashboardStore --> MarkdownViewer : \"alimenta contenido\"\n  DashboardStore --> MermaidViewer : \"alimenta diagramas\"\n```\n\n---\n\n## 3. Diagrama de Secuencia: Editor Dual con Scroll Sincronizado\n\n```mermaid\nsequenceDiagram\n  autonumber\n  actor User as \"Desarrollador\"\n  participant Editor as \"Textarea Editor\"\n  participant Preview as \"Live Preview\"\n  participant Store as \"DashboardStore\"\n\n  User->>Editor: \"Escribe markdown y desplaza scroll\"\n  Editor->>Preview: \"Calcula ratio de scroll (scrollY / maxScroll)\"\n  Editor->>Preview: \"Ajusta scrollTop de previsualización\"\n  Editor->>Store: \"saveDoc(key, content)\"\n  Store-->>User: \"Notificación: Guardado con éxito\"\n```\n\n---\n\n## 4. Diagrama de Máquina de Estados del Visor\n\n```mermaid\nstateDiagram-v2\n  [*] --> LibraryView : \"Carga inicial de Knowledge Base\"\n  LibraryView --> ReaderView : \"Click en [ Leer Artículo ]\"\n  ReaderView --> EditorView : \"Click en [ Modo Editor ]\"\n  EditorView --> ReaderView : \"Click en [ Modo Lectura ]\"\n  ReaderView --> LibraryView : \"Click en [ Volver a Biblioteca ]\"\n  EditorView --> LibraryView : \"Click en [ Volver a Biblioteca ]\"\n```\n\n---\n\n## 5. Diagrama de Actividades de Inicialización\n\n```mermaid\nflowchart TD\n  startNode([\"Inicio Carga index.html\"])\n  checkProto{\"window.location.protocol === 'file:'\"}\n  loadFallback[\"Lee window.__FALLBACK_DATA__\"]\n  loadHttp[\"fetchProjectData() HTTP\"]\n  initStore[\"store.setData(data)\"]\n  mountView[\"Monta Pestaña Activa\"]\n  initMermaid[\"initMermaidDiagrams() con Reintentos\"]\n\n  startNode --> checkProto\n  checkProto -->|Sí| loadFallback\n  checkProto -->|No| loadHttp\n  loadFallback --> initStore\n  loadHttp --> initStore\n  initStore --> mountView\n  mountView --> initMermaid\n```\n\n---\n\n## 6. Sub-Diagrama Entidad-Relación (ERD)\n\n```mermaid\nerDiagram\n  DASHBOARD_STATE ||--o{ FEATURE_VIEW : \"renderiza\"\n  DASHBOARD_STATE ||--|| ACTIVE_DOC : \"edita\"\n\n  DASHBOARD_STATE {\n    string active_tab\n    string theme\n    int total_features\n  }\n\n  FEATURE_VIEW {\n    int id PK\n    string title\n    string status\n  }\n\n  ACTIVE_DOC {\n    string key PK\n    string content\n    int reading_time\n  }\n```\n",
    "modules/dashboard-visualizer/module-spec.md": "---\nid: MOD-DASH-SPEC\ntitle: \"Módulo: dashboard-visualizer — Especificación & Tarjetas CRC\"\nmodule: \"dashboard-visualizer\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"dashboard\", \"vanilla-js\", \"tailwind-v4\", \"three-js\", \"dual-editor\", \"crc-cards\"]\n---\n\n# Módulo: dashboard-visualizer — Especificación & Tarjetas CRC\n\n> [!NOTE]\n> Bounded Context encargado de la visualización web interactiva del arnés, métricas KPI, editor dual ContextForge, grafos de dependencias SVG y constelación 3D en Three.js con soporte offline nativo (`file:///`).\n\n---\n\n## 1. Alcance y Estado de Cobertura\n- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`\n- **Responsabilidad Primaria**: Renderizar el estado vivo del proyecto, permitir la edición Docs-as-Code en tiempo real, visualizar la arquitectura en diagramas interactivos y proveer navegación fluida sin emojis ni dependencias de frameworks pesados.\n\n---\n\n## 2. Lenguaje Ubicuo Local\n- **Reactive Store**: Almacén central inmutable que gestiona el estado y notifica cambios a la vista.\n- **Dual Editor**: Editor con paneles simultáneos de Markdown crudo y Bloques Visuales con sincronización proporcional de scroll.\n- **Offline Fallback**: Respaldo en memoria inyectado por `data-fallback.js` para silenciar bloqueos CORS en `file:///`.\n- **ThreeJS Constellation**: Representación astronómica 3D de las dependencias jerárquicas del proyecto.\n\n---\n\n## 3. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)\n\n| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |\n|---|---|---|---|\n| `DashboardStore` | `<<StateStore>>` | 1. Mantener estado unificado (features, specs, conocimiento).<br/>2. Notificar a observadores registrados ante mutaciones.<br/>3. Filtrar y paginar datos reactivamente. | `SubscriberCallbacks`, `LocalStorageCache` |\n| `MarkdownViewer` | `<<Renderer>>` | 1. Parsear sintaxis Markdown a HTML seguro.<br/>2. Renderizar alertas GitHub y tablas sticky.<br/>3. Convertir Markdown bidireccionalmente a bloques visuales. | `DOMPurify`, `MermaidViewer` |\n| `SpaceView3D` | `<<Visualizer>>` | 1. Inicializar escena Three.js, cámara y luces.<br/>2. Renderizar constelación piramidal de nodos.<br/>3. Destruir listeners y liberar memoria en `unmount`. | `ThreeJS`, `DashboardStore` |\n| `MermaidViewer` | `<<DiagramViewer>>` | 1. Renderizar código Mermaid como SVG interactivo.<br/>2. Ofrecer conmutador entre vista visual y código fuente.<br/>3. Habilitar zoom a pantalla completa y enlace a Draw.io. | `WindowMermaid`, `ClipboardAPI` |\n\n---\n\n## 4. Contratos de Entrada y Salida (DTOs / Interfaces)\n- **Input**: `window.__FALLBACK_DATA__` o respuestas JSON de `fetchProjectData()`.\n- **Output**: Renderizado DOM reactivo en `#app`, eventos de navegación por hash y persistencia local de documentos modificados.\n",
    "modules/dashboard-visualizer/requirements-and-rules.md": "---\nid: MOD-DASH-RULES\ntitle: \"Módulo: dashboard-visualizer — Requerimientos & Reglas de Negocio\"\nmodule: \"dashboard-visualizer\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"requirements\", \"rules\", \"anti-emoji\", \"offline-first\"]\n---\n\n# Módulo: dashboard-visualizer — Requerimientos & Reglas de Negocio\n\n---\n\n## 1. Requerimientos Funcionales Formales (IEEE 830)\n\n### `RF-DASH-001`: Compatibilidad Offline Nativa (`file:///`)\n- **Enunciado Formal**: Cuando el usuario abra `project-docs/index.html` bajo el protocolo `file:///`, el sistema **debe** cargar los datos desde `window.__FALLBACK_DATA__` sin ejecutar llamadas `fetch()` que disparen políticas de bloqueo CORS en el navegador.\n\n### `RF-DASH-002`: Editor Dual con Scroll Sincronizado\n- **Enunciado Formal**: Cuando el usuario active el modo editor en cualquier documento de la base de conocimiento, el sistema **debe** renderizar en paralelo el área de texto Markdown y la previsualización en vivo, manteniendo el scroll sincronizado proporcionalmente en ambas columnas sin bucles infinitos de eventos.\n\n### `RF-DASH-003`: Erradicación Total de Emojis\n- **Enunciado Formal**: La interfaz de usuario **no debe** contener caracteres emoji unicode en botones, badges, modales o encabezados, empleando exclusivamente funciones de iconografía SVG vectorial de `Icons.js`.\n\n---\n\n## 2. Reglas de Negocio Locales (BR-*)\n\n| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |\n|---|---|---|---|---|\n| `BR-DASH-001` | Crítica | `protocol == 'file:' ==> useFallbackData && bypassFetch` | `project-docs/src/core/api.js` | Silencia errores CORS |\n| `BR-DASH-002` | Alta | `count(emojiChars) == 0` en código fuente y HTML | `tests/unit/ui-anti-emoji.test.js` | Falla test unitario |\n| `BR-DASH-003` | Alta | `tabSwitch ==> destroyThreeScene && resetListeners` | `project-docs/src/features/space-view-3d/` | Previene fugas de memoria OOM |\n",
    "modules/dashboard-visualizer/rules.md": "# Reglas de Negocio Invariantes: dashboard-visualizer\r\n\r\n### BR-DASH-001: Compatibilidad 100% Offline (Zero-Server Fallback)\r\n- **Severidad**: Crítica\r\n- **Restricción**: El tablero debe poder abrirse con doble clic directamente en `project-docs/index.html` bajo el protocolo `file:///` sin requerir servidor HTTP ni fallar por CORS.\r\n- **Comportamiento ante Violación**: `sync-data.js` genera obligatoriamente `project-docs/data-fallback.js` antes de cualquier compilación.\r\n\r\n### BR-DASH-002: Scroll Sincronizado Proporcional Anti-Bloqueo\r\n- **Severidad**: Alta\r\n- **Fórmula**: $\\text{Ratio} = \\frac{\\text{scrollTop}}{\\text{scrollHeight} - \\text{clientHeight}}$ con flags de exclusión mutua `isScrollingFromEditor` e `isScrollingFromPreview`.\r\n- **Comportamiento ante Violación**: Bloqueo de scroll o bucles de eventos infinitos entre paneles.\r\n",
    "modules/dashboard-visualizer/sequence.md": "# Flujo de Renderizado y Navegación: dashboard-visualizer\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor User as \"Usuario / Programador\"\r\n  participant App as \"main.js (Router)\"\r\n  participant Omnibox as \"Omnibox (Ctrl+K)\"\r\n  participant Library as \"Editorial Library Hub\"\r\n  participant Article as \"Lector / Editor Dual\"\r\n  participant ThreeD as \"Three.js Constelacion 3D\"\r\n\r\n  User->>App: \"Abrir index.html (file:/// o HTTP)\"\r\n  App->>App: \"Cargar data-fallback.js / API\"\r\n  User->>Omnibox: \"Pulsar Ctrl+K y buscar término\"\r\n  Omnibox-->>User: \"Resultados en vivo (Tareas, Docs, Reglas)\"\r\n  User->>Omnibox: \"Seleccionar documento de arquitectura\"\r\n  Omnibox->>Article: \"openArticleView('c4-model.md')\"\r\n  Article-->>User: \"Renderizar columna 780px + TOC flotante + Diagramas Mermaid\"\r\n  User->>Article: \"Pulsar Modo Editor [ Modo Bloques ]\"\r\n  Article-->>User: \"Editor de Bloques ContextForge con scroll sincronizado\"\r\n  User->>App: \"Cambiar pestaña a Constelación 3D\"\r\n  App->>ThreeD: \"mount(container) -> Pirámide 4 niveles\"\r\n```\r\n",
    "modules/dashboard-visualizer/technical-debt-refactoring.md": "---\nid: MOD-DASH-DEBT\ntitle: \"Módulo: dashboard-visualizer — Deuda Técnica & Refactorización\"\nmodule: \"dashboard-visualizer\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"technical-debt\", \"refactoring\", \"ux-redesign\", \"clean-code\"]\n---\n\n# Módulo: dashboard-visualizer — Deuda Técnica & Refactorización\n\n---\n\n## 1. Diagnóstico de Estado y Code Smells Resueltos\n- **Code Smell 1 (Resuelto)**: Errores CORS en consola al abrir `index.html` vía `file:///` -> Resuelto bifurcando inmediatamente en `api.js` para usar `window.__FALLBACK_DATA__`.\n- **Code Smell 2 (Resuelto)**: Los diagramas C4 no tenían código en `knowledge-index.json` -> Resuelto integrando `extractDiagrams` en `sync-data.js`.\n- **Code Smell 3 (En Refactorización Actual)**: La Base de Conocimiento mezclaba documentos generales y archivos de módulos en una sola lista sin jerarquía clara -> Se resuelve implementando el nuevo switcher de 3 perspectivas: **Visión Global (01–12)**, **Módulos & Bounded Contexts** y **Dossier Maestro (`MASTER-PROJECT-KNOWLEDGE.md`)**.\n\n---\n\n## 2. Plan Táctico de Modernización\n1. **Paso 1**: Implementar el switcher de navegación de 3 niveles en `KnowledgeBase.js`.\n2. **Paso 2**: Habilitar previsualización y descarga del Megadocumento Maestro.\n",
    "modules/knowledge-engine/data-and-transactions.md": "---\nid: MOD-KNOW-DATA\ntitle: \"Módulo: knowledge-engine — Datos & Transacciones\"\nmodule: \"knowledge-engine\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"data\", \"transactions\", \"knowledge-graph\", \"json-index\"]\n---\n\n# Módulo: knowledge-engine — Datos & Transacciones\n\n---\n\n## 1. Esquema del Grafo de Conocimiento (`knowledgeGraph`)\nEl archivo `knowledge-index.json` persiste:\n- **`nodes`**: Entidades, Módulos, Tablas, Endpoints, Servicios Externos y Reglas `BR-*`.\n- **`edges`**: Relaciones dirigidas:\n  - `ENFORCES_RULE` (Módulo -> Regla)\n  - `PERSISTS_IN` (Entidad -> Tabla)\n  - `INTEGRATES_WITH` (Módulo -> Servicio Externo)\n  - `TESTED_BY` (Requerimiento -> Test)\n\n---\n\n## 2. Consistencia en Disco\n- La sincronización mediante `sync-data.js` genera escrituras atómicas en `knowledge-index.json` y `data-fallback.js`.\n",
    "modules/knowledge-engine/diagrams.md": "---\nid: MOD-KNOW-DIAG\ntitle: \"Módulo: knowledge-engine — Suite de 6 Diagramas\"\nmodule: \"knowledge-engine\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"c3\", \"class\", \"sequence\", \"state\", \"activity\", \"erd\"]\n---\n\n# Módulo: knowledge-engine — Suite de 6 Diagramas\n\n---\n\n## 1. Diagrama de Componentes C3 del Módulo\n\n```mermaid\nflowchart LR\n  subgraph ModuleKnowledge[\"knowledge-engine\"]\n    compScanner[\"DocScanner (Escaneo recursivo)\"]\n    compExtractor[\"DiagramExtractor (Mermaid AST)\"]\n    compCompiler[\"MasterCompiler (Dossier Único)\"]\n    compSync[\"SyncEngine (sync-data.js)\"]\n  end\n\n  docsDir[(\"project-docs/knowledge/**\")]\n  indexJson[(\"knowledge-index.json\")]\n  fallbackJs[(\"data-fallback.js\")]\n  masterMd[(\"MASTER-PROJECT-KNOWLEDGE.md\")]\n\n  docsDir --> compScanner\n  docsDir --> compExtractor\n  compScanner --> compCompiler\n  compCompiler --> masterMd\n  compExtractor --> compSync\n  compSync --> indexJson\n  compSync --> fallbackJs\n```\n\n---\n\n## 2. Diagrama de Clases UML del Módulo\n\n```mermaid\nclassDiagram\n  class KnowledgeDocument {\n    +string key\n    +string title\n    +string shelf\n    +int readingTime\n    +int wordCount\n    +int ruleCount\n  }\n\n  class DiagramDefinition {\n    +string id\n    +string type\n    +string level\n    +string title\n    +string mermaidCode\n  }\n\n  class KnowledgeEngine {\n    +scanDocs(string dir) Map~string, string~\n    +extractDiagrams(Map docs) List~DiagramDefinition~\n    +compileMasterDocument(Map docs) string\n  }\n\n  KnowledgeEngine \"1\" --> \"*\" KnowledgeDocument : \"indexa\"\n  KnowledgeEngine \"1\" --> \"*\" DiagramDefinition : \"extrae\"\n```\n\n---\n\n## 3. Diagrama de Secuencia: Ingesta y Sincronización\n\n```mermaid\nsequenceDiagram\n  autonumber\n  actor User as \"Agente / Dev\"\n  participant Engine as \"sync-data.js\"\n  participant FS as \"File System\"\n  participant Fallback as \"data-fallback.js\"\n  participant Bundle as \"app.bundle.js\"\n\n  User->>Engine: \"node sync-data.js\"\n  Engine->>FS: \"scanDocs(knowledgeDir)\"\n  FS-->>Engine: \"docs, docMetadata, shelves\"\n  Engine->>Engine: \"extractDiagrams(docs)\"\n  Engine->>FS: \"write(knowledge-index.json)\"\n  Engine->>Fallback: \"write(window.__FALLBACK_DATA__)\"\n  Engine->>Bundle: \"npx esbuild (recompila bundle)\"\n  Engine-->>User: \"[SUCCESS] Sincronización completada\"\n```\n\n---\n\n## 4. Diagrama de Máquina de Estados de un Documento\n\n```mermaid\nstateDiagram-v2\n  [*] --> Borrador : \"Creación inicial\"\n  Borrador --> EnRevision : \"Completado por agente\"\n  EnRevision --> Publicado : \"Aprobado por humano / QA\"\n  Publicado --> EnRevision : \"Modificación o refactor\"\n  Publicado --> Retirado : \"Deprecado por nueva versión\"\n  Retirado --> [*]\n```\n\n---\n\n## 5. Diagrama de Actividades: Pipeline de Compilación\n\n```mermaid\nflowchart TD\n  startScan([\"Inicio Pipeline sync-data.js\"])\n  readDocs[\"Lee archivos .md recursivamente\"]\n  calcMetrics[\"Calcula WPM, readingTime, BR-* count\"]\n  extractDiagrams[\"Extrae bloques Mermaid c4/uml/erd\"]\n  updateIndex[\"Actualiza knowledge-index.json\"]\n  writeFallback[\"Genera data-fallback.js\"]\n  rebuildBundle[\"Recompila dist/app.bundle.js\"]\n  endNode([\"Fin: Tablero Listo Offline\"])\n\n  startScan --> readDocs\n  readDocs --> calcMetrics\n  calcMetrics --> extractDiagrams\n  extractDiagrams --> updateIndex\n  updateIndex --> writeFallback\n  writeFallback --> rebuildBundle\n  rebuildBundle --> endNode\n```\n\n---\n\n## 6. Sub-Diagrama Entidad-Relación (ERD)\n\n```mermaid\nerDiagram\n  DOCUMENT ||--o{ DIAGRAM : \"contiene\"\n  DOCUMENT ||--|| SHELF : \"pertenece a\"\n\n  DOCUMENT {\n    string key PK\n    string title\n    string shelf\n    int word_count\n  }\n\n  DIAGRAM {\n    string id PK\n    string type\n    string mermaid_code\n  }\n\n  SHELF {\n    string id PK\n    string title\n  }\n```\n",
    "modules/knowledge-engine/module-spec.md": "---\nid: MOD-KNOW-SPEC\ntitle: \"Módulo: knowledge-engine — Especificación & Tarjetas CRC\"\nmodule: \"knowledge-engine\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"knowledge-engine\", \"docs-as-code\", \"rag\", \"graphrag\", \"crc-cards\"]\n---\n\n# Módulo: knowledge-engine — Especificación & Tarjetas CRC\n\n> [!NOTE]\n> Bounded Context encargado de la extracción, estandarización y mantenimiento de la Base de Conocimiento Soberana Docs-as-Code para alimentar agentes de IA y desarrolladores sin sesgo.\n\n---\n\n## 1. Alcance y Estado de Cobertura\n- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`\n- **Responsabilidad Primaria**: Elicitar la visión del producto, diagnosticar la arquitectura real AS-IS, mantener el catálogo de reglas `BR-*` y compilar el megadocumento `MASTER-PROJECT-KNOWLEDGE.md`.\n\n---\n\n## 2. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)\n\n| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |\n|---|---|---|---|\n| `DocScanner` | `<<Scanner>>` | 1. Recorrer `project-docs/knowledge/` recursivamente.<br/>2. Extraer títulos, resúmenes y metadatos AST.<br/>3. Calcular tiempo de lectura y conteo de palabras. | `FileSystem`, `MarkdownParser` |\n| `DiagramExtractor` | `<<Extractor>>` | 1. Parsear bloques ` ```mermaid ` en documentos clave.<br/>2. Enriquecer objetos de diagrama con código limpio. | `KnowledgeIndex` |\n| `MasterCompiler` | `<<Compiler>>` | 1. Unificar todos los documentos 01-12 y módulos en `MASTER-PROJECT-KNOWLEDGE.md`.<br/>2. Generar tabla de contenidos ancla interactiva. | `DocScanner`, `FileSystem` |\n\n---\n\n## 3. Contratos de Salida\n- `project-docs/knowledge/knowledge-index.json`\n- `project-docs/data-fallback.js`\n- `project-docs/knowledge/MASTER-PROJECT-KNOWLEDGE.md`\n",
    "modules/knowledge-engine/requirements-and-rules.md": "---\nid: MOD-KNOW-RULES\ntitle: \"Módulo: knowledge-engine — Requerimientos & Reglas de Negocio\"\nmodule: \"knowledge-engine\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"requirements\", \"rules\", \"anti-bias\", \"mermaid-syntax\"]\n---\n\n# Módulo: knowledge-engine — Requerimientos & Reglas de Negocio\n\n---\n\n## 1. Requerimientos Funcionales Formales (IEEE 830)\n\n### `RF-KNOW-001`: Ingesta Universal y Muestreo Quirúrgico\n- **Enunciado Formal**: Cuando el motor escanee archivos con más de 800 líneas de código, **no debe** cargarlos completos en memoria, sino que **debe** aplicar extracción de firmas por regex y lectura focalizada por rangos de líneas.\n\n### `RF-KNOW-002`: Doble Salida Modular y Megadocumento Maestro\n- **Enunciado Formal**: Tras auditar el repositorio, el sistema **debe** generar los documentos modulares en `project-docs/knowledge/` y compilar adicionalmente el archivo maestro consolidado `MASTER-PROJECT-KNOWLEDGE.md` con el 100% de la información sin truncar.\n\n---\n\n## 2. Reglas de Negocio Locales (BR-*)\n\n| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |\n|---|---|---|---|---|\n| `BR-KNOW-001` | Crítica | IDs Mermaid alfanuméricos puros + textos entrecomillados | `project-docs/sync-data.js` | Diagrama roto en parser |\n| `BR-KNOW-002` | Crítica | Consulta obligatoria de `project-docs/knowledge/` antes de codificar | `.agents/rules/antigravity-harness.md` | Rechazo en Review |\n| `BR-KNOW-003` | Alta | YAML frontmatter obligatorio en todo `.md` | `project-docs/knowledge/` | Falla indexación RAG |\n",
    "modules/knowledge-engine/rules.md": "# Reglas de Negocio Invariantes: knowledge-engine\r\n\r\n### BR-KNOW-001: Sintaxis Mermaid Ultra-Estricta\r\n- **Severidad**: Crítica\r\n- **Restricción**: Todo ID de nodo Mermaid debe ser alfanumérico simple sin guiones (`nodeA`, `nodeGateway`). Toda etiqueta descriptiva debe estar entre comillas dobles (`[\"Texto seguro\"]`).\r\n- **Comportamiento ante Violación**: Error de renderizado en el navegador bloqueante.\r\n\r\n### BR-KNOW-002: Invariante de Consulta Obligatoria Anti-Sesgo\r\n- **Severidad**: Crítica\r\n- **Restricción**: Antes de redactar specs o implementar código, los agentes DEBEN verificar la existencia de `project-docs/knowledge/`. Si existe, es obligatorio consultar `business-rules.md`, `coding-standards.md` y los módulos correspondientes.\r\n- **Comportamiento ante Violación**: Queda terminantemente prohibido inventar librerías o dependencias externas no canónicas.\r\n",
    "modules/knowledge-engine/sequence.md": "# Flujo de Elicitación y Extracción: knowledge-engine\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor User as \"Ingeniero / Agente\"\r\n  participant Skill as \"/project-knowledge\"\r\n  participant Phase1 as \"Fase 1: Escaneo Topologico\"\r\n  participant Phase2 as \"Fase 2: Inspeccion DDD Focalizada\"\r\n  participant Storage as \"project-docs/knowledge/\"\r\n  participant Sync as \"sync-data.js\"\r\n\r\n  User->>Skill: \"Ejecutar /project-knowledge\"\r\n  Skill->>Phase1: \"Auditar package.json, project-spec.yaml, estructura de carpetas\"\r\n  Phase1-->>Skill: \"Identificados Bounded Contexts y fronteras\"\r\n  Skill->>Phase2: \"Leer servicios de dominio, entidades, reglas y handlers\"\r\n  Phase2-->>Skill: \"Extraídas reglas BR-*, requerimientos RF-* y diagramas C4/UML\"\r\n  Skill->>Storage: \"Escribir c4-model.md, business-rules.md, modules/**\"\r\n  Skill->>Sync: \"node project-docs/sync-data.js\"\r\n  Sync-->>User: \"Base de conocimiento e interfaz actualizadas al 100%\"\r\n```\r\n",
    "modules/knowledge-engine/technical-debt-refactoring.md": "---\nid: MOD-KNOW-DEBT\ntitle: \"Módulo: knowledge-engine — Deuda Técnica & Refactorización\"\nmodule: \"knowledge-engine\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"technical-debt\", \"refactoring\", \"knowledge-graph\", \"scalability\"]\n---\n\n# Módulo: knowledge-engine — Deuda Técnica & Refactorización\n\n---\n\n## 1. Diagnóstico de Estado y Code Smells\n- **Puntos Resueltos**:\n  - Se implementó la extracción estricta de diagramas Mermaid en `sync-data.js`.\n  - Se eliminaron las alucinaciones de código de diagramas vacíos.\n- **Riesgos a Monitorear**:\n  - Evitar que `MASTER-PROJECT-KNOWLEDGE.md` supere los límites de tamaño en repositorios masivos; se recomienda compilación incremental con enlaces ancla.\n\n---\n\n## 2. Plan Táctico de Modernización\n1. **Paso 1**: Implementar compilador de `MASTER-PROJECT-KNOWLEDGE.md` integrado en `sync-data.js`.\n2. **Paso 2**: Exportar embeddings opcionales en formato JSONL para RAG vectorial local en ContextForge.\n",
    "modules/testing-qa-suite/data-and-transactions.md": "---\nid: MOD-TEST-DATA\ntitle: \"Módulo: testing-qa-suite — Datos & Transacciones\"\nmodule: \"testing-qa-suite\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"data\", \"transactions\", \"test-results\"]\n---\n\n# Módulo: testing-qa-suite — Datos & Transacciones\n\n---\n\n## 1. Salidas de Ejecución y Reportes\n- Los resultados de `node --test` y `playwright test` emiten códigos de salida de proceso y trazas JSON temporales.\n- Si Playwright detecta fallos, almacena capturas y trazas en `test-results/`.\n",
    "modules/testing-qa-suite/diagrams.md": "---\nid: MOD-TEST-DIAG\ntitle: \"Módulo: testing-qa-suite — Suite de 6 Diagramas\"\nmodule: \"testing-qa-suite\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"c3\", \"class\", \"sequence\", \"state\", \"activity\", \"erd\"]\n---\n\n# Módulo: testing-qa-suite — Suite de 6 Diagramas\n\n---\n\n## 1. Diagrama de Componentes C3 del Módulo\n\n```mermaid\nflowchart LR\n  subgraph ModuleQA[\"testing-qa-suite\"]\n    compRunner[\"VerifyRunner (verify.sh)\"]\n    compUnit[\"NodeTestRunner (Unit, White, Black, System)\"]\n    compPlaywright[\"PlaywrightRunner (Acceptance E2E)\"]\n    compLoad[\"LoadSimulator (Concurrencia)\"]\n  end\n\n  compRunner --> compUnit\n  compRunner --> compLoad\n  compRunner --> compPlaywright\n```\n\n---\n\n## 2. Diagrama de Clases UML del Módulo\n\n```mermaid\nclassDiagram\n  class VerifyRunner {\n    +executeAllPhases() int\n    +runUnitTests() TestResult\n    +runPlaywright() TestResult\n  }\n\n  class TestResult {\n    +int totalTests\n    +int passed\n    +int failed\n    +float durationMs\n    +bool isGreen()\n  }\n\n  VerifyRunner --> TestResult : \"evalúa\"\n```\n\n---\n\n## 3. Diagrama de Secuencia de Verificación\n\n```mermaid\nsequenceDiagram\n  autonumber\n  actor Dev as \"Desarrollador / Agente\"\n  participant Runner as \"verify.sh\"\n  participant Unit as \"node --test\"\n  participant Playwright as \"npx playwright\"\n  participant Sync as \"sync-data.js\"\n\n  Dev->>Runner: \"bash verify.sh\"\n  Runner->>Unit: \"Ejecutar unit, whitebox, blackbox, system, load\"\n  Unit-->>Runner: \"Todos los tests en verde\"\n  Runner->>Playwright: \"Ejecutar 7 escenarios E2E\"\n  Playwright-->>Runner: \"7 passed\"\n  Runner->>Sync: \"Recompilar y sincronizar\"\n  Sync-->>Runner: \"Sincronización completada\"\n  Runner-->>Dev: \"VERIFICACION EXITOSA (Verde)\"\n```\n\n---\n\n## 4. Diagrama de Máquina de Estados de la Suite\n\n```mermaid\nstateDiagram-v2\n  [*] --> Compiling : \"esbuild\"\n  Compiling --> UnitTesting : \"node --test unit\"\n  UnitTesting --> Whitebox : \"node --test whitebox\"\n  Whitebox --> Blackbox : \"node --test blackbox\"\n  Blackbox --> SystemIntegration : \"node --test system\"\n  SystemIntegration --> LoadTesting : \"node --test load\"\n  LoadTesting --> PlaywrightE2E : \"npx playwright test\"\n  PlaywrightE2E --> Success : \"Todos en verde\"\n  PlaywrightE2E --> Failed : \"Cualquier fallo\"\n  Success --> [*]\n  Failed --> [*]\n```\n\n---\n\n## 5. Diagrama de Actividades de Control de Calidad\n\n```mermaid\nflowchart TD\n  actStart([\"Inicio verify.sh\"])\n  actBuild[\"esbuild bundle\"]\n  actTests[\"node --test suites\"]\n  checkPass{\"Pasa 100%?\"}\n  actPlaywright[\"Playwright E2E\"]\n  actSync[\"sync-data.js\"]\n  actGreen([\"Aprobado (Código 0)\"])\n  actRed([\"Abortado (Código 1)\"])\n\n  actStart --> actBuild\n  actBuild --> actTests\n  actTests --> checkPass\n  checkPass -->|No| actRed\n  checkPass -->|Sí| actPlaywright\n  actPlaywright --> actSync\n  actSync --> actGreen\n```\n\n---\n\n## 6. Sub-Diagrama Entidad-Relación (ERD)\n\n```mermaid\nerDiagram\n  TEST_RUN ||--|{ TEST_SUITE : \"ejecuta\"\n  TEST_SUITE ||--|{ TEST_CASE : \"evalúa\"\n\n  TEST_RUN {\n    string id PK\n    string timestamp\n    string status\n  }\n\n  TEST_SUITE {\n    string name PK\n    string category\n  }\n\n  TEST_CASE {\n    string name PK\n    int duration_ms\n    bool passed\n  }\n```\n",
    "modules/testing-qa-suite/module-spec.md": "---\nid: MOD-TEST-SPEC\ntitle: \"Módulo: testing-qa-suite — Especificación & Tarjetas CRC\"\nmodule: \"testing-qa-suite\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"testing\", \"qa\", \"verification\", \"crc-cards\", \"playwright\"]\n---\n\n# Módulo: testing-qa-suite — Especificación & Tarjetas CRC\n\n> [!NOTE]\n> Bounded Context encargado de la suite de pruebas automatizadas en 8 niveles, runner de `verify.sh` y automatización end-to-end con Playwright.\n\n---\n\n## 1. Alcance y Estado de Cobertura\n- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`\n- **Responsabilidad Primaria**: Garantizar que el arnés y el tablero pasen el 100% de los niveles de verificación antes de cualquier entrega o cierre de spec.\n\n---\n\n## 2. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)\n\n| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |\n|---|---|---|---|\n| `VerifyRunner` | `<<TestRunner>>` | 1. Ejecutar las 8 fases de `verify.sh`.<br/>2. Detener el pipeline ante cualquier fallo (código != 0).<br/>3. Recompilar y sincronizar datos automáticamente. | `ChildProcess`, `TestSuites` |\n| `PlaywrightHarness` | `<<E2EFramework>>` | 1. Levantar servidor local en puerto dinámico.<br/>2. Ejecutar escenarios de aceptación en navegador real.<br/>3. Capturar capturas y trazas ante fallos. | `PlaywrightBrowser`, `DashboardApp` |\n\n---\n\n## 3. Contratos de Entrada y Salida\n- **Comando Canónico**: `bash verify.sh` o `npm run test:all`\n- **Output**: 56 pruebas pasando (16 Unit, 5 ATDD Smoke, 12 Whitebox, 8 Blackbox, 7 System, 1 Load, 7 Acceptance E2E).\n",
    "modules/testing-qa-suite/requirements-and-rules.md": "---\nid: MOD-TEST-RULES\ntitle: \"Módulo: testing-qa-suite — Requerimientos & Reglas de Negocio\"\nmodule: \"testing-qa-suite\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"requirements\", \"rules\", \"acceptance\", \"verification\"]\n---\n\n# Módulo: testing-qa-suite — Requerimientos & Reglas de Negocio\n\n---\n\n## 1. Requerimientos Funcionales Formales (IEEE 830)\n\n### `RF-TEST-001`: Pipeline de Verificación en 8 Niveles (`verify.sh`)\n- **Enunciado Formal**: Cuando se ejecute la verificación del proyecto, el sistema **debe** compilar el bundle con esbuild, correr pruebas unitarias, smoke ATDD, caja blanca, caja negra BVA, pruebas de sistema, prueba de carga concurrente y pruebas Playwright E2E, deteniendo la ejecución si algún nivel falla.\n\n---\n\n## 2. Reglas de Negocio Locales (BR-*)\n\n| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |\n|---|---|---|---|---|\n| `BR-TEST-001` | Crítica | `exitCode == 0` en todas las fases de `verify.sh` | `verify.sh` | Aborta commit o merge |\n| `BR-TEST-002` | Alta | Concurrencia de carga $p95 < 200\\text{ms}$ con 0% de fallos | `tests/load/server-concurrency.test.js` | Falla suite de carga |\n",
    "modules/testing-qa-suite/rules.md": "# Reglas de Negocio Invariantes: testing-qa-suite\r\n\r\n### BR-TEST-001: 100% Tests en Verde para Cierre de Spec\r\n- **Severidad**: Crítica\r\n- **Restricción**: Ningún spec o tarea puede cerrarse como `done` si existe un solo test fallando en la suite.\r\n- **Comportamiento ante Violación**: `verify-spec` rechaza el cierre y bloquea la reconciliación.\r\n\r\n### BR-TEST-002: Cero Dependencias Pesadas en Runtime de Testing\r\n- **Severidad**: Alta\r\n- **Restricción**: Las pruebas unitarias deben ejecutarse usando el ejecutor nativo `node --test` para garantizar tiempos de respuesta inferiores a 500ms y cero bloat de dependencias.\r\n- **Comportamiento ante Violación**: Se rechaza la instalación de frameworks redundantes.\r\n",
    "modules/testing-qa-suite/sequence.md": "# Flujo de Verificación Continua: testing-qa-suite\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor Runner as \"Implementer / Reviewer\"\r\n  participant NPM as \"npm test\"\r\n  participant RunnerNative as \"Node.js Test Runner\"\r\n  participant UnitTests as \"tests/unit/*.test.js\"\r\n  participant SmokeTests as \"tests/e2e/*.test.js\"\r\n\r\n  Runner->>NPM: \"Ejecutar npm test\"\r\n  NPM->>RunnerNative: \"node --test tests/unit/**/*.test.js\"\r\n  RunnerNative->>UnitTests: \"Ejecutar pruebas unitarias en paralelo\"\r\n  UnitTests-->>RunnerNative: \"8/8 pruebas pasando en verde\"\r\n  Runner->>SmokeTests: \"npm run test:e2e\"\r\n  SmokeTests-->>Runner: \"2/2 pruebas smoke pasando en verde\"\r\n```\r\n",
    "modules/testing-qa-suite/technical-debt-refactoring.md": "---\nid: MOD-TEST-DEBT\ntitle: \"Módulo: testing-qa-suite — Deuda Técnica & Refactorización\"\nmodule: \"testing-qa-suite\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"technical-debt\", \"qa\", \"continuous-integration\"]\n---\n\n# Módulo: testing-qa-suite — Deuda Técnica & Refactorización\n\n---\n\n## 1. Diagnóstico de Estado y Code Smells\n- **Puntos Fuertes**: Cobertura amplia en 8 niveles, runner nativo sin dependencias pesadas de Jest/Mocha.\n- **Riesgos Mitigados**:\n  - Se configuró el puerto dinámico de `serve.js` a `127.0.0.1:3333` con flag `NO_OPEN` para evitar ventanas emergentes automáticas durante las pruebas.\n  - Se añadieron selectores ID estrictos en Playwright para evitar violaciones de strict mode.\n",
    "modules/triple-sync-engine/data-and-transactions.md": "---\nid: MOD-SYNC-DATA\ntitle: \"Módulo: triple-sync-engine — Datos & Transacciones\"\nmodule: \"triple-sync-engine\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"data\", \"transactions\", \"filesystem\", \"parity\"]\n---\n\n# Módulo: triple-sync-engine — Datos & Transacciones\n\n---\n\n## 1. Topología de Espejos de Datos\n- **Fuente**: `.opencode/skills/{skill}/SKILL.md` (18 carpetas)\n- **Espejo Copilot**: `.github/skills/{skill}/SKILL.md`\n- **Espejo Antigravity**: `.agents/skills/{skill}/SKILL.md`\n\n---\n\n## 2. Invariante Transaccional\n- Toda sincronización se realiza mediante copia limpia de contenido con preservación del frontmatter exacto.\n",
    "modules/triple-sync-engine/diagrams.md": "---\nid: MOD-SYNC-DIAG\ntitle: \"Módulo: triple-sync-engine — Suite de 6 Diagramas\"\nmodule: \"triple-sync-engine\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"c3\", \"class\", \"sequence\", \"state\", \"activity\", \"erd\"]\n---\n\n# Módulo: triple-sync-engine — Suite de 6 Diagramas\n\n---\n\n## 1. Diagrama de Componentes C3 del Módulo\n\n```mermaid\nflowchart LR\n  subgraph ModuleSync[\"triple-sync-engine\"]\n    compEngine[\"SkillsSyncEngine\"]\n    compValidator[\"FrontmatterValidator\"]\n  end\n\n  sourceOpencode[(\".opencode/skills/ (Source of Truth)\")]\n  mirrorCopilot[(\".github/skills/ (Mirror 1)\")]\n  mirrorAgy[(\".agents/skills/ (Mirror 2)\")]\n\n  sourceOpencode --> compEngine\n  compEngine --> compValidator\n  compEngine -->|\"Replicación unidireccional\"| mirrorCopilot\n  compEngine -->|\"Replicación unidireccional\"| mirrorAgy\n```\n\n---\n\n## 2. Diagrama de Clases UML del Módulo\n\n```mermaid\nclassDiagram\n  class SkillsSyncEngine {\n    +syncAllSkills() SyncReport\n    +compareSkill(string name) DiffResult\n    +propagateSkill(string name) void\n  }\n\n  class FrontmatterValidator {\n    +validateParity(string name) bool\n    +extractMetadata(string content) SkillMeta\n  }\n\n  SkillsSyncEngine --> FrontmatterValidator : \"valida antes de replicar\"\n```\n\n---\n\n## 3. Diagrama de Secuencia de Sincronización Triple\n\n```mermaid\nsequenceDiagram\n  autonumber\n  actor User as \"Desarrollador / Agente\"\n  participant Sync as \"sync-skills\"\n  participant Opencode as \".opencode/ (Source)\"\n  participant Copilot as \".github/ (Mirror)\"\n  participant Agy as \".agents/ (Mirror)\"\n\n  User->>Sync: \"Ejecutar sync-skills\"\n  Sync->>Opencode: \"Leer 18 skills canónicas\"\n  Opencode-->>Sync: \"Contenido y Frontmatter\"\n  Sync->>Copilot: \"Propagar a .github/skills/\"\n  Sync->>Agy: \"Propagar a .agents/skills/\"\n  Sync-->>User: \"Reporte: 18 skills sincronizadas al 100%\"\n```\n\n---\n\n## 4. Diagrama de Máquina de Estados de una Skill\n\n```mermaid\nstateDiagram-v2\n  [*] --> SourceUpdated : \"Edición en .opencode/skills/\"\n  SourceUpdated --> VerifyingParity : \"sync-skills analiza diferencias\"\n  VerifyingParity --> MirrorsOutdated : \"Diferencia detectada en espejos\"\n  MirrorsOutdated --> InSync : \"Replicación a .github/ y .agents/\"\n  VerifyingParity --> InSync : \"Espejos idénticos al origen\"\n  InSync --> [*]\n```\n\n---\n\n## 5. Diagrama de Actividades de Sincronización\n\n```mermaid\nflowchart TD\n  actStart([\"Inicio sync-skills\"])\n  actRead[\"Lee skills en .opencode/\"]\n  actLoop[\"Itera sobre cada skill (1 a 18)\"]\n  checkDiff{\"Hay diferencia con espejos?\"}\n  actCopy[\"Copia hacia .github/ y .agents/\"]\n  actReport[\"Genera reporte de paridad\"]\n  actEnd([\"Fin: Espejos Homologados\"])\n\n  actStart --> actRead\n  actRead --> actLoop\n  actLoop --> checkDiff\n  checkDiff -->|Sí| actCopy\n  checkDiff -->|No| actLoop\n  actCopy --> actLoop\n  actLoop --> actReport\n  actReport --> actEnd\n```\n\n---\n\n## 6. Sub-Diagrama Entidad-Relación (ERD)\n\n```mermaid\nerDiagram\n  SKILL_SOURCE ||--|| SKILL_MIRROR_COPILOT : \"sincroniza a\"\n  SKILL_SOURCE ||--|| SKILL_MIRROR_AGY : \"sincroniza a\"\n\n  SKILL_SOURCE {\n    string name PK\n    string description\n    string platform\n  }\n\n  SKILL_MIRROR_COPILOT {\n    string name PK\n    string sync_status\n  }\n\n  SKILL_MIRROR_AGY {\n    string name PK\n    string sync_status\n  }\n```\n",
    "modules/triple-sync-engine/module-spec.md": "---\nid: MOD-SYNC-SPEC\ntitle: \"Módulo: triple-sync-engine — Especificación & Tarjetas CRC\"\nmodule: \"triple-sync-engine\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"triple-sync\", \"skills-sync\", \"source-of-truth\", \"crc-cards\"]\n---\n\n# Módulo: triple-sync-engine — Especificación & Tarjetas CRC\n\n> [!NOTE]\n> Bounded Context encargado de la sincronización triple y paridad absoluta de las 18 skills entre OpenCode (`.opencode/`), GitHub Copilot (`.github/`) y Google Antigravity (`.agents/`).\n\n---\n\n## 1. Alcance y Estado de Cobertura\n- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`\n- **Responsabilidad Primaria**: Asegurar que `.opencode/skills/` se mantenga como la única fuente de verdad inmutable y que cualquier cambio se propague de forma idéntica a los espejos sin divergencia de frontmatter ni instrucciones.\n\n---\n\n## 2. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)\n\n| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |\n|---|---|---|---|\n| `SkillsSyncEngine` | `<<SyncService>>` | 1. Leer skills en `.opencode/skills/`.<br/>2. Comparar con `.github/skills/` y `.agents/skills/`.<br/>3. Replicar contenido idéntico sin mutar el origen. | `FileSystem`, `SkillMirrorAuditor` |\n| `FrontmatterValidator` | `<<Validator>>` | 1. Parsear bloque YAML `name` y `description`.<br/>2. Comprobar paridad carácter por carácter en los 3 espejos. | `YAMLParser` |\n\n---\n\n## 3. Contratos de Entrada y Salida\n- **Fuente de Verdad**: `.opencode/skills/{skill}/SKILL.md`\n- **Destinos Espejo**: `.github/skills/{skill}/SKILL.md` y `.agents/skills/{skill}/SKILL.md`\n",
    "modules/triple-sync-engine/requirements-and-rules.md": "---\nid: MOD-SYNC-RULES\ntitle: \"Módulo: triple-sync-engine — Requerimientos & Reglas de Negocio\"\nmodule: \"triple-sync-engine\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"requirements\", \"rules\", \"triple-sync\", \"source-of-truth\"]\n---\n\n# Módulo: triple-sync-engine — Requerimientos & Reglas de Negocio\n\n---\n\n## 1. Requerimientos Funcionales Formales (IEEE 830)\n\n### `RF-SYNC-001`: Replicación Unidireccional de Skills\n- **Enunciado Formal**: Cuando se invoque la skill `sync-skills`, el sistema **debe** verificar cada una de las 18 skills en `.opencode/skills/` y propagar cualquier cambio a `.github/skills/` y `.agents/skills/` sin modificar jamás los archivos de origen.\n\n---\n\n## 2. Reglas de Negocio Locales (BR-*)\n\n| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |\n|---|---|---|---|---|\n| `BR-SYNC-001` | Crítica | `.opencode/skills/` es la única fuente de verdad | `.opencode/rules/skills-sync.md` | Prohibido sync inverso |\n| `BR-SYNC-002` | Alta | `frontmatter(opencode) === frontmatter(copilot) === frontmatter(agy)` | `sync-skills` | Falla paridad triple |\n",
    "modules/triple-sync-engine/rules.md": "# Reglas de Negocio Invariantes: triple-sync-engine\r\n\r\n### BR-SYNC-001: Fuente de Verdad Inviolable en .opencode/\r\n- **Severidad**: Crítica\r\n- **Restricción**: Toda skill nueva o modificación de una existente debe crearse o editarse en `.opencode/skills/`. Jamás editar un espejo directamente para luego retro-propagar.\r\n- **Comportamiento ante Violación**: Los cambios en espejos se sobrescriben automáticamente al ejecutar `/sync-skills`.\r\n\r\n### BR-SYNC-002: Paridad Estricta de Frontmatter\r\n- **Severidad**: Alta\r\n- **Restricción**: El bloque YAML inicial (`name` y `description`) debe ser estrictamente idéntico en las tres carpetas.\r\n- **Comportamiento ante Violación**: La skill es marcada como inconsistente en el reporte de sincronización.\r\n",
    "modules/triple-sync-engine/sequence.md": "# Flujo de Sincronización Triple: triple-sync-engine\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor Dev as \"Desarrollador / IA\"\r\n  participant Truth as \".opencode/skills/ (Fuente)\"\r\n  participant MirrorCopilot as \".github/skills/ (Espejo Copilot)\"\r\n  participant MirrorAGY as \".agents/skills/ (Espejo Antigravity)\"\r\n  participant SyncTool as \"Skill sync-skills\"\r\n\r\n  Dev->>Truth: \"Crear o actualizar {skill}/SKILL.md\"\r\n  Dev->>SyncTool: \"Invocar /sync-skills\"\r\n  SyncTool->>Truth: \"Leer archivos y frontmatter\"\r\n  SyncTool->>MirrorCopilot: \"Comparar hash y replicar cambios\"\r\n  SyncTool->>MirrorAGY: \"Comparar hash y replicar cambios\"\r\n  SyncTool-->>Dev: \"Reporte de paridad al 100% (0 diferencias)\"\r\n```\r\n",
    "modules/triple-sync-engine/technical-debt-refactoring.md": "---\nid: MOD-SYNC-DEBT\ntitle: \"Módulo: triple-sync-engine — Deuda Técnica & Refactorización\"\nmodule: \"triple-sync-engine\"\nstatus: \"Publicado\"\nversion: \"4.0.0\"\nlast_updated: \"2026-11-03\"\ntags: [\"technical-debt\", \"sync-automation\", \"parity\"]\n---\n\n# Módulo: triple-sync-engine — Deuda Técnica & Refactorización\n\n---\n\n## 1. Diagnóstico de Estado y Code Smells\n- **Puntos Fuertes**: La regla `BR-SYNC-001` evita discrepancias entre herramientas de IA al forzar `.opencode/skills/` como único origen.\n- **Riesgos Mitigados**:\n  - Todo cambio en `SKILL.md` se replica de forma triple inmediata en `.opencode/`, `.github/` y `.agents/`.\n",
    "system-capabilities.md": "# Inventario de Capacidades del Sistema (System Capabilities)\r\n\r\n> [!NOTE]\r\n> Inventario exhaustivo de capacidades para acelerar el onboarding técnico y prevenir la duplicación o re-implementación innecesaria de funcionalidades existentes.\r\n\r\n---\r\n\r\n## Matriz de Capacidades Instaladas\r\n\r\n| ID Capacidad | Módulo | Capacidad Funcional | Interfaz / Comando | Estado |\r\n| :--- | :--- | :--- | :--- | :--- |\r\n| `CAP-ORCH-001` | `agent-orchestrator` | Control estricto de ramas `{type}/INT-{id}/{name}` $\\le 80$c | Git hooks / Rules | Operativo [ACTIVO] |\r\n| `CAP-ORCH-002` | `agent-orchestrator` | Puerta de aprobación humana del spec | `ask_question` | Operativo [ACTIVO] |\r\n| `CAP-ORCH-003` | `agent-orchestrator` | Auditoría imparcial de calidad sin editar código | Subagente `reviewer` | Operativo [ACTIVO] |\r\n| `CAP-SYNC-001` | `triple-sync-engine` | Auditoría de paridad de skills en 3 plataformas | Skill `/sync-skills` | Operativo [ACTIVO] |\r\n| `CAP-SYNC-002` | `triple-sync-engine` | Replicación automática de skills a espejos | `sync-skills.sh` / Script | Operativo [ACTIVO] |\r\n| `CAP-KNOW-001` | `knowledge-engine` | Descubrimiento en 2 fases anti-context overflow | Skill `/project-knowledge` | Operativo [ACTIVO] |\r\n| `CAP-KNOW-002` | `knowledge-engine` | Modelado C4 & UML en Mermaid estricto | Plantillas canónicas | Operativo [ACTIVO] |\r\n| `CAP-KNOW-003` | `knowledge-engine` | Mantenimiento Docs-as-Code incremental | `project-docs/knowledge/` | Operativo [ACTIVO] |\r\n| `CAP-DASH-001` | `dashboard-visualizer` | Biblioteca por estantes con tarjeta Hero | `KnowledgeBase.js` | Operativo [ACTIVO] |\r\n| `CAP-DASH-002` | `dashboard-visualizer` | Lector editorial centrado 780px con TOC flotante | `MarkdownViewer.js` | Operativo [ACTIVO] |\r\n| `CAP-DASH-003` | `dashboard-visualizer` | Editor Dual ContextForge con scroll sincronizado | `KnowledgeBase.js` | Operativo [ACTIVO] |\r\n| `CAP-DASH-004` | `dashboard-visualizer` | Constelación 3D piramidal de 4 niveles | `SpaceView3D.js` | Operativo [ACTIVO] |\r\n| `CAP-DASH-005` | `dashboard-visualizer` | Búsqueda Global Omnibox modal (`Ctrl+K`) | `main.js` | Operativo [ACTIVO] |\r\n| `CAP-DASH-006` | `dashboard-visualizer` | Compatibilidad 100% offline (file:///) | `data-fallback.js` | Operativo [ACTIVO] |\r\n| `CAP-TEST-001` | `testing-qa-suite` | Pruebas unitarias nativas ultrarrápidas (<200ms) | `npm test` | Operativo [ACTIVO] |\r\n| `CAP-TEST-002` | `testing-qa-suite` | Pruebas smoke de evaluación web | `npm run test:e2e` | Operativo [ACTIVO] |\r\n| `CAP-TEST-003` | `testing-qa-suite` | Verificación de paridad y sincronización | `npm run sync` | Operativo [ACTIVO] |\r\n",
    "traceability-matrix.md": "# Matriz de Trazabilidad Cruzada (RTM)\r\n\r\n> [!NOTE]\r\n> Matriz de Trazabilidad de Requerimientos (RTM) que conecta requerimientos funcionales, reglas de negocio, historias de usuario, componentes de código y pruebas automatizadas.\r\n\r\n---\r\n\r\n## Matriz Bidireccional de Cobertura\r\n\r\n| Requerimiento Funcional | Regla de Negocio (`BR-*`) | Historia de Usuario | Componente / Archivo | Test Automatizado |\r\n| :--- | :--- | :--- | :--- | :--- |\r\n| `RF-ORCH-001` | `BR-ORCH-001` | `US-001` | `.agents/rules/antigravity-harness.md` | `tests/unit/branching-rules.test.js` |\r\n| `RF-ORCH-002` | `BR-ORCH-002` | `US-001` | `.agents/agents/leader.md` | `tests/unit/branching-rules.test.js` |\r\n| `RF-ORCH-003` | `BR-ORCH-002` | `US-001` | `.agents/rules/antigravity-harness.md` | Proceso interactivo (`ask_question`) |\r\n| `RF-ORCH-004` | `BR-ORCH-003` | `US-001` | `.agents/agents/reviewer.md` | Auditoría en `review_*.md` |\r\n| `RF-SYNC-001` | `BR-SYNC-001` | `US-002` | `.opencode/skills/sync-skills/` | `/sync-skills` audit report |\r\n| `RF-SYNC-002` | `BR-SYNC-002` | `US-002` | `.agents/skills/sync-skills/` | `SKILL.md` frontmatter check |\r\n| `RF-KNOW-001` | `BR-KNOW-002` | `US-003` | `.agents/skills/project-knowledge/` | `project-docs/knowledge/` scan |\r\n| `RF-KNOW-002` | `BR-KNOW-001` | `US-003` | `project-docs/knowledge/c4-model.md` | Mermaid Parser Validation |\r\n| `RF-DASH-001` | `BR-DASH-001` | `US-003` | `src/features/knowledge-base/` | `tests/unit/sync-data.test.js` |\r\n| `RF-DASH-002` | `BR-DASH-001` | `US-003` | `src/shared/MarkdownViewer.js` | `tests/unit/markdown-parser.test.js` |\r\n| `RF-DASH-003` | `BR-DASH-002` | `US-003` | `src/features/knowledge-base/` | `tests/unit/markdown-parser.test.js` |\r\n| `RF-DASH-004` | `BR-DASH-001` | `US-004` | `src/main.js` (Omnibox Modal) | `tests/e2e/dashboard-smoke.test.js` |\r\n| `RF-DASH-005` | `BR-DASH-001` | `US-003` | `src/features/space-view-3d/` | `tests/e2e/dashboard-smoke.test.js` |\r\n| `RF-TEST-001` | `BR-TEST-002` | `US-005` | `package.json` (`npm test`) | `tests/unit/*.test.js` |\r\n| `RF-TEST-002` | `BR-TEST-001` | `US-005` | `tests/e2e/dashboard-smoke.test.js` | `npm run test:e2e` |\r\n",
    "uml-diagrams.md": "# Diagramas UML — AI Agentic SDD Engineering Harness\r\n\r\n---\r\n\r\n## 1. Diagrama de Clases del Dominio SDD\r\n\r\nMuestra las entidades, value objects y relaciones del modelo conceptual del arnés:\r\n\r\n```mermaid\r\nclassDiagram\r\n  class Feature {\r\n    +int id\r\n    +string type\r\n    +string name\r\n    +string title\r\n    +string description\r\n    +string module\r\n    +string priority\r\n    +string branch\r\n    +string status\r\n    +List~string~ acceptance\r\n    +markCompleted()\r\n  }\r\n\r\n  class Subagent {\r\n    +string name\r\n    +string role\r\n    +List~string~ tools\r\n    +executeTask(Task task)\r\n  }\r\n\r\n  class KnowledgeDocument {\r\n    +string key\r\n    +string filename\r\n    +string title\r\n    +string shelf\r\n    +int readingTime\r\n    +int wordCount\r\n    +int ruleCount\r\n    +extractTOC() List~Heading~\r\n  }\r\n\r\n  class BusinessRule {\r\n    +string id\r\n    +string title\r\n    +string module\r\n    +string severity\r\n    +string description\r\n    +validate() bool\r\n  }\r\n\r\n  class ArchitecturalDecisionRecord {\r\n    +string id\r\n    +string title\r\n    +string status\r\n    +string context\r\n    +string decision\r\n    +string consequences\r\n  }\r\n\r\n  Feature \"1\" --> \"*\" BusinessRule : \"satisface\"\r\n  Feature \"1\" --> \"1\" Subagent : \"asignada a\"\r\n  KnowledgeDocument \"*\" --> \"*\" BusinessRule : \"documenta\"\r\n  KnowledgeDocument \"*\" --> \"*\" ArchitecturalDecisionRecord : \"registra\"\r\n```\r\n\r\n---\r\n\r\n## 2. Diagrama de Secuencia: Ciclo de Vida Completo SDD\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor User as \"Usuario (Humano)\"\r\n  participant Leader as \"Leader Agent\"\r\n  participant Git as \"Git System\"\r\n  participant SpecAuthor as \"Spec-Author\"\r\n  participant Implementer as \"Implementer\"\r\n  participant Reviewer as \"Reviewer\"\r\n\r\n  User->>Leader: \"Iniciar tarea INT-001\"\r\n  Leader->>Git: \"git checkout -b feature/INT-001/{name}\"\r\n  Leader->>SpecAuthor: \"Redactar requerimientos y tasks\"\r\n  SpecAuthor-->>Leader: \"specs/001/ completado (spec_ready)\"\r\n  Leader->>User: \"ask_question: Aprobar spec al 100%?\"\r\n  alt Spec Aprobado\r\n    User-->>Leader: \"Aprobado (in_progress)\"\r\n    Leader->>Implementer: \"Implementar código y tests\"\r\n    Implementer->>Implementer: \"Ejecutar checks.test y checks.build\"\r\n    Implementer-->>Leader: \"Trazabilidad R<->Tests completa\"\r\n    Leader->>Reviewer: \"Auditar calidad y consistencia\"\r\n    alt Reviewer Aprueba\r\n      Reviewer-->>Leader: \"APROBADO (0 errores)\"\r\n      Leader->>User: \"ask_question: Integrar a rama base?\"\r\n    else Reviewer Rechaza\r\n      Reviewer-->>Leader: \"RECHAZADO (hallazgos)\"\r\n      Leader->>Implementer: \"Corregir observaciones\"\r\n    end\r\n  else Spec Rechazado\r\n    User-->>Leader: \"Rechazar o solicitar cambios\"\r\n    Leader->>SpecAuthor: \"Ajustar especificación\"\r\n  end\r\n```\r\n\r\n---\r\n\r\n## 3. Diagrama de Secuencia: Editor Dual ContextForge con Scroll Sincronizado\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor User as \"Desarrollador\"\r\n  participant UI as \"Tablero Web (main.js)\"\r\n  participant Textarea as \"Panel Editor Markdown\"\r\n  participant Preview as \"Panel Live Preview\"\r\n  participant Blocks as \"Panel Bloques Visuales\"\r\n  participant Storage as \"sync-data.js / data-fallback.js\"\r\n\r\n  User->>UI: \"Pulsar [ Modo Editor ]\"\r\n  UI->>Textarea: \"Cargar markdown actual\"\r\n  UI->>Preview: \"renderMarkdown(content)\"\r\n  \r\n  alt Usuario edita en Textarea (Markdown)\r\n    User->>Textarea: \"Escribir texto y hacer scroll\"\r\n    Textarea->>Preview: \"Sincronizar scroll proporcionalmente (isScrollingFromEditor)\"\r\n    Textarea->>Preview: \"Actualizar HTML en vivo\"\r\n  else Usuario conmuta a [ Modo Bloques ]\r\n    User->>UI: \"Pulsar [ Modo Bloques Visuales ]\"\r\n    UI->>Blocks: \"parseMarkdownToBlocks(markdown)\"\r\n    Blocks-->>User: \"Renderizar tarjetas interactivas (H1, BR, Callouts)\"\r\n    User->>Blocks: \"Reordenar bloques o añadir bloque\"\r\n    Blocks->>Textarea: \"blocksToMarkdown(blocks)\"\r\n    Blocks->>Preview: \"Actualizar previsualización en vivo\"\r\n  end\r\n\r\n  User->>UI: \"Pulsar [ Guardar Cambios ]\"\r\n  UI->>Storage: \"store.saveDoc(key, content) + sync-data.js\"\r\n  Storage-->>User: \"Documento persistido local y offline\"\r\n```\r\n\r\n---\r\n\r\n## 4. Diagrama de Casos de Uso del Arnés SDD\r\n\r\n```mermaid\r\nflowchart TD\r\n  actorDev[\"Desarrollador\"]\r\n  actorAgent[\"Agente de IA\"]\r\n\r\n  subgraph UseCases[\"Casos de Uso del Arnés de Ingeniería\"]\r\n    ucAudit[\"Auditar Stack Técnico (/technical-audit)\"]\r\n    ucKnowledge[\"Extraer Base de Conocimiento (/project-knowledge)\"]\r\n    ucSpec[\"Redactar Requerimientos EARS (/generate-spec)\"]\r\n    ucHumanGate[\"Aprobar Puerta Humana (ask_question)\"]\r\n    ucImplement[\"Implementar Código & Tests (/implement)\"]\r\n    ucReview[\"Auditar Calidad & Trazabilidad (/review)\"]\r\n    ucViewDash[\"Navegar Tablero & Constelación 3D\"]\r\n    ucOmnibox[\"Búsqueda Global Omnibox (Ctrl+K)\"]\r\n    ucEditDual[\"Edición Dual Markdown / Bloques\"]\r\n  end\r\n\r\n  actorDev --> ucAudit\r\n  actorDev --> ucKnowledge\r\n  actorDev --> ucHumanGate\r\n  actorDev --> ucViewDash\r\n  actorDev --> ucOmnibox\r\n  actorDev --> ucEditDual\r\n\r\n  actorAgent --> ucSpec\r\n  actorAgent --> ucImplement\r\n  actorAgent --> ucReview\r\n  actorAgent --> ucKnowledge\r\n```\r\n",
    "user-stories-catalog.md": "# Catálogo de Historias de Usuario (INVEST, Scrum & XP)\r\n\r\n> [!NOTE]\r\n> Catálogo de Historias de Usuario bajo principios INVEST, Acuerdos de Calidad Scrum (DoR/DoD) y Prácticas Técnicas de Extreme Programming (XP).\r\n\r\n---\r\n\r\n## 1. Acuerdos de Calidad del Equipo\r\n\r\n### Definition of Ready (DoR) — Criterios para iniciar una Feature\r\n- [ ] La feature cuenta con nombre descriptivo en `snake_case` y rama `{type}/INT-{id}/{name}` $\\le 80$ caracteres.\r\n- [ ] Especificación técnica redactada por `spec-author` en `specs/{NNN}_{name}/` con requerimientos EARS, ADRs y checklist de tasks.\r\n- [ ] Criterios de aceptación redactados en formato Given / When / Then (Gherkin).\r\n- [ ] **Puerta Humana aprobada al 100%** mediante la herramienta `ask_question`.\r\n\r\n### Definition of Done (DoD) — Criterios para cerrar una Feature\r\n- [ ] Código de producción implementado y limpio según estándares de arquitectura.\r\n- [ ] 100% de las pruebas automatizadas pasando en verde (`npm test`, `checks.test`).\r\n- [ ] Tabla de trazabilidad $R \\leftrightarrow \\text{Tests}$ documentada en `progress/impl_{name}.md`.\r\n- [ ] Auditoría independiente del subagente `reviewer` con veredicto **APROBADO** en `progress/review_{name}.md`.\r\n- [ ] Datos sincronizados en el tablero con `node project-docs/sync-data.js`.\r\n- [ ] Commit semántico creado en la rama de trabajo.\r\n\r\n---\r\n\r\n## 2. Historias de Usuario (INVEST)\r\n\r\n### US-001: Orquestación Multi-Agente con Puertas Humanas\r\n- **Como** líder de ingeniería de software,\r\n- **Quiero** que el arnés coordine agentes especializados (`leader`, `spec-author`, `implementer`, `reviewer`) con pausas obligatorias `ask_question`,\r\n- **Para** asegurar que ninguna línea de código se escriba sin spec aprobado ni se fusione sin revisión independiente de calidad.\r\n- **Criterios de Aceptación (Gherkin)**:\r\n  - *Dado* que se inicia una nueva tarea `INT-001`,\r\n  - *Cuando* el subagente `spec-author` termina los requerimientos,\r\n  - *Entonces* el sistema se detiene y solicita aprobación explícita al usuario humano antes de invocar al `implementer`.\r\n\r\n### US-002: Sincronización Triple de Skills\r\n- **Como** desarrollador políglota de IA (Google Antigravity, OpenCode, Copilot),\r\n- **Quiero** que cualquier cambio en `.opencode/skills/` se replique automáticamente a `.github/` y `.agents/`,\r\n- **Para** contar con las mismas 18 capacidades de ingeniería sin importar la herramienta de IA que utilice.\r\n- **Criterios de Aceptación (Gherkin)**:\r\n  - *Dado* que se crea una nueva skill en `.opencode/skills/`,\r\n  - *Cuando* se ejecuta `/sync-skills`,\r\n  - *Entonces* se crean copias idénticas en `.github/skills/` y `.agents/skills/` con paridad total de frontmatter.\r\n\r\n### US-003: Biblioteca Editorial con Lector ContextForge y Editor Dual\r\n- **Como** arquitecto de sistemas,\r\n- **Quiero** una interfaz web con biblioteca por estantes temáticos, columna de lectura de 780px y editor dual Markdown/Bloques,\r\n- **Para** consultar y editar la documentación técnica del arnés con alta legibilidad y scroll sincronizado.\r\n- **Criterios de Aceptación (Gherkin)**:\r\n  - *Dado* que abro `project-docs/index.html` en el navegador,\r\n  - *Cuando* selecciono un documento de arquitectura,\r\n  - *Entonces* se visualiza en formato editorial con TOC lateral y al pulsar `Modo Editor` puedo editar directamente en bloques visuales o Markdown.\r\n\r\n### US-004: Búsqueda Global Omnibox con Atajo Ctrl+K\r\n- **Como** usuario del tablero,\r\n- **Quiero** abrir un buscador modal omnibox presionando `Ctrl+K` o `Cmd+K`,\r\n- **Para** localizar en milisegundos tareas (`INT-*`), documentos de arquitectura, reglas de negocio (`BR-*`) o módulos.\r\n- **Criterios de Aceptación (Gherkin)**:\r\n  - *Dado* que estoy en cualquier pestaña del tablero,\r\n  - *Cuando* presiono `Ctrl+K`,\r\n  - *Entonces* se abre el modal Omnibox permitiendo navegación por teclado y selección inmediata de resultados.\r\n\r\n### US-005: Suite de Pruebas Automatizadas Nativas\r\n- **Como** ingeniero de QA,\r\n- **Quiero** ejecutar pruebas unitarias y de aceptación con `npm test` sin dependencias externas pesadas,\r\n- **Para** verificar la integridad del arnés en menos de 500ms en entornos locales y pipelines CI/CD.\r\n- **Criterios de Aceptación (Gherkin)**:\r\n  - *Dado* que ejecuto `npm test`,\r\n  - *Cuando* se evalúan los tests de serialización, lectura y reglas de ramas,\r\n  - *Entonces* el 100% de las aserciones pasan en verde sin advertencias.\r\n"
  },
  "docMetadata": {
    "01-project-overview-and-business.md": {
      "key": "01-project-overview-and-business.md",
      "filename": "01-project-overview-and-business.md",
      "title": "Visión del Producto, Contexto de Negocio y Stakeholders (IEEE Std. 830-1998)",
      "summary": "El **AI Agentic SDD Engineering Harness** es un arnés universal y agnóstico de ingeniería de software dirigido por especificaciones (**Spec-Driven Development —...",
      "shelf": "standards",
      "readingTime": 7,
      "wordCount": 1211,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "02-architecture-and-patterns.md": {
      "key": "02-architecture-and-patterns.md",
      "filename": "02-architecture-and-patterns.md",
      "title": "Diagnóstico AS-IS de Arquitectura, Flujos de Datos y Catálogo de Patrones",
      "summary": "El repositorio implementa una **Arquitectura que Grita su Propósito (Screaming Architecture)**. El código no está organizado por capas genéricas superficiales (...",
      "shelf": "architecture",
      "readingTime": 4,
      "wordCount": 729,
      "lastModified": "2026-11-03",
      "ruleCount": 1,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "04-domain-ddd-and-crc.md": {
      "key": "04-domain-ddd-and-crc.md",
      "filename": "04-domain-ddd-and-crc.md",
      "title": "Modelo de Dominio DDD, Lenguaje Ubicuo y Tarjetas CRC",
      "summary": "1. **Core Domain (Dominio Central)**:",
      "shelf": "standards",
      "readingTime": 4,
      "wordCount": 637,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "adr-catalog.md": {
      "key": "adr-catalog.md",
      "filename": "adr-catalog.md",
      "title": "Catálogo de Decisiones de Arquitectura (ADR Catalog)",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "adrs",
      "readingTime": 3,
      "wordCount": 592,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 7,
      "isModule": false,
      "moduleName": null
    },
    "business-rules.md": {
      "key": "business-rules.md",
      "filename": "business-rules.md",
      "title": "Catálogo Canónico de Reglas de Negocio (Invariantes del Arnés)",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "business_rules",
      "readingTime": 3,
      "wordCount": 599,
      "lastModified": "2026-11-03",
      "ruleCount": 11,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "c4-model.md": {
      "key": "c4-model.md",
      "filename": "c4-model.md",
      "title": "Modelo C4 — AI Agentic SDD Engineering Harness",
      "summary": "Muestra los límites del arnés, los actores principales y los sistemas externos con los que interactúa:",
      "shelf": "architecture",
      "readingTime": 2,
      "wordCount": 303,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "coding-standards.md": {
      "key": "coding-standards.md",
      "filename": "coding-standards.md",
      "title": "Estándares de Codificación & Guardrails Anti-Sesgo",
      "summary": "1. **Prohibición de Librerías Fantasma**: Los agentes tienen estrictamente prohibido sugerir, instalar o importar paquetes o librerías que no figuren en `packag...",
      "shelf": "standards",
      "readingTime": 2,
      "wordCount": 265,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "data-dictionary.md": {
      "key": "data-dictionary.md",
      "filename": "data-dictionary.md",
      "title": "Diccionario de Datos & Persistencia Docs-as-Code",
      "summary": "erDiagram",
      "shelf": "architecture",
      "readingTime": 2,
      "wordCount": 345,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "external-services.md": {
      "key": "external-services.md",
      "filename": "external-services.md",
      "title": "Catálogo de Integraciones y Servicios Externos",
      "summary": "| Servicio / Herramienta | Tipo | Protocolo | Variables Requeridas | Política de Contingencia / Failover |",
      "shelf": "standards",
      "readingTime": 2,
      "wordCount": 215,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "functional-requirements.md": {
      "key": "functional-requirements.md",
      "filename": "functional-requirements.md",
      "title": "Especificación de Requerimientos del Sistema (SRS IEEE 830 / ISO 29148)",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "requirements",
      "readingTime": 4,
      "wordCount": 657,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 15,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "MASTER-PROJECT-KNOWLEDGE.md": {
      "key": "MASTER-PROJECT-KNOWLEDGE.md",
      "filename": "MASTER-PROJECT-KNOWLEDGE.md",
      "title": "Dossier Maestro Consolidado de Ingeniería Soberana (MASTER-PROJECT-KNOWLEDGE)",
      "summary": "1. [Capítulo 1: Visión del Producto, Contexto de Negocio y Stakeholders (IEEE 830)](#capítulo-1-visión-del-producto-contexto-de-negocio-y-stakeholders-ieee-830)",
      "shelf": "standards",
      "readingTime": 8,
      "wordCount": 1562,
      "lastModified": "2026-11-03",
      "ruleCount": 15,
      "reqCount": 13,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "modules/agent-orchestrator/data-and-transactions.md": {
      "key": "modules/agent-orchestrator/data-and-transactions.md",
      "filename": "data-and-transactions.md",
      "title": "Módulo: agent-orchestrator — Datos & Transacciones",
      "summary": "El orquestador interactúa con dos fuentes de persistencia:",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 169,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "agent-orchestrator"
    },
    "modules/agent-orchestrator/diagrams.md": {
      "key": "modules/agent-orchestrator/diagrams.md",
      "filename": "diagrams.md",
      "title": "Módulo: agent-orchestrator — Suite de 6 Diagramas",
      "summary": "flowchart LR",
      "shelf": "modules",
      "readingTime": 3,
      "wordCount": 440,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "agent-orchestrator"
    },
    "modules/agent-orchestrator/module-spec.md": {
      "key": "modules/agent-orchestrator/module-spec.md",
      "filename": "module-spec.md",
      "title": "Módulo: agent-orchestrator — Especificación & Tarjetas CRC",
      "summary": "| Clase / Agregado | Estereotipo | Responsabilidades | Colaboradores |",
      "shelf": "modules",
      "readingTime": 2,
      "wordCount": 315,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "agent-orchestrator"
    },
    "modules/agent-orchestrator/requirements-and-rules.md": {
      "key": "modules/agent-orchestrator/requirements-and-rules.md",
      "filename": "requirements-and-rules.md",
      "title": "Módulo: agent-orchestrator — Requerimientos & Reglas de Negocio",
      "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
      "shelf": "modules",
      "readingTime": 2,
      "wordCount": 341,
      "lastModified": "2026-11-03",
      "ruleCount": 3,
      "reqCount": 2,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "agent-orchestrator"
    },
    "modules/agent-orchestrator/rules.md": {
      "key": "modules/agent-orchestrator/rules.md",
      "filename": "rules.md",
      "title": "Reglas de Negocio Invariantes: agent-orchestrator",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 141,
      "lastModified": "2026-11-03",
      "ruleCount": 3,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "agent-orchestrator"
    },
    "modules/agent-orchestrator/sequence.md": {
      "key": "modules/agent-orchestrator/sequence.md",
      "filename": "sequence.md",
      "title": "Flujo de Orquestación Multi-Agente: agent-orchestrator",
      "summary": "sequenceDiagram",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 100,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "agent-orchestrator"
    },
    "modules/agent-orchestrator/technical-debt-refactoring.md": {
      "key": "modules/agent-orchestrator/technical-debt-refactoring.md",
      "filename": "technical-debt-refactoring.md",
      "title": "Módulo: agent-orchestrator — Deuda Técnica & Refactorización",
      "summary": "1. **Paso 1**: Incorporar telemetría de tiempos de respuesta por subagente en `progress/history.json`.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 139,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "agent-orchestrator"
    },
    "modules/dashboard-visualizer/data-and-transactions.md": {
      "key": "modules/dashboard-visualizer/data-and-transactions.md",
      "filename": "data-and-transactions.md",
      "title": "Módulo: dashboard-visualizer — Datos & Transacciones",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 172,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "dashboard-visualizer"
    },
    "modules/dashboard-visualizer/diagrams.md": {
      "key": "modules/dashboard-visualizer/diagrams.md",
      "filename": "diagrams.md",
      "title": "Módulo: dashboard-visualizer — Suite de 6 Diagramas",
      "summary": "flowchart LR",
      "shelf": "modules",
      "readingTime": 2,
      "wordCount": 377,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "dashboard-visualizer"
    },
    "modules/dashboard-visualizer/module-spec.md": {
      "key": "modules/dashboard-visualizer/module-spec.md",
      "filename": "module-spec.md",
      "title": "Módulo: dashboard-visualizer — Especificación & Tarjetas CRC",
      "summary": "| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |",
      "shelf": "modules",
      "readingTime": 2,
      "wordCount": 354,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "dashboard-visualizer"
    },
    "modules/dashboard-visualizer/requirements-and-rules.md": {
      "key": "modules/dashboard-visualizer/requirements-and-rules.md",
      "filename": "requirements-and-rules.md",
      "title": "Módulo: dashboard-visualizer — Requerimientos & Reglas de Negocio",
      "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
      "shelf": "modules",
      "readingTime": 2,
      "wordCount": 255,
      "lastModified": "2026-11-03",
      "ruleCount": 3,
      "reqCount": 3,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "dashboard-visualizer"
    },
    "modules/dashboard-visualizer/rules.md": {
      "key": "modules/dashboard-visualizer/rules.md",
      "filename": "rules.md",
      "title": "Reglas de Negocio Invariantes: dashboard-visualizer",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 91,
      "lastModified": "2026-11-03",
      "ruleCount": 2,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "dashboard-visualizer"
    },
    "modules/dashboard-visualizer/sequence.md": {
      "key": "modules/dashboard-visualizer/sequence.md",
      "filename": "sequence.md",
      "title": "Flujo de Renderizado y Navegación: dashboard-visualizer",
      "summary": "sequenceDiagram",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 115,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "dashboard-visualizer"
    },
    "modules/dashboard-visualizer/technical-debt-refactoring.md": {
      "key": "modules/dashboard-visualizer/technical-debt-refactoring.md",
      "filename": "technical-debt-refactoring.md",
      "title": "Módulo: dashboard-visualizer — Deuda Técnica & Refactorización",
      "summary": "1. **Paso 1**: Implementar el switcher de navegación de 3 niveles en `KnowledgeBase.js`.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 161,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "dashboard-visualizer"
    },
    "modules/knowledge-engine/data-and-transactions.md": {
      "key": "modules/knowledge-engine/data-and-transactions.md",
      "filename": "data-and-transactions.md",
      "title": "Módulo: knowledge-engine — Datos & Transacciones",
      "summary": "El archivo `knowledge-index.json` persiste:",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 98,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "knowledge-engine"
    },
    "modules/knowledge-engine/diagrams.md": {
      "key": "modules/knowledge-engine/diagrams.md",
      "filename": "diagrams.md",
      "title": "Módulo: knowledge-engine — Suite de 6 Diagramas",
      "summary": "flowchart LR",
      "shelf": "modules",
      "readingTime": 2,
      "wordCount": 381,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "knowledge-engine"
    },
    "modules/knowledge-engine/module-spec.md": {
      "key": "modules/knowledge-engine/module-spec.md",
      "filename": "module-spec.md",
      "title": "Módulo: knowledge-engine — Especificación & Tarjetas CRC",
      "summary": "| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |",
      "shelf": "modules",
      "readingTime": 2,
      "wordCount": 208,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "knowledge-engine"
    },
    "modules/knowledge-engine/requirements-and-rules.md": {
      "key": "modules/knowledge-engine/requirements-and-rules.md",
      "filename": "requirements-and-rules.md",
      "title": "Módulo: knowledge-engine — Requerimientos & Reglas de Negocio",
      "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
      "shelf": "modules",
      "readingTime": 2,
      "wordCount": 211,
      "lastModified": "2026-11-03",
      "ruleCount": 3,
      "reqCount": 2,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "knowledge-engine"
    },
    "modules/knowledge-engine/rules.md": {
      "key": "modules/knowledge-engine/rules.md",
      "filename": "rules.md",
      "title": "Reglas de Negocio Invariantes: knowledge-engine",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 102,
      "lastModified": "2026-11-03",
      "ruleCount": 2,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "knowledge-engine"
    },
    "modules/knowledge-engine/sequence.md": {
      "key": "modules/knowledge-engine/sequence.md",
      "filename": "sequence.md",
      "title": "Flujo de Elicitación y Extracción: knowledge-engine",
      "summary": "sequenceDiagram",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 95,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "knowledge-engine"
    },
    "modules/knowledge-engine/technical-debt-refactoring.md": {
      "key": "modules/knowledge-engine/technical-debt-refactoring.md",
      "filename": "technical-debt-refactoring.md",
      "title": "Módulo: knowledge-engine — Deuda Técnica & Refactorización",
      "summary": "1. **Paso 1**: Implementar compilador de `MASTER-PROJECT-KNOWLEDGE.md` integrado en `sync-data.js`.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 121,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "knowledge-engine"
    },
    "modules/testing-qa-suite/data-and-transactions.md": {
      "key": "modules/testing-qa-suite/data-and-transactions.md",
      "filename": "data-and-transactions.md",
      "title": "Módulo: testing-qa-suite — Datos & Transacciones",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 68,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "testing-qa-suite"
    },
    "modules/testing-qa-suite/diagrams.md": {
      "key": "modules/testing-qa-suite/diagrams.md",
      "filename": "diagrams.md",
      "title": "Módulo: testing-qa-suite — Suite de 6 Diagramas",
      "summary": "flowchart LR",
      "shelf": "modules",
      "readingTime": 2,
      "wordCount": 364,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "testing-qa-suite"
    },
    "modules/testing-qa-suite/module-spec.md": {
      "key": "modules/testing-qa-suite/module-spec.md",
      "filename": "module-spec.md",
      "title": "Módulo: testing-qa-suite — Especificación & Tarjetas CRC",
      "summary": "| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |",
      "shelf": "modules",
      "readingTime": 2,
      "wordCount": 214,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "testing-qa-suite"
    },
    "modules/testing-qa-suite/requirements-and-rules.md": {
      "key": "modules/testing-qa-suite/requirements-and-rules.md",
      "filename": "requirements-and-rules.md",
      "title": "Módulo: testing-qa-suite — Requerimientos & Reglas de Negocio",
      "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 170,
      "lastModified": "2026-11-03",
      "ruleCount": 2,
      "reqCount": 1,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "testing-qa-suite"
    },
    "modules/testing-qa-suite/rules.md": {
      "key": "modules/testing-qa-suite/rules.md",
      "filename": "rules.md",
      "title": "Reglas de Negocio Invariantes: testing-qa-suite",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 99,
      "lastModified": "2026-11-03",
      "ruleCount": 2,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "testing-qa-suite"
    },
    "modules/testing-qa-suite/sequence.md": {
      "key": "modules/testing-qa-suite/sequence.md",
      "filename": "sequence.md",
      "title": "Flujo de Verificación Continua: testing-qa-suite",
      "summary": "sequenceDiagram",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 66,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "testing-qa-suite"
    },
    "modules/testing-qa-suite/technical-debt-refactoring.md": {
      "key": "modules/testing-qa-suite/technical-debt-refactoring.md",
      "filename": "technical-debt-refactoring.md",
      "title": "Módulo: testing-qa-suite — Deuda Técnica & Refactorización",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 94,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "testing-qa-suite"
    },
    "modules/triple-sync-engine/data-and-transactions.md": {
      "key": "modules/triple-sync-engine/data-and-transactions.md",
      "filename": "data-and-transactions.md",
      "title": "Módulo: triple-sync-engine — Datos & Transacciones",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 72,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "triple-sync-engine"
    },
    "modules/triple-sync-engine/diagrams.md": {
      "key": "modules/triple-sync-engine/diagrams.md",
      "filename": "diagrams.md",
      "title": "Módulo: triple-sync-engine — Suite de 6 Diagramas",
      "summary": "flowchart LR",
      "shelf": "modules",
      "readingTime": 2,
      "wordCount": 352,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "triple-sync-engine"
    },
    "modules/triple-sync-engine/module-spec.md": {
      "key": "modules/triple-sync-engine/module-spec.md",
      "filename": "module-spec.md",
      "title": "Módulo: triple-sync-engine — Especificación & Tarjetas CRC",
      "summary": "| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 196,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "triple-sync-engine"
    },
    "modules/triple-sync-engine/requirements-and-rules.md": {
      "key": "modules/triple-sync-engine/requirements-and-rules.md",
      "filename": "requirements-and-rules.md",
      "title": "Módulo: triple-sync-engine — Requerimientos & Reglas de Negocio",
      "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 148,
      "lastModified": "2026-11-03",
      "ruleCount": 2,
      "reqCount": 1,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "triple-sync-engine"
    },
    "modules/triple-sync-engine/rules.md": {
      "key": "modules/triple-sync-engine/rules.md",
      "filename": "rules.md",
      "title": "Reglas de Negocio Invariantes: triple-sync-engine",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 96,
      "lastModified": "2026-11-03",
      "ruleCount": 2,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "triple-sync-engine"
    },
    "modules/triple-sync-engine/sequence.md": {
      "key": "modules/triple-sync-engine/sequence.md",
      "filename": "sequence.md",
      "title": "Flujo de Sincronización Triple: triple-sync-engine",
      "summary": "sequenceDiagram",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 71,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "triple-sync-engine"
    },
    "modules/triple-sync-engine/technical-debt-refactoring.md": {
      "key": "modules/triple-sync-engine/technical-debt-refactoring.md",
      "filename": "technical-debt-refactoring.md",
      "title": "Módulo: triple-sync-engine — Deuda Técnica & Refactorización",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 78,
      "lastModified": "2026-11-03",
      "ruleCount": 1,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "triple-sync-engine"
    },
    "system-capabilities.md": {
      "key": "system-capabilities.md",
      "filename": "system-capabilities.md",
      "title": "Inventario de Capacidades del Sistema (System Capabilities)",
      "summary": "| ID Capacidad | Módulo | Capacidad Funcional | Interfaz / Comando | Estado |",
      "shelf": "standards",
      "readingTime": 2,
      "wordCount": 362,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "traceability-matrix.md": {
      "key": "traceability-matrix.md",
      "filename": "traceability-matrix.md",
      "title": "Matriz de Trazabilidad Cruzada (RTM)",
      "summary": "| Requerimiento Funcional | Regla de Negocio (`BR-*`) | Historia de Usuario | Componente / Archivo | Test Automatizado |",
      "shelf": "requirements",
      "readingTime": 2,
      "wordCount": 250,
      "lastModified": "2026-11-03",
      "ruleCount": 15,
      "reqCount": 15,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "uml-diagrams.md": {
      "key": "uml-diagrams.md",
      "filename": "uml-diagrams.md",
      "title": "Diagramas UML — AI Agentic SDD Engineering Harness",
      "summary": "Muestra las entidades, value objects y relaciones del modelo conceptual del arnés:",
      "shelf": "architecture",
      "readingTime": 3,
      "wordCount": 515,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    },
    "user-stories-catalog.md": {
      "key": "user-stories-catalog.md",
      "filename": "user-stories-catalog.md",
      "title": "Catálogo de Historias de Usuario (INVEST, Scrum & XP)",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "requirements",
      "readingTime": 4,
      "wordCount": 627,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": false,
      "moduleName": null
    }
  },
  "shelves": {
    "architecture": {
      "id": "architecture",
      "title": "Arquitectura & Modelado C4",
      "iconName": "architecture",
      "docs": [
        "02-architecture-and-patterns.md",
        "c4-model.md",
        "data-dictionary.md",
        "uml-diagrams.md"
      ]
    },
    "business_rules": {
      "id": "business_rules",
      "title": "Reglas de Negocio & Dominio",
      "iconName": "business_rules",
      "docs": [
        "business-rules.md"
      ]
    },
    "requirements": {
      "id": "requirements",
      "title": "Requerimientos & Metodología Ágil",
      "iconName": "requirements",
      "docs": [
        "functional-requirements.md",
        "traceability-matrix.md",
        "user-stories-catalog.md"
      ]
    },
    "adrs": {
      "id": "adrs",
      "title": "Decisiones de Arquitectura (ADRs)",
      "iconName": "adrs",
      "docs": [
        "adr-catalog.md"
      ]
    },
    "standards": {
      "id": "standards",
      "title": "Estándares, Capacidades & Servicios",
      "iconName": "standards",
      "docs": [
        "01-project-overview-and-business.md",
        "04-domain-ddd-and-crc.md",
        "coding-standards.md",
        "external-services.md",
        "MASTER-PROJECT-KNOWLEDGE.md",
        "system-capabilities.md"
      ]
    },
    "modules": {
      "id": "modules",
      "title": "Módulos & Bounded Contexts",
      "iconName": "modules",
      "docs": [
        "modules/agent-orchestrator/data-and-transactions.md",
        "modules/agent-orchestrator/diagrams.md",
        "modules/agent-orchestrator/module-spec.md",
        "modules/agent-orchestrator/requirements-and-rules.md",
        "modules/agent-orchestrator/rules.md",
        "modules/agent-orchestrator/sequence.md",
        "modules/agent-orchestrator/technical-debt-refactoring.md",
        "modules/dashboard-visualizer/data-and-transactions.md",
        "modules/dashboard-visualizer/diagrams.md",
        "modules/dashboard-visualizer/module-spec.md",
        "modules/dashboard-visualizer/requirements-and-rules.md",
        "modules/dashboard-visualizer/rules.md",
        "modules/dashboard-visualizer/sequence.md",
        "modules/dashboard-visualizer/technical-debt-refactoring.md",
        "modules/knowledge-engine/data-and-transactions.md",
        "modules/knowledge-engine/diagrams.md",
        "modules/knowledge-engine/module-spec.md",
        "modules/knowledge-engine/requirements-and-rules.md",
        "modules/knowledge-engine/rules.md",
        "modules/knowledge-engine/sequence.md",
        "modules/knowledge-engine/technical-debt-refactoring.md",
        "modules/testing-qa-suite/data-and-transactions.md",
        "modules/testing-qa-suite/diagrams.md",
        "modules/testing-qa-suite/module-spec.md",
        "modules/testing-qa-suite/requirements-and-rules.md",
        "modules/testing-qa-suite/rules.md",
        "modules/testing-qa-suite/sequence.md",
        "modules/testing-qa-suite/technical-debt-refactoring.md",
        "modules/triple-sync-engine/data-and-transactions.md",
        "modules/triple-sync-engine/diagrams.md",
        "modules/triple-sync-engine/module-spec.md",
        "modules/triple-sync-engine/requirements-and-rules.md",
        "modules/triple-sync-engine/rules.md",
        "modules/triple-sync-engine/sequence.md",
        "modules/triple-sync-engine/technical-debt-refactoring.md"
      ]
    }
  },
  "modulesData": {
    "agent-orchestrator": {
      "id": "agent-orchestrator",
      "name": "agent-orchestrator",
      "title": "Agent Orchestrator",
      "status": "COMPLETAMENTE CUBIERTO",
      "docs": [
        "modules/agent-orchestrator/data-and-transactions.md",
        "modules/agent-orchestrator/diagrams.md",
        "modules/agent-orchestrator/module-spec.md",
        "modules/agent-orchestrator/requirements-and-rules.md",
        "modules/agent-orchestrator/rules.md",
        "modules/agent-orchestrator/sequence.md",
        "modules/agent-orchestrator/technical-debt-refactoring.md"
      ],
      "docMetadata": {
        "data-and-transactions.md": {
          "key": "modules/agent-orchestrator/data-and-transactions.md",
          "filename": "data-and-transactions.md",
          "title": "Módulo: agent-orchestrator — Datos & Transacciones",
          "summary": "El orquestador interactúa con dos fuentes de persistencia:",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 169,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "agent-orchestrator"
        },
        "diagrams.md": {
          "key": "modules/agent-orchestrator/diagrams.md",
          "filename": "diagrams.md",
          "title": "Módulo: agent-orchestrator — Suite de 6 Diagramas",
          "summary": "flowchart LR",
          "shelf": "modules",
          "readingTime": 3,
          "wordCount": 440,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "agent-orchestrator"
        },
        "module-spec.md": {
          "key": "modules/agent-orchestrator/module-spec.md",
          "filename": "module-spec.md",
          "title": "Módulo: agent-orchestrator — Especificación & Tarjetas CRC",
          "summary": "| Clase / Agregado | Estereotipo | Responsabilidades | Colaboradores |",
          "shelf": "modules",
          "readingTime": 2,
          "wordCount": 315,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "agent-orchestrator"
        },
        "requirements-and-rules.md": {
          "key": "modules/agent-orchestrator/requirements-and-rules.md",
          "filename": "requirements-and-rules.md",
          "title": "Módulo: agent-orchestrator — Requerimientos & Reglas de Negocio",
          "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
          "shelf": "modules",
          "readingTime": 2,
          "wordCount": 341,
          "lastModified": "2026-11-03",
          "ruleCount": 3,
          "reqCount": 2,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "agent-orchestrator"
        },
        "rules.md": {
          "key": "modules/agent-orchestrator/rules.md",
          "filename": "rules.md",
          "title": "Reglas de Negocio Invariantes: agent-orchestrator",
          "summary": "Documentación técnica y especificación formal de ingeniería.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 141,
          "lastModified": "2026-11-03",
          "ruleCount": 3,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "agent-orchestrator"
        },
        "sequence.md": {
          "key": "modules/agent-orchestrator/sequence.md",
          "filename": "sequence.md",
          "title": "Flujo de Orquestación Multi-Agente: agent-orchestrator",
          "summary": "sequenceDiagram",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 100,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "agent-orchestrator"
        },
        "technical-debt-refactoring.md": {
          "key": "modules/agent-orchestrator/technical-debt-refactoring.md",
          "filename": "technical-debt-refactoring.md",
          "title": "Módulo: agent-orchestrator — Deuda Técnica & Refactorización",
          "summary": "1. **Paso 1**: Incorporar telemetría de tiempos de respuesta por subagente en `progress/history.json`.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 139,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "agent-orchestrator"
        }
      }
    },
    "dashboard-visualizer": {
      "id": "dashboard-visualizer",
      "name": "dashboard-visualizer",
      "title": "Dashboard Visualizer",
      "status": "COMPLETAMENTE CUBIERTO",
      "docs": [
        "modules/dashboard-visualizer/data-and-transactions.md",
        "modules/dashboard-visualizer/diagrams.md",
        "modules/dashboard-visualizer/module-spec.md",
        "modules/dashboard-visualizer/requirements-and-rules.md",
        "modules/dashboard-visualizer/rules.md",
        "modules/dashboard-visualizer/sequence.md",
        "modules/dashboard-visualizer/technical-debt-refactoring.md"
      ],
      "docMetadata": {
        "data-and-transactions.md": {
          "key": "modules/dashboard-visualizer/data-and-transactions.md",
          "filename": "data-and-transactions.md",
          "title": "Módulo: dashboard-visualizer — Datos & Transacciones",
          "summary": "Documentación técnica y especificación formal de ingeniería.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 172,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "dashboard-visualizer"
        },
        "diagrams.md": {
          "key": "modules/dashboard-visualizer/diagrams.md",
          "filename": "diagrams.md",
          "title": "Módulo: dashboard-visualizer — Suite de 6 Diagramas",
          "summary": "flowchart LR",
          "shelf": "modules",
          "readingTime": 2,
          "wordCount": 377,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "dashboard-visualizer"
        },
        "module-spec.md": {
          "key": "modules/dashboard-visualizer/module-spec.md",
          "filename": "module-spec.md",
          "title": "Módulo: dashboard-visualizer — Especificación & Tarjetas CRC",
          "summary": "| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |",
          "shelf": "modules",
          "readingTime": 2,
          "wordCount": 354,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "dashboard-visualizer"
        },
        "requirements-and-rules.md": {
          "key": "modules/dashboard-visualizer/requirements-and-rules.md",
          "filename": "requirements-and-rules.md",
          "title": "Módulo: dashboard-visualizer — Requerimientos & Reglas de Negocio",
          "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
          "shelf": "modules",
          "readingTime": 2,
          "wordCount": 255,
          "lastModified": "2026-11-03",
          "ruleCount": 3,
          "reqCount": 3,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "dashboard-visualizer"
        },
        "rules.md": {
          "key": "modules/dashboard-visualizer/rules.md",
          "filename": "rules.md",
          "title": "Reglas de Negocio Invariantes: dashboard-visualizer",
          "summary": "Documentación técnica y especificación formal de ingeniería.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 91,
          "lastModified": "2026-11-03",
          "ruleCount": 2,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "dashboard-visualizer"
        },
        "sequence.md": {
          "key": "modules/dashboard-visualizer/sequence.md",
          "filename": "sequence.md",
          "title": "Flujo de Renderizado y Navegación: dashboard-visualizer",
          "summary": "sequenceDiagram",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 115,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "dashboard-visualizer"
        },
        "technical-debt-refactoring.md": {
          "key": "modules/dashboard-visualizer/technical-debt-refactoring.md",
          "filename": "technical-debt-refactoring.md",
          "title": "Módulo: dashboard-visualizer — Deuda Técnica & Refactorización",
          "summary": "1. **Paso 1**: Implementar el switcher de navegación de 3 niveles en `KnowledgeBase.js`.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 161,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "dashboard-visualizer"
        }
      }
    },
    "knowledge-engine": {
      "id": "knowledge-engine",
      "name": "knowledge-engine",
      "title": "Knowledge Engine",
      "status": "COMPLETAMENTE CUBIERTO",
      "docs": [
        "modules/knowledge-engine/data-and-transactions.md",
        "modules/knowledge-engine/diagrams.md",
        "modules/knowledge-engine/module-spec.md",
        "modules/knowledge-engine/requirements-and-rules.md",
        "modules/knowledge-engine/rules.md",
        "modules/knowledge-engine/sequence.md",
        "modules/knowledge-engine/technical-debt-refactoring.md"
      ],
      "docMetadata": {
        "data-and-transactions.md": {
          "key": "modules/knowledge-engine/data-and-transactions.md",
          "filename": "data-and-transactions.md",
          "title": "Módulo: knowledge-engine — Datos & Transacciones",
          "summary": "El archivo `knowledge-index.json` persiste:",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 98,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "knowledge-engine"
        },
        "diagrams.md": {
          "key": "modules/knowledge-engine/diagrams.md",
          "filename": "diagrams.md",
          "title": "Módulo: knowledge-engine — Suite de 6 Diagramas",
          "summary": "flowchart LR",
          "shelf": "modules",
          "readingTime": 2,
          "wordCount": 381,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "knowledge-engine"
        },
        "module-spec.md": {
          "key": "modules/knowledge-engine/module-spec.md",
          "filename": "module-spec.md",
          "title": "Módulo: knowledge-engine — Especificación & Tarjetas CRC",
          "summary": "| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |",
          "shelf": "modules",
          "readingTime": 2,
          "wordCount": 208,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "knowledge-engine"
        },
        "requirements-and-rules.md": {
          "key": "modules/knowledge-engine/requirements-and-rules.md",
          "filename": "requirements-and-rules.md",
          "title": "Módulo: knowledge-engine — Requerimientos & Reglas de Negocio",
          "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
          "shelf": "modules",
          "readingTime": 2,
          "wordCount": 211,
          "lastModified": "2026-11-03",
          "ruleCount": 3,
          "reqCount": 2,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "knowledge-engine"
        },
        "rules.md": {
          "key": "modules/knowledge-engine/rules.md",
          "filename": "rules.md",
          "title": "Reglas de Negocio Invariantes: knowledge-engine",
          "summary": "Documentación técnica y especificación formal de ingeniería.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 102,
          "lastModified": "2026-11-03",
          "ruleCount": 2,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "knowledge-engine"
        },
        "sequence.md": {
          "key": "modules/knowledge-engine/sequence.md",
          "filename": "sequence.md",
          "title": "Flujo de Elicitación y Extracción: knowledge-engine",
          "summary": "sequenceDiagram",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 95,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "knowledge-engine"
        },
        "technical-debt-refactoring.md": {
          "key": "modules/knowledge-engine/technical-debt-refactoring.md",
          "filename": "technical-debt-refactoring.md",
          "title": "Módulo: knowledge-engine — Deuda Técnica & Refactorización",
          "summary": "1. **Paso 1**: Implementar compilador de `MASTER-PROJECT-KNOWLEDGE.md` integrado en `sync-data.js`.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 121,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "knowledge-engine"
        }
      }
    },
    "testing-qa-suite": {
      "id": "testing-qa-suite",
      "name": "testing-qa-suite",
      "title": "Testing Qa Suite",
      "status": "COMPLETAMENTE CUBIERTO",
      "docs": [
        "modules/testing-qa-suite/data-and-transactions.md",
        "modules/testing-qa-suite/diagrams.md",
        "modules/testing-qa-suite/module-spec.md",
        "modules/testing-qa-suite/requirements-and-rules.md",
        "modules/testing-qa-suite/rules.md",
        "modules/testing-qa-suite/sequence.md",
        "modules/testing-qa-suite/technical-debt-refactoring.md"
      ],
      "docMetadata": {
        "data-and-transactions.md": {
          "key": "modules/testing-qa-suite/data-and-transactions.md",
          "filename": "data-and-transactions.md",
          "title": "Módulo: testing-qa-suite — Datos & Transacciones",
          "summary": "Documentación técnica y especificación formal de ingeniería.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 68,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "testing-qa-suite"
        },
        "diagrams.md": {
          "key": "modules/testing-qa-suite/diagrams.md",
          "filename": "diagrams.md",
          "title": "Módulo: testing-qa-suite — Suite de 6 Diagramas",
          "summary": "flowchart LR",
          "shelf": "modules",
          "readingTime": 2,
          "wordCount": 364,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "testing-qa-suite"
        },
        "module-spec.md": {
          "key": "modules/testing-qa-suite/module-spec.md",
          "filename": "module-spec.md",
          "title": "Módulo: testing-qa-suite — Especificación & Tarjetas CRC",
          "summary": "| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |",
          "shelf": "modules",
          "readingTime": 2,
          "wordCount": 214,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "testing-qa-suite"
        },
        "requirements-and-rules.md": {
          "key": "modules/testing-qa-suite/requirements-and-rules.md",
          "filename": "requirements-and-rules.md",
          "title": "Módulo: testing-qa-suite — Requerimientos & Reglas de Negocio",
          "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 170,
          "lastModified": "2026-11-03",
          "ruleCount": 2,
          "reqCount": 1,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "testing-qa-suite"
        },
        "rules.md": {
          "key": "modules/testing-qa-suite/rules.md",
          "filename": "rules.md",
          "title": "Reglas de Negocio Invariantes: testing-qa-suite",
          "summary": "Documentación técnica y especificación formal de ingeniería.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 99,
          "lastModified": "2026-11-03",
          "ruleCount": 2,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "testing-qa-suite"
        },
        "sequence.md": {
          "key": "modules/testing-qa-suite/sequence.md",
          "filename": "sequence.md",
          "title": "Flujo de Verificación Continua: testing-qa-suite",
          "summary": "sequenceDiagram",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 66,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "testing-qa-suite"
        },
        "technical-debt-refactoring.md": {
          "key": "modules/testing-qa-suite/technical-debt-refactoring.md",
          "filename": "technical-debt-refactoring.md",
          "title": "Módulo: testing-qa-suite — Deuda Técnica & Refactorización",
          "summary": "Documentación técnica y especificación formal de ingeniería.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 94,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "testing-qa-suite"
        }
      }
    },
    "triple-sync-engine": {
      "id": "triple-sync-engine",
      "name": "triple-sync-engine",
      "title": "Triple Sync Engine",
      "status": "COMPLETAMENTE CUBIERTO",
      "docs": [
        "modules/triple-sync-engine/data-and-transactions.md",
        "modules/triple-sync-engine/diagrams.md",
        "modules/triple-sync-engine/module-spec.md",
        "modules/triple-sync-engine/requirements-and-rules.md",
        "modules/triple-sync-engine/rules.md",
        "modules/triple-sync-engine/sequence.md",
        "modules/triple-sync-engine/technical-debt-refactoring.md"
      ],
      "docMetadata": {
        "data-and-transactions.md": {
          "key": "modules/triple-sync-engine/data-and-transactions.md",
          "filename": "data-and-transactions.md",
          "title": "Módulo: triple-sync-engine — Datos & Transacciones",
          "summary": "Documentación técnica y especificación formal de ingeniería.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 72,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "triple-sync-engine"
        },
        "diagrams.md": {
          "key": "modules/triple-sync-engine/diagrams.md",
          "filename": "diagrams.md",
          "title": "Módulo: triple-sync-engine — Suite de 6 Diagramas",
          "summary": "flowchart LR",
          "shelf": "modules",
          "readingTime": 2,
          "wordCount": 352,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "triple-sync-engine"
        },
        "module-spec.md": {
          "key": "modules/triple-sync-engine/module-spec.md",
          "filename": "module-spec.md",
          "title": "Módulo: triple-sync-engine — Especificación & Tarjetas CRC",
          "summary": "| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 196,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "triple-sync-engine"
        },
        "requirements-and-rules.md": {
          "key": "modules/triple-sync-engine/requirements-and-rules.md",
          "filename": "requirements-and-rules.md",
          "title": "Módulo: triple-sync-engine — Requerimientos & Reglas de Negocio",
          "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 148,
          "lastModified": "2026-11-03",
          "ruleCount": 2,
          "reqCount": 1,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "triple-sync-engine"
        },
        "rules.md": {
          "key": "modules/triple-sync-engine/rules.md",
          "filename": "rules.md",
          "title": "Reglas de Negocio Invariantes: triple-sync-engine",
          "summary": "Documentación técnica y especificación formal de ingeniería.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 96,
          "lastModified": "2026-11-03",
          "ruleCount": 2,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "triple-sync-engine"
        },
        "sequence.md": {
          "key": "modules/triple-sync-engine/sequence.md",
          "filename": "sequence.md",
          "title": "Flujo de Sincronización Triple: triple-sync-engine",
          "summary": "sequenceDiagram",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 71,
          "lastModified": "2026-11-03",
          "ruleCount": 0,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "triple-sync-engine"
        },
        "technical-debt-refactoring.md": {
          "key": "modules/triple-sync-engine/technical-debt-refactoring.md",
          "filename": "technical-debt-refactoring.md",
          "title": "Módulo: triple-sync-engine — Deuda Técnica & Refactorización",
          "summary": "Documentación técnica y especificación formal de ingeniería.",
          "shelf": "modules",
          "readingTime": 1,
          "wordCount": 78,
          "lastModified": "2026-11-03",
          "ruleCount": 1,
          "reqCount": 0,
          "adrCount": 0,
          "isModule": true,
          "moduleName": "triple-sync-engine"
        }
      }
    }
  }
}
};
