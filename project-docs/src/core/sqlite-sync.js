import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DOCS_DIR = path.resolve(__dirname, '../..');
const KNOWLEDGE_DIR = path.join(PROJECT_DOCS_DIR, 'knowledge');
const SPECS_DIR = path.join(PROJECT_DOCS_DIR, 'specs');
const FEATURE_LIST_PATH = path.join(PROJECT_DOCS_DIR, 'feature_list.json');

const DEFAULT_STATES = [
  { id: 'state-backlog', name: 'Backlog', color: '#71717a', sequence: 10, group_name: 'backlog' },
  { id: 'state-todo', name: 'Todo', color: '#3b82f6', sequence: 20, group_name: 'unstarted' },
  { id: 'state-in-progress', name: 'In Progress', color: '#eab308', sequence: 30, group_name: 'started' },
  { id: 'state-in-review', name: 'In Review', color: '#a855f7', sequence: 40, group_name: 'review' },
  { id: 'state-done', name: 'Done', color: '#22c55e', sequence: 50, group_name: 'completed' },
  { id: 'state-cancelled', name: 'Cancelled', color: '#ef4444', sequence: 60, group_name: 'cancelled' }
];

const DEFAULT_CYCLES = [
  { id: 'cycle-1', name: 'Ciclo 1: Fundacional (Harness Core)', description: 'Arquitectura base, sincronización de skills y tablero visual', start_date: '2026-10-15', end_date: '2026-10-31', status: 'completed' },
  { id: 'cycle-2', name: 'Ciclo 2: Calidad, DeepWiki & Encapsulamiento', description: 'Testing multinivel, Playwright E2E y pureza de raíz', start_date: '2026-11-01', end_date: '2026-11-06', status: 'completed' },
  { id: 'cycle-3', name: 'Ciclo 3: Plane Multi-Vista & SQLite para IA', description: 'Replicación UX Plane, persistencia SQLite y soporte espejo Markdown', start_date: '2026-11-07', end_date: '2026-11-20', status: 'active' }
];

const DEFAULT_MODULES = [
  { id: 'mod-orchestrator', name: 'Agent Orchestrator', description: 'Orquestación de agentes autónomos, roles y reglas de branching', lead_role: 'leader', status: 'completed' },
  { id: 'mod-visualizer', name: 'Dashboard Visualizer', description: 'Tablero visual, vistas Plane, grafos de dependencias y 3D', lead_role: 'implementer', status: 'in_progress' },
  { id: 'mod-qa', name: 'Testing QA Suite', description: 'Verificación multinivel en 9 fases, Playwright E2E y suites de prueba', lead_role: 'reviewer', status: 'completed' },
  { id: 'mod-knowledge', name: 'Knowledge Engine', description: 'Base de conocimiento Docs-as-Code soberana y DeepWiki', lead_role: 'spec-author', status: 'completed' },
  { id: 'mod-core', name: 'Harness Core', description: 'Scripts verify.sh, configuraciones y reglas del arnés', lead_role: 'leader', status: 'completed' }
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

export function syncFilesToSQLite(db) {
  // 1. Workspace
  const wsStmt = db.prepare(`
    INSERT INTO workspaces (id, name, slug)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug;
  `);
  wsStmt.run('ws-harness', 'Harness Engineering Workspace', 'harness-engineering');

  // 2. Project
  const projStmt = db.prepare(`
    INSERT INTO projects (id, workspace_id, name, slug, description)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug, description = excluded.description;
  `);
  projStmt.run(
    'proj-harness',
    'ws-harness',
    'Arnés de Ingeniería SDD Multi-Agente',
    'harness-sdd',
    'Plataforma integral de ingeniería dirigida por specs con soporte multi-agente y gestión ágil'
  );

  // 3. States
  const stateStmt = db.prepare(`
    INSERT INTO states (id, project_id, name, color, sequence, group_name)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, color = excluded.color, sequence = excluded.sequence, group_name = excluded.group_name;
  `);
  for (const s of DEFAULT_STATES) {
    stateStmt.run(s.id, 'proj-harness', s.name, s.color, s.sequence, s.group_name);
  }

  // 4. Cycles
  const cycleStmt = db.prepare(`
    INSERT INTO cycles (id, project_id, name, description, start_date, end_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, start_date = excluded.start_date, end_date = excluded.end_date, status = excluded.status;
  `);
  for (const c of DEFAULT_CYCLES) {
    cycleStmt.run(c.id, 'proj-harness', c.name, c.description, c.start_date, c.end_date, c.status);
  }

  // 5. Modules
  const modStmt = db.prepare(`
    INSERT INTO modules (id, project_id, name, description, lead_role, status)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, lead_role = excluded.lead_role, status = excluded.status;
  `);
  for (const m of DEFAULT_MODULES) {
    modStmt.run(m.id, 'proj-harness', m.name, m.description, m.lead_role, m.status);
  }

  // 6. Issues & Subtasks desde feature_list.json
  if (fs.existsSync(FEATURE_LIST_PATH)) {
    try {
      const raw = fs.readFileSync(FEATURE_LIST_PATH, 'utf8');
      const data = JSON.parse(raw);
      const features = data.features || [];

      const issueStmt = db.prepare(`
        INSERT INTO issues (
          id, project_id, sequence_id, title, description, state_id, priority,
          assignee_role, cycle_id, module_id, spec_folder, branch,
          user_story_as_a, user_story_i_want, user_story_so_that,
          acceptance_criteria, evidence_summary, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          description = excluded.description,
          state_id = excluded.state_id,
          priority = excluded.priority,
          assignee_role = excluded.assignee_role,
          cycle_id = excluded.cycle_id,
          module_id = excluded.module_id,
          spec_folder = excluded.spec_folder,
          branch = excluded.branch,
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

      for (const f of features) {
        const issueId = `INT-${String(f.id).padStart(3, '0')}`;
        const stateId = mapStatusToStateId(f.status);
        const priority = mapPriority(f.priority);
        const cycleId = mapCycleId(f.id);
        const moduleId = mapModuleId(f.module);

        let assigneeRole = 'leader';
        if (f.subtasks && f.subtasks.length > 0) {
          const firstSub = f.subtasks[0];
          assigneeRole = firstSub.assignee || 'implementer';
        }

        const userStory = f.user_story || {};
        const acceptanceJson = JSON.stringify(f.acceptance || []);
        const evidenceSummary = f.evidence ? f.evidence.dev_summary : '';

        issueStmt.run(
          issueId,
          'proj-harness',
          f.id,
          f.title || f.name,
          f.description || '',
          stateId,
          priority,
          assigneeRole,
          cycleId,
          moduleId,
          f.spec_folder || '',
          f.branch || '',
          userStory.as_a || '',
          userStory.i_want || '',
          userStory.so_that || '',
          acceptanceJson,
          evidenceSummary
        );

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
      }
    } catch (e) {
      console.warn('[SQLITE-SYNC] Error sincronizando feature_list.json:', e.message);
    }
  }

  // 7. Pages desde Markdown (knowledge/ y specs/)
  const pageStmt = db.prepare(`
    INSERT INTO pages (
      id, project_id, file_path, title, summary, shelf, content_markdown,
      word_count, reading_time_min, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      shelf = excluded.shelf,
      content_markdown = excluded.content_markdown,
      word_count = excluded.word_count,
      reading_time_min = excluded.reading_time_min,
      updated_at = CURRENT_TIMESTAMP;
  `);

  function classifyShelf(filename) {
    if (filename.startsWith('modules/')) return 'modules';
    if (filename.includes('architecture') || filename.includes('c4') || filename.includes('diagrams')) return 'architecture';
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

          pageStmt.run(
            pageId,
            'proj-harness',
            relPath,
            title,
            summary,
            shelf,
            content,
            words,
            readingTime
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

export function syncIssueToFiles(db, issueId) {
  // Cuando se actualiza un issue en SQLite, reflejar los cambios en feature_list.json
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(issueId);
  if (!issue) return;

  const subtasks = db.prepare('SELECT * FROM subtasks WHERE issue_id = ? ORDER BY sequence ASC').all(issueId);

  if (fs.existsSync(FEATURE_LIST_PATH)) {
    try {
      const raw = fs.readFileSync(FEATURE_LIST_PATH, 'utf8');
      const data = JSON.parse(raw);
      const feature = (data.features || []).find(f => f.id === issue.sequence_id);
      if (feature) {
        feature.status = mapStateIdToStatus(issue.state_id);
        feature.priority = issue.priority ? issue.priority.toUpperCase() : 'NONE';
        feature.title = issue.title;
        feature.description = issue.description;

        if (subtasks.length > 0) {
          feature.subtasks = subtasks.map(s => ({
            id: s.id,
            type: s.type,
            title: s.title,
            assignee: s.assignee_role,
            status: s.status
          }));
        }

        fs.writeFileSync(FEATURE_LIST_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
      }
    } catch (e) {
      console.warn('[SQLITE-SYNC] Error guardando issue en feature_list.json:', e.message);
    }
  }
}

export function syncPageToFile(db, pageId) {
  // Cuando se actualiza una página en SQLite, reflejar el markdown en disco
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
    console.warn(`[SQLITE-SYNC] Error guardando página en ${filePath}:`, e.message);
  }
}

export function getPlaneData(db) {
  const workspace = db.prepare('SELECT * FROM workspaces LIMIT 1').get();
  const project = db.prepare('SELECT * FROM projects LIMIT 1').get();
  const states = db.prepare('SELECT * FROM states ORDER BY sequence ASC').all();
  const cycles = db.prepare('SELECT * FROM cycles ORDER BY start_date ASC').all();
  const modules = db.prepare('SELECT * FROM modules ORDER BY name ASC').all();
  const issues = db.prepare(`
    SELECT i.*, s.name as state_name, s.color as state_color, s.group_name as state_group,
           c.name as cycle_name, m.name as module_name
    FROM issues i
    JOIN states s ON i.state_id = s.id
    LEFT JOIN cycles c ON i.cycle_id = c.id
    LEFT JOIN modules m ON i.module_id = m.id
    ORDER BY i.sequence_id ASC
  `).all();

  const subtasks = db.prepare('SELECT * FROM subtasks ORDER BY sequence ASC').all();
  const pages = db.prepare('SELECT id, file_path, title, summary, shelf, word_count, reading_time_min, updated_at FROM pages ORDER BY title ASC').all();

  // Mapear subtasks anidadas en issues
  const subtasksByIssue = {};
  for (const st of subtasks) {
    if (!subtasksByIssue[st.issue_id]) subtasksByIssue[st.issue_id] = [];
    subtasksByIssue[st.issue_id].push(st);
  }

  for (const issue of issues) {
    issue.subtasks = subtasksByIssue[issue.id] || [];
    try {
      issue.acceptance = JSON.parse(issue.acceptance_criteria || '[]');
    } catch (_) {
      issue.acceptance = [];
    }
  }

  return {
    workspace,
    project,
    states,
    cycles,
    modules,
    issues,
    pages
  };
}
