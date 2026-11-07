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

test('Screaming Architecture: Validación de Dominios de Negocio Puros', (t) => {
  const expectedDomains = [
    'analytics',
    'architecture',
    'constellation',
    'cycles',
    'graph',
    'issues',
    'layout',
    'modules',
    'pages'
  ];

  const actualDirs = fs.readdirSync(FEATURES_DIR).filter(item => {
    return fs.statSync(path.join(FEATURES_DIR, item)).isDirectory();
  }).sort();

  assert.deepEqual(actualDirs, expectedDomains, 'La carpeta features/ debe contener exactamente los 9 dominios Screaming');

  // Cada dominio debe exportar un index.js
  for (const domain of expectedDomains) {
    const indexPath = path.join(FEATURES_DIR, domain, 'index.js');
    assert.ok(fs.existsSync(indexPath), `El dominio ${domain} debe tener un archivo index.js de entrada`);
  }

  // Ninguna carpeta legacy debe existir
  const prohibitedLegacy = [
    'architecture-docs',
    'current-spec',
    'dependency-graph',
    'dependency-tree',
    'feature-list',
    'history-timeline',
    'knowledge-base',
    'plane-analytics',
    'plane-cycles',
    'plane-issues',
    'plane-layout',
    'plane-modules',
    'plane-pages',
    'space-view-3d',
    'stats'
  ];

  for (const leg of prohibitedLegacy) {
    assert.ok(!fs.existsSync(path.join(FEATURES_DIR, leg)), `La carpeta legacy '${leg}' no debe existir en features/`);
  }
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
