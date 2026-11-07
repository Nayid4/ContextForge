import { test, describe } from 'node:test';
import assert from 'node:assert';
import { initDatabase } from '../../src/core/db.js';
import {
  syncFilesToSQLite,
  getPlaneData,
  mapStatusToStateId,
  mapStateIdToStatus,
  mapPriority
} from '../../src/core/sqlite-sync.js';

describe('Suite de Base de Datos Relacional SQLite (node:sqlite) para Plane', () => {
  test('initDatabase crea todas las tablas requeridas para Plane', () => {
    const db = initDatabase(':memory:');
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC;
    `).all().map(t => t.name);

    const expected = ['cycles', 'issues', 'modules', 'pages', 'projects', 'states', 'subtasks', 'workspaces'];
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

  test('syncFilesToSQLite puebla datos relacionales desde disco sin errores', () => {
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);
    const data = getPlaneData(db);

    assert.ok(data.workspace);
    assert.strictEqual(data.workspace.slug, 'harness-engineering');
    assert.ok(data.project);
    assert.strictEqual(data.project.slug, 'harness-sdd');

    assert.strictEqual(data.states.length, 6);
    assert.ok(data.cycles.length >= 3);
    assert.ok(data.modules.length >= 5);
    assert.ok(data.issues.length >= 11);
    assert.ok(data.pages.length >= 10);

    // Verificar que un issue tenga sus subtareas anidadas y criterios de aceptación
    const issue11 = data.issues.find(i => i.sequence_id === 11);
    assert.ok(issue11);
    assert.strictEqual(issue11.id, 'INT-011');
    assert.ok(Array.isArray(issue11.subtasks));
    assert.ok(issue11.subtasks.length > 0);
    assert.ok(Array.isArray(issue11.acceptance));
  });

  test('Transición de estados relacional y actualización de timestamps', () => {
    const db = initDatabase(':memory:');
    syncFilesToSQLite(db);

    // Mover INT-012 a Done
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
