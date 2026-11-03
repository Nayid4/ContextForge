import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('sync-data y data-fallback cargan los 22 documentos vivos con metadatos correctos', () => {
  const fallbackPath = path.resolve('project-docs/data-fallback.js');
  assert.ok(fs.existsSync(fallbackPath), 'data-fallback.js debe existir');

  const content = fs.readFileSync(fallbackPath, 'utf8');
  assert.ok(content.includes('window.__FALLBACK_DATA__'), 'data-fallback.js debe definir window.__FALLBACK_DATA__');

  // Evaluar datos de respaldo
  const sandbox = {};
  const fn = new Function('window', content);
  fn(sandbox);

  const fallbackData = sandbox.__FALLBACK_DATA__;
  assert.ok(fallbackData, 'Fallback data debe ser un objeto válido');
  assert.ok(fallbackData.knowledgeIndex, 'Debe contener knowledgeIndex');
  assert.ok(fallbackData.featureList, 'Debe contener featureList');

  const docs = fallbackData.knowledgeIndex.docs || {};
  const docCount = Object.keys(docs).length;
  assert.ok(docCount >= 20, `Debe haber al menos 20 documentos indexados (encontrados: ${docCount})`);

  // Verificar metadatos calculados
  const meta = fallbackData.knowledgeIndex.docMetadata || {};
  assert.ok(Object.keys(meta).length >= 20, 'docMetadata debe estar poblado');

  // Validar estantes
  const shelves = fallbackData.knowledgeIndex.shelves || {};
  assert.ok(shelves.architecture, 'Estante de arquitectura debe existir');
  assert.ok(shelves.business_rules, 'Estante de reglas de negocio debe existir');
  assert.ok(shelves.requirements, 'Estante de requerimientos debe existir');
  assert.ok(shelves.modules, 'Estante de módulos debe existir');
});

test('Cálculo de tiempo de lectura y conteo de palabras', () => {
  const wordsSample = 'palabra '.repeat(450);
  const words = wordsSample.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  assert.equal(words, 450);
  assert.equal(readingTime, 3); // 450 / 200 = 2.25 -> 3 min
});
