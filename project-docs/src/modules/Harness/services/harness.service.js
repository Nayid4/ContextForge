/**
 * Harness Service - Data Access Layer for Agent Orchestration & SDD Harness Governance
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */

export const CANONICAL_AGENTS = [
  {
    id: 'leader',
    name: 'Líder Técnico & Orquestador',
    role: 'Agente Principal (Master Leader)',
    model: 'inherit',
    workspace: 'inherit',
    description: 'Orquesta el ciclo de vida SDD, valida entorno y ramas semánticas INT-*, coordina subagentes y puertas humanas con ask_question.',
    responsibilities: [
      'Validación de rama base (main/master/dev) y creación de rama de trabajo <= 80c',
      'Orquestación de invocación de subagentes (spec-author, implementer, reviewer)',
      'Puerta de aprobación humana con ask_question',
      'Pregunta de integración (merge o PR) y cierre de ciclo'
    ],
    tools: ['read_file', 'write_file', 'edit_file', 'run_command', 'ask_question', 'invoke_subagent', 'send_message']
  },
  {
    id: 'spec-author',
    name: 'Autor de Especificaciones SDD',
    role: 'Subagente Especialista en Requerimientos',
    model: 'inherit',
    workspace: 'inherit',
    description: 'Redacta specifications técnicas, decisiones arquitectónicas y subtareas Jira DEV/QA bajo el estándar Scrum en project-docs/specs/.',
    responsibilities: [
      'Redacción de User Stories Scrum (Como/Quiero/Para)',
      'Definición de criterios de aceptación con sintaxis EARS',
      'Desglose formal de subtareas Jira DEV y QA',
      'Listado de Definition of Done (DoD) y Definition of Ready (DoR)'
    ],
    tools: ['read_file', 'write_file', 'edit_file', 'search_web']
  },
  {
    id: 'implementer',
    name: 'Implementador Agnóstico & QA on-demand',
    role: 'Subagente de Construcción y Pruebas',
    model: 'inherit',
    workspace: 'inherit',
    description: 'Ejecuta las tareas técnicas, escribe código de producción y pruebas automatizadas (TDD, SDD o FTD), ejecutando verify.sh y registrando trazabilidad R-to-Tests.',
    responsibilities: [
      'Implementación guiada por pruebas (TDD primero rojo, luego verde)',
      'Construcción de código de producción desacoplado',
      'Ejecución del pipeline de verificación multinivel (verify.sh)',
      'Documentación de trazabilidad de pruebas unitarias y E2E'
    ],
    tools: ['read_file', 'write_file', 'edit_file', 'run_command']
  },
  {
    id: 'reviewer',
    name: 'Revisor de Calidad & Auditoría QA',
    role: 'Subagente Auditor Independiente',
    model: 'inherit',
    workspace: 'inherit',
    description: 'Audita que la feature cumpla al 100% con su spec, matriz R-to-Tests, arquitectura screaming, cierre de subtareas Jira DEV/QA y capturas de evidencia. No edita código.',
    responsibilities: [
      'Auditoría estricta de cumplimiento de especificación sin modificar código',
      'Verificación de capturas de pantalla de evidencia en project-docs/specs/.../evidence/',
      'Inspección de cero emojis unicode en código fuente',
      'Validación de cierre determinista de subtareas Jira DEV y QA'
    ],
    tools: ['read_file', 'run_command']
  }
];

export const CANONICAL_SKILLS = [
  { name: 'technical-audit', description: 'Auditoría técnica y generación de project-spec.yaml', synced: true },
  { name: 'project-knowledge', description: 'Extracción de base de conocimiento soberana C4, UML y reglas', synced: true },
  { name: 'generate-verify', description: 'Generación de script verify.sh multinivel', synced: true },
  { name: 'verification', description: 'Documentación y consulta de niveles de verificación', synced: true },
  { name: 'requirements-analysis', description: 'Análisis de requerimientos y generación de feature_list.json', synced: true },
  { name: 'generate-spec', description: 'Generación de spec técnico formal, tareas y decisiones', synced: true },
  { name: 'implement-tdd', description: 'Implementación guiada por pruebas (TDD)', synced: true },
  { name: 'implement-sdd', description: 'Implementación dirigida por spec por fases (SDD)', synced: true },
  { name: 'implement-ftd', description: 'Implementación ágil para cambios menores (FTD)', synced: true },
  { name: 'write-unit-tests', description: 'Escritura de tests unitarios agnósticos al lenguaje', synced: true },
  { name: 'acceptance-testing', description: 'Pruebas de aceptación con Playwright, caja blanca/negra y carga', synced: true },
  { name: 'targeted-qa', description: 'Pruebas focalizadas de QA bajo demanda', synced: true },
  { name: 'verify-spec', description: 'Reconciliación de metadata y verificación de cierre', synced: true },
  { name: 'api-test-plan', description: 'Plan de pruebas API REST markdown y .http', synced: true },
  { name: 'execute-api-test-plan', description: 'Ejecución de plan API con curl y hallazgos', synced: true },
  { name: 'sync-skills', description: 'Sincronización triple de skills hacia Copilot y Antigravity', synced: true },
  { name: 'start-feature', description: 'Orquestación de ciclo SDD para nueva feature o bugfix', synced: true },
  { name: 'sdd-workflow', description: 'Guía y ejecución del flujo integral SDD multi-agente', synced: true }
];

export class HarnessService {
  constructor() {
    this.agents = [...CANONICAL_AGENTS];
    this.skills = [...CANONICAL_SKILLS];
  }

  getAgents() {
    return this.agents;
  }

  getAgentById(id) {
    return this.agents.find(a => a.id === id) || null;
  }

  getSkills() {
    return this.skills;
  }

  getGovernanceOverview() {
    return {
      branchingConvention: '{feature|bugfix}/INT-{numero}/{nombre} (máximo 80 caracteres)',
      commitFormat: 'feat(scope): descripción / fix(scope): descripción',
      tripleSyncRoot: '.opencode/skills/ (fuente de verdad) -> .github/skills/ y .agents/skills/',
      zeroEmojiInvariant: '100% código fuente, marcado y documentación sin caracteres emoji unicode',
      rootCleanliness: 'Estrictamente 4 directorios (.agents, .git, .github, .opencode, project-docs) y 4 archivos en raíz'
    };
  }
}

export const harnessService = new HarnessService();
