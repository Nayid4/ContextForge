import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { initDatabase } from '../../src/core/db.js';
import {
  syncFilesToSQLite,
  getPlaneData,
  mapStatusToStateId,
  mapStateIdToStatus,
  mapPriority,
  recordSkillExecution,
  recordIssueEvidence,
  recordIssueComment,
  recordIssueRelation,
  extractPageTelemetryAndLogs,
  updatePagePropertiesInSQLite,
  createCollectionInSQLite,
  updateCollectionInSQLite,
  archiveCollectionInSQLite,
  movePageInSQLite,
  archivePageCascadeInSQLite,
  unarchivePageInSQLite,
  restorePageVersionInSQLite,
  backfillSlugAndDepth,
  unlockPageInSQLite,
  lockPageInSQLite,
  getAgentContextDossier
} from '../../src/core/sqlite-sync.js';

describe('Suite de Base de Datos Relacional SQLite (node:sqlite) para Plane & IA (29 Tablas)', () => {
  test('initDatabase crea las tablas relacionales requeridas para Plane, Pages Graph e IA', () => {
    const db = initDatabase(':memory:');
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC;
    `).all().map(t => t.name);

    const expected = [
      'ai_configs',
      'ai_runs',
      'api_tokens',
      'collections',
      'cycle_issues',
      'cycles',
      'estimate_points',
      'estimates',
      'issue_activities',
      'issue_assignees',
      'issue_comments',
      'issue_evidences',
      'issue_labels',
      'issue_relations',
      'issue_types',
      'issue_views',
      'issues',
      'labels',
      'module_issues',
      'modules',
      'page_audit',
      'page_labels',
      'page_logs',
      'page_versions',
      'pages',
      'projects',
      'states',
      'subtasks',
      'users',
      'workspace_members',
      'workspaces'
    ];
    assert.deepStrictEqual(tables, expected);
  });

  test('Mapeo de estados y prioridades bidireccional', () => {
    assert.strictEqual(mapStatusToStateId('pending'), 'state-backlog');
    assert.strictEqual(mapStatusToStateId('spec_ready'), 'state-todo');
    assert.strictEqual(mapStatusToStateId('in_progress'), 'state-in-progress');
    assert.strictEqual(mapStatusToStateId('done'), 'state-done');

    assert.strictEqual(mapStateIdToStatus('state-backlog'), 'pending');
    assert.strictEqual(mapStateIdToStatus('state-todo'), 'spec_ready');
    assert.strictEqual(mapStateIdToStatus('state-in-progress'), 'in_progress');
    assert.strictEqual(mapStateIdToStatus('state-done'), 'done');

    assert.strictEqual(mapPriority('P0'), 'urgent');
    assert.strictEqual(mapPriority('P1'), 'high');
    assert.strictEqual(mapPriority('P2'), 'medium');
    assert.strictEqual(mapPriority('P3'), 'low');
    assert.strictEqual(mapPriority(''), 'none');
  });

  test('syncFilesToSQLite puebla datos relacionales de Plane, agentes bot IA, evidencias, page_logs y page_labels', () => {
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);
    const data = getPlaneData(db);

    assert.ok(data.workspace);
    assert.strictEqual(data.workspace.slug, 'harness-engineering');
    assert.ok(data.project);
    assert.strictEqual(data.project.slug, 'harness-sdd');

    // Verificar usuarios bot e integracion IA
    assert.ok(Array.isArray(data.users));
    assert.ok(data.users.length >= 5);
    assert.ok(data.users.some(u => u.username === 'leader' && u.is_bot === 1));
    assert.ok(Array.isArray(data.apiTokens));
    assert.ok(data.apiTokens.length >= 4);
    assert.ok(Array.isArray(data.aiConfigs));
    assert.ok(data.aiConfigs.length >= 4);
    assert.ok(Array.isArray(data.aiRuns));
    assert.ok(data.aiRuns.length > 0);

    // Verificar catalogos Plane
    assert.strictEqual(data.states.length, 6);
    assert.ok(data.labels.length >= 7);
    assert.ok(data.estimatePoints.length === 6);
    assert.ok(data.issueTypes.length >= 3);
    assert.ok(data.views.length >= 3);
    assert.ok(data.cycles.length >= 3);
    assert.ok(data.modules.length >= 5);
    assert.ok(data.issues.length >= 11);
    assert.ok(data.pages.length >= 10);

    // Verificar que un issue tenga sus subtareas, labels, evidencias, actividades y ai_runs anidados
    const issue11 = data.issues.find(i => i.sequence_id === 11);
    assert.ok(issue11);
    assert.strictEqual(issue11.id, 'INT-011');
    assert.ok(Array.isArray(issue11.subtasks) && issue11.subtasks.length > 0);
    assert.ok(Array.isArray(issue11.labels) && issue11.labels.length > 0);
    assert.ok(Array.isArray(issue11.evidences));
    assert.ok(Array.isArray(issue11.activities) && issue11.activities.length > 0);
    assert.ok(Array.isArray(issue11.ai_runs) && issue11.ai_runs.length > 0);
    assert.ok(Array.isArray(issue11.acceptance));

    // Verificar que cada página tenga telemetría, page_logs, page_labels y versions
    const c4Page = data.pages.find(p => (p.file_path || '').includes('c4-model.md'));
    assert.ok(c4Page);
    assert.ok(c4Page.word_count > 0);
    assert.ok(c4Page.char_count > 0);
    assert.ok(c4Page.paragraph_count > 0);
    assert.ok(Array.isArray(c4Page.logs));
    assert.ok(Array.isArray(c4Page.labels) && c4Page.labels.length > 0);
    assert.ok(Array.isArray(c4Page.versions) && c4Page.versions.length > 0);
  });

  test('extractPageTelemetryAndLogs y updatePagePropertiesInSQLite gestionan vínculos y propiedades de página', () => {
    const md = '# Arquitectura\nVinculado a INT-016, regla BR-001, requisito RF-002 y [Reglas](business-rules.md).\n```mermaid\nflowchart TD\nA-->B\n```';
    const telemetry = extractPageTelemetryAndLogs(md, 'knowledge/c4-model.md');
    assert.strictEqual(telemetry.diagramsCount, 1);
    assert.ok(telemetry.logs.some(l => l.entity_name === 'issue' && l.entity_identifier === 'INT-016'));
    assert.ok(telemetry.logs.some(l => l.entity_name === 'business_rule' && l.entity_identifier === 'BR-001'));
    assert.ok(telemetry.logs.some(l => l.entity_name === 'requirement' && l.entity_identifier === 'RF-002'));
    assert.ok(telemetry.labelIds.includes('lbl-c4'));
    assert.ok(Array.isArray(telemetry.assets) && telemetry.assets.length === 1);

    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);
    const firstPage = db.prepare('SELECT id FROM pages LIMIT 1').get();
    assert.ok(firstPage);

    const updated = updatePagePropertiesInSQLite(db, firstPage.id, {
      is_favorite: true,
      is_locked: false,
      full_width: true
    });
    assert.strictEqual(updated.is_favorite, 1);
    assert.strictEqual(updated.is_locked, 0);
    assert.ok(updated.view_props.includes('"full_width":true'));
  });

  test('Funciones de registro de IA, evidencias, comentarios y relaciones funcionan en SQLite', () => {
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);

    const run = recordSkillExecution(db, {
      skill_name: 'verify-spec',
      agent_role: 'reviewer',
      issue_id: 'INT-012',
      task_type: 'QA_VERIFICATION_CLOSURE',
      prompt_summary: 'Verificacion unitaria de registro IA',
      artifacts: ['project-docs/specs/012_plane_sqlite_ai_platform/verification-report.md']
    });
    assert.ok(run.id.startsWith('airun-'));
    assert.strictEqual(run.skill_name, 'verify-spec');
    assert.strictEqual(run.issue_id, 'INT-012');

    const ev = recordIssueEvidence(db, {
      issue_id: 'INT-012',
      type: 'verification-report',
      title: 'Reporte de Prueba',
      file_path: 'project-docs/specs/012_plane_sqlite_ai_platform/verification-report.md',
      created_by_skill: 'verify-spec'
    });
    assert.ok(ev.id.startsWith('ev-INT-012'));
    assert.strictEqual(ev.created_by_skill, 'verify-spec');

    const cmt = recordIssueComment(db, {
      issue_id: 'INT-012',
      actor_role: 'implementer',
      body_markdown: 'Tests unitarios ejecutados en verde',
      source_skill: 'implement-tdd'
    });
    assert.ok(cmt.id.startsWith('cmt-INT-012'));
    assert.strictEqual(cmt.source_skill, 'implement-tdd');

    const rel = recordIssueRelation(db, {
      issue_id: 'INT-012',
      related_issue_id: 'INT-011',
      relation_type: 'blocked_by'
    });
    assert.strictEqual(rel.issue_id, 'INT-012');
    assert.strictEqual(rel.related_issue_id, 'INT-011');
  });

  test('Transición de estados relacional y actualización de timestamps', () => {
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);

    db.prepare('UPDATE issues SET state_id = ? WHERE id = ?').run('state-done', 'INT-012');
    const updated = db.prepare('SELECT state_id FROM issues WHERE id = ?').get('INT-012');
    assert.strictEqual(updated.state_id, 'state-done');
  });

  test('Foreign key constraint previene subtasks huérfanas', () => {
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);

    assert.throws(() => {
      db.prepare(`
        INSERT INTO subtasks (id, issue_id, type, title, assignee_role, status, sequence)
        VALUES ('SUB-INVALID', 'INT-999-INEXISTENTE', 'dev', 'Test', 'leader', 'pending', 1);
      `).run();
    }, /FOREIGN KEY constraint failed/);
  });

  test('Wiki & Pages Relational Business Rules Suite: BR-PAGE-07, BR-PAGE-08 y BR-PAGE-09', () => {
    const knowledgeDir = path.resolve(__dirname, '../../knowledge');
    const tempTestFiles = ['qa.md', 'p1.md', 'p2.md', 'd1.md', 'd2.md', 'd3.md', 'd4.md', 'd5.md'].map(f => path.join(knowledgeDir, f));

    try {
      const db = initDatabase(':memory:');
      syncFilesToSQLite(db);

      // 1. Colecciones dinámicas CRUD y BR-PAGE-12: Sanitización de diacríticos y reglas de nombre
      const newCol = createCollectionInSQLite(db, {
        name: 'QA Automation',
        description: 'Planes y pruebas automatizadas',
        icon: 'checkCircle',
        color: '#06b6d4'
      });
      assert.strictEqual(newCol.id, 'qa_automation');
      assert.strictEqual(newCol.name, 'QA Automation');

      // BR-PAGE-12: "Diseño" debe normalizarse a "diseno" eliminando marcas combinantes NFD
      const disenoCol = createCollectionInSQLite(db, { name: 'Diseño' });
      assert.strictEqual(disenoCol.id, 'diseno', 'Diseño debe normalizarse deterministamente a diseno');

      // BR-PAGE-12: Nombre vacío rechazado
      assert.throws(() => {
        createCollectionInSQLite(db, { name: '   ' });
      }, /BR-PAGE-12 Violation: Collection name cannot be empty/);

      // BR-PAGE-12: Id duplicado rechazado
      assert.throws(() => {
        createCollectionInSQLite(db, { name: 'Diseño' });
      }, /BR-PAGE-12 Violation: Collection with id 'diseno' already exists/);

      updateCollectionInSQLite(db, 'qa_automation', { description: 'Actualizado' });
      const updatedCol = db.prepare('SELECT * FROM collections WHERE id = ?').get('qa_automation');
      assert.strictEqual(updatedCol.description, 'Actualizado');

      // 2. BR-PAGE-07: No se puede archivar una colección que contiene páginas activas
      // Insertamos una página activa en qa_automation
      db.prepare(`
        INSERT INTO pages (id, project_id, collection_id, file_path, title, shelf, content_markdown)
        VALUES ('p-qa-active', 'proj-harness', 'qa_automation', 'knowledge/qa.md', 'Plan de QA', 'standards', '# Plan')
      `).run();

      assert.throws(() => {
        archiveCollectionInSQLite(db, 'qa_automation');
      }, /BR-PAGE-07 Violation/);

      // Si archivamos la página activa, ahora sí permite archivar la colección
      db.prepare('UPDATE pages SET archived_at = CURRENT_TIMESTAMP WHERE id = ?').run('p-qa-active');
      assert.strictEqual(archiveCollectionInSQLite(db, 'qa_automation'), true);

      // 3. BR-PAGE-08: Prevención de ciclos en jerarquía padre-hijo y límite de profundidad
      db.prepare(`
        INSERT INTO pages (id, project_id, collection_id, file_path, title, shelf, content_markdown)
        VALUES ('p-parent', 'proj-harness', 'engineering', 'knowledge/p1.md', 'Parent', 'standards', '# P1'),
               ('p-child', 'proj-harness', 'engineering', 'knowledge/p2.md', 'Child', 'standards', '# P2')
      `).run();

      // Auto-paternidad prohibida
      assert.throws(() => {
        movePageInSQLite(db, 'p-parent', 'engineering', 'p-parent', { actor: { id: 'user-human-lead' } });
      }, /BR-PAGE-08 Violation: A page cannot be its own parent/);

      // Actor obligatorio en operaciones de ciclo de vida
      assert.throws(() => {
        movePageInSQLite(db, 'p-child', 'engineering', 'p-parent');
      }, /BR-PAGE-02 Violation: Actor required for operation/);
      assert.throws(() => {
        archivePageCascadeInSQLite(db, 'p-parent');
      }, /BR-PAGE-02 Violation: Actor required for operation/);
      assert.throws(() => {
        restorePageVersionInSQLite(db, 'p-parent', 1);
      }, /BR-PAGE-02 Violation: Actor required for operation/);
      assert.throws(() => {
        unlockPageInSQLite(db, 'p-parent');
      }, /BR-PAGE-02 Violation: Actor required for operation/);
      assert.throws(() => {
        lockPageInSQLite(db, 'p-parent');
      }, /BR-PAGE-02 Violation: Actor required for operation/);

      // Establecer hijo válido
      movePageInSQLite(db, 'p-child', 'engineering', 'p-parent', { actor: { id: 'user-human-lead' } });
      const child = db.prepare('SELECT * FROM pages WHERE id = ?').get('p-child');
      assert.strictEqual(child.parent_id, 'p-parent');

      // Intento de ciclo: hacer a p-parent hijo de p-child
      assert.throws(() => {
        movePageInSQLite(db, 'p-parent', 'engineering', 'p-child', { actor: { id: 'user-human-lead' } });
      }, /BR-PAGE-08 Violation: Cyclic hierarchy detected/);

      // 3b. BR-PAGE-08: Límite de profundidad en el borde (depth 4 permitido, depth 5 rechazado)
      db.prepare(`
        INSERT INTO pages (id, project_id, collection_id, file_path, title, shelf, content_markdown)
        VALUES ('p-d1', 'proj-harness', 'engineering', 'knowledge/d1.md', 'L1', 'standards', '# L1'),
               ('p-d2', 'proj-harness', 'engineering', 'knowledge/d2.md', 'L2', 'standards', '# L2'),
               ('p-d3', 'proj-harness', 'engineering', 'knowledge/d3.md', 'L3', 'standards', '# L3'),
               ('p-d4', 'proj-harness', 'engineering', 'knowledge/d4.md', 'L4', 'standards', '# L4'),
               ('p-d5', 'proj-harness', 'engineering', 'knowledge/d5.md', 'L5', 'standards', '# L5')
      `).run();

      movePageInSQLite(db, 'p-d2', 'engineering', 'p-d1', { actor: { id: 'user-human-lead' } });
      movePageInSQLite(db, 'p-d3', 'engineering', 'p-d2', { actor: { id: 'user-human-lead' } });
      movePageInSQLite(db, 'p-d4', 'engineering', 'p-d3', { actor: { id: 'user-human-lead' } });
      const pageD4 = db.prepare('SELECT depth FROM pages WHERE id = ?').get('p-d4');
      assert.strictEqual(pageD4.depth, 4, 'Nivel 4 de anidación debe ser permitido');

      // Intentar mover p-d5 bajo p-d4 intentaría crear profundidad 5 (debe lanzar excepción)
      assert.throws(() => {
        movePageInSQLite(db, 'p-d5', 'engineering', 'p-d4', { actor: { id: 'user-human-lead' } });
      }, /BR-PAGE-08 Violation: Maximum nesting depth of 4 levels exceeded/);

      // 3c. Validación de altura de subárbol en movePageInSQLite
      db.prepare(`
        INSERT INTO pages (id, project_id, collection_id, file_path, title, shelf, content_markdown)
        VALUES ('p-sub-root', 'proj-harness', 'engineering', 'tests-temp/sub1-unique.md', 'SubRoot', 'standards', '# SR'),
               ('p-sub-leaf', 'proj-harness', 'engineering', 'tests-temp/sub2-unique.md', 'SubLeaf', 'standards', '# SL')
      `).run();
      movePageInSQLite(db, 'p-sub-leaf', 'engineering', 'p-sub-root', { actor: { id: 'user-human-lead' } });

      // Mover p-sub-root bajo p-d3 (depth 3): profundidad resultante 3 + 2 = 5 > 4 (debe ser rechazado)
      assert.throws(() => {
        movePageInSQLite(db, 'p-sub-root', 'engineering', 'p-d3', { actor: { id: 'user-human-lead' } });
      }, /BR-PAGE-08 Violation: Maximum nesting depth of 4 levels exceeded/);

      // Mover p-sub-root bajo p-d2 (depth 2): profundidad resultante 2 + 2 = 4 <= 4 (permitido)
      movePageInSQLite(db, 'p-sub-root', 'engineering', 'p-d2', { actor: { id: 'user-human-lead' } });
      const subLeaf = db.prepare('SELECT depth FROM pages WHERE id = ?').get('p-sub-leaf');
      assert.strictEqual(subLeaf.depth, 4, 'Hijo de subárbol debe tener profundidad recalculada a 4');

      // 4. BR-PAGE-09: Cascade Archive de jerarquía
      archivePageCascadeInSQLite(db, 'p-parent', { actor: { id: 'user-human-lead' } });
      const archParent = db.prepare('SELECT archived_at, is_favorite FROM pages WHERE id = ?').get('p-parent');
      const archChild = db.prepare('SELECT archived_at, is_favorite FROM pages WHERE id = ?').get('p-child');
      assert.ok(archParent.archived_at);
      assert.ok(archChild.archived_at);
      assert.strictEqual(archParent.is_favorite, 0);
      assert.strictEqual(archChild.is_favorite, 0);

      // 4b. BR-PAGE-09: Desarchivar padre (restoreSubtree: false) NO desarchiva los hijos
      unarchivePageInSQLite(db, 'p-parent', { restoreSubtree: false, actor: { id: 'user-human-lead' } });
      const unarchParent = db.prepare('SELECT archived_at FROM pages WHERE id = ?').get('p-parent');
      const stillArchChild = db.prepare('SELECT archived_at FROM pages WHERE id = ?').get('p-child');
      assert.strictEqual(unarchParent.archived_at, null, 'El padre debe estar desarchivado');
      assert.ok(stillArchChild.archived_at, 'El hijo debe permanecer archivado cuando restoreSubtree=false');

      // Desarchivar con restoreSubtree: true desarchiva la rama completa cuando fueron archivados juntos
      db.prepare('UPDATE pages SET archived_at = NULL WHERE id = ?').run('p-child');
      archivePageCascadeInSQLite(db, 'p-parent', { actor: { id: 'user-human-lead' } });
      unarchivePageInSQLite(db, 'p-parent', { restoreSubtree: true, actor: { id: 'user-human-lead' } });
      const fullUnarchParent = db.prepare('SELECT archived_at FROM pages WHERE id = ?').get('p-parent');
      const fullUnarchChild = db.prepare('SELECT archived_at FROM pages WHERE id = ?').get('p-child');
      assert.strictEqual(fullUnarchParent.archived_at, null);
      assert.strictEqual(fullUnarchChild.archived_at, null, 'El hijo debe desarchivarse cuando restoreSubtree=true');

      // 4c. BR-PAGE-09: Cascade Archive omite hijos previamente archivados (preservando su timestamp original)
      db.prepare(`
        INSERT INTO pages (id, project_id, collection_id, file_path, title, shelf, content_markdown)
        VALUES ('p-hier-parent', 'proj-harness', 'engineering', 'tests-temp/hp-unique.md', 'HP', 'standards', '# HP'),
               ('p-hier-child-a', 'proj-harness', 'engineering', 'tests-temp/hca-unique.md', 'HCA', 'standards', '# HCA'),
               ('p-hier-child-b', 'proj-harness', 'engineering', 'tests-temp/hcb-unique.md', 'HCB', 'standards', '# HCB')
      `).run();
      movePageInSQLite(db, 'p-hier-child-a', 'engineering', 'p-hier-parent', { actor: { id: 'user-human-lead' } });
      movePageInSQLite(db, 'p-hier-child-b', 'engineering', 'p-hier-parent', { actor: { id: 'user-human-lead' } });

      const earlyTimestamp = '2025-01-01T00:00:00.000Z';
      db.prepare('UPDATE pages SET archived_at = ?, is_favorite = 0 WHERE id = ?').run(earlyTimestamp, 'p-hier-child-b');

      archivePageCascadeInSQLite(db, 'p-hier-parent', { actor: { id: 'user-human-lead' } });
      const parentArch = db.prepare('SELECT archived_at FROM pages WHERE id = ?').get('p-hier-parent');
      const childAArch = db.prepare('SELECT archived_at FROM pages WHERE id = ?').get('p-hier-child-a');
      const childBArch = db.prepare('SELECT archived_at FROM pages WHERE id = ?').get('p-hier-child-b');

      assert.strictEqual(childAArch.archived_at, parentArch.archived_at, 'Hijo activo recibe el timestamp del padre');
      assert.strictEqual(childBArch.archived_at, earlyTimestamp, 'Hijo previamente archivado preserva su timestamp original');

      // Desarchivar con restoreSubtree: true restaura al padre y child-a, pero deja child-b archivado
      unarchivePageInSQLite(db, 'p-hier-parent', { restoreSubtree: true, actor: { id: 'user-human-lead' } });
      const parentRestored = db.prepare('SELECT archived_at FROM pages WHERE id = ?').get('p-hier-parent');
      const childARestored = db.prepare('SELECT archived_at FROM pages WHERE id = ?').get('p-hier-child-a');
      const childBStillArch = db.prepare('SELECT archived_at FROM pages WHERE id = ?').get('p-hier-child-b');

      assert.strictEqual(parentRestored.archived_at, null);
      assert.strictEqual(childARestored.archived_at, null, 'Hijo sincronizado se desarchiva');
      assert.strictEqual(childBStillArch.archived_at, earlyTimestamp, 'Hijo previamente archivado permanece archivado');

      // 5. BR-PAGE-02 Guard: Restauración de Versiones rechazada en página archivada
      archivePageCascadeInSQLite(db, 'p-parent', { actor: { id: 'user-human-lead' } });
      db.prepare(`
        INSERT INTO page_versions (id, page_id, version_number, content_markdown)
        VALUES ('pv-1', 'p-parent', 1, '# Versión Original')
      `).run();

      assert.throws(() => {
        restorePageVersionInSQLite(db, 'p-parent', 1, { actor: { id: 'user-human-lead' } });
      }, /BR-PAGE-02 Violation: Cannot restore version on archived page/);

      // Tras desarchivar la página con unarchivePageInSQLite, se permite restaurar y genera snapshot previo
      unarchivePageInSQLite(db, 'p-parent', { restoreSubtree: false, actor: { id: 'user-human-lead' } });
      const restored = restorePageVersionInSQLite(db, 'p-parent', 1, { actor: { id: 'user-human-lead' } });
      assert.strictEqual(restored.content_markdown, '# Versión Original');

      const versions = db.prepare('SELECT * FROM page_versions WHERE page_id = ? ORDER BY version_number ASC').all('p-parent');
      assert.ok(versions.some(v => v.owned_by_role === 'pre-restore-snapshot'), 'Debe guardar snapshot previo antes de sobrescribir');
    } finally {
      for (const f of tempTestFiles) {
        if (fs.existsSync(f)) {
          try { fs.unlinkSync(f); } catch {}
        }
      }
    }
  });

  test('Server-side SQLite enforcement of BR-PAGE-02 (Lock Guard) y BR-PAGE-04 (Archive Access Immutability)', () => {
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-safe-test-'));
    const testFile = path.join(tmpDir, 'test-locked.md');
    fs.writeFileSync(testFile, '# Locked Doc Init', 'utf8');

    try {
      db.prepare(`
        INSERT INTO pages (id, project_id, collection_id, file_path, title, shelf, content_markdown, is_locked, access, archived_at)
        VALUES ('p-srv-locked', 'proj-harness', 'engineering', ?, 'Locked Doc', 'standards', '# Locked', 1, 0, NULL),
               ('p-srv-archived', 'proj-harness', 'engineering', 'tmp-safe/test-archived.md', 'Archived Doc', 'standards', '# Arch', 0, 0, '2026-11-01T10:00:00Z')
      `).run(testFile);

      // 1. BR-PAGE-02: Intento de editar contenido de página bloqueada debe lanzar excepción
      assert.throws(() => {
        updatePagePropertiesInSQLite(db, 'p-srv-locked', { content_markdown: '# Nuevo Contenido Bloqueado' });
      }, /BR-PAGE-02 Violation: Cannot edit content or title of locked page/);

      // Intento de cambiar título de página bloqueada debe lanzar excepción
      assert.throws(() => {
        updatePagePropertiesInSQLite(db, 'p-srv-locked', { title: 'Nuevo Titulo Hackeado' });
      }, /BR-PAGE-02 Violation: Cannot edit content or title of locked page/);

      // Intento de saltarse el bloqueo pasando { is_locked: 0, content_markdown: '...' } a updatePageProperties
      assert.throws(() => {
        updatePagePropertiesInSQLite(db, 'p-srv-locked', { is_locked: 0, content_markdown: '# Intento Bypass' });
      }, /BR-PAGE-02 Violation: Cannot edit content or title of locked page/);

      // 1b. Operación separada de Desbloqueo (unlockPageInSQLite) auditada en page_audit
      const unlocked = unlockPageInSQLite(db, 'p-srv-locked', { actor: { id: 'user-reviewer' }, reason: 'Auditoría aprobada' });
      assert.strictEqual(unlocked.is_locked, 0);

      const unlockLog = db.prepare("SELECT * FROM page_audit WHERE page_id = 'p-srv-locked' AND action = 'unlocked'").get();
      assert.ok(unlockLog);
      assert.strictEqual(unlockLog.actor_role, 'reviewer');
      assert.ok(unlockLog.reason.includes('Auditoría aprobada'));

      // Ahora que está desbloqueada en una operación separada, sí permite edición
      const edited = updatePagePropertiesInSQLite(db, 'p-srv-locked', {
        content_markdown: '# Contenido Modificado Tras Desbloquear'
      });
      assert.strictEqual(edited.content_markdown, '# Contenido Modificado Tras Desbloquear');

      // Re-bloqueo auditado en page_audit
      const relocked = lockPageInSQLite(db, 'p-srv-locked', { actor: { id: 'user-human-lead' }, reason: 'Re-bloqueo tras edición' });
      assert.strictEqual(relocked.is_locked, 1);
      const lockLog = db.prepare("SELECT * FROM page_audit WHERE page_id = 'p-srv-locked' AND action = 'locked'").get();
      assert.ok(lockLog);
      assert.strictEqual(lockLog.actor_role, 'human-lead');
      assert.ok(lockLog);

      // 2. BR-PAGE-02: Intento de editar contenido de página archivada debe fallar
      assert.throws(() => {
        updatePagePropertiesInSQLite(db, 'p-srv-archived', { content_markdown: '# Hackeando Archivada' });
      }, /BR-PAGE-02 Violation: Cannot edit content or title of archived page/);

      // 3. BR-PAGE-04: Intento de alternar access en página archivada debe fallar
      assert.throws(() => {
        updatePagePropertiesInSQLite(db, 'p-srv-archived', { access: 1 });
      }, /BR-PAGE-04 Violation: Cannot change access visibility of archived page/);
    } finally {
      if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('BR-PAGE-10: Slugs únicos por colección y backfill de depth jerárquico', () => {
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);

    const pages = db.prepare('SELECT id, slug, depth, parent_id, collection_id FROM pages').all();
    assert.ok(pages.length > 0);

    // Todo documento debe tener un slug no vacío y depth >= 1
    for (const p of pages) {
      assert.ok(p.slug && p.slug.length > 0, `Page ${p.id} debe tener slug`);
      assert.ok(p.depth >= 1 && p.depth <= 4, `Page ${p.id} depth fuera de rango: ${p.depth}`);
      if (!p.parent_id) {
        assert.strictEqual(p.depth, 1, `Página raíz ${p.id} debe tener depth=1`);
      }
    }

    // Probar prevención de colisión de slug dentro de la misma colección
    db.prepare(`
      INSERT INTO pages (id, project_id, collection_id, file_path, title, shelf, content_markdown)
      VALUES ('p-dup-1', 'proj-harness', 'product', 'knowledge/dup1.md', 'Roadmap Q4', 'standards', '# R1'),
             ('p-dup-2', 'proj-harness', 'product', 'knowledge/dup2.md', 'Roadmap Q4', 'standards', '# R2')
    `).run();

    // Re-ejecutar backfill
    backfillSlugAndDepth(db);

    const slug1 = db.prepare('SELECT slug FROM pages WHERE id = ?').get('p-dup-1').slug;
    const slug2 = db.prepare('SELECT slug FROM pages WHERE id = ?').get('p-dup-2').slug;
    assert.strictEqual(slug1, 'roadmap-q4');
    assert.strictEqual(slug2, 'roadmap-q4-2');

    // Estabilidad de slugs: ejecuciones consecutivas de backfill no deben alterar los slugs asignados
    backfillSlugAndDepth(db);
    assert.strictEqual(db.prepare('SELECT slug FROM pages WHERE id = ?').get('p-dup-1').slug, 'roadmap-q4');
    assert.strictEqual(db.prepare('SELECT slug FROM pages WHERE id = ?').get('p-dup-2').slug, 'roadmap-q4-2');
  });

  test('Frontmatter Parent Resolution: parent: "c4-model.md" se resuelve correctamente al ID interno', () => {
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);

    const knowledgeDir = path.resolve(__dirname, '../../knowledge');
    const testChildMd = path.join(knowledgeDir, 'test-parent-resolution.md');

    try {
      fs.writeFileSync(testChildMd, `---
id: "test-ai-child"
title: "Documento Hijo Creado por IA"
collection: "engineering"
parent: "c4-model.md"
access: public
is_locked: false
---
# Contenido Hijo
`, 'utf8');

      // Sincronizar desde disco
      syncFilesToSQLite(db);

      const childRow = db.prepare("SELECT * FROM pages WHERE file_path = 'knowledge/test-parent-resolution.md'").get();
      assert.ok(childRow, 'La página hija debe indexarse');
      assert.strictEqual(childRow.parent_id, 'page-knowledge_c4-model_md', 'parent: "c4-model.md" debe resolverse al ID canónico de c4-model.md');
      assert.strictEqual(childRow.depth, 2, 'La profundidad debe ser 2 al tener como padre c4-model.md');
    } finally {
      if (fs.existsSync(testChildMd)) fs.unlinkSync(testChildMd);
    }
  });

  test('Round-trip Bidirectional Frontmatter Persistence: SQLite mutation -> .md rewrite -> re-sync without state reversion', () => {
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);

    const knowledgeDir = path.resolve(__dirname, '../../knowledge');
    const testMdPath = path.join(knowledgeDir, 'test-roundtrip-safe.md');

    const initialContent = `---
id: "test-roundtrip"
title: "Roundtrip Test Doc"
collection: "engineering"
access: 0
is_locked: false
is_favorite: false
---

# Roundtrip Test Doc

Contenido inicial de prueba.
`;

    try {
      fs.writeFileSync(testMdPath, initialContent, 'utf8');

      // 1. Sincronizar hacia SQLite
      syncFilesToSQLite(db);
      const initialRow = db.prepare("SELECT * FROM pages WHERE id = 'page-knowledge_test-roundtrip-safe_md'").get();
      assert.ok(initialRow, 'Página debe existir tras sync inicial');
      assert.strictEqual(initialRow.collection_id, 'engineering');
      assert.strictEqual(initialRow.is_locked, 0);

      // 2. Mutar propiedades en SQLite (Mover de colección y bloquear)
      movePageInSQLite(db, 'page-knowledge_test-roundtrip-safe_md', 'product', null, { actor: { id: 'user-human-lead' } });
      lockPageInSQLite(db, 'page-knowledge_test-roundtrip-safe_md', { actor: { id: 'user-human-lead' }, reason: 'Prueba roundtrip' });

      // 3. Comprobar que el archivo en disco fue reescrito de forma síncrona
      const diskContent = fs.readFileSync(testMdPath, 'utf8');
      assert.ok(diskContent.includes('collection: "product"'), 'Disco debe reflejar collection: product');
      assert.ok(diskContent.includes('is_locked: true'), 'Disco debe reflejar is_locked: true');

      // 4. Iniciar una nueva base de datos en memoria y re-sincronizar desde disco
      const freshDb = initDatabase(':memory:');
      syncFilesToSQLite(freshDb);

      const reSyncedRow = freshDb.prepare("SELECT * FROM pages WHERE id = 'page-knowledge_test-roundtrip-safe_md'").get();
      assert.ok(reSyncedRow, 'Página debe existir en freshDb');
      assert.strictEqual(reSyncedRow.collection_id, 'product', 'La colección no debe revertirse tras re-sincronizar');
      assert.strictEqual(reSyncedRow.is_locked, 1, 'El bloqueo no debe revertirse tras re-sincronizar');
    } finally {
      if (fs.existsSync(testMdPath)) fs.unlinkSync(testMdPath);
    }
  });

  test('Agent Context Dossier Suite: is_private (access = 1) exclusion and system-capabilities.md retention', () => {
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);

    // 1. Dossier para agentes (público únicamente)
    const publicDossier = getAgentContextDossier(db, { includePrivate: false });
    assert.ok(publicDossier.length > 0);

    // Ninguna página privada debe estar en el dossier público
    const hasPrivateInPublic = publicDossier.some(p => p.access === 1);
    assert.strictEqual(hasPrivateInPublic, false, 'Dossier público no debe incluir documentos con access=1');

    // system-capabilities.md (acceso público) debe estar presente
    const hasSysCap = publicDossier.some(p => p.id.includes('system-capabilities'));
    assert.strictEqual(hasSysCap, true, 'system-capabilities.md debe estar presente en el dossier del agente');

    // 2. Dossier con páginas privadas habilitadas
    const allDossier = getAgentContextDossier(db, { includePrivate: true });
    assert.ok(allDossier.length >= publicDossier.length);
    assert.ok(allDossier.length > 0);
  });

  test('unarchivePageInSQLite Suite: Enforces BR-PAGE-07, BR-PAGE-09, Actor Validation and page_audit logging', () => {
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);

    // Insert test collection
    db.prepare(`
      INSERT INTO collections (id, project_id, workspace_id, name, is_private, sort_order)
      VALUES ('col-test-unarchive', 'proj-harness', 'ws-harness', 'Test Unarchive Space', 0, 100)
    `).run();

    // Insert parent page and two children
    const t0 = '2026-11-01T10:00:00.000Z';
    const tCascade = '2026-11-02T12:00:00.000Z';

    db.prepare(`
      INSERT INTO pages (id, project_id, workspace_id, collection_id, shelf, file_path, title, slug, content_markdown, depth, archived_at)
      VALUES ('page-parent-arch', 'proj-harness', 'ws-harness', 'col-test-unarchive', 'general', 'test/parent.md', 'Parent Page', 'parent-arch', '# Parent', 1, ?)
    `).run(tCascade);

    // Child 1: archived independently earlier at t0
    db.prepare(`
      INSERT INTO pages (id, project_id, workspace_id, collection_id, parent_id, shelf, file_path, title, slug, content_markdown, depth, archived_at)
      VALUES ('page-child-prior', 'proj-harness', 'ws-harness', 'col-test-unarchive', 'page-parent-arch', 'general', 'test/child-prior.md', 'Prior Archived Child', 'prior-child', '# Child 1', 2, ?)
    `).run(t0);

    // Child 2: archived together with parent at tCascade
    db.prepare(`
      INSERT INTO pages (id, project_id, workspace_id, collection_id, parent_id, shelf, file_path, title, slug, content_markdown, depth, archived_at)
      VALUES ('page-child-cascade', 'proj-harness', 'ws-harness', 'col-test-unarchive', 'page-parent-arch', 'general', 'test/child-cascade.md', 'Cascade Archived Child', 'cascade-child', '# Child 2', 2, ?)
    `).run(tCascade);

    // 1. Rejection: Actor is required (BR-PAGE-02 Violation)
    assert.throws(
      () => unarchivePageInSQLite(db, 'page-parent-arch', { actor: null }),
      /BR-PAGE-02 Violation: Actor required for operation/
    );

    // 2. Rejection: Unknown actor is rejected
    assert.throws(
      () => unarchivePageInSQLite(db, 'page-parent-arch', { actor: { id: 'unknown-intruder' } }),
      /BR-PAGE-02 Violation: Unknown actor 'unknown-intruder'/
    );

    // 3. Rejection: Cannot unarchive child if parent page is archived (BR-PAGE-09 Violation)
    assert.throws(
      () => unarchivePageInSQLite(db, 'page-child-cascade', { actor: { id: 'user-human-lead' } }),
      /BR-PAGE-09 Violation: Cannot unarchive page 'page-child-cascade' because parent page 'Parent Page' is archived/
    );

    // 4. Rejection: Cannot unarchive if parent collection is archived (BR-PAGE-07 Violation)
    db.prepare("UPDATE collections SET archived_at = '2026-11-02T15:00:00.000Z' WHERE id = 'col-test-unarchive'").run();
    assert.throws(
      () => unarchivePageInSQLite(db, 'page-parent-arch', { actor: { id: 'user-human-lead' } }),
      /BR-PAGE-07 Violation: Cannot unarchive page 'page-parent-arch' because parent collection 'Test Unarchive Space' is archived/
    );
    // Restore collection from archive for subsequent tests
    db.prepare("UPDATE collections SET archived_at = NULL WHERE id = 'col-test-unarchive'").run();

    // 5. Success: Unarchive parent with restoreSubtree: true
    // Agent actor: user-spec-author (is_bot: 1)
    const result = unarchivePageInSQLite(db, 'page-parent-arch', {
      restoreSubtree: true,
      actor: { id: 'user-spec-author' }
    });
    assert.strictEqual(result.archived_at, null, 'Parent must be unarchived');

    // Child 2 (archived at tCascade) must be unarchived
    const child2 = db.prepare("SELECT archived_at FROM pages WHERE id = 'page-child-cascade'").get();
    assert.strictEqual(child2.archived_at, null, 'Child archived at tCascade must be unarchived');

    // Child 1 (archived earlier at t0) must REMAIN archived
    const child1 = db.prepare("SELECT archived_at FROM pages WHERE id = 'page-child-prior'").get();
    assert.strictEqual(child1.archived_at, t0, 'Child archived independently earlier at t0 must NOT be restored');

    // 6. Verify dedicated page_audit table recorded the event with actor_type = agent
    const auditRow = db.prepare("SELECT * FROM page_audit WHERE page_id = 'page-parent-arch' ORDER BY created_at DESC").get();
    assert.ok(auditRow, 'page_audit entry must exist');
    assert.strictEqual(auditRow.action, 'unarchived');
    assert.strictEqual(auditRow.actor_id, 'user-spec-author');
    assert.strictEqual(auditRow.actor_role, 'spec-author');
    assert.strictEqual(auditRow.actor_type, 'agent', 'is_bot=1 must register as actor_type=agent');

    // 7. Verify human actor records actor_type = human
    lockPageInSQLite(db, 'page-parent-arch', { actor: { id: 'user-human-lead' }, reason: 'Audit test' });
    const lockAudit = db.prepare("SELECT * FROM page_audit WHERE page_id = 'page-parent-arch' AND action = 'locked'").get();
    assert.ok(lockAudit);
    assert.strictEqual(lockAudit.actor_id, 'user-human-lead');
    assert.strictEqual(lockAudit.actor_type, 'human', 'is_bot=0 must register as actor_type=human');

    // 8. Verify page_logs was NOT contaminated with audit entries
    const contaminatedLogs = db.prepare("SELECT * FROM page_logs WHERE page_id = 'page-parent-arch' AND action IN ('unarchived', 'locked')").all();
    assert.strictEqual(contaminatedLogs.length, 0, 'page_logs must contain 0 lifecycle audit entries');

    // Clean up temporary files on disk created by test rewrite
    const tempTestDir = path.resolve(__dirname, '../../test');
    if (fs.existsSync(tempTestDir)) {
      fs.rmSync(tempTestDir, { recursive: true, force: true });
    }
    const tempTestsDir = path.resolve(__dirname, '../../tests-temp');
    if (fs.existsSync(tempTestsDir)) {
      fs.rmSync(tempTestsDir, { recursive: true, force: true });
    }
  });

  test('Frontmatter Migration Idempotency: Re-running runMigration produces 0 byte-level changes', async () => {
    const { runMigration } = await import('../../scripts/migrate-frontmatter.cjs');
    runMigration({ dryRun: false });
    const result = runMigration({ dryRun: false });
    assert.strictEqual(result.modified, 0, 'Second run of migrate-frontmatter must modify exactly 0 files');
  });
});
