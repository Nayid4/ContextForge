import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DOCS_DIR = path.resolve(__dirname, '../..');
const KNOWLEDGE_DIR = path.join(PROJECT_DOCS_DIR, 'knowledge');
const SPECS_DIR = path.join(PROJECT_DOCS_DIR, 'specs');
const FEATURE_LIST_PATH = path.join(PROJECT_DOCS_DIR, 'feature_list.json');
const AI_RUNS_MD_PATH = path.join(KNOWLEDGE_DIR, 'ai-runs-log.md');

export const DEFAULT_USERS = [
  { id: 'user-leader', username: 'leader', email: 'leader@harness.ai', display_name: 'Lider Tecnico & Orquestador', role: 'leader', is_bot: 1, bot_type: 'sdd-orchestrator', avatar_svg: 'shield' },
  { id: 'user-spec-author', username: 'spec-author', email: 'spec-author@harness.ai', display_name: 'Autor de Especificaciones SDD', role: 'spec-author', is_bot: 1, bot_type: 'sdd-spec-agent', avatar_svg: 'fileText' },
  { id: 'user-implementer', username: 'implementer', email: 'implementer@harness.ai', display_name: 'Implementador Agnostico & TDD', role: 'implementer', is_bot: 1, bot_type: 'sdd-code-agent', avatar_svg: 'terminal' },
  { id: 'user-reviewer', username: 'reviewer', email: 'reviewer@harness.ai', display_name: 'Revisor de Calidad & Auditoria QA', role: 'reviewer', is_bot: 1, bot_type: 'sdd-qa-auditor', avatar_svg: 'checkCircle' },
  { id: 'user-human-lead', username: 'human-lead', email: 'architect@harness.local', display_name: 'Ingeniero Lider (Human Gate)', role: 'human-lead', is_bot: 0, bot_type: 'human', avatar_svg: 'users' }
];

export const DEFAULT_API_TOKENS = [
  { id: 'tok-leader', user_id: 'user-leader', label: 'SDD Master Orchestrator Token', token_hash: 'plane_bot_tok_leader_sdd_v2_9f8a7b', user_type: 1 },
  { id: 'tok-spec', user_id: 'user-spec-author', label: 'SDD Spec Author Bot Token', token_hash: 'plane_bot_tok_spec_sdd_v2_3c4d5e', user_type: 1 },
  { id: 'tok-impl', user_id: 'user-implementer', label: 'SDD Implementer & QA Bot Token', token_hash: 'plane_bot_tok_impl_sdd_v2_7e6f5a', user_type: 1 },
  { id: 'tok-rev', user_id: 'user-reviewer', label: 'SDD Reviewer & Auditor Bot Token', token_hash: 'plane_bot_tok_rev_sdd_v2_1a2b3c', user_type: 1 }
];

export const DEFAULT_STATES = [
  { id: 'state-backlog', name: 'Backlog', slug: 'backlog', color: '#71717a', sequence: 10, group_name: 'backlog', is_default: 1 },
  { id: 'state-todo', name: 'Todo', slug: 'todo', color: '#3b82f6', sequence: 20, group_name: 'unstarted', is_default: 0 },
  { id: 'state-in-progress', name: 'In Progress', slug: 'in-progress', color: '#eab308', sequence: 30, group_name: 'started', is_default: 0 },
  { id: 'state-in-review', name: 'In Review', slug: 'in-review', color: '#a855f7', sequence: 40, group_name: 'review', is_default: 0 },
  { id: 'state-done', name: 'Done', slug: 'done', color: '#22c55e', sequence: 50, group_name: 'completed', is_default: 0 },
  { id: 'state-cancelled', name: 'Cancelled', slug: 'cancelled', color: '#ef4444', sequence: 60, group_name: 'cancelled', is_default: 0 }
];

export const DEFAULT_LABELS = [
  { id: 'lbl-feature', name: 'feature', description: 'Nueva funcionalidad del sistema', color: '#6366f1', sort_order: 10 },
  { id: 'lbl-bugfix', name: 'bugfix', description: 'Correccion determinista de defecto', color: '#ef4444', sort_order: 20 },
  { id: 'lbl-sdd', name: 'sdd-spec', description: 'Desarrollo guiado por especificacion formal', color: '#8b5cf6', sort_order: 30 },
  { id: 'lbl-tdd', name: 'tdd-verified', description: 'Cobertura de pruebas guiada por TDD', color: '#10b981', sort_order: 40 },
  { id: 'lbl-qa', name: 'qa-evidence', description: 'Evidencia de verificacion multinivel y E2E', color: '#06b6d4', sort_order: 50 },
  { id: 'lbl-arch', name: 'screaming-arch', description: 'Arquitectura Screaming orientada a dominios', color: '#f59e0b', sort_order: 60 },
  { id: 'lbl-ai', name: 'ai-agent', description: 'Trazabilidad de ejecucion de skills e IA', color: '#ec4899', sort_order: 70 }
];

export const DEFAULT_ISSUE_TYPES = [
  { id: 'type-feature', name: 'Feature', description: 'Historia de usuario o capacidad funcional SDD', is_epic: 0, is_default: 1, level: 1 },
  { id: 'type-bugfix', name: 'Bugfix', description: 'Correccion de error o anomalia tecnica', is_epic: 0, is_default: 0, level: 1 },
  { id: 'type-epic', name: 'Epic', description: 'Iniciativa multi-modulo de alto nivel', is_epic: 1, is_default: 0, level: 0 }
];

export const DEFAULT_ESTIMATE_POINTS = [
  { id: 'ep-1', key_val: 0, value: '1', description: 'Cambio puntual o ajuste FTD' },
  { id: 'ep-2', key_val: 1, value: '2', description: 'Tarea acotada de complejidad baja' },
  { id: 'ep-3', key_val: 2, value: '3', description: 'Feature estandar con tests unitarios' },
  { id: 'ep-5', key_val: 3, value: '5', description: 'Feature multi-componente con E2E' },
  { id: 'ep-8', key_val: 4, value: '8', description: 'Arquitectura transversal o migracion' },
  { id: 'ep-13', key_val: 5, value: '13', description: 'Rediseño estructural multi-dominio' }
];

export const DEFAULT_CYCLES = [
  { id: 'cycle-1', name: 'Ciclo 1: Fundacional (Harness Core)', description: 'Arquitectura base, sincronizacion de skills y tablero visual', start_date: '2026-10-15', end_date: '2026-10-31', status: 'completed' },
  { id: 'cycle-2', name: 'Ciclo 2: Calidad, DeepWiki & Encapsulamiento', description: 'Testing multinivel, Playwright E2E y pureza de raiz', start_date: '2026-11-01', end_date: '2026-11-06', status: 'completed' },
  { id: 'cycle-3', name: 'Ciclo 3: Plane Multi-Vista & SQLite para IA', description: 'Replicacion UX Plane, modelo relacional completo y persistencia dual con Skills IA', start_date: '2026-11-07', end_date: '2026-11-20', status: 'active' }
];

export const DEFAULT_MODULES = [
  { id: 'mod-orchestrator', name: 'Agent Orchestrator', description: 'Orquestacion de agentes autonomos, roles y reglas de branching', lead_role: 'leader', status: 'completed' },
  { id: 'mod-visualizer', name: 'Dashboard Visualizer', description: 'Tablero visual, vistas Plane, grafos de dependencias y 3D', lead_role: 'implementer', status: 'in_progress' },
  { id: 'mod-qa', name: 'Testing QA Suite', description: 'Verificacion multinivel en 9 fases, Playwright E2E y suites de prueba', lead_role: 'reviewer', status: 'completed' },
  { id: 'mod-knowledge', name: 'Knowledge Engine', description: 'Base de conocimiento Docs-as-Code soberana y DeepWiki', lead_role: 'spec-author', status: 'completed' },
  { id: 'mod-core', name: 'Harness Core', description: 'Scripts verify.sh, configuraciones y reglas del arnes', lead_role: 'leader', status: 'completed' }
];

export const DEFAULT_VIEWS = [
  {
    id: 'view-all-issues',
    name: 'Todas las Tareas SDD',
    description: 'Vista maestra de todas las features y bugfixes del proyecto',
    filters_json: JSON.stringify({ state: 'all', priority: 'all', assignee: 'all' }),
    display_filters_json: JSON.stringify({ layout: 'board', group_by: 'state', order_by: 'sequence_id' }),
    sort_order: 10
  },
  {
    id: 'view-active-cycle',
    name: 'Sprint Activo (Ciclo 3)',
    description: 'Tareas comprometidas en el ciclo de iteracion actual',
    filters_json: JSON.stringify({ cycle_id: 'cycle-3', state: 'all' }),
    display_filters_json: JSON.stringify({ layout: 'list', group_by: 'priority', order_by: 'priority' }),
    sort_order: 20
  },
  {
    id: 'view-qa-verified',
    name: 'Auditadas por QA & Evidencias',
    description: 'Features cerradas con reporte de verificacion y capturas E2E',
    filters_json: JSON.stringify({ state: 'state-done', label: 'lbl-qa' }),
    display_filters_json: JSON.stringify({ layout: 'spreadsheet', group_by: 'module', order_by: 'updated_at' }),
    sort_order: 30
  }
];

export const DEFAULT_AI_CONFIGS = [
  { id: 'aicfg-provider', key: 'LLM_PROVIDER', value: 'antigravity-gemini-native', provider: 'antigravity-gemini', model: 'gemini-2.5-pro', category: 'AI_ENGINE' },
  { id: 'aicfg-model', key: 'LLM_MODEL', value: 'gemini-2.5-pro', provider: 'antigravity-gemini', model: 'gemini-2.5-pro', category: 'AI_ENGINE' },
  { id: 'aicfg-persistence', key: 'DUAL_PERSISTENCE_ENGINE', value: 'SQLite WAL (harness.db) + Markdown Mirror (.md)', provider: 'harness-core', model: 'sqlite-3-wal', category: 'STORAGE' },
  { id: 'aicfg-sync', key: 'TRIPLE_SKILL_MIRROR', value: '.opencode/skills -> .github/skills & .agents/skills', provider: 'harness-core', model: 'sync-skills-v2', category: 'GOVERNANCE' },
  { id: 'aicfg-branching', key: 'SEMANTIC_BRANCH_RULE', value: '{feature|bugfix}/INT-{id}/{slug} (<= 80 chars)', provider: 'harness-core', model: 'git-guard', category: 'GOVERNANCE' }
];

export function mapStatusToStateId(status) {
  switch (status) {
    case 'pending': return 'state-backlog';
    case 'spec_ready': return 'state-todo';
    case 'in_progress': return 'state-in-progress';
    case 'in_review': return 'state-in-review';
    case 'done': return 'state-done';
    case 'cancelled': return 'state-cancelled';
    default: return 'state-backlog';
  }
}

export function mapStateIdToStatus(stateId) {
  switch (stateId) {
    case 'state-backlog': return 'pending';
    case 'state-todo': return 'spec_ready';
    case 'state-in-progress': return 'in_progress';
    case 'state-in-review': return 'in_review';
    case 'state-done': return 'done';
    case 'state-cancelled': return 'cancelled';
    default: return 'pending';
  }
}

export function mapPriority(p) {
  if (!p) return 'none';
  const norm = p.toLowerCase();
  if (norm === 'p0' || norm === 'urgent') return 'urgent';
  if (norm === 'p1' || norm === 'high') return 'high';
  if (norm === 'p2' || norm === 'medium') return 'medium';
  if (norm === 'p3' || norm === 'low') return 'low';
  return 'none';
}

export function mapModuleId(modName) {
  if (!modName) return 'mod-core';
  const m = modName.toLowerCase();
  if (m.includes('orchestrator')) return 'mod-orchestrator';
  if (m.includes('visualizer') || m.includes('dashboard')) return 'mod-visualizer';
  if (m.includes('testing') || m.includes('qa')) return 'mod-qa';
  if (m.includes('knowledge')) return 'mod-knowledge';
  return 'mod-core';
}

export function mapCycleId(featureId) {
  if (featureId <= 6) return 'cycle-1';
  if (featureId <= 11) return 'cycle-2';
  return 'cycle-3';
}

export function mapRoleToUserId(role) {
  switch (role) {
    case 'leader': return 'user-leader';
    case 'spec-author': return 'user-spec-author';
    case 'implementer': return 'user-implementer';
    case 'reviewer': return 'user-reviewer';
    case 'human-lead': return 'user-human-lead';
    default: return 'user-leader';
  }
}

export function syncFilesToSQLite(db) {
  // 1. Workspace
  db.prepare(`
    INSERT INTO workspaces (id, name, slug, owner_id, organization_size, timezone)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      updated_at = CURRENT_TIMESTAMP;
  `).run('ws-harness', 'Harness Engineering Workspace', 'harness-engineering', 'user-leader', '10-50', 'America/Bogota');

  // 2. Users (Human + AI Bots) & Workspace Members & API Tokens
  const userStmt = db.prepare(`
    INSERT INTO users (id, username, email, display_name, role, is_bot, bot_type, avatar_svg, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      display_name = excluded.display_name,
      role = excluded.role,
      is_bot = excluded.is_bot,
      bot_type = excluded.bot_type,
      avatar_svg = excluded.avatar_svg;
  `);
  const memberStmt = db.prepare(`
    INSERT INTO workspace_members (id, workspace_id, user_id, role, is_active)
    VALUES (?, 'ws-harness', ?, 20, 1)
    ON CONFLICT(id) DO NOTHING;
  `);
  for (const u of DEFAULT_USERS) {
    userStmt.run(u.id, u.username, u.email, u.display_name, u.role, u.is_bot, u.bot_type, u.avatar_svg);
    memberStmt.run(`wm-${u.username}`, u.id);
  }

  const tokenStmt = db.prepare(`
    INSERT INTO api_tokens (id, workspace_id, user_id, label, token_hash, user_type, is_active)
    VALUES (?, 'ws-harness', ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET label = excluded.label;
  `);
  for (const t of DEFAULT_API_TOKENS) {
    tokenStmt.run(t.id, t.user_id, t.label, t.token_hash, t.user_type);
  }

  // 3. Project
  db.prepare(`
    INSERT INTO projects (
      id, workspace_id, name, slug, identifier, description,
      estimate_id, default_state_id, default_assignee_id, project_lead_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      identifier = excluded.identifier,
      description = excluded.description,
      updated_at = CURRENT_TIMESTAMP;
  `).run(
    'proj-harness',
    'ws-harness',
    'Arnes de Ingenieria SDD Multi-Agente',
    'harness-sdd',
    'INT',
    'Plataforma integral de ingenieria dirigida por specs con soporte multi-agente, modelo relacional Plane y persistencia dual SQLite + Markdown',
    'est-fibonacci',
    'state-backlog',
    'user-leader',
    'user-leader'
  );

  // 4. States
  const stateStmt = db.prepare(`
    INSERT INTO states (id, project_id, name, slug, color, sequence, group_name, is_default)
    VALUES (?, 'proj-harness', ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      color = excluded.color,
      sequence = excluded.sequence,
      group_name = excluded.group_name,
      is_default = excluded.is_default;
  `);
  for (const s of DEFAULT_STATES) {
    stateStmt.run(s.id, s.name, s.slug, s.color, s.sequence, s.group_name, s.is_default || 0);
  }

  // 5. Labels
  const labelStmt = db.prepare(`
    INSERT INTO labels (id, project_id, name, description, color, sort_order)
    VALUES (?, 'proj-harness', ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      color = excluded.color,
      sort_order = excluded.sort_order;
  `);
  for (const l of DEFAULT_LABELS) {
    labelStmt.run(l.id, l.name, l.description, l.color, l.sort_order);
  }

  // 6. Estimates & Estimate Points
  db.prepare(`
    INSERT INTO estimates (id, project_id, name, description, type, last_used)
    VALUES ('est-fibonacci', 'proj-harness', 'Fibonacci SDD Points', 'Escala de estimacion agil para tareas SDD', 'points', 1)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name;
  `).run();

  const epStmt = db.prepare(`
    INSERT INTO estimate_points (id, estimate_id, project_id, key_val, value, description)
    VALUES (?, 'est-fibonacci', 'proj-harness', ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET value = excluded.value, description = excluded.description;
  `);
  for (const ep of DEFAULT_ESTIMATE_POINTS) {
    epStmt.run(ep.id, ep.key_val, ep.value, ep.description);
  }

  // 7. Issue Types
  const typeStmt = db.prepare(`
    INSERT INTO issue_types (id, project_id, name, description, is_epic, is_default, level)
    VALUES (?, 'proj-harness', ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description;
  `);
  for (const it of DEFAULT_ISSUE_TYPES) {
    typeStmt.run(it.id, it.name, it.description, it.is_epic, it.is_default, it.level);
  }

  // 8. Cycles
  const cycleStmt = db.prepare(`
    INSERT INTO cycles (id, project_id, name, description, start_date, end_date, owned_by_id, status)
    VALUES (?, 'proj-harness', ?, ?, ?, ?, 'user-leader', ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      status = excluded.status;
  `);
  for (const c of DEFAULT_CYCLES) {
    cycleStmt.run(c.id, c.name, c.description, c.start_date, c.end_date, c.status);
  }

  // 9. Modules
  const modStmt = db.prepare(`
    INSERT INTO modules (id, project_id, name, description, lead_id, lead_role, status)
    VALUES (?, 'proj-harness', ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      lead_id = excluded.lead_id,
      lead_role = excluded.lead_role,
      status = excluded.status;
  `);
  for (const m of DEFAULT_MODULES) {
    modStmt.run(m.id, m.name, m.description, mapRoleToUserId(m.lead_role), m.lead_role, m.status);
  }

  // 10. Issue Views & AI Configs
  const viewStmt = db.prepare(`
    INSERT INTO issue_views (id, project_id, workspace_id, name, description, filters_json, display_filters_json, sort_order)
    VALUES (?, 'proj-harness', 'ws-harness', ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      filters_json = excluded.filters_json,
      display_filters_json = excluded.display_filters_json;
  `);
  for (const v of DEFAULT_VIEWS) {
    viewStmt.run(v.id, v.name, v.description, v.filters_json, v.display_filters_json, v.sort_order);
  }

  const aiCfgStmt = db.prepare(`
    INSERT INTO ai_configs (id, workspace_id, key, value, provider, model, category)
    VALUES (?, 'ws-harness', ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      value = excluded.value,
      provider = excluded.provider,
      model = excluded.model,
      updated_at = CURRENT_TIMESTAMP;
  `);
  for (const cfg of DEFAULT_AI_CONFIGS) {
    aiCfgStmt.run(cfg.id, cfg.key, cfg.value, cfg.provider, cfg.model, cfg.category);
  }

  // 11. Issues, Subtasks, Relations, Labels, Assignees, Evidences & AI Runs from feature_list.json
  if (fs.existsSync(FEATURE_LIST_PATH)) {
    try {
      const raw = fs.readFileSync(FEATURE_LIST_PATH, 'utf8');
      const data = JSON.parse(raw);
      const features = data.features || [];

      const issueStmt = db.prepare(`
        INSERT INTO issues (
          id, project_id, workspace_id, sequence_id, title, description, description_stripped,
          state_id, priority, type_id, point, estimate_point_id, assignee_role,
          cycle_id, module_id, spec_folder, branch, completed_at,
          user_story_as_a, user_story_i_want, user_story_so_that,
          acceptance_criteria, evidence_summary, updated_at
        ) VALUES (?, 'proj-harness', 'ws-harness', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          description = excluded.description,
          description_stripped = excluded.description_stripped,
          state_id = excluded.state_id,
          priority = excluded.priority,
          type_id = excluded.type_id,
          point = excluded.point,
          estimate_point_id = excluded.estimate_point_id,
          assignee_role = excluded.assignee_role,
          cycle_id = excluded.cycle_id,
          module_id = excluded.module_id,
          spec_folder = excluded.spec_folder,
          branch = excluded.branch,
          completed_at = COALESCE(issues.completed_at, excluded.completed_at),
          user_story_as_a = excluded.user_story_as_a,
          user_story_i_want = excluded.user_story_i_want,
          user_story_so_that = excluded.user_story_so_that,
          acceptance_criteria = excluded.acceptance_criteria,
          evidence_summary = excluded.evidence_summary,
          updated_at = CURRENT_TIMESTAMP;
      `);

      const subtaskStmt = db.prepare(`
        INSERT INTO subtasks (id, issue_id, type, title, assignee_role, status, sequence)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          assignee_role = excluded.assignee_role,
          status = excluded.status,
          sequence = excluded.sequence;
      `);

      const cycleIssueStmt = db.prepare(`
        INSERT INTO cycle_issues (id, cycle_id, issue_id)
        VALUES (?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET cycle_id = excluded.cycle_id;
      `);

      const moduleIssueStmt = db.prepare(`
        INSERT INTO module_issues (id, module_id, issue_id)
        VALUES (?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET module_id = excluded.module_id;
      `);

      const assigneeStmt = db.prepare(`
        INSERT INTO issue_assignees (id, issue_id, assignee_id, assignee_role)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET assignee_id = excluded.assignee_id, assignee_role = excluded.assignee_role;
      `);

      const issueLabelStmt = db.prepare(`
        INSERT INTO issue_labels (id, issue_id, label_id)
        VALUES (?, ?, ?)
        ON CONFLICT(id) DO NOTHING;
      `);

      const relationStmt = db.prepare(`
        INSERT INTO issue_relations (id, issue_id, related_issue_id, relation_type)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO NOTHING;
      `);

      const evidenceStmt = db.prepare(`
        INSERT INTO issue_evidences (
          id, issue_id, subtask_id, type, title, file_path,
          report_markdown, metrics_json, created_by_skill
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          file_path = excluded.file_path,
          report_markdown = excluded.report_markdown,
          metrics_json = excluded.metrics_json;
      `);

      const activityStmt = db.prepare(`
        INSERT INTO issue_activities (
          id, issue_id, project_id, workspace_id, actor_id, actor_role,
          verb, field_name, old_value, new_value, comment_text
        ) VALUES (?, ?, 'proj-harness', 'ws-harness', ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO NOTHING;
      `);

      const aiRunStmt = db.prepare(`
        INSERT INTO ai_runs (
          id, workspace_id, project_id, issue_id, actor_id, agent_role,
          skill_name, task_type, provider, model, prompt_summary,
          response_markdown, artifacts_json, status, duration_ms
        ) VALUES (?, 'ws-harness', 'proj-harness', ?, ?, ?, ?, ?, 'antigravity-gemini', 'gemini-2.5-pro', ?, ?, ?, 'completed', ?)
        ON CONFLICT(id) DO NOTHING;
      `);

      // First pass: insert all issues, subtasks, cycle_issues, module_issues, assignees, labels, evidences, activities, ai_runs
      for (const f of features) {
        const issueId = `INT-${String(f.id).padStart(3, '0')}`;
        const stateId = mapStatusToStateId(f.status);
        const priority = mapPriority(f.priority);
        const cycleId = mapCycleId(f.id);
        const moduleId = mapModuleId(f.module);
        const typeId = f.type === 'bugfix' ? 'type-bugfix' : 'type-feature';
        const subCount = Array.isArray(f.subtasks) ? f.subtasks.length : 0;
        const point = subCount >= 4 ? 8 : (subCount >= 2 ? 5 : 3);
        const epId = `ep-${point}`;

        let assigneeRole = 'leader';
        if (f.subtasks && f.subtasks.length > 0) {
          const firstSub = f.subtasks[0];
          assigneeRole = firstSub.assignee || 'implementer';
        }

        const userStory = f.user_story || {};
        const acceptanceJson = JSON.stringify(f.acceptance || []);
        const evidenceSummary = f.evidence ? (f.evidence.dev_summary || '') : '';
        const completedAt = f.status === 'done' ? '2026-11-07T12:00:00Z' : null;

        issueStmt.run(
          issueId,
          f.id,
          f.title || f.name,
          f.description || '',
          f.description || '',
          stateId,
          priority,
          typeId,
          point,
          epId,
          assigneeRole,
          cycleId,
          moduleId,
          f.spec_folder || '',
          f.branch || '',
          completedAt,
          userStory.as_a || '',
          userStory.i_want || '',
          userStory.so_that || '',
          acceptanceJson,
          evidenceSummary
        );

        cycleIssueStmt.run(`ci-${cycleId}-${issueId}`, cycleId, issueId);
        moduleIssueStmt.run(`mi-${moduleId}-${issueId}`, moduleId, issueId);
        assigneeStmt.run(`ia-${issueId}-${assigneeRole}`, issueId, mapRoleToUserId(assigneeRole), assigneeRole);

        // Attach canonical labels
        const primaryLabel = f.type === 'bugfix' ? 'lbl-bugfix' : 'lbl-feature';
        issueLabelStmt.run(`il-${issueId}-${primaryLabel}`, issueId, primaryLabel);
        issueLabelStmt.run(`il-${issueId}-sdd`, issueId, 'lbl-sdd');
        if (f.status === 'done') {
          issueLabelStmt.run(`il-${issueId}-tdd`, issueId, 'lbl-tdd');
          issueLabelStmt.run(`il-${issueId}-qa`, issueId, 'lbl-qa');
        }
        if (moduleId === 'mod-visualizer') {
          issueLabelStmt.run(`il-${issueId}-arch`, issueId, 'lbl-arch');
        }

        // Subtasks
        if (Array.isArray(f.subtasks)) {
          let seq = 0;
          for (const sub of f.subtasks) {
            seq++;
            subtaskStmt.run(
              sub.id || `${issueId}-SUB-${seq}`,
              issueId,
              sub.type || 'development',
              sub.title || 'Subtarea',
              sub.assignee || 'implementer',
              sub.status || 'pending',
              seq
            );
          }
        }

        // Evidences from feature_list.json and spec folder
        if (f.evidence) {
          if (f.evidence.verification_report) {
            let reportMd = f.evidence.dev_summary || '';
            const fullReportPath = path.join(PROJECT_DOCS_DIR, '..', f.evidence.verification_report);
            if (fs.existsSync(fullReportPath)) {
              try {
                reportMd = fs.readFileSync(fullReportPath, 'utf8');
              } catch (_) {}
            }
            evidenceStmt.run(
              `ev-${issueId}-report`,
              issueId,
              `${issueId}-QA-1`,
              'verification-report',
              `Reporte de Verificacion (${issueId})`,
              f.evidence.verification_report,
              reportMd,
              JSON.stringify({ status: 'passed', verified: true }),
              'verify-spec'
            );
          }
          if (Array.isArray(f.evidence.qa_screenshots)) {
            f.evidence.qa_screenshots.forEach((shotPath, idx) => {
              evidenceStmt.run(
                `ev-${issueId}-shot-${idx + 1}`,
                issueId,
                `${issueId}-QA-1`,
                'screenshot',
                `Captura de Evidencia QA #${idx + 1} (${path.basename(shotPath)})`,
                shotPath,
                f.evidence.dev_summary || 'Captura de pantalla verificada con Playwright E2E',
                JSON.stringify({ format: path.extname(shotPath).replace('.', '') || 'png' }),
                'acceptance-testing'
              );
            });
          }
        }

        // Seed Audit Trail Activity & AI Runs for traceability
        activityStmt.run(
          `act-${issueId}-created`,
          issueId,
          'user-spec-author',
          'spec-author',
          'created',
          'state_id',
          'none',
          'state-todo',
          `Especificacion SDD generada en ${f.spec_folder || 'project-docs/specs'}`
        );

        if (f.status === 'done') {
          activityStmt.run(
            `act-${issueId}-done`,
            issueId,
            'user-reviewer',
            'reviewer',
            'updated',
            'state_id',
            'state-in-review',
            'state-done',
            `Verificacion multinivel superada y evidencia registrada para ${issueId}`
          );

          aiRunStmt.run(
            `airun-${issueId}-spec`,
            issueId,
            'user-spec-author',
            'spec-author',
            'generate-spec',
            'SPEC_GENERATION',
            `Generacion de especificacion formal SDD y criterios EARS para ${issueId}: ${f.title}`,
            `Especificacion creada en \`${f.spec_folder}\` con historia de usuario Scrum y subtareas DEV/QA.`,
            JSON.stringify([`${f.spec_folder}/requirements.md`, `${f.spec_folder}/design.md`, `${f.spec_folder}/tasks.md`]),
            1850
          );

          aiRunStmt.run(
            `airun-${issueId}-verify`,
            issueId,
            'user-reviewer',
            'reviewer',
            'verify-spec',
            'QA_VERIFICATION_CLOSURE',
            `Auditoria de cierre SDD y verificacion de 9 niveles para ${issueId}`,
            f.evidence ? (f.evidence.dev_summary || 'Verificacion completada en verde.') : 'Verificacion completada en verde.',
            JSON.stringify([f.evidence?.verification_report || `${f.spec_folder}/verification-report.md`]),
            2420
          );
        }
      }

      // Second pass: Issue Relations from f.dependencies
      for (const f of features) {
        const issueId = `INT-${String(f.id).padStart(3, '0')}`;
        if (Array.isArray(f.dependencies)) {
          for (const depIdNum of f.dependencies) {
            const depIssueId = typeof depIdNum === 'number'
              ? `INT-${String(depIdNum).padStart(3, '0')}`
              : String(depIdNum);
            const exists = db.prepare('SELECT id FROM issues WHERE id = ?').get(depIssueId);
            if (exists) {
              relationStmt.run(`rel-${issueId}-blocked-by-${depIssueId}`, issueId, depIssueId, 'blocked_by');
            }
          }
        }
      }
    } catch (e) {
      console.warn('[SQLITE-SYNC] Error sincronizando feature_list.json:', e.message);
    }
  }

  // 12. Ensure AI Runs Markdown Mirror exists before indexing Pages
  syncAiRunsToMarkdownFile(db);

  // 13. Pages & PageVersions desde Markdown (knowledge/ y specs/)
  const pageStmt = db.prepare(`
    INSERT INTO pages (
      id, project_id, workspace_id, owned_by_id, owned_by_role,
      file_path, title, summary, shelf, content_markdown, description_stripped,
      word_count, reading_time_min, updated_at
    ) VALUES (?, 'proj-harness', 'ws-harness', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      shelf = excluded.shelf,
      content_markdown = excluded.content_markdown,
      description_stripped = excluded.description_stripped,
      word_count = excluded.word_count,
      reading_time_min = excluded.reading_time_min,
      updated_at = CURRENT_TIMESTAMP;
  `);

  const pageVersionStmt = db.prepare(`
    INSERT INTO page_versions (
      id, page_id, version_number, content_markdown, description_stripped,
      owned_by_role, word_count
    ) VALUES (?, ?, 1, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      content_markdown = excluded.content_markdown,
      word_count = excluded.word_count,
      last_saved_at = CURRENT_TIMESTAMP;
  `);

  function classifyShelf(filename) {
    if (filename.startsWith('modules/')) return 'modules';
    if (filename.includes('architecture') || filename.includes('c4') || filename.includes('diagrams') || filename.includes('data-dictionary')) return 'architecture';
    if (filename.includes('business-rules') || filename.includes('rules')) return 'business_rules';
    if (filename.includes('requirements') || filename.includes('user-stories') || filename.includes('traceability')) return 'requirements';
    if (filename.includes('adr')) return 'adrs';
    if (filename.startsWith('specs/')) return 'specs';
    return 'standards';
  }

  function indexDirectory(dir, prefix = '', shelfOverride = null) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        indexDirectory(full, prefix ? `${prefix}/${ent.name}` : ent.name, shelfOverride);
      } else if (ent.isFile() && ent.name.endsWith('.md')) {
        const relPath = prefix ? `${prefix}/${ent.name}` : ent.name;
        try {
          const content = fs.readFileSync(full, 'utf8');
          const lines = content.split(/\r?\n/);
          let title = '';
          let summary = '';
          for (const l of lines) {
            const tr = l.trim();
            if (!title && tr.startsWith('# ')) {
              title = tr.replace(/^#\s+/, '').trim();
            } else if (title && !summary && tr && !tr.startsWith('#') && !tr.startsWith('>') && !tr.startsWith('-')) {
              summary = tr.slice(0, 160) + (tr.length > 160 ? '...' : '');
            }
            if (title && summary) break;
          }
          if (!title) {
            title = ent.name.replace(/\.md$/, '').replace(/[-_]/g, ' ');
          }
          const words = content.trim().split(/\s+/).filter(Boolean).length;
          const readingTime = Math.max(1, Math.ceil(words / 200));
          const pageId = `page-${relPath.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
          const shelf = shelfOverride || classifyShelf(relPath);
          const ownerRole = shelf === 'specs' ? 'spec-author' : 'leader';

          pageStmt.run(
            pageId,
            mapRoleToUserId(ownerRole),
            ownerRole,
            relPath,
            title,
            summary,
            shelf,
            content,
            summary,
            words,
            readingTime
          );

          pageVersionStmt.run(
            `pv-${pageId}-v1`,
            pageId,
            content,
            summary,
            ownerRole,
            words
          );
        } catch (err) {
          console.warn(`[SQLITE-SYNC] Error indexando archivo ${full}:`, err.message);
        }
      }
    }
  }

  indexDirectory(KNOWLEDGE_DIR, 'knowledge');
  indexDirectory(SPECS_DIR, 'specs', 'specs');
}

export function syncAiRunsToMarkdownFile(db) {
  try {
    const runs = db.prepare('SELECT * FROM ai_runs ORDER BY created_at DESC, id DESC LIMIT 100').all();
    if (!fs.existsSync(KNOWLEDGE_DIR)) {
      fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
    }
    const lines = [
      '# Registro Soberano de Ejecuciones IA y Skills SDD (Plane AI Audit Log)',
      '',
      'Documento sincronizado automaticamente desde la tabla `ai_runs` en `project-docs/data/harness.db`. Registra toda informacion, especificacion, evidencia y reporte emitido por las skills y subagentes del arnes.',
      '',
      '| ID Ejecucion | Fecha | Rol Agente | Skill Invocada | Tarea / Pagina | Tipo | Estado | Resumen |',
      '| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |'
    ];
    for (const r of runs) {
      const target = r.issue_id || r.page_id || 'GLOBAL';
      const dateStr = (r.created_at || '').slice(0, 19);
      const summaryClean = (r.prompt_summary || '').replace(/\|/g, '/').replace(/\r?\n/g, ' ');
      lines.push(`| \`${r.id}\` | ${dateStr} | \`${r.agent_role}\` | \`/${r.skill_name}\` | \`${target}\` | \`${r.task_type}\` | **${r.status.toUpperCase()}** | ${summaryClean} |`);
    }
    lines.push('');
    lines.push('## Detalle de Artefactos y Reportes Generados por IA');
    lines.push('');
    for (const r of runs.slice(0, 25)) {
      let artifacts = [];
      try {
        artifacts = JSON.parse(r.artifacts_json || '[]');
      } catch (_) {}
      lines.push(`### [${r.id}] /${r.skill_name} (${r.agent_role}) -> ${r.issue_id || r.page_id || 'Proyecto'}`);
      lines.push(`- **Proveedor / Modelo:** \`${r.provider}\` / \`${r.model}\``);
      lines.push(`- **Resumen de Tarea:** ${r.prompt_summary}`);
      if (r.response_markdown) {
        lines.push(`- **Resultado / Hallazgos:** ${r.response_markdown}`);
      }
      if (artifacts.length > 0) {
        lines.push(`- **Artefactos Sincronizados:** ${artifacts.map(a => `\`${a}\``).join(', ')}`);
      }
      lines.push('');
    }
    fs.writeFileSync(AI_RUNS_MD_PATH, lines.join('\n'), 'utf8');
  } catch (e) {
    console.warn('[SQLITE-SYNC] Error generando ai-runs-log.md:', e.message);
  }
}

export function syncIssueToFiles(db, issueIdOrDir, maybeIssueId = null) {
  const issueId = maybeIssueId || issueIdOrDir;
  if (!issueId || typeof issueId !== 'string') return;

  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
  if (!issue) return;

  const subtasks = db.prepare('SELECT * FROM subtasks WHERE issue_id = ? ORDER BY sequence ASC').all(issueId);
  const relations = db.prepare("SELECT * FROM issue_relations WHERE issue_id = ? AND relation_type = 'blocked_by'").all(issueId);
  const evidences = db.prepare('SELECT * FROM issue_evidences WHERE issue_id = ? ORDER BY created_at ASC').all(issueId);

  if (fs.existsSync(FEATURE_LIST_PATH)) {
    try {
      const raw = fs.readFileSync(FEATURE_LIST_PATH, 'utf8');
      const data = JSON.parse(raw);
      data.features = data.features || [];
      let feature = data.features.find(f => f.id === issue.sequence_id);

      if (!feature) {
        feature = {
          id: issue.sequence_id,
          type: issue.type_id === 'type-bugfix' ? 'bugfix' : 'feature',
          name: issue.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 45),
          title: issue.title,
          description: issue.description || '',
          priority: issue.priority ? issue.priority.toUpperCase() : 'P1',
          status: mapStateIdToStatus(issue.state_id),
          module: 'Harness Core',
          spec_folder: issue.spec_folder || '',
          branch: issue.branch || '',
          user_story: {
            as_a: issue.user_story_as_a || 'Desarrollador / Agente',
            i_want: issue.user_story_i_want || issue.title,
            so_that: issue.user_story_so_that || 'garantizar trazabilidad SDD'
          },
          acceptance: [],
          subtasks: [],
          dependencies: []
        };
        data.features.push(feature);
      } else {
        feature.status = mapStateIdToStatus(issue.state_id);
        feature.priority = issue.priority ? issue.priority.toUpperCase() : 'NONE';
        feature.title = issue.title;
        feature.description = issue.description;
      }

      if (subtasks.length > 0) {
        feature.subtasks = subtasks.map(s => ({
          id: s.id,
          type: s.type,
          title: s.title,
          assignee: s.assignee_role,
          status: s.status
        }));
      }

      if (relations.length > 0) {
        feature.dependencies = relations
          .map(r => {
            const m = String(r.related_issue_id).match(/INT-0*(\d+)/);
            return m ? Number(m[1]) : null;
          })
          .filter(Boolean);
      }

      if (evidences.length > 0) {
        feature.evidence = feature.evidence || {};
        const shots = evidences.filter(e => e.type === 'screenshot').map(e => e.file_path);
        const rep = evidences.find(e => e.type === 'verification-report' || e.type === 'report');
        if (shots.length > 0) feature.evidence.qa_screenshots = shots;
        if (rep) {
          feature.evidence.verification_report = rep.file_path;
          if (rep.report_markdown) feature.evidence.dev_summary = rep.report_markdown.slice(0, 300);
        }
        if (issue.evidence_summary) {
          feature.evidence.dev_summary = issue.evidence_summary;
        }
      }

      fs.writeFileSync(FEATURE_LIST_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
    } catch (e) {
      console.warn('[SQLITE-SYNC] Error guardando issue en feature_list.json:', e.message);
    }
  }
}

export function syncPageToFile(db, pageId) {
  const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(pageId);
  if (!page) return;

  let filePath = '';
  if (page.file_path.startsWith('knowledge/')) {
    filePath = path.join(PROJECT_DOCS_DIR, page.file_path);
  } else if (page.file_path.startsWith('specs/')) {
    filePath = path.join(PROJECT_DOCS_DIR, page.file_path);
  } else {
    filePath = path.join(KNOWLEDGE_DIR, page.file_path);
  }

  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, page.content_markdown, 'utf8');
  } catch (e) {
    console.warn(`[SQLITE-SYNC] Error guardando pagina en ${filePath}:`, e.message);
  }
}

export function recordSkillExecution(db, {
  skill_name,
  agent_role = 'leader',
  issue_id = null,
  page_id = null,
  task_type = 'SDD_SKILL_EXECUTION',
  prompt_summary = '',
  response_markdown = '',
  artifacts = [],
  status = 'completed',
  duration_ms = 1200
} = {}) {
  const runId = `airun-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const normalizedIssueId = issue_id
    ? (String(issue_id).startsWith('INT-') ? String(issue_id) : `INT-${String(issue_id).padStart(3, '0')}`)
    : null;
  const actorId = mapRoleToUserId(agent_role);
  const artifactsJson = JSON.stringify(Array.isArray(artifacts) ? artifacts : []);

  db.prepare(`
    INSERT INTO ai_runs (
      id, workspace_id, project_id, issue_id, page_id, actor_id, agent_role,
      skill_name, task_type, provider, model, prompt_summary, response_markdown,
      artifacts_json, duration_ms, status
    ) VALUES (?, 'ws-harness', 'proj-harness', ?, ?, ?, ?, ?, ?, 'antigravity-gemini', 'gemini-2.5-pro', ?, ?, ?, ?, ?)
  `).run(
    runId,
    normalizedIssueId,
    page_id || null,
    actorId,
    agent_role,
    skill_name,
    task_type,
    prompt_summary,
    response_markdown,
    artifactsJson,
    duration_ms,
    status
  );

  if (normalizedIssueId) {
    const issueExists = db.prepare('SELECT id FROM issues WHERE id = ?').get(normalizedIssueId);
    if (issueExists) {
      db.prepare(`
        INSERT INTO issue_activities (
          id, issue_id, project_id, workspace_id, actor_id, actor_role,
          verb, field_name, old_value, new_value, comment_text
        ) VALUES (?, ?, 'proj-harness', 'ws-harness', ?, ?, 'executed_skill', 'skill', '', ?, ?)
      `).run(
        `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        normalizedIssueId,
        actorId,
        agent_role,
        skill_name,
        prompt_summary
      );
    }
  }

  syncAiRunsToMarkdownFile(db);
  return db.prepare('SELECT * FROM ai_runs WHERE id = ?').get(runId);
}

export function recordIssueEvidence(db, {
  issue_id,
  subtask_id = null,
  type = 'report',
  title = 'Evidencia de Verificacion',
  file_path = '',
  report_markdown = '',
  metrics = {},
  created_by_skill = 'verify-spec'
} = {}) {
  const normalizedIssueId = String(issue_id).startsWith('INT-')
    ? String(issue_id)
    : `INT-${String(issue_id).padStart(3, '0')}`;

  const evId = `ev-${normalizedIssueId}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  db.prepare(`
    INSERT INTO issue_evidences (
      id, issue_id, subtask_id, type, title, file_path,
      report_markdown, metrics_json, created_by_skill
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    evId,
    normalizedIssueId,
    subtask_id,
    type,
    title,
    file_path,
    report_markdown,
    JSON.stringify(metrics || {}),
    created_by_skill
  );

  if (report_markdown) {
    db.prepare('UPDATE issues SET evidence_summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(report_markdown.slice(0, 350), normalizedIssueId);
  }

  db.prepare(`
    INSERT INTO issue_activities (
      id, issue_id, project_id, workspace_id, actor_id, actor_role,
      verb, field_name, old_value, new_value, comment_text
    ) VALUES (?, ?, 'proj-harness', 'ws-harness', 'user-reviewer', 'reviewer', 'attached_evidence', 'evidence', '', ?, ?)
  `).run(
    `act-ev-${Date.now()}`,
    normalizedIssueId,
    file_path || title,
    `Evidencia [${type}] registrada por /${created_by_skill}: ${title}`
  );

  syncIssueToFiles(db, normalizedIssueId);
  return db.prepare('SELECT * FROM issue_evidences WHERE id = ?').get(evId);
}

export function recordIssueComment(db, {
  issue_id,
  actor_role = 'leader',
  body_markdown = '',
  source_skill = 'cli'
} = {}) {
  const normalizedIssueId = String(issue_id).startsWith('INT-')
    ? String(issue_id)
    : `INT-${String(issue_id).padStart(3, '0')}`;
  const commentId = `cmt-${normalizedIssueId}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  const actorId = mapRoleToUserId(actor_role);

  db.prepare(`
    INSERT INTO issue_comments (
      id, issue_id, actor_id, actor_role, comment_stripped, body_markdown, source_skill
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    commentId,
    normalizedIssueId,
    actorId,
    actor_role,
    body_markdown.replace(/[#*`_~]/g, ''),
    body_markdown,
    source_skill
  );

  db.prepare(`
    INSERT INTO issue_activities (
      id, issue_id, project_id, workspace_id, actor_id, actor_role,
      verb, field_name, old_value, new_value, comment_text
    ) VALUES (?, ?, 'proj-harness', 'ws-harness', ?, ?, 'commented', 'comment', '', ?, ?)
  `).run(
    `act-cmt-${Date.now()}`,
    normalizedIssueId,
    actorId,
    actor_role,
    source_skill,
    body_markdown.slice(0, 200)
  );

  return db.prepare('SELECT * FROM issue_comments WHERE id = ?').get(commentId);
}

export function recordIssueRelation(db, {
  issue_id,
  related_issue_id,
  relation_type = 'blocked_by'
} = {}) {
  const srcId = String(issue_id).startsWith('INT-')
    ? String(issue_id)
    : `INT-${String(issue_id).padStart(3, '0')}`;
  const tgtId = String(related_issue_id).startsWith('INT-')
    ? String(related_issue_id)
    : `INT-${String(related_issue_id).padStart(3, '0')}`;
  const relId = `rel-${srcId}-${relation_type}-${tgtId}`;

  db.prepare(`
    INSERT INTO issue_relations (id, issue_id, related_issue_id, relation_type)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET relation_type = excluded.relation_type;
  `).run(relId, srcId, tgtId, relation_type);

  syncIssueToFiles(db, srcId);
  return db.prepare('SELECT * FROM issue_relations WHERE id = ?').get(relId);
}

export function createIssueInSQLite(db, {
  title,
  description = '',
  type = 'feature',
  priority = 'high',
  module = 'Harness Core',
  assignee_role = 'implementer',
  cycle_id = 'cycle-3'
} = {}) {
  const maxRow = db.prepare('SELECT MAX(sequence_id) as maxSeq FROM issues').get();
  const nextSeq = (maxRow && maxRow.maxSeq ? Number(maxRow.maxSeq) : 0) + 1;
  const issueId = `INT-${String(nextSeq).padStart(3, '0')}`;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
  const branch = `${type === 'bugfix' ? 'bugfix' : 'feature'}/${issueId}/${slug}`.slice(0, 80);
  const specFolder = `project-docs/specs/${String(nextSeq).padStart(3, '0')}_${slug}`;
  const moduleId = mapModuleId(module);
  const normPriority = mapPriority(priority);
  const typeId = type === 'bugfix' ? 'type-bugfix' : 'type-feature';

  db.prepare(`
    INSERT INTO issues (
      id, project_id, workspace_id, sequence_id, title, description, description_stripped,
      state_id, priority, type_id, point, estimate_point_id, assignee_role,
      cycle_id, module_id, spec_folder, branch
    ) VALUES (?, 'proj-harness', 'ws-harness', ?, ?, ?, ?, 'state-backlog', ?, ?, 3, 'ep-3', ?, ?, ?, ?, ?)
  `).run(
    issueId,
    nextSeq,
    title,
    description,
    description,
    normPriority,
    typeId,
    assignee_role,
    cycle_id,
    moduleId,
    specFolder,
    branch
  );

  db.prepare('INSERT INTO cycle_issues (id, cycle_id, issue_id) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING')
    .run(`ci-${cycle_id}-${issueId}`, cycle_id, issueId);
  db.prepare('INSERT INTO module_issues (id, module_id, issue_id) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING')
    .run(`mi-${moduleId}-${issueId}`, moduleId, issueId);
  db.prepare('INSERT INTO issue_labels (id, issue_id, label_id) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING')
    .run(`il-${issueId}-${type}`, issueId, type === 'bugfix' ? 'lbl-bugfix' : 'lbl-feature');

  syncIssueToFiles(db, issueId);
  return db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
}

export function upsertPageInSQLite(db, {
  file_path,
  title,
  shelf = 'standards',
  content_markdown = '',
  owned_by_role = 'spec-author'
} = {}) {
  const cleanRelPath = file_path.replace(/^project-docs[\\/]/, '').replace(/\\/g, '/');
  const pageId = `page-${cleanRelPath.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const words = content_markdown.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const summary = content_markdown
    .split(/\r?\n/)
    .map(l => l.trim())
    .find(l => l && !l.startsWith('#') && !l.startsWith('>')) || title;

  db.prepare(`
    INSERT INTO pages (
      id, project_id, workspace_id, owned_by_id, owned_by_role,
      file_path, title, summary, shelf, content_markdown, description_stripped,
      word_count, reading_time_min, updated_at
    ) VALUES (?, 'proj-harness', 'ws-harness', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      shelf = excluded.shelf,
      content_markdown = excluded.content_markdown,
      description_stripped = excluded.description_stripped,
      word_count = excluded.word_count,
      reading_time_min = excluded.reading_time_min,
      updated_at = CURRENT_TIMESTAMP;
  `).run(
    pageId,
    mapRoleToUserId(owned_by_role),
    owned_by_role,
    cleanRelPath,
    title,
    summary.slice(0, 160),
    shelf,
    content_markdown,
    summary.slice(0, 160),
    words,
    readingTime
  );

  const countVer = db.prepare('SELECT COUNT(*) as cnt FROM page_versions WHERE page_id = ?').get(pageId);
  const nextVer = (countVer ? Number(countVer.cnt) : 0) + 1;
  db.prepare(`
    INSERT INTO page_versions (
      id, page_id, version_number, content_markdown, description_stripped, owned_by_role, word_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    `pv-${pageId}-v${nextVer}-${Date.now()}`,
    pageId,
    nextVer,
    content_markdown,
    summary.slice(0, 160),
    owned_by_role,
    words
  );

  syncPageToFile(db, pageId);
  return db.prepare('SELECT * FROM pages WHERE id = ?').get(pageId);
}

export function getPlaneData(db) {
  const workspace = db.prepare('SELECT * FROM workspaces LIMIT 1').get();
  const project = db.prepare('SELECT * FROM projects LIMIT 1').get();
  const users = db.prepare('SELECT * FROM users ORDER BY is_bot DESC, username ASC').all();
  const workspaceMembers = db.prepare('SELECT * FROM workspace_members').all();
  const apiTokens = db.prepare('SELECT id, workspace_id, user_id, label, user_type, is_active, created_at FROM api_tokens').all();
  const states = db.prepare('SELECT * FROM states ORDER BY sequence ASC').all();
  const labels = db.prepare('SELECT * FROM labels ORDER BY sort_order ASC').all();
  const estimates = db.prepare('SELECT * FROM estimates').all();
  const estimatePoints = db.prepare('SELECT * FROM estimate_points ORDER BY key_val ASC').all();
  const issueTypes = db.prepare('SELECT * FROM issue_types ORDER BY level ASC').all();
  const cycles = db.prepare('SELECT * FROM cycles ORDER BY start_date ASC').all();
  const modules = db.prepare('SELECT * FROM modules ORDER BY name ASC').all();
  const views = db.prepare('SELECT * FROM issue_views ORDER BY sort_order ASC').all();
  const aiConfigs = db.prepare('SELECT * FROM ai_configs ORDER BY category ASC, key ASC').all();
  const aiRuns = db.prepare('SELECT * FROM ai_runs ORDER BY created_at DESC, id DESC LIMIT 100').all();

  const issues = db.prepare(`
    SELECT i.*, s.name as state_name, s.color as state_color, s.group_name as state_group,
           c.name as cycle_name, m.name as module_name, it.name as type_name
    FROM issues i
    JOIN states s ON i.state_id = s.id
    LEFT JOIN cycles c ON i.cycle_id = c.id
    LEFT JOIN modules m ON i.module_id = m.id
    LEFT JOIN issue_types it ON i.type_id = it.id
    ORDER BY i.sequence_id ASC
  `).all();

  const subtasks = db.prepare('SELECT * FROM subtasks ORDER BY sequence ASC').all();
  const issueLabels = db.prepare(`
    SELECT il.issue_id, l.id, l.name, l.color, l.description
    FROM issue_labels il
    JOIN labels l ON il.label_id = l.id
  `).all();
  const issueAssignees = db.prepare(`
    SELECT ia.issue_id, ia.assignee_id, ia.assignee_role, u.display_name, u.is_bot, u.bot_type
    FROM issue_assignees ia
    LEFT JOIN users u ON ia.assignee_id = u.id
  `).all();
  const issueRelations = db.prepare('SELECT * FROM issue_relations').all();
  const issueActivities = db.prepare('SELECT * FROM issue_activities ORDER BY created_at DESC').all();
  const issueComments = db.prepare('SELECT * FROM issue_comments ORDER BY created_at ASC').all();
  const issueEvidences = db.prepare('SELECT * FROM issue_evidences ORDER BY created_at ASC').all();
  const pages = db.prepare('SELECT id, file_path, title, summary, shelf, owned_by_role, word_count, reading_time_min, updated_at FROM pages ORDER BY title ASC').all();

  const groupByIssue = (rows) => {
    const map = {};
    for (const r of rows) {
      if (!map[r.issue_id]) map[r.issue_id] = [];
      map[r.issue_id].push(r);
    }
    return map;
  };

  const subtasksByIssue = groupByIssue(subtasks);
  const labelsByIssue = groupByIssue(issueLabels);
  const assigneesByIssue = groupByIssue(issueAssignees);
  const relationsByIssue = groupByIssue(issueRelations);
  const activitiesByIssue = groupByIssue(issueActivities);
  const commentsByIssue = groupByIssue(issueComments);
  const evidencesByIssue = groupByIssue(issueEvidences);
  const aiRunsByIssue = groupByIssue(aiRuns.filter(r => r.issue_id));

  for (const issue of issues) {
    issue.subtasks = subtasksByIssue[issue.id] || [];
    issue.labels = labelsByIssue[issue.id] || [];
    issue.assignees = assigneesByIssue[issue.id] || [];
    issue.relations = relationsByIssue[issue.id] || [];
    issue.activities = activitiesByIssue[issue.id] || [];
    issue.comments = commentsByIssue[issue.id] || [];
    issue.evidences = evidencesByIssue[issue.id] || [];
    issue.ai_runs = aiRunsByIssue[issue.id] || [];
    try {
      issue.acceptance = JSON.parse(issue.acceptance_criteria || '[]');
    } catch (_) {
      issue.acceptance = [];
    }
  }

  return {
    workspace,
    project,
    users,
    workspaceMembers,
    apiTokens,
    states,
    labels,
    estimates,
    estimatePoints,
    issueTypes,
    cycles,
    modules,
    views,
    aiConfigs,
    aiRuns,
    issues,
    pages
  };
}
