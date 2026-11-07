import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DOCS_DIR = path.resolve(__dirname, '../..');
const CLI_PATH = path.join(PROJECT_DOCS_DIR, 'cli.js');

test('CLI Suite: Comando status retorna estado del proyecto, agentes bot y ejecuciones IA', () => {
  const output = execFileSync(process.execPath, [CLI_PATH, 'status'], {
    encoding: 'utf8',
    cwd: PROJECT_DOCS_DIR
  });

  assert.ok(output.includes('ESTADO DEL PROYECTO'), 'Debe incluir encabezado de estado');
  assert.ok(output.includes('Ciclo Activo'), 'Debe reportar ciclo activo');
  assert.ok(output.includes('Total Tareas'), 'Debe reportar conteo de tareas');
  assert.ok(output.includes('Agentes IA Bot'), 'Debe reportar agentes bot IA');
  assert.ok(output.includes('SQLite'), 'Debe indicar persistencia SQLite');
});

test('CLI Suite: Comando issue list --json retorna array estructurado con relaciones Plane', () => {
  const output = execFileSync(process.execPath, [CLI_PATH, 'issue', 'list', '--json'], {
    encoding: 'utf8',
    cwd: PROJECT_DOCS_DIR
  });

  const issues = JSON.parse(output);
  assert.ok(Array.isArray(issues), 'Debe retornar un array JSON');
  assert.ok(issues.length > 0, 'Debe haber tareas registradas');
  assert.ok(issues[0].id, 'Cada tarea debe tener ID');
  assert.ok(issues[0].title, 'Cada tarea debe tener título');
  assert.ok(Array.isArray(issues[0].labels), 'Cada tarea debe incluir sus etiquetas Plane');
  assert.ok(Array.isArray(issues[0].evidences), 'Cada tarea debe incluir sus evidencias');
});

test('CLI Suite: Comando cycle list retorna ciclos de sprint', () => {
  const output = execFileSync(process.execPath, [CLI_PATH, 'cycle', 'list'], {
    encoding: 'utf8',
    cwd: PROJECT_DOCS_DIR
  });

  assert.ok(output.includes('Ciclos de Desarrollo'), 'Debe incluir encabezado de ciclos');
  assert.ok(output.includes('ACTIVE') || output.includes('COMPLETED') || output.includes('ACTIVO'), 'Debe incluir estado del ciclo');
});

test('CLI Suite: Comando page list --json retorna páginas de conocimiento', () => {
  const output = execFileSync(process.execPath, [CLI_PATH, 'page', 'list', '--json'], {
    encoding: 'utf8',
    cwd: PROJECT_DOCS_DIR
  });

  const pages = JSON.parse(output);
  assert.ok(Array.isArray(pages), 'Debe retornar un array de páginas');
  assert.ok(pages.length > 0, 'Debe haber páginas indexadas');
  assert.ok(pages.some(p => p.id.includes('c4-model') || p.file_path.includes('c4-model')), 'Debe incluir el modelo C4');
});

test('CLI Suite: Comando ai list --json y user list --json retornan trazabilidad IA de Plane', () => {
  const aiOut = execFileSync(process.execPath, [CLI_PATH, 'ai', 'list', '--json'], {
    encoding: 'utf8',
    cwd: PROJECT_DOCS_DIR
  });
  const runs = JSON.parse(aiOut);
  assert.ok(Array.isArray(runs), 'ai list debe retornar un array');
  assert.ok(runs.length > 0, 'Debe haber ejecuciones IA registradas');

  const userOut = execFileSync(process.execPath, [CLI_PATH, 'user', 'list', '--json'], {
    encoding: 'utf8',
    cwd: PROJECT_DOCS_DIR
  });
  const users = JSON.parse(userOut);
  assert.ok(Array.isArray(users), 'user list debe retornar un array');
  assert.ok(users.some(u => u.is_bot === 1 && u.role === 'leader'), 'Debe incluir el agente bot leader');
});
