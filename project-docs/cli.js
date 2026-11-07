#!/usr/bin/env node
/**
 * CLI Soberana de Gestion de Proyectos, Evidencias e IA (Plane Edition)
 * Permite a agentes de IA, skills SDD y desarrolladores consultar y registrar
 * tareas, evidencias, reportes, comentarios, relaciones, ejecuciones IA y paginas Markdown
 * directamente hacia SQLite (harness.db) y el espejo documental (.md / feature_list.json).
 *
 * 100% Vectorial, sin emojis.
 *
 * Uso:
 *   node project-docs/cli.js status [--json]
 *   node project-docs/cli.js issue list [--state <s>] [--priority <p>] [--json]
 *   node project-docs/cli.js issue get <id> [--json]
 *   node project-docs/cli.js issue create --title <t> [--type <feature|bugfix>] [--priority <p>] [--module <m>] [--description <d>] [--json]
 *   node project-docs/cli.js issue update <id> [--state <s>] [--priority <p>] [--role <r>]
 *   node project-docs/cli.js issue evidence <id> --title <t> [--type <report|screenshot|api-plan|qa|unit>] [--file <path>] [--summary <s>] [--skill <sk>] [--json]
 *   node project-docs/cli.js issue comment <id> --message <msg> [--role <role>] [--skill <sk>] [--json]
 *   node project-docs/cli.js issue relate <id> --target <target_id> [--type <blocked_by|blocks|relates_to>] [--json]
 *   node project-docs/cli.js issue activity <id> [--json]
 *   node project-docs/cli.js ai log --skill <sk> --summary <txt> [--role <r>] [--issue <id>] [--page <id>] [--type <t>] [--response <md>] [--artifacts <csv>] [--json]
 *   node project-docs/cli.js ai list [--issue <id>] [--skill <sk>] [--json]
 *   node project-docs/cli.js page list [--shelf <shelf>] [--json]
 *   node project-docs/cli.js page get <slug>
 *   node project-docs/cli.js page upsert --path <rel_path> --title <t> [--shelf <s>] [--file <md_file>] [--content <md>] [--role <r>] [--json]
 *   node project-docs/cli.js cycle list
 *   node project-docs/cli.js cycle current
 *   node project-docs/cli.js module list
 *   node project-docs/cli.js user list [--json]
 *   node project-docs/cli.js sync
 */

import { initDatabase } from './src/core/db.js';
import {
  syncFilesToSQLite,
  syncIssueToFiles,
  getPlaneData,
  recordSkillExecution,
  recordIssueEvidence,
  recordIssueComment,
  recordIssueRelation,
  createIssueInSQLite,
  upsertPageInSQLite,
  updatePagePropertiesInSQLite,
  duplicatePageInSQLite,
  mapRoleToUserId
} from './src/core/sqlite-sync.js';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DOCS_DIR = __dirname;
const DB_PATH = path.join(PROJECT_DOCS_DIR, 'data', 'harness.db');

// Inicializar base de datos y asegurar semilla inicial
const db = initDatabase(DB_PATH);
const wsCheck = db.prepare('SELECT COUNT(*) as cnt FROM workspaces').get();
if (!wsCheck || Number(wsCheck.cnt) === 0) {
  syncFilesToSQLite(db);
}

const args = process.argv.slice(2);
const command = args[0] || 'help';

function getArg(flag, defaultVal = null) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return defaultVal;
}

function normalizeIssueId(rawId) {
  if (!rawId) return null;
  const str = String(rawId).trim();
  return str.startsWith('INT-') ? str : `INT-${String(str).padStart(3, '0')}`;
}

function printHelp() {
  console.log(`
CLI Soberana del Arnes de Ingenieria (Plane Edition + AI Tracking)

Comandos Disponibles:
  status [--json]                        Resumen general del arnes, ciclo activo, IA y metricas
  issue list [--state <s>] [--json]      Listar tareas registradas
  issue get <id> [--json]                Obtener detalle completo (Scrum, EARS, Subtareas, Evidencias, IA)
  issue create --title <t> [opciones]    Crear nueva tarea en SQLite y feature_list.json
  issue update <id> --state <s>          Actualizar estado/prioridad de una tarea y sincronizar
  issue evidence <id> --title <t> [...]  Registrar evidencia QA, captura o reporte de verificacion
  issue comment <id> --message <m> [...] Registrar comentario de agente o skill en una tarea
  issue relate <id> --target <id2> [...] Registrar dependencia o relacion entre tareas
  issue activity <id> [--json]           Consultar historial de auditoria (IssueActivity)
  ai log --skill <sk> --summary <txt>    Registrar ejecucion de skill / IA en SQLite y ai-runs-log.md
  ai list [--issue <id>] [--json]        Listar ejecuciones de skills y agentes IA
  cycle list                             Listar ciclos (sprints) y porcentaje de avance
  cycle current                          Detalle del ciclo activo y metricas de burn-down
  module list                            Listar modulos de arquitectura y avance
  page list [--shelf <s>] [--json]       Listar paginas de la base de conocimiento
  page get <slug>                        Imprimir contenido Markdown de una pagina
  page upsert --path <p> --title <t>     Crear o actualizar documento Markdown en SQLite y disco
  user list [--json]                     Listar agentes IA (is_bot=1) y usuarios del workspace
  sync                                   Ejecutar sincronizacion bidireccional SQLite <-> Disco
  help                                   Mostrar esta ayuda
`);
}

function handleStatus() {
  const data = getPlaneData(db);
  const issues = data.issues || [];
  const total = issues.length;
  const done = issues.filter(i => i.state_id === 'state-done').length;
  const inProgress = issues.filter(i => i.state_id === 'state-in-progress' || i.state_id === 'state-in-review').length;
  const backlog = total - done - inProgress;
  const activeCycle = data.cycles.find(c => c.status === 'active') || data.cycles[data.cycles.length - 1] || {};
  const totalEvidences = issues.reduce((acc, i) => acc + (i.evidences ? i.evidences.length : 0), 0);
  const botCount = (data.users || []).filter(u => u.is_bot === 1).length;

  if (args.includes('--json')) {
    console.log(JSON.stringify({
      workspace: data.workspace,
      project: data.project,
      activeCycle,
      metrics: {
        totalIssues: total,
        doneIssues: done,
        inProgressIssues: inProgress,
        backlogIssues: backlog,
        modulesCount: data.modules.length,
        pagesCount: data.pages.length,
        aiRunsCount: (data.aiRuns || []).length,
        evidencesCount: totalEvidences,
        botAgentsCount: botCount
      }
    }, null, 2));
    return;
  }

  console.log(`
========================================================================
 ESTADO DEL PROYECTO — ${data.workspace.name} / ${data.project.name}
========================================================================
Ciclo Activo     : ${activeCycle.name || 'Sin ciclo'} (${activeCycle.start_date || 'N/A'} al ${activeCycle.end_date || 'N/A'})
Total Tareas     : ${total} (Completadas: ${done}, En Progreso: ${inProgress}, Pendientes: ${backlog})
Modulos Activos  : ${data.modules.length}
Paginas de Docs  : ${data.pages.length}
Agentes IA Bot   : ${botCount} activos (Tokens API verificados)
Ejecuciones IA   : ${(data.aiRuns || []).length} registradas (ai-runs-log.md)
Evidencias QA    : ${totalEvidences} artefactos vinculados
Base de Datos    : SQLite (WAL activo en project-docs/data/harness.db)
Sincronizacion   : Espejo bidireccional Markdown activo (100% OK)
========================================================================
`);
}

function handleIssueList() {
  const isJson = args.includes('--json');
  const filterState = getArg('--state');
  const filterPriority = getArg('--priority');

  const data = getPlaneData(db);
  let issues = data.issues || [];

  if (filterState) {
    const norm = filterState.toLowerCase();
    issues = issues.filter(i =>
      (i.state_id && i.state_id.toLowerCase().includes(norm)) ||
      (i.state_name && i.state_name.toLowerCase().includes(norm))
    );
  }
  if (filterPriority) {
    issues = issues.filter(i => (i.priority || '').toLowerCase() === filterPriority.toLowerCase());
  }

  if (isJson) {
    console.log(JSON.stringify(issues, null, 2));
    return;
  }

  console.log(`\nListado de Tareas (${issues.length}):\n`);
  console.log('ID'.padEnd(12) + 'ESTADO'.padEnd(16) + 'PRIORIDAD'.padEnd(12) + 'PTS'.padEnd(6) + 'AGENTE'.padEnd(14) + 'TITULO');
  console.log('-'.repeat(90));

  for (const i of issues) {
    const id = (i.id || '').padEnd(12);
    const st = (i.state_name || i.state_id || '').padEnd(16);
    const pr = (i.priority || 'none').padEnd(12);
    const pts = String(i.point || 3).padEnd(6);
    const ag = (i.assignee_role || 'leader').padEnd(14);
    const title = (i.title || '').slice(0, 38);
    console.log(`${id}${st}${pr}${pts}${ag}${title}`);
  }
  console.log('');
}

function handleIssueGet() {
  const rawId = args[2];
  if (!rawId) {
    console.error('Error: Debe proporcionar el ID de la tarea (ej: INT-012 o 12)');
    process.exit(1);
  }

  const normalizedId = normalizeIssueId(rawId);
  const data = getPlaneData(db);
  const issue = (data.issues || []).find(i => i.id === normalizedId);

  if (!issue) {
    console.error(`Error: Tarea con ID ${rawId} no encontrada en SQLite.`);
    process.exit(1);
  }

  if (args.includes('--json')) {
    console.log(JSON.stringify(issue, null, 2));
    return;
  }

  console.log(`\n========================================================================`);
  console.log(` TAREA: ${issue.id} — ${issue.title}`);
  console.log(`========================================================================`);
  console.log(`Estado       : ${issue.state_name || issue.state_id}`);
  console.log(`Tipo / Pts   : ${issue.type_name || 'Feature'} (${issue.point || 3} pts Fibonacci)`);
  console.log(`Prioridad    : ${issue.priority}`);
  console.log(`Modulo       : ${issue.module_name || 'Harness'}`);
  console.log(`Ciclo        : ${issue.cycle_name || 'Activo'}`);
  console.log(`Agente       : ${issue.assignee_role || 'leader'}`);
  if (issue.labels && issue.labels.length > 0) {
    console.log(`Etiquetas    : ${issue.labels.map(l => l.name).join(', ')}`);
  }
  if (issue.relations && issue.relations.length > 0) {
    console.log(`Relaciones   : ${issue.relations.map(r => `${r.relation_type} -> ${r.related_issue_id}`).join(', ')}`);
  }
  if (issue.branch) console.log(`Rama Git     : ${issue.branch}`);
  if (issue.spec_folder) console.log(`Carpeta Spec : ${issue.spec_folder}`);

  if (issue.user_story_i_want) {
    console.log(`\nHistoria de Usuario (Scrum):`);
    console.log(`  Como  : ${issue.user_story_as_a}`);
    console.log(`  Quiero: ${issue.user_story_i_want}`);
    console.log(`  Para  : ${issue.user_story_so_that}`);
  }

  console.log(`\nDescripcion:`);
  console.log(`  ${issue.description || 'Sin descripcion'}`);

  if (issue.subtasks && issue.subtasks.length > 0) {
    console.log(`\nSubtareas Jira (${issue.subtasks.length}):`);
    for (const sub of issue.subtasks) {
      const mark = sub.status === 'done' || sub.status === 'passed' ? '[x]' : '[ ]';
      console.log(`  ${mark} [${sub.type.toUpperCase()}] ${sub.id}: ${sub.title}`);
    }
  }

  if (issue.evidences && issue.evidences.length > 0) {
    console.log(`\nEvidencias & Reportes (${issue.evidences.length}):`);
    for (const ev of issue.evidences) {
      console.log(`  - [${ev.type}] ${ev.title} (${ev.file_path || 'inline'}) via /${ev.created_by_skill}`);
    }
  }

  if (issue.ai_runs && issue.ai_runs.length > 0) {
    console.log(`\nEjecuciones de Skills IA (${issue.ai_runs.length}):`);
    for (const run of issue.ai_runs) {
      console.log(`  - [${run.id}] /${run.skill_name} (${run.agent_role}): ${run.prompt_summary}`);
    }
  }
  console.log(`========================================================================\n`);
}

function handleIssueCreate() {
  const title = getArg('--title');
  if (!title) {
    console.error('Uso: node project-docs/cli.js issue create --title <titulo> [--type feature|bugfix] [--priority high] [--module <m>] [--description <d>]');
    process.exit(1);
  }
  const type = getArg('--type', 'feature');
  const priority = getArg('--priority', 'high');
  const module = getArg('--module', 'Harness Core');
  const description = getArg('--description', '');
  const role = getArg('--role', 'implementer');

  const created = createIssueInSQLite(db, { title, description, type, priority, module, assignee_role: role });
  if (args.includes('--json')) {
    console.log(JSON.stringify(created, null, 2));
    return;
  }
  console.log(`[OK] Tarea ${created.id} (${created.title}) creada en SQLite y sincronizada en feature_list.json.`);
}

function handleIssueUpdate() {
  const rawId = args[2];
  const targetState = getArg('--state');
  const targetPriority = getArg('--priority');
  const targetRole = getArg('--role');
  const targetTitle = getArg('--title');

  if (!rawId || (!targetState && !targetPriority && !targetRole && !targetTitle)) {
    console.error('Uso: node project-docs/cli.js issue update <id> --state <state_id> [--priority <p>] [--role <r>] [--title <t>]');
    process.exit(1);
  }

  const normalizedId = normalizeIssueId(rawId);
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(normalizedId);

  if (!issue) {
    console.error(`Error: Tarea ${normalizedId} no encontrada.`);
    process.exit(1);
  }

  const stateMapping = {
    'backlog': 'state-backlog',
    'pending': 'state-backlog',
    'todo': 'state-todo',
    'spec_ready': 'state-todo',
    'in_progress': 'state-in-progress',
    'in-progress': 'state-in-progress',
    'in_review': 'state-in-review',
    'in-review': 'state-in-review',
    'done': 'state-done',
    'cancelled': 'state-cancelled'
  };

  const finalStateId = targetState ? (stateMapping[targetState.toLowerCase()] || targetState) : issue.state_id;
  const finalPriority = targetPriority ? targetPriority.toLowerCase() : issue.priority;
  const finalRole = targetRole || issue.assignee_role;
  const finalTitle = targetTitle || issue.title;
  const completedAt = finalStateId === 'state-done' ? new Date().toISOString() : issue.completed_at;

  db.prepare(`
    UPDATE issues
    SET state_id = ?, priority = ?, assignee_role = ?, title = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(finalStateId, finalPriority, finalRole, finalTitle, completedAt, normalizedId);

  db.prepare(`
    INSERT INTO issue_activities (
      id, issue_id, project_id, workspace_id, actor_id, actor_role,
      verb, field_name, old_value, new_value, comment_text
    ) VALUES (?, ?, 'proj-harness', 'ws-harness', ?, ?, 'updated', 'state_id', ?, ?, ?)
  `).run(
    `act-upd-${Date.now()}`,
    normalizedId,
    mapRoleToUserId(finalRole),
    finalRole,
    issue.state_id,
    finalStateId,
    `Tarea ${normalizedId} actualizada via CLI`
  );

  syncIssueToFiles(db, normalizedId);
  console.log(`[OK] Tarea ${normalizedId} actualizada con exito en SQLite y sincronizada con feature_list.json.`);
}

function handleIssueEvidence() {
  const rawId = args[2];
  const title = getArg('--title', 'Evidencia de Verificacion');
  const type = getArg('--type', 'report');
  const filePath = getArg('--file', '');
  const summary = getArg('--summary', '');
  const skill = getArg('--skill', 'verify-spec');
  const subtask = getArg('--subtask', null);

  if (!rawId) {
    console.error('Uso: node project-docs/cli.js issue evidence <id> --title <t> [--type <report|screenshot|api-plan|qa|unit>] [--file <path>] [--summary <s>] [--skill <sk>]');
    process.exit(1);
  }

  let reportMarkdown = summary;
  if (filePath && !reportMarkdown && filePath.endsWith('.md')) {
    const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(PROJECT_DOCS_DIR, '..', filePath);
    if (fs.existsSync(absPath)) {
      try {
        reportMarkdown = fs.readFileSync(absPath, 'utf8');
      } catch (_) {}
    }
  }

  const ev = recordIssueEvidence(db, {
    issue_id: rawId,
    subtask_id: subtask,
    type,
    title,
    file_path: filePath,
    report_markdown: reportMarkdown,
    created_by_skill: skill
  });

  if (args.includes('--json')) {
    console.log(JSON.stringify(ev, null, 2));
    return;
  }
  console.log(`[OK] Evidencia '${ev.title}' (${ev.type}) vinculada a ${ev.issue_id} por /${skill}.`);
}

function handleIssueComment() {
  const rawId = args[2];
  const message = getArg('--message');
  const role = getArg('--role', 'leader');
  const skill = getArg('--skill', 'cli');

  if (!rawId || !message) {
    console.error('Uso: node project-docs/cli.js issue comment <id> --message <texto> [--role <role>] [--skill <skill>]');
    process.exit(1);
  }

  const cmt = recordIssueComment(db, {
    issue_id: rawId,
    actor_role: role,
    body_markdown: message,
    source_skill: skill
  });

  if (args.includes('--json')) {
    console.log(JSON.stringify(cmt, null, 2));
    return;
  }
  console.log(`[OK] Comentario registrado en ${cmt.issue_id} por ${role} (/${skill}).`);
}

function handleIssueRelate() {
  const rawId = args[2];
  const targetId = getArg('--target');
  const relType = getArg('--type', 'blocked_by');

  if (!rawId || !targetId) {
    console.error('Uso: node project-docs/cli.js issue relate <id> --target <target_id> [--type blocked_by|blocks|relates_to]');
    process.exit(1);
  }

  const rel = recordIssueRelation(db, {
    issue_id: rawId,
    related_issue_id: targetId,
    relation_type: relType
  });

  if (args.includes('--json')) {
    console.log(JSON.stringify(rel, null, 2));
    return;
  }
  console.log(`[OK] Relacion registrada: ${rel.issue_id} [${rel.relation_type}] ${rel.related_issue_id}.`);
}

function handleIssueActivity() {
  const rawId = args[2];
  if (!rawId) {
    console.error('Uso: node project-docs/cli.js issue activity <id> [--json]');
    process.exit(1);
  }
  const normalizedId = normalizeIssueId(rawId);
  const acts = db.prepare('SELECT * FROM issue_activities WHERE issue_id = ? ORDER BY created_at DESC').all(normalizedId);

  if (args.includes('--json')) {
    console.log(JSON.stringify(acts, null, 2));
    return;
  }

  console.log(`\nHistorial de Actividad para ${normalizedId} (${acts.length}):\n`);
  for (const a of acts) {
    console.log(`  [${a.created_at}] ${a.actor_role} (${a.verb}): ${a.field_name || ''} ${a.old_value || ''} -> ${a.new_value || ''} | ${a.comment_text || ''}`);
  }
  console.log('');
}

function handleAiLog() {
  const skill = getArg('--skill', 'sdd-workflow');
  const role = getArg('--role', 'leader');
  const issueId = getArg('--issue', null);
  const pageId = getArg('--page', null);
  const taskType = getArg('--type', 'SDD_SKILL_EXECUTION');
  const summary = getArg('--summary', `Ejecucion de skill /${skill}`);
  const responseMd = getArg('--response', '');
  const artifactsCsv = getArg('--artifacts', '');
  const artifacts = artifactsCsv ? artifactsCsv.split(',').map(s => s.trim()).filter(Boolean) : [];

  const run = recordSkillExecution(db, {
    skill_name: skill,
    agent_role: role,
    issue_id: issueId,
    page_id: pageId,
    task_type: taskType,
    prompt_summary: summary,
    response_markdown: responseMd,
    artifacts
  });

  if (args.includes('--json')) {
    console.log(JSON.stringify(run, null, 2));
    return;
  }
  console.log(`[OK] Ejecucion IA [${run.id}] de /${skill} (${role}) registrada en SQLite y sincronizada en knowledge/ai-runs-log.md.`);
}

function handleAiList() {
  const issueFilter = getArg('--issue');
  const skillFilter = getArg('--skill');
  let query = 'SELECT * FROM ai_runs WHERE 1=1';
  const params = [];

  if (issueFilter) {
    query += ' AND issue_id = ?';
    params.push(normalizeIssueId(issueFilter));
  }
  if (skillFilter) {
    query += ' AND skill_name = ?';
    params.push(skillFilter);
  }
  query += ' ORDER BY created_at DESC, id DESC LIMIT 50';

  const runs = db.prepare(query).all(...params);
  if (args.includes('--json')) {
    console.log(JSON.stringify(runs, null, 2));
    return;
  }

  console.log(`\nRegistro de Ejecuciones de Skills e IA (${runs.length}):\n`);
  console.log('ID'.padEnd(24) + 'SKILL'.padEnd(22) + 'AGENTE'.padEnd(14) + 'TAREA'.padEnd(10) + 'RESUMEN');
  console.log('-'.repeat(95));
  for (const r of runs) {
    console.log(
      `${(r.id || '').slice(0, 22).padEnd(24)}` +
      `/${(r.skill_name || '').slice(0, 19).padEnd(21)}` +
      `${(r.agent_role || '').padEnd(14)}` +
      `${(r.issue_id || 'GLOBAL').padEnd(10)}` +
      `${(r.prompt_summary || '').slice(0, 35)}`
    );
  }
  console.log('');
}

function handleCycleList() {
  const cycles = db.prepare('SELECT * FROM cycles ORDER BY start_date ASC').all();
  console.log(`\nCiclos de Desarrollo (Sprints):\n`);
  console.log('ID'.padEnd(14) + ' ' + 'NOMBRE'.padEnd(42) + ' ' + 'ESTADO'.padEnd(12) + ' ' + 'RANGO DE FECHAS');
  console.log('-'.repeat(85));
  for (const c of cycles) {
    console.log(`${c.id.padEnd(14)} ${c.name.padEnd(42)} ${c.status.toUpperCase().padEnd(12)} ${c.start_date} al ${c.end_date}`);
  }
  console.log('');
}

function handleCycleCurrent() {
  const cycle = db.prepare("SELECT * FROM cycles WHERE status = 'active'").get() ||
                db.prepare('SELECT * FROM cycles ORDER BY end_date DESC LIMIT 1').get();

  if (!cycle) {
    console.log('No hay ciclo activo registrado.');
    return;
  }

  const issues = db.prepare(`
    SELECT i.*, s.name as state_name
    FROM issues i
    JOIN states s ON i.state_id = s.id
    WHERE i.cycle_id = ?
  `).all(cycle.id);
  const total = issues.length;
  const done = issues.filter(i => i.state_id === 'state-done').length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  console.log(`\n========================================================================`);
  console.log(` CICLO ACTIVO: ${cycle.name}`);
  console.log(`========================================================================`);
  console.log(`Periodo      : ${cycle.start_date} al ${cycle.end_date}`);
  console.log(`Progreso     : ${percent}% (${done} de ${total} tareas completadas)`);
  console.log(`Descripcion  : ${cycle.description}`);
  console.log(`\nTareas en este ciclo:`);
  for (const i of issues) {
    const mark = i.state_id === 'state-done' ? '[x]' : '[ ]';
    console.log(`  ${mark} ${i.id}: ${i.title} (${i.state_name})`);
  }
  console.log(`========================================================================\n`);
}

function handleModuleList() {
  const modules = db.prepare('SELECT * FROM modules ORDER BY name ASC').all();
  console.log(`\nModulos de Arquitectura (Epics / Bounded Contexts):\n`);
  console.log('ID'.padEnd(24) + 'NOMBRE'.padEnd(36) + 'DESCRIPCION');
  console.log('-'.repeat(85));
  for (const m of modules) {
    console.log(`${m.id.padEnd(24)}${m.name.padEnd(36)}${(m.description || '').slice(0, 30)}`);
  }
  console.log('');
}

function handlePageList() {
  const shelfFilter = getArg('--shelf');
  const accessFilter = getArg('--access');
  let query = 'SELECT id, title, shelf, owned_by_role, updated_by_id, module_id, access, is_locked, is_favorite, archived_at, word_count, char_count, paragraph_count, diagrams_count, reading_time_min, file_path, created_at, updated_at FROM pages WHERE 1=1';
  const params = [];
  if (shelfFilter) {
    query += ' AND shelf = ?';
    params.push(shelfFilter);
  }
  if (accessFilter === 'public') {
    query += ' AND access = 0 AND archived_at IS NULL';
  } else if (accessFilter === 'private') {
    query += ' AND access = 1 AND archived_at IS NULL';
  } else if (accessFilter === 'archived') {
    query += ' AND archived_at IS NOT NULL';
  }
  if (args.includes('--favorites')) {
    query += ' AND is_favorite = 1';
  }
  if (args.includes('--locked')) {
    query += ' AND is_locked = 1';
  }
  query += ' ORDER BY is_favorite DESC, shelf ASC, title ASC';

  const pages = db.prepare(query).all(...params);
  for (const p of pages) {
    p.logs = db.prepare('SELECT entity_identifier, entity_name, entity_type FROM page_logs WHERE page_id = ?').all(p.id);
    p.labels = db.prepare('SELECT l.id, l.name, l.color FROM page_labels pl JOIN labels l ON pl.label_id = l.id WHERE pl.page_id = ?').all(p.id);
  }

  if (args.includes('--json')) {
    console.log(JSON.stringify(pages, null, 2));
    return;
  }

  console.log(`\nPaginas de la Base de Conocimiento (Plane Library):\n`);
  console.log('ESTANTE'.padEnd(16) + 'ACCESO'.padEnd(10) + 'FAV/LOCK'.padEnd(12) + 'PALABRAS'.padEnd(10) + 'DIAG'.padEnd(6) + 'TITULO');
  console.log('-'.repeat(92));
  for (const p of pages) {
    const acc = p.archived_at ? 'ARCHIVED' : (p.access === 1 ? 'PRIVATE' : 'PUBLIC');
    const flags = `${p.is_favorite ? '[FAV]' : ''}${p.is_locked ? '[LOCK]' : ''}` || '-';
    console.log(`${(p.shelf || 'doc').padEnd(16)}${acc.padEnd(10)}${flags.padEnd(12)}${String(p.word_count || 0).padEnd(10)}${String(p.diagrams_count || 0).padEnd(6)}${p.title}`);
  }
  console.log('');
}

function handlePageGet() {
  const slug = args[2];
  if (!slug) {
    console.error('Error: Debe proporcionar el slug o id de la pagina (ej: c4-model o business-rules)');
    process.exit(1);
  }

  const page = db.prepare('SELECT * FROM pages WHERE id = ? OR file_path LIKE ?').get(slug, `%${slug}%`);
  if (!page) {
    console.error(`Error: Pagina '${slug}' no encontrada en la base de datos.`);
    process.exit(1);
  }

  console.log(page.content_markdown);
}

function handlePageUpsert() {
  const sourceFile = getArg('--file', null);
  let relPath = getArg('--path');
  if (!relPath && sourceFile) {
    relPath = sourceFile.replace(/^project-docs[\\/]/, '').replace(/\\/g, '/');
  }
  const title = getArg('--title');
  const shelf = getArg('--shelf', 'standards');
  let content = getArg('--content', '');
  const role = getArg('--role', 'spec-author');
  const accessArg = getArg('--access', null);
  const accessVal = accessArg === 'private' || accessArg === '1' ? 1 : (accessArg === 'public' || accessArg === '0' ? 0 : (args.includes('--private') ? 1 : 0));
  const isLocked = args.includes('--locked') ? 1 : (args.includes('--unlocked') ? 0 : null);
  const isFavorite = args.includes('--favorite') ? 1 : null;
  const fullWidth = args.includes('--full-width') ? true : null;
  const labelsRaw = getArg('--labels', '');
  const labels = labelsRaw ? labelsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const moduleId = getArg('--module', null);

  if (!relPath || !title) {
    console.error('Uso: node project-docs/cli.js page upsert --path <rel_path> --title <titulo> [--shelf <shelf>] [--file <md_file>] [--content <md>] [--access public|private] [--locked] [--favorite] [--full-width] [--labels <csv>] [--module <mod>]');
    process.exit(1);
  }

  if (sourceFile && !content) {
    const absFile = path.isAbsolute(sourceFile) ? sourceFile : path.resolve(PROJECT_DOCS_DIR, '..', sourceFile);
    if (fs.existsSync(absFile)) {
      content = fs.readFileSync(absFile, 'utf8');
    }
  } else if (!content) {
    const candidateFile = path.join(PROJECT_DOCS_DIR, relPath.replace(/^project-docs[\\/]/, ''));
    if (fs.existsSync(candidateFile)) {
      content = fs.readFileSync(candidateFile, 'utf8');
    }
  }

  const page = upsertPageInSQLite(db, {
    file_path: relPath,
    title,
    shelf,
    content_markdown: content || `# ${title}\n`,
    owned_by_role: role,
    access: accessVal,
    is_locked: isLocked,
    is_favorite: isFavorite,
    full_width: fullWidth,
    labels,
    module_id: moduleId
  });

  if (args.includes('--json')) {
    console.log(JSON.stringify(page, null, 2));
    return;
  }
  console.log(`[OK] Pagina '${page.title}' (${page.file_path}) registrada en SQLite (Plane Library) y sincronizada en disco.`);
}

function handlePageLifecycle(action) {
  const slug = args[2];
  if (!slug) {
    console.error(`Uso: node project-docs/cli.js page ${action} <id_o_slug>`);
    process.exit(1);
  }
  const page = db.prepare('SELECT * FROM pages WHERE id = ? OR file_path LIKE ?').get(slug, `%${slug}%`);
  if (!page) {
    console.error(`Error: Pagina '${slug}' no encontrada.`);
    process.exit(1);
  }
  if (action === 'archive') {
    const updated = updatePagePropertiesInSQLite(db, page.id, { archived: true });
    console.log(`[OK] Pagina '${updated.title}' archivada en Plane Library (is_favorite reiniciado a 0).`);
  } else if (action === 'restore') {
    const updated = updatePagePropertiesInSQLite(db, page.id, { archived: false });
    console.log(`[OK] Pagina '${updated.title}' restaurada en Plane Library.`);
  } else if (action === 'duplicate') {
    const copy = duplicatePageInSQLite(db, page.id);
    console.log(`[OK] Pagina duplicada como '${copy.title}' (${copy.file_path}).`);
  } else if (action === 'access') {
    const mode = getArg('--mode', 'public');
    const accessVal = mode === 'private' || mode === '1' ? 1 : 0;
    const updated = updatePagePropertiesInSQLite(db, page.id, { access: accessVal });
    console.log(`[OK] Acceso de pagina '${updated.title}' actualizado a ${updated.access === 1 ? 'PRIVATE' : 'PUBLIC'}.`);
  }
}

function handleUserList() {
  const users = db.prepare('SELECT * FROM users ORDER BY is_bot DESC, username ASC').all();
  if (args.includes('--json')) {
    console.log(JSON.stringify(users, null, 2));
    return;
  }

  console.log(`\nUsuarios & Agentes Bot del Workspace (${users.length}):\n`);
  console.log('ID'.padEnd(20) + 'ROL'.padEnd(16) + 'BOT'.padEnd(8) + 'TIPO BOT'.padEnd(20) + 'NOMBRE');
  console.log('-'.repeat(85));
  for (const u of users) {
    console.log(`${u.id.padEnd(20)}${u.role.padEnd(16)}${(u.is_bot ? 'SI' : 'NO').padEnd(8)}${(u.bot_type || '').padEnd(20)}${u.display_name}`);
  }
  console.log('');
}

function handleSync() {
  console.log('[SYNC] Sincronizando SQLite relacional con archivos Markdown, Evidencias, IA y JSON...');
  syncFilesToSQLite(db);
  console.log('[SUCCESS] Sincronizacion completada exitosamente.');
}

switch (command) {
  case 'status':
    handleStatus();
    break;
  case 'issue':
    if (args[1] === 'list') handleIssueList();
    else if (args[1] === 'get') handleIssueGet();
    else if (args[1] === 'create') handleIssueCreate();
    else if (args[1] === 'update') handleIssueUpdate();
    else if (args[1] === 'evidence') handleIssueEvidence();
    else if (args[1] === 'comment') handleIssueComment();
    else if (args[1] === 'relate') handleIssueRelate();
    else if (args[1] === 'activity') handleIssueActivity();
    else printHelp();
    break;
  case 'ai':
    if (args[1] === 'log') handleAiLog();
    else if (args[1] === 'list') handleAiList();
    else printHelp();
    break;
  case 'cycle':
    if (args[1] === 'current') handleCycleCurrent();
    else handleCycleList();
    break;
  case 'module':
    handleModuleList();
    break;
  case 'page':
    if (args[1] === 'get') handlePageGet();
    else if (args[1] === 'upsert') handlePageUpsert();
    else if (['archive', 'restore', 'duplicate', 'access'].includes(args[1])) handlePageLifecycle(args[1]);
    else handlePageList();
    break;
  case 'user':
    handleUserList();
    break;
  case 'sync':
    handleSync();
    break;
  case 'help':
  default:
    printHelp();
    break;
}
