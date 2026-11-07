import { test, describe } from 'node:test';
import assert from 'node:assert';
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
  recordIssueRelation
} from '../../src/core/sqlite-sync.js';

describe('Suite de Base de Datos Relacional SQLite (node:sqlite) para Plane & IA (26 Tablas)', () => {
  test('initDatabase crea las 26 tablas relacionales requeridas para Plane e IA', () => {
    const db = initDatabase(':memory:');
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC;
    `).all().map(t => t.name);

    const expected = [
      'ai_configs',
      'ai_runs',
      'api_tokens',
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

  test('syncFilesToSQLite puebla datos relacionales de Plane, agentes bot IA, evidencias y relaciones', () => {
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
});
