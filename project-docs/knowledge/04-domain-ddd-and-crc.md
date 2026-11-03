---
id: DOC-DDD-CRC
title: "Modelo de Dominio DDD, Lenguaje Ubicuo y Tarjetas CRC"
module: "global"
status: "Publicado"
version: "4.0.0"
last_updated: "2026-11-03"
tags: ["ddd", "ubiquitous-language", "context-map", "crc-cards", "strategic-ddd"]
---

# Modelo de Dominio DDD, Lenguaje Ubicuo y Tarjetas CRC

> [!NOTE]
> Especificación formal del diseño guiado por el dominio (DDD Estratégico y Táctico), mapa de contextos y catálogo de Tarjetas CRC (*Class-Responsibility-Collaborator*).

---

## 1. Clasificación de Subdominios (DDD Estratégico)

1. **Core Domain (Dominio Central)**:
   - **`agent-orchestrator`**: Orquestación del ciclo de vida SDD, ciclo de subagentes especializados, cumplimiento estricto de convenciones de branching y puertas humanas con `ask_question`.
2. **Supporting Subdomains (Subdominios de Soporte)**:
   - **`triple-sync-engine`**: Motor de sincronización triple y garantía de paridad entre OpenCode, Copilot y Antigravity.
   - **`knowledge-engine`**: Motor de ingesta y preservación de contexto soberano Docs-as-Code anti-sesgo.
   - **`dashboard-visualizer`**: Tablero interactivo, lector editorial, editor dual ContextForge y visualizador 3D.
   - **`testing-qa-suite`**: Automatización del arnés de verificación en 8 niveles y runner de `verify.sh`.
3. **Generic Subdomains (Subdominios Genéricos)**:
   - Control de versiones (Git), motor de renderizado Markdown y Three.js.

---

## 2. Diccionario de Lenguaje Ubicuo (Ubiquitous Language)

| Término Ubicuo | Definición Funcional y Técnica | Equivalente en Código / Artefactos |
|---|---|---|
| **Harness (Arnés)** | Conjunto de reglas, scripts, skills y roles que guían y restringen a los agentes de IA. | `.agents/`, `.opencode/`, `.github/`, `verify.sh` |
| **Spec-Driven Development (SDD)** | Metodología donde ninguna línea de código se escribe antes de aprobar formalmente su spec. | `specs/{NNN}_{name}/`, `generate-spec` |
| **Human Gate (Puerta Humana)** | Pausa obligatoria del flujo que bloquea la ejecución del agente hasta confirmación del humano. | Herramienta nativa `ask_question` |
| **Rama INT-*** | Rama de trabajo dedicada que cumple `{feature\|bugfix}/INT-{numero}/{nombre}` $\le 80$ caracteres. | Convención en `AGENTS.md` y `branches.md` |
| **Docs-as-Code** | Práctica de gestionar la documentación en Markdown versionado junto al código fuente. | `project-docs/knowledge/**` |
| **Triple Sincronización** | Replicación unidireccional obligatoria desde `.opencode/` hacia Copilot y Antigravity. | `sync-skills` y `skills-sync.md` |
| **Fallback Data** | Objeto embebido en JS que permite abrir el tablero vía `file:///` sin servidores ni CORS. | `project-docs/data-fallback.js` |

---

## 3. Catálogo Maestro de Tarjetas CRC (Class-Responsibility-Collaborator)

### Tarjeta CRC 1: `LeaderAgent`
- **Estereotipo DDD**: `<<AgentOrchestrator>>`
- **Responsabilidades**:
  1. Validar entorno de trabajo y rama base (`main`, `master`, `dev`).
  2. Crear la rama de trabajo `{feature|bugfix}/INT-{numero}/{nombre_rama}` ($\le 80$ caracteres).
  3. Delegar tareas secuenciales en subagentes (`spec-author`, `implementer`, `reviewer`).
  4. Detener el flujo y solicitar aprobación humana mediante `ask_question`.
- **Colaboradores**: `GitCLI`, `SpecAuthorAgent`, `ImplementerAgent`, `ReviewerAgent`, `AskQuestionModal`.

### Tarjeta CRC 2: `SpecAuthorAgent`
- **Estereotipo DDD**: `<<RequirementsEngineer>>`
- **Responsabilidades**:
  1. Redactar especificaciones técnicas (`requirements.md`, `design.md`, `tasks.md`).
  2. Aplicar sintaxis formal de requerimientos EARS e IEEE 830.
  3. Recomendar técnica de implementación (TDD, SDD o FTD).
  4. Marcar la tarea como `spec_ready` sin tocar código fuente ni tests.
- **Colaboradores**: `KnowledgeIndex`, `FeatureList`, `LeaderAgent`.

### Tarjeta CRC 3: `ImplementerAgent`
- **Estereotipo DDD**: `<<SoftwareDeveloper>>`
- **Responsabilidades**:
  1. Implementar código de producción siguiendo la técnica aprobada.
  2. Escribir tests unitarios y de integración según la convención del stack.
  3. Ejecutar verificaciones automatizadas (`npm test`, `verify.sh`).
  4. Registrar la trazabilidad bidireccional $R \leftrightarrow Tests$ en `progress/impl_{name}.md`.
- **Colaboradores**: `ProjectSpec`, `TestRunner`, `LeaderAgent`, `ReviewerAgent`.

### Tarjeta CRC 4: `ReviewerAgent`
- **Estereotipo DDD**: `<<QualityAuditor>>`
- **Responsabilidades**:
  1. Auditar de forma imparcial el cumplimiento del 100% de los criterios del spec.
  2. Verificar cobertura de código, compilación y ausencia de errores de arquitectura.
  3. Emitir reporte de aprobación o hallazgos sin editar código bajo ninguna circunstancia.
- **Colaboradores**: `ProjectSpec`, `TasksList`, `LeaderAgent`.

### Tarjeta CRC 5: `KnowledgeEngine`
- **Estereotipo DDD**: `<<KnowledgeRepository>>`
- **Responsabilidades**:
  1. Escanear el código fuente y extraer modelos C4, UML, ERD y reglas `BR-*`.
  2. Generar y mantener la base de conocimiento en `project-docs/knowledge/`.
  3. Compilar el archivo maestro unificado `MASTER-PROJECT-KNOWLEDGE.md`.
  4. Actualizar el grafo de relaciones en `knowledge-index.json`.
- **Colaboradores**: `SyncDataScript`, `DashboardStore`, `MarkdownParser`.
