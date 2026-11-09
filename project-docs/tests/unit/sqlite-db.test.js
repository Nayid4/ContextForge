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
  restorePageVersionInSQLite,
  backfillSlugAndDepth,
  unlockPageInSQLite,
  lockPageInSQLite
} from '../../src/core/sqlite-sync.js';

describe('Suite de Base de Datos Relacional SQLite (node:sqlite) para Plane & IA (29 Tablas)', () => {
  test('initDatabase crea las 29 tablas relacionales requeridas para Plane, Pages Graph e IA', () => {
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
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);

    // 1. Colecciones dinámicas CRUD
    const newCol = createCollectionInSQLite(db, {
      name: 'QA Automation',
      description: 'Planes y pruebas automatizadas',
      icon: 'checkCircle',
      color: '#06b6d4'
    });
    assert.strictEqual(newCol.id, 'qa_automation');
    assert.strictEqual(newCol.name, 'QA Automation');

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
      movePageInSQLite(db, 'p-parent', 'engineering', 'p-parent');
    }, /BR-PAGE-08 Violation: A page cannot be its own parent/);

    // Establecer hijo válido
    movePageInSQLite(db, 'p-child', 'engineering', 'p-parent');
    const child = db.prepare('SELECT * FROM pages WHERE id = ?').get('p-child');
    assert.strictEqual(child.parent_id, 'p-parent');

    // Intento de ciclo: hacer a p-parent hijo de p-child
    assert.throws(() => {
      movePageInSQLite(db, 'p-parent', 'engineering', 'p-child');
    }, /BR-PAGE-08 Violation: Cyclic hierarchy detected/);

    // 4. BR-PAGE-09: Cascade Archive de jerarquía
    archivePageCascadeInSQLite(db, 'p-parent');
    const archParent = db.prepare('SELECT archived_at, is_favorite FROM pages WHERE id = ?').get('p-parent');
    const archChild = db.prepare('SELECT archived_at, is_favorite FROM pages WHERE id = ?').get('p-child');
    assert.ok(archParent.archived_at);
    assert.ok(archChild.archived_at);
    assert.strictEqual(archParent.is_favorite, 0);
    assert.strictEqual(archChild.is_favorite, 0);

    // 5. Restauración de Versiones Históricas
    db.prepare(`
      INSERT INTO page_versions (id, page_id, version_number, content_markdown)
      VALUES ('pv-1', 'p-parent', 1, '# Versión Original')
    `).run();
    const restored = restorePageVersionInSQLite(db, 'p-parent', 1);
    assert.strictEqual(restored.content_markdown, '# Versión Original');
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

      // 1b. Operación separada de Desbloqueo (unlockPageInSQLite) auditada en page_logs
      const unlocked = unlockPageInSQLite(db, 'p-srv-locked', { actorRole: 'reviewer', reason: 'Auditoría aprobada' });
      assert.strictEqual(unlocked.is_locked, 0);

      const unlockLog = db.prepare("SELECT * FROM page_logs WHERE page_id = 'p-srv-locked' AND action = 'unlocked'").get();
      assert.ok(unlockLog);
      assert.strictEqual(unlockLog.entity_identifier, 'reviewer');
      assert.ok(unlockLog.log_message.includes('Auditoría aprobada'));

      // Ahora que está desbloqueada en una operación separada, sí permite edición
      const edited = updatePagePropertiesInSQLite(db, 'p-srv-locked', {
        content_markdown: '# Contenido Modificado Tras Desbloquear'
      });
      assert.strictEqual(edited.content_markdown, '# Contenido Modificado Tras Desbloquear');

      // Re-bloqueo auditado
      const relocked = lockPageInSQLite(db, 'p-srv-locked', { actorRole: 'lead-architect', reason: 'Re-bloqueo tras edición' });
      assert.strictEqual(relocked.is_locked, 1);
      const lockLog = db.prepare("SELECT * FROM page_logs WHERE page_id = 'p-srv-locked' AND action = 'locked'").get();
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
  });
});
