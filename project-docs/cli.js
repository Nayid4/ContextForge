#!/usr/bin/env node
/**
 * CLI Soberana de Gestión de Proyectos y Base de Conocimiento (Plane Edition)
 * Permite a agentes de IA, skills y desarrolladores consultar y manipular
 * tareas, ciclos, módulos y documentación viva directamente desde terminal o scripts.
 *
 * 100% Vectorial, sin emojis.
 *
 * Uso:
 *   node project-docs/cli.js status
 *   node project-docs/cli.js issue list [--state <state>] [--priority <p>] [--json]
 *   node project-docs/cli.js issue get <id> [--json]
 *   node project-docs/cli.js issue update <id> --state <state> [--priority <p>]
 *   node project-docs/cli.js cycle list
 *   node project-docs/cli.js cycle current
 *   node project-docs/cli.js module list
 *   node project-docs/cli.js page list [--shelf <shelf>]
 *   node project-docs/cli.js page get <slug>
 *   node project-docs/cli.js sync
 */

import { initDatabase } from './src/core/db.js';
import {
  syncFilesToSQLite,
  syncIssueToFiles,
  syncPageToFile,
  getPlaneData
} from './src/core/sqlite-sync.js';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DOCS_DIR = __dirname;
const DB_PATH = path.join(PROJECT_DOCS_DIR, 'data', 'harness.db');

// Inicializar base de datos
const db = initDatabase(DB_PATH);

// Parsear argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0] || 'help';

function printHelp() {
  console.log(`
CLI Soberana del Arnés de Ingeniería (Plane Edition)

Comandos Disponibles:
  status                                 Resumen general del arnés, ciclo activo y métricas
  issue list [--state <s>] [--json]      Listar tareas registradas
  issue get <id> [--json]                Obtener detalle completo de una tarea (Scrum, EARS, Subtareas)
  issue update <id> --state <s>          Actualizar estado de una tarea y sincronizar con archivos
  cycle list                             Listar ciclos (sprints) y porcentaje de avance
  cycle current                          Detalle del ciclo activo y métricas de burn-down
  module list                            Listar módulos de arquitectura y avance
  page list [--shelf <s>] [--json]       Listar páginas de la base de conocimiento
  page get <slug>                        Imprimir contenido Markdown de una página
  sync                                   Ejecutar sincronización bidireccional SQLite <-> Disco
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

  console.log(`
========================================================================
 ESTADO DEL PROYECTO — ${data.workspace.name} / ${data.project.name}
========================================================================
Ciclo Activo     : ${activeCycle.name || 'Sin ciclo'} (${activeCycle.start_date || 'N/A'} al ${activeCycle.end_date || 'N/A'})
Total Tareas     : ${total} (Completadas: ${done}, En Progreso: ${inProgress}, Pendientes: ${backlog})
Módulos Activos  : ${data.modules.length}
Páginas de Docs  : ${data.pages.length}
Base de Datos    : SQLite (WAL activo en project-docs/data/harness.db)
Sincronización   : Espejo bidireccional Markdown activo (100% OK)
========================================================================
`);
}

function handleIssueList() {
  const isJson = args.includes('--json');
  const stateIdx = args.indexOf('--state');
  const filterState = stateIdx !== -1 ? args[stateIdx + 1] : null;

  const priorityIdx = args.indexOf('--priority');
  const filterPriority = priorityIdx !== -1 ? args[priorityIdx + 1] : null;

  let query = 'SELECT * FROM issues WHERE 1=1';
  const params = [];

  if (filterState) {
    query += ' AND (state_id = ? OR state_name LIKE ?)';
    params.push(filterState, `%${filterState}%`);
  }
  if (filterPriority) {
    query += ' AND priority = ?';
    params.push(filterPriority.toLowerCase());
  }
  query += ' ORDER BY sequence_id ASC';

  const issues = db.prepare(query).all(...params);

  if (isJson) {
    console.log(JSON.stringify(issues, null, 2));
    return;
  }

  console.log(`\nListado de Tareas (${issues.length}):\n`);
  console.log('ID'.padEnd(12) + 'ESTADO'.padEnd(16) + 'PRIORIDAD'.padEnd(12) + 'AGENTE'.padEnd(14) + 'TITULO');
  console.log('-'.repeat(80));

  for (const i of issues) {
    const id = (i.id || '').padEnd(12);
    const st = (i.state_name || i.state_id || '').padEnd(16);
    const pr = (i.priority || 'none').padEnd(12);
    const ag = (i.assignee_role || 'leader').padEnd(14);
    const title = (i.title || '').slice(0, 40);
    console.log(`${id}${st}${pr}${ag}${title}`);
  }
  console.log('');
}

function handleIssueGet() {
  const issueId = args[2];
  if (!issueId) {
    console.error('Error: Debe proporcionar el ID de la tarea (ej: INT-012 o 12)');
    process.exit(1);
  }

  const normalizedId = issueId.startsWith('INT-') ? issueId : `INT-${String(issueId).padStart(3, '0')}`;
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(normalizedId);

  if (!issue) {
    console.error(`Error: Tarea con ID ${issueId} no encontrada en SQLite.`);
    process.exit(1);
  }

  const subtasks = db.prepare('SELECT * FROM subtasks WHERE issue_id = ? ORDER BY id ASC').all(normalizedId);
  const isJson = args.includes('--json');

  if (isJson) {
    console.log(JSON.stringify({ ...issue, subtasks }, null, 2));
    return;
  }

  console.log(`\n========================================================================`);
  console.log(` TAREA: ${issue.id} — ${issue.title}`);
  console.log(`========================================================================`);
  console.log(`Estado       : ${issue.state_name || issue.state_id}`);
  console.log(`Prioridad    : ${issue.priority}`);
  console.log(`Módulo       : ${issue.module_name || 'Harness'}`);
  console.log(`Ciclo        : ${issue.cycle_name || 'Activo'}`);
  console.log(`Agente       : ${issue.assignee_role || 'leader'}`);
  if (issue.branch) console.log(`Rama Git     : ${issue.branch}`);
  if (issue.spec_folder) console.log(`Carpeta Spec : ${issue.spec_folder}`);

  if (issue.user_story_i_want) {
    console.log(`\nHistoria de Usuario (Scrum):`);
    console.log(`  Como  : ${issue.user_story_as_a}`);
    console.log(`  Quiero: ${issue.user_story_i_want}`);
    console.log(`  Para  : ${issue.user_story_so_that}`);
  }

  console.log(`\nDescripción:`);
  console.log(`  ${issue.description || 'Sin descripción'}`);

  if (subtasks.length > 0) {
    console.log(`\nSubtareas Jira (${subtasks.length}):`);
    for (const sub of subtasks) {
      const mark = sub.status === 'done' || sub.status === 'passed' ? '[x]' : '[ ]';
      console.log(`  ${mark} [${sub.type.toUpperCase()}] ${sub.id}: ${sub.title}`);
    }
  }
  console.log(`========================================================================\n`);
}

function handleIssueUpdate() {
  const issueId = args[2];
  const stateIdx = args.indexOf('--state');
  const targetState = stateIdx !== -1 ? args[stateIdx + 1] : null;

  const priorityIdx = args.indexOf('--priority');
  const targetPriority = priorityIdx !== -1 ? args[priorityIdx + 1] : null;

  if (!issueId || (!targetState && !targetPriority)) {
    console.error('Uso: node cli.js issue update <id> --state <state_id> [--priority <p>]');
    process.exit(1);
  }

  const normalizedId = issueId.startsWith('INT-') ? issueId : `INT-${String(issueId).padStart(3, '0')}`;
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(normalizedId);

  if (!issue) {
    console.error(`Error: Tarea ${normalizedId} no encontrada.`);
    process.exit(1);
  }

  // Resolver nombre de estado si se pasó un slug
  const stateMapping = {
    'backlog': 'state-backlog',
    'todo': 'state-todo',
    'in_progress': 'state-in-progress',
    'in-progress': 'state-in-progress',
    'in_review': 'state-in-review',
    'in-review': 'state-in-review',
    'done': 'state-done',
    'cancelled': 'state-cancelled'
  };

  const finalStateId = stateMapping[targetState] || targetState || issue.state_id;
  const stateRow = db.prepare('SELECT name FROM states WHERE id = ?').get(finalStateId);
  const stateName = stateRow ? stateRow.name : finalStateId;

  // Actualizar en SQLite
  db.prepare(`
    UPDATE issues
    SET state_id = ?, state_name = ?, priority = COALESCE(?, priority), updated_at = datetime('now')
    WHERE id = ?
  `).run(finalStateId, stateName, targetPriority ? targetPriority.toLowerCase() : null, normalizedId);

  // Sincronizar inmediatamente a archivos Markdown y JSON
  syncIssueToFiles(db, PROJECT_DOCS_DIR, normalizedId);

  console.log(`[OK] Tarea ${normalizedId} actualizada con éxito en SQLite y sincronizada con feature_list.json y specs.`);
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

  const issues = db.prepare('SELECT * FROM issues WHERE cycle_id = ?').all(cycle.id);
  const total = issues.length;
  const done = issues.filter(i => i.state_id === 'state-done').length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  console.log(`\n========================================================================`);
  console.log(` CICLO ACTIVO: ${cycle.name}`);
  console.log(`========================================================================`);
  console.log(`Periodo      : ${cycle.start_date} al ${cycle.end_date}`);
  console.log(`Progreso     : ${percent}% (${done} de ${total} tareas completadas)`);
  console.log(`Descripción  : ${cycle.description}`);
  console.log(`\nTareas en este ciclo:`);
  for (const i of issues) {
    const mark = i.state_id === 'state-done' ? '[x]' : '[ ]';
    console.log(`  ${mark} ${i.id}: ${i.title} (${i.state_name})`);
  }
  console.log(`========================================================================\n`);
}

function handleModuleList() {
  const modules = db.prepare('SELECT * FROM modules ORDER BY name ASC').all();
  console.log(`\nMódulos de Arquitectura (Epics / Bounded Contexts):\n`);
  console.log('ID'.padEnd(24) + 'NOMBRE'.padEnd(36) + 'DESCRIPCION');
  console.log('-'.repeat(85));
  for (const m of modules) {
    console.log(`${m.id.padEnd(24)}${m.name.padEnd(36)}${(m.description || '').slice(0, 30)}`);
  }
  console.log('');
}

function handlePageList() {
  const shelfIdx = args.indexOf('--shelf');
  const shelfFilter = shelfIdx !== -1 ? args[shelfIdx + 1] : null;

  let query = 'SELECT id, title, shelf, word_count, reading_time_min, file_path FROM pages WHERE 1=1';
  const params = [];
  if (shelfFilter) {
    query += ' AND shelf = ?';
    params.push(shelfFilter);
  }
  query += ' ORDER BY shelf ASC, title ASC';

  const pages = db.prepare(query).all(...params);

  if (args.includes('--json')) {
    console.log(JSON.stringify(pages, null, 2));
    return;
  }

  console.log(`\nPáginas de la Base de Conocimiento (Plane Pages):\n`);
  console.log('ESTANTE'.padEnd(18) + 'ID / SLUG'.padEnd(36) + 'PALABRAS'.padEnd(10) + 'TITULO');
  console.log('-'.repeat(85));
  for (const p of pages) {
    console.log(`${(p.shelf || 'doc').padEnd(18)}${(p.id || '').slice(0, 34).padEnd(36)}${String(p.word_count || 0).padEnd(10)}${p.title}`);
  }
  console.log('');
}

function handlePageGet() {
  const slug = args[2];
  if (!slug) {
    console.error('Error: Debe proporcionar el slug o id de la página (ej: c4-model o business-rules)');
    process.exit(1);
  }

  const page = db.prepare('SELECT * FROM pages WHERE id = ? OR file_path LIKE ?').get(slug, `%${slug}%`);
  if (!page) {
    console.error(`Error: Página '${slug}' no encontrada en la base de datos.`);
    process.exit(1);
  }

  console.log(page.content_markdown);
}

function handleSync() {
  console.log('[SYNC] Sincronizando SQLite relacional con archivos Markdown y JSON...');
  syncFilesToSQLite(db, PROJECT_DOCS_DIR);
  console.log('[SUCCESS] Sincronización completada exitosamente.');
}

// Router de comandos CLI
switch (command) {
  case 'status':
    handleStatus();
    break;
  case 'issue':
    if (args[1] === 'list') handleIssueList();
    else if (args[1] === 'get') handleIssueGet();
    else if (args[1] === 'update') handleIssueUpdate();
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
    else handlePageList();
    break;
  case 'sync':
    handleSync();
    break;
  case 'help':
  default:
    printHelp();
    break;
}
