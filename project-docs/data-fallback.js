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
      "title": "Tablero Editorial con Lector ContextForge y Editor Dual",
      "description": "Interfaz visual con Tailwind CSS v4, estantes temáticos, columna de lectura 780px, scrollspy TOC y editor dual Markdown/Bloques.",
      "module": "dashboard-visualizer",
      "priority": "P0",
      "weight": 95,
      "branch": "feature/INT-004/dashboard_editorial_dual_editor",
      "spec_folder": "specs/004_dashboard_editorial_dual_editor",
      "status": "done",
      "acceptance": [
        "Biblioteca organizada por estantes temáticos con tarjeta Hero destacada",
        "Lector de artículos con ancho centrado a 780px e interlineado 1.75em",
        "Editor dual ContextForge con soporte de bloques visuales y scroll sincronizado proporcional"
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
      "status": "in_progress",
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
      "status": "pending",
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
    "type": "universal-agentic-harness",
    "architecture": "Multi-Agent System (MAS) + Screaming Architecture + Triple-Mirror Sync + Docs-as-Code"
  },
  "runtime": {
    "language": "Node.js (Universal Tooling) & Multi-Stack Agnostic",
    "version": "Node.js v18+ / Agnóstico para proyectos cliente (.NET, Python, Go, Node, Rust)",
    "packageManager": "npm"
  },
  "environment": {
    "required": [],
    "optional": [
      {
        "name": "PORT",
        "description": "Puerto para el servidor HTTP local de visualización",
        "defaultValue": "3000"
      },
      {
        "name": "CI",
        "description": "Indicador de entorno de integración continua",
        "defaultValue": "false"
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
        "description": "Reglas canónicas de branching ({type}/INT-{id}/{name} ≤80c) y commits semánticos en .agents/, .opencode/ y .github/."
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
      "tech": "Antigravity Roles, OpenCode Rules, Copilot Instructions",
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
    "verify": {
      "command": "node project-docs/sync-data.js",
      "timeout": 60
    }
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
      "type": "c4",
      "title": "Modelo C4 - Contexto de Sistema (C1)"
    },
    {
      "id": "c2",
      "type": "c4",
      "title": "Modelo C4 - Contenedores del Arnés (C2)"
    },
    {
      "id": "c3",
      "type": "c4",
      "title": "Modelo C4 - Componentes del Tablero Web (C3)"
    },
    {
      "id": "class",
      "type": "uml",
      "title": "Diagrama de Clases del Dominio SDD"
    },
    {
      "id": "seq-sdd",
      "type": "sequence",
      "title": "Secuencia: Ciclo de Vida Completo SDD"
    },
    {
      "id": "seq-editor",
      "type": "sequence",
      "title": "Secuencia: Editor Dual ContextForge"
    },
    {
      "id": "erd",
      "type": "erd",
      "title": "Diagrama Entidad-Relación (ERD)"
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
    "adr-catalog.md": "# Catálogo de Decisiones de Arquitectura (ADR Catalog)\n\n> [!NOTE]\n> Registro canónico de Decisiones de Arquitectura (ADR) según el formato Michael Nygard. Documenta el qué, el por qué y las consecuencias técnicas asumidas para evitar refactorizaciones regresivas por parte de agentes de IA.\n\n---\n\n## ADR-001: Desacoplamiento Universal de Subagentes (Multi-Stack Agnostic)\n- **Fecha**: 2026-11-02\n- **Estado**: Aceptado\n- **Contexto**: Anteriormente los subagentes `implementer` y `reviewer` ejecutaban comandos fijos de `.NET` (`dotnet build /warnaserror`), fallando en repositorios políglotas o basados en Node.js, Python o Go.\n- **Decisión**: Los subagentes inspeccionan dinámicamente el bloque `checks` de `project-spec.yaml` para obtener los comandos específicos de compilación y pruebas del proyecto objetivo.\n- **Consecuencias**: El arnés opera de manera transparente sobre cualquier stack tecnológico preservando la misma disciplina SDD.\n\n---\n\n## ADR-002: Sincronización Triple de Skills con Fuente de Verdad Única\n- **Fecha**: 2026-11-01\n- **Estado**: Aceptado\n- **Contexto**: El desarrollo asistido por IA ocurre a menudo en múltiples plataformas (Google Antigravity, OpenCode, GitHub Copilot). Mantener skills dispersas producía drift funcional.\n- **Decisión**: Establecer `.opencode/skills/` como la única fuente canónica y generar espejos automáticos en `.github/skills/` y `.agents/skills/` mediante la skill `/sync-skills`.\n- **Consecuencias**: Paridad total de capacidades en las tres herramientas sin duplicación manual.\n\n---\n\n## ADR-003: Pruebas Automatizadas Nativas con Node.js Test Runner\n- **Fecha**: 2026-11-02\n- **Estado**: Aceptado\n- **Contexto**: El arnés requería pruebas automatizadas para sus serializadores y sincronizadores, pero añadir frameworks pesados como Jest o Mocha introducía sobrecarga de instalación y dependencias vulnerables.\n- **Decisión**: Utilizar el ejecutor nativo `node --test` integrado en Node.js v18+.\n- **Consecuencias**: Tiempos de ejecución inferiores a 200ms con cero dependencias externas en tiempo de ejecución.\n\n---\n\n## ADR-004: Arquitectura Screaming & Tailwind CSS v4 en el Tablero Visual\n- **Fecha**: 2026-11-01\n- **Estado**: Aceptado\n- **Contexto**: La interfaz de seguimiento en `project-docs/` necesitaba ser modular, mantenible y liviana sin depender de frameworks de compilación SPA como React o Angular.\n- **Decisión**: Organizar el código bajo Screaming Architecture (`src/features/` por dominio) utilizando Vanilla JS moderno (ES Modules) y Tailwind CSS v4 en el navegador (`@tailwindcss/browser@4`).\n- **Consecuencias**: Modularidad limpia, código ligero y soporte nativo para temas claro/oscuro.\n\n---\n\n## ADR-005: Editor Dual ContextForge con Scroll Sincronizado Proporcional\n- **Fecha**: 2026-11-02\n- **Estado**: Aceptado\n- **Contexto**: Los desarrolladores y arquitectos requerían tanto la velocidad del editor de texto Markdown como la comodidad estructurada de bloques visuales para manipular requerimientos y diagramas.\n- **Decisión**: Implementar un conmutador de modo dual (`Modo Markdown` / `Modo Bloques`) con serialización bidireccional instantánea y sincronización de scroll proporcional basada en el ratio de desplazamiento con flags de exclusión mutua.\n- **Consecuencias**: Edición fluida sin pérdida de formato ni bloqueos por loops de eventos.\n\n---\n\n## ADR-006: Constelación 3D en Jerarquía Piramidal Three.js\n- **Fecha**: 2026-11-02\n- **Estado**: Aceptado\n- **Contexto**: La representación en grafo 3D anterior colocaba los nodos en un único plano caótico, provocando colisión de etiquetas e imposibilidad de comprender la jerarquía del sistema.\n- **Decisión**: Distribuir los nodos en 4 niveles arquitectónicos verticales ($Y=+165$ Ápice, $Y=+55$ Core, $Y=-55$ Features, $Y=-165$ Base) con distribución radial armónica y curvas cuadráticas de Bezier.\n- **Consecuencias**: Comprensión visual inmediata de la criticidad y dependencias del sistema.\n\n---\n\n## ADR-007: Compatibilidad Offline Total (Zero-Server Fallback)\n- **Fecha**: 2026-11-01\n- **Estado**: Aceptado\n- **Contexto**: En entornos restringidos o sin conexión a internet, los navegadores bloquean peticiones `fetch()` locales bajo el protocolo `file:///` por políticas de CORS.\n- **Decisión**: Generar automáticamente `project-docs/data-fallback.js` antes de cada compilación para embeber los datos en `window.__FALLBACK_DATA__`.\n- **Consecuencias**: El tablero funciona al 100% abriendo directamente `index.html` con doble clic.\n",
    "business-rules.md": "# Catálogo Canónico de Reglas de Negocio (Invariantes del Arnés)\n\n> [!IMPORTANT]\n> Invariantes de cumplimiento estricto para desarrolladores y agentes de IA. Ninguna implementación, spec o refactorización puede violar estas reglas.\n\n---\n\n## Módulo: agent-orchestrator\n\n### BR-ORCH-001: Formato y Longitud Estricta de Ramas Git\n- **Severidad**: Crítica\n- **Fórmula**: `length({type}/INT-{numero}/{nombre_rama}) <= 80`\n- **Valores permitidos de type**: Exclusivamente `feature` o `bugfix`.\n- **Descripción**: Toda rama de trabajo debe crearse desde la rama base, tener un prefijo `INT-` con número de ticket y no superar 80 caracteres.\n- **Comportamiento ante Violación**: La rama es rechazada y el agente debe solicitar corrección al humano.\n\n### BR-ORCH-002: Puerta Humana Obligatoria para Aprobación de Spec\n- **Severidad**: Crítica\n- **Descripción**: Queda estrictamente prohibido pasar una tarea a `in_progress` o iniciar implementación sin aprobación explícita del humano mediante la herramienta `ask_question`.\n- **Comportamiento ante Violación**: Detención inmediata del ciclo SDD.\n\n### BR-ORCH-003: Subagente Revisor No Modifica Código\n- **Severidad**: Crítica\n- **Descripción**: El subagente `reviewer` evalúa de forma independiente e imparcial la trazabilidad, build y tests. Bajo ninguna circunstancia edita código de producción o pruebas.\n- **Comportamiento ante Violación**: Se anula el veredicto y se reasigna al `implementer`.\n\n---\n\n## Módulo: triple-sync-engine\n\n### BR-SYNC-001: Fuente de Verdad Inviolable en .opencode/\n- **Severidad**: Crítica\n- **Descripción**: La carpeta `.opencode/skills/` es la única fuente de verdad para las 18 skills del arnés. Los cambios se propagan de forma unidireccional a `.github/skills/` y `.agents/skills/`.\n- **Comportamiento ante Violación**: Cualquier cambio aislado en espejos se sobrescribe al sincronizar.\n\n### BR-SYNC-002: Paridad Estricta de Frontmatter\n- **Severidad**: Alta\n- **Descripción**: Todo archivo `SKILL.md` debe contener exactamente el mismo bloque YAML `name` y `description` en las tres plataformas.\n- **Comportamiento ante Violación**: Reporte de inconsistencia en `/sync-skills`.\n\n---\n\n## Módulo: knowledge-engine\n\n### BR-KNOW-001: Sintaxis Mermaid Ultra-Estricta\n- **Severidad**: Crítica\n- **Descripción**: Para garantizar que los diagramas se rendericen sin errores en cualquier parser web o visor markdown, todo ID de nodo debe ser estrictamente alfanumérico sin guiones (`nodeAuth`) y todo texto descriptivo debe estar entre comillas dobles (`[\"Texto seguro\"]`).\n- **Comportamiento ante Violación**: Diagrama marcado como inválido en tiempo de validación.\n\n### BR-KNOW-002: Consulta Obligatoria Anti-Sesgo de la Base de Conocimiento\n- **Severidad**: Crítica\n- **Descripción**: Antes de proponer nuevas historias, redactar requerimientos o implementar código, los agentes DEBEN consultar `project-docs/knowledge/` para evitar reinventar capacidades o violar directrices.\n- **Comportamiento ante Violación**: Prohibición estricta de alucinar librerías externas o duplicar endpoints.\n\n---\n\n## Módulo: dashboard-visualizer\n\n### BR-DASH-001: Compatibilidad Offline Total (Protocolo file:///)\n- **Severidad**: Crítica\n- **Descripción**: El visor en `project-docs/index.html` debe ser 100% navegable con doble clic directo sin servidor local mediante la carga inmediata de `data-fallback.js`.\n- **Comportamiento ante Violación**: El script `sync-data.js` actualiza automáticamente el fallback tras cada compilación.\n\n### BR-DASH-002: Scroll Sincronizado Proporcional Anti-Bloqueo\n- **Severidad**: Alta\n- **Descripción**: La sincronización de scroll entre el editor Markdown y la vista previa utiliza flags de exclusión mutua para impedir bucles infinitos de eventos de scroll.\n- **Comportamiento ante Violación**: Desactivación temporal del listener para restaurar fluidez.\n\n---\n\n## Módulo: testing-qa-suite\n\n### BR-TEST-001: 100% de Tests en Verde para Cierre de Spec\n- **Severidad**: Crítica\n- **Descripción**: Ninguna feature o bugfix puede cerrarse como `done` si existe un solo test fallando en la suite de pruebas del proyecto.\n- **Comportamiento ante Violación**: `verify-spec` rechaza el cierre y exige corrección.\n\n### BR-TEST-002: Ejecutor de Pruebas Nativo sin Bloat\n- **Severidad**: Alta\n- **Descripción**: Las pruebas unitarias del arnés se ejecutan mediante `node --test` para asegurar tiempos de respuesta inferiores a 500ms y cero dependencias externas en testing.\n- **Comportamiento ante Violación**: Se rechaza la inclusión de dependencias redundantes.\n",
    "c4-model.md": "# Modelo C4 — AI Agentic SDD Engineering Harness\n\n> [!NOTE]\n> Arquitectura de Sistema, Contenedores y Componentes del Arnés de Ingeniería Dirigida por Especificaciones (SDD).\n\n---\n\n## Nivel 1: Diagrama de Contexto del Sistema (C1)\n\nMuestra los límites del arnés, los actores principales y los sistemas externos con los que interactúa:\n\n```mermaid\nflowchart TD\n  userDeveloper[\"👤 Desarrollador / Ingeniero de Software\"]\n  agentLeader[\"⚡ Agente Principal (Leader)\"]\n  harnessSystem[\"🛡️ AI Agentic SDD Engineering Harness\"]\n  gitSystem[\"🐙 Sistema de Control de Versiones (Git / GitHub)\"]\n  browserUser[\"🌐 Navegador Web (Dashboard / Tablero Visual)\"]\n\n  userDeveloper -->|\"Define requerimientos y aprueba specs\"| harnessSystem\n  agentLeader -->|\"Orquesta tareas e invoca subagentes\"| harnessSystem\n  harnessSystem -->|\"Crea ramas INT-* y commits semánticos\"| gitSystem\n  harnessSystem -->|\"Genera y sincroniza datos en tiempo real\"| browserUser\n  browserUser -->|\"Permite lectura editorial y edición dual\"| userDeveloper\n```\n\n---\n\n## Nivel 2: Diagrama de Contenedores (C2)\n\nDescompone el arnés en sus subsistemas y aplicaciones principales:\n\n```mermaid\nflowchart TD\n  subgraph HarnessContainers[\"Contenedores del Arnés SDD\"]\n    containerOrchestrator[\"⚡ Orquestador Multi-Agente<br/>(Leader, Spec-Author, Implementer, Reviewer)\"]\n    containerTripleSync[\"🔄 Motor de Sincronización Triple<br/>(.opencode / .github / .agents)\"]\n    containerKnowledge[\"📚 Motor de Base de Conocimiento<br/>(Docs-as-Code, C4, UML, BR-*, ADRs)\"]\n    containerDashboard[\"💻 Tablero de Seguimiento Interactivo<br/>(Tailwind v4, Three.js, Editor Dual)\"]\n    containerTestRunner[\"🧪 Suite de Pruebas Automatizadas<br/>(Node.js Test Runner, Smoke Tests)\"]\n  end\n\n  gitRepo[\"🐙 Repositorio Git Local\"]\n  userView[\"🌐 Navegador (file:/// o HTTP)\"]\n\n  containerOrchestrator -->|\"Escribe specs y código\"| gitRepo\n  containerTripleSync -->|\"Mantiene paridad de 18 skills\"| containerOrchestrator\n  containerKnowledge -->|\"Alimenta contexto anti-sesgo\"| containerOrchestrator\n  containerDashboard -->|\"Lee metadatos de specs y progreso\"| gitRepo\n  containerDashboard -->|\"Renderiza vistas interactivas\"| userView\n  containerTestRunner -->|\"Verifica build, tests y convenciones\"| containerOrchestrator\n```\n\n---\n\n## Nivel 3: Diagrama de Componentes del Tablero Web (C3)\n\nDesglose interno de la aplicación web en `project-docs/`:\n\n```mermaid\nflowchart LR\n  subgraph DashboardComponents[\"project-docs/src/\"]\n    compRouter[\"Enrutador por Pestañas<br/>(router.js)\"]\n    compStore[\"Store Reactivo Central<br/>(store.js)\"]\n    compDetector[\"Detector de Entorno & Agente<br/>(detector.js)\"]\n    compMarkdown[\"Lector Editorial & Parser Bloques<br/>(MarkdownViewer.js)\"]\n    compThree[\"Constelación 3D Piramidal<br/>(SpaceView3D.js)\"]\n    compMermaid[\"Visor & Editor Draw.io<br/>(MermaidViewer.js)\"]\n    compOmnibox[\"Buscador Global Ctrl+K<br/>(Omnibox Modal)\"]\n  end\n\n  compRouter --> compStore\n  compDetector --> compStore\n  compStore --> compMarkdown\n  compStore --> compThree\n  compStore --> compMermaid\n  compStore --> compOmnibox\n```\n",
    "coding-standards.md": "# Estándares de Codificación & Guardrails Anti-Sesgo\n\n> [!IMPORTANT]\n> Directrices obligatorias para desarrolladores y agentes de IA. Diseñadas para eliminar el sesgo algorítmico, prevenir alucinaciones de paquetes y mantener una arquitectura limpia.\n\n---\n\n## 1. Convenciones de Nomenclatura y Control de Versiones\n\n- **Ramas Git**:\n  - Exclusivamente dos tipos: `feature` y `bugfix`.\n  - Estructura obligatoria: `{type}/INT-{numero}/{nombre_rama_de_lo_realizado}`.\n  - Longitud máxima estricta: **80 caracteres**.\n  - Ejemplo: `feature/INT-001/refactor_harness_architecture`.\n- **Commits Semánticos**:\n  - Formato: `feat(scope): descripción` o `fix(scope): descripción`.\n  - Tipos válidos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.\n  - Idioma: Inglés para commits y código fuente; español para documentación técnica y comentarios explicativos.\n\n---\n\n## 2. Guardrails Anti-Alucinación (Inviolables para Agentes de IA)\n\n1. **Prohibición de Librerías Fantasma**: Los agentes tienen estrictamente prohibido sugerir, instalar o importar paquetes o librerías que no figuren en `package.json` o `project-spec.yaml`.\n2. **Invariante de Conocimiento Previo**: Antes de implementar una solución, el agente debe verificar si ya existe una función, componente o regla en `project-docs/knowledge/`.\n3. **Respeto a las Reglas de Negocio (BR-*)**: Ningún código puede modificar o relajar una regla de negocio sin una actualización previa y aprobada de la especificación.\n4. **Cero Código Muerto**: Prohibido dejar código comentado, banderas de depuración (`console.log`, `debugger`) o secretos hardcodeados.\n\n---\n\n## 3. Arquitectura del Código Frontend (`project-docs/src/`)\n\n- **Vanilla JS Modular**: Usar ES Modules puros (`import` / `export`) organizados por dominios en `src/features/`.\n- **Separación de Responsabilidades**: Las funciones de renderizado devuelven cadenas HTML puras; los controladores de eventos se enlazan mediante selectores o `data-action`.\n- **Inmutabilidad en el Store**: El estado global (`store.js`) se actualiza mediante acciones atómicas notificando a los suscriptores.\n",
    "data-dictionary.md": "# Diccionario de Datos & Persistencia Docs-as-Code\n\n> [!NOTE]\n> Especificación formal de los esquemas de persistencia JSON y YAML del arnés de ingeniería SDD.\n\n---\n\n## 1. Diagrama Entidad-Relación (ERD) del Arnés\n\n```mermaid\nerDiagram\n  PROJECT ||--o{ FEATURE : \"contiene\"\n  PROJECT ||--|| PROJECT_SPEC : \"especificado por\"\n  FEATURE ||--|{ ACCEPTANCE_CRITERIA : \"valida con\"\n  FEATURE ||--o{ TASK : \"descompone en\"\n  FEATURE ||--o{ BUSINESS_RULE : \"satisface\"\n  KNOWLEDGE_INDEX ||--o{ DOCUMENT : \"cataloga\"\n  DOCUMENT ||--o{ SHELF : \"pertenece a\"\n  DOCUMENT ||--o{ BUSINESS_RULE : \"documenta\"\n\n  PROJECT {\n    string name PK\n    string description\n    string version\n    string tech_stack\n    string runtime\n  }\n\n  FEATURE {\n    int id PK\n    string type\n    string name\n    string title\n    string module\n    string priority\n    string branch\n    string status\n  }\n\n  TASK {\n    string id PK\n    string title\n    bool done\n  }\n\n  BUSINESS_RULE {\n    string id PK\n    string module\n    string severity\n    string title\n    string description\n  }\n\n  DOCUMENT {\n    string key PK\n    string filename\n    string title\n    string shelf\n    int readingTime\n    int wordCount\n    int ruleCount\n  }\n```\n\n---\n\n## 2. Catálogo de Esquemas JSON / YAML\n\n### 2.1 `project-spec.yaml` (Especificación Técnica del Proyecto)\n- `project.name`: Nombre canónico del sistema.\n- `project.type`: Tipo de arquitectura (`universal-agentic-harness`, `web-api`, `microservices`).\n- `runtime.language`: Lenguaje de programación principal.\n- `modules[]`: Colección de módulos con `id`, `name`, `tech`, `features`.\n- `checks.build`: Comando de compilación (`npm run build`, `dotnet build`, etc.).\n- `checks.test`: Comando de pruebas (`npm test`, `pytest`, `dotnet test`).\n- `checks.verify`: Comando de verificación integral (`node project-docs/sync-data.js`).\n\n### 2.2 `feature_list.json` (Backlog Canónico de Tareas)\n- `features[].id`: Número secuencial único (`INT-001`).\n- `features[].type`: `feature` o `bugfix`.\n- `features[].name`: Identificador en `snake_case` descriptivo.\n- `features[].branch`: Rama Git `{type}/INT-{id}/{name}` ($\\le 80$ caracteres).\n- `features[].status`: `pending` | `spec_ready` | `in_progress` | `done` | `blocked`.\n- `features[].acceptance`: Lista de criterios de aceptación verificables.\n\n### 2.3 `knowledge-index.json` (Índice de la Base de Conocimiento)\n- `docs{}`: Mapa de clave de archivo a contenido Markdown completo.\n- `docMetadata{}`: Metadatos calculados (`readingTime`, `wordCount`, `ruleCount`, `reqCount`, `adrCount`, `shelf`).\n- `shelves{}`: Clasificación en 6 estantes temáticos (`architecture`, `business_rules`, `requirements`, `adrs`, `standards`, `modules`).\n- `business_rules[]`: Catálogo estructurado de invariantes con `id`, `module`, `severity`, `title`, `description`.\n- `coding_standards`: Guardrails anti-sesgo y directrices de nombrado.\n",
    "external-services.md": "# Catálogo de Integraciones y Servicios Externos\n\n> [!NOTE]\n> Matriz de servicios adyacentes, protocolos de comunicación, variables de configuración y políticas de contingencia del arnés de ingeniería.\n\n---\n\n## Matriz de Servicios y Dependencias\n\n| Servicio / Herramienta | Tipo | Protocolo | Variables Requeridas | Política de Contingencia / Failover |\n| :--- | :--- | :--- | :--- | :--- |\n| **Google Antigravity** | Agentic IDE & CLI | Native Subagent Protocol / IPC | N/A (Entorno IDE) | Operar mediante CLI estándar o shell local |\n| **OpenCode** | CLI Engine | CLI Exec / Local JSON | N/A | Lectura directa de `.opencode/rules/` |\n| **GitHub Copilot** | AI Assistant | Instructions / Markdown | N/A | Carga desde `.github/instructions/` |\n| **Git / GitHub** | Control de Versiones | CLI Git / HTTPS / SSH | `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL` | Modo local desconectado en rama `{type}/INT-*` |\n| **Tailwind CSS v4** | CSS Runtime | CDN `@tailwindcss/browser@4` | N/A | Estilos base incrustados en `<style>` |\n| **Three.js** | 3D Graphics Engine | CDN `three.min.js r128` | N/A | Vista alternativa en Árbol SVG y Grafo DAG |\n| **Mermaid.js** | Diagram Engine | CDN `mermaid.min.js v10` | N/A | Previsualización de código Mermaid con botón de copia |\n",
    "functional-requirements.md": "# Especificación de Requerimientos del Sistema (SRS IEEE 830 / ISO 29148)\n\n> [!NOTE]\n> Requerimientos Funcionales (`RF-*`) y Requerimientos No Funcionales (`RNF-*`) bajo clasificación FURPS+ para el Arnés de Ingeniería SDD.\n\n---\n\n## 1. Requerimientos Funcionales (`RF-*`)\n\n### Módulo: agent-orchestrator\n- **RF-ORCH-001**: El orquestador DEBE validar que toda rama de trabajo cumpla con la expresión regular `^(feature|bugfix)/INT-\\d{3,4}/[a-z0-9_]+$` y una longitud menor o igual a 80 caracteres.\n- **RF-ORCH-002**: El orquestador DEBE invocar de manera aislada al subagente `spec-author` con workspace heredado (`Workspace: \"inherit\"`) para redactar la especificación formal antes de escribir código.\n- **RF-ORCH-003**: El orquestador DEBE pausar la ejecución mediante `ask_question` para solicitar aprobación humana del spec generado antes de permitir el inicio de la fase de implementación.\n- **RF-ORCH-004**: Al concluir la implementación, el orquestador DEBE invocar de forma independiente al subagente `reviewer` para emitir veredicto formal de calidad y trazabilidad.\n\n### Módulo: triple-sync-engine\n- **RF-SYNC-001**: El motor DEBE comparar el árbol de skills en `.opencode/skills/` contra `.github/skills/` y `.agents/skills/` para identificar diferencias de contenido o metadatos.\n- **RF-SYNC-002**: La skill `/sync-skills` DEBE replicar archivos de forma no destructiva preservando el frontmatter YAML y el formato Markdown.\n\n### Módulo: knowledge-engine\n- **RF-KNOW-001**: La skill `/project-knowledge` DEBE realizar el descubrimiento en 2 fases para evitar desbordamiento de contexto (escaneo topológico previo a inspección de código).\n- **RF-KNOW-002**: El generador de diagramas DEBE sanitizar identificadores y textos en sintaxis Mermaid estricta con comillas dobles para evitar fallos del parser en tiempo de ejecución.\n\n### Módulo: dashboard-visualizer\n- **RF-DASH-001**: El tablero DEBE presentar una biblioteca organizada en 6 estantes temáticos con tarjeta Hero destacada y filtros rápidos por categoría.\n- **RF-DASH-002**: El lector de artículos DEBE renderizar el documento con columna centrada a 780px, interlineado de 1.75em, anclas de encabezados y barra lateral flotante con la Tabla de Contenidos (TOC).\n- **RF-DASH-003**: El editor dual DEBE permitir alternar instantáneamente entre modo Markdown split-pane y modo Bloques Visuales ContextForge con scroll sincronizado proporcional y reordenamiento de tarjetas.\n- **RF-DASH-004**: El buscador Omnibox DEBE responder al atajo `Ctrl+K` o `Cmd+K` y permitir búsqueda en tiempo real sobre tareas, documentos, reglas e índices.\n- **RF-DASH-005**: La vista 3D DEBE estructurar los nodos en 4 niveles piramidales en Three.js con anillos translúcidos y distribución armónica radial sin solapamiento de etiquetas.\n\n### Módulo: testing-qa-suite\n- **RF-TEST-001**: La suite DEBE ejecutar pruebas unitarias automatizadas mediante el ejecutor nativo `node --test` reportando resultados en menos de 500ms.\n- **RF-TEST-002**: La suite DEBE incluir pruebas de aceptación tipo smoke para validar la integridad del bundle web y la compatibilidad con el protocolo `file:///`.\n\n---\n\n## 2. Requerimientos No Funcionales (`RNF-*`) bajo FURPS+\n\n### Functionality (Seguridad e Integridad)\n- **RNF-SEC-001**: Prohibición estricta de credenciales, tokens de API o connection strings hardcodeados en los archivos de especificación o base de conocimiento.\n- **RNF-SEC-002**: Aislamiento estricto de subagentes impidiendo que el subagente `reviewer` modifique código de producción o pruebas.\n\n### Usability (Experiencia Editorial & Heurísticas)\n- **RNF-USAB-001**: Cumplimiento de WCAG AAA en contraste de texto y soporte nativo de modo claro y oscuro sin parpadeo (FOUC).\n- **RNF-USAB-002**: Búsqueda con debouncing para no bloquear la digitación del usuario en inputs de búsqueda (180ms - 260ms).\n\n### Reliability (Confiabilidad & Cero-Server)\n- **RNF-RELI-001**: Disponibilidad offline del 100% de la documentación y tablero interactivo mediante `data-fallback.js` sin requerir servidor HTTP ni sufrir bloqueos CORS.\n- **RNF-RELI-002**: Gestión adecuada del ciclo de vida en Three.js con limpieza completa de memoria (`mount`/`unmount`) al cambiar de pestaña para prevenir fugas de memoria.\n\n### Performance (Rendimiento)\n- **RNF-PERF-001**: Tiempo de carga inicial del tablero web inferior a 800ms en modo local.\n- **RNF-PERF-002**: Ejecución de la suite completa de pruebas unitarias en menos de 500ms.\n\n### Supportability (Mantenibilidad & Extensibilidad)\n- **RNF-SUPP-001**: Arquitectura modular Screaming Architecture en Vanilla JS sin dependencias de frameworks pesados de frontend (React, Vue, Angular) en tiempo de ejecución.\n- **RNF-SUPP-002**: Agnóstico al lenguaje: el arnés debe poder auditar e interactuar con proyectos en Node.js, .NET, Python, Go y Rust.\n",
    "modules/agent-orchestrator/module-spec.md": "# Módulo: agent-orchestrator (Orquestador Multi-Agente & Reglas de Plataforma)\n\n> [!NOTE]\n> Bounded Context encargado de coordinar los agentes de IA, hacer cumplir las políticas de branching y commits semánticos, y gestionar las puertas obligatorias de decisión humana.\n\n## 1. Responsabilidades del Módulo\n- Definición de roles especializados: `leader`, `spec-author`, `implementer` y `reviewer`.\n- Homologación de reglas en 3 plataformas: Google Antigravity (`.agents/`), OpenCode (`.opencode/`) y GitHub Copilot (`.github/`).\n- Verificación de límites de rama: formato `{type}/INT-{id}/{name}` con longitud estricta $\\le 80$ caracteres.\n- Gobernanza de puertas de decisión humana mediante `ask_question`.\n\n## 2. Contratos e Interfaces\n- **Herramientas Clave**: `invoke_subagent`, `define_subagent`, `manage_subagents`, `ask_question`, `run_command`.\n- **Estructura de Workspace**: `Workspace: \"inherit\"` para operar directamente sobre la rama de trabajo activa.\n- **Formato de Commits**: `feat(scope): desc` o `fix(scope): desc`.\n\n## 3. Componentes Nucleares\n- `.agents/agents/leader.md`: Orquestador principal del ciclo SDD.\n- `.agents/agents/spec-author.md`: Redactor de requerimientos EARS, ADRs y tareas.\n- `.agents/agents/implementer.md`: Implementador agnóstico de código de producción y tests.\n- `.agents/agents/reviewer.md`: Revisor independiente de calidad, build y trazabilidad R↔Tests.\n",
    "modules/agent-orchestrator/rules.md": "# Reglas de Negocio Invariantes: agent-orchestrator\n\n### BR-ORCH-001: Formato y Longitud Estricta de Ramas\n- **Severidad**: Crítica\n- **Fórmula / Restricción**: `length({type}/INT-{numero}/{nombre_rama}) <= 80`\n- **Valores permitidos de type**: Exclusivamente `feature` o `bugfix`.\n- **Comportamiento ante Violación**: La creación de la rama es rechazada de inmediato.\n\n### BR-ORCH-002: Puerta Humana Obligatoria para Aprobación de Spec\n- **Severidad**: Crítica\n- **Restricción**: Jamás iniciar la fase de implementación sin que el humano haya seleccionado `Aprobar spec al 100% e iniciar implementación` mediante la herramienta `ask_question`.\n- **Comportamiento ante Violación**: Detención total del agente e invocación inmediata de `ask_question`.\n\n### BR-ORCH-003: Subagente Revisor No Modifica Código\n- **Severidad**: Crítica\n- **Restricción**: El subagente `reviewer` audita de forma imparcial la trazabilidad R↔Tests, la compilación y los tests, pero tiene prohibido editar archivos fuente (`src/`, `tests/`).\n- **Comportamiento ante Violación**: Veredicto nulo y reasignación al `implementer`.\n",
    "modules/agent-orchestrator/sequence.md": "# Flujo de Orquestación Multi-Agente: agent-orchestrator\n\n```mermaid\nsequenceDiagram\n  autonumber\n  actor Humano as \"👤 Usuario (Humano)\"\n  participant Leader as \"⚡ Leader Agent\"\n  participant SpecAuthor as \"📝 Spec-Author\"\n  participant Implementer as \"🔨 Implementer\"\n  participant Reviewer as \"🔍 Reviewer\"\n\n  Humano->>Leader: \"Iniciar feature / INT-001\"\n  Leader->>Leader: \"Crear rama feature/INT-001/{nombre} (<=80c)\"\n  Leader->>SpecAuthor: \"invoke_subagent(spec-author)\"\n  SpecAuthor-->>Leader: \"specs/001_nombre/ listo (spec_ready)\"\n  Leader->>Humano: \"ask_question(Aprobar spec al 100%?)\"\n  Humano-->>Leader: \"Aprobado (in_progress)\"\n  Leader->>Implementer: \"invoke_subagent(implementer)\"\n  Implementer->>Implementer: \"Escribir código y tests (checks.test)\"\n  Implementer-->>Leader: \"Tasks completadas y trazabilidad R<->Tests\"\n  Leader->>Reviewer: \"invoke_subagent(reviewer)\"\n  Reviewer->>Reviewer: \"Auditoría imparcial sin editar código\"\n  alt Veredicto Aprobado\n    Reviewer-->>Leader: \"APROBADO (review_*.md)\"\n    Leader->>Humano: \"ask_question(Integrar a rama base?)\"\n  else Veredicto Rechazado\n    Reviewer-->>Leader: \"RECHAZADO (motivos documentados)\"\n    Leader->>Implementer: \"Reasignar correcciones\"\n  end\n```\n",
    "modules/dashboard-visualizer/module-spec.md": "# Módulo: dashboard-visualizer (Tablero de Seguimiento Visual & Editor Dual)\n\n> [!NOTE]\n> Bounded Context responsable de la experiencia de usuario y visualización interactiva del arnés en `project-docs/`, implementado bajo Screaming Architecture con Tailwind CSS v4 y Three.js.\n\n## 1. Responsabilidades del Módulo\n- Métricas KPI de avance en tiempo real (features, bugs, avance ponderado).\n- Biblioteca Editorial organizada en 6 estantes temáticos con tarjeta Hero destacada.\n- Lector de artículos con columna de 780px centrada e interlineado de 1.75em.\n- Tabla de Contenidos flotante (On-This-Page / TOC) con navegación por anclajes.\n- Editor Dual ContextForge (Modo Markdown split-pane vs Modo Bloques Visuales) con scroll sincronizado proporcional anti-bloqueo.\n- Constelación 3D espacial estructurada en 4 niveles piramidales en Three.js.\n- Búsqueda Global Omnibox modal (`Ctrl+K` / `Cmd+K`).\n- Soporte 100% offline mediante `data-fallback.js` (protocolo `file:///`) y servidor HTTP `serve.js`.\n\n## 2. Tecnologías\n- Vanilla JS (ES Modules)\n- Tailwind CSS v4 (`@tailwindcss/browser@4`)\n- Three.js r128\n- Mermaid.js 10.9+\n",
    "modules/dashboard-visualizer/rules.md": "# Reglas de Negocio Invariantes: dashboard-visualizer\n\n### BR-DASH-001: Compatibilidad 100% Offline (Zero-Server Fallback)\n- **Severidad**: Crítica\n- **Restricción**: El tablero debe poder abrirse con doble clic directamente en `project-docs/index.html` bajo el protocolo `file:///` sin requerir servidor HTTP ni fallar por CORS.\n- **Comportamiento ante Violación**: `sync-data.js` genera obligatoriamente `project-docs/data-fallback.js` antes de cualquier compilación.\n\n### BR-DASH-002: Scroll Sincronizado Proporcional Anti-Bloqueo\n- **Severidad**: Alta\n- **Fórmula**: $\\text{Ratio} = \\frac{\\text{scrollTop}}{\\text{scrollHeight} - \\text{clientHeight}}$ con flags de exclusión mutua `isScrollingFromEditor` e `isScrollingFromPreview`.\n- **Comportamiento ante Violación**: Bloqueo de scroll o bucles de eventos infinitos entre paneles.\n",
    "modules/dashboard-visualizer/sequence.md": "# Flujo de Renderizado y Navegación: dashboard-visualizer\n\n```mermaid\nsequenceDiagram\n  autonumber\n  actor User as \"👤 Usuario / Programador\"\n  participant App as \"📱 main.js (Router)\"\n  participant Omnibox as \"🔍 Omnibox (Ctrl+K)\"\n  participant Library as \"📚 Editorial Library Hub\"\n  participant Article as \"📖 Lector / Editor Dual\"\n  participant ThreeD as \"🌌 Three.js Constelación 3D\"\n\n  User->>App: \"Abrir index.html (file:/// o HTTP)\"\n  App->>App: \"Cargar data-fallback.js / API\"\n  User->>Omnibox: \"Pulsar Ctrl+K y buscar término\"\n  Omnibox-->>User: \"Resultados en vivo (Tareas, Docs, Reglas)\"\n  User->>Omnibox: \"Seleccionar documento de arquitectura\"\n  Omnibox->>Article: \"openArticleView('c4-model.md')\"\n  Article-->>User: \"Renderizar columna 780px + TOC flotante + Diagramas Mermaid\"\n  User->>Article: \"Pulsar Modo Editor [ 🧱 Modo Bloques ]\"\n  Article-->>User: \"Editor de Bloques ContextForge con scroll sincronizado\"\n  User->>App: \"Cambiar pestaña a Constelación 3D\"\n  App->>ThreeD: \"mount(container) -> Pirámide 4 niveles\"\n```\n",
    "modules/knowledge-engine/module-spec.md": "# Módulo: knowledge-engine (Motor de Base de Conocimiento Anti-Sesgo)\n\n> [!NOTE]\n> Bounded Context responsable de extraer, modelar y persistir la arquitectura del sistema, requerimientos formales, reglas de negocio y directrices anti-sesgo bajo el paradigma Docs-as-Code.\n\n## 1. Responsabilidades del Módulo\n- Elicitación profunda en 2 fases (Topología general $\\to$ Inspección granular por módulo).\n- Especificación formal bajo IEEE 830 (RF) y FURPS+ (RNF).\n- Catálogo ágil bajo INVEST, Scrum (DoR/DoD) y XP.\n- Diagramación C4 y UML en sintaxis Mermaid ultra-estricta con etiquetas entre comillas dobles.\n- Mantenimiento incremental de reglas e invariantes sin re-escaneos recursivos.\n\n## 2. Artefactos Generados\n- `functional-requirements.md` (SRS formal)\n- `user-stories-catalog.md` (Historias INVEST)\n- `system-capabilities.md` (Inventario de onboarding)\n- `c4-model.md` & `uml-diagrams.md` (Diagramas arquitectónicos)\n- `data-dictionary.md` (ERD y persistencia)\n- `business-rules.md` (Catálogo BR-*)\n- `adr-catalog.md` (Registro de decisiones)\n- `external-services.md` & `coding-standards.md`\n- `traceability-matrix.md` (RTM cruzada)\n",
    "modules/knowledge-engine/rules.md": "# Reglas de Negocio Invariantes: knowledge-engine\n\n### BR-KNOW-001: Sintaxis Mermaid Ultra-Estricta\n- **Severidad**: Crítica\n- **Restricción**: Todo ID de nodo Mermaid debe ser alfanumérico simple sin guiones (`nodeA`, `nodeGateway`). Toda etiqueta descriptiva debe estar entre comillas dobles (`[\"Texto seguro\"]`).\n- **Comportamiento ante Violación**: Error de renderizado en el navegador bloqueante.\n\n### BR-KNOW-002: Invariante de Consulta Obligatoria Anti-Sesgo\n- **Severidad**: Crítica\n- **Restricción**: Antes de redactar specs o implementar código, los agentes DEBEN verificar la existencia de `project-docs/knowledge/`. Si existe, es obligatorio consultar `business-rules.md`, `coding-standards.md` y los módulos correspondientes.\n- **Comportamiento ante Violación**: Queda terminantemente prohibido inventar librerías o dependencias externas no canónicas.\n",
    "modules/knowledge-engine/sequence.md": "# Flujo de Elicitación y Extracción: knowledge-engine\n\n```mermaid\nsequenceDiagram\n  autonumber\n  actor User as \"👤 Ingeniero / Agente\"\n  participant Skill as \"🧠 /project-knowledge\"\n  participant Phase1 as \"🔍 Fase 1: Escaneo Topológico\"\n  participant Phase2 as \"🔬 Fase 2: Inspección DDD Focalizada\"\n  participant Storage as \"📚 project-docs/knowledge/\"\n  participant Sync as \"⚡ sync-data.js\"\n\n  User->>Skill: \"Ejecutar /project-knowledge\"\n  Skill->>Phase1: \"Auditar package.json, project-spec.yaml, estructura de carpetas\"\n  Phase1-->>Skill: \"Identificados Bounded Contexts y fronteras\"\n  Skill->>Phase2: \"Leer servicios de dominio, entidades, reglas y handlers\"\n  Phase2-->>Skill: \"Extraídas reglas BR-*, requerimientos RF-* y diagramas C4/UML\"\n  Skill->>Storage: \"Escribir c4-model.md, business-rules.md, modules/**\"\n  Skill->>Sync: \"node project-docs/sync-data.js\"\n  Sync-->>User: \"Base de conocimiento e interfaz actualizadas al 100%\"\n```\n",
    "modules/testing-qa-suite/module-spec.md": "# Módulo: testing-qa-suite (Suite de Pruebas & Calidad)\n\n> [!NOTE]\n> Bounded Context responsable de la verificación continua del arnés mediante pruebas unitarias nativas y pruebas de aceptación E2E con Playwright.\n\n## 1. Responsabilidades del Módulo\n- Ejecución de pruebas unitarias ultra-rápidas mediante Node.js Test Runner nativo (`npm test`).\n- Pruebas de aceptación funcional tipo smoke (`npm run test:e2e`).\n- Validación de convenciones de branching (`{type}/INT-{id}/{name}` $\\le 80$c) y commits semánticos.\n- Verificación de serialización bidireccional entre Markdown y Bloques Visuales.\n- Cobertura de cálculos de tiempo de lectura y clasificación temática de estantes.\n\n## 2. Componentes de Prueba\n- `tests/unit/markdown-parser.test.js`: Pruebas de renderizado Markdown, TOC y serialización de bloques.\n- `tests/unit/sync-data.test.js`: Pruebas de indexación y generación de `data-fallback.js`.\n- `tests/unit/branching-rules.test.js`: Pruebas de reglas de ramas y formato de commits.\n- `tests/e2e/dashboard-smoke.test.js`: Pruebas de evaluación del bundle y dependencias del DOM.\n",
    "modules/testing-qa-suite/rules.md": "# Reglas de Negocio Invariantes: testing-qa-suite\n\n### BR-TEST-001: 100% Tests en Verde para Cierre de Spec\n- **Severidad**: Crítica\n- **Restricción**: Ningún spec o tarea puede cerrarse como `done` si existe un solo test fallando en la suite.\n- **Comportamiento ante Violación**: `verify-spec` rechaza el cierre y bloquea la reconciliación.\n\n### BR-TEST-002: Cero Dependencias Pesadas en Runtime de Testing\n- **Severidad**: Alta\n- **Restricción**: Las pruebas unitarias deben ejecutarse usando el ejecutor nativo `node --test` para garantizar tiempos de respuesta inferiores a 500ms y cero bloat de dependencias.\n- **Comportamiento ante Violación**: Se rechaza la instalación de frameworks redundantes.\n",
    "modules/testing-qa-suite/sequence.md": "# Flujo de Verificación Continua: testing-qa-suite\n\n```mermaid\nsequenceDiagram\n  autonumber\n  actor Runner as \"💻 Implementer / Reviewer\"\n  participant NPM as \"📦 npm test\"\n  participant RunnerNative as \"⚡ Node.js Test Runner\"\n  participant UnitTests as \"🧪 tests/unit/*.test.js\"\n  participant SmokeTests as \"🌐 tests/e2e/*.test.js\"\n\n  Runner->>NPM: \"Ejecutar npm test\"\n  NPM->>RunnerNative: \"node --test tests/unit/**/*.test.js\"\n  RunnerNative->>UnitTests: \"Ejecutar pruebas unitarias en paralelo\"\n  UnitTests-->>RunnerNative: \"8/8 pruebas pasando en verde\"\n  Runner->>SmokeTests: \"npm run test:e2e\"\n  SmokeTests-->>Runner: \"2/2 pruebas smoke pasando en verde\"\n```\n",
    "modules/triple-sync-engine/module-spec.md": "# Módulo: triple-sync-engine (Motor de Sincronización Triple de Skills)\n\n> [!NOTE]\n> Bounded Context responsable de preservar la paridad estricta entre la fuente de verdad (`.opencode/skills/`) y sus espejos automáticos en Google Antigravity (`.agents/skills/`) y GitHub Copilot (`.github/skills/`).\n\n## 1. Responsabilidades del Módulo\n- Garantizar que las 18 skills de ingeniería posean idéntico contenido y frontmatter (`name` + `description`).\n- Proveer la skill `/sync-skills` para auditoría y propagación unidireccional (de fuente a espejos).\n- Prevenir drift o desincronización funcional entre plataformas de IA.\n\n## 2. Contratos y Ubicaciones\n- **Fuente de Verdad**: `.opencode/skills/{skill}/SKILL.md`\n- **Espejo Copilot**: `.github/skills/{skill}/SKILL.md`\n- **Espejo Antigravity**: `.agents/skills/{skill}/SKILL.md`\n\n## 3. Catálogo de Skills Sincronizadas\n- Auditoría & Conocimiento: `technical-audit`, `project-knowledge`, `requirements-analysis`.\n- Especificación & Ciclo SDD: `generate-spec`, `spec`, `start-feature`, `sdd-workflow`.\n- Técnicas de Implementación: `implement-tdd`, `implement-sdd`, `implement-ftd`, `implement`.\n- Verificación & Calidad: `write-unit-tests`, `acceptance-testing`, `api-test-plan`, `execute-api-test-plan`, `generate-verify`, `verification`, `verify-spec`, `review`, `sync-skills`.\n",
    "modules/triple-sync-engine/rules.md": "# Reglas de Negocio Invariantes: triple-sync-engine\n\n### BR-SYNC-001: Fuente de Verdad Inviolable en .opencode/\n- **Severidad**: Crítica\n- **Restricción**: Toda skill nueva o modificación de una existente debe crearse o editarse en `.opencode/skills/`. Jamás editar un espejo directamente para luego retro-propagar.\n- **Comportamiento ante Violación**: Los cambios en espejos se sobrescriben automáticamente al ejecutar `/sync-skills`.\n\n### BR-SYNC-002: Paridad Estricta de Frontmatter\n- **Severidad**: Alta\n- **Restricción**: El bloque YAML inicial (`name` y `description`) debe ser estrictamente idéntico en las tres carpetas.\n- **Comportamiento ante Violación**: La skill es marcada como inconsistente en el reporte de sincronización.\n",
    "modules/triple-sync-engine/sequence.md": "# Flujo de Sincronización Triple: triple-sync-engine\n\n```mermaid\nsequenceDiagram\n  autonumber\n  actor Dev as \"💻 Desarrollador / IA\"\n  participant Truth as \"📁 .opencode/skills/ (Fuente)\"\n  participant MirrorCopilot as \"📁 .github/skills/ (Espejo Copilot)\"\n  participant MirrorAGY as \"📁 .agents/skills/ (Espejo Antigravity)\"\n  participant SyncTool as \"🔄 Skill sync-skills\"\n\n  Dev->>Truth: \"Crear o actualizar {skill}/SKILL.md\"\n  Dev->>SyncTool: \"Invocar /sync-skills\"\n  SyncTool->>Truth: \"Leer archivos y frontmatter\"\n  SyncTool->>MirrorCopilot: \"Comparar hash y replicar cambios\"\n  SyncTool->>MirrorAGY: \"Comparar hash y replicar cambios\"\n  SyncTool-->>Dev: \"Reporte de paridad al 100% (0 diferencias)\"\n```\n",
    "system-capabilities.md": "# Inventario de Capacidades del Sistema (System Capabilities)\n\n> [!NOTE]\n> Inventario exhaustivo de capacidades para acelerar el onboarding técnico y prevenir la duplicación o re-implementación innecesaria de funcionalidades existentes.\n\n---\n\n## Matriz de Capacidades Instaladas\n\n| ID Capacidad | Módulo | Capacidad Funcional | Interfaz / Comando | Estado |\n| :--- | :--- | :--- | :--- | :--- |\n| `CAP-ORCH-001` | `agent-orchestrator` | Control estricto de ramas `{type}/INT-{id}/{name}` $\\le 80$c | Git hooks / Rules | Operativo ✅ |\n| `CAP-ORCH-002` | `agent-orchestrator` | Puerta de aprobación humana del spec | `ask_question` | Operativo ✅ |\n| `CAP-ORCH-003` | `agent-orchestrator` | Auditoría imparcial de calidad sin editar código | Subagente `reviewer` | Operativo ✅ |\n| `CAP-SYNC-001` | `triple-sync-engine` | Auditoría de paridad de skills en 3 plataformas | Skill `/sync-skills` | Operativo ✅ |\n| `CAP-SYNC-002` | `triple-sync-engine` | Replicación automática de skills a espejos | `sync-skills.sh` / Script | Operativo ✅ |\n| `CAP-KNOW-001` | `knowledge-engine` | Descubrimiento en 2 fases anti-context overflow | Skill `/project-knowledge` | Operativo ✅ |\n| `CAP-KNOW-002` | `knowledge-engine` | Modelado C4 & UML en Mermaid estricto | Plantillas canónicas | Operativo ✅ |\n| `CAP-KNOW-003` | `knowledge-engine` | Mantenimiento Docs-as-Code incremental | `project-docs/knowledge/` | Operativo ✅ |\n| `CAP-DASH-001` | `dashboard-visualizer` | Biblioteca por estantes con tarjeta Hero | `KnowledgeBase.js` | Operativo ✅ |\n| `CAP-DASH-002` | `dashboard-visualizer` | Lector editorial centrado 780px con TOC flotante | `MarkdownViewer.js` | Operativo ✅ |\n| `CAP-DASH-003` | `dashboard-visualizer` | Editor Dual ContextForge con scroll sincronizado | `KnowledgeBase.js` | Operativo ✅ |\n| `CAP-DASH-004` | `dashboard-visualizer` | Constelación 3D piramidal de 4 niveles | `SpaceView3D.js` | Operativo ✅ |\n| `CAP-DASH-005` | `dashboard-visualizer` | Búsqueda Global Omnibox modal (`Ctrl+K`) | `main.js` | Operativo ✅ |\n| `CAP-DASH-006` | `dashboard-visualizer` | Compatibilidad 100% offline (file:///) | `data-fallback.js` | Operativo ✅ |\n| `CAP-TEST-001` | `testing-qa-suite` | Pruebas unitarias nativas ultrarrápidas (<200ms) | `npm test` | Operativo ✅ |\n| `CAP-TEST-002` | `testing-qa-suite` | Pruebas smoke de evaluación web | `npm run test:e2e` | Operativo ✅ |\n| `CAP-TEST-003` | `testing-qa-suite` | Verificación de paridad y sincronización | `npm run sync` | Operativo ✅ |\n",
    "traceability-matrix.md": "# Matriz de Trazabilidad Cruzada (RTM)\n\n> [!NOTE]\n> Matriz de Trazabilidad de Requerimientos (RTM) que conecta requerimientos funcionales, reglas de negocio, historias de usuario, componentes de código y pruebas automatizadas.\n\n---\n\n## Matriz Bidireccional de Cobertura\n\n| Requerimiento Funcional | Regla de Negocio (`BR-*`) | Historia de Usuario | Componente / Archivo | Test Automatizado |\n| :--- | :--- | :--- | :--- | :--- |\n| `RF-ORCH-001` | `BR-ORCH-001` | `US-001` | `.agents/rules/antigravity-harness.md` | `tests/unit/branching-rules.test.js` |\n| `RF-ORCH-002` | `BR-ORCH-002` | `US-001` | `.agents/agents/leader.md` | `tests/unit/branching-rules.test.js` |\n| `RF-ORCH-003` | `BR-ORCH-002` | `US-001` | `.agents/rules/antigravity-harness.md` | Proceso interactivo (`ask_question`) |\n| `RF-ORCH-004` | `BR-ORCH-003` | `US-001` | `.agents/agents/reviewer.md` | Auditoría en `review_*.md` |\n| `RF-SYNC-001` | `BR-SYNC-001` | `US-002` | `.opencode/skills/sync-skills/` | `/sync-skills` audit report |\n| `RF-SYNC-002` | `BR-SYNC-002` | `US-002` | `.agents/skills/sync-skills/` | `SKILL.md` frontmatter check |\n| `RF-KNOW-001` | `BR-KNOW-002` | `US-003` | `.agents/skills/project-knowledge/` | `project-docs/knowledge/` scan |\n| `RF-KNOW-002` | `BR-KNOW-001` | `US-003` | `project-docs/knowledge/c4-model.md` | Mermaid Parser Validation |\n| `RF-DASH-001` | `BR-DASH-001` | `US-003` | `src/features/knowledge-base/` | `tests/unit/sync-data.test.js` |\n| `RF-DASH-002` | `BR-DASH-001` | `US-003` | `src/shared/MarkdownViewer.js` | `tests/unit/markdown-parser.test.js` |\n| `RF-DASH-003` | `BR-DASH-002` | `US-003` | `src/features/knowledge-base/` | `tests/unit/markdown-parser.test.js` |\n| `RF-DASH-004` | `BR-DASH-001` | `US-004` | `src/main.js` (Omnibox Modal) | `tests/e2e/dashboard-smoke.test.js` |\n| `RF-DASH-005` | `BR-DASH-001` | `US-003` | `src/features/space-view-3d/` | `tests/e2e/dashboard-smoke.test.js` |\n| `RF-TEST-001` | `BR-TEST-002` | `US-005` | `package.json` (`npm test`) | `tests/unit/*.test.js` |\n| `RF-TEST-002` | `BR-TEST-001` | `US-005` | `tests/e2e/dashboard-smoke.test.js` | `npm run test:e2e` |\n",
    "uml-diagrams.md": "# Diagramas UML — AI Agentic SDD Engineering Harness\n\n---\n\n## 1. Diagrama de Clases del Dominio SDD\n\nMuestra las entidades, value objects y relaciones del modelo conceptual del arnés:\n\n```mermaid\nclassDiagram\n  class Feature {\n    +int id\n    +string type\n    +string name\n    +string title\n    +string description\n    +string module\n    +string priority\n    +string branch\n    +string status\n    +List~string~ acceptance\n    +markCompleted()\n  }\n\n  class Subagent {\n    +string name\n    +string role\n    +List~string~ tools\n    +executeTask(Task task)\n  }\n\n  class KnowledgeDocument {\n    +string key\n    +string filename\n    +string title\n    +string shelf\n    +int readingTime\n    +int wordCount\n    +int ruleCount\n    +extractTOC() List~Heading~\n  }\n\n  class BusinessRule {\n    +string id\n    +string title\n    +string module\n    +string severity\n    +string description\n    +validate() bool\n  }\n\n  class ArchitecturalDecisionRecord {\n    +string id\n    +string title\n    +string status\n    +string context\n    +string decision\n    +string consequences\n  }\n\n  Feature \"1\" --> \"*\" BusinessRule : \"satisface\"\n  Feature \"1\" --> \"1\" Subagent : \"asignada a\"\n  KnowledgeDocument \"*\" --> \"*\" BusinessRule : \"documenta\"\n  KnowledgeDocument \"*\" --> \"*\" ArchitecturalDecisionRecord : \"registra\"\n```\n\n---\n\n## 2. Diagrama de Secuencia: Ciclo de Vida Completo SDD\n\n```mermaid\nsequenceDiagram\n  autonumber\n  actor User as \"👤 Usuario (Humano)\"\n  participant Leader as \"⚡ Leader Agent\"\n  participant Git as \"🐙 Git System\"\n  participant SpecAuthor as \"📝 Spec-Author\"\n  participant Implementer as \"🔨 Implementer\"\n  participant Reviewer as \"🔍 Reviewer\"\n\n  User->>Leader: \"Iniciar tarea INT-001\"\n  Leader->>Git: \"git checkout -b feature/INT-001/{name}\"\n  Leader->>SpecAuthor: \"Redactar requerimientos y tasks\"\n  SpecAuthor-->>Leader: \"specs/001/ completado (spec_ready)\"\n  Leader->>User: \"ask_question: Aprobar spec al 100%?\"\n  alt Spec Aprobado\n    User-->>Leader: \"Aprobado (in_progress)\"\n    Leader->>Implementer: \"Implementar código y tests\"\n    Implementer->>Implementer: \"Ejecutar checks.test y checks.build\"\n    Implementer-->>Leader: \"Trazabilidad R<->Tests completa\"\n    Leader->>Reviewer: \"Auditar calidad y consistencia\"\n    alt Reviewer Aprueba\n      Reviewer-->>Leader: \"APROBADO (0 errores)\"\n      Leader->>User: \"ask_question: Integrar a rama base?\"\n    else Reviewer Rechaza\n      Reviewer-->>Leader: \"RECHAZADO (hallazgos)\"\n      Leader->>Implementer: \"Corregir observaciones\"\n    end\n  else Spec Rechazado\n    User-->>Leader: \"Rechazar o solicitar cambios\"\n    Leader->>SpecAuthor: \"Ajustar especificación\"\n  end\n```\n\n---\n\n## 3. Diagrama de Secuencia: Editor Dual ContextForge con Scroll Sincronizado\n\n```mermaid\nsequenceDiagram\n  autonumber\n  actor User as \"👤 Desarrollador\"\n  participant UI as \"💻 Tablero Web (main.js)\"\n  participant Textarea as \"📝 Panel Editor Markdown\"\n  participant Preview as \"👁️ Panel Live Preview\"\n  participant Blocks as \"🧱 Panel Bloques Visuales\"\n  participant Storage as \"💾 sync-data.js / data-fallback.js\"\n\n  User->>UI: \"Pulsar [ ✏️ Modo Editor ]\"\n  UI->>Textarea: \"Cargar markdown actual\"\n  UI->>Preview: \"renderMarkdown(content)\"\n  \n  alt Usuario edita en Textarea (Markdown)\n    User->>Textarea: \"Escribir texto y hacer scroll\"\n    Textarea->>Preview: \"Sincronizar scroll proporcionalmente (isScrollingFromEditor)\"\n    Textarea->>Preview: \"Actualizar HTML en vivo\"\n  else Usuario conmuta a [ 🧱 Modo Bloques ]\n    User->>UI: \"Pulsar [ 🧱 Modo Bloques Visuales ]\"\n    UI->>Blocks: \"parseMarkdownToBlocks(markdown)\"\n    Blocks-->>User: \"Renderizar tarjetas interactivas (H1, BR, Callouts)\"\n    User->>Blocks: \"Reordenar bloques (🔼/🔽) o añadir bloque\"\n    Blocks->>Textarea: \"blocksToMarkdown(blocks)\"\n    Blocks->>Preview: \"Actualizar previsualización en vivo\"\n  end\n\n  User->>UI: \"Pulsar [ 💾 Guardar Cambios ]\"\n  UI->>Storage: \"store.saveDoc(key, content) + sync-data.js\"\n  Storage-->>User: \"Documento persistido local y offline\"\n```\n\n---\n\n## 4. Diagrama de Casos de Uso del Arnés SDD\n\n```mermaid\nflowchart TD\n  actorDev[\"👤 Desarrollador\"]\n  actorAgent[\"⚡ Agente de IA\"]\n\n  subgraph UseCases[\"Casos de Uso del Arnés de Ingeniería\"]\n    ucAudit[\"Auditar Stack Técnico (/technical-audit)\"]\n    ucKnowledge[\"Extraer Base de Conocimiento (/project-knowledge)\"]\n    ucSpec[\"Redactar Requerimientos EARS (/generate-spec)\"]\n    ucHumanGate[\"Aprobar Puerta Humana (ask_question)\"]\n    ucImplement[\"Implementar Código & Tests (/implement)\"]\n    ucReview[\"Auditar Calidad & Trazabilidad (/review)\"]\n    ucViewDash[\"Navegar Tablero & Constelación 3D\"]\n    ucOmnibox[\"Búsqueda Global Omnibox (Ctrl+K)\"]\n    ucEditDual[\"Edición Dual Markdown / Bloques\"]\n  end\n\n  actorDev --> ucAudit\n  actorDev --> ucKnowledge\n  actorDev --> ucHumanGate\n  actorDev --> ucViewDash\n  actorDev --> ucOmnibox\n  actorDev --> ucEditDual\n\n  actorAgent --> ucSpec\n  actorAgent --> ucImplement\n  actorAgent --> ucReview\n  actorAgent --> ucKnowledge\n```\n",
    "user-stories-catalog.md": "# Catálogo de Historias de Usuario (INVEST, Scrum & XP)\n\n> [!NOTE]\n> Catálogo de Historias de Usuario bajo principios INVEST, Acuerdos de Calidad Scrum (DoR/DoD) y Prácticas Técnicas de Extreme Programming (XP).\n\n---\n\n## 1. Acuerdos de Calidad del Equipo\n\n### Definition of Ready (DoR) — Criterios para iniciar una Feature\n- [ ] La feature cuenta con nombre descriptivo en `snake_case` y rama `{type}/INT-{id}/{name}` $\\le 80$ caracteres.\n- [ ] Especificación técnica redactada por `spec-author` en `specs/{NNN}_{name}/` con requerimientos EARS, ADRs y checklist de tasks.\n- [ ] Criterios de aceptación redactados en formato Given / When / Then (Gherkin).\n- [ ] **Puerta Humana aprobada al 100%** mediante la herramienta `ask_question`.\n\n### Definition of Done (DoD) — Criterios para cerrar una Feature\n- [ ] Código de producción implementado y limpio según estándares de arquitectura.\n- [ ] 100% de las pruebas automatizadas pasando en verde (`npm test`, `checks.test`).\n- [ ] Tabla de trazabilidad $R \\leftrightarrow \\text{Tests}$ documentada en `progress/impl_{name}.md`.\n- [ ] Auditoría independiente del subagente `reviewer` con veredicto **APROBADO** en `progress/review_{name}.md`.\n- [ ] Datos sincronizados en el tablero con `node project-docs/sync-data.js`.\n- [ ] Commit semántico creado en la rama de trabajo.\n\n---\n\n## 2. Historias de Usuario (INVEST)\n\n### US-001: Orquestación Multi-Agente con Puertas Humanas\n- **Como** líder de ingeniería de software,\n- **Quiero** que el arnés coordine agentes especializados (`leader`, `spec-author`, `implementer`, `reviewer`) con pausas obligatorias `ask_question`,\n- **Para** asegurar que ninguna línea de código se escriba sin spec aprobado ni se fusione sin revisión independiente de calidad.\n- **Criterios de Aceptación (Gherkin)**:\n  - *Dado* que se inicia una nueva tarea `INT-001`,\n  - *Cuando* el subagente `spec-author` termina los requerimientos,\n  - *Entonces* el sistema se detiene y solicita aprobación explícita al usuario humano antes de invocar al `implementer`.\n\n### US-002: Sincronización Triple de Skills\n- **Como** desarrollador políglota de IA (Google Antigravity, OpenCode, Copilot),\n- **Quiero** que cualquier cambio en `.opencode/skills/` se replique automáticamente a `.github/` y `.agents/`,\n- **Para** contar con las mismas 18 capacidades de ingeniería sin importar la herramienta de IA que utilice.\n- **Criterios de Aceptación (Gherkin)**:\n  - *Dado* que se crea una nueva skill en `.opencode/skills/`,\n  - *Cuando* se ejecuta `/sync-skills`,\n  - *Entonces* se crean copias idénticas en `.github/skills/` y `.agents/skills/` con paridad total de frontmatter.\n\n### US-003: Biblioteca Editorial con Lector ContextForge y Editor Dual\n- **Como** arquitecto de sistemas,\n- **Quiero** una interfaz web con biblioteca por estantes temáticos, columna de lectura de 780px y editor dual Markdown/Bloques,\n- **Para** consultar y editar la documentación técnica del arnés con alta legibilidad y scroll sincronizado.\n- **Criterios de Aceptación (Gherkin)**:\n  - *Dado* que abro `project-docs/index.html` en el navegador,\n  - *Cuando* selecciono un documento de arquitectura,\n  - *Entonces* se visualiza en formato editorial con TOC lateral y al pulsar `Modo Editor` puedo editar directamente en bloques visuales o Markdown.\n\n### US-004: Búsqueda Global Omnibox con Atajo Ctrl+K\n- **Como** usuario del tablero,\n- **Quiero** abrir un buscador modal omnibox presionando `Ctrl+K` o `Cmd+K`,\n- **Para** localizar en milisegundos tareas (`INT-*`), documentos de arquitectura, reglas de negocio (`BR-*`) o módulos.\n- **Criterios de Aceptación (Gherkin)**:\n  - *Dado* que estoy en cualquier pestaña del tablero,\n  - *Cuando* presiono `Ctrl+K`,\n  - *Entonces* se abre el modal Omnibox permitiendo navegación por teclado y selección inmediata de resultados.\n\n### US-005: Suite de Pruebas Automatizadas Nativas\n- **Como** ingeniero de QA,\n- **Quiero** ejecutar pruebas unitarias y de aceptación con `npm test` sin dependencias externas pesadas,\n- **Para** verificar la integridad del arnés en menos de 500ms en entornos locales y pipelines CI/CD.\n- **Criterios de Aceptación (Gherkin)**:\n  - *Dado* que ejecuto `npm test`,\n  - *Cuando* se evalúan los tests de serialización, lectura y reglas de ramas,\n  - *Entonces* el 100% de las aserciones pasan en verde sin advertencias.\n"
  },
  "docMetadata": {
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
      "wordCount": 315,
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
    "modules/agent-orchestrator/module-spec.md": {
      "key": "modules/agent-orchestrator/module-spec.md",
      "filename": "module-spec.md",
      "title": "Módulo: agent-orchestrator (Orquestador Multi-Agente & Reglas de Plataforma)",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
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
      "wordCount": 105,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "agent-orchestrator"
    },
    "modules/dashboard-visualizer/module-spec.md": {
      "key": "modules/dashboard-visualizer/module-spec.md",
      "filename": "module-spec.md",
      "title": "Módulo: dashboard-visualizer (Tablero de Seguimiento Visual & Editor Dual)",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 158,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
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
      "wordCount": 122,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "dashboard-visualizer"
    },
    "modules/knowledge-engine/module-spec.md": {
      "key": "modules/knowledge-engine/module-spec.md",
      "filename": "module-spec.md",
      "title": "Módulo: knowledge-engine (Motor de Base de Conocimiento Anti-Sesgo)",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 142,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
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
      "wordCount": 101,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "knowledge-engine"
    },
    "modules/testing-qa-suite/module-spec.md": {
      "key": "modules/testing-qa-suite/module-spec.md",
      "filename": "module-spec.md",
      "title": "Módulo: testing-qa-suite (Suite de Pruebas & Calidad)",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 141,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
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
      "wordCount": 71,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
      "adrCount": 0,
      "isModule": true,
      "moduleName": "testing-qa-suite"
    },
    "modules/triple-sync-engine/module-spec.md": {
      "key": "modules/triple-sync-engine/module-spec.md",
      "filename": "module-spec.md",
      "title": "Módulo: triple-sync-engine (Motor de Sincronización Triple de Skills)",
      "summary": "Documentación técnica y especificación formal de ingeniería.",
      "shelf": "modules",
      "readingTime": 1,
      "wordCount": 144,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
      "reqCount": 0,
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
      "wordCount": 76,
      "lastModified": "2026-11-03",
      "ruleCount": 0,
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
      "wordCount": 534,
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
      "icon": "📐",
      "docs": [
        "c4-model.md",
        "data-dictionary.md",
        "uml-diagrams.md"
      ]
    },
    "business_rules": {
      "id": "business_rules",
      "title": "Reglas de Negocio & Dominio",
      "icon": "⚖️",
      "docs": [
        "business-rules.md"
      ]
    },
    "requirements": {
      "id": "requirements",
      "title": "Requerimientos & Metodología Ágil",
      "icon": "📋",
      "docs": [
        "functional-requirements.md",
        "traceability-matrix.md",
        "user-stories-catalog.md"
      ]
    },
    "adrs": {
      "id": "adrs",
      "title": "Decisiones de Arquitectura (ADRs)",
      "icon": "🏛️",
      "docs": [
        "adr-catalog.md"
      ]
    },
    "standards": {
      "id": "standards",
      "title": "Estándares, Capacidades & Servicios",
      "icon": "🛡️",
      "docs": [
        "coding-standards.md",
        "external-services.md",
        "system-capabilities.md"
      ]
    },
    "modules": {
      "id": "modules",
      "title": "Módulos & Bounded Contexts",
      "icon": "📦",
      "docs": [
        "modules/agent-orchestrator/module-spec.md",
        "modules/agent-orchestrator/rules.md",
        "modules/agent-orchestrator/sequence.md",
        "modules/dashboard-visualizer/module-spec.md",
        "modules/dashboard-visualizer/rules.md",
        "modules/dashboard-visualizer/sequence.md",
        "modules/knowledge-engine/module-spec.md",
        "modules/knowledge-engine/rules.md",
        "modules/knowledge-engine/sequence.md",
        "modules/testing-qa-suite/module-spec.md",
        "modules/testing-qa-suite/rules.md",
        "modules/testing-qa-suite/sequence.md",
        "modules/triple-sync-engine/module-spec.md",
        "modules/triple-sync-engine/rules.md",
        "modules/triple-sync-engine/sequence.md"
      ]
    }
  }
}
};
