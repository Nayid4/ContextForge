import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderList } from '../../src/shared/utils/renderList.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../../src');
const FEATURES_DIR = path.join(SRC_DIR, 'features');
const MODULES_DIR = path.join(SRC_DIR, 'modules');

test('Screaming Architecture: Eliminación Completa de Carpeta Legacy features/', () => {
  // Invariante de pureza: features/ debe haber sido eliminada por completo
  assert.ok(!fs.existsSync(FEATURES_DIR), 'La carpeta legacy src/features/ no debe existir en el proyecto');
});

test('Functional Component Helper: renderList bucles declarativos', () => {
  // Caso 1: Colección no vacía
  const items = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' }
  ];
  const rendered = renderList(items, (item, idx) => `<span id="${item.id}">${idx}:${item.name}</span>`);
  assert.equal(rendered, '<span id="1">0:Alpha</span><span id="2">1:Beta</span>');

  // Caso 2: Array vacío con mensaje por defecto
  const emptyRender = renderList([], () => '', 'Sin elementos disponibles');
  assert.ok(emptyRender.includes('Sin elementos disponibles'));

  // Caso 3: Array vacío con función personalizada
  const customEmpty = renderList([], () => '', () => '<p class="empty">Vacio</p>');
  assert.equal(customEmpty, '<p class="empty">Vacio</p>');

  // Caso 4: Null o no array
  const nullRender = renderList(null, () => '');
  assert.equal(nullRender, '');
});

test('Screaming Architecture: Validación de los 10 Módulos de Dominio (src/modules/)', () => {
  assert.ok(fs.existsSync(MODULES_DIR), 'La carpeta src/modules/ debe existir');

  const expectedModules = [
    'Analytics',
    'Architecture',
    'Constellation',
    'Cycles',
    'Graph',
    'Harness',
    'Issues',
    'Modules',
    'Pages',
    'Projects'
  ].sort();

  const actualDirs = fs.readdirSync(MODULES_DIR).filter(item => {
    return fs.statSync(path.join(MODULES_DIR, item)).isDirectory();
  }).sort();

  assert.deepEqual(actualDirs, expectedModules, 'src/modules/ debe contener exactamente los 10 dominios de negocio Screaming');

  for (const mod of expectedModules) {
    const modPath = path.join(MODULES_DIR, mod);
    assert.ok(fs.existsSync(path.join(modPath, 'index.js')), `${mod} debe tener index.js`);
    assert.ok(fs.existsSync(path.join(modPath, 'components')), `${mod} debe tener components/`);
    assert.ok(fs.existsSync(path.join(modPath, 'pages')), `${mod} debe tener pages/`);
    assert.ok(fs.existsSync(path.join(modPath, 'services')), `${mod} debe tener services/`);
    assert.ok(fs.existsSync(path.join(modPath, 'store')), `${mod} debe tener store/`);
  }

  assert.ok(fs.existsSync(path.join(MODULES_DIR, 'index.js')), 'src/modules/ debe tener un index.js central');
});
