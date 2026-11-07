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
      "spec_folder": "project-docs/specs/001_refactor_harness_architecture",
      "status": "done",
      "acceptance": [
        "project-spec.yaml y project-spec.json representan fielmente el arnés de IA sin mocks e-commerce",
        "Los subagentes implementer y reviewer son agnósticos al stack y leen checks de compilación/tests",
        "package.json y suite de tests unitarios están configurados y pasando en verde",
        "El tablero project-docs/ sincroniza en tiempo real los datos reales en modo offline y HTTP"
      ],
      "user_story": {
        "as_a": "Arquitecto de Software",
        "i_want": "desacoplar el arnés de cualquier stack específico y purgar mocks residuales",
        "so_that": "el sistema funcione universalmente con Node, .NET, Python, Go o cualquier tecnología"
      },
      "subtasks": [
        {
          "id": "INT-001-DEV",
          "type": "development",
          "title": "Desacoplamiento de subagentes y saneamiento de mocks",
          "assignee": "implementer",
          "status": "done",
          "tasks": []
        },
        {
          "id": "INT-001-QA",
          "type": "qa",
          "title": "Validación de contratos agnósticos y ejecución de tests unitarios",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-1",
              "title": "project-spec.yaml y project-spec.json representan fielmente el arnés de IA sin mocks e-commerce",
              "status": "passed"
            },
            {
              "id": "TC-2",
              "title": "Los subagentes implementer y reviewer son agnósticos al stack y leen checks de compilación/tests",
              "status": "passed"
            },
            {
              "id": "TC-3",
              "title": "package.json y suite de tests unitarios están configurados y pasando en verde",
              "status": "passed"
            },
            {
              "id": "TC-4",
              "title": "El tablero project-docs/ sincroniza en tiempo real los datos reales en modo offline y HTTP",
              "status": "passed"
            }
          ]
        }
      ],
      "evidence": {
        "completed_at": "2026-11-03T12:00:00Z",
        "dev_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
        "files_modified": [],
        "tests_executed": [
          "npm test",
          "verify.sh"
        ],
        "screenshots": []
      }
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
      "spec_folder": "project-docs/specs/002_triple_mirror_skills_sync",
      "status": "done",
      "acceptance": [
        "18 skills homologadas en .opencode/skills/ replicadas exactamente a .github/ y .agents/",
        "Frontmatter name y description idénticos en los 3 espejos",
        "Skill sync-skills disponible para auditoría de discrepancias"
      ],
      "user_story": {
        "as_a": "Líder Técnico",
        "i_want": "sincronizar automáticamente las skills en opencode, GitHub Copilot y Antigravity",
        "so_that": "cualquier agente de IA opere con las mismas capacidades sin divergencias"
      },
      "subtasks": [
        {
          "id": "INT-002-DEV",
          "type": "development",
          "title": "Implementación del motor triple de sincronización y skill sync-skills",
          "assignee": "implementer",
          "status": "done",
          "tasks": []
        },
        {
          "id": "INT-002-QA",
          "type": "qa",
          "title": "Auditoría de paridad en frontmatter y contenido en los 3 espejos",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-1",
              "title": "18 skills homologadas en .opencode/skills/ replicadas exactamente a .github/ y .agents/",
              "status": "passed"
            },
            {
              "id": "TC-2",
              "title": "Frontmatter name y description idénticos en los 3 espejos",
              "status": "passed"
            },
            {
              "id": "TC-3",
              "title": "Skill sync-skills disponible para auditoría de discrepancias",
              "status": "passed"
            }
          ]
        }
      ],
      "evidence": {
        "completed_at": "2026-11-03T12:00:00Z",
        "dev_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
        "files_modified": [],
        "tests_executed": [
          "npm test",
          "verify.sh"
        ],
        "screenshots": []
      }
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
      "spec_folder": "project-docs/specs/003_knowledge_base_dynamic_engine",
      "status": "done",
      "acceptance": [
        "Escaneo de topología en Fase 1 sin saturación de tokens",
        "Documentación profunda por módulo en Fase 2",
        "Catálogo de reglas de negocio BR-* e invariantes de dominio indexadas"
      ],
      "user_story": {
        "as_a": "Ingeniero de Contexto",
        "i_want": "extraer una base de conocimiento soberana con C4, UML, ERD y reglas BR-*",
        "so_that": "los agentes no sufran de ceguera de contexto ni alucinen librerías"
      },
      "subtasks": [
        {
          "id": "INT-003-DEV",
          "type": "development",
          "title": "Motor de elicitación profunda en 2 fases y catálogo BR-*",
          "assignee": "implementer",
          "status": "done",
          "tasks": []
        },
        {
          "id": "INT-003-QA",
          "type": "qa",
          "title": "Validación de consistencia en diagramas Mermaid y zero-bias",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-1",
              "title": "Escaneo de topología en Fase 1 sin saturación de tokens",
              "status": "passed"
            },
            {
              "id": "TC-2",
              "title": "Documentación profunda por módulo en Fase 2",
              "status": "passed"
            },
            {
              "id": "TC-3",
              "title": "Catálogo de reglas de negocio BR-* e invariantes de dominio indexadas",
              "status": "passed"
            }
          ]
        }
      ],
      "evidence": {
        "completed_at": "2026-11-03T12:00:00Z",
        "dev_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
        "files_modified": [],
        "tests_executed": [
          "npm test",
          "verify.sh"
        ],
        "screenshots": []
      }
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
      "spec_folder": "project-docs/specs/004_dashboard_editorial_dual_editor",
      "status": "done",
      "acceptance": [
        "Biblioteca organizada por estantes temáticos con tarjeta Hero destacada",
        "Lector de artículos con ancho centrado a 780px e interlineado 1.75em",
        "Editor dual ContextForge con soporte de bloques visuales y scroll sincronizado proporcional",
        "Erradicacion 100% de emojis con iconografia SVG accesible y suite ATDD en verde",
        "Seccion de Stack Tecnologico compacta y estructurada en tabla tecnica"
      ],
      "user_story": {
        "as_a": "Usuario y Desarrollador",
        "i_want": "un tablero visual moderno sin emojis, con lector editorial y editor dual ContextForge",
        "so_that": "la lectura y edición técnica sea fluida y profesional"
      },
      "subtasks": [
        {
          "id": "INT-004-DEV",
          "type": "development",
          "title": "Componentes Vanilla JS con Tailwind v4, lector centrado y editor dual",
          "assignee": "implementer",
          "status": "done",
          "tasks": []
        },
        {
          "id": "INT-004-QA",
          "type": "qa",
          "title": "Suites ATDD y pruebas de accesibilidad con 0 emojis",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-1",
              "title": "Biblioteca organizada por estantes temáticos con tarjeta Hero destacada",
              "status": "passed"
            },
            {
              "id": "TC-2",
              "title": "Lector de artículos con ancho centrado a 780px e interlineado 1.75em",
              "status": "passed"
            },
            {
              "id": "TC-3",
              "title": "Editor dual ContextForge con soporte de bloques visuales y scroll sincronizado proporcional",
              "status": "passed"
            },
            {
              "id": "TC-4",
              "title": "Erradicacion 100% de emojis con iconografia SVG accesible y suite ATDD en verde",
              "status": "passed"
            },
            {
              "id": "TC-5",
              "title": "Seccion de Stack Tecnologico compacta y estructurada en tabla tecnica",
              "status": "passed"
            }
          ]
        }
      ],
      "evidence": {
        "completed_at": "2026-11-03T12:00:00Z",
        "dev_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
        "files_modified": [],
        "tests_executed": [
          "npm test",
          "verify.sh"
        ],
        "screenshots": []
      }
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
      "spec_folder": "project-docs/specs/005_pyramidal_3d_constellation",
      "status": "done",
      "acceptance": [
        "4 niveles piramidales Y=+165 (Ápice), Y=+55 (Core), Y=-55 (Features), Y=-165 (Base)",
        "Distribución radial armónica para evitar colisión de etiquetas",
        "Curvas cuadráticas de Bezier y ciclo de vida mount/unmount sin memory leaks"
      ],
      "user_story": {
        "as_a": "Líder de Proyecto",
        "i_want": "visualizar la arquitectura en una constelación 3D piramidal con Three.js",
        "so_that": "la comprensión espacial del sistema sea intuitiva e interactiva"
      },
      "subtasks": [
        {
          "id": "INT-005-DEV",
          "type": "development",
          "title": "Renderizado 3D de 4 niveles con curvas Bezier",
          "assignee": "implementer",
          "status": "done",
          "tasks": []
        },
        {
          "id": "INT-005-QA",
          "type": "qa",
          "title": "Pruebas de ciclo de vida mount/unmount y ausencia de memory leaks",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-1",
              "title": "4 niveles piramidales Y=+165 (Ápice), Y=+55 (Core), Y=-55 (Features), Y=-165 (Base)",
              "status": "passed"
            },
            {
              "id": "TC-2",
              "title": "Distribución radial armónica para evitar colisión de etiquetas",
              "status": "passed"
            },
            {
              "id": "TC-3",
              "title": "Curvas cuadráticas de Bezier y ciclo de vida mount/unmount sin memory leaks",
              "status": "passed"
            }
          ]
        }
      ],
      "evidence": {
        "completed_at": "2026-11-03T12:00:00Z",
        "dev_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
        "files_modified": [],
        "tests_executed": [
          "npm test",
          "verify.sh"
        ],
        "screenshots": []
      }
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
      "spec_folder": "project-docs/specs/006_omnibox_global_search",
      "status": "done",
      "acceptance": [
        "Apertura inmediata con Ctrl+K o Cmd+K desde cualquier sección",
        "Indexación simultánea de tareas, documentos, reglas BR-* y bounded contexts",
        "Navegación fluida por teclado (Up, Down, Enter, Escape)"
      ],
      "user_story": {
        "as_a": "Desarrollador",
        "i_want": "un buscador omnibox global con atajo Ctrl+K",
        "so_that": "pueda navegar instantáneamente a cualquier tarea, regla o documento"
      },
      "subtasks": [
        {
          "id": "INT-006-DEV",
          "type": "development",
          "title": "Modal Omnibox con indexación en memoria y atajos de teclado",
          "assignee": "implementer",
          "status": "done",
          "tasks": []
        },
        {
          "id": "INT-006-QA",
          "type": "qa",
          "title": "Pruebas E2E de apertura, filtrado y navegación con teclado",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-1",
              "title": "Apertura inmediata con Ctrl+K o Cmd+K desde cualquier sección",
              "status": "passed"
            },
            {
              "id": "TC-2",
              "title": "Indexación simultánea de tareas, documentos, reglas BR-* y bounded contexts",
              "status": "passed"
            },
            {
              "id": "TC-3",
              "title": "Navegación fluida por teclado (Up, Down, Enter, Escape)",
              "status": "passed"
            }
          ]
        }
      ],
      "evidence": {
        "completed_at": "2026-11-03T12:00:00Z",
        "dev_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
        "files_modified": [],
        "tests_executed": [
          "npm test",
          "verify.sh"
        ],
        "screenshots": []
      }
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
      "spec_folder": "project-docs/specs/007_automated_unit_testing_suite",
      "status": "done",
      "acceptance": [
        "Suite de tests unitarios nativos ejecutables con npm test",
        "Cobertura de parser de markdown, parseMarkdownToBlocks y blocksToMarkdown",
        "Validación de cálculo de tiempos de lectura y clasificación en estantes"
      ],
      "user_story": {
        "as_a": "Especialista en QA",
        "i_want": "una suite completa de pruebas unitarias nativas",
        "so_that": "cada función pura y serializador esté blindado contra regresiones"
      },
      "subtasks": [
        {
          "id": "INT-007-DEV",
          "type": "development",
          "title": "Desarrollo de tests unitarios para markdown, TOC y reglas",
          "assignee": "implementer",
          "status": "done",
          "tasks": []
        },
        {
          "id": "INT-007-QA",
          "type": "qa",
          "title": "Ejecución con npm test y validación de cobertura",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-1",
              "title": "Suite de tests unitarios nativos ejecutables con npm test",
              "status": "passed"
            },
            {
              "id": "TC-2",
              "title": "Cobertura de parser de markdown, parseMarkdownToBlocks y blocksToMarkdown",
              "status": "passed"
            },
            {
              "id": "TC-3",
              "title": "Validación de cálculo de tiempos de lectura y clasificación en estantes",
              "status": "passed"
            }
          ]
        }
      ],
      "evidence": {
        "completed_at": "2026-11-03T12:00:00Z",
        "dev_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
        "files_modified": [],
        "tests_executed": [
          "npm test",
          "verify.sh"
        ],
        "screenshots": []
      }
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
      "spec_folder": "project-docs/specs/008_playwright_acceptance_testing",
      "status": "done",
      "acceptance": [
        "Script de prueba automatizada verificando carga de index.html",
        "Verificación de renderizado de la constelación 3D y conmutación de pestañas",
        "Prueba de edición y persistencia en el editor dual"
      ],
      "user_story": {
        "as_a": "Lead QA Automation Specialist",
        "i_want": "pruebas de aceptación E2E con Playwright y multinivel en verify.sh",
        "so_that": "todo cambio sea verificado de punta a punta antes de cualquier entrega"
      },
      "subtasks": [
        {
          "id": "INT-008-DEV",
          "type": "development",
          "title": "Configuración de Playwright, suites de caja blanca, negra y carga",
          "assignee": "implementer",
          "status": "done",
          "tasks": []
        },
        {
          "id": "INT-008-QA",
          "type": "qa",
          "title": "Verificación de los 8 niveles de verify.sh en verde",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-1",
              "title": "Script de prueba automatizada verificando carga de index.html",
              "status": "passed"
            },
            {
              "id": "TC-2",
              "title": "Verificación de renderizado de la constelación 3D y conmutación de pestañas",
              "status": "passed"
            },
            {
              "id": "TC-3",
              "title": "Prueba de edición y persistencia en el editor dual",
              "status": "passed"
            }
          ]
        }
      ],
      "evidence": {
        "completed_at": "2026-11-03T12:00:00Z",
        "dev_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
        "files_modified": [],
        "tests_executed": [
          "npm test",
          "verify.sh"
        ],
        "screenshots": []
      }
    },
    {
      "id": 9,
      "type": "feature",
      "name": "scrum_spec_subtasks_qa_evidence",
      "title": "Documentación Scrum en Specs, Subtareas Jira DEV/QA y Cierre con Evidencias JSON",
      "description": "Estandarización de especificaciones con User Stories Scrum (Como/Quiero/Para), desglose formal de subtareas de Desarrollo (DEV) y de QA estilo Jira, y protocolo de cierre con evidencias técnicas y capturas de pantalla integradas en JSON.",
      "module": "agent-orchestrator",
      "priority": "P0",
      "weight": 95,
      "branch": "feature/INT-009/scrum_spec_subtasks_qa_evidence",
      "spec_folder": "project-docs/specs/009_scrum_spec_subtasks_and_qa_evidence",
      "status": "done",
      "user_story": {
        "as_a": "Líder Técnico y Especialista de QA",
        "i_want": "documentar los specs de tareas bajo el estándar Scrum con subtareas independientes de Desarrollo y QA y capturas de pantalla de evidencia",
        "so_that": "el equipo tenga claridad absoluta del qué, cómo y de las pruebas ejecutadas, con trazabilidad determinista y persistencia en JSON sin bases de datos SQL"
      },
      "definition_of_ready": [
        "Requerimiento funcional elicitado y sin ambigüedades",
        "Esquema JSON compatible y documentado en Docs-as-Code",
        "Rama git INT-009 creada respetando el límite <= 80 caracteres"
      ],
      "definition_of_done": [
        "Subtarea de desarrollo (DEV) completada con código limpio y modular",
        "Subtarea de QA completada con pruebas ejecutadas y en verde",
        "Capturas de pantalla generadas y guardadas en specs/.../evidence/",
        "Interfaz web actualizada con soporte de User Story, subtareas Jira y galería de evidencias",
        "Zero emojis en código y UI",
        "100% de tests en verde en verify.sh"
      ],
      "subtasks": [
        {
          "id": "INT-009-DEV",
          "type": "development",
          "title": "Subtarea DEV: Extensión de Esquema JSON, UI Scrum (Modal/Table) y Motor de Evidencias",
          "assignee": "implementer",
          "status": "done",
          "tasks": [
            {
              "id": "T1",
              "title": "Actualizar feature_list.json con campos Scrum, DoR, DoD y Subtareas",
              "done": true
            },
            {
              "id": "T2",
              "title": "Actualizar Modal.js con secciones de User Story, Subtareas Jira y Galería de Screenshots",
              "done": true
            },
            {
              "id": "T3",
              "title": "Actualizar FeatureTable.js con badges de Subtareas DEV/QA",
              "done": true
            },
            {
              "id": "T4",
              "title": "Actualizar CurrentSpecCard.js con indicador de subtarea activa",
              "done": true
            },
            {
              "id": "T5",
              "title": "Crear script scripts/capture-evidence.js para captura automatizada Playwright",
              "done": true
            }
          ]
        },
        {
          "id": "INT-009-QA",
          "type": "qa",
          "title": "Subtarea QA: Casos de Prueba, Aceptación E2E, Capturas de Pantalla y Auditoría de Evidencias",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-01",
              "title": "Verificar renderizado de User Story Scrum en el modal de detalle",
              "status": "passed"
            },
            {
              "id": "TC-02",
              "title": "Verificar visualización de Subtareas Jira DEV y QA con sus estados y checkboxes",
              "status": "passed"
            },
            {
              "id": "TC-03",
              "title": "Verificar captura y renderizado de capturas de pantalla reales en la galería",
              "status": "passed"
            },
            {
              "id": "TC-04",
              "title": "Ejecución completa de verify.sh con 100% de suites en verde",
              "status": "passed"
            }
          ]
        }
      ],
      "evidence": {
        "completed_at": "2026-11-03T14:26:00Z",
        "dev_summary": "Implementación completa del modelo de datos Scrum, subtareas Jira DEV/QA, modal interactivo con DoD y galería visual de screenshots.",
        "files_modified": [
          "project-docs/feature_list.json",
          "project-docs/src/shared/Modal.js",
          "project-docs/src/features/feature-list/FeatureTable.js",
          "project-docs/src/features/current-spec/CurrentSpecCard.js",
          "tests/acceptance/scrum-evidence-capture.spec.js",
          "scripts/capture-evidence.js"
        ],
        "tests_executed": [
          "npm test (16 unit tests)",
          "npx playwright test tests/acceptance/scrum-evidence-capture.spec.js (3 acceptance tests)",
          "verify.sh (56+ multinivel tests)"
        ],
        "screenshots": [
          {
            "name": "01-dashboard-scrum-table.png",
            "path": "evidence/INT-009/01-dashboard-scrum-table.png",
            "caption": "Tabla de tareas con badges de subtareas Jira DEV y QA"
          },
          {
            "name": "02-modal-scrum-subtasks.png",
            "path": "evidence/INT-009/02-modal-scrum-subtasks.png",
            "caption": "Modal de detalle con Historia de Usuario Scrum, Subtareas Jira y DoD"
          },
          {
            "name": "03-knowledge-base-deepwiki.png",
            "path": "evidence/INT-009/03-knowledge-base-deepwiki.png",
            "caption": "Base de conocimiento y capacidades funcionales DeepWiki"
          }
        ]
      },
      "acceptance": [
        "Los specs incorporan estructura Scrum con User Story (Como/Quiero/Para), DoR y DoD",
        "Cada tarea principal desglosa una Subtarea de Desarrollo (DEV) y una Subtarea de QA estilo Jira",
        "Al cerrar la tarea se documenta en el spec y en JSON qué se hizo, qué pruebas se realizaron y capturas de pantalla",
        "Toda la persistencia se realiza 100% en JSON sin bases de datos SQL",
        "El tablero interactivo muestra las subtareas DEV/QA y la galería de capturas de pantalla"
      ],
      "closedAt": "2026-11-03T14:26:00Z"
    },
    {
      "id": 10,
      "type": "feature",
      "name": "harness_root_cleanliness_encapsulation",
      "title": "Encapsulamiento de Archivos y Limpieza de Raíz para Adopción Limpia del Arnés",
      "description": "Reorganizar la arquitectura de archivos del arnés para que la raíz contenga exclusivamente los archivos y carpetas indispensables de adopción (.agents/, .github/, .opencode/, project-docs/, AGENTS.md, opencode.json, project-spec.yaml, verify.sh), encapsulando el tooling npm, scripts, suites de prueba y specs dentro de project-docs/ para prevenir cualquier colisión al copiar y pegar el arnés en proyectos externos (.NET, Python, Java, Go, etc.).",
      "module": "agent-orchestrator",
      "priority": "P0",
      "weight": 100,
      "branch": "feature/INT-010/harness_root_cleanliness_encapsulation",
      "spec_folder": "project-docs/specs/010_harness_root_cleanliness_encapsulation",
      "status": "done",
      "closedAt": "2026-11-07T10:05:00Z",
      "acceptance": [
        "La raíz del repositorio solo contiene los 4 directorios canónicos (.agents/, .github/, .opencode/, project-docs/) y los archivos canónicos mínimos indispensables (AGENTS.md, opencode.json, project-spec.yaml, verify.sh, README.md, .gitignore)",
        "Las dependencias y tooling de Node/npm (package.json, package-lock.json, node_modules/, playwright.config.js) están encapsulados dentro de project-docs/ sin colisionar con el proyecto anfitrión",
        "Las suites de pruebas internas del arnés y tablero están reubicadas dentro de project-docs/tests/ sin contaminar los tests del proyecto cliente",
        "Los scripts de soporte y captura de evidencias residen en project-docs/scripts/capture-evidence.js",
        "El archivo kickstart.json de plantilla reside dentro de project-docs/kickstart.json",
        "ANTIGRAVITY.md está unificado y referenciado limpiamente desde .agents/ y AGENTS.md",
        "verify.sh y los comandos de npm funcionan de forma transparente delegando en project-docs/ (ej. npm --prefix project-docs ...)",
        "El 100% de las suites de prueba (unit, whitebox, blackbox, system, load, Playwright E2E) siguen pasando en verde con las nuevas rutas",
        "El tablero interactivo project-docs/ mantiene sincronización offline y visualización intacta sin errores de carga"
      ],
      "user_story": {
        "as_a": "Ingeniero / Arquitecto de Software",
        "i_want": "tener una raíz de proyecto limpia donde todos los archivos internos del arnés estén encapsulados en project-docs/",
        "so_that": "pueda copiar y pegar el arnés en cualquier proyecto cliente (.NET, Python, Java, Go, Node) sin colisiones de package.json, tests o archivos sueltos en la raíz"
      },
      "subtasks": [
        {
          "id": "INT-010-DEV",
          "type": "development",
          "title": "Encapsulamiento de tooling npm, scripts, tests y configuración dentro de project-docs/",
          "assignee": "implementer",
          "status": "done",
          "tasks": [
            "Mover package.json, package-lock.json y playwright.config.js a project-docs/",
            "Reubicar tests/ a project-docs/tests/ y scripts/ a project-docs/scripts/",
            "Reubicar kickstart.json a project-docs/kickstart.json",
            "Actualizar rutas en serve.js, sync-data.js, playwright.config.js y tests",
            "Actualizar verify.sh para invocar npm con --prefix project-docs",
            "Reubicar/unificar ANTIGRAVITY.md en .agents/ANTIGRAVITY.md y actualizar AGENTS.md"
          ]
        },
        {
          "id": "INT-010-QA",
          "type": "qa",
          "title": "Verificación multinivel, auditoría de raíz limpia y pruebas E2E",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-01",
              "title": "Verificar que la raíz del proyecto contenga únicamente los archivos mínimos canónicos",
              "status": "passed"
            },
            {
              "id": "TC-02",
              "title": "Verificar compilación de bundle y servidor con tooling encapsulado en project-docs/",
              "status": "passed"
            },
            {
              "id": "TC-03",
              "title": "Ejecutar suite completa de tests (unit, whitebox, blackbox, system, load) desde project-docs/tests/",
              "status": "passed"
            },
            {
              "id": "TC-04",
              "title": "Ejecutar pruebas de aceptación E2E con Playwright en modo headless",
              "status": "passed"
            },
            {
              "id": "TC-05",
              "title": "Ejecutar verify.sh completo y validar salida en verde 100%",
              "status": "passed"
            }
          ]
        }
      ],
      "evidence": {
        "completed_at": "2026-11-07T10:05:00Z",
        "dev_summary": "Encapsulamiento exitoso de package.json, package-lock.json, playwright.config.js, node_modules, tests/ y scripts/ dentro de project-docs/. Reubicación de ANTIGRAVITY.md a .agents/ANTIGRAVITY.md y kickstart.json a project-docs/kickstart.json. verify.sh actualizado con delegación transparente via npm --prefix project-docs. Raíz 100% limpia para adopción externa.",
        "tests_executed": [
          "16 Unit tests (node:test)",
          "12 White-Box tests (node:test)",
          "8 Black-Box tests (node:test)",
          "7 System tests (node:test)",
          "1 Load test (node:test)",
          "5 Smoke ATDD tests (node:test)",
          "10 Playwright E2E Acceptance tests (Chrome headless)"
        ],
        "screenshots": [
          "project-docs/specs/010_harness_root_cleanliness_encapsulation/evidence/01-dashboard-scrum-table.png",
          "project-docs/specs/010_harness_root_cleanliness_encapsulation/evidence/02-modal-scrum-subtasks.png",
          "project-docs/specs/010_harness_root_cleanliness_encapsulation/evidence/03-knowledge-base-deepwiki.png"
        ]
      }
    },
    {
      "id": 11,
      "type": "feature",
      "name": "harness_deep_encapsulation_specs_and_scripts",
      "title": "Encapsulamiento de specs/, verify.sh y project-spec.yaml en project-docs/",
      "description": "Reubicar specs/, verify.sh y project-spec.yaml dentro de project-docs/ para dejar la raíz con exclusivamente 4 carpetas (.agents/, .github/, .opencode/, project-docs/) y 4 archivos indispensables (AGENTS.md, opencode.json, README.md, .gitignore). Actualizar exhaustivamente todos los agentes y skills de Antigravity, Copilot y OpenCode para crear y consumir archivos en las nuevas rutas.",
      "module": "agent-orchestrator",
      "priority": "P0",
      "weight": 100,
      "branch": "feature/INT-011/encapsulate_specs_and_scripts",
      "spec_folder": "project-docs/specs/011_encapsulate_specs_and_scripts",
      "status": "done",
      "acceptance": [
        "La carpeta specs/ reside exclusivamente dentro de project-docs/specs/",
        "El archivo project-spec.yaml reside en project-docs/project-spec.yaml",
        "El script verify.sh reside en project-docs/verify.sh y es ejecutable desde cualquier ubicación",
        "La raíz del repositorio solo contiene 4 carpetas (.agents, .github, .opencode, project-docs) y 4 archivos (AGENTS.md, opencode.json, README.md, .gitignore)",
        "Los 4 agentes de Google Antigravity (.agents/agents/) crean y consultan specs en project-docs/specs/ y config en project-docs/",
        "Las skills en .opencode/skills/ (fuente de verdad), .github/skills/ y .agents/skills/ están 100% sincronizadas y operan con las nuevas rutas en project-docs/",
        "El 100% de la suite de pruebas (unit, whitebox, blackbox, system, load, Playwright E2E) pasa en verde",
        "El script project-docs/verify.sh completa los 9 pasos de verificación con exit code 0"
      ],
      "user_story": {
        "as_a": "Ingeniero / Arquitecto de Software",
        "i_want": "tener las especificaciones, verify.sh y project-spec.yaml encapsulados en project-docs/",
        "so_that": "la raíz del proyecto quede extremadamente limpia (solo 4 carpetas y 4 archivos) facilitando identificar y mover los archivos del arnés"
      },
      "subtasks": [
        {
          "id": "INT-011-DEV",
          "type": "development",
          "title": "Reubicación de artefactos y actualización de agentes y skills",
          "assignee": "implementer",
          "status": "done",
          "tasks": [
            "Mover specs/ a project-docs/specs/",
            "Mover project-spec.yaml a project-docs/project-spec.yaml",
            "Mover verify.sh a project-docs/verify.sh y asegurar auto-resolución de SCRIPT_DIR",
            "Actualizar agentes en .agents/agents/ (leader, spec-author, implementer, reviewer)",
            "Actualizar skills en .opencode/skills/ y sincronizar con .github/skills/ y .agents/skills/"
          ]
        },
        {
          "id": "INT-011-QA",
          "type": "qa",
          "title": "Validación multinivel de rutas y pureza extrema de raíz",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-01",
              "title": "Verificar pureza extrema en raíz: 4 carpetas y 4 archivos",
              "status": "passed"
            },
            {
              "id": "TC-02",
              "title": "Verificar ejecución de project-docs/verify.sh en verde al 100%",
              "status": "passed"
            },
            {
              "id": "TC-03",
              "title": "Verificar paridad triple de skills sincronizadas",
              "status": "passed"
            }
          ]
        }
      ],
      "closedAt": "2026-11-07T10:30:00Z",
      "evidence": {
        "completed_at": "2026-11-07T10:30:00Z",
        "dev_summary": "Reubicación de specs/, verify.sh y project-spec.yaml a project-docs/. Actualización de los 4 agentes en .agents/agents/ y de las 16 skills en .opencode/skills/ con propagación 100% a .github/skills/ y .agents/skills/. Raíz 100% pura con solo 4 carpetas y 4 archivos.",
        "tests_executed": [
          "16 Unit tests (node:test)",
          "12 White-Box tests (node:test)",
          "8 Black-Box tests (node:test)",
          "7 System tests (node:test)",
          "1 Load test (node:test)",
          "5 Smoke ATDD tests (node:test)",
          "10 Playwright E2E Acceptance tests (Chrome headless)"
        ],
        "screenshots": [
          "project-docs/specs/011_encapsulate_specs_and_scripts/evidence/01-dashboard-scrum-table.png",
          "project-docs/specs/011_encapsulate_specs_and_scripts/evidence/03-knowledge-base-deepwiki.png"
        ]
      }
    },
    {
      "id": 12,
      "type": "feature",
      "name": "plane_style_sqlite_project_management",
      "title": "Ingenieria Inversa Plane: Gestion de Tareas Multi-Vista, Base de Conocimiento y SQLite con Copia Markdown",
      "description": "Replicacion y adaptacion de la arquitectura, UX y vistas de Makeplane (Plane) para el tablero de seguimiento: Work items con vistas de Lista, Tablero Kanban interactivo, Vista de Calendario/Gantt y Hoja de calculo; gestion de Ciclos (Sprints) y Modulos (Epics); motor de base de datos relacional SQLite (via node:sqlite nativo en Node.js 24) en project-docs/data/harness.db con sincronizacion bidireccional continua hacia archivos .md y .json para que los agentes de IA lean y escriban en su formato nativo optimo.",
      "module": "dashboard-visualizer",
      "priority": "P0",
      "weight": 100,
      "branch": "feature/INT-012/plane_style_sqlite_project_management",
      "spec_folder": "project-docs/specs/012_plane_style_sqlite_project_management",
      "status": "done",
      "acceptance": [
        "Motor de datos relacional SQLite (node:sqlite) operativo en project-docs/data/harness.db con tablas para workspaces, projects, states, cycles, modules, issues, subtasks y pages.",
        "Sincronizacion bidireccional automatica: lectura y escritura en SQLite manteniendo copias sincronizadas en archivos .md y .json para consumo nativo por los agentes de IA.",
        "Interfaz y UX inspirada en Plane con estetica profesional dark/light theme, barra lateral colapsable, switcher de proyectos y Command Palette (Ctrl+K).",
        "Multi-vista completa para Issues/Tareas: Vista de Lista (List View), Tablero Kanban (Board View agrupado por Estado o Prioridad), Vista Temporal (Calendar/Gantt) y Vista de Hoja de Calculo (Spreadsheet Table).",
        "Gestion de Ciclos (Sprints) con metricas de burn-down, porcentaje de completitud y estado de tiempo.",
        "Gestion de Modulos (Epics/Bounded Contexts) agrupando historias y tareas con progreso acumulado.",
        "Integracion de Paginas / Docs (Knowledge Base) estilo Plane Pages, con editor dual y vinculacion bidireccional con tareas y reglas de negocio.",
        "Filtros rapidos, agrupacion (Group by State, Priority, Assignee) y ordenacion fluida sin recargas de pagina.",
        "Soporte offline y persistencia tanto en modo servidor (Node.js REST API con SQLite) como en modo offline (fallback sync a JSON/localStorage).",
        "Zero emojis en toda la interfaz, codigo fuente y pruebas; 100% de la suite de pruebas pasando en verde sin regresiones."
      ],
      "user_story": {
        "as_a": "Ingeniero de Software y Agente de IA",
        "i_want": "una plataforma de gestion de proyectos inspirada en Plane con vistas multiples y persistencia relacional SQLite sincronizada con Markdown",
        "so_that": "la gestion visual del flujo de trabajo sea de primer nivel y los agentes autonomos puedan consultar y actualizar tareas y conocimiento en su formato nativo"
      },
      "subtasks": [
        {
          "id": "INT-012-DEV",
          "type": "development",
          "title": "Motor SQLite relacional, API REST en serve.js y vistas completas estilo Plane",
          "assignee": "implementer",
          "status": "done",
          "tasks": [
            "Crear modulo de base de datos SQLite project-docs/src/core/db.js con node:sqlite nativo",
            "Implementar motor de sincronizacion bidireccional project-docs/src/core/sqlite-sync.js",
            "Agregar endpoints REST en serve.js para consultas y mutaciones de Plane con auto-sync a disco",
            "Desarrollar componentes PlaneLayout, IssueListView, IssueBoardView, IssueCalendarView, IssueSpreadsheetView",
            "Desarrollar vistas CyclesView, ModulesView, PlanePagesView e IssueDetailModal"
          ]
        },
        {
          "id": "INT-012-QA",
          "type": "qa",
          "title": "Pruebas unitarias de SQLite, sincronizacion de archivos y pruebas de aceptacion Playwright",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-01",
              "title": "Verificar esquema SQLite, consultas de agrupacion y persistencia relacional",
              "status": "passed"
            },
            {
              "id": "TC-02",
              "title": "Verificar sincronizacion bidireccional SQLite <-> Markdown (.md) y JSON",
              "status": "passed"
            },
            {
              "id": "TC-03",
              "title": "Verificar navegacion e interaccion fluida entre vistas de Plane con Playwright",
              "status": "passed"
            },
            {
              "id": "TC-04",
              "title": "Verificar Zero-Emoji Gate y pureza extrema de la raiz",
              "status": "passed"
            }
          ]
        }
      ],
      "evidence": {
        "completed_at": "2026-11-07T11:22:00-05:00",
        "dev_summary": "Implementacion completa de la arquitectura y UX inspirada en Makeplane: motor SQLite con node:sqlite nativo en project-docs/data/harness.db con espejo continuo a archivos Markdown y JSON; endpoints REST en serve.js; vistas de Lista, Kanban, Calendario y Hoja de calculo; gestion de Ciclos con burn-down SVG; Modulos/Epics; y Plane Pages.",
        "files_modified": [
          "project-docs/src/core/db.js",
          "project-docs/src/core/sqlite-sync.js",
          "project-docs/serve.js",
          "project-docs/sync-data.js",
          "project-docs/src/shared/Icons.js",
          "project-docs/src/features/plane-layout/PlaneSidebar.js",
          "project-docs/src/features/plane-layout/PlaneTopBar.js",
          "project-docs/src/features/plane-layout/PlaneControlsBar.js",
          "project-docs/src/features/plane-layout/PlaneLayout.js",
          "project-docs/src/features/plane-issues/IssueListView.js",
          "project-docs/src/features/plane-issues/IssueBoardView.js",
          "project-docs/src/features/plane-issues/IssueCalendarView.js",
          "project-docs/src/features/plane-issues/IssueSpreadsheetView.js",
          "project-docs/src/features/plane-issues/IssueDetailModal.js",
          "project-docs/src/features/plane-cycles/CyclesView.js",
          "project-docs/src/features/plane-modules/ModulesView.js",
          "project-docs/src/features/plane-pages/PlanePagesView.js",
          "project-docs/src/features/plane-analytics/AnalyticsView.js",
          "project-docs/src/core/api.js",
          "project-docs/src/core/store.js",
          "project-docs/src/main.js"
        ],
        "tests_executed": [
          "npm test (21 unit tests)",
          "npm run test:e2e (5 smoke tests)",
          "npm run test:whitebox (13 branch tests)",
          "npm run test:blackbox (8 resilience tests)",
          "npm run test:system (7 integration tests)",
          "npm run test:load (100 reqs concurrency test)",
          "npm run test:acceptance (14 Playwright E2E tests)",
          "bash project-docs/verify.sh (9 verification levels)"
        ],
        "screenshots": [
          "project-docs/specs/012_plane_style_sqlite_project_management/evidence/01-plane-kanban-board.png",
          "project-docs/specs/012_plane_style_sqlite_project_management/evidence/02-plane-issue-detail-modal.png",
          "project-docs/specs/012_plane_style_sqlite_project_management/evidence/03-plane-cycles-burndown.png",
          "project-docs/specs/012_plane_style_sqlite_project_management/evidence/04-plane-pages-docs.png"
        ]
      }
    },
    {
      "id": 13,
      "type": "feature",
      "name": "screaming_architecture_plane_refactor",
      "title": "Screaming Architecture & Refactor Unificado Estilo Plane con CLI de Consulta Soberana",
      "description": "Refactorizacion arquitectonica integral del frontend bajo Screaming Architecture: cada dominio de negocio (issues, cycles, modules, pages, architecture, graph, constellation, analytics) encapsula sus propios componentes, vistas y helpers con bucles funcionales de renderizado (estilo React en Vanilla JS). Unificacion total del tablero en una experiencia unica inspirada en Plane sin depender del tablero clasico, diseno UI/UX y graficos mejorados (burn-down, C4, constelacion 3D), y CLI soberana ('node project-docs/cli.js') para manipulacion y consulta directa de tareas y base de conocimiento por agentes de IA, skills y terminal.",
      "module": "dashboard-visualizer",
      "priority": "P0",
      "weight": 100,
      "branch": "feature/INT-013/screaming_architecture_plane_refactor",
      "spec_folder": "project-docs/specs/013_screaming_architecture_plane_refactor",
      "status": "done",
      "acceptance": [
        "Screaming Architecture pura en project-docs/src/features/: carpetas por dominio de negocio (issues, cycles, modules, pages, architecture, graph, constellation, analytics) con estructura interna coherente (components/, views/, helpers/).",
        "Bucles de renderizado funcional en componentes Vanilla JS con composicion modular limpia estilo componentes repetitivos de React.",
        "Unificacion total del diseno en una sola voz y experiencia UI/UX inspirada en Plane (sustituyendo el layout clasico legacy como vista primaria) con navegacion fluida por barra lateral y atajos.",
        "Integracion completa de todas las capacidades previas (C4 diagrams, grafo y arbol de dependencias, constelacion 3D Three.js, base de conocimiento editorial) como vistas nativas dentro de Plane.",
        "Mejora en graficos vectoriales interactivos: burn-down dinamico, diagramas Mermaid reactivos y visualizacion 3D.",
        "Herramienta CLI unificada (project-docs/cli.js) para que los agentes de IA, skills y desarrolladores consulten y manipulen tareas, ciclos, modulos y paginas desde consola o chat sin friccion.",
        "Persistencia relacional continua en SQLite (harness.db) con espejo sincronizado automatico en archivos .md y .json.",
        "Zero emojis en todo el codigo fuente, componentes UI, tests y documentacion; 100% de la suite de pruebas pasando en verde sin regresiones."
      ],
      "user_story": {
        "as_a": "Desarrollador y Agente de IA",
        "i_want": "un frontend modular bajo Screaming Architecture con interfaz unificada estilo Plane y una CLI de consulta soberana",
        "so_that": "el arnes opere con maxima coherencia UI/UX y tanto humanos como agentes gestionen tareas y conocimiento en consola y visualmente con rapidez"
      },
      "subtasks": [
        {
          "id": "INT-013-DEV",
          "type": "development",
          "title": "Refactorizacion Screaming Architecture, componentes funcionales, interfaz Plane unificada y CLI",
          "assignee": "implementer",
          "status": "done",
          "tasks": [
            "Reorganizar src/features/ bajo Screaming Architecture (issues, cycles, modules, pages, architecture, graph, constellation, analytics)",
            "Crear componentes funcionales modulares con bucles de renderizado limpios para tarjetas, filas, listas y paneles",
            "Unificar la experiencia visual integrando arquitectura C4, grafos de dependencias y constelacion 3D dentro del layout de Plane",
            "Implementar project-docs/cli.js para consulta y manipulacion de tareas, ciclos y paginas por agentes de IA y CLI",
            "Actualizar core/router.js, core/store.js y src/main.js para gobernar la experiencia unificada"
          ]
        },
        {
          "id": "INT-013-QA",
          "type": "qa",
          "title": "Pruebas de arquitectura, CLI, navegacion integrada Playwright y verificacion integral",
          "assignee": "reviewer",
          "status": "done",
          "test_cases": [
            {
              "id": "TC-01",
              "title": "Validar Screaming Architecture y ausencia de dependencias ciclicas en componentes",
              "status": "passed"
            },
            {
              "id": "TC-02",
              "title": "Validar funcionalidad completa de project-docs/cli.js para agentes y skills",
              "status": "passed"
            },
            {
              "id": "TC-03",
              "title": "Validar navegacion unificada estilo Plane con Playwright y captura de evidencias",
              "status": "passed"
            },
            {
              "id": "TC-04",
              "title": "Validar Zero Emojis y pureza extrema de la raiz",
              "status": "passed"
            }
          ]
        }
      ],
      "evidence": {
        "completed_at": "2026-11-07T17:11:41.080Z",
        "dev_summary": "Refactorizacion arquitectonica integral bajo Screaming Architecture: pureza de 9 dominios en src/features/, helper declarativo renderList para componentes repetitivos en Vanilla JS, unificacion en una sola voz UX estilo Plane eliminando el layout legacy, CLI soberana node project-docs/cli.js para IA y terminal conectada a SQLite y disco, y 100% de tests en verde.",
        "files_modified": [
          "project-docs/src/shared/utils/renderList.js",
          "project-docs/src/shared/Icons.js",
          "project-docs/src/features/layout/",
          "project-docs/src/features/issues/",
          "project-docs/src/features/cycles/",
          "project-docs/src/features/modules/",
          "project-docs/src/features/pages/",
          "project-docs/src/features/architecture/",
          "project-docs/src/features/graph/",
          "project-docs/src/features/constellation/",
          "project-docs/src/features/analytics/",
          "project-docs/src/core/router.js",
          "project-docs/src/core/store.js",
          "project-docs/src/main.js",
          "project-docs/cli.js",
          "project-docs/package.json",
          "project-docs/tests/unit/screaming-architecture.test.js",
          "project-docs/tests/unit/cli.test.js"
        ],
        "tests_executed": [
          "npm test (27 unit tests)",
          "npm run test:e2e (5 smoke tests)",
          "npm run test:whitebox (12 branch tests)",
          "npm run test:blackbox (8 resilience tests)",
          "npm run test:system (7 integration tests)",
          "npm run test:load (100 reqs concurrency test)",
          "npm run test:acceptance (14 Playwright E2E tests)",
          "bash project-docs/verify.sh (9 verification levels)"
        ],
        "screenshots": [
          "project-docs/specs/013_screaming_architecture_plane_refactor/evidence/01-plane-kanban-board.png",
          "project-docs/specs/013_screaming_architecture_plane_refactor/evidence/02-plane-issue-detail-modal.png",
          "project-docs/specs/013_screaming_architecture_plane_refactor/evidence/03-plane-cycles-burndown.png",
          "project-docs/specs/013_screaming_architecture_plane_refactor/evidence/04-plane-pages-docs.png"
        ]
      }
    }
  ]
},
  currentSpec: {},
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
    },
    {
      "id": 7,
      "type": "feature",
      "name": "automated_unit_testing_suite",
      "title": "Suite de Pruebas Automatizadas Unitarias y E2E Smoke",
      "branch": "feature/INT-007/automated_unit_testing_suite",
      "completed_at": "2026-11-02 23:00 UTC",
      "commit": "HEAD",
      "executor": "implementer + reviewer",
      "summary": "Implementación de suites de pruebas unitarias y e2e smoke con Node.js test runner nativo."
    },
    {
      "id": 8,
      "type": "feature",
      "name": "playwright_acceptance_testing",
      "title": "Aseguramiento de Calidad Integral en 5 Niveles y Pruebas de Aceptación E2E con Playwright",
      "branch": "feature/INT-008/playwright_acceptance_testing",
      "completed_at": "2026-11-02 23:30 UTC",
      "commit": "HEAD",
      "executor": "implementer + reviewer",
      "summary": "Suite de calidad en 5 niveles (unit, whitebox, blackbox, system, load) y aceptación E2E con Playwright en Chrome."
    },
    {
      "id": 9,
      "type": "feature",
      "name": "scrum_spec_subtasks_qa_evidence",
      "title": "Documentación Scrum en Specs, Subtareas Jira DEV/QA y Cierre con Evidencias JSON",
      "branch": "feature/INT-009/scrum_spec_subtasks_qa_evidence",
      "completed_at": "2026-11-03 14:26 UTC",
      "commit": "HEAD",
      "executor": "implementer + reviewer",
      "summary": "Estandarización de especificaciones con User Stories Scrum, subtareas Jira DEV/QA, DoD y captura de evidencias."
    },
    {
      "id": 10,
      "type": "feature",
      "name": "harness_root_cleanliness_encapsulation",
      "title": "Encapsulamiento de Archivos y Limpieza de Raíz para Adopción Limpia del Arnés",
      "branch": "feature/INT-010/harness_root_cleanliness_encapsulation",
      "completed_at": "2026-11-07 10:05 UTC",
      "commit": "HEAD",
      "executor": "implementer + reviewer",
      "summary": "Encapsulamiento de dependencias npm, scripts, tests y configuración en project-docs/, consolidación de ANTIGRAVITY.md en .agents/ y kickstart.json en project-docs/, y verify.sh transparente via npm --prefix."
    },
    {
      "id": 11,
      "type": "feature",
      "name": "harness_deep_encapsulation_specs_and_scripts",
      "title": "Encapsulamiento de specs/, verify.sh y project-spec.yaml en project-docs/",
      "branch": "feature/INT-011/encapsulate_specs_and_scripts",
      "completed_at": "2026-11-07 10:30 UTC",
      "commit": "HEAD",
      "executor": "implementer + reviewer",
      "summary": "Reubicación de specs/, verify.sh y project-spec.yaml en project-docs/. Actualización de agentes (.agents/agents/) y skills (.opencode/skills/ -> .github/skills/, .agents/skills/). Raíz con solo 4 carpetas y 4 archivos."
    },
    {
      "id": 12,
      "type": "feature",
      "name": "plane_style_sqlite_project_management",
      "title": "Ingenieria Inversa Plane: Gestion de Tareas Multi-Vista, Base de Conocimiento y SQLite con Copia Markdown",
      "branch": "feature/INT-012/plane_style_sqlite_project_management",
      "completed_at": "2026-11-07 11:25 UTC",
      "commit": "HEAD",
      "executor": "implementer + reviewer",
      "summary": "Replicacion de UX y arquitectura de Makeplane (Plane): vistas Lista, Kanban, Calendario y Hoja de calculo; gestion de Ciclos con burn-down SVG; Modulos/Epics; Plane Pages; base de datos relacional SQLite (node:sqlite) en project-docs/data/harness.db con sincronizacion bidireccional continua hacia archivos .md y .json para consumo optimo por agentes IA."
    },
    {
      "id": 13,
      "type": "feature",
      "name": "screaming_architecture_plane_refactor",
      "title": "Screaming Architecture & Refactor Unificado Estilo Plane con CLI de Consulta Soberana",
      "branch": "feature/INT-013/screaming_architecture_plane_refactor",
      "completed_at": "2026-11-07T17:12:01.172Z",
      "commit": "HEAD",
      "executor": "implementer + reviewer",
      "summary": "Refactorizacion arquitectonica integral bajo Screaming Architecture pura de 9 dominios; helper declarativo renderList; unificacion en diseno Plane eliminando el layout legacy; CLI soberana node project-docs/cli.js para IA y terminal; y persistencia relacional SQLite con espejo continuo en Markdown."
    }
  ]
},
  projectSpec: {
  "project": {
    "name": "AI Agentic SDD Engineering Harness",
    "description": "Arnés universal y agnóstico de ingeniería de software dirigida por especificaciones (Spec Driven Development). Provee orquestación multi-agente, sincronización de skills triple, base de conocimiento anti-sesgo y tablero de seguimiento interactivo en Screaming Architecture.",
    "version": "2.5.0",
    "type": "fullstack",
    "tagline": "Arquitectura Canónica y Especificación Técnica",
    "maturity": "Production Ready / SDD Hardened"
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
        "description": "Puerto para el servidor HTTP local de visualización (8080 en dev, 3333 en test)",
        "defaultValue": "8080"
      },
      {
        "name": "HOST",
        "description": "Dirección de host local para el servidor web",
        "defaultValue": "127.0.0.1"
      },
      {
        "name": "CI",
        "description": "Indicador de ejecución en entorno de integración continua",
        "defaultValue": "false"
      },
      {
        "name": "NO_OPEN",
        "description": "Suprime la apertura automática del navegador al iniciar el servidor",
        "defaultValue": "0"
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
      },
      {
        "name": "@playwright/test",
        "version": "^1.64.1",
        "required": true,
        "dev": true
      }
    ]
  },
  "structure": {
    "entryPoint": "project-docs/src/main.js",
    "srcDir": "project-docs/src",
    "testDir": "project-docs/tests",
    "buildDir": "project-docs/dist",
    "configFiles": [
      {
        "filename": "opencode.json",
        "required": true,
        "description": "Configuración principal para OpenCode"
      },
      {
        "filename": "AGENTS.md",
        "required": true,
        "description": "Reglas de branching, commits semánticos y arquitectura de agentes"
      },
      {
        "filename": "project-docs/project-spec.yaml",
        "required": true,
        "description": "Especificación técnica canónica y auditoría del arnés encapsulada en project-docs/"
      },
      {
        "filename": "project-docs/verify.sh",
        "required": true,
        "description": "Script de verificación integral de 9 pasos autónomo en project-docs/"
      },
      {
        "filename": ".agents/ANTIGRAVITY.md",
        "required": true,
        "description": "Guía de orquestación nativa para Google Antigravity 2.0"
      },
      {
        "filename": "project-docs/package.json",
        "required": true,
        "description": "Manifiesto de dependencias, scripts de prueba y build encapsulados en project-docs/"
      },
      {
        "filename": "project-docs/playwright.config.js",
        "required": true,
        "description": "Configuración de Playwright encapsulada para pruebas E2E de aceptación"
      },
      {
        "filename": "project-docs/kickstart.json",
        "required": false,
        "description": "Parámetros y metadatos de inicialización de proyectos cliente"
      }
    ]
  },
  "architecture": {
    "style": "Multi-Agent System (MAS) + Screaming Architecture (Modular)",
    "patterns": [
      {
        "name": "Spec Driven Development (SDD)",
        "type": "Metodología",
        "description": "Ciclo de especificación rigurosa previa a la codificación con gates humanos y trazabilidad R-to-Tests."
      },
      {
        "name": "Triple-Mirror Skills Synchronization",
        "type": "Sincronización",
        "description": "Garantía de paridad exacta entre .opencode/skills/ (fuente de verdad), .github/skills/ y .agents/skills/."
      },
      {
        "name": "Docs-as-Code (Markdown + Mermaid C4/UML)",
        "type": "Documentación",
        "description": "Modelado técnico versionado con C4 Context/Container/Component, diagramas UML y diagramas ERD."
      },
      {
        "name": "Proportional Synchronized Dual Editor",
        "type": "UI / UX",
        "description": "Editor ContextForge con renderizado reactivo y scroll proporcionalmente sincronizado."
      },
      {
        "name": "Pyramidal 3D Constellation",
        "type": "Visualización 3D",
        "description": "Constelación interactiva basada en Three.js con rotación orbital, nodos navegables y ciclo de vida mount/unmount."
      },
      {
        "name": "Offline-First Fallback Architecture",
        "type": "Resiliencia",
        "description": "Compatibilidad 100% offline nativa para protocolo file:/// sin requerir servidor HTTP activo."
      }
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
      "description": "Coordina roles especializados (leader, spec-author, implementer, reviewer) con guardrails de ramas y commits.",
      "responsibilities": [
        "Orquestación multi-agente con guardrails de ramas y commits semánticos",
        "Gestión de puertas de decisión humana mediante ask_question",
        "Garantía de trazabilidad estricta R-to-Tests y cierre con subtareas Scrum Jira DEV/QA"
      ],
      "features": [
        "INT-001",
        "INT-009"
      ]
    },
    {
      "id": "triple-sync-engine",
      "name": "Motor de Sincronización Triple de Skills",
      "tech": "Node.js, FileSystem Mirroring",
      "description": "Mantiene paridad estricta entre .opencode/skills/ (fuente de verdad), .github/skills/ y .agents/skills/.",
      "responsibilities": [
        "Validación de hashes y diferencias de contenido en skills",
        "Propagación unidireccional desde .opencode/skills/ hacia espejos Copilot y Antigravity",
        "Reporte de divergencias y auditoría de sincronización"
      ],
      "features": [
        "INT-002"
      ]
    },
    {
      "id": "knowledge-engine",
      "name": "Motor de Base de Conocimiento Anti-Sesgo",
      "tech": "Docs-as-Code, Mermaid C4/UML, Markdown",
      "description": "Genera y audita modelos C4, diagramas UML, ERD, diccionario de datos, reglas de negocio BR-* y decisiones ADR.",
      "responsibilities": [
        "Extracción forense de arquitectura y diagramas Mermaid (C4, UML, ERD)",
        "Documentación de reglas invariantes de negocio (BR-*) y decisiones arquitectónicas (ADR)",
        "Indexación JSON viva y categorización en estantes editoriales"
      ],
      "features": [
        "INT-003"
      ]
    },
    {
      "id": "dashboard-visualizer",
      "name": "Tablero de Seguimiento Visual & Editor Dual",
      "tech": "Vanilla JS (ES Modules), Tailwind CSS v4, Three.js, ContextForge Dual Block Editor",
      "description": "Interfaz interactiva con métricas KPI, biblioteca por estantes, constelación 3D piramidal y buscador Omnibox (Ctrl+K).",
      "responsibilities": [
        "Renderizado de métricas KPI, avance de features y detalles de subtareas Scrum",
        "Visualización de constelación 3D interactiva en Three.js con órbitas y nodos",
        "Editor dual ContextForge con sincronización de scroll y vista de lectura editorial",
        "Búsqueda reactiva global tipo Omnibox (Ctrl+K)"
      ],
      "features": [
        "INT-004",
        "INT-005",
        "INT-006"
      ]
    },
    {
      "id": "testing-qa-suite",
      "name": "Suite de Pruebas & Calidad",
      "tech": "Node.js Test Runner, Playwright E2E, Static Analysis",
      "description": "Batería de tests unitarios, caja blanca/negra, aceptación end-to-end y auditoría de código.",
      "responsibilities": [
        "Ejecución de pruebas unitarias sin dependencias externas pesadas",
        "Pruebas de caja blanca (branch coverage) y caja negra (BVA, resiliencia)",
        "Pruebas de aceptación E2E con Playwright en Chrome headless",
        "Auditorías estáticas de anti-emojis y zero-mocks"
      ],
      "features": [
        "INT-007",
        "INT-008"
      ]
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
    "verify": "npm run sync",
    "test:acceptance": "npm run test:acceptance",
    "test:all": "npm run test:all"
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
    "01-project-overview-and-business.md": "---\r\nid: DOC-BIZ-OVERVIEW\r\ntitle: \"Visión del Producto, Contexto de Negocio y Stakeholders\"\r\nmodule: \"global\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"ieee-830\", \"business-context\", \"product-vision\", \"stakeholders\", \"raci\"]\r\n---\r\n\r\n# Visión del Producto, Contexto de Negocio y Stakeholders (IEEE Std. 830-1998)\r\n\r\n> [!NOTE]\r\n> Especificación formal del propósito, alcance, límites, usuarios y gobernanza del **AI Agentic SDD Engineering Harness** bajo el estándar IEEE Std. 830-1998 / ISO/IEC/IEEE 29148.\r\n\r\n---\r\n\r\n## 1. Naturaleza y Propósito del Proyecto\r\n\r\nEl **AI Agentic SDD Engineering Harness** es un arnés universal y agnóstico de ingeniería de software dirigido por especificaciones (**Spec-Driven Development — SDD**) diseñado para permitir la colaboración autónoma, segura y determinista entre ingenieros humanos y agentes de inteligencia artificial (Google Antigravity, GitHub Copilot y OpenCode).\r\n\r\n### 1.1 Formulación del Problema\r\n\r\n#### Dolor de Negocio\r\n- **Fricción Cognitiva y Pérdida de Productividad**: En organizaciones de software, la rotación de desarrolladores y el conocimiento tácito atrapado en silos (*Bus Factor = 1*) provocan que los ingenieros senior pierdan entre 1.5 y 2.5 horas diarias respondiendo dudas operativas y validando reglas de negocio no documentadas.\r\n- **Alucinaciones y Regresiones por IA**: Los asistentes de programación tradicionales generan código sintácticamente correcto pero funcionalmente incompatible cuando carecen de un modelo formal del dominio, rompiendo invariantes de base de datos, violando reglas de negocio (`BR-*`) o importando librerías no autorizadas.\r\n\r\n#### Dolor Técnico\r\n- **Ceguera de Contexto en Proyectos Extensos**: A partir de 50.000 líneas de código, cargar archivos planos en prompts satura la atención del modelo y causa omisiones catastróficas.\r\n- **Falta de Trazabilidad RTM**: Ausencia de vinculación bidireccional entre requerimientos funcionales (`RF-*`), reglas de negocio (`BR-*`), historias de usuario (`HU-*`), código fuente y suites de prueba automatizadas.\r\n\r\n---\r\n\r\n## 2. Declaración Formal de la Visión del Producto\r\n\r\n> **PARA** ingenieros de software, arquitectos de soluciones y equipos de desarrollo asistidos por IA,  \r\n> **QUIENES** experimentan alucinaciones, código desalineado con el dominio y regresiones al usar agentes de programación en bases de código medianas y complejas,  \r\n> **EL** AI Agentic SDD Engineering Harness,  \r\n> **QUE ES UN** arnés de ingeniería de software agnóstico basado en Docs-as-Code, orquestación multi-agente y verificación formal en 8 niveles,  \r\n> **QUE** garantiza una precisión funcional $\\ge 95\\%$ en el código generado por IA mediante un ciclo cerrado y determinista (Especificación EARS $\\to$ Puerta Humana $\\to$ Implementación TDD/SDD $\\to$ Revisión Imparcial $\\to$ Verificación Automatizada), triple sincronización de skills y tablero visual offline.\r\n\r\n---\r\n\r\n## 3. Ámbito del Producto (IEEE 830 Secciones 1.2 y 2.2)\r\n\r\n### 3.1 Qué HACE el Sistema (Alcance Incluido)\r\n1. **Orquestación Multi-Agente Homologada**: Provee 4 roles especializados (`leader`, `spec-author`, `implementer`, `reviewer`) con responsabilidades estrictamente delimitadas.\r\n2. **Gobernanza de Ramas y Commits**: Impone la convención obligatoria `{feature|bugfix}/INT-{numero}/{nombre_rama}` con longitud máxima de 80 caracteres y commits semánticos (`feat`, `fix`).\r\n3. **Puertas de Decisión Humana Infranqueables**: Utiliza herramientas nativas (`ask_question`) para congelar la ejecución hasta obtener aprobación explícita del humano antes de implementar o integrar código.\r\n4. **Triple Sincronización de 18 Skills**: Mantiene paridad absoluta e instantánea entre la fuente de verdad (`.opencode/skills/`) y los espejos (`.github/skills/` y `.agents/skills/`).\r\n5. **Base de Conocimiento Soberana (Docs-as-Code)**: Elicita y estructura modelos C4, diagramas UML, diccionario de datos/ERD, catálogo de reglas de negocio (`BR-*`), ADRs y radiografía granular de módulos.\r\n6. **Tablero Visual Offline-First (`project-docs/`)**: Aplicación web en Vanilla JS y Tailwind v4 con arquitectura screaming, lector editorial, editor dual Markdown/Bloques ContextForge, grafos de dependencias y constelación 3D en Three.js con soporte nativo para protocolo `file:///`.\r\n7. **Pipeline de Calidad en 8 Niveles (`project-docs/verify.sh`)**: Ejecuta pruebas unitarias, ATDD smoke, caja blanca, caja negra (BVA/resiliencia), integración/sistema, carga concurrente y aceptación E2E con Playwright.\r\n\r\n### 3.2 Qué NO HACE el Sistema (Exclusiones Explícitas)\r\n- **No Toma Decisiones de Arquitectura Autónomas**: Las decisiones de diseño, aprobación de especificaciones e integración a la rama base requieren siempre autorización del humano.\r\n- **No Realiza Push Remoto no Autorizado**: Queda terminantemente prohibido ejecutar `git push` a repositorios remotos sin confirmación explícita del usuario.\r\n- **No Modifica Código Durante la Fase de Revisión**: El subagente `reviewer` audita de forma imparcial y jamás edita código fuente ni tests.\r\n- **No Acopla el Proyecto a un Framework Específico**: El arnés es agnóstico al lenguaje (Node.js, .NET, Python, Go, Java, Rust); solo la carpeta de configuración `.agents/` y `project-docs/` forman el arnés.\r\n\r\n---\r\n\r\n## 4. Catálogo de Stakeholders y Matriz RACI (IEEE 830 Sección 2.3)\r\n\r\n### 4.1 Catálogo de Interesados\r\n\r\n| Stakeholder | Rol en el Sistema | Responsabilidad | Intereses Principales | Necesidades Clave |\r\n|---|---|---|---|---|\r\n| **Tech Lead / Arquitecto** | Sponsor & Owner | Diseñar la arquitectura base y aprobar specs/ADRs | Mantenibilidad, reducción de deuda técnica | Documentación AS-IS fidedigna, cero alucinaciones de IA |\r\n| **Ingeniero de Software (Dev)** | Usuario Directo | Implementar features y refactorizaciones | Velocidad de desarrollo, contexto claro | Búsqueda rápida de reglas BR-*, especificaciones unívocas |\r\n| **Agentes de IA (AGY/Copilot)** | Ejecutores Asistidos | Redactar specs, implementar código y auditar | Contexto sin truncamiento, instrucciones deterministas | YAML frontmatter, tarjetas CRC, lista blanca de dependencias |\r\n| **QA Automation Specialist** | Usuario Directo | Diseñar y supervisar la suite de pruebas | Cobertura en ramas, confiabilidad de regresión | Matriz RTM completa, pruebas BVA y Playwright E2E |\r\n| **Product Manager / Negocio** | Usuario Indirecto | Priorizar features y validar aceptación | Time-to-market, alineación con negocio | Visibilidad visual de progreso en el tablero interactivo |\r\n\r\n### 4.2 Matriz RACI de Componentes del Sistema\r\n\r\n| Componente / Proceso | Tech Lead | Dev Humano | Leader Agent | Implementer | Reviewer | QA |\r\n|---|---|---|---|---|---|---|\r\n| **Definición de Requerimientos** | A | C | R | I | C | C |\r\n| **Aprobación de Spec (Puerta)** | A / R | A / R | C | I | I | I |\r\n| **Implementación de Código** | I | C | C | R | I | I |\r\n| **Auditoría de Calidad / Review** | I | I | C | I | R | C |\r\n| **Ejecución de project-docs/verify.sh** | I | C | I | R | R | A / R |\r\n| **Integración a Rama Base** | A | R | C | I | I | I |\r\n\r\n*Convención: R = Responsable de ejecutar, A = Aprobador final, C = Consultado, I = Informado.*\r\n\r\n---\r\n\r\n## 5. Perfiles de Usuario y Personas (IEEE 830 Sección 2.3)\r\n\r\n### Persona 1: Ingeniero Senior / Tech Lead\r\n- **Formación**: Licenciatura / Maestría en Ciencias de la Computación o Ingeniería de Sistemas.\r\n- **Experiencia**: >8 años en desarrollo de software y arquitectura distribuida.\r\n- **Punto de Dolor**: Dedica demasiado tiempo explicando arquitectura histórica y corrigiendo PRs generados por IA que inventan dependencias o violan reglas de negocio.\r\n- **Objetivo con el Arnés**: Disponer de un arnés que obligue a los agentes a ceñirse al contexto soberano antes de escribir una sola línea de código.\r\n\r\n### Persona 2: Desarrollador Junior / Nuevo Integrante\r\n- **Formación**: Grado en Ingeniería o egresado de Bootcamp técnico.\r\n- **Experiencia**: 6 meses a 2 años en programación.\r\n- **Punto de Dolor**: Alta fricción cognitiva al incorporarse a proyectos grandes; miedo a romper reglas tácitas no documentadas.\r\n- **Objetivo con el Arnés**: Reducir su *time-to-first-PR* a menos de una semana gracias a la documentación interactiva y las tarjetas CRC.\r\n",
    "02-architecture-and-patterns.md": "---\r\nid: DOC-ARCH-PATTERNS\r\ntitle: \"Diagnóstico AS-IS de Arquitectura, Flujos de Datos y Catálogo de Patrones\"\r\nmodule: \"global\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"architecture-as-is\", \"design-patterns\", \"gof\", \"screaming-architecture\", \"data-flows\"]\r\n---\r\n\r\n# Diagnóstico AS-IS de Arquitectura, Flujos de Datos y Catálogo de Patrones\r\n\r\n> [!NOTE]\r\n> Diagnóstico forense de la arquitectura real implementada en el repositorio, dirección de dependencias, flujos de datos paso a paso y matriz de patrones de diseño verificados en el código fuente.\r\n\r\n---\r\n\r\n## 1. Diagnóstico del Estilo Arquitectónico Implementado (AS-IS)\r\n\r\n### 1.1 Organización por Screaming Architecture\r\nEl repositorio implementa una **Arquitectura que Grita su Propósito (Screaming Architecture)**. El código no está organizado por capas genéricas superficiales (`controllers/`, `views/`), sino que separa claramente el motor del arnés, las configuraciones de agentes y los slices de dominio de la aplicación:\r\n\r\n```text\r\nharness_anginnering/\r\n├── .agents/             # Dominio: Orquestación Antigravity 2.0 (Reglas, Roles y Skills)\r\n├── .github/             # Dominio: Espejo GitHub Copilot (Instructions y Skills)\r\n├── .opencode/           # Dominio: Fuente Canónica OpenCode (Rules y Skills fuente de verdad)\r\n├── project-docs/        # Aplicación: Tablero de Seguimiento Interactivo & Docs-as-Code\r\n│   ├── src/             # Frontend Modular en Vanilla JS + Tailwind v4\r\n│   │   ├── core/        # Núcleo técnico (api, detector, router, store)\r\n│   │   ├── features/    # Vertical Slices del Dominio (stats, current-spec, knowledge-base, etc.)\r\n│   │   └── shared/      # Componentes UI reutilizables (Badge, Button, Icons, MarkdownViewer)\r\n│   ├── knowledge/       # Base de Conocimiento Soberana (Docs-as-Code)\r\n│   └── dist/            # Bundle autocontenido IIFE (app.bundle.js)\r\n└── tests/               # Suite de Verificación en 8 Niveles (Unit, E2E, Whitebox, Blackbox, System, Load, Acceptance)\r\n```\r\n\r\n### 1.2 Topología Macro y Dualidad Offline-First\r\n- **Modo Servidor Local HTTP**: Servidor nativo de Node.js (`project-docs/serve.js`) en puerto dinámico con cabeceras CORS permisivas, compresión y entrega estática.\r\n- **Modo Offline-First Puro (`file:///`)**: Invariante `BR-DASH-001`. El tablero web puede abrirse con doble clic directamente en el navegador sin servidor web ni conexión a internet, alimentado por el módulo de respaldo `project-docs/data-fallback.js` sincronizado automáticamente por `sync-data.js`.\r\n\r\n---\r\n\r\n## 2. Catálogo Forense de Patrones de Diseño Detectados\r\n\r\n| Patrón de Diseño | Categoría | Archivo / Componente | Propósito y Problema que Resuelve en el Arnés |\r\n|---|---|---|---|\r\n| **Reactive Store (Pub/Sub)** | Comportamiento | `project-docs/src/core/store.js` | Mantiene el estado inmutable del tablero y notifica reactivamente a los componentes suscritos ante cambios. |\r\n| **Fallback Data Cache** | Resiliencia / Datos | `project-docs/src/core/api.js` y `data-fallback.js` | Garantiza funcionamiento 100% offline y silencia errores CORS cuando el navegador ejecuta bajo protocolo `file:///`. |\r\n| **Triple Mirror Sync** | Arquitectónico | `.opencode/rules/skills-sync.md` y `sync-skills` | Mantiene una única fuente de verdad canónica (`.opencode/`) y replica unidireccionalmente hacia Copilot y Antigravity. |\r\n| **Dual Editor Mode** | UI / Interacción | `project-docs/src/shared/MarkdownViewer.js` | Permite alternar bidireccionalmente entre edición Markdown textual y bloques visuales interactivos con scroll sincronizado. |\r\n| **Component Factory / Renderer** | Creacional | `project-docs/src/shared/` (`Badge.js`, `Button.js`, `Icons.js`, `MermaidViewer.js`) | Genera elementos HTML vectoriales estándar con parametrización de estilos y sin dependencias de frameworks externos. |\r\n| **Asynchronous Retry Guard** | Resiliencia | `project-docs/src/main.js` (`initMermaidDiagrams`) | Reintenta de forma controlada la inicialización de librerías CDN (Mermaid) para evitar diagramas en blanco si la carga tarda milisegundos. |\r\n| **Separation of Concerns (SoC)** | Arquitectónico | `.agents/agents/` | Separa la especificación (`spec-author`), implementación (`implementer`) y revisión imparcial (`reviewer`) sin permitir edición cruzada. |\r\n\r\n---\r\n\r\n## 3. Flujos de Datos Extremo a Extremo (Data Flows)\r\n\r\n### 3.1 Flujo 1: Sincronización y Carga de Datos en el Tablero\r\n```text\r\n1. Agente o Desarrollador modifica specs, reglas o feature_list.json\r\n2. Ejecución de `node project-docs/sync-data.js`\r\n3. `sync-data.js` lee archivos markdown, extrae metadatos, tiempo de lectura y diagramas Mermaid\r\n4. Genera `project-docs/data-fallback.js` y actualiza `project-docs/dist/app.bundle.js`\r\n5. Al abrir `index.html`:\r\n   - Si es HTTP: `api.js` realiza fetch con cache-buster hacia los JSON\r\n   - Si es file:///: `api.js` lee instantáneamente `window.__FALLBACK_DATA__` sin red\r\n6. `store.js` recibe el payload, actualiza su estado interno y dispara re-render en las vistas activas\r\n```\r\n\r\n### 3.2 Flujo 2: Ciclo de Vida SDD Multi-Agente\r\n```text\r\n1. Usuario solicita nueva feature o bugfix\r\n2. Subagente `leader` valida entorno y crea rama `{type}/INT-{id}/{name}` (≤80c)\r\n3. Subagente `spec-author` redacta requirements.md, design.md y tasks.md\r\n4. Puerta Humana obligatoria: `ask_question` congela ejecución hasta aprobación 100%\r\n5. Subagente `implementer` escribe código de producción y tests automatizados\r\n6. Subagente `reviewer` audita build, tests, cobertura y trazabilidad (sin editar código)\r\n7. Puerta Humana de cierre: `ask_question` consulta si fusionar a rama base\r\n```\r\n",
    "03-capabilities-and-features.md": "---\r\nid: DOC-SYS-CAPABILITIES-FEATURES\r\ntitle: \"Catálogo Exhaustivo de Capacidades, Features y Desglose Funcional (DeepWiki Pattern)\"\r\nmodule: \"global\"\r\nstatus: \"Publicado\"\r\nversion: \"4.2.0\"\r\nlast_updated: \"2026-11-07\"\r\ntags: [\"deepwiki\", \"capabilities\", \"features\", \"mindmap\", \"user-journeys\", \"functional-decomposition\", \"deep-linking\", \"scrum-subtasks\", \"qa-evidence\"]\r\n---\r\n\r\n# Catálogo Exhaustivo de Capacidades, Features y Desglose Funcional\r\n\r\n> [!NOTE]\r\n> Este documento implementa el patrón de ingeniería inversa funcional de **DeepWiki / OpenDeepWiki**. Descompone el sistema en capacidades de alto nivel, features granulares, mapa mental de dependencias, flujos de usuario de extremo a extremo (*User Journeys*) y vínculos directos al código fuente (*Deep Source Linking*) para eliminar puntos ciegos y alucinaciones en agentes de IA.\r\n\r\n---\r\n\r\n## 1. Mapa Mental de Funcionalidades del Sistema (Mermaid Mindmap)\r\n\r\n```mermaid\r\nmindmap\r\n  root((AI Agentic SDD Harness))\r\n    Orquestación Multi-Agente\r\n      Control de Ramas INT-000 ≤80c\r\n      Redactor de Specs spec-author\r\n      Puerta Humana ask_question\r\n      Implementador TDD/SDD implementer\r\n      Auditor Independiente reviewer\r\n      Subtareas Scrum DEV/QA\r\n      Captura de Evidencias Visuales\r\n      Puerta de Integración Merge/PR\r\n    Sincronización Triple\r\n      Fuente de Verdad .opencode\r\n      Espejo Copilot .github\r\n      Espejo Antigravity .agents\r\n      Auditoría de Paridad sync-skills\r\n    Base de Conocimiento Soberana\r\n      Descubrimiento Forense en 2 Fases\r\n      Atlas de Diagramas C4 y UML\r\n      Catálogo de Invariantes BR-*\r\n      Diccionario de Datos y ERD\r\n      5 Bounded Contexts Especializados\r\n      Megadocumento MASTER-*.md\r\n      Desglose Funcional DeepWiki\r\n    Tablero Visual project-docs\r\n      Navegación en 3 Niveles\r\n      Lector Editorial 780px + TOC\r\n      Editor Dual ContextForge\r\n      Buscador Omnibox Ctrl+K\r\n      Constelación 3D Three.js\r\n      Interoperabilidad Offline file:///\r\n    Aseguramiento de Calidad QA\r\n      Pipeline project-docs/verify.sh 9 Niveles\r\n      Pruebas Unitarias Nativas\r\n      Pruebas Caja Blanca Branch Coverage\r\n      Pruebas Caja Negra BVA\r\n      Pruebas de Sistema e Interoperabilidad\r\n      Pruebas de Carga y Rendimiento\r\n      Aceptación E2E Playwright con Chrome\r\n```\r\n\r\n---\r\n\r\n## 2. Catálogo Jerárquico de Capacidades y Features Granulares\r\n\r\n### Capacidad 1: Orquestación Multi-Agente SDD (`agent-orchestrator`)\r\n\r\n#### Feature 1.1: Control y Aislamiento Estricto de Ramas Git\r\n- **Propósito**: Garantizar que ninguna tarea contamine las ramas base (`main`, `master`, `dev`), aislando el trabajo en ramas efímeras rastreables.\r\n- **Entrada / Disparador**: Solicitud de nueva feature o inicio de ciclo `/sdd-workflow`.\r\n- **Precondiciones**: Estado de working tree limpio en la rama base.\r\n- **Invariante**: Longitud total del nombre de la rama $\\le 80$ caracteres. Prefijo obligatorio `{feature|bugfix}/INT-{numero}/{nombre_descriptivo}`.\r\n- **Ciclo de Ejecución**:\r\n  1. Valida que la rama base sea válida.\r\n  2. Calcula la longitud del nombre propuesto.\r\n  3. Ejecuta `git checkout -b {feature|bugfix}/INT-{numero}/{nombre}`.\r\n- **Salida / Artefacto**: Rama local activa en Git.\r\n- **Código Fuente**: [`.agents/rules/antigravity-harness.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.agents/rules/antigravity-harness.md), [`.opencode/rules/branches.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.opencode/rules/branches.md).\r\n- **Pruebas Automatizadas**: [`tests/unit/branching-rules.test.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/tests/unit/branching-rules.test.js), [`tests/blackbox/bva-inputs.test.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/tests/blackbox/bva-inputs.test.js).\r\n\r\n#### Feature 1.2: Redacción Formal de Especificaciones Técnicas (`spec-author`)\r\n- **Propósito**: Redactar el contrato técnico antes de escribir código, previniendo desviaciones funcionales y sobre-ingeniería.\r\n- **Entrada / Disparador**: Invocación de subagente `spec-author` o skill `/generate-spec`.\r\n- **Precondiciones**: Consulta obligatoria previa de `project-docs/knowledge/` para respetar la arquitectura soberana.\r\n- **Ciclo de Ejecución**:\r\n  1. Lee el item correspondiente en `project-docs/feature_list.json`.\r\n  2. Genera `project-docs/specs/{NNN}_{name}/requirements.md` siguiendo sintaxis EARS.\r\n  3. Genera `project-docs/specs/{NNN}_{name}/design.md` con decisiones ADRs y diagramas Mermaid.\r\n  4. Genera `project-docs/specs/{NNN}_{name}/tasks.md` con tareas secuenciales y técnica recomendada (TDD / SDD / FTD).\r\n  5. Marca el estado como `spec_ready` en `progress/current.json`.\r\n- **Salida / Artefacto**: Carpeta de especificación formal completa.\r\n- **Código Fuente**: [`.agents/agents/spec-author.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.agents/agents/spec-author.md), [`.agents/skills/generate-spec/SKILL.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.agents/skills/generate-spec/SKILL.md).\r\n\r\n#### Feature 1.3: Puerta de Aprobación Humana Interactiva\r\n- **Propósito**: Asegurar la soberanía humana sobre el alcance y arquitectura antes de autorizar la codificación.\r\n- **Entrada / Disparador**: Finalización de la redacción del spec (`spec_ready`).\r\n- **Comportamiento**: La IA bloquea la ejecución y despliega el modal interactivo nativo `ask_question`.\r\n- **Opciones**:\r\n  - `(Recommended) Aprobar spec al 100% e iniciar implementación`\r\n  - `Solicitar correcciones o ajustes en el spec`\r\n  - `Rechazar spec`\r\n- **Invariante**: Queda prohibido escribir código de producción sin la opción de aprobación humana explícita.\r\n- **Código Fuente**: [`.agents/rules/antigravity-harness.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.agents/rules/antigravity-harness.md).\r\n\r\n#### Feature 1.4: Implementación Guiada por Pruebas TDD/SDD (`implementer`)\r\n- **Propósito**: Escribir código de producción y pruebas automatizadas que satisfagan al 100% la especificación aprobada.\r\n- **Entrada / Disparador**: Aprobación humana del spec (`in_progress`).\r\n- **Ciclo de Ejecución**:\r\n  1. Si la técnica es TDD: escribe pruebas que fallen (rojo) $\\to$ implementa código mínimo (verde) $\\to$ refactoriza.\r\n  2. Si la técnica es SDD: implementa fases de diseño $\\to$ cubre con tests unitarios y de aceptación.\r\n  3. Ejecuta `project-docs/verify.sh` de forma iterativa hasta verde total.\r\n  4. Documenta la matriz de trazabilidad Requerimiento $\\leftrightarrow$ Tests en `progress/impl_{name}.md`.\r\n- **Salida / Artefacto**: Código productivo, suite de tests y bitácora de trazabilidad.\r\n- **Código Fuente**: [`.agents/agents/implementer.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.agents/agents/implementer.md), [`.agents/skills/implement/SKILL.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.agents/skills/implement/SKILL.md).\r\n\r\n#### Feature 1.5: Auditoría de Calidad Imparcial (`reviewer`)\r\n- **Propósito**: Validar de manera independiente que la implementación cumpla con el spec sin incurrir en conflictos de interés.\r\n- **Invariante**: El revisor **NO tiene herramientas para editar archivos ni código**.\r\n- **Ciclo de Ejecución**:\r\n  1. Audita el código generado contra los criterios de aceptación de `requirements.md`.\r\n  2. Verifica que ninguna regla `BR-*` haya sido alterada o vulnerada.\r\n  3. Comprueba el paso del 100% de las pruebas en `project-docs/verify.sh`.\r\n  4. Emite veredicto: APROBADO o RECHAZADO con lista de hallazgos.\r\n- **Código Fuente**: [`.agents/agents/reviewer.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.agents/agents/reviewer.md), [`.agents/skills/review/SKILL.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.agents/skills/review/SKILL.md).\r\n\r\n#### Feature 1.6: Gestión de Subtareas Scrum Jira DEV/QA y Captura de Evidencias Visuales\r\n- **Propósito**: Descomponer la User Story en subtareas formales de Jira (desarrollo `DEV` y aseguramiento de calidad `QA`), con trazabilidad a criterios de aceptación, DoD y captura automática de evidencias gráficas (screenshots headless) para auditoría.\r\n- **Entrada / Disparador**: Generación de spec (`generate-spec`) y ejecución de pruebas de aceptación (`npm run test:acceptance` o `node scripts/capture-evidence.js`).\r\n- **Precondiciones**: Existencia de `project-docs/specs/{NNN}_{name}/tasks.md` estructurado con subtareas `INT-{id}-DEV` e `INT-{id}-QA`.\r\n- **Invariante**: Ninguna feature puede cerrarse sin que ambas subtareas (`DEV` y `QA`) estén completadas y existan capturas de pantalla de evidencia en `project-docs/specs/{NNN}_{name}/evidence/`.\r\n- **Salida / Artefacto**: Modal interactivo en el tablero con badges DEV/QA, trazabilidad DoD y capturas PNG en `evidence/`.\r\n- **Código Fuente**: [`scripts/capture-evidence.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/scripts/capture-evidence.js), [`project-docs/src/shared/Modal.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/src/shared/Modal.js), [`project-docs/src/features/feature-list/FeatureTable.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/src/features/feature-list/FeatureTable.js).\r\n- **Pruebas Automatizadas**: [`tests/acceptance/scrum-evidence-capture.spec.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/tests/acceptance/scrum-evidence-capture.spec.js).\r\n\r\n---\r\n\r\n### Capacidad 2: Motor de Sincronización Triple (`triple-sync-engine`)\r\n\r\n#### Feature 2.1: Gestión de Fuente de Verdad y Replicación\r\n- **Propósito**: Mantener paridad absoluta en las 18 skills entre las tres plataformas soportadas (opencode, GitHub Copilot y Google Antigravity).\r\n- **Fuente de Verdad**: `.opencode/skills/`\r\n- **Espejos Homologados**: `.github/skills/` y `.agents/skills/`.\r\n- **Mecanismo**: Skill `/sync-skills` audita y propaga diferencias sin alterar la fuente.\r\n- **Código Fuente**: [`.opencode/skills/sync-skills/SKILL.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.opencode/skills/sync-skills/SKILL.md).\r\n\r\n---\r\n\r\n### Capacidad 3: Base de Conocimiento Soberana (`knowledge-engine`)\r\n\r\n#### Feature 3.1: Protocolo de Descubrimiento Forense en 2 Fases\r\n- **Propósito**: Eliminar el desbordamiento de contexto (*context truncation*) en repositorios de gran escala.\r\n- **Fase 1 (Topología Global)**: Escaneo superficial de directorios, manifiestos de paquetes y configuraciones sin leer cuerpos completos de código.\r\n- **Fase 2 (Extracción Profunda)**: Análisis focalizado delimitado por cada Bounded Context.\r\n- **Salida**: Documentos globales 01, 02, 03, 04 y carpetas `modules/{modulo}/`.\r\n- **Código Fuente**: [`.opencode/skills/project-knowledge/SKILL.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.opencode/skills/project-knowledge/SKILL.md).\r\n\r\n#### Feature 3.2: Megadocumento Maestro Consolidado (`MASTER-PROJECT-KNOWLEDGE.md`)\r\n- **Propósito**: Proporcionar un dossier unificado en un solo archivo para inicializar LLMs sin sesgo ni necesidad de múltiples lecturas.\r\n- **Estructura**: Capítulos formales (Negocio IEEE 830, Arquitectura AS-IS, Modelado C4, Bounded Contexts con CRC, INVEST, ERD, Reglas `BR-*`, Servicios Externos y RTM).\r\n- **Código Fuente**: [`project-docs/knowledge/MASTER-PROJECT-KNOWLEDGE.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/knowledge/MASTER-PROJECT-KNOWLEDGE.md).\r\n\r\n#### Feature 3.3: Desglose de 5 Artefactos Especializados por Bounded Context\r\n- **Propósito**: Documentar granularmente cada subdominio estratégico con 5 documentos formales:\r\n  1. `module-spec.md`: Alcance, lenguaje ubicuo y tarjetas CRC (Clase, Responsabilidades, Colaboradores).\r\n  2. `requirements-and-rules.md`: Matriz de requerimientos `RF-*`, invariantes `BR-*`, `HU-*` y `TI-*`.\r\n  3. `data-and-transactions.md`: Persistencia, entidades, concurrencia optimista/pesimista y bloqueos ACID.\r\n  4. `diagrams.md`: Suite de diagramas Mermaid dedicados (Contexto, Contenedor, Componentes, Secuencia, Estado y ERD).\r\n  5. `technical-debt-refactoring.md`: Deuda técnica, olores de código, brechas de pruebas y plan de mitigación.\r\n- **Código Fuente**: [`project-docs/knowledge/modules/`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/knowledge/modules/).\r\n\r\n---\r\n\r\n### Capacidad 4: Tablero Visual y Lector Editorial (`dashboard-visualizer`)\r\n\r\n#### Feature 4.1: Navegación por Perspectivas en 3 Niveles\r\n- **Propósito**: Permitir que el usuario explore la documentación sin mezclar arbitrariamente información global con detalles de módulos.\r\n- **Tiers Disponibles**:\r\n  - **Tier 1 (Visión Global & Arquitectura)**: Documentos canónicos, modelo C4 destacado, resumen IEEE 830 y 6 estantes temáticos.\r\n  - **Tier 2 (Módulos & Bounded Contexts)**: Pestañas interactivas de módulos con sus 5 artefactos formales.\r\n  - **Tier 3 (Dossier Maestro Consolidado)**: Panel dedicado para `MASTER-PROJECT-KNOWLEDGE.md` con botones para leer, copiar y descargar.\r\n- **Código Fuente**: [`project-docs/src/features/knowledge-base/KnowledgeBase.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/src/features/knowledge-base/KnowledgeBase.js).\r\n\r\n#### Feature 4.2: Editor Dual ContextForge con Scroll Sincronizado\r\n- **Propósito**: Ofrecer edición técnica simultánea en Markdown y Bloques Visuales con previsualización en vivo.\r\n- **Características**: Scroll sincronizado proporcional bidireccional, renderizado de Mermaid y reordenamiento de bloques.\r\n- **Código Fuente**: [`project-docs/src/main.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/src/main.js).\r\n\r\n#### Feature 4.3: Interoperabilidad Offline (`file:///`) y Fallback Autocontenido\r\n- **Propósito**: Permitir que el tablero funcione abriendo `index.html` directamente en el navegador sin necesidad de servidor HTTP ni riesgo de errores de CORS.\r\n- **Mecanismo**: `data-fallback.js` inyecta `window.__FALLBACK_DATA__` con todos los metadatos y documentos Markdown.\r\n- **Código Fuente**: [`project-docs/data-fallback.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/data-fallback.js), [`project-docs/sync-data.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/sync-data.js).\r\n\r\n---\r\n\r\n### Capacidad 5: Suite Integral de Aseguramiento de Calidad (`testing-qa-suite`)\r\n\r\n#### Feature 5.1: Pipeline de Verificación Determinista en 9 Niveles (`project-docs/verify.sh`)\r\n- **Propósito**: Ejecutar un barrido exhaustivo de calidad en una sola instrucción.\r\n- **Niveles Validados**:\r\n  1. Compilación y bundling (`esbuild`).\r\n  2. Pruebas unitarias nativas (Node.js test runner).\r\n  3. Pruebas de aceptación smoke ATDD.\r\n  4. Pruebas de caja blanca (Branch Coverage).\r\n  5. Pruebas de caja negra (Análisis de Valores Límite BVA y resiliencia).\r\n  6. Pruebas de sistema e interoperabilidad offline.\r\n  7. Pruebas de carga y concurrencia.\r\n  8. Pruebas de aceptación E2E en navegador real con Playwright.\r\n  9. Sincronización y consistencia de datos offline.\r\n- **Código Fuente**: [`project-docs/verify.sh`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/verify.sh).\r\n\r\n---\r\n\r\n## 3. Flujos de Usuario Extremo a Extremo (*User Journeys*)\r\n\r\n### Journey 1: Desarrollador realizando el Onboarding de un Proyecto Externo\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor Dev as \"Ingeniero Humano\"\r\n  participant AG as \"AI Harness Agent\"\r\n  participant Core as \"Pipeline de Skills\"\r\n  participant Dash as \"Tablero Visual\"\r\n\r\n  Dev->>AG: \"Adopta este proyecto y prepáralo con el arnés\"\r\n  AG->>Core: \"/technical-audit -> genera project-docs/project-spec.yaml\"\r\n  AG->>Core: \"/generate-verify -> genera project-docs/verify.sh\"\r\n  AG->>Core: \"/project-knowledge -> extrae C4, UML, ERD, BR-* y MASTER-*.md\"\r\n  AG->>Core: \"/requirements-analysis -> genera feature_list.json\"\r\n  AG->>Core: \"node project-docs/sync-data.js\"\r\n  AG->>Dash: \"Tablero listo en project-docs/index.html\"\r\n  AG-->>Dev: \"Proyecto auditado y blindado contra alucinaciones\"\r\n```\r\n\r\n### Journey 2: Ciclo de Vida Autónomo de una Feature (SDD)\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor Dev as \"Ingeniero Humano\"\r\n  participant Leader as \"Leader Agent\"\r\n  participant Spec as \"spec-author\"\r\n  participant Impl as \"implementer\"\r\n  participant Rev as \"reviewer\"\r\n\r\n  Dev->>Leader: \"/start-feature INT-005\"\r\n  Leader->>Leader: \"Crea rama feature/INT-005/{name} (≤80c)\"\r\n  Leader->>Spec: \"Redacta specs consultando project-docs/knowledge/\"\r\n  Spec-->>Leader: \"specs/005/ completado (spec_ready)\"\r\n  Leader->>Dev: \"⏸ ask_question: ¿Aprobar spec al 100%?\"\r\n  Dev-->>Leader: \"Aprobado (in_progress)\"\r\n  Leader->>Impl: \"Implementa código y tests (TDD/SDD)\"\r\n  Impl->>Impl: \"Ejecuta ./project-docs/verify.sh hasta 100% verde\"\r\n  Impl-->>Leader: \"Trazabilidad R<->Tests completada\"\r\n  Leader->>Rev: \"Audita sin editar código\"\r\n  Rev-->>Leader: \"Aprobado (0 hallazgos)\"\r\n  Leader->>Leader: \"/verify-spec cierra metadata y crea commit semántico\"\r\n  Leader->>Dev: \"⏸ ask_question: ¿Integrar a rama base master?\"\r\n  Dev-->>Leader: \"Sí, fusionar\"\r\n  Leader->>Leader: \"git merge fast-forward\"\r\n```\r\n\r\n### Journey 3: Auto-Mejora y Refactorización del Propio Arnés\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor Dev as \"Ingeniero Humano\"\r\n  participant Leader as \"Leader Agent\"\r\n  participant QA as \"Suite de Testing\"\r\n  participant Code as \"Código del Arnés\"\r\n\r\n  Dev->>Leader: \"Refactoriza el visor y agrega desglose DeepWiki\"\r\n  Leader->>QA: \"Ejecuta línea base (project-docs/verify.sh + Playwright)\"\r\n  QA-->>Leader: \"Línea base en verde\"\r\n  Leader->>Code: \"Aplica refactorización (cero emojis, 3 tiers, SVG icons)\"\r\n  Leader->>QA: \"Re-ejecuta project-docs/verify.sh multinivel\"\r\n  QA-->>Leader: \"Todos los niveles en verde\"\r\n  Leader->>Code: \"Commit semántico feat(knowledge): ...\"\r\n  Leader-->>Dev: \"Auto-mejora completada con 100% de tests passing\"\r\n```\r\n\r\n---\r\n\r\n## 4. Matriz de Trazabilidad Funcional y Deep Linking a Código Fuente\r\n\r\n| ID Capacidad | Feature | Componente Fuente | Suite de Pruebas Asociada |\r\n| :--- | :--- | :--- | :--- |\r\n| `CAP-ORCH-001` | Validación de Ramas Git (≤80c) | [`.agents/rules/antigravity-harness.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.agents/rules/antigravity-harness.md) | [`tests/unit/branching-rules.test.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/tests/unit/branching-rules.test.js) |\r\n| `CAP-ORCH-002` | Puertas de Aprobación Humana | `ask_question` modal | [`tests/e2e/atdd-frontend.test.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/tests/e2e/atdd-frontend.test.js) |\r\n| `CAP-ORCH-003` | Auditoría de Calidad Sin Edición | [`.agents/agents/reviewer.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.agents/agents/reviewer.md) | Inspección de permisos de herramientas |\r\n| `CAP-ORCH-004` | Subtareas Scrum Jira DEV/QA & Evidencias | [`scripts/capture-evidence.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/scripts/capture-evidence.js) | [`tests/acceptance/scrum-evidence-capture.spec.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/tests/acceptance/scrum-evidence-capture.spec.js) |\r\n| `CAP-SYNC-001` | Paridad de 18 Skills en 3 Espejos | [`.opencode/skills/sync-skills/`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.opencode/skills/sync-skills/) | [`tests/system/offline-fallback.test.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/tests/system/offline-fallback.test.js) |\r\n| `CAP-KNOW-001` | Descubrimiento Forense en 2 Fases | [`.opencode/skills/project-knowledge/`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/.opencode/skills/project-knowledge/) | [`tests/whitebox/sync-pipeline.test.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/tests/whitebox/sync-pipeline.test.js) |\r\n| `CAP-KNOW-002` | Dossier Consolidado MASTER-*.md | [`project-docs/knowledge/MASTER-*.md`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/knowledge/MASTER-PROJECT-KNOWLEDGE.md) | [`tests/unit/sync-data.test.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/tests/unit/sync-data.test.js) |\r\n| `CAP-DASH-001` | Lector y Editor Dual ContextForge | [`project-docs/src/main.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/src/main.js) | [`tests/acceptance/dual-editor.spec.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/tests/acceptance/dual-editor.spec.js) |\r\n| `CAP-DASH-002` | Interoperabilidad Offline `file:///` | [`project-docs/data-fallback.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/data-fallback.js) | [`tests/system/offline-fallback.test.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/tests/system/offline-fallback.test.js) |\r\n| `CAP-TEST-001` | Pipeline de Verificación `project-docs/verify.sh` | [`project-docs/verify.sh`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/project-docs/verify.sh) | Ejecución integral de las 9 fases |\r\n| `CAP-TEST-002` | Aceptación E2E en Navegador Real | [`tests/acceptance/*.spec.js`](file:///c:/Users/nayid/Documents/Proyectos/Proyecto%20-%20Harness/harness_anginnering/tests/acceptance/) | `npx playwright test` (10 escenarios) |\r\n",
    "04-domain-ddd-and-crc.md": "---\r\nid: DOC-DDD-CRC\r\ntitle: \"Modelo de Dominio DDD, Lenguaje Ubicuo y Tarjetas CRC\"\r\nmodule: \"global\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"ddd\", \"ubiquitous-language\", \"context-map\", \"crc-cards\", \"strategic-ddd\"]\r\n---\r\n\r\n# Modelo de Dominio DDD, Lenguaje Ubicuo y Tarjetas CRC\r\n\r\n> [!NOTE]\r\n> Especificación formal del diseño guiado por el dominio (DDD Estratégico y Táctico), mapa de contextos y catálogo de Tarjetas CRC (*Class-Responsibility-Collaborator*).\r\n\r\n---\r\n\r\n## 1. Clasificación de Subdominios (DDD Estratégico)\r\n\r\n1. **Core Domain (Dominio Central)**:\r\n   - **`agent-orchestrator`**: Orquestación del ciclo de vida SDD, ciclo de subagentes especializados, cumplimiento estricto de convenciones de branching y puertas humanas con `ask_question`.\r\n2. **Supporting Subdomains (Subdominios de Soporte)**:\r\n   - **`triple-sync-engine`**: Motor de sincronización triple y garantía de paridad entre OpenCode, Copilot y Antigravity.\r\n   - **`knowledge-engine`**: Motor de ingesta y preservación de contexto soberano Docs-as-Code anti-sesgo.\r\n   - **`dashboard-visualizer`**: Tablero interactivo, lector editorial, editor dual ContextForge y visualizador 3D.\r\n   - **`testing-qa-suite`**: Automatización del arnés de verificación en 8 niveles y runner de `project-docs/verify.sh`.\r\n3. **Generic Subdomains (Subdominios Genéricos)**:\r\n   - Control de versiones (Git), motor de renderizado Markdown y Three.js.\r\n\r\n---\r\n\r\n## 2. Diccionario de Lenguaje Ubicuo (Ubiquitous Language)\r\n\r\n| Término Ubicuo | Definición Funcional y Técnica | Equivalente en Código / Artefactos |\r\n|---|---|---|\r\n| **Harness (Arnés)** | Conjunto de reglas, scripts, skills y roles que guían y restringen a los agentes de IA. | `.agents/`, `.opencode/`, `.github/`, `project-docs/verify.sh` |\r\n| **Spec-Driven Development (SDD)** | Metodología donde ninguna línea de código se escribe antes de aprobar formalmente su spec. | `project-docs/specs/{NNN}_{name}/`, `generate-spec` |\r\n| **Human Gate (Puerta Humana)** | Pausa obligatoria del flujo que bloquea la ejecución del agente hasta confirmación del humano. | Herramienta nativa `ask_question` |\r\n| **Rama INT-*** | Rama de trabajo dedicada que cumple `{feature\\|bugfix}/INT-{numero}/{nombre}` $\\le 80$ caracteres. | Convención en `AGENTS.md` y `branches.md` |\r\n| **Docs-as-Code** | Práctica de gestionar la documentación en Markdown versionado junto al código fuente. | `project-docs/knowledge/**` |\r\n| **Triple Sincronización** | Replicación unidireccional obligatoria desde `.opencode/` hacia Copilot y Antigravity. | `sync-skills` y `skills-sync.md` |\r\n| **Fallback Data** | Objeto embebido en JS que permite abrir el tablero vía `file:///` sin servidores ni CORS. | `project-docs/data-fallback.js` |\r\n\r\n---\r\n\r\n## 3. Catálogo Maestro de Tarjetas CRC (Class-Responsibility-Collaborator)\r\n\r\n### Tarjeta CRC 1: `LeaderAgent`\r\n- **Estereotipo DDD**: `<<AgentOrchestrator>>`\r\n- **Responsabilidades**:\r\n  1. Validar entorno de trabajo y rama base (`main`, `master`, `dev`).\r\n  2. Crear la rama de trabajo `{feature|bugfix}/INT-{numero}/{nombre_rama}` ($\\le 80$ caracteres).\r\n  3. Delegar tareas secuenciales en subagentes (`spec-author`, `implementer`, `reviewer`).\r\n  4. Detener el flujo y solicitar aprobación humana mediante `ask_question`.\r\n- **Colaboradores**: `GitCLI`, `SpecAuthorAgent`, `ImplementerAgent`, `ReviewerAgent`, `AskQuestionModal`.\r\n\r\n### Tarjeta CRC 2: `SpecAuthorAgent`\r\n- **Estereotipo DDD**: `<<RequirementsEngineer>>`\r\n- **Responsabilidades**:\r\n  1. Redactar especificaciones técnicas (`requirements.md`, `design.md`, `tasks.md`).\r\n  2. Aplicar sintaxis formal de requerimientos EARS e IEEE 830.\r\n  3. Recomendar técnica de implementación (TDD, SDD o FTD).\r\n  4. Marcar la tarea como `spec_ready` sin tocar código fuente ni tests.\r\n- **Colaboradores**: `KnowledgeIndex`, `FeatureList`, `LeaderAgent`.\r\n\r\n### Tarjeta CRC 3: `ImplementerAgent`\r\n- **Estereotipo DDD**: `<<SoftwareDeveloper>>`\r\n- **Responsabilidades**:\r\n  1. Implementar código de producción siguiendo la técnica aprobada.\r\n  2. Escribir tests unitarios y de integración según la convención del stack.\r\n  3. Ejecutar verificaciones automatizadas (`npm test`, `project-docs/verify.sh`).\r\n  4. Registrar la trazabilidad bidireccional $R \\leftrightarrow Tests$ en `progress/impl_{name}.md`.\r\n- **Colaboradores**: `ProjectSpec`, `TestRunner`, `LeaderAgent`, `ReviewerAgent`.\r\n\r\n### Tarjeta CRC 4: `ReviewerAgent`\r\n- **Estereotipo DDD**: `<<QualityAuditor>>`\r\n- **Responsabilidades**:\r\n  1. Auditar de forma imparcial el cumplimiento del 100% de los criterios del spec.\r\n  2. Verificar cobertura de código, compilación y ausencia de errores de arquitectura.\r\n  3. Emitir reporte de aprobación o hallazgos sin editar código bajo ninguna circunstancia.\r\n- **Colaboradores**: `ProjectSpec`, `TasksList`, `LeaderAgent`.\r\n\r\n### Tarjeta CRC 5: `KnowledgeEngine`\r\n- **Estereotipo DDD**: `<<KnowledgeRepository>>`\r\n- **Responsabilidades**:\r\n  1. Escanear el código fuente y extraer modelos C4, UML, ERD y reglas `BR-*`.\r\n  2. Generar y mantener la base de conocimiento en `project-docs/knowledge/`.\r\n  3. Compilar el archivo maestro unificado `MASTER-PROJECT-KNOWLEDGE.md`.\r\n  4. Actualizar el grafo de relaciones en `knowledge-index.json`.\r\n- **Colaboradores**: `SyncDataScript`, `DashboardStore`, `MarkdownParser`.\r\n",
    "adr-catalog.md": "# Catálogo de Decisiones de Arquitectura (ADR Catalog)\r\n\r\n> [!NOTE]\r\n> Registro canónico de Decisiones de Arquitectura (ADR) según el formato Michael Nygard. Documenta el qué, el por qué y las consecuencias técnicas asumidas para evitar refactorizaciones regresivas por parte de agentes de IA.\r\n\r\n---\r\n\r\n## ADR-001: Desacoplamiento Universal de Subagentes (Multi-Stack Agnostic)\r\n- **Fecha**: 2026-11-02\r\n- **Estado**: Aceptado\r\n- **Contexto**: Anteriormente los subagentes `implementer` y `reviewer` ejecutaban comandos fijos de `.NET` (`dotnet build /warnaserror`), fallando en repositorios políglotas o basados en Node.js, Python o Go.\r\n- **Decisión**: Los subagentes inspeccionan dinámicamente el bloque `checks` de `project-docs/project-spec.yaml` para obtener los comandos específicos de compilación y pruebas del proyecto objetivo.\r\n- **Consecuencias**: El arnés opera de manera transparente sobre cualquier stack tecnológico preservando la misma disciplina SDD.\r\n\r\n---\r\n\r\n## ADR-002: Sincronización Triple de Skills con Fuente de Verdad Única\r\n- **Fecha**: 2026-11-01\r\n- **Estado**: Aceptado\r\n- **Contexto**: El desarrollo asistido por IA ocurre a menudo en múltiples plataformas (Google Antigravity, OpenCode, GitHub Copilot). Mantener skills dispersas producía drift funcional.\r\n- **Decisión**: Establecer `.opencode/skills/` como la única fuente canónica y generar espejos automáticos en `.github/skills/` y `.agents/skills/` mediante la skill `/sync-skills`.\r\n- **Consecuencias**: Paridad total de capacidades en las tres herramientas sin duplicación manual.\r\n\r\n---\r\n\r\n## ADR-003: Pruebas Automatizadas Nativas con Node.js Test Runner\r\n- **Fecha**: 2026-11-02\r\n- **Estado**: Aceptado\r\n- **Contexto**: El arnés requería pruebas automatizadas para sus serializadores y sincronizadores, pero añadir frameworks pesados como Jest o Mocha introducía sobrecarga de instalación y dependencias vulnerables.\r\n- **Decisión**: Utilizar el ejecutor nativo `node --test` integrado en Node.js v18+.\r\n- **Consecuencias**: Tiempos de ejecución inferiores a 200ms con cero dependencias externas en tiempo de ejecución.\r\n\r\n---\r\n\r\n## ADR-004: Arquitectura Screaming & Tailwind CSS v4 en el Tablero Visual\r\n- **Fecha**: 2026-11-01\r\n- **Estado**: Aceptado\r\n- **Contexto**: La interfaz de seguimiento en `project-docs/` necesitaba ser modular, mantenible y liviana sin depender de frameworks de compilación SPA como React o Angular.\r\n- **Decisión**: Organizar el código bajo Screaming Architecture (`src/features/` por dominio) utilizando Vanilla JS moderno (ES Modules) y Tailwind CSS v4 en el navegador (`@tailwindcss/browser@4`).\r\n- **Consecuencias**: Modularidad limpia, código ligero y soporte nativo para temas claro/oscuro.\r\n\r\n---\r\n\r\n## ADR-005: Editor Dual ContextForge con Scroll Sincronizado Proporcional\r\n- **Fecha**: 2026-11-02\r\n- **Estado**: Aceptado\r\n- **Contexto**: Los desarrolladores y arquitectos requerían tanto la velocidad del editor de texto Markdown como la comodidad estructurada de bloques visuales para manipular requerimientos y diagramas.\r\n- **Decisión**: Implementar un conmutador de modo dual (`Modo Markdown` / `Modo Bloques`) con serialización bidireccional instantánea y sincronización de scroll proporcional basada en el ratio de desplazamiento con flags de exclusión mutua.\r\n- **Consecuencias**: Edición fluida sin pérdida de formato ni bloqueos por loops de eventos.\r\n\r\n---\r\n\r\n## ADR-006: Constelación 3D en Jerarquía Piramidal Three.js\r\n- **Fecha**: 2026-11-02\r\n- **Estado**: Aceptado\r\n- **Contexto**: La representación en grafo 3D anterior colocaba los nodos en un único plano caótico, provocando colisión de etiquetas e imposibilidad de comprender la jerarquía del sistema.\r\n- **Decisión**: Distribuir los nodos en 4 niveles arquitectónicos verticales ($Y=+165$ Ápice, $Y=+55$ Core, $Y=-55$ Features, $Y=-165$ Base) con distribución radial armónica y curvas cuadráticas de Bezier.\r\n- **Consecuencias**: Comprensión visual inmediata de la criticidad y dependencias del sistema.\r\n\r\n---\r\n\r\n## ADR-007: Compatibilidad Offline Total (Zero-Server Fallback)\r\n- **Fecha**: 2026-11-01\r\n- **Estado**: Aceptado\r\n- **Contexto**: En entornos restringidos o sin conexión a internet, los navegadores bloquean peticiones `fetch()` locales bajo el protocolo `file:///` por políticas de CORS.\r\n- **Decisión**: Generar automáticamente `project-docs/data-fallback.js` antes de cada compilación para embeber los datos en `window.__FALLBACK_DATA__`.\r\n- **Consecuencias**: El tablero funciona al 100% abriendo directamente `index.html` con doble clic.\r\n",
    "business-rules.md": "# Catálogo Canónico de Reglas de Negocio (Invariantes del Arnés)\r\n\r\n> [!IMPORTANT]\r\n> Invariantes de cumplimiento estricto para desarrolladores y agentes de IA. Ninguna implementación, spec o refactorización puede violar estas reglas.\r\n\r\n---\r\n\r\n## Módulo: agent-orchestrator\r\n\r\n### BR-ORCH-001: Formato y Longitud Estricta de Ramas Git\r\n- **Severidad**: Crítica\r\n- **Fórmula**: `length({type}/INT-{numero}/{nombre_rama}) <= 80`\r\n- **Valores permitidos de type**: Exclusivamente `feature` o `bugfix`.\r\n- **Descripción**: Toda rama de trabajo debe crearse desde la rama base, tener un prefijo `INT-` con número de ticket y no superar 80 caracteres.\r\n- **Comportamiento ante Violación**: La rama es rechazada y el agente debe solicitar corrección al humano.\r\n\r\n### BR-ORCH-002: Puerta Humana Obligatoria para Aprobación de Spec\r\n- **Severidad**: Crítica\r\n- **Descripción**: Queda estrictamente prohibido pasar una tarea a `in_progress` o iniciar implementación sin aprobación explícita del humano mediante la herramienta `ask_question`.\r\n- **Comportamiento ante Violación**: Detención inmediata del ciclo SDD.\r\n\r\n### BR-ORCH-003: Subagente Revisor No Modifica Código\r\n- **Severidad**: Crítica\r\n- **Descripción**: El subagente `reviewer` evalúa de forma independiente e imparcial la trazabilidad, build y tests. Bajo ninguna circunstancia edita código de producción o pruebas.\r\n- **Comportamiento ante Violación**: Se anula el veredicto y se reasigna al `implementer`.\r\n\r\n---\r\n\r\n## Módulo: triple-sync-engine\r\n\r\n### BR-SYNC-001: Fuente de Verdad Inviolable en .opencode/\r\n- **Severidad**: Crítica\r\n- **Descripción**: La carpeta `.opencode/skills/` es la única fuente de verdad para las 18 skills del arnés. Los cambios se propagan de forma unidireccional a `.github/skills/` y `.agents/skills/`.\r\n- **Comportamiento ante Violación**: Cualquier cambio aislado en espejos se sobrescribe al sincronizar.\r\n\r\n### BR-SYNC-002: Paridad Estricta de Frontmatter\r\n- **Severidad**: Alta\r\n- **Descripción**: Todo archivo `SKILL.md` debe contener exactamente el mismo bloque YAML `name` y `description` en las tres plataformas.\r\n- **Comportamiento ante Violación**: Reporte de inconsistencia en `/sync-skills`.\r\n\r\n---\r\n\r\n## Módulo: knowledge-engine\r\n\r\n### BR-KNOW-001: Sintaxis Mermaid Ultra-Estricta\r\n- **Severidad**: Crítica\r\n- **Descripción**: Para garantizar que los diagramas se rendericen sin errores en cualquier parser web o visor markdown, todo ID de nodo debe ser estrictamente alfanumérico sin guiones (`nodeAuth`) y todo texto descriptivo debe estar entre comillas dobles (`[\"Texto seguro\"]`).\r\n- **Comportamiento ante Violación**: Diagrama marcado como inválido en tiempo de validación.\r\n\r\n### BR-KNOW-002: Consulta Obligatoria Anti-Sesgo de la Base de Conocimiento\r\n- **Severidad**: Crítica\r\n- **Descripción**: Antes de proponer nuevas historias, redactar requerimientos o implementar código, los agentes DEBEN consultar `project-docs/knowledge/` para evitar reinventar capacidades o violar directrices.\r\n- **Comportamiento ante Violación**: Prohibición estricta de alucinar librerías externas o duplicar endpoints.\r\n\r\n---\r\n\r\n## Módulo: dashboard-visualizer\r\n\r\n### BR-DASH-001: Compatibilidad Offline Total (Protocolo file:///)\r\n- **Severidad**: Crítica\r\n- **Descripción**: El visor en `project-docs/index.html` debe ser 100% navegable con doble clic directo sin servidor local mediante la carga inmediata de `data-fallback.js`.\r\n- **Comportamiento ante Violación**: El script `sync-data.js` actualiza automáticamente el fallback tras cada compilación.\r\n\r\n### BR-DASH-002: Scroll Sincronizado Proporcional Anti-Bloqueo\r\n- **Severidad**: Alta\r\n- **Descripción**: La sincronización de scroll entre el editor Markdown y la vista previa utiliza flags de exclusión mutua para impedir bucles infinitos de eventos de scroll.\r\n- **Comportamiento ante Violación**: Desactivación temporal del listener para restaurar fluidez.\r\n\r\n---\r\n\r\n## Módulo: testing-qa-suite\r\n\r\n### BR-TEST-001: 100% de Tests en Verde para Cierre de Spec\r\n- **Severidad**: Crítica\r\n- **Descripción**: Ninguna feature o bugfix puede cerrarse como `done` si existe un solo test fallando en la suite de pruebas del proyecto.\r\n- **Comportamiento ante Violación**: `verify-spec` rechaza el cierre y exige corrección.\r\n\r\n### BR-TEST-002: Ejecutor de Pruebas Nativo sin Bloat\r\n- **Severidad**: Alta\r\n- **Descripción**: Las pruebas unitarias del arnés se ejecutan mediante `node --test` para asegurar tiempos de respuesta inferiores a 500ms y cero dependencias externas en testing.\r\n- **Comportamiento ante Violación**: Se rechaza la inclusión de dependencias redundantes.\r\n",
    "c4-model.md": "# Modelo C4 — AI Agentic SDD Engineering Harness\r\n\r\n> [!NOTE]\r\n> Arquitectura de Sistema, Contenedores y Componentes del Arnés de Ingeniería Dirigida por Especificaciones (SDD).\r\n\r\n---\r\n\r\n## Nivel 1: Diagrama de Contexto del Sistema (C1)\r\n\r\nMuestra los límites del arnés, los actores principales y los sistemas externos con los que interactúa:\r\n\r\n```mermaid\r\nflowchart TD\r\n  userDeveloper[\"Desarrollador / Ingeniero de Software\"]\r\n  agentLeader[\"Agente Principal (Leader)\"]\r\n  harnessSystem[\"AI Agentic SDD Engineering Harness\"]\r\n  gitSystem[\"Sistema de Control de Versiones (Git / GitHub)\"]\r\n  browserUser[\"Navegador Web (Dashboard / Tablero Visual)\"]\r\n\r\n  userDeveloper -->|\"Define requerimientos y aprueba specs\"| harnessSystem\r\n  agentLeader -->|\"Orquesta tareas e invoca subagentes\"| harnessSystem\r\n  harnessSystem -->|\"Crea ramas INT-* y commits semánticos\"| gitSystem\r\n  harnessSystem -->|\"Genera y sincroniza datos en tiempo real\"| browserUser\r\n  browserUser -->|\"Permite lectura editorial y edición dual\"| userDeveloper\r\n```\r\n\r\n---\r\n\r\n## Nivel 2: Diagrama de Contenedores (C2)\r\n\r\nDescompone el arnés en sus subsistemas y aplicaciones principales:\r\n\r\n```mermaid\r\nflowchart TD\r\n  subgraph HarnessContainers[\"Contenedores del Arnés SDD\"]\r\n    containerOrchestrator[\"Orquestador Multi-Agente<br/>(Leader, Spec-Author, Implementer, Reviewer)\"]\r\n    containerTripleSync[\"Motor de Sincronización Triple<br/>(.opencode / .github / .agents)\"]\r\n    containerKnowledge[\"Motor de Base de Conocimiento<br/>(Docs-as-Code, C4, UML, BR-*, ADRs)\"]\r\n    containerDashboard[\"Tablero de Seguimiento Interactivo<br/>(Tailwind v4, Three.js, Editor Dual)\"]\r\n    containerTestRunner[\"Suite de Pruebas Automatizadas<br/>(Node.js Test Runner, Smoke Tests)\"]\r\n  end\r\n\r\n  gitRepo[\"Repositorio Git Local\"]\r\n  userView[\"Navegador (file:/// o HTTP)\"]\r\n\r\n  containerOrchestrator -->|\"Escribe specs y código\"| gitRepo\r\n  containerTripleSync -->|\"Mantiene paridad de 18 skills\"| containerOrchestrator\r\n  containerKnowledge -->|\"Alimenta contexto anti-sesgo\"| containerOrchestrator\r\n  containerDashboard -->|\"Lee metadatos de specs y progreso\"| gitRepo\r\n  containerDashboard -->|\"Renderiza vistas interactivas\"| userView\r\n  containerTestRunner -->|\"Verifica build, tests y convenciones\"| containerOrchestrator\r\n```\r\n\r\n---\r\n\r\n## Nivel 3: Diagrama de Componentes del Tablero Web (C3)\r\n\r\nDesglose interno de la aplicación web en `project-docs/`:\r\n\r\n```mermaid\r\nflowchart LR\r\n  subgraph DashboardComponents[\"project-docs/src/\"]\r\n    compRouter[\"Enrutador por Pestañas<br/>(router.js)\"]\r\n    compStore[\"Store Reactivo Central<br/>(store.js)\"]\r\n    compDetector[\"Detector de Entorno & Agente<br/>(detector.js)\"]\r\n    compMarkdown[\"Lector Editorial & Parser Bloques<br/>(MarkdownViewer.js)\"]\r\n    compThree[\"Constelación 3D Piramidal<br/>(SpaceView3D.js)\"]\r\n    compMermaid[\"Visor & Editor Draw.io<br/>(MermaidViewer.js)\"]\r\n    compOmnibox[\"Buscador Global Ctrl+K<br/>(Omnibox Modal)\"]\r\n  end\r\n\r\n  compRouter --> compStore\r\n  compDetector --> compStore\r\n  compStore --> compMarkdown\r\n  compStore --> compThree\r\n  compStore --> compMermaid\r\n  compStore --> compOmnibox\r\n```\r\n",
    "coding-standards.md": "# Estándares de Codificación & Guardrails Anti-Sesgo\r\n\r\n> [!IMPORTANT]\r\n> Directrices obligatorias para desarrolladores y agentes de IA. Diseñadas para eliminar el sesgo algorítmico, prevenir alucinaciones de paquetes y mantener una arquitectura limpia.\r\n\r\n---\r\n\r\n## 1. Convenciones de Nomenclatura y Control de Versiones\r\n\r\n- **Ramas Git**:\r\n  - Exclusivamente dos tipos: `feature` y `bugfix`.\r\n  - Estructura obligatoria: `{type}/INT-{numero}/{nombre_rama_de_lo_realizado}`.\r\n  - Longitud máxima estricta: **80 caracteres**.\r\n  - Ejemplo: `feature/INT-001/refactor_harness_architecture`.\r\n- **Commits Semánticos**:\r\n  - Formato: `feat(scope): descripción` o `fix(scope): descripción`.\r\n  - Tipos válidos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.\r\n  - Idioma: Inglés para commits y código fuente; español para documentación técnica y comentarios explicativos.\r\n\r\n---\r\n\r\n## 2. Guardrails Anti-Alucinación (Inviolables para Agentes de IA)\r\n\r\n1. **Prohibición de Librerías Fantasma**: Los agentes tienen estrictamente prohibido sugerir, instalar o importar paquetes o librerías que no figuren en `package.json` o `project-docs/project-spec.yaml`.\r\n2. **Invariante de Conocimiento Previo**: Antes de implementar una solución, el agente debe verificar si ya existe una función, componente o regla en `project-docs/knowledge/`.\r\n3. **Respeto a las Reglas de Negocio (BR-*)**: Ningún código puede modificar o relajar una regla de negocio sin una actualización previa y aprobada de la especificación.\r\n4. **Cero Código Muerto**: Prohibido dejar código comentado, banderas de depuración (`console.log`, `debugger`) o secretos hardcodeados.\r\n\r\n---\r\n\r\n## 3. Arquitectura del Código Frontend (`project-docs/src/`)\r\n\r\n- **Vanilla JS Modular**: Usar ES Modules puros (`import` / `export`) organizados por dominios en `src/features/`.\r\n- **Separación de Responsabilidades**: Las funciones de renderizado devuelven cadenas HTML puras; los controladores de eventos se enlazan mediante selectores o `data-action`.\r\n- **Inmutabilidad en el Store**: El estado global (`store.js`) se actualiza mediante acciones atómicas notificando a los suscriptores.\r\n",
    "data-dictionary.md": "# Diccionario de Datos & Persistencia Docs-as-Code\r\n\r\n> [!NOTE]\r\n> Especificación formal de los esquemas de persistencia JSON y YAML del arnés de ingeniería SDD.\r\n\r\n---\r\n\r\n## 1. Diagrama Entidad-Relación (ERD) del Arnés\r\n\r\n```mermaid\r\nerDiagram\r\n  PROJECT ||--o{ FEATURE : \"contiene\"\r\n  PROJECT ||--|| PROJECT_SPEC : \"especificado por\"\r\n  FEATURE ||--|{ ACCEPTANCE_CRITERIA : \"valida con\"\r\n  FEATURE ||--o{ TASK : \"descompone en\"\r\n  FEATURE ||--o{ BUSINESS_RULE : \"satisface\"\r\n  KNOWLEDGE_INDEX ||--o{ DOCUMENT : \"cataloga\"\r\n  DOCUMENT ||--o{ SHELF : \"pertenece a\"\r\n  DOCUMENT ||--o{ BUSINESS_RULE : \"documenta\"\r\n\r\n  PROJECT {\r\n    string name PK\r\n    string description\r\n    string version\r\n    string tech_stack\r\n    string runtime\r\n  }\r\n\r\n  FEATURE {\r\n    int id PK\r\n    string type\r\n    string name\r\n    string title\r\n    string module\r\n    string priority\r\n    string branch\r\n    string status\r\n  }\r\n\r\n  TASK {\r\n    string id PK\r\n    string title\r\n    bool done\r\n  }\r\n\r\n  BUSINESS_RULE {\r\n    string id PK\r\n    string module\r\n    string severity\r\n    string title\r\n    string description\r\n  }\r\n\r\n  DOCUMENT {\r\n    string key PK\r\n    string filename\r\n    string title\r\n    string shelf\r\n    int readingTime\r\n    int wordCount\r\n    int ruleCount\r\n  }\r\n```\r\n\r\n---\r\n\r\n## 2. Catálogo de Esquemas JSON / YAML\r\n\r\n### 2.1 `project-docs/project-spec.yaml` (Especificación Técnica del Proyecto)\r\n- `project.name`: Nombre canónico del sistema.\r\n- `project.type`: Tipo de arquitectura (`universal-agentic-harness`, `web-api`, `microservices`).\r\n- `runtime.language`: Lenguaje de programación principal.\r\n- `modules[]`: Colección de módulos con `id`, `name`, `tech`, `features`.\r\n- `checks.build`: Comando de compilación (`npm run build`, `dotnet build`, etc.).\r\n- `checks.test`: Comando de pruebas (`npm test`, `pytest`, `dotnet test`).\r\n- `checks.verify`: Comando de verificación integral (`node project-docs/sync-data.js`).\r\n\r\n### 2.2 `feature_list.json` (Backlog Canónico de Tareas)\r\n- `features[].id`: Número secuencial único (`INT-001`).\r\n- `features[].type`: `feature` o `bugfix`.\r\n- `features[].name`: Identificador en `snake_case` descriptivo.\r\n- `features[].branch`: Rama Git `{type}/INT-{id}/{name}` ($\\le 80$ caracteres).\r\n- `features[].status`: `pending` | `spec_ready` | `in_progress` | `done` | `blocked`.\r\n- `features[].acceptance`: Lista de criterios de aceptación verificables.\r\n\r\n### 2.3 `knowledge-index.json` (Índice de la Base de Conocimiento)\r\n- `docs{}`: Mapa de clave de archivo a contenido Markdown completo.\r\n- `docMetadata{}`: Metadatos calculados (`readingTime`, `wordCount`, `ruleCount`, `reqCount`, `adrCount`, `shelf`).\r\n- `shelves{}`: Clasificación en 6 estantes temáticos (`architecture`, `business_rules`, `requirements`, `adrs`, `standards`, `modules`).\r\n- `business_rules[]`: Catálogo estructurado de invariantes con `id`, `module`, `severity`, `title`, `description`.\r\n- `coding_standards`: Guardrails anti-sesgo y directrices de nombrado.\r\n",
    "external-services.md": "# Catálogo de Integraciones y Servicios Externos\r\n\r\n> [!NOTE]\r\n> Matriz de servicios adyacentes, protocolos de comunicación, variables de configuración y políticas de contingencia del arnés de ingeniería.\r\n\r\n---\r\n\r\n## Matriz de Servicios y Dependencias\r\n\r\n| Servicio / Herramienta | Tipo | Protocolo | Variables Requeridas | Política de Contingencia / Failover |\r\n| :--- | :--- | :--- | :--- | :--- |\r\n| **Google Antigravity** | Agentic IDE & CLI | Native Subagent Protocol / IPC | N/A (Entorno IDE) | Operar mediante CLI estándar o shell local |\r\n| **OpenCode** | CLI Engine | CLI Exec / Local JSON | N/A | Lectura directa de `.opencode/rules/` |\r\n| **GitHub Copilot** | AI Assistant | Instructions / Markdown | N/A | Carga desde `.github/instructions/` |\r\n| **Git / GitHub** | Control de Versiones | CLI Git / HTTPS / SSH | `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL` | Modo local desconectado en rama `{type}/INT-*` |\r\n| **Tailwind CSS v4** | CSS Runtime | CDN `@tailwindcss/browser@4` | N/A | Estilos base incrustados en `<style>` |\r\n| **Three.js** | 3D Graphics Engine | CDN `three.min.js r128` | N/A | Vista alternativa en Árbol SVG y Grafo DAG |\r\n| **Mermaid.js** | Diagram Engine | CDN `mermaid.min.js v10` | N/A | Previsualización de código Mermaid con botón de copia |\r\n",
    "functional-requirements.md": "# Especificación de Requerimientos del Sistema (SRS IEEE 830 / ISO 29148)\r\n\r\n> [!NOTE]\r\n> Requerimientos Funcionales (`RF-*`) y Requerimientos No Funcionales (`RNF-*`) bajo clasificación FURPS+ para el Arnés de Ingeniería SDD.\r\n\r\n---\r\n\r\n## 1. Requerimientos Funcionales (`RF-*`)\r\n\r\n### Módulo: agent-orchestrator\r\n- **RF-ORCH-001**: El orquestador DEBE validar que toda rama de trabajo cumpla con la expresión regular `^(feature|bugfix)/INT-\\d{3,4}/[a-z0-9_]+$` y una longitud menor o igual a 80 caracteres.\r\n- **RF-ORCH-002**: El orquestador DEBE invocar de manera aislada al subagente `spec-author` con workspace heredado (`Workspace: \"inherit\"`) para redactar la especificación formal antes de escribir código.\r\n- **RF-ORCH-003**: El orquestador DEBE pausar la ejecución mediante `ask_question` para solicitar aprobación humana del spec generado antes de permitir el inicio de la fase de implementación.\r\n- **RF-ORCH-004**: Al concluir la implementación, el orquestador DEBE invocar de forma independiente al subagente `reviewer` para emitir veredicto formal de calidad y trazabilidad.\r\n\r\n### Módulo: triple-sync-engine\r\n- **RF-SYNC-001**: El motor DEBE comparar el árbol de skills en `.opencode/skills/` contra `.github/skills/` y `.agents/skills/` para identificar diferencias de contenido o metadatos.\r\n- **RF-SYNC-002**: La skill `/sync-skills` DEBE replicar archivos de forma no destructiva preservando el frontmatter YAML y el formato Markdown.\r\n\r\n### Módulo: knowledge-engine\r\n- **RF-KNOW-001**: La skill `/project-knowledge` DEBE realizar el descubrimiento en 2 fases para evitar desbordamiento de contexto (escaneo topológico previo a inspección de código).\r\n- **RF-KNOW-002**: El generador de diagramas DEBE sanitizar identificadores y textos en sintaxis Mermaid estricta con comillas dobles para evitar fallos del parser en tiempo de ejecución.\r\n\r\n### Módulo: dashboard-visualizer\r\n- **RF-DASH-001**: El tablero DEBE presentar una biblioteca organizada en 6 estantes temáticos con tarjeta Hero destacada y filtros rápidos por categoría.\r\n- **RF-DASH-002**: El lector de artículos DEBE renderizar el documento con columna centrada a 780px, interlineado de 1.75em, anclas de encabezados y barra lateral flotante con la Tabla de Contenidos (TOC).\r\n- **RF-DASH-003**: El editor dual DEBE permitir alternar instantáneamente entre modo Markdown split-pane y modo Bloques Visuales ContextForge con scroll sincronizado proporcional y reordenamiento de tarjetas.\r\n- **RF-DASH-004**: El buscador Omnibox DEBE responder al atajo `Ctrl+K` o `Cmd+K` y permitir búsqueda en tiempo real sobre tareas, documentos, reglas e índices.\r\n- **RF-DASH-005**: La vista 3D DEBE estructurar los nodos en 4 niveles piramidales en Three.js con anillos translúcidos y distribución armónica radial sin solapamiento de etiquetas.\r\n\r\n### Módulo: testing-qa-suite\r\n- **RF-TEST-001**: La suite DEBE ejecutar pruebas unitarias automatizadas mediante el ejecutor nativo `node --test` reportando resultados en menos de 500ms.\r\n- **RF-TEST-002**: La suite DEBE incluir pruebas de aceptación tipo smoke para validar la integridad del bundle web y la compatibilidad con el protocolo `file:///`.\r\n\r\n---\r\n\r\n## 2. Requerimientos No Funcionales (`RNF-*`) bajo FURPS+\r\n\r\n### Functionality (Seguridad e Integridad)\r\n- **RNF-SEC-001**: Prohibición estricta de credenciales, tokens de API o connection strings hardcodeados en los archivos de especificación o base de conocimiento.\r\n- **RNF-SEC-002**: Aislamiento estricto de subagentes impidiendo que el subagente `reviewer` modifique código de producción o pruebas.\r\n\r\n### Usability (Experiencia Editorial & Heurísticas)\r\n- **RNF-USAB-001**: Cumplimiento de WCAG AAA en contraste de texto y soporte nativo de modo claro y oscuro sin parpadeo (FOUC).\r\n- **RNF-USAB-002**: Búsqueda con debouncing para no bloquear la digitación del usuario en inputs de búsqueda (180ms - 260ms).\r\n\r\n### Reliability (Confiabilidad & Cero-Server)\r\n- **RNF-RELI-001**: Disponibilidad offline del 100% de la documentación y tablero interactivo mediante `data-fallback.js` sin requerir servidor HTTP ni sufrir bloqueos CORS.\r\n- **RNF-RELI-002**: Gestión adecuada del ciclo de vida en Three.js con limpieza completa de memoria (`mount`/`unmount`) al cambiar de pestaña para prevenir fugas de memoria.\r\n\r\n### Performance (Rendimiento)\r\n- **RNF-PERF-001**: Tiempo de carga inicial del tablero web inferior a 800ms en modo local.\r\n- **RNF-PERF-002**: Ejecución de la suite completa de pruebas unitarias en menos de 500ms.\r\n\r\n### Supportability (Mantenibilidad & Extensibilidad)\r\n- **RNF-SUPP-001**: Arquitectura modular Screaming Architecture en Vanilla JS sin dependencias de frameworks pesados de frontend (React, Vue, Angular) en tiempo de ejecución.\r\n- **RNF-SUPP-002**: Agnóstico al lenguaje: el arnés debe poder auditar e interactuar con proyectos en Node.js, .NET, Python, Go y Rust.\r\n",
    "MASTER-PROJECT-KNOWLEDGE.md": "---\r\nid: DOC-MASTER-KNOWLEDGE\r\ntitle: \"Dossier Maestro Consolidado de Ingeniería — AI Agentic SDD Engineering Harness\"\r\nmodule: \"global\"\r\nstatus: \"Publicado\"\r\nversion: \"4.2.0\"\r\nlast_updated: \"2026-11-07\"\r\ntags: [\"master-dossier\", \"single-file-context\", \"sdd\", \"ieee-830\", \"c4-model\", \"uml\", \"ddd\"]\r\n---\r\n\r\n# Dossier Maestro Consolidado de Ingeniería Soberana (MASTER-PROJECT-KNOWLEDGE)\r\n\r\n> [!NOTE]\r\n> Documento unificado y autocontenido que consolida el 100% del conocimiento arquitectónico, de negocio, requerimientos, módulos y diagramas del **AI Agentic SDD Engineering Harness**. Diseñado para lectura continua, auditoría técnica integral e inyección en motores LLM de gran ventana de contexto (NotebookLM, Claude Projects, ChatGPT).\r\n\r\n---\r\n\r\n## Tabla de Contenidos\r\n\r\n1. [Capítulo 1: Visión del Producto, Contexto de Negocio y Stakeholders (IEEE 830)](#capítulo-1-visión-del-producto-contexto-de-negocio-y-stakeholders-ieee-830)\r\n2. [Capítulo 2: Diagnóstico AS-IS de la Arquitectura, Flujos de Datos y Patrones](#capítulo-2-diagnóstico-as-is-de-la-arquitectura-flujos-de-datos-y-patrones)\r\n3. [Capítulo 3: Atlas Completo de Diagramas de Arquitectura (C4) y UML 2.5](#capítulo-3-atlas-completo-de-diagramas-de-arquitectura-c4-y-uml-25)\r\n4. [Capítulo 4: Inventario de Capacidades y Especificación Formal de Requisitos (SRS)](#capítulo-4-inventario-de-capacidades-y-especificación-formal-de-requisitos-srs)\r\n5. [Capítulo 5: Catálogo Ágil INVEST, Desglose SPIDR y Tareas de Ingeniería (TI-*)](#capítulo-5-catálogo-ágil-invest-desglose-spidr-y-tareas-de-ingeniería-ti-)\r\n6. [Capítulo 6: Diccionario de Datos, ERD Crow's Foot y Persistencia Híbrida](#capítulo-6-diccionario-de-datos-erd-crows-foot-y-persistencia-híbrida)\r\n7. [Capítulo 7: Catálogo Maestro de Reglas de Negocio (BR-*), ADRs y Servicios Externos](#capítulo-7-catálogo-maestro-de-reglas-de-negocio-br--adrs-y-servicios-externos)\r\n8. [Capítulo 8: Enciclopedia de Módulos & Bounded Contexts](#capítulo-8-enciclopedia-de-módulos--bounded-contexts)\r\n   - [8.1 Módulo: agent-orchestrator](#81-módulo-agent-orchestrator)\r\n   - [8.2 Módulo: dashboard-visualizer](#82-módulo-dashboard-visualizer)\r\n   - [8.3 Módulo: knowledge-engine](#83-módulo-knowledge-engine)\r\n   - [8.4 Módulo: testing-qa-suite](#84-módulo-testing-qa-suite)\r\n   - [8.5 Módulo: triple-sync-engine](#85-módulo-triple-sync-engine)\r\n9. [Capítulo 9: Estándares de Código, Guardrails Anti-Sesgo y Matriz de Trazabilidad (RTM)](#capítulo-9-estándares-de-código-guardrails-anti-sesgo-y-matriz-de-trazabilidad-rtm)\r\n\r\n---\r\n\r\n## Capítulo 1: Visión del Producto, Contexto de Negocio y Stakeholders (IEEE 830)\r\n\r\n### 1.1 Declaración Formal de la Visión\r\n> **PARA** ingenieros de software, arquitectos de soluciones y equipos de desarrollo asistidos por IA,  \r\n> **QUIENES** experimentan alucinaciones, código desalineado con el dominio y regresiones al usar agentes de programación en bases de código medianas y complejas,  \r\n> **EL** AI Agentic SDD Engineering Harness,  \r\n> **QUE ES UN** arnés de ingeniería de software agnóstico basado en Docs-as-Code, orquestación multi-agente y verificación formal en 8 niveles,  \r\n> **QUE** garantiza una precisión funcional $\\ge 95\\%$ en el código generado por IA mediante un ciclo cerrado y determinista (Especificación EARS $\\to$ Puerta Humana $\\to$ Implementación TDD/SDD $\\to$ Revisión Imparcial $\\to$ Verificación Automatizada), triple sincronización de skills y tablero visual offline.\r\n\r\n### 1.2 Alcance del Sistema\r\n- **Qué HACE**: Orquesta 4 subagentes (`leader`, `spec-author`, `implementer`, `reviewer`), valida ramas git $\\le 80$ caracteres, impone pausas interactivas con `ask_question`, mantiene paridad triple en 18 skills, y provee un tablero interactivo offline-first con editor dual y verificación en 8 niveles.\r\n- **Qué NO HACE**: No sustituye el criterio de arquitectura humano, no realiza `git push` sin autorización, no edita código en fase de revisión y no acopla el código a un runtime particular.\r\n\r\n---\r\n\r\n## Capítulo 2: Diagnóstico AS-IS de la Arquitectura, Flujos de Datos y Patrones\r\n\r\n### 2.1 Screaming Architecture y Organización\r\nEl proyecto aplica el principio de **Screaming Architecture**:\r\n- La raíz separa claramente la orquestación (`.agents/`, `.opencode/`, `.github/`), la interfaz y documentación (`project-docs/`) y el arnés de verificación (`tests/`, `project-docs/verify.sh`).\r\n- El frontend en `project-docs/src/` está modularizado por dominio: `core/`, `features/` y `shared/`, compilado en un bundle IIFE (`dist/app.bundle.js`).\r\n\r\n### 2.2 Patrones de Diseño Detectados\r\n1. **Reactive Store (Pub/Sub)**: `store.js` gestiona el estado y propaga cambios a la vista reactivamente.\r\n2. **Fallback Data Cache**: `api.js` y `data-fallback.js` garantizan funcionamiento offline en protocolo `file:///`.\r\n3. **Triple Mirror Sync**: `.opencode/skills/` funciona como fuente canónica y sincroniza unidireccionalmente a `.github/` y `.agents/`.\r\n4. **Dual Editor Mode**: `MarkdownViewer.js` soporta edición textual de Markdown y manipulación visual por bloques con scroll sincronizado.\r\n\r\n---\r\n\r\n## Capítulo 3: Atlas Completo de Diagramas de Arquitectura (C4) y UML 2.5\r\n\r\n### 3.1 Modelo C4 — Contexto de Sistema (C1)\r\n```mermaid\r\nflowchart TD\r\n  userDev[\"Desarrollador / Ingeniero de Software\"]\r\n  agentLeader[\"Agente Principal (Leader)\"]\r\n  harnessSystem[\"AI Agentic SDD Engineering Harness\"]\r\n  gitSystem[\"Control de Versiones (Git Local / GitHub)\"]\r\n  browserUser[\"Navegador Web (Dashboard / Tablero Visual)\"]\r\n\r\n  userDev -->|\"Define requerimientos y aprueba specs\"| harnessSystem\r\n  agentLeader -->|\"Orquesta tareas e invoca subagentes\"| harnessSystem\r\n  harnessSystem -->|\"Crea ramas INT-* y commits semánticos\"| gitSystem\r\n  harnessSystem -->|\"Genera y sincroniza datos en tiempo real\"| browserUser\r\n  browserUser -->|\"Permite lectura editorial y edición dual\"| userDev\r\n```\r\n\r\n### 3.2 Modelo C4 — Contenedores del Arnés (C2)\r\n```mermaid\r\nflowchart TD\r\n  subgraph HarnessContainers[\"Contenedores del Arnés SDD\"]\r\n    containerOrchestrator[\"Orquestador Multi-Agente<br/>(Leader, Spec, Impl, Review)\"]\r\n    containerTripleSync[\"Motor de Sincronización Triple<br/>(.opencode / .github / .agents)\"]\r\n    containerKnowledge[\"Motor de Base de Conocimiento<br/>(Docs-as-Code, C4, UML, BR-*)\"]\r\n    containerDashboard[\"Tablero de Seguimiento Interactivo<br/>(Tailwind v4, Three.js, Editor Dual)\"]\r\n    containerTestRunner[\"Suite de Pruebas Automatizadas<br/>(Node.js Test Runner, Playwright)\"]\r\n  end\r\n\r\n  gitRepo[\"Repositorio Git Local\"]\r\n  userView[\"Navegador (file:/// o HTTP)\"]\r\n\r\n  containerOrchestrator -->|\"Escribe specs y código\"| gitRepo\r\n  containerTripleSync -->|\"Mantiene paridad de 18 skills\"| containerOrchestrator\r\n  containerKnowledge -->|\"Alimenta contexto anti-sesgo\"| containerOrchestrator\r\n  containerDashboard -->|\"Lee metadatos de specs y progreso\"| gitRepo\r\n  containerDashboard -->|\"Renderiza vistas interactivas\"| userView\r\n  containerTestRunner -->|\"Verifica build, tests y convenciones\"| containerOrchestrator\r\n```\r\n\r\n### 3.3 Modelo C4 — Componentes del Tablero Web (C3)\r\n```mermaid\r\nflowchart LR\r\n  subgraph DashboardComponents[\"project-docs/src/\"]\r\n    compRouter[\"Enrutador por Pestañas (router.js)\"]\r\n    compStore[\"Store Reactivo Central (store.js)\"]\r\n    compDetector[\"Detector de Entorno & Agente (detector.js)\"]\r\n    compMarkdown[\"Lector Editorial & Parser Bloques (MarkdownViewer.js)\"]\r\n    compThree[\"Constelación 3D Piramidal (SpaceView3D.js)\"]\r\n    compMermaid[\"Visor & Editor Draw.io (MermaidViewer.js)\"]\r\n    compOmnibox[\"Buscador Global Ctrl+K (Omnibox Modal)\"]\r\n  end\r\n\r\n  compRouter --> compStore\r\n  compDetector --> compStore\r\n  compStore --> compMarkdown\r\n  compStore --> compThree\r\n  compStore --> compMermaid\r\n  compStore --> compOmnibox\r\n```\r\n\r\n---\r\n\r\n## Capítulo 4: Inventario de Capacidades y Especificación Formal de Requisitos (SRS)\r\n\r\n### Requerimientos Funcionales Nucleares\r\n- **RF-ORCH-001**: Creación y validación de ramas `{type}/INT-{id}/{name}` con longitud $\\le 80$ caracteres.\r\n- **RF-ORCH-002**: Puerta humana obligatoria con `ask_question` previa a la implementación.\r\n- **RF-ORCH-003**: Partición formal en subtareas Scrum Jira DEV/QA y captura automatizada de evidencias visuales en `project-docs/specs/{NNN}_{name}/evidence/`.\r\n- **RF-DASH-001**: Operación offline nativa en protocolo `file:///` con carga instantánea de fallback.\r\n- **RF-DASH-002**: Editor dual Markdown/Bloques con scroll sincronizado.\r\n- **RF-SYNC-001**: Sincronización unidireccional de 18 skills desde `.opencode/`.\r\n- **RF-TEST-001**: Verificación integral en 9 niveles mediante `project-docs/verify.sh`.\r\n\r\n---\r\n\r\n## Capítulo 5: Catálogo Ágil INVEST, Desglose SPIDR y Tareas de Ingeniería (TI-*)\r\n\r\n### Historias de Usuario Principales\r\n1. **HU-ORCH-01**: Gobernanza de ramas y puertas humanas (3 SP).\r\n   - `TI-ORCH-01`: Validador regex de nombres de rama y contador $\\le 80$c.\r\n   - `TI-ORCH-02`: Suite BVA de ramas límite en pruebas de caja negra.\r\n2. **HU-DASH-01**: Experiencia editorial y editor dual en el tablero (5 SP).\r\n   - `TI-DASH-01`: Parser bidireccional Markdown $\\leftrightarrow$ Bloques.\r\n   - `TI-DASH-02`: Detección de protocolo `file:///` en `api.js`.\r\n3. **HU-SYNC-01**: Homologación triple de skills (2 SP).\r\n   - `TI-SYNC-01`: Script verificador de paridad de frontmatter YAML.\r\n4. **HU-ORCH-02**: Desglose Scrum DEV/QA y captura automatizada de evidencias (5 SP).\r\n   - `TI-ORCH-03`: Implementar runner de capturas headless en `scripts/capture-evidence.js`.\r\n   - `TI-ORCH-04`: Integrar visualización de subtareas DEV/QA y visor de evidencias en `Modal.js`.\r\n   - `TI-ORCH-05`: Añadir pruebas E2E con Playwright en `tests/acceptance/scrum-evidence-capture.spec.js`.\r\n\r\n---\r\n\r\n## Capítulo 6: Diccionario de Datos, ERD Crow's Foot y Persistencia Híbrida\r\n\r\n### Diagrama Entidad-Relación Global\r\n```mermaid\r\nerDiagram\r\n  PROJECT ||--o{ FEATURE : \"contiene\"\r\n  PROJECT ||--|| PROJECT_SPEC : \"especificado por\"\r\n  FEATURE ||--|{ ACCEPTANCE_CRITERIA : \"valida con\"\r\n  FEATURE ||--o{ TASK : \"descompone en\"\r\n  FEATURE ||--o{ BUSINESS_RULE : \"satisface\"\r\n  KNOWLEDGE_INDEX ||--o{ DOCUMENT : \"cataloga\"\r\n  DOCUMENT ||--o{ SHELF : \"pertenece a\"\r\n  DOCUMENT ||--o{ BUSINESS_RULE : \"documenta\"\r\n\r\n  PROJECT {\r\n    string name PK\r\n    string version\r\n    string runtime\r\n  }\r\n\r\n  FEATURE {\r\n    int id PK\r\n    string type\r\n    string name\r\n    string branch\r\n    string status\r\n  }\r\n\r\n  BUSINESS_RULE {\r\n    string id PK\r\n    string module\r\n    string severity\r\n    string title\r\n  }\r\n\r\n  DOCUMENT {\r\n    string key PK\r\n    string title\r\n    string shelf\r\n    int wordCount\r\n  }\r\n```\r\n\r\n---\r\n\r\n## Capítulo 7: Catálogo Maestro de Reglas de Negocio (BR-*), ADRs y Servicios Externos\r\n\r\n### Invariantes Críticas\r\n- **BR-ORCH-001**: Ramas Git obligatoriamente `{feature|bugfix}/INT-{numero}/{nombre}` y longitud $\\le 80$ caracteres.\r\n- **BR-ORCH-002**: Prohibido implementar código sin aprobación del spec al 100% mediante `ask_question`.\r\n- **BR-ORCH-003**: El subagente `reviewer` audita de forma imparcial y no modifica código.\r\n- **BR-ORCH-004**: Toda User Story cerrada debe contar con subtareas Scrum DEV/QA completadas y al menos una captura de pantalla de evidencia.\r\n- **BR-SYNC-001**: `.opencode/skills/` es la única fuente de verdad; los demás son espejos.\r\n- **BR-KNOW-001**: Sintaxis Mermaid ultra-estricta (IDs alfanuméricos simples y textos entrecomillados).\r\n- **BR-KNOW-002**: Consulta obligatoria de `project-docs/knowledge/` antes de codificar.\r\n- **BR-DASH-001**: Compatibilidad offline nativa en protocolo `file:///`.\r\n- **BR-DASH-002**: Cero emojis en interfaz y código; solo iconos SVG de `Icons.js`.\r\n\r\n---\r\n\r\n## Capítulo 8: Enciclopedia de Módulos & Bounded Contexts\r\n\r\n### 8.1 Módulo: agent-orchestrator\r\n- **Propósito**: Orquestación multi-agente, validación de ramas git, gobernanza de puertas humanas y subtareas Scrum DEV/QA.\r\n- **Tareas Asociadas**: `INT-001` (Refactorización del arnés) e `INT-009` (Subtareas Scrum Jira DEV/QA y evidencias de prueba).\r\n- **Artefactos**: `module-spec.md`, `requirements-and-rules.md`, `data-and-transactions.md`, `diagrams.md`, `technical-debt-refactoring.md`.\r\n\r\n### 8.2 Módulo: dashboard-visualizer\r\n- **Propósito**: Tablero web interactivo, métricas KPI, editor dual ContextForge y soporte offline `file:///`.\r\n- **Tareas Asociadas**: `INT-004`, `INT-005`, `INT-006`.\r\n- **Artefactos**: `module-spec.md`, `requirements-and-rules.md`, `data-and-transactions.md`, `diagrams.md`, `technical-debt-refactoring.md`.\r\n\r\n### 8.3 Módulo: knowledge-engine\r\n- **Propósito**: Extracción, preservación y estandarización de la base de conocimiento Docs-as-Code.\r\n- **Tareas Asociadas**: `INT-003`.\r\n- **Artefactos**: `module-spec.md`, `requirements-and-rules.md`, `data-and-transactions.md`, `diagrams.md`, `technical-debt-refactoring.md`.\r\n\r\n### 8.4 Módulo: testing-qa-suite\r\n- **Propósito**: Automatización de pruebas en 9 fases, runner de `project-docs/verify.sh` y Playwright E2E.\r\n- **Tareas Asociadas**: `INT-007`, `INT-008`.\r\n- **Artefactos**: `module-spec.md`, `requirements-and-rules.md`, `data-and-transactions.md`, `diagrams.md`, `technical-debt-refactoring.md`.\r\n\r\n### 8.5 Módulo: triple-sync-engine\r\n- **Propósito**: Sincronización triple y paridad absoluta de 18 skills entre OpenCode, Copilot y Antigravity.\r\n- **Tareas Asociadas**: `INT-002`.\r\n- **Artefactos**: `module-spec.md`, `requirements-and-rules.md`, `data-and-transactions.md`, `diagrams.md`, `technical-debt-refactoring.md`.\r\n\r\n---\r\n\r\n## Capítulo 9: Estándares de Código, Guardrails Anti-Sesgo y Matriz de Trazabilidad (RTM)\r\n\r\n### 9.1 Guardrails Anti-Sesgo para IA\r\n- **Lista Blanca Autorizada**: Vanilla JS (ES Modules), Tailwind CSS v4 (`@tailwindcss/browser@4`), Three.js (r128), Node.js Test Runner nativo (`node:test`), Playwright (`@playwright/test`), esbuild.\r\n- **Lista Negra Terminantemente Prohibida**: Frameworks pesados no autorizados (React, Vue o Angular en `project-docs`), librerías de estilos adicionales, emojis unicode en código de producción o commits directos a ramas base sin confirmación.\r\n\r\n### 9.2 Matriz de Trazabilidad Bidireccional (RTM)\r\n| Requerimiento (`RF-*`) | Regla (`BR-*`) | Historia (`HU-*`) | Componente Implementado | Suite de Pruebas | Estado |\r\n|---|---|---|---|---|---|\r\n| `RF-ORCH-001` | `BR-ORCH-001` | `HU-ORCH-01` | `.opencode/rules/branches.md` | `tests/unit/branching-rules.test.js`, `tests/blackbox/bva-inputs.test.js` | Cubierto |\r\n| `RF-ORCH-002` | `BR-ORCH-002` | `HU-ORCH-01` | `.agents/rules/antigravity-harness.md` | Manual con `ask_question` | Cubierto |\r\n| `RF-ORCH-003` | `BR-ORCH-004` | `HU-ORCH-02` | `scripts/capture-evidence.js`, `Modal.js` | `tests/acceptance/scrum-evidence-capture.spec.js` | Cubierto |\r\n| `RF-DASH-001` | `BR-DASH-001` | `HU-DASH-01` | `project-docs/src/core/api.js` | `tests/system/offline-fallback.test.js` | Cubierto |\r\n| `RF-DASH-002` | `BR-DASH-001` | `HU-DASH-01` | `project-docs/src/shared/MarkdownViewer.js` | `tests/acceptance/dual-editor.spec.js` | Cubierto |\r\n| `RF-DASH-003` | `BR-DASH-002` | `HU-DASH-01` | `project-docs/src/shared/Icons.js` | `tests/unit/ui-anti-emoji.test.js` | Cubierto |\r\n| `RF-SYNC-001` | `BR-SYNC-001` | `HU-SYNC-01` | `.agents/skills/sync-skills/` | `tests/whitebox/sync-pipeline.test.js` | Cubierto |\r\n| `RF-TEST-001` | `BR-TEST-001` | `HU-ORCH-01` | `project-docs/verify.sh` | Suite de 9 fases (16 unit, 12 wb, 8 bb, 7 sys, 1 load, 5 e2e, 10 acceptance) | Cubierto |\r\n",
    "modules/agent-orchestrator/data-and-transactions.md": "---\r\nid: MOD-ORCH-DATA\r\ntitle: \"Módulo: agent-orchestrator — Datos & Transacciones\"\r\nmodule: \"agent-orchestrator\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"data\", \"transactions\", \"git-refs\", \"concurrency\"]\r\n---\r\n\r\n# Módulo: agent-orchestrator — Datos & Transacciones\r\n\r\n---\r\n\r\n## 1. Entidades Persistidas y Referencias Git\r\n\r\nEl orquestador interactúa con dos fuentes de persistencia:\r\n1. **Referencias Git Locales (`.git/refs/heads/`)**:\r\n   - Punteros SHA-1 a los commits de trabajo en las ramas `{feature|bugfix}/INT-{id}/{name}`.\r\n2. **Archivos de Progreso JSON**:\r\n   - `progress/current.json`: Estado de la feature en curso, id, nombre, tareas completadas vs pendientes.\r\n   - `progress/history.json`: Bitácora histórica inmutable de specs completados y cerrados.\r\n\r\n---\r\n\r\n## 2. Fronteras Transaccionales y Concurrencia\r\n- **Atomicidad en Creación de Ramas**: La invocación `git checkout -b {branch}` es atómica en el sistema de archivos local de Git. Si la rama ya existe o el nombre es inválido, Git aborta sin mutar el HEAD actual.\r\n- **Concurrencia Multi-Agente**: Los subagentes se ejecutan con `Workspace: \"inherit\"`, lo que asegura que todos compartan el mismo working directory en la rama activa sin crear ramas fantasma o duplicadas.\r\n",
    "modules/agent-orchestrator/diagrams.md": "---\r\nid: MOD-ORCH-DIAG\r\ntitle: \"Módulo: agent-orchestrator — Suite de 6 Diagramas\"\r\nmodule: \"agent-orchestrator\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"c3\", \"class\", \"sequence\", \"state\", \"activity\", \"erd\"]\r\n---\r\n\r\n# Módulo: agent-orchestrator — Suite de 6 Diagramas\r\n\r\n---\r\n\r\n## 1. Diagrama de Componentes C3 del Módulo\r\n\r\n```mermaid\r\nflowchart LR\r\n  subgraph ModuleOrchestrator[\"agent-orchestrator\"]\r\n    compCoordinator[\"OrchestratorCoordinator<br/>(Valida ramas y estados)\"]\r\n    compDispatcher[\"SubagentDispatcher<br/>(Inyecta prompts y roles)\"]\r\n    compGate[\"HumanGateController<br/>(ask_question)\"]\r\n  end\r\n\r\n  userDev([\"Desarrollador Humano\"])\r\n  gitRepo[(\"Git Refs / Working Tree\")]\r\n  subagentPool[[\"Subagentes (Spec, Impl, Review)\"]]\r\n\r\n  userDev --> compCoordinator\r\n  compCoordinator -->|\"Valida INT-* (<=80c)\"| gitRepo\r\n  compCoordinator --> compDispatcher\r\n  compDispatcher -->|\"Workspace: inherit\"| subagentPool\r\n  compCoordinator --> compGate\r\n  compGate -->|\"Bloquea hasta confirmación\"| userDev\r\n```\r\n\r\n---\r\n\r\n## 2. Diagrama de Clases UML del Módulo\r\n\r\n```mermaid\r\nclassDiagram\r\n  class OrchestratorCoordinator {\r\n    +validateBranchName(string branch) bool\r\n    +createBranch(string type, int id, string name) BranchResult\r\n    +requestHumanApproval(Spec spec) ApprovalStatus\r\n  }\r\n\r\n  class SubagentDispatcher {\r\n    +dispatch(string role, string prompt) AgentSession\r\n    +terminate(string conversationId) void\r\n  }\r\n\r\n  class HumanGateController {\r\n    +promptApproval(string message, List~string~ options) string\r\n    +handleResponse(string response) FlowAction\r\n  }\r\n\r\n  OrchestratorCoordinator --> SubagentDispatcher : \"delega tareas\"\r\n  OrchestratorCoordinator --> HumanGateController : \"solicita puerta\"\r\n```\r\n\r\n---\r\n\r\n## 3. Diagrama de Secuencia Transaccional\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor User as \"Usuario Humano\"\r\n  participant Leader as \"Leader Agent\"\r\n  participant Git as \"Git System\"\r\n  participant Gate as \"Human Gate (ask_question)\"\r\n  participant Subagent as \"Subagente\"\r\n\r\n  User->>Leader: \"Iniciar feature INT-010\"\r\n  Leader->>Git: \"git checkout -b feature/INT-010/{name}\"\r\n  Leader->>Subagent: \"Redactar spec\"\r\n  Subagent-->>Leader: \"Spec completado (spec_ready)\"\r\n  Leader->>Gate: \"ask_question: Aprobar spec al 100%?\"\r\n  Gate->>User: \"Presenta opciones interactivas\"\r\n  User-->>Gate: \"Aprobar al 100%\"\r\n  Gate-->>Leader: \"Aprobado (in_progress)\"\r\n  Leader->>Subagent: \"Implementar código y tests\"\r\n```\r\n\r\n---\r\n\r\n## 4. Diagrama de Máquina de Estados del Ciclo de Tarea\r\n\r\n```mermaid\r\nstateDiagram-v2\r\n  [*] --> Pending : \"Creación de tarea\"\r\n  Pending --> SpecReady : \"spec-author completa specs\"\r\n  SpecReady --> InProgress : \"Humano aprueba spec (ask_question)\"\r\n  SpecReady --> Pending : \"Humano rechaza spec\"\r\n  InProgress --> Review : \"implementer finaliza código y tests\"\r\n  Review --> Done : \"reviewer valida al 100%\"\r\n  Review --> InProgress : \"reviewer reporta hallazgos\"\r\n  Done --> [*] : \"Reconciliación de metadata\"\r\n```\r\n\r\n---\r\n\r\n## 5. Diagrama de Actividades con Carriles (Swimlanes)\r\n\r\n```mermaid\r\nflowchart TD\r\n  subgraph LaneHuman[\"Carril: Desarrollador Humano\"]\r\n    actRequest[\"Solicita Tarea\"]\r\n    actApprove[\"Aprueba Spec (ask_question)\"]\r\n    actIntegrate[\"Aprueba Fusión a Master\"]\r\n  end\r\n\r\n  subgraph LaneLeader[\"Carril: Leader Agent\"]\r\n    actBranch[\"Crea Rama INT-*\"]\r\n    actDelegate[\"Invoca Subagentes\"]\r\n    actCheckReview[\"Verifica Dictamen Reviewer\"]\r\n  end\r\n\r\n  subgraph LaneSubagent[\"Carril: Subagente Especializado\"]\r\n    actSpec[\"Redacta Requerimientos & Tasks\"]\r\n    actCode[\"Escribe Código & Tests TDD\"]\r\n    actAudit[\"Audita 100% de Trazabilidad\"]\r\n  end\r\n\r\n  actRequest --> actBranch\r\n  actBranch --> actDelegate\r\n  actDelegate --> actSpec\r\n  actSpec --> actApprove\r\n  actApprove --> actCode\r\n  actCode --> actAudit\r\n  actAudit --> actCheckReview\r\n  actCheckReview --> actIntegrate\r\n```\r\n\r\n---\r\n\r\n## 6. Sub-Diagrama Entidad-Relación (ERD)\r\n\r\n```mermaid\r\nerDiagram\r\n  FEATURE ||--|| TASK_STATE : \"monitorea\"\r\n  FEATURE ||--|{ AGENT_SESSION : \"asigna a\"\r\n\r\n  FEATURE {\r\n    string id PK\r\n    string branch\r\n    string status\r\n  }\r\n\r\n  TASK_STATE {\r\n    string status PK\r\n    bool is_locked\r\n    string gate_status\r\n  }\r\n\r\n  AGENT_SESSION {\r\n    string conversation_id PK\r\n    string role\r\n    string workspace_mode\r\n  }\r\n```\r\n",
    "modules/agent-orchestrator/module-spec.md": "---\r\nid: MOD-ORCH-SPEC\r\ntitle: \"Módulo: agent-orchestrator — Especificación & Tarjetas CRC\"\r\nmodule: \"agent-orchestrator\"\r\nstatus: \"Publicado\"\r\nversion: \"4.2.0\"\r\nlast_updated: \"2026-11-07\"\r\ntags: [\"orchestrator\", \"subagents\", \"crc-cards\", \"branching\", \"human-gate\", \"scrum-subtasks\", \"qa-evidence\"]\r\n---\r\n\r\n# Módulo: agent-orchestrator — Especificación & Tarjetas CRC\r\n\r\n> [!NOTE]\r\n> Bounded Context encargado de la orquestación multi-agente, la observabilidad del ciclo de vida SDD, la imposición estricta de límites de ramas git, las puertas obligatorias de decisión humana y la gestión de subtareas Scrum Jira DEV/QA con capturas de evidencia de pruebas.\r\n\r\n---\r\n\r\n## 1. Alcance y Estado de Cobertura\r\n- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`\r\n- **Tareas Trazadas**: `INT-001` (Refactorización del arnés) e `INT-009` (Subtareas Scrum Jira DEV/QA y evidencias visuales).\r\n- **Responsabilidad Primaria**: Coordinar la ejecución secuencial de agentes especializados (`leader`, `spec-author`, `implementer`, `reviewer`), validar convenciones de ramas git ($\\le 80$ caracteres), forzar pausas interactivas mediante `ask_question`, y asegurar el desglose y cierre formal de subtareas Jira DEV/QA con screenshots automatizados.\r\n\r\n---\r\n\r\n## 2. Lenguaje Ubicuo Local\r\n- **Leader**: Agente orquestador soberano que inicia la tarea y valida las ramas.\r\n- **Spec-Author**: Agente redactor de especificaciones técnicas (EARS / IEEE 830).\r\n- **Implementer**: Agente ejecutor que programa código y pruebas unitarias/integración.\r\n- **Reviewer**: Agente auditor independiente e imparcial (prohibido editar código).\r\n- **Human Gate**: Puerta obligatoria de aprobación humana con `ask_question`.\r\n- **Subtareas Scrum DEV/QA**: Desglose operativo de cada historia de usuario en tareas de desarrollo e ingeniería de calidad.\r\n- **Evidencias Visuales**: Capturas de pantalla headless de los flujos del sistema generadas por Playwright en `project-docs/specs/{NNN}_{name}/evidence/`.\r\n\r\n---\r\n\r\n## 3. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)\r\n\r\n| Clase / Agregado | Estereotipo | Responsabilidades | Colaboradores |\r\n|---|---|---|---|\r\n| `OrchestratorCoordinator` | `<<Service>>` | 1. Interpretar comando del usuario.<br/>2. Verificar si la rama actual es base (`master`/`main`).<br/>3. Crear la rama `{feature\\|bugfix}/INT-{id}/{name}` ($\\le 80$c). | `GitCLI`, `AgentRegistry` |\r\n| `HumanGateController` | `<<Controller>>` | 1. Generar modal interactivo `ask_question`.<br/>2. Bloquear ejecución hasta recibir respuesta del usuario.<br/>3. Enrutar el flujo según la opción seleccionada. | `AntigravityAPI`, `LeaderAgent` |\r\n| `SubagentDispatcher` | `<<Dispatcher>>` | 1. Invocar subagente con `Workspace: \"inherit\"`.<br/>2. Inyectar prompt contextualizado con la tarea activa. | `invoke_subagent`, `AgentSpec` |\r\n| `ScrumEvidenceManager` | `<<Manager>>` | 1. Desglosar requerimientos en subtareas Jira `DEV` y `QA`.<br/>2. Ejecutar capturas headless en navegador con `capture-evidence.js`.<br/>3. Verificar que ambas subtareas y evidencias existan antes de autorizar cierre de tarea. | `PlaywrightRunner`, `EvidenceStorage`, `FeatureTableModal` |\r\n\r\n---\r\n\r\n## 4. Contratos de Entrada y Salida (DTOs / Interfaces)\r\n- **Input**: `{ taskId: \"INT-009\", type: \"feature\", title: \"Scrum Spec Subtasks and QA Evidence\", baseBranch: \"master\" }`\r\n- **Output**: `{ branch: \"feature/INT-009/scrum_spec_subtasks_qa_evidence\", length: 47, status: \"created\", agentDispatched: \"spec-author\" }`\r\n- **Invariante**: Si `length > 80`, la operación aborta con excepción inmediata.\r\n",
    "modules/agent-orchestrator/requirements-and-rules.md": "---\r\nid: MOD-ORCH-RULES\r\ntitle: \"Módulo: agent-orchestrator — Requerimientos & Reglas de Negocio\"\r\nmodule: \"agent-orchestrator\"\r\nstatus: \"Publicado\"\r\nversion: \"4.2.0\"\r\nlast_updated: \"2026-11-07\"\r\ntags: [\"requirements\", \"rules\", \"stories\", \"tasks\", \"scrum-subtasks\", \"qa-evidence\"]\r\n---\r\n\r\n# Módulo: agent-orchestrator — Requerimientos & Reglas de Negocio\r\n\r\n---\r\n\r\n## 1. Requerimientos Funcionales Formales (IEEE 830)\r\n\r\n### `RF-ORCH-001`: Creación y Validación Estricta de Ramas Git\r\n- **Enunciado Formal**: Cuando el usuario solicite iniciar una tarea de ingeniería, el sistema **debe** verificar que la rama de trabajo cumpla la estructura `{feature|bugfix}/INT-{numero}/{nombre_rama}` y su longitud total **no debe** exceder los 80 caracteres.\r\n- **Criterio Gherkin**:\r\n  - *Given* una tarea con tipo `feature`, id `INT-001` y nombre `document_crud_api`\r\n  - *When* el orquestador genera la rama git\r\n  - *Then* la rama creada es `feature/INT-001/document_crud_api` y su longitud es de 33 caracteres ($\\le 80$).\r\n\r\n### `RF-ORCH-002`: Puerta Humana Obligatoria para Aprobación de Spec\r\n- **Enunciado Formal**: Antes de pasar una tarea a estado `in_progress` o iniciar la fase de implementación, el sistema **debe** invocar la herramienta `ask_question` para obtener la aprobación explícita y documentada del usuario humano al 100%.\r\n\r\n### `RF-ORCH-003`: Partición en Subtareas Scrum Jira DEV/QA y Captura de Evidencias\r\n- **Enunciado Formal**: Durante la redacción del spec y la verificación final, el sistema **debe** particionar la tarea en subtareas Jira de Desarrollo (`DEV`) y Aseguramiento de Calidad (`QA`), y **debe** generar capturas de pantalla visuales de los flujos principales en `project-docs/specs/{NNN}_{name}/evidence/`.\r\n- **Criterio Gherkin**:\r\n  - *Given* una tarea aprobada y probada\r\n  - *When* se ejecuta la verificación de aceptación\r\n  - *Then* se generan las capturas PNG en el directorio de evidencias y el modal de detalle del tablero muestra badges interactivos `DEV: done` y `QA: done`.\r\n\r\n---\r\n\r\n## 2. Reglas de Negocio Locales (BR-*)\r\n\r\n| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |\r\n|---|---|---|---|---|\r\n| `BR-ORCH-001` | Crítica | `length(branch) <= 80 && type in ['feature', 'bugfix']` | `.opencode/rules/branches.md` | Aborta con error de convención |\r\n| `BR-ORCH-002` | Crítica | `spec_approved == true` antes de delegar a `implementer` | `.agents/rules/antigravity-harness.md` | Bloquea ejecución con `ask_question` |\r\n| `BR-ORCH-003` | Crítica | `reviewer.can_edit_code == false` | `.agents/agents/reviewer.md` | Prohibido editar código fuente |\r\n| `BR-ORCH-004` | Alta | `subtasks.dev == 'done' && subtasks.qa == 'done' && evidence_files.length >= 1` | `verify-spec` y `Modal.js` | Impide marcar la tarea como `done` |\r\n\r\n---\r\n\r\n## 3. Historias de Usuario (HU-*) y Tareas de Ingeniería (TI-*)\r\n\r\n### `HU-ORCH-01`: Orquestación Segura de Features\r\n- *Como* desarrollador líder, *quiero* que el arnés cree automáticamente ramas con el formato y longitud estricta, *para* evitar colisiones de nombres y ramas rotas en repositorios compartidos.\r\n- **Story Points**: 3 SP (Fibonacci)\r\n- **Tareas de Ingeniería (TI-*)**:\r\n  - `TI-ORCH-01`: Implementar validador regex de nombres de rama y contador de caracteres $\\le 80$.\r\n  - `TI-ORCH-02`: Añadir suite de pruebas BVA (79c, 80c, 81c) en `tests/blackbox/bva-inputs.test.js`.\r\n\r\n### `HU-ORCH-02`: Desglose Scrum DEV/QA y Evidencias Visuales\r\n- *Como* auditor de calidad / Scrum Master, *quiero* que cada User Story cuente con subtareas independientes de DEV y QA y evidencias gráficas generadas automáticamente, *para* auditar la aceptación visual sin ejecutar manualmente el navegador.\r\n- **Story Points**: 5 SP (Fibonacci)\r\n- **Tareas de Ingeniería (TI-*)**:\r\n  - `TI-ORCH-03`: Implementar runner de capturas headless en `scripts/capture-evidence.js`.\r\n  - `TI-ORCH-04`: Integrar visualización de subtareas DEV/QA y visor de evidencias en `project-docs/src/shared/Modal.js`.\r\n  - `TI-ORCH-05`: Añadir pruebas E2E con Playwright en `tests/acceptance/scrum-evidence-capture.spec.js`.\r\n",
    "modules/agent-orchestrator/rules.md": "# Reglas de Negocio Invariantes: agent-orchestrator\r\n\r\n### BR-ORCH-001: Formato y Longitud Estricta de Ramas\r\n- **Severidad**: Crítica\r\n- **Fórmula / Restricción**: `length({type}/INT-{numero}/{nombre_rama}) <= 80`\r\n- **Valores permitidos de type**: Exclusivamente `feature` o `bugfix`.\r\n- **Comportamiento ante Violación**: La creación de la rama es rechazada de inmediato.\r\n\r\n### BR-ORCH-002: Puerta Humana Obligatoria para Aprobación de Spec\r\n- **Severidad**: Crítica\r\n- **Restricción**: Jamás iniciar la fase de implementación sin que el humano haya seleccionado `Aprobar spec al 100% e iniciar implementación` mediante la herramienta `ask_question`.\r\n- **Comportamiento ante Violación**: Detención total del agente e invocación inmediata de `ask_question`.\r\n\r\n### BR-ORCH-003: Subagente Revisor No Modifica Código\r\n- **Severidad**: Crítica\r\n- **Restricción**: El subagente `reviewer` audita de forma imparcial la trazabilidad R-Tests, la compilación y los tests, pero tiene prohibido editar archivos fuente (`src/`, `tests/`).\r\n- **Comportamiento ante Violación**: Veredicto nulo y reasignación al `implementer`.\r\n",
    "modules/agent-orchestrator/sequence.md": "# Flujo de Orquestación Multi-Agente: agent-orchestrator\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor Humano as \"Usuario (Humano)\"\r\n  participant Leader as \"Leader Agent\"\r\n  participant SpecAuthor as \"Spec-Author\"\r\n  participant Implementer as \"Implementer\"\r\n  participant Reviewer as \"Reviewer\"\r\n\r\n  Humano->>Leader: \"Iniciar feature / INT-001\"\r\n  Leader->>Leader: \"Crear rama feature/INT-001/{nombre} (<=80c)\"\r\n  Leader->>SpecAuthor: \"invoke_subagent(spec-author)\"\r\n  SpecAuthor-->>Leader: \"specs/001_nombre/ listo (spec_ready)\"\r\n  Leader->>Humano: \"ask_question(Aprobar spec al 100%?)\"\r\n  Humano-->>Leader: \"Aprobado (in_progress)\"\r\n  Leader->>Implementer: \"invoke_subagent(implementer)\"\r\n  Implementer->>Implementer: \"Escribir código y tests (checks.test)\"\r\n  Implementer-->>Leader: \"Tasks completadas y trazabilidad R<->Tests\"\r\n  Leader->>Reviewer: \"invoke_subagent(reviewer)\"\r\n  Reviewer->>Reviewer: \"Auditoría imparcial sin editar código\"\r\n  alt Veredicto Aprobado\r\n    Reviewer-->>Leader: \"APROBADO (review_*.md)\"\r\n    Leader->>Humano: \"ask_question(Integrar a rama base?)\"\r\n  else Veredicto Rechazado\r\n    Reviewer-->>Leader: \"RECHAZADO (motivos documentados)\"\r\n    Leader->>Implementer: \"Reasignar correcciones\"\r\n  end\r\n```\r\n",
    "modules/agent-orchestrator/technical-debt-refactoring.md": "---\r\nid: MOD-ORCH-DEBT\r\ntitle: \"Módulo: agent-orchestrator — Deuda Técnica & Refactorización\"\r\nmodule: \"agent-orchestrator\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"technical-debt\", \"refactoring\", \"code-smells\", \"modernization\"]\r\n---\r\n\r\n# Módulo: agent-orchestrator — Deuda Técnica & Refactorización\r\n\r\n---\r\n\r\n## 1. Diagnóstico de Estado y Code Smells\r\n- **Estado de Deuda**: `Baja`\r\n- **Puntos Fuertes**: Lógica declarativa desacoplada en archivos markdown (`.agents/agents/`, `.agents/rules/`).\r\n- **Riesgos Mitigados**:\r\n  - Se previno el cuelgue en `git commit` mediante el parámetro `--no-gpg-sign` en entornos background de Windows.\r\n  - Se blindó la validación estricta de nombres de rama con la suite de pruebas BVA (79c, 80c, 81c).\r\n\r\n---\r\n\r\n## 2. Plan Táctico de Modernización\r\n1. **Paso 1**: Incorporar telemetría de tiempos de respuesta por subagente en `progress/history.json`.\r\n2. **Paso 2**: Extender la validación de ramas para soportar integración con Jira/Linear tags opcionales sin violar el límite de 80 caracteres.\r\n",
    "modules/dashboard-visualizer/data-and-transactions.md": "---\r\nid: MOD-DASH-DATA\r\ntitle: \"Módulo: dashboard-visualizer — Datos & Transacciones\"\r\nmodule: \"dashboard-visualizer\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"data\", \"state\", \"store\", \"persistence\"]\r\n---\r\n\r\n# Módulo: dashboard-visualizer — Datos & Transacciones\r\n\r\n---\r\n\r\n## 1. Estado en Memoria y Persistencia Local\r\n- **Store Reactivo**: El estado global reside en una instancia singleton de `Store` que almacena:\r\n  - `features`: Array normalizado de historias y tareas.\r\n  - `currentSpec`: Metadatos del spec en desarrollo.\r\n  - `knowledgeIndex`: Índice documental, estantes y diagramas.\r\n  - `ui`: Pestaña activa, modo oscuro/claro, filtros y paginación.\r\n- **Persistencia en LocalStorage**: Si el navegador tiene disponible `localStorage`, se preservan preferencias de tema (`theme: 'dark' | 'light'`) y documentos editados localmente.\r\n\r\n---\r\n\r\n## 2. Bloqueos de Concurrencia y Sincronización\r\n- **Flags Anti-Bucle en Scroll**: Variables booleanas `isScrollingFromEditor` e `isScrollingFromPreview` con temporizadores de 60ms para evitar que el evento `scroll` de una columna re-dispare recursivamente el de la otra.\r\n- **Auto-Sync Controlador**: Si se detecta `protocol === 'file:'`, el polling por temporizador se apaga por completo, evitando carreras de datos y saturación de la CPU.\r\n",
    "modules/dashboard-visualizer/diagrams.md": "---\r\nid: MOD-DASH-DIAG\r\ntitle: \"Módulo: dashboard-visualizer — Suite de 6 Diagramas\"\r\nmodule: \"dashboard-visualizer\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"c3\", \"class\", \"sequence\", \"state\", \"activity\", \"erd\"]\r\n---\r\n\r\n# Módulo: dashboard-visualizer — Suite de 6 Diagramas\r\n\r\n---\r\n\r\n## 1. Diagrama de Componentes C3 del Módulo\r\n\r\n```mermaid\r\nflowchart LR\r\n  subgraph ModuleDashboard[\"dashboard-visualizer\"]\r\n    compStore[\"Reactive Store (store.js)\"]\r\n    compRouter[\"Hash Router (router.js)\"]\r\n    compEditor[\"Dual Editor & MarkdownViewer\"]\r\n    comp3D[\"SpaceView3D (Three.js)\"]\r\n    compMermaid[\"MermaidViewer\"]\r\n  end\r\n\r\n  compRouter --> compStore\r\n  compStore --> compEditor\r\n  compStore --> comp3D\r\n  compStore --> compMermaid\r\n```\r\n\r\n---\r\n\r\n## 2. Diagrama de Clases UML del Módulo\r\n\r\n```mermaid\r\nclassDiagram\r\n  class DashboardStore {\r\n    -State state\r\n    -List~Function~ listeners\r\n    +getState() State\r\n    +setData(Object data) void\r\n    +subscribe(Function listener) Function\r\n    +setSelectedFeature(Feature f) void\r\n  }\r\n\r\n  class MarkdownViewer {\r\n    +renderMarkdown(string md) string\r\n    +extractTableOfContents(string md) List~Heading~\r\n    +parseMarkdownToBlocks(string md) List~Block~\r\n    +blocksToMarkdown(List~Block~ blocks) string\r\n  }\r\n\r\n  class MermaidViewer {\r\n    +renderMermaidViewer(Diagram diag) string\r\n    +initMermaidDiagrams(int retries) Promise\r\n  }\r\n\r\n  DashboardStore --> MarkdownViewer : \"alimenta contenido\"\r\n  DashboardStore --> MermaidViewer : \"alimenta diagramas\"\r\n```\r\n\r\n---\r\n\r\n## 3. Diagrama de Secuencia: Editor Dual con Scroll Sincronizado\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor User as \"Desarrollador\"\r\n  participant Editor as \"Textarea Editor\"\r\n  participant Preview as \"Live Preview\"\r\n  participant Store as \"DashboardStore\"\r\n\r\n  User->>Editor: \"Escribe markdown y desplaza scroll\"\r\n  Editor->>Preview: \"Calcula ratio de scroll (scrollY / maxScroll)\"\r\n  Editor->>Preview: \"Ajusta scrollTop de previsualización\"\r\n  Editor->>Store: \"saveDoc(key, content)\"\r\n  Store-->>User: \"Notificación: Guardado con éxito\"\r\n```\r\n\r\n---\r\n\r\n## 4. Diagrama de Máquina de Estados del Visor\r\n\r\n```mermaid\r\nstateDiagram-v2\r\n  [*] --> LibraryView : \"Carga inicial de Knowledge Base\"\r\n  LibraryView --> ReaderView : \"Click en [ Leer Artículo ]\"\r\n  ReaderView --> EditorView : \"Click en [ Modo Editor ]\"\r\n  EditorView --> ReaderView : \"Click en [ Modo Lectura ]\"\r\n  ReaderView --> LibraryView : \"Click en [ Volver a Biblioteca ]\"\r\n  EditorView --> LibraryView : \"Click en [ Volver a Biblioteca ]\"\r\n```\r\n\r\n---\r\n\r\n## 5. Diagrama de Actividades de Inicialización\r\n\r\n```mermaid\r\nflowchart TD\r\n  startNode([\"Inicio Carga index.html\"])\r\n  checkProto{\"window.location.protocol === 'file:'\"}\r\n  loadFallback[\"Lee window.__FALLBACK_DATA__\"]\r\n  loadHttp[\"fetchProjectData() HTTP\"]\r\n  initStore[\"store.setData(data)\"]\r\n  mountView[\"Monta Pestaña Activa\"]\r\n  initMermaid[\"initMermaidDiagrams() con Reintentos\"]\r\n\r\n  startNode --> checkProto\r\n  checkProto -->|Sí| loadFallback\r\n  checkProto -->|No| loadHttp\r\n  loadFallback --> initStore\r\n  loadHttp --> initStore\r\n  initStore --> mountView\r\n  mountView --> initMermaid\r\n```\r\n\r\n---\r\n\r\n## 6. Sub-Diagrama Entidad-Relación (ERD)\r\n\r\n```mermaid\r\nerDiagram\r\n  DASHBOARD_STATE ||--o{ FEATURE_VIEW : \"renderiza\"\r\n  DASHBOARD_STATE ||--|| ACTIVE_DOC : \"edita\"\r\n\r\n  DASHBOARD_STATE {\r\n    string active_tab\r\n    string theme\r\n    int total_features\r\n  }\r\n\r\n  FEATURE_VIEW {\r\n    int id PK\r\n    string title\r\n    string status\r\n  }\r\n\r\n  ACTIVE_DOC {\r\n    string key PK\r\n    string content\r\n    int reading_time\r\n  }\r\n```\r\n",
    "modules/dashboard-visualizer/module-spec.md": "---\r\nid: MOD-DASH-SPEC\r\ntitle: \"Módulo: dashboard-visualizer — Especificación & Tarjetas CRC\"\r\nmodule: \"dashboard-visualizer\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"dashboard\", \"vanilla-js\", \"tailwind-v4\", \"three-js\", \"dual-editor\", \"crc-cards\"]\r\n---\r\n\r\n# Módulo: dashboard-visualizer — Especificación & Tarjetas CRC\r\n\r\n> [!NOTE]\r\n> Bounded Context encargado de la visualización web interactiva del arnés, métricas KPI, editor dual ContextForge, grafos de dependencias SVG y constelación 3D en Three.js con soporte offline nativo (`file:///`).\r\n\r\n---\r\n\r\n## 1. Alcance y Estado de Cobertura\r\n- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`\r\n- **Responsabilidad Primaria**: Renderizar el estado vivo del proyecto, permitir la edición Docs-as-Code en tiempo real, visualizar la arquitectura en diagramas interactivos y proveer navegación fluida sin emojis ni dependencias de frameworks pesados.\r\n\r\n---\r\n\r\n## 2. Lenguaje Ubicuo Local\r\n- **Reactive Store**: Almacén central inmutable que gestiona el estado y notifica cambios a la vista.\r\n- **Dual Editor**: Editor con paneles simultáneos de Markdown crudo y Bloques Visuales con sincronización proporcional de scroll.\r\n- **Offline Fallback**: Respaldo en memoria inyectado por `data-fallback.js` para silenciar bloqueos CORS en `file:///`.\r\n- **ThreeJS Constellation**: Representación astronómica 3D de las dependencias jerárquicas del proyecto.\r\n\r\n---\r\n\r\n## 3. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)\r\n\r\n| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |\r\n|---|---|---|---|\r\n| `DashboardStore` | `<<StateStore>>` | 1. Mantener estado unificado (features, specs, conocimiento).<br/>2. Notificar a observadores registrados ante mutaciones.<br/>3. Filtrar y paginar datos reactivamente. | `SubscriberCallbacks`, `LocalStorageCache` |\r\n| `MarkdownViewer` | `<<Renderer>>` | 1. Parsear sintaxis Markdown a HTML seguro.<br/>2. Renderizar alertas GitHub y tablas sticky.<br/>3. Convertir Markdown bidireccionalmente a bloques visuales. | `DOMPurify`, `MermaidViewer` |\r\n| `SpaceView3D` | `<<Visualizer>>` | 1. Inicializar escena Three.js, cámara y luces.<br/>2. Renderizar constelación piramidal de nodos.<br/>3. Destruir listeners y liberar memoria en `unmount`. | `ThreeJS`, `DashboardStore` |\r\n| `MermaidViewer` | `<<DiagramViewer>>` | 1. Renderizar código Mermaid como SVG interactivo.<br/>2. Ofrecer conmutador entre vista visual y código fuente.<br/>3. Habilitar zoom a pantalla completa y enlace a Draw.io. | `WindowMermaid`, `ClipboardAPI` |\r\n\r\n---\r\n\r\n## 4. Contratos de Entrada y Salida (DTOs / Interfaces)\r\n- **Input**: `window.__FALLBACK_DATA__` o respuestas JSON de `fetchProjectData()`.\r\n- **Output**: Renderizado DOM reactivo en `#app`, eventos de navegación por hash y persistencia local de documentos modificados.\r\n",
    "modules/dashboard-visualizer/requirements-and-rules.md": "---\r\nid: MOD-DASH-RULES\r\ntitle: \"Módulo: dashboard-visualizer — Requerimientos & Reglas de Negocio\"\r\nmodule: \"dashboard-visualizer\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"requirements\", \"rules\", \"anti-emoji\", \"offline-first\"]\r\n---\r\n\r\n# Módulo: dashboard-visualizer — Requerimientos & Reglas de Negocio\r\n\r\n---\r\n\r\n## 1. Requerimientos Funcionales Formales (IEEE 830)\r\n\r\n### `RF-DASH-001`: Compatibilidad Offline Nativa (`file:///`)\r\n- **Enunciado Formal**: Cuando el usuario abra `project-docs/index.html` bajo el protocolo `file:///`, el sistema **debe** cargar los datos desde `window.__FALLBACK_DATA__` sin ejecutar llamadas `fetch()` que disparen políticas de bloqueo CORS en el navegador.\r\n\r\n### `RF-DASH-002`: Editor Dual con Scroll Sincronizado\r\n- **Enunciado Formal**: Cuando el usuario active el modo editor en cualquier documento de la base de conocimiento, el sistema **debe** renderizar en paralelo el área de texto Markdown y la previsualización en vivo, manteniendo el scroll sincronizado proporcionalmente en ambas columnas sin bucles infinitos de eventos.\r\n\r\n### `RF-DASH-003`: Erradicación Total de Emojis\r\n- **Enunciado Formal**: La interfaz de usuario **no debe** contener caracteres emoji unicode en botones, badges, modales o encabezados, empleando exclusivamente funciones de iconografía SVG vectorial de `Icons.js`.\r\n\r\n---\r\n\r\n## 2. Reglas de Negocio Locales (BR-*)\r\n\r\n| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |\r\n|---|---|---|---|---|\r\n| `BR-DASH-001` | Crítica | `protocol == 'file:' ==> useFallbackData && bypassFetch` | `project-docs/src/core/api.js` | Silencia errores CORS |\r\n| `BR-DASH-002` | Alta | `count(emojiChars) == 0` en código fuente y HTML | `tests/unit/ui-anti-emoji.test.js` | Falla test unitario |\r\n| `BR-DASH-003` | Alta | `tabSwitch ==> destroyThreeScene && resetListeners` | `project-docs/src/features/space-view-3d/` | Previene fugas de memoria OOM |\r\n",
    "modules/dashboard-visualizer/rules.md": "# Reglas de Negocio Invariantes: dashboard-visualizer\r\n\r\n### BR-DASH-001: Compatibilidad 100% Offline (Zero-Server Fallback)\r\n- **Severidad**: Crítica\r\n- **Restricción**: El tablero debe poder abrirse con doble clic directamente en `project-docs/index.html` bajo el protocolo `file:///` sin requerir servidor HTTP ni fallar por CORS.\r\n- **Comportamiento ante Violación**: `sync-data.js` genera obligatoriamente `project-docs/data-fallback.js` antes de cualquier compilación.\r\n\r\n### BR-DASH-002: Scroll Sincronizado Proporcional Anti-Bloqueo\r\n- **Severidad**: Alta\r\n- **Fórmula**: $\\text{Ratio} = \\frac{\\text{scrollTop}}{\\text{scrollHeight} - \\text{clientHeight}}$ con flags de exclusión mutua `isScrollingFromEditor` e `isScrollingFromPreview`.\r\n- **Comportamiento ante Violación**: Bloqueo de scroll o bucles de eventos infinitos entre paneles.\r\n",
    "modules/dashboard-visualizer/sequence.md": "# Flujo de Renderizado y Navegación: dashboard-visualizer\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor User as \"Usuario / Programador\"\r\n  participant App as \"main.js (Router)\"\r\n  participant Omnibox as \"Omnibox (Ctrl+K)\"\r\n  participant Library as \"Editorial Library Hub\"\r\n  participant Article as \"Lector / Editor Dual\"\r\n  participant ThreeD as \"Three.js Constelacion 3D\"\r\n\r\n  User->>App: \"Abrir index.html (file:/// o HTTP)\"\r\n  App->>App: \"Cargar data-fallback.js / API\"\r\n  User->>Omnibox: \"Pulsar Ctrl+K y buscar término\"\r\n  Omnibox-->>User: \"Resultados en vivo (Tareas, Docs, Reglas)\"\r\n  User->>Omnibox: \"Seleccionar documento de arquitectura\"\r\n  Omnibox->>Article: \"openArticleView('c4-model.md')\"\r\n  Article-->>User: \"Renderizar columna 780px + TOC flotante + Diagramas Mermaid\"\r\n  User->>Article: \"Pulsar Modo Editor [ Modo Bloques ]\"\r\n  Article-->>User: \"Editor de Bloques ContextForge con scroll sincronizado\"\r\n  User->>App: \"Cambiar pestaña a Constelación 3D\"\r\n  App->>ThreeD: \"mount(container) -> Pirámide 4 niveles\"\r\n```\r\n",
    "modules/dashboard-visualizer/technical-debt-refactoring.md": "---\r\nid: MOD-DASH-DEBT\r\ntitle: \"Módulo: dashboard-visualizer — Deuda Técnica & Refactorización\"\r\nmodule: \"dashboard-visualizer\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"technical-debt\", \"refactoring\", \"ux-redesign\", \"clean-code\"]\r\n---\r\n\r\n# Módulo: dashboard-visualizer — Deuda Técnica & Refactorización\r\n\r\n---\r\n\r\n## 1. Diagnóstico de Estado y Code Smells Resueltos\r\n- **Code Smell 1 (Resuelto)**: Errores CORS en consola al abrir `index.html` vía `file:///` -> Resuelto bifurcando inmediatamente en `api.js` para usar `window.__FALLBACK_DATA__`.\r\n- **Code Smell 2 (Resuelto)**: Los diagramas C4 no tenían código en `knowledge-index.json` -> Resuelto integrando `extractDiagrams` en `sync-data.js`.\r\n- **Code Smell 3 (En Refactorización Actual)**: La Base de Conocimiento mezclaba documentos generales y archivos de módulos en una sola lista sin jerarquía clara -> Se resuelve implementando el nuevo switcher de 3 perspectivas: **Visión Global (01–12)**, **Módulos & Bounded Contexts** y **Dossier Maestro (`MASTER-PROJECT-KNOWLEDGE.md`)**.\r\n\r\n---\r\n\r\n## 2. Plan Táctico de Modernización\r\n1. **Paso 1**: Implementar el switcher de navegación de 3 niveles en `KnowledgeBase.js`.\r\n2. **Paso 2**: Habilitar previsualización y descarga del Megadocumento Maestro.\r\n",
    "modules/knowledge-engine/data-and-transactions.md": "---\r\nid: MOD-KNOW-DATA\r\ntitle: \"Módulo: knowledge-engine — Datos & Transacciones\"\r\nmodule: \"knowledge-engine\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"data\", \"transactions\", \"knowledge-graph\", \"json-index\"]\r\n---\r\n\r\n# Módulo: knowledge-engine — Datos & Transacciones\r\n\r\n---\r\n\r\n## 1. Esquema del Grafo de Conocimiento (`knowledgeGraph`)\r\nEl archivo `knowledge-index.json` persiste:\r\n- **`nodes`**: Entidades, Módulos, Tablas, Endpoints, Servicios Externos y Reglas `BR-*`.\r\n- **`edges`**: Relaciones dirigidas:\r\n  - `ENFORCES_RULE` (Módulo -> Regla)\r\n  - `PERSISTS_IN` (Entidad -> Tabla)\r\n  - `INTEGRATES_WITH` (Módulo -> Servicio Externo)\r\n  - `TESTED_BY` (Requerimiento -> Test)\r\n\r\n---\r\n\r\n## 2. Consistencia en Disco\r\n- La sincronización mediante `sync-data.js` genera escrituras atómicas en `knowledge-index.json` y `data-fallback.js`.\r\n",
    "modules/knowledge-engine/diagrams.md": "---\r\nid: MOD-KNOW-DIAG\r\ntitle: \"Módulo: knowledge-engine — Suite de 6 Diagramas\"\r\nmodule: \"knowledge-engine\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"c3\", \"class\", \"sequence\", \"state\", \"activity\", \"erd\"]\r\n---\r\n\r\n# Módulo: knowledge-engine — Suite de 6 Diagramas\r\n\r\n---\r\n\r\n## 1. Diagrama de Componentes C3 del Módulo\r\n\r\n```mermaid\r\nflowchart LR\r\n  subgraph ModuleKnowledge[\"knowledge-engine\"]\r\n    compScanner[\"DocScanner (Escaneo recursivo)\"]\r\n    compExtractor[\"DiagramExtractor (Mermaid AST)\"]\r\n    compCompiler[\"MasterCompiler (Dossier Único)\"]\r\n    compSync[\"SyncEngine (sync-data.js)\"]\r\n  end\r\n\r\n  docsDir[(\"project-docs/knowledge/**\")]\r\n  indexJson[(\"knowledge-index.json\")]\r\n  fallbackJs[(\"data-fallback.js\")]\r\n  masterMd[(\"MASTER-PROJECT-KNOWLEDGE.md\")]\r\n\r\n  docsDir --> compScanner\r\n  docsDir --> compExtractor\r\n  compScanner --> compCompiler\r\n  compCompiler --> masterMd\r\n  compExtractor --> compSync\r\n  compSync --> indexJson\r\n  compSync --> fallbackJs\r\n```\r\n\r\n---\r\n\r\n## 2. Diagrama de Clases UML del Módulo\r\n\r\n```mermaid\r\nclassDiagram\r\n  class KnowledgeDocument {\r\n    +string key\r\n    +string title\r\n    +string shelf\r\n    +int readingTime\r\n    +int wordCount\r\n    +int ruleCount\r\n  }\r\n\r\n  class DiagramDefinition {\r\n    +string id\r\n    +string type\r\n    +string level\r\n    +string title\r\n    +string mermaidCode\r\n  }\r\n\r\n  class KnowledgeEngine {\r\n    +scanDocs(string dir) Map~string, string~\r\n    +extractDiagrams(Map docs) List~DiagramDefinition~\r\n    +compileMasterDocument(Map docs) string\r\n  }\r\n\r\n  KnowledgeEngine \"1\" --> \"*\" KnowledgeDocument : \"indexa\"\r\n  KnowledgeEngine \"1\" --> \"*\" DiagramDefinition : \"extrae\"\r\n```\r\n\r\n---\r\n\r\n## 3. Diagrama de Secuencia: Ingesta y Sincronización\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor User as \"Agente / Dev\"\r\n  participant Engine as \"sync-data.js\"\r\n  participant FS as \"File System\"\r\n  participant Fallback as \"data-fallback.js\"\r\n  participant Bundle as \"app.bundle.js\"\r\n\r\n  User->>Engine: \"node sync-data.js\"\r\n  Engine->>FS: \"scanDocs(knowledgeDir)\"\r\n  FS-->>Engine: \"docs, docMetadata, shelves\"\r\n  Engine->>Engine: \"extractDiagrams(docs)\"\r\n  Engine->>FS: \"write(knowledge-index.json)\"\r\n  Engine->>Fallback: \"write(window.__FALLBACK_DATA__)\"\r\n  Engine->>Bundle: \"npx esbuild (recompila bundle)\"\r\n  Engine-->>User: \"[SUCCESS] Sincronización completada\"\r\n```\r\n\r\n---\r\n\r\n## 4. Diagrama de Máquina de Estados de un Documento\r\n\r\n```mermaid\r\nstateDiagram-v2\r\n  [*] --> Borrador : \"Creación inicial\"\r\n  Borrador --> EnRevision : \"Completado por agente\"\r\n  EnRevision --> Publicado : \"Aprobado por humano / QA\"\r\n  Publicado --> EnRevision : \"Modificación o refactor\"\r\n  Publicado --> Retirado : \"Deprecado por nueva versión\"\r\n  Retirado --> [*]\r\n```\r\n\r\n---\r\n\r\n## 5. Diagrama de Actividades: Pipeline de Compilación\r\n\r\n```mermaid\r\nflowchart TD\r\n  startScan([\"Inicio Pipeline sync-data.js\"])\r\n  readDocs[\"Lee archivos .md recursivamente\"]\r\n  calcMetrics[\"Calcula WPM, readingTime, BR-* count\"]\r\n  extractDiagrams[\"Extrae bloques Mermaid c4/uml/erd\"]\r\n  updateIndex[\"Actualiza knowledge-index.json\"]\r\n  writeFallback[\"Genera data-fallback.js\"]\r\n  rebuildBundle[\"Recompila dist/app.bundle.js\"]\r\n  endNode([\"Fin: Tablero Listo Offline\"])\r\n\r\n  startScan --> readDocs\r\n  readDocs --> calcMetrics\r\n  calcMetrics --> extractDiagrams\r\n  extractDiagrams --> updateIndex\r\n  updateIndex --> writeFallback\r\n  writeFallback --> rebuildBundle\r\n  rebuildBundle --> endNode\r\n```\r\n\r\n---\r\n\r\n## 6. Sub-Diagrama Entidad-Relación (ERD)\r\n\r\n```mermaid\r\nerDiagram\r\n  DOCUMENT ||--o{ DIAGRAM : \"contiene\"\r\n  DOCUMENT ||--|| SHELF : \"pertenece a\"\r\n\r\n  DOCUMENT {\r\n    string key PK\r\n    string title\r\n    string shelf\r\n    int word_count\r\n  }\r\n\r\n  DIAGRAM {\r\n    string id PK\r\n    string type\r\n    string mermaid_code\r\n  }\r\n\r\n  SHELF {\r\n    string id PK\r\n    string title\r\n  }\r\n```\r\n",
    "modules/knowledge-engine/module-spec.md": "---\r\nid: MOD-KNOW-SPEC\r\ntitle: \"Módulo: knowledge-engine — Especificación & Tarjetas CRC\"\r\nmodule: \"knowledge-engine\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"knowledge-engine\", \"docs-as-code\", \"rag\", \"graphrag\", \"crc-cards\"]\r\n---\r\n\r\n# Módulo: knowledge-engine — Especificación & Tarjetas CRC\r\n\r\n> [!NOTE]\r\n> Bounded Context encargado de la extracción, estandarización y mantenimiento de la Base de Conocimiento Soberana Docs-as-Code para alimentar agentes de IA y desarrolladores sin sesgo.\r\n\r\n---\r\n\r\n## 1. Alcance y Estado de Cobertura\r\n- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`\r\n- **Responsabilidad Primaria**: Elicitar la visión del producto, diagnosticar la arquitectura real AS-IS, mantener el catálogo de reglas `BR-*` y compilar el megadocumento `MASTER-PROJECT-KNOWLEDGE.md`.\r\n\r\n---\r\n\r\n## 2. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)\r\n\r\n| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |\r\n|---|---|---|---|\r\n| `DocScanner` | `<<Scanner>>` | 1. Recorrer `project-docs/knowledge/` recursivamente.<br/>2. Extraer títulos, resúmenes y metadatos AST.<br/>3. Calcular tiempo de lectura y conteo de palabras. | `FileSystem`, `MarkdownParser` |\r\n| `DiagramExtractor` | `<<Extractor>>` | 1. Parsear bloques ` ```mermaid ` en documentos clave.<br/>2. Enriquecer objetos de diagrama con código limpio. | `KnowledgeIndex` |\r\n| `MasterCompiler` | `<<Compiler>>` | 1. Unificar todos los documentos 01-12 y módulos en `MASTER-PROJECT-KNOWLEDGE.md`.<br/>2. Generar tabla de contenidos ancla interactiva. | `DocScanner`, `FileSystem` |\r\n\r\n---\r\n\r\n## 3. Contratos de Salida\r\n- `project-docs/knowledge/knowledge-index.json`\r\n- `project-docs/data-fallback.js`\r\n- `project-docs/knowledge/MASTER-PROJECT-KNOWLEDGE.md`\r\n",
    "modules/knowledge-engine/requirements-and-rules.md": "---\r\nid: MOD-KNOW-RULES\r\ntitle: \"Módulo: knowledge-engine — Requerimientos & Reglas de Negocio\"\r\nmodule: \"knowledge-engine\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"requirements\", \"rules\", \"anti-bias\", \"mermaid-syntax\"]\r\n---\r\n\r\n# Módulo: knowledge-engine — Requerimientos & Reglas de Negocio\r\n\r\n---\r\n\r\n## 1. Requerimientos Funcionales Formales (IEEE 830)\r\n\r\n### `RF-KNOW-001`: Ingesta Universal y Muestreo Quirúrgico\r\n- **Enunciado Formal**: Cuando el motor escanee archivos con más de 800 líneas de código, **no debe** cargarlos completos en memoria, sino que **debe** aplicar extracción de firmas por regex y lectura focalizada por rangos de líneas.\r\n\r\n### `RF-KNOW-002`: Doble Salida Modular y Megadocumento Maestro\r\n- **Enunciado Formal**: Tras auditar el repositorio, el sistema **debe** generar los documentos modulares en `project-docs/knowledge/` y compilar adicionalmente el archivo maestro consolidado `MASTER-PROJECT-KNOWLEDGE.md` con el 100% de la información sin truncar.\r\n\r\n---\r\n\r\n## 2. Reglas de Negocio Locales (BR-*)\r\n\r\n| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |\r\n|---|---|---|---|---|\r\n| `BR-KNOW-001` | Crítica | IDs Mermaid alfanuméricos puros + textos entrecomillados | `project-docs/sync-data.js` | Diagrama roto en parser |\r\n| `BR-KNOW-002` | Crítica | Consulta obligatoria de `project-docs/knowledge/` antes de codificar | `.agents/rules/antigravity-harness.md` | Rechazo en Review |\r\n| `BR-KNOW-003` | Alta | YAML frontmatter obligatorio en todo `.md` | `project-docs/knowledge/` | Falla indexación RAG |\r\n",
    "modules/knowledge-engine/rules.md": "# Reglas de Negocio Invariantes: knowledge-engine\r\n\r\n### BR-KNOW-001: Sintaxis Mermaid Ultra-Estricta\r\n- **Severidad**: Crítica\r\n- **Restricción**: Todo ID de nodo Mermaid debe ser alfanumérico simple sin guiones (`nodeA`, `nodeGateway`). Toda etiqueta descriptiva debe estar entre comillas dobles (`[\"Texto seguro\"]`).\r\n- **Comportamiento ante Violación**: Error de renderizado en el navegador bloqueante.\r\n\r\n### BR-KNOW-002: Invariante de Consulta Obligatoria Anti-Sesgo\r\n- **Severidad**: Crítica\r\n- **Restricción**: Antes de redactar specs o implementar código, los agentes DEBEN verificar la existencia de `project-docs/knowledge/`. Si existe, es obligatorio consultar `business-rules.md`, `coding-standards.md` y los módulos correspondientes.\r\n- **Comportamiento ante Violación**: Queda terminantemente prohibido inventar librerías o dependencias externas no canónicas.\r\n",
    "modules/knowledge-engine/sequence.md": "# Flujo de Elicitación y Extracción: knowledge-engine\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor User as \"Ingeniero / Agente\"\r\n  participant Skill as \"/project-knowledge\"\r\n  participant Phase1 as \"Fase 1: Escaneo Topologico\"\r\n  participant Phase2 as \"Fase 2: Inspeccion DDD Focalizada\"\r\n  participant Storage as \"project-docs/knowledge/\"\r\n  participant Sync as \"sync-data.js\"\r\n\r\n  User->>Skill: \"Ejecutar /project-knowledge\"\r\n  Skill->>Phase1: \"Auditar package.json, project-docs/project-spec.yaml, estructura de carpetas\"\r\n  Phase1-->>Skill: \"Identificados Bounded Contexts y fronteras\"\r\n  Skill->>Phase2: \"Leer servicios de dominio, entidades, reglas y handlers\"\r\n  Phase2-->>Skill: \"Extraídas reglas BR-*, requerimientos RF-* y diagramas C4/UML\"\r\n  Skill->>Storage: \"Escribir c4-model.md, business-rules.md, modules/**\"\r\n  Skill->>Sync: \"node project-docs/sync-data.js\"\r\n  Sync-->>User: \"Base de conocimiento e interfaz actualizadas al 100%\"\r\n```\r\n",
    "modules/knowledge-engine/technical-debt-refactoring.md": "---\r\nid: MOD-KNOW-DEBT\r\ntitle: \"Módulo: knowledge-engine — Deuda Técnica & Refactorización\"\r\nmodule: \"knowledge-engine\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"technical-debt\", \"refactoring\", \"knowledge-graph\", \"scalability\"]\r\n---\r\n\r\n# Módulo: knowledge-engine — Deuda Técnica & Refactorización\r\n\r\n---\r\n\r\n## 1. Diagnóstico de Estado y Code Smells\r\n- **Puntos Resueltos**:\r\n  - Se implementó la extracción estricta de diagramas Mermaid en `sync-data.js`.\r\n  - Se eliminaron las alucinaciones de código de diagramas vacíos.\r\n- **Riesgos a Monitorear**:\r\n  - Evitar que `MASTER-PROJECT-KNOWLEDGE.md` supere los límites de tamaño en repositorios masivos; se recomienda compilación incremental con enlaces ancla.\r\n\r\n---\r\n\r\n## 2. Plan Táctico de Modernización\r\n1. **Paso 1**: Implementar compilador de `MASTER-PROJECT-KNOWLEDGE.md` integrado en `sync-data.js`.\r\n2. **Paso 2**: Exportar embeddings opcionales en formato JSONL para RAG vectorial local en ContextForge.\r\n",
    "modules/testing-qa-suite/data-and-transactions.md": "---\r\nid: MOD-TEST-DATA\r\ntitle: \"Módulo: testing-qa-suite — Datos & Transacciones\"\r\nmodule: \"testing-qa-suite\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"data\", \"transactions\", \"test-results\"]\r\n---\r\n\r\n# Módulo: testing-qa-suite — Datos & Transacciones\r\n\r\n---\r\n\r\n## 1. Salidas de Ejecución y Reportes\r\n- Los resultados de `node --test` y `playwright test` emiten códigos de salida de proceso y trazas JSON temporales.\r\n- Si Playwright detecta fallos, almacena capturas y trazas en `test-results/`.\r\n",
    "modules/testing-qa-suite/diagrams.md": "---\r\nid: MOD-TEST-DIAG\r\ntitle: \"Módulo: testing-qa-suite — Suite de 6 Diagramas\"\r\nmodule: \"testing-qa-suite\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"c3\", \"class\", \"sequence\", \"state\", \"activity\", \"erd\"]\r\n---\r\n\r\n# Módulo: testing-qa-suite — Suite de 6 Diagramas\r\n\r\n---\r\n\r\n## 1. Diagrama de Componentes C3 del Módulo\r\n\r\n```mermaid\r\nflowchart LR\r\n  subgraph ModuleQA[\"testing-qa-suite\"]\r\n    compRunner[\"VerifyRunner (project-docs/verify.sh)\"]\r\n    compUnit[\"NodeTestRunner (Unit, White, Black, System)\"]\r\n    compPlaywright[\"PlaywrightRunner (Acceptance E2E)\"]\r\n    compLoad[\"LoadSimulator (Concurrencia)\"]\r\n  end\r\n\r\n  compRunner --> compUnit\r\n  compRunner --> compLoad\r\n  compRunner --> compPlaywright\r\n```\r\n\r\n---\r\n\r\n## 2. Diagrama de Clases UML del Módulo\r\n\r\n```mermaid\r\nclassDiagram\r\n  class VerifyRunner {\r\n    +executeAllPhases() int\r\n    +runUnitTests() TestResult\r\n    +runPlaywright() TestResult\r\n  }\r\n\r\n  class TestResult {\r\n    +int totalTests\r\n    +int passed\r\n    +int failed\r\n    +float durationMs\r\n    +bool isGreen()\r\n  }\r\n\r\n  VerifyRunner --> TestResult : \"evalúa\"\r\n```\r\n\r\n---\r\n\r\n## 3. Diagrama de Secuencia de Verificación\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor Dev as \"Desarrollador / Agente\"\r\n  participant Runner as \"project-docs/verify.sh\"\r\n  participant Unit as \"node --test\"\r\n  participant Playwright as \"npx playwright\"\r\n  participant Sync as \"sync-data.js\"\r\n\r\n  Dev->>Runner: \"bash project-docs/verify.sh\"\r\n  Runner->>Unit: \"Ejecutar unit, whitebox, blackbox, system, load\"\r\n  Unit-->>Runner: \"Todos los tests en verde\"\r\n  Runner->>Playwright: \"Ejecutar 7 escenarios E2E\"\r\n  Playwright-->>Runner: \"7 passed\"\r\n  Runner->>Sync: \"Recompilar y sincronizar\"\r\n  Sync-->>Runner: \"Sincronización completada\"\r\n  Runner-->>Dev: \"VERIFICACION EXITOSA (Verde)\"\r\n```\r\n\r\n---\r\n\r\n## 4. Diagrama de Máquina de Estados de la Suite\r\n\r\n```mermaid\r\nstateDiagram-v2\r\n  [*] --> Compiling : \"esbuild\"\r\n  Compiling --> UnitTesting : \"node --test unit\"\r\n  UnitTesting --> Whitebox : \"node --test whitebox\"\r\n  Whitebox --> Blackbox : \"node --test blackbox\"\r\n  Blackbox --> SystemIntegration : \"node --test system\"\r\n  SystemIntegration --> LoadTesting : \"node --test load\"\r\n  LoadTesting --> PlaywrightE2E : \"npx playwright test\"\r\n  PlaywrightE2E --> Success : \"Todos en verde\"\r\n  PlaywrightE2E --> Failed : \"Cualquier fallo\"\r\n  Success --> [*]\r\n  Failed --> [*]\r\n```\r\n\r\n---\r\n\r\n## 5. Diagrama de Actividades de Control de Calidad\r\n\r\n```mermaid\r\nflowchart TD\r\n  actStart([\"Inicio project-docs/verify.sh\"])\r\n  actBuild[\"esbuild bundle\"]\r\n  actTests[\"node --test suites\"]\r\n  checkPass{\"Pasa 100%?\"}\r\n  actPlaywright[\"Playwright E2E\"]\r\n  actSync[\"sync-data.js\"]\r\n  actGreen([\"Aprobado (Código 0)\"])\r\n  actRed([\"Abortado (Código 1)\"])\r\n\r\n  actStart --> actBuild\r\n  actBuild --> actTests\r\n  actTests --> checkPass\r\n  checkPass -->|No| actRed\r\n  checkPass -->|Sí| actPlaywright\r\n  actPlaywright --> actSync\r\n  actSync --> actGreen\r\n```\r\n\r\n---\r\n\r\n## 6. Sub-Diagrama Entidad-Relación (ERD)\r\n\r\n```mermaid\r\nerDiagram\r\n  TEST_RUN ||--|{ TEST_SUITE : \"ejecuta\"\r\n  TEST_SUITE ||--|{ TEST_CASE : \"evalúa\"\r\n\r\n  TEST_RUN {\r\n    string id PK\r\n    string timestamp\r\n    string status\r\n  }\r\n\r\n  TEST_SUITE {\r\n    string name PK\r\n    string category\r\n  }\r\n\r\n  TEST_CASE {\r\n    string name PK\r\n    int duration_ms\r\n    bool passed\r\n  }\r\n```\r\n",
    "modules/testing-qa-suite/module-spec.md": "---\r\nid: MOD-TEST-SPEC\r\ntitle: \"Módulo: testing-qa-suite — Especificación & Tarjetas CRC\"\r\nmodule: \"testing-qa-suite\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"testing\", \"qa\", \"verification\", \"crc-cards\", \"playwright\"]\r\n---\r\n\r\n# Módulo: testing-qa-suite — Especificación & Tarjetas CRC\r\n\r\n> [!NOTE]\r\n> Bounded Context encargado de la suite de pruebas automatizadas en 8 niveles, runner de `project-docs/verify.sh` y automatización end-to-end con Playwright.\r\n\r\n---\r\n\r\n## 1. Alcance y Estado de Cobertura\r\n- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`\r\n- **Responsabilidad Primaria**: Garantizar que el arnés y el tablero pasen el 100% de los niveles de verificación antes de cualquier entrega o cierre de spec.\r\n\r\n---\r\n\r\n## 2. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)\r\n\r\n| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |\r\n|---|---|---|---|\r\n| `VerifyRunner` | `<<TestRunner>>` | 1. Ejecutar las 8 fases de `project-docs/verify.sh`.<br/>2. Detener el pipeline ante cualquier fallo (código != 0).<br/>3. Recompilar y sincronizar datos automáticamente. | `ChildProcess`, `TestSuites` |\r\n| `PlaywrightHarness` | `<<E2EFramework>>` | 1. Levantar servidor local en puerto dinámico.<br/>2. Ejecutar escenarios de aceptación en navegador real.<br/>3. Capturar capturas y trazas ante fallos. | `PlaywrightBrowser`, `DashboardApp` |\r\n\r\n---\r\n\r\n## 3. Contratos de Entrada y Salida\r\n- **Comando Canónico**: `bash project-docs/verify.sh` o `npm run test:all`\r\n- **Output**: 56 pruebas pasando (16 Unit, 5 ATDD Smoke, 12 Whitebox, 8 Blackbox, 7 System, 1 Load, 7 Acceptance E2E).\r\n",
    "modules/testing-qa-suite/requirements-and-rules.md": "---\r\nid: MOD-TEST-RULES\r\ntitle: \"Módulo: testing-qa-suite — Requerimientos & Reglas de Negocio\"\r\nmodule: \"testing-qa-suite\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"requirements\", \"rules\", \"acceptance\", \"verification\"]\r\n---\r\n\r\n# Módulo: testing-qa-suite — Requerimientos & Reglas de Negocio\r\n\r\n---\r\n\r\n## 1. Requerimientos Funcionales Formales (IEEE 830)\r\n\r\n### `RF-TEST-001`: Pipeline de Verificación en 8 Niveles (`project-docs/verify.sh`)\r\n- **Enunciado Formal**: Cuando se ejecute la verificación del proyecto, el sistema **debe** compilar el bundle con esbuild, correr pruebas unitarias, smoke ATDD, caja blanca, caja negra BVA, pruebas de sistema, prueba de carga concurrente y pruebas Playwright E2E, deteniendo la ejecución si algún nivel falla.\r\n\r\n---\r\n\r\n## 2. Reglas de Negocio Locales (BR-*)\r\n\r\n| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |\r\n|---|---|---|---|---|\r\n| `BR-TEST-001` | Crítica | `exitCode == 0` en todas las fases de `project-docs/verify.sh` | `project-docs/verify.sh` | Aborta commit o merge |\r\n| `BR-TEST-002` | Alta | Concurrencia de carga $p95 < 200\\text{ms}$ con 0% de fallos | `tests/load/server-concurrency.test.js` | Falla suite de carga |\r\n",
    "modules/testing-qa-suite/rules.md": "# Reglas de Negocio Invariantes: testing-qa-suite\r\n\r\n### BR-TEST-001: 100% Tests en Verde para Cierre de Spec\r\n- **Severidad**: Crítica\r\n- **Restricción**: Ningún spec o tarea puede cerrarse como `done` si existe un solo test fallando en la suite.\r\n- **Comportamiento ante Violación**: `verify-spec` rechaza el cierre y bloquea la reconciliación.\r\n\r\n### BR-TEST-002: Cero Dependencias Pesadas en Runtime de Testing\r\n- **Severidad**: Alta\r\n- **Restricción**: Las pruebas unitarias deben ejecutarse usando el ejecutor nativo `node --test` para garantizar tiempos de respuesta inferiores a 500ms y cero bloat de dependencias.\r\n- **Comportamiento ante Violación**: Se rechaza la instalación de frameworks redundantes.\r\n",
    "modules/testing-qa-suite/sequence.md": "# Flujo de Verificación Continua: testing-qa-suite\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor Runner as \"Implementer / Reviewer\"\r\n  participant NPM as \"npm test\"\r\n  participant RunnerNative as \"Node.js Test Runner\"\r\n  participant UnitTests as \"tests/unit/*.test.js\"\r\n  participant SmokeTests as \"tests/e2e/*.test.js\"\r\n\r\n  Runner->>NPM: \"Ejecutar npm test\"\r\n  NPM->>RunnerNative: \"node --test tests/unit/**/*.test.js\"\r\n  RunnerNative->>UnitTests: \"Ejecutar pruebas unitarias en paralelo\"\r\n  UnitTests-->>RunnerNative: \"8/8 pruebas pasando en verde\"\r\n  Runner->>SmokeTests: \"npm run test:e2e\"\r\n  SmokeTests-->>Runner: \"2/2 pruebas smoke pasando en verde\"\r\n```\r\n",
    "modules/testing-qa-suite/technical-debt-refactoring.md": "---\r\nid: MOD-TEST-DEBT\r\ntitle: \"Módulo: testing-qa-suite — Deuda Técnica & Refactorización\"\r\nmodule: \"testing-qa-suite\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"technical-debt\", \"qa\", \"continuous-integration\"]\r\n---\r\n\r\n# Módulo: testing-qa-suite — Deuda Técnica & Refactorización\r\n\r\n---\r\n\r\n## 1. Diagnóstico de Estado y Code Smells\r\n- **Puntos Fuertes**: Cobertura amplia en 8 niveles, runner nativo sin dependencias pesadas de Jest/Mocha.\r\n- **Riesgos Mitigados**:\r\n  - Se configuró el puerto dinámico de `serve.js` a `127.0.0.1:3333` con flag `NO_OPEN` para evitar ventanas emergentes automáticas durante las pruebas.\r\n  - Se añadieron selectores ID estrictos en Playwright para evitar violaciones de strict mode.\r\n",
    "modules/triple-sync-engine/data-and-transactions.md": "---\r\nid: MOD-SYNC-DATA\r\ntitle: \"Módulo: triple-sync-engine — Datos & Transacciones\"\r\nmodule: \"triple-sync-engine\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"data\", \"transactions\", \"filesystem\", \"parity\"]\r\n---\r\n\r\n# Módulo: triple-sync-engine — Datos & Transacciones\r\n\r\n---\r\n\r\n## 1. Topología de Espejos de Datos\r\n- **Fuente**: `.opencode/skills/{skill}/SKILL.md` (18 carpetas)\r\n- **Espejo Copilot**: `.github/skills/{skill}/SKILL.md`\r\n- **Espejo Antigravity**: `.agents/skills/{skill}/SKILL.md`\r\n\r\n---\r\n\r\n## 2. Invariante Transaccional\r\n- Toda sincronización se realiza mediante copia limpia de contenido con preservación del frontmatter exacto.\r\n",
    "modules/triple-sync-engine/diagrams.md": "---\r\nid: MOD-SYNC-DIAG\r\ntitle: \"Módulo: triple-sync-engine — Suite de 6 Diagramas\"\r\nmodule: \"triple-sync-engine\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"c3\", \"class\", \"sequence\", \"state\", \"activity\", \"erd\"]\r\n---\r\n\r\n# Módulo: triple-sync-engine — Suite de 6 Diagramas\r\n\r\n---\r\n\r\n## 1. Diagrama de Componentes C3 del Módulo\r\n\r\n```mermaid\r\nflowchart LR\r\n  subgraph ModuleSync[\"triple-sync-engine\"]\r\n    compEngine[\"SkillsSyncEngine\"]\r\n    compValidator[\"FrontmatterValidator\"]\r\n  end\r\n\r\n  sourceOpencode[(\".opencode/skills/ (Source of Truth)\")]\r\n  mirrorCopilot[(\".github/skills/ (Mirror 1)\")]\r\n  mirrorAgy[(\".agents/skills/ (Mirror 2)\")]\r\n\r\n  sourceOpencode --> compEngine\r\n  compEngine --> compValidator\r\n  compEngine -->|\"Replicación unidireccional\"| mirrorCopilot\r\n  compEngine -->|\"Replicación unidireccional\"| mirrorAgy\r\n```\r\n\r\n---\r\n\r\n## 2. Diagrama de Clases UML del Módulo\r\n\r\n```mermaid\r\nclassDiagram\r\n  class SkillsSyncEngine {\r\n    +syncAllSkills() SyncReport\r\n    +compareSkill(string name) DiffResult\r\n    +propagateSkill(string name) void\r\n  }\r\n\r\n  class FrontmatterValidator {\r\n    +validateParity(string name) bool\r\n    +extractMetadata(string content) SkillMeta\r\n  }\r\n\r\n  SkillsSyncEngine --> FrontmatterValidator : \"valida antes de replicar\"\r\n```\r\n\r\n---\r\n\r\n## 3. Diagrama de Secuencia de Sincronización Triple\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor User as \"Desarrollador / Agente\"\r\n  participant Sync as \"sync-skills\"\r\n  participant Opencode as \".opencode/ (Source)\"\r\n  participant Copilot as \".github/ (Mirror)\"\r\n  participant Agy as \".agents/ (Mirror)\"\r\n\r\n  User->>Sync: \"Ejecutar sync-skills\"\r\n  Sync->>Opencode: \"Leer 18 skills canónicas\"\r\n  Opencode-->>Sync: \"Contenido y Frontmatter\"\r\n  Sync->>Copilot: \"Propagar a .github/skills/\"\r\n  Sync->>Agy: \"Propagar a .agents/skills/\"\r\n  Sync-->>User: \"Reporte: 18 skills sincronizadas al 100%\"\r\n```\r\n\r\n---\r\n\r\n## 4. Diagrama de Máquina de Estados de una Skill\r\n\r\n```mermaid\r\nstateDiagram-v2\r\n  [*] --> SourceUpdated : \"Edición en .opencode/skills/\"\r\n  SourceUpdated --> VerifyingParity : \"sync-skills analiza diferencias\"\r\n  VerifyingParity --> MirrorsOutdated : \"Diferencia detectada en espejos\"\r\n  MirrorsOutdated --> InSync : \"Replicación a .github/ y .agents/\"\r\n  VerifyingParity --> InSync : \"Espejos idénticos al origen\"\r\n  InSync --> [*]\r\n```\r\n\r\n---\r\n\r\n## 5. Diagrama de Actividades de Sincronización\r\n\r\n```mermaid\r\nflowchart TD\r\n  actStart([\"Inicio sync-skills\"])\r\n  actRead[\"Lee skills en .opencode/\"]\r\n  actLoop[\"Itera sobre cada skill (1 a 18)\"]\r\n  checkDiff{\"Hay diferencia con espejos?\"}\r\n  actCopy[\"Copia hacia .github/ y .agents/\"]\r\n  actReport[\"Genera reporte de paridad\"]\r\n  actEnd([\"Fin: Espejos Homologados\"])\r\n\r\n  actStart --> actRead\r\n  actRead --> actLoop\r\n  actLoop --> checkDiff\r\n  checkDiff -->|Sí| actCopy\r\n  checkDiff -->|No| actLoop\r\n  actCopy --> actLoop\r\n  actLoop --> actReport\r\n  actReport --> actEnd\r\n```\r\n\r\n---\r\n\r\n## 6. Sub-Diagrama Entidad-Relación (ERD)\r\n\r\n```mermaid\r\nerDiagram\r\n  SKILL_SOURCE ||--|| SKILL_MIRROR_COPILOT : \"sincroniza a\"\r\n  SKILL_SOURCE ||--|| SKILL_MIRROR_AGY : \"sincroniza a\"\r\n\r\n  SKILL_SOURCE {\r\n    string name PK\r\n    string description\r\n    string platform\r\n  }\r\n\r\n  SKILL_MIRROR_COPILOT {\r\n    string name PK\r\n    string sync_status\r\n  }\r\n\r\n  SKILL_MIRROR_AGY {\r\n    string name PK\r\n    string sync_status\r\n  }\r\n```\r\n",
    "modules/triple-sync-engine/module-spec.md": "---\r\nid: MOD-SYNC-SPEC\r\ntitle: \"Módulo: triple-sync-engine — Especificación & Tarjetas CRC\"\r\nmodule: \"triple-sync-engine\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"triple-sync\", \"skills-sync\", \"source-of-truth\", \"crc-cards\"]\r\n---\r\n\r\n# Módulo: triple-sync-engine — Especificación & Tarjetas CRC\r\n\r\n> [!NOTE]\r\n> Bounded Context encargado de la sincronización triple y paridad absoluta de las 18 skills entre OpenCode (`.opencode/`), GitHub Copilot (`.github/`) y Google Antigravity (`.agents/`).\r\n\r\n---\r\n\r\n## 1. Alcance y Estado de Cobertura\r\n- **Estado de Cobertura**: `COMPLETAMENTE CUBIERTO`\r\n- **Responsabilidad Primaria**: Asegurar que `.opencode/skills/` se mantenga como la única fuente de verdad inmutable y que cualquier cambio se propague de forma idéntica a los espejos sin divergencia de frontmatter ni instrucciones.\r\n\r\n---\r\n\r\n## 2. Tarjetas CRC del Módulo (Class-Responsibility-Collaborator)\r\n\r\n| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |\r\n|---|---|---|---|\r\n| `SkillsSyncEngine` | `<<SyncService>>` | 1. Leer skills en `.opencode/skills/`.<br/>2. Comparar con `.github/skills/` y `.agents/skills/`.<br/>3. Replicar contenido idéntico sin mutar el origen. | `FileSystem`, `SkillMirrorAuditor` |\r\n| `FrontmatterValidator` | `<<Validator>>` | 1. Parsear bloque YAML `name` y `description`.<br/>2. Comprobar paridad carácter por carácter en los 3 espejos. | `YAMLParser` |\r\n\r\n---\r\n\r\n## 3. Contratos de Entrada y Salida\r\n- **Fuente de Verdad**: `.opencode/skills/{skill}/SKILL.md`\r\n- **Destinos Espejo**: `.github/skills/{skill}/SKILL.md` y `.agents/skills/{skill}/SKILL.md`\r\n",
    "modules/triple-sync-engine/requirements-and-rules.md": "---\r\nid: MOD-SYNC-RULES\r\ntitle: \"Módulo: triple-sync-engine — Requerimientos & Reglas de Negocio\"\r\nmodule: \"triple-sync-engine\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"requirements\", \"rules\", \"triple-sync\", \"source-of-truth\"]\r\n---\r\n\r\n# Módulo: triple-sync-engine — Requerimientos & Reglas de Negocio\r\n\r\n---\r\n\r\n## 1. Requerimientos Funcionales Formales (IEEE 830)\r\n\r\n### `RF-SYNC-001`: Replicación Unidireccional de Skills\r\n- **Enunciado Formal**: Cuando se invoque la skill `sync-skills`, el sistema **debe** verificar cada una de las 18 skills en `.opencode/skills/` y propagar cualquier cambio a `.github/skills/` y `.agents/skills/` sin modificar jamás los archivos de origen.\r\n\r\n---\r\n\r\n## 2. Reglas de Negocio Locales (BR-*)\r\n\r\n| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |\r\n|---|---|---|---|---|\r\n| `BR-SYNC-001` | Crítica | `.opencode/skills/` es la única fuente de verdad | `.opencode/rules/skills-sync.md` | Prohibido sync inverso |\r\n| `BR-SYNC-002` | Alta | `frontmatter(opencode) === frontmatter(copilot) === frontmatter(agy)` | `sync-skills` | Falla paridad triple |\r\n",
    "modules/triple-sync-engine/rules.md": "# Reglas de Negocio Invariantes: triple-sync-engine\r\n\r\n### BR-SYNC-001: Fuente de Verdad Inviolable en .opencode/\r\n- **Severidad**: Crítica\r\n- **Restricción**: Toda skill nueva o modificación de una existente debe crearse o editarse en `.opencode/skills/`. Jamás editar un espejo directamente para luego retro-propagar.\r\n- **Comportamiento ante Violación**: Los cambios en espejos se sobrescriben automáticamente al ejecutar `/sync-skills`.\r\n\r\n### BR-SYNC-002: Paridad Estricta de Frontmatter\r\n- **Severidad**: Alta\r\n- **Restricción**: El bloque YAML inicial (`name` y `description`) debe ser estrictamente idéntico en las tres carpetas.\r\n- **Comportamiento ante Violación**: La skill es marcada como inconsistente en el reporte de sincronización.\r\n",
    "modules/triple-sync-engine/sequence.md": "# Flujo de Sincronización Triple: triple-sync-engine\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor Dev as \"Desarrollador / IA\"\r\n  participant Truth as \".opencode/skills/ (Fuente)\"\r\n  participant MirrorCopilot as \".github/skills/ (Espejo Copilot)\"\r\n  participant MirrorAGY as \".agents/skills/ (Espejo Antigravity)\"\r\n  participant SyncTool as \"Skill sync-skills\"\r\n\r\n  Dev->>Truth: \"Crear o actualizar {skill}/SKILL.md\"\r\n  Dev->>SyncTool: \"Invocar /sync-skills\"\r\n  SyncTool->>Truth: \"Leer archivos y frontmatter\"\r\n  SyncTool->>MirrorCopilot: \"Comparar hash y replicar cambios\"\r\n  SyncTool->>MirrorAGY: \"Comparar hash y replicar cambios\"\r\n  SyncTool-->>Dev: \"Reporte de paridad al 100% (0 diferencias)\"\r\n```\r\n",
    "modules/triple-sync-engine/technical-debt-refactoring.md": "---\r\nid: MOD-SYNC-DEBT\r\ntitle: \"Módulo: triple-sync-engine — Deuda Técnica & Refactorización\"\r\nmodule: \"triple-sync-engine\"\r\nstatus: \"Publicado\"\r\nversion: \"4.0.0\"\r\nlast_updated: \"2026-11-03\"\r\ntags: [\"technical-debt\", \"sync-automation\", \"parity\"]\r\n---\r\n\r\n# Módulo: triple-sync-engine — Deuda Técnica & Refactorización\r\n\r\n---\r\n\r\n## 1. Diagnóstico de Estado y Code Smells\r\n- **Puntos Fuertes**: La regla `BR-SYNC-001` evita discrepancias entre herramientas de IA al forzar `.opencode/skills/` como único origen.\r\n- **Riesgos Mitigados**:\r\n  - Todo cambio en `SKILL.md` se replica de forma triple inmediata en `.opencode/`, `.github/` y `.agents/`.\r\n",
    "system-capabilities.md": "# Inventario de Capacidades del Sistema (System Capabilities)\r\n\r\n> [!NOTE]\r\n> Inventario exhaustivo de capacidades para acelerar el onboarding técnico y prevenir la duplicación o re-implementación innecesaria de funcionalidades existentes.\r\n\r\n---\r\n\r\n## Matriz de Capacidades Instaladas\r\n\r\n| ID Capacidad | Módulo | Capacidad Funcional | Interfaz / Comando | Estado |\r\n| :--- | :--- | :--- | :--- | :--- |\r\n| `CAP-ORCH-001` | `agent-orchestrator` | Control estricto de ramas `{type}/INT-{id}/{name}` $\\le 80$c | Git hooks / Rules | Operativo [ACTIVO] |\r\n| `CAP-ORCH-002` | `agent-orchestrator` | Puerta de aprobación humana del spec | `ask_question` | Operativo [ACTIVO] |\r\n| `CAP-ORCH-003` | `agent-orchestrator` | Auditoría imparcial de calidad sin editar código | Subagente `reviewer` | Operativo [ACTIVO] |\r\n| `CAP-SYNC-001` | `triple-sync-engine` | Auditoría de paridad de skills en 3 plataformas | Skill `/sync-skills` | Operativo [ACTIVO] |\r\n| `CAP-SYNC-002` | `triple-sync-engine` | Replicación automática de skills a espejos | `sync-skills.sh` / Script | Operativo [ACTIVO] |\r\n| `CAP-KNOW-001` | `knowledge-engine` | Descubrimiento en 2 fases anti-context overflow | Skill `/project-knowledge` | Operativo [ACTIVO] |\r\n| `CAP-KNOW-002` | `knowledge-engine` | Modelado C4 & UML en Mermaid estricto | Plantillas canónicas | Operativo [ACTIVO] |\r\n| `CAP-KNOW-003` | `knowledge-engine` | Mantenimiento Docs-as-Code incremental | `project-docs/knowledge/` | Operativo [ACTIVO] |\r\n| `CAP-DASH-001` | `dashboard-visualizer` | Biblioteca por estantes con tarjeta Hero | `KnowledgeBase.js` | Operativo [ACTIVO] |\r\n| `CAP-DASH-002` | `dashboard-visualizer` | Lector editorial centrado 780px con TOC flotante | `MarkdownViewer.js` | Operativo [ACTIVO] |\r\n| `CAP-DASH-003` | `dashboard-visualizer` | Editor Dual ContextForge con scroll sincronizado | `KnowledgeBase.js` | Operativo [ACTIVO] |\r\n| `CAP-DASH-004` | `dashboard-visualizer` | Constelación 3D piramidal de 4 niveles | `SpaceView3D.js` | Operativo [ACTIVO] |\r\n| `CAP-DASH-005` | `dashboard-visualizer` | Búsqueda Global Omnibox modal (`Ctrl+K`) | `main.js` | Operativo [ACTIVO] |\r\n| `CAP-DASH-006` | `dashboard-visualizer` | Compatibilidad 100% offline (file:///) | `data-fallback.js` | Operativo [ACTIVO] |\r\n| `CAP-TEST-001` | `testing-qa-suite` | Pruebas unitarias nativas ultrarrápidas (<200ms) | `npm test` | Operativo [ACTIVO] |\r\n| `CAP-TEST-002` | `testing-qa-suite` | Pruebas smoke de evaluación web | `npm run test:e2e` | Operativo [ACTIVO] |\r\n| `CAP-TEST-003` | `testing-qa-suite` | Verificación de paridad y sincronización | `npm run sync` | Operativo [ACTIVO] |\r\n",
    "traceability-matrix.md": "# Matriz de Trazabilidad Cruzada (RTM)\r\n\r\n> [!NOTE]\r\n> Matriz de Trazabilidad de Requerimientos (RTM) que conecta requerimientos funcionales, reglas de negocio, historias de usuario, componentes de código y pruebas automatizadas.\r\n\r\n---\r\n\r\n## Matriz Bidireccional de Cobertura\r\n\r\n| Requerimiento Funcional | Regla de Negocio (`BR-*`) | Historia de Usuario | Componente / Archivo | Test Automatizado |\r\n| :--- | :--- | :--- | :--- | :--- |\r\n| `RF-ORCH-001` | `BR-ORCH-001` | `US-001` | `.agents/rules/antigravity-harness.md` | `tests/unit/branching-rules.test.js` |\r\n| `RF-ORCH-002` | `BR-ORCH-002` | `US-001` | `.agents/agents/leader.md` | `tests/unit/branching-rules.test.js` |\r\n| `RF-ORCH-003` | `BR-ORCH-002` | `US-001` | `.agents/rules/antigravity-harness.md` | Proceso interactivo (`ask_question`) |\r\n| `RF-ORCH-004` | `BR-ORCH-003` | `US-001` | `.agents/agents/reviewer.md` | Auditoría en `review_*.md` |\r\n| `RF-SYNC-001` | `BR-SYNC-001` | `US-002` | `.opencode/skills/sync-skills/` | `/sync-skills` audit report |\r\n| `RF-SYNC-002` | `BR-SYNC-002` | `US-002` | `.agents/skills/sync-skills/` | `SKILL.md` frontmatter check |\r\n| `RF-KNOW-001` | `BR-KNOW-002` | `US-003` | `.agents/skills/project-knowledge/` | `project-docs/knowledge/` scan |\r\n| `RF-KNOW-002` | `BR-KNOW-001` | `US-003` | `project-docs/knowledge/c4-model.md` | Mermaid Parser Validation |\r\n| `RF-DASH-001` | `BR-DASH-001` | `US-003` | `src/features/knowledge-base/` | `tests/unit/sync-data.test.js` |\r\n| `RF-DASH-002` | `BR-DASH-001` | `US-003` | `src/shared/MarkdownViewer.js` | `tests/unit/markdown-parser.test.js` |\r\n| `RF-DASH-003` | `BR-DASH-002` | `US-003` | `src/features/knowledge-base/` | `tests/unit/markdown-parser.test.js` |\r\n| `RF-DASH-004` | `BR-DASH-001` | `US-004` | `src/main.js` (Omnibox Modal) | `tests/e2e/dashboard-smoke.test.js` |\r\n| `RF-DASH-005` | `BR-DASH-001` | `US-003` | `src/features/space-view-3d/` | `tests/e2e/dashboard-smoke.test.js` |\r\n| `RF-TEST-001` | `BR-TEST-002` | `US-005` | `package.json` (`npm test`) | `tests/unit/*.test.js` |\r\n| `RF-TEST-002` | `BR-TEST-001` | `US-005` | `tests/e2e/dashboard-smoke.test.js` | `npm run test:e2e` |\r\n",
    "uml-diagrams.md": "# Diagramas UML — AI Agentic SDD Engineering Harness\r\n\r\n---\r\n\r\n## 1. Diagrama de Clases del Dominio SDD\r\n\r\nMuestra las entidades, value objects y relaciones del modelo conceptual del arnés:\r\n\r\n```mermaid\r\nclassDiagram\r\n  class Feature {\r\n    +int id\r\n    +string type\r\n    +string name\r\n    +string title\r\n    +string description\r\n    +string module\r\n    +string priority\r\n    +string branch\r\n    +string status\r\n    +List~string~ acceptance\r\n    +markCompleted()\r\n  }\r\n\r\n  class Subagent {\r\n    +string name\r\n    +string role\r\n    +List~string~ tools\r\n    +executeTask(Task task)\r\n  }\r\n\r\n  class KnowledgeDocument {\r\n    +string key\r\n    +string filename\r\n    +string title\r\n    +string shelf\r\n    +int readingTime\r\n    +int wordCount\r\n    +int ruleCount\r\n    +extractTOC() List~Heading~\r\n  }\r\n\r\n  class BusinessRule {\r\n    +string id\r\n    +string title\r\n    +string module\r\n    +string severity\r\n    +string description\r\n    +validate() bool\r\n  }\r\n\r\n  class ArchitecturalDecisionRecord {\r\n    +string id\r\n    +string title\r\n    +string status\r\n    +string context\r\n    +string decision\r\n    +string consequences\r\n  }\r\n\r\n  Feature \"1\" --> \"*\" BusinessRule : \"satisface\"\r\n  Feature \"1\" --> \"1\" Subagent : \"asignada a\"\r\n  KnowledgeDocument \"*\" --> \"*\" BusinessRule : \"documenta\"\r\n  KnowledgeDocument \"*\" --> \"*\" ArchitecturalDecisionRecord : \"registra\"\r\n```\r\n\r\n---\r\n\r\n## 2. Diagrama de Secuencia: Ciclo de Vida Completo SDD\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor User as \"Usuario (Humano)\"\r\n  participant Leader as \"Leader Agent\"\r\n  participant Git as \"Git System\"\r\n  participant SpecAuthor as \"Spec-Author\"\r\n  participant Implementer as \"Implementer\"\r\n  participant Reviewer as \"Reviewer\"\r\n\r\n  User->>Leader: \"Iniciar tarea INT-001\"\r\n  Leader->>Git: \"git checkout -b feature/INT-001/{name}\"\r\n  Leader->>SpecAuthor: \"Redactar requerimientos y tasks\"\r\n  SpecAuthor-->>Leader: \"specs/001/ completado (spec_ready)\"\r\n  Leader->>User: \"ask_question: Aprobar spec al 100%?\"\r\n  alt Spec Aprobado\r\n    User-->>Leader: \"Aprobado (in_progress)\"\r\n    Leader->>Implementer: \"Implementar código y tests\"\r\n    Implementer->>Implementer: \"Ejecutar checks.test y checks.build\"\r\n    Implementer-->>Leader: \"Trazabilidad R<->Tests completa\"\r\n    Leader->>Reviewer: \"Auditar calidad y consistencia\"\r\n    alt Reviewer Aprueba\r\n      Reviewer-->>Leader: \"APROBADO (0 errores)\"\r\n      Leader->>User: \"ask_question: Integrar a rama base?\"\r\n    else Reviewer Rechaza\r\n      Reviewer-->>Leader: \"RECHAZADO (hallazgos)\"\r\n      Leader->>Implementer: \"Corregir observaciones\"\r\n    end\r\n  else Spec Rechazado\r\n    User-->>Leader: \"Rechazar o solicitar cambios\"\r\n    Leader->>SpecAuthor: \"Ajustar especificación\"\r\n  end\r\n```\r\n\r\n---\r\n\r\n## 3. Diagrama de Secuencia: Editor Dual ContextForge con Scroll Sincronizado\r\n\r\n```mermaid\r\nsequenceDiagram\r\n  autonumber\r\n  actor User as \"Desarrollador\"\r\n  participant UI as \"Tablero Web (main.js)\"\r\n  participant Textarea as \"Panel Editor Markdown\"\r\n  participant Preview as \"Panel Live Preview\"\r\n  participant Blocks as \"Panel Bloques Visuales\"\r\n  participant Storage as \"sync-data.js / data-fallback.js\"\r\n\r\n  User->>UI: \"Pulsar [ Modo Editor ]\"\r\n  UI->>Textarea: \"Cargar markdown actual\"\r\n  UI->>Preview: \"renderMarkdown(content)\"\r\n  \r\n  alt Usuario edita en Textarea (Markdown)\r\n    User->>Textarea: \"Escribir texto y hacer scroll\"\r\n    Textarea->>Preview: \"Sincronizar scroll proporcionalmente (isScrollingFromEditor)\"\r\n    Textarea->>Preview: \"Actualizar HTML en vivo\"\r\n  else Usuario conmuta a [ Modo Bloques ]\r\n    User->>UI: \"Pulsar [ Modo Bloques Visuales ]\"\r\n    UI->>Blocks: \"parseMarkdownToBlocks(markdown)\"\r\n    Blocks-->>User: \"Renderizar tarjetas interactivas (H1, BR, Callouts)\"\r\n    User->>Blocks: \"Reordenar bloques o añadir bloque\"\r\n    Blocks->>Textarea: \"blocksToMarkdown(blocks)\"\r\n    Blocks->>Preview: \"Actualizar previsualización en vivo\"\r\n  end\r\n\r\n  User->>UI: \"Pulsar [ Guardar Cambios ]\"\r\n  UI->>Storage: \"store.saveDoc(key, content) + sync-data.js\"\r\n  Storage-->>User: \"Documento persistido local y offline\"\r\n```\r\n\r\n---\r\n\r\n## 4. Diagrama de Casos de Uso del Arnés SDD\r\n\r\n```mermaid\r\nflowchart TD\r\n  actorDev[\"Desarrollador\"]\r\n  actorAgent[\"Agente de IA\"]\r\n\r\n  subgraph UseCases[\"Casos de Uso del Arnés de Ingeniería\"]\r\n    ucAudit[\"Auditar Stack Técnico (/technical-audit)\"]\r\n    ucKnowledge[\"Extraer Base de Conocimiento (/project-knowledge)\"]\r\n    ucSpec[\"Redactar Requerimientos EARS (/generate-spec)\"]\r\n    ucHumanGate[\"Aprobar Puerta Humana (ask_question)\"]\r\n    ucImplement[\"Implementar Código & Tests (/implement)\"]\r\n    ucReview[\"Auditar Calidad & Trazabilidad (/review)\"]\r\n    ucViewDash[\"Navegar Tablero & Constelación 3D\"]\r\n    ucOmnibox[\"Búsqueda Global Omnibox (Ctrl+K)\"]\r\n    ucEditDual[\"Edición Dual Markdown / Bloques\"]\r\n  end\r\n\r\n  actorDev --> ucAudit\r\n  actorDev --> ucKnowledge\r\n  actorDev --> ucHumanGate\r\n  actorDev --> ucViewDash\r\n  actorDev --> ucOmnibox\r\n  actorDev --> ucEditDual\r\n\r\n  actorAgent --> ucSpec\r\n  actorAgent --> ucImplement\r\n  actorAgent --> ucReview\r\n  actorAgent --> ucKnowledge\r\n```\r\n",
    "user-stories-catalog.md": "# Catálogo de Historias de Usuario (INVEST, Scrum & XP)\r\n\r\n> [!NOTE]\r\n> Catálogo de Historias de Usuario bajo principios INVEST, Acuerdos de Calidad Scrum (DoR/DoD) y Prácticas Técnicas de Extreme Programming (XP).\r\n\r\n---\r\n\r\n## 1. Acuerdos de Calidad del Equipo\r\n\r\n### Definition of Ready (DoR) — Criterios para iniciar una Feature\r\n- [ ] La feature cuenta con nombre descriptivo en `snake_case` y rama `{type}/INT-{id}/{name}` $\\le 80$ caracteres.\r\n- [ ] Especificación técnica redactada por `spec-author` en `project-docs/specs/{NNN}_{name}/` con requerimientos EARS, ADRs y checklist de tasks.\r\n- [ ] Criterios de aceptación redactados en formato Given / When / Then (Gherkin).\r\n- [ ] **Puerta Humana aprobada al 100%** mediante la herramienta `ask_question`.\r\n\r\n### Definition of Done (DoD) — Criterios para cerrar una Feature\r\n- [ ] Código de producción implementado y limpio según estándares de arquitectura.\r\n- [ ] 100% de las pruebas automatizadas pasando en verde (`npm test`, `checks.test`).\r\n- [ ] Tabla de trazabilidad $R \\leftrightarrow \\text{Tests}$ documentada en `progress/impl_{name}.md`.\r\n- [ ] Auditoría independiente del subagente `reviewer` con veredicto **APROBADO** en `progress/review_{name}.md`.\r\n- [ ] Datos sincronizados en el tablero con `node project-docs/sync-data.js`.\r\n- [ ] Commit semántico creado en la rama de trabajo.\r\n\r\n---\r\n\r\n## 2. Historias de Usuario (INVEST)\r\n\r\n### US-001: Orquestación Multi-Agente con Puertas Humanas\r\n- **Como** líder de ingeniería de software,\r\n- **Quiero** que el arnés coordine agentes especializados (`leader`, `spec-author`, `implementer`, `reviewer`) con pausas obligatorias `ask_question`,\r\n- **Para** asegurar que ninguna línea de código se escriba sin spec aprobado ni se fusione sin revisión independiente de calidad.\r\n- **Criterios de Aceptación (Gherkin)**:\r\n  - *Dado* que se inicia una nueva tarea `INT-001`,\r\n  - *Cuando* el subagente `spec-author` termina los requerimientos,\r\n  - *Entonces* el sistema se detiene y solicita aprobación explícita al usuario humano antes de invocar al `implementer`.\r\n\r\n### US-002: Sincronización Triple de Skills\r\n- **Como** desarrollador políglota de IA (Google Antigravity, OpenCode, Copilot),\r\n- **Quiero** que cualquier cambio en `.opencode/skills/` se replique automáticamente a `.github/` y `.agents/`,\r\n- **Para** contar con las mismas 18 capacidades de ingeniería sin importar la herramienta de IA que utilice.\r\n- **Criterios de Aceptación (Gherkin)**:\r\n  - *Dado* que se crea una nueva skill en `.opencode/skills/`,\r\n  - *Cuando* se ejecuta `/sync-skills`,\r\n  - *Entonces* se crean copias idénticas en `.github/skills/` y `.agents/skills/` con paridad total de frontmatter.\r\n\r\n### US-003: Biblioteca Editorial con Lector ContextForge y Editor Dual\r\n- **Como** arquitecto de sistemas,\r\n- **Quiero** una interfaz web con biblioteca por estantes temáticos, columna de lectura de 780px y editor dual Markdown/Bloques,\r\n- **Para** consultar y editar la documentación técnica del arnés con alta legibilidad y scroll sincronizado.\r\n- **Criterios de Aceptación (Gherkin)**:\r\n  - *Dado* que abro `project-docs/index.html` en el navegador,\r\n  - *Cuando* selecciono un documento de arquitectura,\r\n  - *Entonces* se visualiza en formato editorial con TOC lateral y al pulsar `Modo Editor` puedo editar directamente en bloques visuales o Markdown.\r\n\r\n### US-004: Búsqueda Global Omnibox con Atajo Ctrl+K\r\n- **Como** usuario del tablero,\r\n- **Quiero** abrir un buscador modal omnibox presionando `Ctrl+K` o `Cmd+K`,\r\n- **Para** localizar en milisegundos tareas (`INT-*`), documentos de arquitectura, reglas de negocio (`BR-*`) o módulos.\r\n- **Criterios de Aceptación (Gherkin)**:\r\n  - *Dado* que estoy en cualquier pestaña del tablero,\r\n  - *Cuando* presiono `Ctrl+K`,\r\n  - *Entonces* se abre el modal Omnibox permitiendo navegación por teclado y selección inmediata de resultados.\r\n\r\n### US-005: Suite de Pruebas Automatizadas Nativas\r\n- **Como** ingeniero de QA,\r\n- **Quiero** ejecutar pruebas unitarias y de aceptación con `npm test` sin dependencias externas pesadas,\r\n- **Para** verificar la integridad del arnés en menos de 500ms en entornos locales y pipelines CI/CD.\r\n- **Criterios de Aceptación (Gherkin)**:\r\n  - *Dado* que ejecuto `npm test`,\r\n  - *Cuando* se evalúan los tests de serialización, lectura y reglas de ramas,\r\n  - *Entonces* el 100% de las aserciones pasan en verde sin advertencias.\r\n"
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
      "lastModified": "2026-11-07",
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
    "03-capabilities-and-features.md": {
      "key": "03-capabilities-and-features.md",
      "filename": "03-capabilities-and-features.md",
      "title": "Catálogo Exhaustivo de Capacidades, Features y Desglose Funcional",
      "summary": "mindmap",
      "shelf": "general",
      "readingTime": 10,
      "wordCount": 1989,
      "lastModified": "2026-11-07",
      "ruleCount": 0,
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
      "lastModified": "2026-11-07",
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
      "lastModified": "2026-11-07",
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
      "lastModified": "2026-11-07",
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
      "lastModified": "2026-11-07",
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
      "readingTime": 9,
      "wordCount": 1709,
      "lastModified": "2026-11-07",
      "ruleCount": 17,
      "reqCount": 15,
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
      "readingTime": 3,
      "wordCount": 437,
      "lastModified": "2026-11-07",
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
      "readingTime": 3,
      "wordCount": 556,
      "lastModified": "2026-11-07",
      "ruleCount": 4,
      "reqCount": 3,
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
      "lastModified": "2026-11-07",
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
      "lastModified": "2026-11-07",
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
      "lastModified": "2026-11-07",
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
      "lastModified": "2026-11-07",
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
      "lastModified": "2026-11-07",
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
          "readingTime": 3,
          "wordCount": 437,
          "lastModified": "2026-11-07",
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
          "readingTime": 3,
          "wordCount": 556,
          "lastModified": "2026-11-07",
          "ruleCount": 4,
          "reqCount": 3,
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
          "lastModified": "2026-11-07",
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
          "lastModified": "2026-11-07",
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
          "lastModified": "2026-11-07",
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
          "lastModified": "2026-11-07",
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
},
  planeData: {
  "workspace": {
    "id": "ws-harness",
    "name": "Harness Engineering Workspace",
    "slug": "harness-engineering",
    "created_at": "2026-11-07 15:48:41"
  },
  "project": {
    "id": "proj-harness",
    "workspace_id": "ws-harness",
    "name": "Arnés de Ingeniería SDD Multi-Agente",
    "slug": "harness-sdd",
    "description": "Plataforma integral de ingeniería dirigida por specs con soporte multi-agente y gestión ágil",
    "created_at": "2026-11-07 15:48:41"
  },
  "states": [
    {
      "id": "state-backlog",
      "project_id": "proj-harness",
      "name": "Backlog",
      "color": "#71717a",
      "sequence": 10,
      "group_name": "backlog"
    },
    {
      "id": "state-todo",
      "project_id": "proj-harness",
      "name": "Todo",
      "color": "#3b82f6",
      "sequence": 20,
      "group_name": "unstarted"
    },
    {
      "id": "state-in-progress",
      "project_id": "proj-harness",
      "name": "In Progress",
      "color": "#eab308",
      "sequence": 30,
      "group_name": "started"
    },
    {
      "id": "state-in-review",
      "project_id": "proj-harness",
      "name": "In Review",
      "color": "#a855f7",
      "sequence": 40,
      "group_name": "review"
    },
    {
      "id": "state-done",
      "project_id": "proj-harness",
      "name": "Done",
      "color": "#22c55e",
      "sequence": 50,
      "group_name": "completed"
    },
    {
      "id": "state-cancelled",
      "project_id": "proj-harness",
      "name": "Cancelled",
      "color": "#ef4444",
      "sequence": 60,
      "group_name": "cancelled"
    }
  ],
  "cycles": [
    {
      "id": "cycle-1",
      "project_id": "proj-harness",
      "name": "Ciclo 1: Fundacional (Harness Core)",
      "description": "Arquitectura base, sincronización de skills y tablero visual",
      "start_date": "2026-10-15",
      "end_date": "2026-10-31",
      "status": "completed",
      "created_at": "2026-11-07 15:48:41"
    },
    {
      "id": "cycle-2",
      "project_id": "proj-harness",
      "name": "Ciclo 2: Calidad, DeepWiki & Encapsulamiento",
      "description": "Testing multinivel, Playwright E2E y pureza de raíz",
      "start_date": "2026-11-01",
      "end_date": "2026-11-06",
      "status": "completed",
      "created_at": "2026-11-07 15:48:41"
    },
    {
      "id": "cycle-3",
      "project_id": "proj-harness",
      "name": "Ciclo 3: Plane Multi-Vista & SQLite para IA",
      "description": "Replicación UX Plane, persistencia SQLite y soporte espejo Markdown",
      "start_date": "2026-11-07",
      "end_date": "2026-11-20",
      "status": "active",
      "created_at": "2026-11-07 15:48:41"
    }
  ],
  "modules": [
    {
      "id": "mod-orchestrator",
      "project_id": "proj-harness",
      "name": "Agent Orchestrator",
      "description": "Orquestación de agentes autónomos, roles y reglas de branching",
      "lead_role": "leader",
      "status": "completed",
      "created_at": "2026-11-07 15:48:41"
    },
    {
      "id": "mod-visualizer",
      "project_id": "proj-harness",
      "name": "Dashboard Visualizer",
      "description": "Tablero visual, vistas Plane, grafos de dependencias y 3D",
      "lead_role": "implementer",
      "status": "in_progress",
      "created_at": "2026-11-07 15:48:41"
    },
    {
      "id": "mod-core",
      "project_id": "proj-harness",
      "name": "Harness Core",
      "description": "Scripts verify.sh, configuraciones y reglas del arnés",
      "lead_role": "leader",
      "status": "completed",
      "created_at": "2026-11-07 15:48:41"
    },
    {
      "id": "mod-knowledge",
      "project_id": "proj-harness",
      "name": "Knowledge Engine",
      "description": "Base de conocimiento Docs-as-Code soberana y DeepWiki",
      "lead_role": "spec-author",
      "status": "completed",
      "created_at": "2026-11-07 15:48:41"
    },
    {
      "id": "mod-qa",
      "project_id": "proj-harness",
      "name": "Testing QA Suite",
      "description": "Verificación multinivel en 9 fases, Playwright E2E y suites de prueba",
      "lead_role": "reviewer",
      "status": "completed",
      "created_at": "2026-11-07 15:48:41"
    }
  ],
  "issues": [
    {
      "id": "INT-001",
      "project_id": "proj-harness",
      "sequence_id": 1,
      "title": "Refactorización Integral y Desacoplamiento Agnóstico del Arnés",
      "description": "Auditoría real del repositorio, saneamiento de mocks e-commerce residuales, desacoplamiento universal de subagentes y configuración de tests automatizados.",
      "state_id": "state-done",
      "priority": "urgent",
      "assignee_role": "implementer",
      "cycle_id": "cycle-1",
      "module_id": "mod-orchestrator",
      "spec_folder": "project-docs/specs/001_refactor_harness_architecture",
      "branch": "feature/INT-001/refactor_harness_architecture",
      "user_story_as_a": "Arquitecto de Software",
      "user_story_i_want": "desacoplar el arnés de cualquier stack específico y purgar mocks residuales",
      "user_story_so_that": "el sistema funcione universalmente con Node, .NET, Python, Go o cualquier tecnología",
      "acceptance_criteria": "[\"project-spec.yaml y project-spec.json representan fielmente el arnés de IA sin mocks e-commerce\",\"Los subagentes implementer y reviewer son agnósticos al stack y leen checks de compilación/tests\",\"package.json y suite de tests unitarios están configurados y pasando en verde\",\"El tablero project-docs/ sincroniza en tiempo real los datos reales en modo offline y HTTP\"]",
      "evidence_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
      "created_at": "2026-11-07 15:48:41",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 1: Fundacional (Harness Core)",
      "module_name": "Agent Orchestrator",
      "subtasks": [
        {
          "id": "INT-001-DEV",
          "issue_id": "INT-001",
          "type": "development",
          "title": "Desacoplamiento de subagentes y saneamiento de mocks",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-001-QA",
          "issue_id": "INT-001",
          "type": "qa",
          "title": "Validación de contratos agnósticos y ejecución de tests unitarios",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "project-spec.yaml y project-spec.json representan fielmente el arnés de IA sin mocks e-commerce",
        "Los subagentes implementer y reviewer son agnósticos al stack y leen checks de compilación/tests",
        "package.json y suite de tests unitarios están configurados y pasando en verde",
        "El tablero project-docs/ sincroniza en tiempo real los datos reales en modo offline y HTTP"
      ]
    },
    {
      "id": "INT-002",
      "project_id": "proj-harness",
      "sequence_id": 2,
      "title": "Motor de Sincronización Triple de Skills",
      "description": "Mecanismo de replicación y paridad entre .opencode/skills/ (fuente de verdad), .github/skills/ y .agents/skills/.",
      "state_id": "state-done",
      "priority": "urgent",
      "assignee_role": "implementer",
      "cycle_id": "cycle-1",
      "module_id": "mod-core",
      "spec_folder": "project-docs/specs/002_triple_mirror_skills_sync",
      "branch": "feature/INT-002/triple_mirror_skills_sync",
      "user_story_as_a": "Líder Técnico",
      "user_story_i_want": "sincronizar automáticamente las skills en opencode, GitHub Copilot y Antigravity",
      "user_story_so_that": "cualquier agente de IA opere con las mismas capacidades sin divergencias",
      "acceptance_criteria": "[\"18 skills homologadas en .opencode/skills/ replicadas exactamente a .github/ y .agents/\",\"Frontmatter name y description idénticos en los 3 espejos\",\"Skill sync-skills disponible para auditoría de discrepancias\"]",
      "evidence_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
      "created_at": "2026-11-07 15:48:41",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 1: Fundacional (Harness Core)",
      "module_name": "Harness Core",
      "subtasks": [
        {
          "id": "INT-002-DEV",
          "issue_id": "INT-002",
          "type": "development",
          "title": "Implementación del motor triple de sincronización y skill sync-skills",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-002-QA",
          "issue_id": "INT-002",
          "type": "qa",
          "title": "Auditoría de paridad en frontmatter y contenido en los 3 espejos",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "18 skills homologadas en .opencode/skills/ replicadas exactamente a .github/ y .agents/",
        "Frontmatter name y description idénticos en los 3 espejos",
        "Skill sync-skills disponible para auditoría de discrepancias"
      ]
    },
    {
      "id": "INT-003",
      "project_id": "proj-harness",
      "sequence_id": 3,
      "title": "Motor de Base de Conocimiento Anti-Sesgo y Protocolo de Descubrimiento",
      "description": "Protocolo de elicitación profunda en 2 fases con C4, UML, ERD, diccionario de datos, reglas BR-* y ADRs.",
      "state_id": "state-done",
      "priority": "urgent",
      "assignee_role": "implementer",
      "cycle_id": "cycle-1",
      "module_id": "mod-knowledge",
      "spec_folder": "project-docs/specs/003_knowledge_base_dynamic_engine",
      "branch": "feature/INT-003/knowledge_base_dynamic_engine",
      "user_story_as_a": "Ingeniero de Contexto",
      "user_story_i_want": "extraer una base de conocimiento soberana con C4, UML, ERD y reglas BR-*",
      "user_story_so_that": "los agentes no sufran de ceguera de contexto ni alucinen librerías",
      "acceptance_criteria": "[\"Escaneo de topología en Fase 1 sin saturación de tokens\",\"Documentación profunda por módulo en Fase 2\",\"Catálogo de reglas de negocio BR-* e invariantes de dominio indexadas\"]",
      "evidence_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
      "created_at": "2026-11-07 15:48:41",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 1: Fundacional (Harness Core)",
      "module_name": "Knowledge Engine",
      "subtasks": [
        {
          "id": "INT-003-DEV",
          "issue_id": "INT-003",
          "type": "development",
          "title": "Motor de elicitación profunda en 2 fases y catálogo BR-*",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-003-QA",
          "issue_id": "INT-003",
          "type": "qa",
          "title": "Validación de consistencia en diagramas Mermaid y zero-bias",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "Escaneo de topología en Fase 1 sin saturación de tokens",
        "Documentación profunda por módulo en Fase 2",
        "Catálogo de reglas de negocio BR-* e invariantes de dominio indexadas"
      ]
    },
    {
      "id": "INT-004",
      "project_id": "proj-harness",
      "sequence_id": 4,
      "title": "Tablero Editorial Vectorial con Lector ContextForge, Editor Dual y Zero-Emojis",
      "description": "Interfaz visual con Tailwind CSS v4, iconografia SVG accesible (0 emojis), tabla tecnica de stack, columna de lectura 780px, scrollspy TOC y editor dual Markdown/Bloques.",
      "state_id": "state-done",
      "priority": "urgent",
      "assignee_role": "implementer",
      "cycle_id": "cycle-1",
      "module_id": "mod-visualizer",
      "spec_folder": "project-docs/specs/004_dashboard_editorial_dual_editor",
      "branch": "feature/INT-004/refactor_frontend_zero_emojis_atdd",
      "user_story_as_a": "Usuario y Desarrollador",
      "user_story_i_want": "un tablero visual moderno sin emojis, con lector editorial y editor dual ContextForge",
      "user_story_so_that": "la lectura y edición técnica sea fluida y profesional",
      "acceptance_criteria": "[\"Biblioteca organizada por estantes temáticos con tarjeta Hero destacada\",\"Lector de artículos con ancho centrado a 780px e interlineado 1.75em\",\"Editor dual ContextForge con soporte de bloques visuales y scroll sincronizado proporcional\",\"Erradicacion 100% de emojis con iconografia SVG accesible y suite ATDD en verde\",\"Seccion de Stack Tecnologico compacta y estructurada en tabla tecnica\"]",
      "evidence_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
      "created_at": "2026-11-07 15:48:41",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 1: Fundacional (Harness Core)",
      "module_name": "Dashboard Visualizer",
      "subtasks": [
        {
          "id": "INT-004-DEV",
          "issue_id": "INT-004",
          "type": "development",
          "title": "Componentes Vanilla JS con Tailwind v4, lector centrado y editor dual",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-004-QA",
          "issue_id": "INT-004",
          "type": "qa",
          "title": "Suites ATDD y pruebas de accesibilidad con 0 emojis",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "Biblioteca organizada por estantes temáticos con tarjeta Hero destacada",
        "Lector de artículos con ancho centrado a 780px e interlineado 1.75em",
        "Editor dual ContextForge con soporte de bloques visuales y scroll sincronizado proporcional",
        "Erradicacion 100% de emojis con iconografia SVG accesible y suite ATDD en verde",
        "Seccion de Stack Tecnologico compacta y estructurada en tabla tecnica"
      ]
    },
    {
      "id": "INT-005",
      "project_id": "proj-harness",
      "sequence_id": 5,
      "title": "Constelación 3D en Jerarquía Piramidal Three.js",
      "description": "Visualización 3D espacial estructurada en 4 niveles arquitectónicos con anillos translúcidos y flujo de energía Bezier.",
      "state_id": "state-done",
      "priority": "high",
      "assignee_role": "implementer",
      "cycle_id": "cycle-1",
      "module_id": "mod-visualizer",
      "spec_folder": "project-docs/specs/005_pyramidal_3d_constellation",
      "branch": "feature/INT-005/pyramidal_3d_constellation",
      "user_story_as_a": "Líder de Proyecto",
      "user_story_i_want": "visualizar la arquitectura en una constelación 3D piramidal con Three.js",
      "user_story_so_that": "la comprensión espacial del sistema sea intuitiva e interactiva",
      "acceptance_criteria": "[\"4 niveles piramidales Y=+165 (Ápice), Y=+55 (Core), Y=-55 (Features), Y=-165 (Base)\",\"Distribución radial armónica para evitar colisión de etiquetas\",\"Curvas cuadráticas de Bezier y ciclo de vida mount/unmount sin memory leaks\"]",
      "evidence_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
      "created_at": "2026-11-07 15:48:41",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 1: Fundacional (Harness Core)",
      "module_name": "Dashboard Visualizer",
      "subtasks": [
        {
          "id": "INT-005-DEV",
          "issue_id": "INT-005",
          "type": "development",
          "title": "Renderizado 3D de 4 niveles con curvas Bezier",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-005-QA",
          "issue_id": "INT-005",
          "type": "qa",
          "title": "Pruebas de ciclo de vida mount/unmount y ausencia de memory leaks",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "4 niveles piramidales Y=+165 (Ápice), Y=+55 (Core), Y=-55 (Features), Y=-165 (Base)",
        "Distribución radial armónica para evitar colisión de etiquetas",
        "Curvas cuadráticas de Bezier y ciclo de vida mount/unmount sin memory leaks"
      ]
    },
    {
      "id": "INT-006",
      "project_id": "proj-harness",
      "sequence_id": 6,
      "title": "Búsqueda Global Omnibox con Atajo de Teclado",
      "description": "Buscador omnibox modal (Ctrl+K / Cmd+K) con filtrado reactivo de tareas, documentos, reglas y módulos.",
      "state_id": "state-done",
      "priority": "high",
      "assignee_role": "implementer",
      "cycle_id": "cycle-1",
      "module_id": "mod-visualizer",
      "spec_folder": "project-docs/specs/006_omnibox_global_search",
      "branch": "feature/INT-006/omnibox_global_search",
      "user_story_as_a": "Desarrollador",
      "user_story_i_want": "un buscador omnibox global con atajo Ctrl+K",
      "user_story_so_that": "pueda navegar instantáneamente a cualquier tarea, regla o documento",
      "acceptance_criteria": "[\"Apertura inmediata con Ctrl+K o Cmd+K desde cualquier sección\",\"Indexación simultánea de tareas, documentos, reglas BR-* y bounded contexts\",\"Navegación fluida por teclado (Up, Down, Enter, Escape)\"]",
      "evidence_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
      "created_at": "2026-11-07 15:48:41",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 1: Fundacional (Harness Core)",
      "module_name": "Dashboard Visualizer",
      "subtasks": [
        {
          "id": "INT-006-DEV",
          "issue_id": "INT-006",
          "type": "development",
          "title": "Modal Omnibox con indexación en memoria y atajos de teclado",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-006-QA",
          "issue_id": "INT-006",
          "type": "qa",
          "title": "Pruebas E2E de apertura, filtrado y navegación con teclado",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "Apertura inmediata con Ctrl+K o Cmd+K desde cualquier sección",
        "Indexación simultánea de tareas, documentos, reglas BR-* y bounded contexts",
        "Navegación fluida por teclado (Up, Down, Enter, Escape)"
      ]
    },
    {
      "id": "INT-007",
      "project_id": "proj-harness",
      "sequence_id": 7,
      "title": "Suite de Pruebas Unitarias para Motores del Arnés",
      "description": "Pruebas automatizadas con Node.js Test Runner para sync-data.js, serializadores de markdown, TOC y reglas de branching.",
      "state_id": "state-done",
      "priority": "urgent",
      "assignee_role": "implementer",
      "cycle_id": "cycle-2",
      "module_id": "mod-qa",
      "spec_folder": "project-docs/specs/007_automated_unit_testing_suite",
      "branch": "feature/INT-007/automated_unit_testing_suite",
      "user_story_as_a": "Especialista en QA",
      "user_story_i_want": "una suite completa de pruebas unitarias nativas",
      "user_story_so_that": "cada función pura y serializador esté blindado contra regresiones",
      "acceptance_criteria": "[\"Suite de tests unitarios nativos ejecutables con npm test\",\"Cobertura de parser de markdown, parseMarkdownToBlocks y blocksToMarkdown\",\"Validación de cálculo de tiempos de lectura y clasificación en estantes\"]",
      "evidence_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
      "created_at": "2026-11-07 15:48:41",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 2: Calidad, DeepWiki & Encapsulamiento",
      "module_name": "Testing QA Suite",
      "subtasks": [
        {
          "id": "INT-007-DEV",
          "issue_id": "INT-007",
          "type": "development",
          "title": "Desarrollo de tests unitarios para markdown, TOC y reglas",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-007-QA",
          "issue_id": "INT-007",
          "type": "qa",
          "title": "Ejecución con npm test y validación de cobertura",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "Suite de tests unitarios nativos ejecutables con npm test",
        "Cobertura de parser de markdown, parseMarkdownToBlocks y blocksToMarkdown",
        "Validación de cálculo de tiempos de lectura y clasificación en estantes"
      ]
    },
    {
      "id": "INT-008",
      "project_id": "proj-harness",
      "sequence_id": 8,
      "title": "Pruebas de Aceptación End-to-End con Playwright",
      "description": "Automatización integral de pruebas E2E, caja blanca y caja negra para validar el tablero, constelación 3D y editor dual.",
      "state_id": "state-done",
      "priority": "high",
      "assignee_role": "implementer",
      "cycle_id": "cycle-2",
      "module_id": "mod-qa",
      "spec_folder": "project-docs/specs/008_playwright_acceptance_testing",
      "branch": "feature/INT-008/playwright_acceptance_testing",
      "user_story_as_a": "Lead QA Automation Specialist",
      "user_story_i_want": "pruebas de aceptación E2E con Playwright y multinivel en verify.sh",
      "user_story_so_that": "todo cambio sea verificado de punta a punta antes de cualquier entrega",
      "acceptance_criteria": "[\"Script de prueba automatizada verificando carga de index.html\",\"Verificación de renderizado de la constelación 3D y conmutación de pestañas\",\"Prueba de edición y persistencia en el editor dual\"]",
      "evidence_summary": "Implementación y verificación completadas conforme a los criterios de aceptación.",
      "created_at": "2026-11-07 15:48:41",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 2: Calidad, DeepWiki & Encapsulamiento",
      "module_name": "Testing QA Suite",
      "subtasks": [
        {
          "id": "INT-008-DEV",
          "issue_id": "INT-008",
          "type": "development",
          "title": "Configuración de Playwright, suites de caja blanca, negra y carga",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-008-QA",
          "issue_id": "INT-008",
          "type": "qa",
          "title": "Verificación de los 8 niveles de verify.sh en verde",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "Script de prueba automatizada verificando carga de index.html",
        "Verificación de renderizado de la constelación 3D y conmutación de pestañas",
        "Prueba de edición y persistencia en el editor dual"
      ]
    },
    {
      "id": "INT-009",
      "project_id": "proj-harness",
      "sequence_id": 9,
      "title": "Documentación Scrum en Specs, Subtareas Jira DEV/QA y Cierre con Evidencias JSON",
      "description": "Estandarización de especificaciones con User Stories Scrum (Como/Quiero/Para), desglose formal de subtareas de Desarrollo (DEV) y de QA estilo Jira, y protocolo de cierre con evidencias técnicas y capturas de pantalla integradas en JSON.",
      "state_id": "state-done",
      "priority": "urgent",
      "assignee_role": "implementer",
      "cycle_id": "cycle-2",
      "module_id": "mod-orchestrator",
      "spec_folder": "project-docs/specs/009_scrum_spec_subtasks_and_qa_evidence",
      "branch": "feature/INT-009/scrum_spec_subtasks_qa_evidence",
      "user_story_as_a": "Líder Técnico y Especialista de QA",
      "user_story_i_want": "documentar los specs de tareas bajo el estándar Scrum con subtareas independientes de Desarrollo y QA y capturas de pantalla de evidencia",
      "user_story_so_that": "el equipo tenga claridad absoluta del qué, cómo y de las pruebas ejecutadas, con trazabilidad determinista y persistencia en JSON sin bases de datos SQL",
      "acceptance_criteria": "[\"Los specs incorporan estructura Scrum con User Story (Como/Quiero/Para), DoR y DoD\",\"Cada tarea principal desglosa una Subtarea de Desarrollo (DEV) y una Subtarea de QA estilo Jira\",\"Al cerrar la tarea se documenta en el spec y en JSON qué se hizo, qué pruebas se realizaron y capturas de pantalla\",\"Toda la persistencia se realiza 100% en JSON sin bases de datos SQL\",\"El tablero interactivo muestra las subtareas DEV/QA y la galería de capturas de pantalla\"]",
      "evidence_summary": "Implementación completa del modelo de datos Scrum, subtareas Jira DEV/QA, modal interactivo con DoD y galería visual de screenshots.",
      "created_at": "2026-11-07 15:48:41",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 2: Calidad, DeepWiki & Encapsulamiento",
      "module_name": "Agent Orchestrator",
      "subtasks": [
        {
          "id": "INT-009-DEV",
          "issue_id": "INT-009",
          "type": "development",
          "title": "Subtarea DEV: Extensión de Esquema JSON, UI Scrum (Modal/Table) y Motor de Evidencias",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-009-QA",
          "issue_id": "INT-009",
          "type": "qa",
          "title": "Subtarea QA: Casos de Prueba, Aceptación E2E, Capturas de Pantalla y Auditoría de Evidencias",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "Los specs incorporan estructura Scrum con User Story (Como/Quiero/Para), DoR y DoD",
        "Cada tarea principal desglosa una Subtarea de Desarrollo (DEV) y una Subtarea de QA estilo Jira",
        "Al cerrar la tarea se documenta en el spec y en JSON qué se hizo, qué pruebas se realizaron y capturas de pantalla",
        "Toda la persistencia se realiza 100% en JSON sin bases de datos SQL",
        "El tablero interactivo muestra las subtareas DEV/QA y la galería de capturas de pantalla"
      ]
    },
    {
      "id": "INT-010",
      "project_id": "proj-harness",
      "sequence_id": 10,
      "title": "Encapsulamiento de Archivos y Limpieza de Raíz para Adopción Limpia del Arnés",
      "description": "Reorganizar la arquitectura de archivos del arnés para que la raíz contenga exclusivamente los archivos y carpetas indispensables de adopción (.agents/, .github/, .opencode/, project-docs/, AGENTS.md, opencode.json, project-spec.yaml, verify.sh), encapsulando el tooling npm, scripts, suites de prueba y specs dentro de project-docs/ para prevenir cualquier colisión al copiar y pegar el arnés en proyectos externos (.NET, Python, Java, Go, etc.).",
      "state_id": "state-done",
      "priority": "urgent",
      "assignee_role": "implementer",
      "cycle_id": "cycle-2",
      "module_id": "mod-orchestrator",
      "spec_folder": "project-docs/specs/010_harness_root_cleanliness_encapsulation",
      "branch": "feature/INT-010/harness_root_cleanliness_encapsulation",
      "user_story_as_a": "Ingeniero / Arquitecto de Software",
      "user_story_i_want": "tener una raíz de proyecto limpia donde todos los archivos internos del arnés estén encapsulados en project-docs/",
      "user_story_so_that": "pueda copiar y pegar el arnés en cualquier proyecto cliente (.NET, Python, Java, Go, Node) sin colisiones de package.json, tests o archivos sueltos en la raíz",
      "acceptance_criteria": "[\"La raíz del repositorio solo contiene los 4 directorios canónicos (.agents/, .github/, .opencode/, project-docs/) y los archivos canónicos mínimos indispensables (AGENTS.md, opencode.json, project-spec.yaml, verify.sh, README.md, .gitignore)\",\"Las dependencias y tooling de Node/npm (package.json, package-lock.json, node_modules/, playwright.config.js) están encapsulados dentro de project-docs/ sin colisionar con el proyecto anfitrión\",\"Las suites de pruebas internas del arnés y tablero están reubicadas dentro de project-docs/tests/ sin contaminar los tests del proyecto cliente\",\"Los scripts de soporte y captura de evidencias residen en project-docs/scripts/capture-evidence.js\",\"El archivo kickstart.json de plantilla reside dentro de project-docs/kickstart.json\",\"ANTIGRAVITY.md está unificado y referenciado limpiamente desde .agents/ y AGENTS.md\",\"verify.sh y los comandos de npm funcionan de forma transparente delegando en project-docs/ (ej. npm --prefix project-docs ...)\",\"El 100% de las suites de prueba (unit, whitebox, blackbox, system, load, Playwright E2E) siguen pasando en verde con las nuevas rutas\",\"El tablero interactivo project-docs/ mantiene sincronización offline y visualización intacta sin errores de carga\"]",
      "evidence_summary": "Encapsulamiento exitoso de package.json, package-lock.json, playwright.config.js, node_modules, tests/ y scripts/ dentro de project-docs/. Reubicación de ANTIGRAVITY.md a .agents/ANTIGRAVITY.md y kickstart.json a project-docs/kickstart.json. verify.sh actualizado con delegación transparente via npm --prefix project-docs. Raíz 100% limpia para adopción externa.",
      "created_at": "2026-11-07 15:48:41",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 2: Calidad, DeepWiki & Encapsulamiento",
      "module_name": "Agent Orchestrator",
      "subtasks": [
        {
          "id": "INT-010-DEV",
          "issue_id": "INT-010",
          "type": "development",
          "title": "Encapsulamiento de tooling npm, scripts, tests y configuración dentro de project-docs/",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-010-QA",
          "issue_id": "INT-010",
          "type": "qa",
          "title": "Verificación multinivel, auditoría de raíz limpia y pruebas E2E",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "La raíz del repositorio solo contiene los 4 directorios canónicos (.agents/, .github/, .opencode/, project-docs/) y los archivos canónicos mínimos indispensables (AGENTS.md, opencode.json, project-spec.yaml, verify.sh, README.md, .gitignore)",
        "Las dependencias y tooling de Node/npm (package.json, package-lock.json, node_modules/, playwright.config.js) están encapsulados dentro de project-docs/ sin colisionar con el proyecto anfitrión",
        "Las suites de pruebas internas del arnés y tablero están reubicadas dentro de project-docs/tests/ sin contaminar los tests del proyecto cliente",
        "Los scripts de soporte y captura de evidencias residen en project-docs/scripts/capture-evidence.js",
        "El archivo kickstart.json de plantilla reside dentro de project-docs/kickstart.json",
        "ANTIGRAVITY.md está unificado y referenciado limpiamente desde .agents/ y AGENTS.md",
        "verify.sh y los comandos de npm funcionan de forma transparente delegando en project-docs/ (ej. npm --prefix project-docs ...)",
        "El 100% de las suites de prueba (unit, whitebox, blackbox, system, load, Playwright E2E) siguen pasando en verde con las nuevas rutas",
        "El tablero interactivo project-docs/ mantiene sincronización offline y visualización intacta sin errores de carga"
      ]
    },
    {
      "id": "INT-011",
      "project_id": "proj-harness",
      "sequence_id": 11,
      "title": "Encapsulamiento de specs/, verify.sh y project-spec.yaml en project-docs/",
      "description": "Reubicar specs/, verify.sh y project-spec.yaml dentro de project-docs/ para dejar la raíz con exclusivamente 4 carpetas (.agents/, .github/, .opencode/, project-docs/) y 4 archivos indispensables (AGENTS.md, opencode.json, README.md, .gitignore). Actualizar exhaustivamente todos los agentes y skills de Antigravity, Copilot y OpenCode para crear y consumir archivos en las nuevas rutas.",
      "state_id": "state-done",
      "priority": "urgent",
      "assignee_role": "implementer",
      "cycle_id": "cycle-2",
      "module_id": "mod-orchestrator",
      "spec_folder": "project-docs/specs/011_encapsulate_specs_and_scripts",
      "branch": "feature/INT-011/encapsulate_specs_and_scripts",
      "user_story_as_a": "Ingeniero / Arquitecto de Software",
      "user_story_i_want": "tener las especificaciones, verify.sh y project-spec.yaml encapsulados en project-docs/",
      "user_story_so_that": "la raíz del proyecto quede extremadamente limpia (solo 4 carpetas y 4 archivos) facilitando identificar y mover los archivos del arnés",
      "acceptance_criteria": "[\"La carpeta specs/ reside exclusivamente dentro de project-docs/specs/\",\"El archivo project-spec.yaml reside en project-docs/project-spec.yaml\",\"El script verify.sh reside en project-docs/verify.sh y es ejecutable desde cualquier ubicación\",\"La raíz del repositorio solo contiene 4 carpetas (.agents, .github, .opencode, project-docs) y 4 archivos (AGENTS.md, opencode.json, README.md, .gitignore)\",\"Los 4 agentes de Google Antigravity (.agents/agents/) crean y consultan specs en project-docs/specs/ y config en project-docs/\",\"Las skills en .opencode/skills/ (fuente de verdad), .github/skills/ y .agents/skills/ están 100% sincronizadas y operan con las nuevas rutas en project-docs/\",\"El 100% de la suite de pruebas (unit, whitebox, blackbox, system, load, Playwright E2E) pasa en verde\",\"El script project-docs/verify.sh completa los 9 pasos de verificación con exit code 0\"]",
      "evidence_summary": "Reubicación de specs/, verify.sh y project-spec.yaml a project-docs/. Actualización de los 4 agentes en .agents/agents/ y de las 16 skills en .opencode/skills/ con propagación 100% a .github/skills/ y .agents/skills/. Raíz 100% pura con solo 4 carpetas y 4 archivos.",
      "created_at": "2026-11-07 15:48:41",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 2: Calidad, DeepWiki & Encapsulamiento",
      "module_name": "Agent Orchestrator",
      "subtasks": [
        {
          "id": "INT-011-DEV",
          "issue_id": "INT-011",
          "type": "development",
          "title": "Reubicación de artefactos y actualización de agentes y skills",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-011-QA",
          "issue_id": "INT-011",
          "type": "qa",
          "title": "Validación multinivel de rutas y pureza extrema de raíz",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "La carpeta specs/ reside exclusivamente dentro de project-docs/specs/",
        "El archivo project-spec.yaml reside en project-docs/project-spec.yaml",
        "El script verify.sh reside en project-docs/verify.sh y es ejecutable desde cualquier ubicación",
        "La raíz del repositorio solo contiene 4 carpetas (.agents, .github, .opencode, project-docs) y 4 archivos (AGENTS.md, opencode.json, README.md, .gitignore)",
        "Los 4 agentes de Google Antigravity (.agents/agents/) crean y consultan specs en project-docs/specs/ y config en project-docs/",
        "Las skills en .opencode/skills/ (fuente de verdad), .github/skills/ y .agents/skills/ están 100% sincronizadas y operan con las nuevas rutas en project-docs/",
        "El 100% de la suite de pruebas (unit, whitebox, blackbox, system, load, Playwright E2E) pasa en verde",
        "El script project-docs/verify.sh completa los 9 pasos de verificación con exit code 0"
      ]
    },
    {
      "id": "INT-012",
      "project_id": "proj-harness",
      "sequence_id": 12,
      "title": "Ingenieria Inversa Plane: Gestion de Tareas Multi-Vista, Base de Conocimiento y SQLite con Copia Markdown",
      "description": "Replicacion y adaptacion de la arquitectura, UX y vistas de Makeplane (Plane) para el tablero de seguimiento: Work items con vistas de Lista, Tablero Kanban interactivo, Vista de Calendario/Gantt y Hoja de calculo; gestion de Ciclos (Sprints) y Modulos (Epics); motor de base de datos relacional SQLite (via node:sqlite nativo en Node.js 24) en project-docs/data/harness.db con sincronizacion bidireccional continua hacia archivos .md y .json para que los agentes de IA lean y escriban en su formato nativo optimo.",
      "state_id": "state-done",
      "priority": "urgent",
      "assignee_role": "implementer",
      "cycle_id": "cycle-3",
      "module_id": "mod-visualizer",
      "spec_folder": "project-docs/specs/012_plane_style_sqlite_project_management",
      "branch": "feature/INT-012/plane_style_sqlite_project_management",
      "user_story_as_a": "Ingeniero de Software y Agente de IA",
      "user_story_i_want": "una plataforma de gestion de proyectos inspirada en Plane con vistas multiples y persistencia relacional SQLite sincronizada con Markdown",
      "user_story_so_that": "la gestion visual del flujo de trabajo sea de primer nivel y los agentes autonomos puedan consultar y actualizar tareas y conocimiento en su formato nativo",
      "acceptance_criteria": "[\"Motor de datos relacional SQLite (node:sqlite) operativo en project-docs/data/harness.db con tablas para workspaces, projects, states, cycles, modules, issues, subtasks y pages.\",\"Sincronizacion bidireccional automatica: lectura y escritura en SQLite manteniendo copias sincronizadas en archivos .md y .json para consumo nativo por los agentes de IA.\",\"Interfaz y UX inspirada en Plane con estetica profesional dark/light theme, barra lateral colapsable, switcher de proyectos y Command Palette (Ctrl+K).\",\"Multi-vista completa para Issues/Tareas: Vista de Lista (List View), Tablero Kanban (Board View agrupado por Estado o Prioridad), Vista Temporal (Calendar/Gantt) y Vista de Hoja de Calculo (Spreadsheet Table).\",\"Gestion de Ciclos (Sprints) con metricas de burn-down, porcentaje de completitud y estado de tiempo.\",\"Gestion de Modulos (Epics/Bounded Contexts) agrupando historias y tareas con progreso acumulado.\",\"Integracion de Paginas / Docs (Knowledge Base) estilo Plane Pages, con editor dual y vinculacion bidireccional con tareas y reglas de negocio.\",\"Filtros rapidos, agrupacion (Group by State, Priority, Assignee) y ordenacion fluida sin recargas de pagina.\",\"Soporte offline y persistencia tanto en modo servidor (Node.js REST API con SQLite) como en modo offline (fallback sync a JSON/localStorage).\",\"Zero emojis en toda la interfaz, codigo fuente y pruebas; 100% de la suite de pruebas pasando en verde sin regresiones.\"]",
      "evidence_summary": "Implementacion completa de la arquitectura y UX inspirada en Makeplane: motor SQLite con node:sqlite nativo en project-docs/data/harness.db con espejo continuo a archivos Markdown y JSON; endpoints REST en serve.js; vistas de Lista, Kanban, Calendario y Hoja de calculo; gestion de Ciclos con burn-down SVG; Modulos/Epics; y Plane Pages.",
      "created_at": "2026-11-07 15:48:41",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 3: Plane Multi-Vista & SQLite para IA",
      "module_name": "Dashboard Visualizer",
      "subtasks": [
        {
          "id": "INT-012-DEV",
          "issue_id": "INT-012",
          "type": "development",
          "title": "Motor SQLite relacional, API REST en serve.js y vistas completas estilo Plane",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-012-QA",
          "issue_id": "INT-012",
          "type": "qa",
          "title": "Pruebas unitarias de SQLite, sincronizacion de archivos y pruebas de aceptacion Playwright",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "Motor de datos relacional SQLite (node:sqlite) operativo en project-docs/data/harness.db con tablas para workspaces, projects, states, cycles, modules, issues, subtasks y pages.",
        "Sincronizacion bidireccional automatica: lectura y escritura en SQLite manteniendo copias sincronizadas en archivos .md y .json para consumo nativo por los agentes de IA.",
        "Interfaz y UX inspirada en Plane con estetica profesional dark/light theme, barra lateral colapsable, switcher de proyectos y Command Palette (Ctrl+K).",
        "Multi-vista completa para Issues/Tareas: Vista de Lista (List View), Tablero Kanban (Board View agrupado por Estado o Prioridad), Vista Temporal (Calendar/Gantt) y Vista de Hoja de Calculo (Spreadsheet Table).",
        "Gestion de Ciclos (Sprints) con metricas de burn-down, porcentaje de completitud y estado de tiempo.",
        "Gestion de Modulos (Epics/Bounded Contexts) agrupando historias y tareas con progreso acumulado.",
        "Integracion de Paginas / Docs (Knowledge Base) estilo Plane Pages, con editor dual y vinculacion bidireccional con tareas y reglas de negocio.",
        "Filtros rapidos, agrupacion (Group by State, Priority, Assignee) y ordenacion fluida sin recargas de pagina.",
        "Soporte offline y persistencia tanto en modo servidor (Node.js REST API con SQLite) como en modo offline (fallback sync a JSON/localStorage).",
        "Zero emojis en toda la interfaz, codigo fuente y pruebas; 100% de la suite de pruebas pasando en verde sin regresiones."
      ]
    },
    {
      "id": "INT-013",
      "project_id": "proj-harness",
      "sequence_id": 13,
      "title": "Screaming Architecture & Refactor Unificado Estilo Plane con CLI de Consulta Soberana",
      "description": "Refactorizacion arquitectonica integral del frontend bajo Screaming Architecture: cada dominio de negocio (issues, cycles, modules, pages, architecture, graph, constellation, analytics) encapsula sus propios componentes, vistas y helpers con bucles funcionales de renderizado (estilo React en Vanilla JS). Unificacion total del tablero en una experiencia unica inspirada en Plane sin depender del tablero clasico, diseno UI/UX y graficos mejorados (burn-down, C4, constelacion 3D), y CLI soberana ('node project-docs/cli.js') para manipulacion y consulta directa de tareas y base de conocimiento por agentes de IA, skills y terminal.",
      "state_id": "state-done",
      "priority": "urgent",
      "assignee_role": "implementer",
      "cycle_id": "cycle-3",
      "module_id": "mod-visualizer",
      "spec_folder": "project-docs/specs/013_screaming_architecture_plane_refactor",
      "branch": "feature/INT-013/screaming_architecture_plane_refactor",
      "user_story_as_a": "Desarrollador y Agente de IA",
      "user_story_i_want": "un frontend modular bajo Screaming Architecture con interfaz unificada estilo Plane y una CLI de consulta soberana",
      "user_story_so_that": "el arnes opere con maxima coherencia UI/UX y tanto humanos como agentes gestionen tareas y conocimiento en consola y visualmente con rapidez",
      "acceptance_criteria": "[\"Screaming Architecture pura en project-docs/src/features/: carpetas por dominio de negocio (issues, cycles, modules, pages, architecture, graph, constellation, analytics) con estructura interna coherente (components/, views/, helpers/).\",\"Bucles de renderizado funcional en componentes Vanilla JS con composicion modular limpia estilo componentes repetitivos de React.\",\"Unificacion total del diseno en una sola voz y experiencia UI/UX inspirada en Plane (sustituyendo el layout clasico legacy como vista primaria) con navegacion fluida por barra lateral y atajos.\",\"Integracion completa de todas las capacidades previas (C4 diagrams, grafo y arbol de dependencias, constelacion 3D Three.js, base de conocimiento editorial) como vistas nativas dentro de Plane.\",\"Mejora en graficos vectoriales interactivos: burn-down dinamico, diagramas Mermaid reactivos y visualizacion 3D.\",\"Herramienta CLI unificada (project-docs/cli.js) para que los agentes de IA, skills y desarrolladores consulten y manipulen tareas, ciclos, modulos y paginas desde consola o chat sin friccion.\",\"Persistencia relacional continua en SQLite (harness.db) con espejo sincronizado automatico en archivos .md y .json.\",\"Zero emojis en todo el codigo fuente, componentes UI, tests y documentacion; 100% de la suite de pruebas pasando en verde sin regresiones.\"]",
      "evidence_summary": "Refactorizacion arquitectonica integral bajo Screaming Architecture: pureza de 9 dominios en src/features/, helper declarativo renderList para componentes repetitivos en Vanilla JS, unificacion en una sola voz UX estilo Plane eliminando el layout legacy, CLI soberana node project-docs/cli.js para IA y terminal conectada a SQLite y disco, y 100% de tests en verde.",
      "created_at": "2026-11-07 16:47:57",
      "updated_at": "2026-11-07 18:24:36",
      "state_name": "Done",
      "state_color": "#22c55e",
      "state_group": "completed",
      "cycle_name": "Ciclo 3: Plane Multi-Vista & SQLite para IA",
      "module_name": "Dashboard Visualizer",
      "subtasks": [
        {
          "id": "INT-013-DEV",
          "issue_id": "INT-013",
          "type": "development",
          "title": "Refactorizacion Screaming Architecture, componentes funcionales, interfaz Plane unificada y CLI",
          "assignee_role": "implementer",
          "status": "done",
          "sequence": 1
        },
        {
          "id": "INT-013-QA",
          "issue_id": "INT-013",
          "type": "qa",
          "title": "Pruebas de arquitectura, CLI, navegacion integrada Playwright y verificacion integral",
          "assignee_role": "reviewer",
          "status": "done",
          "sequence": 2
        }
      ],
      "acceptance": [
        "Screaming Architecture pura en project-docs/src/features/: carpetas por dominio de negocio (issues, cycles, modules, pages, architecture, graph, constellation, analytics) con estructura interna coherente (components/, views/, helpers/).",
        "Bucles de renderizado funcional en componentes Vanilla JS con composicion modular limpia estilo componentes repetitivos de React.",
        "Unificacion total del diseno en una sola voz y experiencia UI/UX inspirada en Plane (sustituyendo el layout clasico legacy como vista primaria) con navegacion fluida por barra lateral y atajos.",
        "Integracion completa de todas las capacidades previas (C4 diagrams, grafo y arbol de dependencias, constelacion 3D Three.js, base de conocimiento editorial) como vistas nativas dentro de Plane.",
        "Mejora en graficos vectoriales interactivos: burn-down dinamico, diagramas Mermaid reactivos y visualizacion 3D.",
        "Herramienta CLI unificada (project-docs/cli.js) para que los agentes de IA, skills y desarrolladores consulten y manipulen tareas, ciclos, modulos y paginas desde consola o chat sin friccion.",
        "Persistencia relacional continua en SQLite (harness.db) con espejo sincronizado automatico en archivos .md y .json.",
        "Zero emojis en todo el codigo fuente, componentes UI, tests y documentacion; 100% de la suite de pruebas pasando en verde sin regresiones."
      ]
    }
  ],
  "pages": [
    {
      "id": "page-knowledge_business-rules_md",
      "file_path": "knowledge/business-rules.md",
      "title": "Catálogo Canónico de Reglas de Negocio (Invariantes del Arnés)",
      "summary": "",
      "shelf": "business_rules",
      "word_count": 599,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_03-capabilities-and-features_md",
      "file_path": "knowledge/03-capabilities-and-features.md",
      "title": "Catálogo Exhaustivo de Capacidades, Features y Desglose Funcional",
      "summary": "```mermaid",
      "shelf": "standards",
      "word_count": 1989,
      "reading_time_min": 10,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_adr-catalog_md",
      "file_path": "knowledge/adr-catalog.md",
      "title": "Catálogo de Decisiones de Arquitectura (ADR Catalog)",
      "summary": "",
      "shelf": "adrs",
      "word_count": 592,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_user-stories-catalog_md",
      "file_path": "knowledge/user-stories-catalog.md",
      "title": "Catálogo de Historias de Usuario (INVEST, Scrum & XP)",
      "summary": "",
      "shelf": "requirements",
      "word_count": 627,
      "reading_time_min": 4,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_external-services_md",
      "file_path": "knowledge/external-services.md",
      "title": "Catálogo de Integraciones y Servicios Externos",
      "summary": "| Servicio / Herramienta | Tipo | Protocolo | Variables Requeridas | Política de Contingencia / Failover |",
      "shelf": "standards",
      "word_count": 215,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_009_scrum_spec_subtasks_and_qa_evidence_tasks_md",
      "file_path": "specs/009_scrum_spec_subtasks_and_qa_evidence/tasks.md",
      "title": "Checklist de Subtareas Scrum (Jira Style): INT-009",
      "summary": "",
      "shelf": "specs",
      "word_count": 336,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_001_refactor_harness_architecture_tasks_md",
      "file_path": "specs/001_refactor_harness_architecture/tasks.md",
      "title": "Checklist de Tareas de Implementación: INT-001",
      "summary": "",
      "shelf": "specs",
      "word_count": 144,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_008_playwright_acceptance_testing_tasks_md",
      "file_path": "specs/008_playwright_acceptance_testing/tasks.md",
      "title": "Checklist de Tareas de Implementación: INT-008",
      "summary": "",
      "shelf": "specs",
      "word_count": 179,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_011_encapsulate_specs_and_scripts_design_md",
      "file_path": "specs/011_encapsulate_specs_and_scripts/design.md",
      "title": "Design: Encapsulamiento Completo de Specs, verify.sh y project-spec.yaml en project-docs/",
      "summary": "```",
      "shelf": "specs",
      "word_count": 385,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_010_harness_root_cleanliness_encapsulation_design_md",
      "file_path": "specs/010_harness_root_cleanliness_encapsulation/design.md",
      "title": "Design: Encapsulamiento de Archivos y Limpieza de Raíz para Adopción del Arnés",
      "summary": "```mermaid",
      "shelf": "specs",
      "word_count": 826,
      "reading_time_min": 5,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_02-architecture-and-patterns_md",
      "file_path": "knowledge/02-architecture-and-patterns.md",
      "title": "Diagnóstico AS-IS de Arquitectura, Flujos de Datos y Catálogo de Patrones",
      "summary": "El repositorio implementa una **Arquitectura que Grita su Propósito (Screaming Architecture)**. El código no está organizado por capas genéricas superficiales (...",
      "shelf": "architecture",
      "word_count": 729,
      "reading_time_min": 4,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_uml-diagrams_md",
      "file_path": "knowledge/uml-diagrams.md",
      "title": "Diagramas UML — AI Agentic SDD Engineering Harness",
      "summary": "Muestra las entidades, value objects y relaciones del modelo conceptual del arnés:",
      "shelf": "architecture",
      "word_count": 515,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_data-dictionary_md",
      "file_path": "knowledge/data-dictionary.md",
      "title": "Diccionario de Datos & Persistencia Docs-as-Code",
      "summary": "```mermaid",
      "shelf": "standards",
      "word_count": 345,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_013_screaming_architecture_plane_refactor_design_md",
      "file_path": "specs/013_screaming_architecture_plane_refactor/design.md",
      "title": "Diseno Tecnico y Decisiones Arquitectonicas (ADRs) — INT-013: Screaming Architecture & Refactor Unificado Estilo Plane",
      "summary": "El principio rector es **Screaming Architecture**: la estructura de directorios en `project-docs/src/` refleja directamente el dominio de negocio del sistema de...",
      "shelf": "specs",
      "word_count": 1205,
      "reading_time_min": 7,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_001_refactor_harness_architecture_design_md",
      "file_path": "specs/001_refactor_harness_architecture/design.md",
      "title": "Diseño Técnico & Decisiones de Arquitectura (ADRs): INT-001",
      "summary": "Refactorización del arnés de ingeniería SDD para desacoplar las dependencias hardcodeadas a `.NET`, erradicar datos mock de comercio electrónico en la base de c...",
      "shelf": "specs",
      "word_count": 248,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_008_playwright_acceptance_testing_design_md",
      "file_path": "specs/008_playwright_acceptance_testing/design.md",
      "title": "Diseño Técnico & Decisiones de Arquitectura (ADRs): INT-008",
      "summary": "Diseño de la suite integral de aseguramiento de calidad y pruebas automatizadas para el arnés y su tablero de seguimiento interactivo, abarcando pruebas de Acep...",
      "shelf": "specs",
      "word_count": 392,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_009_scrum_spec_subtasks_and_qa_evidence_design_md",
      "file_path": "specs/009_scrum_spec_subtasks_and_qa_evidence/design.md",
      "title": "Diseño Técnico y Arquitectura: INT-009",
      "summary": "Este diseño formaliza la integración de las prácticas de **Scrum / Agile** y **Jira** dentro del ciclo de vida SDD (Spec Driven Development). Se define un model...",
      "shelf": "specs",
      "word_count": 645,
      "reading_time_min": 4,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_MASTER-PROJECT-KNOWLEDGE_md",
      "file_path": "knowledge/MASTER-PROJECT-KNOWLEDGE.md",
      "title": "Dossier Maestro Consolidado de Ingeniería Soberana (MASTER-PROJECT-KNOWLEDGE)",
      "summary": "1. [Capítulo 1: Visión del Producto, Contexto de Negocio y Stakeholders (IEEE 830)](#capítulo-1-visión-del-producto-contexto-de-negocio-y-stakeholders-ieee-830)",
      "shelf": "standards",
      "word_count": 1709,
      "reading_time_min": 9,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_012_plane_style_sqlite_project_management_design_md",
      "file_path": "specs/012_plane_style_sqlite_project_management/design.md",
      "title": "Especificacion de Diseño y Arquitectura — INT-012: Ingenieria Inversa Plane (Makeplane)",
      "summary": "La plataforma requiere velocidad en consultas relacionales complejas (agrupación por estados, filtros multicriterio, relaciones padre-hijo, ordenamiento por pri...",
      "shelf": "specs",
      "word_count": 1257,
      "reading_time_min": 7,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_012_plane_style_sqlite_project_management_requirements_md",
      "file_path": "specs/012_plane_style_sqlite_project_management/requirements.md",
      "title": "Especificacion de Requerimientos — INT-012: Ingenieria Inversa Plane (Makeplane) para Gestion de Tareas, Base de Conocimiento y SQLite con Copia Markdown",
      "summary": "El arnés actual cuenta con un tablero de seguimiento visual (`project-docs/index.html`) con una tabla de features, visor 3D Three.js, grafo de dependencias y ba...",
      "shelf": "specs",
      "word_count": 1269,
      "reading_time_min": 7,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_013_screaming_architecture_plane_refactor_requirements_md",
      "file_path": "specs/013_screaming_architecture_plane_refactor/requirements.md",
      "title": "Especificacion de Requerimientos — INT-013: Screaming Architecture & Refactor Unificado Estilo Plane con CLI de Consulta Soberana",
      "summary": "Tras la implementación inicial de las vistas de Plane y el motor SQLite en INT-012, el arnés dispone de dos layouts simultáneos (el clásico y el modo Plane).",
      "shelf": "specs",
      "word_count": 1231,
      "reading_time_min": 7,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_009_scrum_spec_subtasks_and_qa_evidence_requirements_md",
      "file_path": "specs/009_scrum_spec_subtasks_and_qa_evidence/requirements.md",
      "title": "Especificación de Requerimientos Scrum & SDD: INT-009",
      "summary": "Antes de iniciar la implementación, se validó que:",
      "shelf": "specs",
      "word_count": 582,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_functional-requirements_md",
      "file_path": "knowledge/functional-requirements.md",
      "title": "Especificación de Requerimientos del Sistema (SRS IEEE 830 / ISO 29148)",
      "summary": "",
      "shelf": "requirements",
      "word_count": 657,
      "reading_time_min": 4,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_001_refactor_harness_architecture_requirements_md",
      "file_path": "specs/001_refactor_harness_architecture/requirements.md",
      "title": "Especificación de Requerimientos: INT-001 refactor_harness_architecture",
      "summary": "",
      "shelf": "specs",
      "word_count": 252,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_008_playwright_acceptance_testing_requirements_md",
      "file_path": "specs/008_playwright_acceptance_testing/requirements.md",
      "title": "Especificación de Requerimientos: INT-008 playwright_acceptance_testing",
      "summary": "",
      "shelf": "specs",
      "word_count": 383,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_coding-standards_md",
      "file_path": "knowledge/coding-standards.md",
      "title": "Estándares de Codificación & Guardrails Anti-Sesgo",
      "summary": "1. **Prohibición de Librerías Fantasma**: Los agentes tienen estrictamente prohibido sugerir, instalar o importar paquetes o librerías que no figuren en `packag...",
      "shelf": "standards",
      "word_count": 265,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_012_plane_style_sqlite_project_management_evidence_md",
      "file_path": "specs/012_plane_style_sqlite_project_management/evidence.md",
      "title": "Evidencias de Aceptacion E2E — INT-012: Ingenieria Inversa Plane (Makeplane)",
      "summary": "![Tablero Kanban](evidence/01-plane-kanban-board.png)",
      "shelf": "specs",
      "word_count": 420,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_013_screaming_architecture_plane_refactor_evidence_md",
      "file_path": "specs/013_screaming_architecture_plane_refactor/evidence.md",
      "title": "Evidencias de Aceptación E2E — INT-013: Screaming Architecture & Refactor Unificado Estilo Plane con CLI de Consulta Soberana",
      "summary": "![Tablero Kanban](evidence/01-plane-kanban-board.png)",
      "shelf": "specs",
      "word_count": 456,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_010_harness_root_cleanliness_encapsulation_evidence_md",
      "file_path": "specs/010_harness_root_cleanliness_encapsulation/evidence.md",
      "title": "Evidencias de Pruebas y Validación: INT-010 Encapsulamiento de Archivos y Limpieza de Raíz",
      "summary": "| Nivel de Prueba | Herramienta / Runner | Casos Ejecutados | Resultado |",
      "shelf": "specs",
      "word_count": 355,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_011_encapsulate_specs_and_scripts_evidence_md",
      "file_path": "specs/011_encapsulate_specs_and_scripts/evidence.md",
      "title": "Evidencias de Pruebas y Validación: INT-011 Encapsulamiento de Specs, verify.sh y project-spec.yaml",
      "summary": "| Nivel de Prueba | Herramienta / Runner | Casos Ejecutados | Resultado |",
      "shelf": "specs",
      "word_count": 335,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_knowledge-engine_sequence_md",
      "file_path": "knowledge/modules/knowledge-engine/sequence.md",
      "title": "Flujo de Elicitación y Extracción: knowledge-engine",
      "summary": "```mermaid",
      "shelf": "standards",
      "word_count": 95,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_agent-orchestrator_sequence_md",
      "file_path": "knowledge/modules/agent-orchestrator/sequence.md",
      "title": "Flujo de Orquestación Multi-Agente: agent-orchestrator",
      "summary": "```mermaid",
      "shelf": "standards",
      "word_count": 100,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_dashboard-visualizer_sequence_md",
      "file_path": "knowledge/modules/dashboard-visualizer/sequence.md",
      "title": "Flujo de Renderizado y Navegación: dashboard-visualizer",
      "summary": "```mermaid",
      "shelf": "standards",
      "word_count": 115,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_triple-sync-engine_sequence_md",
      "file_path": "knowledge/modules/triple-sync-engine/sequence.md",
      "title": "Flujo de Sincronización Triple: triple-sync-engine",
      "summary": "```mermaid",
      "shelf": "standards",
      "word_count": 71,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_testing-qa-suite_sequence_md",
      "file_path": "knowledge/modules/testing-qa-suite/sequence.md",
      "title": "Flujo de Verificación Continua: testing-qa-suite",
      "summary": "```mermaid",
      "shelf": "standards",
      "word_count": 66,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_system-capabilities_md",
      "file_path": "knowledge/system-capabilities.md",
      "title": "Inventario de Capacidades del Sistema (System Capabilities)",
      "summary": "| ID Capacidad | Módulo | Capacidad Funcional | Interfaz / Comando | Estado |",
      "shelf": "standards",
      "word_count": 362,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_traceability-matrix_md",
      "file_path": "knowledge/traceability-matrix.md",
      "title": "Matriz de Trazabilidad Cruzada (RTM)",
      "summary": "| Requerimiento Funcional | Regla de Negocio (`BR-*`) | Historia de Usuario | Componente / Archivo | Test Automatizado |",
      "shelf": "requirements",
      "word_count": 250,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_c4-model_md",
      "file_path": "knowledge/c4-model.md",
      "title": "Modelo C4 — AI Agentic SDD Engineering Harness",
      "summary": "Muestra los límites del arnés, los actores principales y los sistemas externos con los que interactúa:",
      "shelf": "architecture",
      "word_count": 303,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_04-domain-ddd-and-crc_md",
      "file_path": "knowledge/04-domain-ddd-and-crc.md",
      "title": "Modelo de Dominio DDD, Lenguaje Ubicuo y Tarjetas CRC",
      "summary": "1. **Core Domain (Dominio Central)**:",
      "shelf": "standards",
      "word_count": 637,
      "reading_time_min": 4,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_agent-orchestrator_data-and-transactions_md",
      "file_path": "knowledge/modules/agent-orchestrator/data-and-transactions.md",
      "title": "Módulo: agent-orchestrator — Datos & Transacciones",
      "summary": "El orquestador interactúa con dos fuentes de persistencia:",
      "shelf": "standards",
      "word_count": 169,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_agent-orchestrator_technical-debt-refactoring_md",
      "file_path": "knowledge/modules/agent-orchestrator/technical-debt-refactoring.md",
      "title": "Módulo: agent-orchestrator — Deuda Técnica & Refactorización",
      "summary": "1. **Paso 1**: Incorporar telemetría de tiempos de respuesta por subagente en `progress/history.json`.",
      "shelf": "standards",
      "word_count": 139,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_agent-orchestrator_module-spec_md",
      "file_path": "knowledge/modules/agent-orchestrator/module-spec.md",
      "title": "Módulo: agent-orchestrator — Especificación & Tarjetas CRC",
      "summary": "| Clase / Agregado | Estereotipo | Responsabilidades | Colaboradores |",
      "shelf": "standards",
      "word_count": 437,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_agent-orchestrator_requirements-and-rules_md",
      "file_path": "knowledge/modules/agent-orchestrator/requirements-and-rules.md",
      "title": "Módulo: agent-orchestrator — Requerimientos & Reglas de Negocio",
      "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
      "shelf": "business_rules",
      "word_count": 556,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_agent-orchestrator_diagrams_md",
      "file_path": "knowledge/modules/agent-orchestrator/diagrams.md",
      "title": "Módulo: agent-orchestrator — Suite de 6 Diagramas",
      "summary": "```mermaid",
      "shelf": "architecture",
      "word_count": 440,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_dashboard-visualizer_data-and-transactions_md",
      "file_path": "knowledge/modules/dashboard-visualizer/data-and-transactions.md",
      "title": "Módulo: dashboard-visualizer — Datos & Transacciones",
      "summary": "",
      "shelf": "standards",
      "word_count": 172,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_dashboard-visualizer_technical-debt-refactoring_md",
      "file_path": "knowledge/modules/dashboard-visualizer/technical-debt-refactoring.md",
      "title": "Módulo: dashboard-visualizer — Deuda Técnica & Refactorización",
      "summary": "1. **Paso 1**: Implementar el switcher de navegación de 3 niveles en `KnowledgeBase.js`.",
      "shelf": "standards",
      "word_count": 161,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_dashboard-visualizer_module-spec_md",
      "file_path": "knowledge/modules/dashboard-visualizer/module-spec.md",
      "title": "Módulo: dashboard-visualizer — Especificación & Tarjetas CRC",
      "summary": "| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |",
      "shelf": "standards",
      "word_count": 354,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_dashboard-visualizer_requirements-and-rules_md",
      "file_path": "knowledge/modules/dashboard-visualizer/requirements-and-rules.md",
      "title": "Módulo: dashboard-visualizer — Requerimientos & Reglas de Negocio",
      "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
      "shelf": "business_rules",
      "word_count": 255,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_dashboard-visualizer_diagrams_md",
      "file_path": "knowledge/modules/dashboard-visualizer/diagrams.md",
      "title": "Módulo: dashboard-visualizer — Suite de 6 Diagramas",
      "summary": "```mermaid",
      "shelf": "architecture",
      "word_count": 377,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_knowledge-engine_data-and-transactions_md",
      "file_path": "knowledge/modules/knowledge-engine/data-and-transactions.md",
      "title": "Módulo: knowledge-engine — Datos & Transacciones",
      "summary": "El archivo `knowledge-index.json` persiste:",
      "shelf": "standards",
      "word_count": 98,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_knowledge-engine_technical-debt-refactoring_md",
      "file_path": "knowledge/modules/knowledge-engine/technical-debt-refactoring.md",
      "title": "Módulo: knowledge-engine — Deuda Técnica & Refactorización",
      "summary": "1. **Paso 1**: Implementar compilador de `MASTER-PROJECT-KNOWLEDGE.md` integrado en `sync-data.js`.",
      "shelf": "standards",
      "word_count": 121,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_knowledge-engine_module-spec_md",
      "file_path": "knowledge/modules/knowledge-engine/module-spec.md",
      "title": "Módulo: knowledge-engine — Especificación & Tarjetas CRC",
      "summary": "| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |",
      "shelf": "standards",
      "word_count": 208,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_knowledge-engine_requirements-and-rules_md",
      "file_path": "knowledge/modules/knowledge-engine/requirements-and-rules.md",
      "title": "Módulo: knowledge-engine — Requerimientos & Reglas de Negocio",
      "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
      "shelf": "business_rules",
      "word_count": 211,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_knowledge-engine_diagrams_md",
      "file_path": "knowledge/modules/knowledge-engine/diagrams.md",
      "title": "Módulo: knowledge-engine — Suite de 6 Diagramas",
      "summary": "```mermaid",
      "shelf": "architecture",
      "word_count": 381,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_testing-qa-suite_data-and-transactions_md",
      "file_path": "knowledge/modules/testing-qa-suite/data-and-transactions.md",
      "title": "Módulo: testing-qa-suite — Datos & Transacciones",
      "summary": "",
      "shelf": "standards",
      "word_count": 68,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_testing-qa-suite_technical-debt-refactoring_md",
      "file_path": "knowledge/modules/testing-qa-suite/technical-debt-refactoring.md",
      "title": "Módulo: testing-qa-suite — Deuda Técnica & Refactorización",
      "summary": "",
      "shelf": "standards",
      "word_count": 94,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_testing-qa-suite_module-spec_md",
      "file_path": "knowledge/modules/testing-qa-suite/module-spec.md",
      "title": "Módulo: testing-qa-suite — Especificación & Tarjetas CRC",
      "summary": "| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |",
      "shelf": "standards",
      "word_count": 214,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_testing-qa-suite_requirements-and-rules_md",
      "file_path": "knowledge/modules/testing-qa-suite/requirements-and-rules.md",
      "title": "Módulo: testing-qa-suite — Requerimientos & Reglas de Negocio",
      "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
      "shelf": "business_rules",
      "word_count": 170,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_testing-qa-suite_diagrams_md",
      "file_path": "knowledge/modules/testing-qa-suite/diagrams.md",
      "title": "Módulo: testing-qa-suite — Suite de 6 Diagramas",
      "summary": "```mermaid",
      "shelf": "architecture",
      "word_count": 364,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_triple-sync-engine_data-and-transactions_md",
      "file_path": "knowledge/modules/triple-sync-engine/data-and-transactions.md",
      "title": "Módulo: triple-sync-engine — Datos & Transacciones",
      "summary": "",
      "shelf": "standards",
      "word_count": 72,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_triple-sync-engine_technical-debt-refactoring_md",
      "file_path": "knowledge/modules/triple-sync-engine/technical-debt-refactoring.md",
      "title": "Módulo: triple-sync-engine — Deuda Técnica & Refactorización",
      "summary": "",
      "shelf": "standards",
      "word_count": 78,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_triple-sync-engine_module-spec_md",
      "file_path": "knowledge/modules/triple-sync-engine/module-spec.md",
      "title": "Módulo: triple-sync-engine — Especificación & Tarjetas CRC",
      "summary": "| Clase / Componente | Estereotipo | Responsabilidades | Colaboradores |",
      "shelf": "standards",
      "word_count": 196,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_triple-sync-engine_requirements-and-rules_md",
      "file_path": "knowledge/modules/triple-sync-engine/requirements-and-rules.md",
      "title": "Módulo: triple-sync-engine — Requerimientos & Reglas de Negocio",
      "summary": "| ID | Severidad | Condición / Fórmula Lógica | Archivo de Validación | Excepción / Fallo |",
      "shelf": "business_rules",
      "word_count": 148,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_triple-sync-engine_diagrams_md",
      "file_path": "knowledge/modules/triple-sync-engine/diagrams.md",
      "title": "Módulo: triple-sync-engine — Suite de 6 Diagramas",
      "summary": "```mermaid",
      "shelf": "architecture",
      "word_count": 352,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_012_plane_style_sqlite_project_management_tasks_md",
      "file_path": "specs/012_plane_style_sqlite_project_management/tasks.md",
      "title": "Plan de Tareas — INT-012: Ingenieria Inversa Plane (Makeplane)",
      "summary": "",
      "shelf": "specs",
      "word_count": 425,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_013_screaming_architecture_plane_refactor_tasks_md",
      "file_path": "specs/013_screaming_architecture_plane_refactor/tasks.md",
      "title": "Plan de Tareas — INT-013: Screaming Architecture & Refactor Unificado Estilo Plane con CLI de Consulta Soberana",
      "summary": "",
      "shelf": "specs",
      "word_count": 449,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_agent-orchestrator_rules_md",
      "file_path": "knowledge/modules/agent-orchestrator/rules.md",
      "title": "Reglas de Negocio Invariantes: agent-orchestrator",
      "summary": "",
      "shelf": "business_rules",
      "word_count": 141,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_dashboard-visualizer_rules_md",
      "file_path": "knowledge/modules/dashboard-visualizer/rules.md",
      "title": "Reglas de Negocio Invariantes: dashboard-visualizer",
      "summary": "",
      "shelf": "business_rules",
      "word_count": 91,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_knowledge-engine_rules_md",
      "file_path": "knowledge/modules/knowledge-engine/rules.md",
      "title": "Reglas de Negocio Invariantes: knowledge-engine",
      "summary": "",
      "shelf": "business_rules",
      "word_count": 102,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_testing-qa-suite_rules_md",
      "file_path": "knowledge/modules/testing-qa-suite/rules.md",
      "title": "Reglas de Negocio Invariantes: testing-qa-suite",
      "summary": "",
      "shelf": "business_rules",
      "word_count": 99,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_modules_triple-sync-engine_rules_md",
      "file_path": "knowledge/modules/triple-sync-engine/rules.md",
      "title": "Reglas de Negocio Invariantes: triple-sync-engine",
      "summary": "",
      "shelf": "business_rules",
      "word_count": 96,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_009_scrum_spec_subtasks_and_qa_evidence_evidence_md",
      "file_path": "specs/009_scrum_spec_subtasks_and_qa_evidence/evidence.md",
      "title": "Reporte Formal de Evidencias de Cierre: INT-009",
      "summary": "Se extendió y estandarizó la arquitectura del arnés para alinearla con el estándar de la industria en **Scrum / Agile** y **Jira**:",
      "shelf": "specs",
      "word_count": 658,
      "reading_time_min": 4,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_010_harness_root_cleanliness_encapsulation_verification-report_md",
      "file_path": "specs/010_harness_root_cleanliness_encapsulation/verification-report.md",
      "title": "Reporte de Verificación - Encapsulamiento de Archivos y Limpieza de Raíz para Adopción del Arnés",
      "summary": "| Criterio | Estado | Evidencia |",
      "shelf": "specs",
      "word_count": 513,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_011_encapsulate_specs_and_scripts_verification-report_md",
      "file_path": "specs/011_encapsulate_specs_and_scripts/verification-report.md",
      "title": "Reporte de Verificación - Encapsulamiento de Specs, verify.sh y project-spec.yaml en project-docs/",
      "summary": "| Criterio | Estado | Evidencia |",
      "shelf": "specs",
      "word_count": 306,
      "reading_time_min": 2,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_012_plane_style_sqlite_project_management_verification-report_md",
      "file_path": "specs/012_plane_style_sqlite_project_management/verification-report.md",
      "title": "Reporte de Verificación Técnica — INT-012: Plane Style Project Management",
      "summary": "| Requerimiento (EARS) | Componente Implementado | Suite de Pruebas | Resultado |",
      "shelf": "specs",
      "word_count": 462,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_013_screaming_architecture_plane_refactor_verification-report_md",
      "file_path": "specs/013_screaming_architecture_plane_refactor/verification-report.md",
      "title": "Reporte de Verificación Técnica — INT-013: Screaming Architecture & Plane Refactor",
      "summary": "| Requerimiento (EARS) | Componente Implementado | Suite de Pruebas | Resultado |",
      "shelf": "specs",
      "word_count": 497,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_011_encapsulate_specs_and_scripts_requirements_md",
      "file_path": "specs/011_encapsulate_specs_and_scripts/requirements.md",
      "title": "Requirements: Encapsulamiento Completo de Specs, verify.sh y project-spec.yaml en project-docs/",
      "summary": "| Campo | Valor |",
      "shelf": "specs",
      "word_count": 406,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_010_harness_root_cleanliness_encapsulation_requirements_md",
      "file_path": "specs/010_harness_root_cleanliness_encapsulation/requirements.md",
      "title": "Requirements: Encapsulamiento de Archivos y Limpieza de Raíz para Adopción del Arnés",
      "summary": "| Campo | Valor |",
      "shelf": "specs",
      "word_count": 854,
      "reading_time_min": 5,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_011_encapsulate_specs_and_scripts_tasks_md",
      "file_path": "specs/011_encapsulate_specs_and_scripts/tasks.md",
      "title": "Tasks: Encapsulamiento Completo de Specs, verify.sh y project-spec.yaml en project-docs/",
      "summary": "",
      "shelf": "specs",
      "word_count": 167,
      "reading_time_min": 1,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-specs_010_harness_root_cleanliness_encapsulation_tasks_md",
      "file_path": "specs/010_harness_root_cleanliness_encapsulation/tasks.md",
      "title": "Tasks: Encapsulamiento de Archivos y Limpieza de Raíz para Adopción del Arnés",
      "summary": "",
      "shelf": "specs",
      "word_count": 566,
      "reading_time_min": 3,
      "updated_at": "2026-11-07 18:24:36"
    },
    {
      "id": "page-knowledge_01-project-overview-and-business_md",
      "file_path": "knowledge/01-project-overview-and-business.md",
      "title": "Visión del Producto, Contexto de Negocio y Stakeholders (IEEE Std. 830-1998)",
      "summary": "El **AI Agentic SDD Engineering Harness** es un arnés universal y agnóstico de ingeniería de software dirigido por especificaciones (**Spec-Driven Development —...",
      "shelf": "standards",
      "word_count": 1211,
      "reading_time_min": 7,
      "updated_at": "2026-11-07 18:24:36"
    }
  ]
}
};
window.__PLANE_DATA__ = window.__FALLBACK_DATA__.planeData;
