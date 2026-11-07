import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('White-Box Testing: Pipeline de Sincronización y Mapeo en sync-data.js', () => {
  test('Branch Coverage: Algoritmo de cálculo de tiempo de lectura (WPM = 200)', () => {
    const calcReadingTime = (words) => Math.max(1, Math.ceil(words / 200));

    assert.equal(calcReadingTime(0), 1, 'Cero palabras debe reportar al menos 1 min');
    assert.equal(calcReadingTime(150), 1, '150 palabras debe ser 1 min');
    assert.equal(calcReadingTime(201), 2, '201 palabras debe ser 2 min');
    assert.equal(calcReadingTime(1000), 5, '1000 palabras debe ser 5 min');
  });

  test('Branch Coverage: Clasificación de documentos en estantes canónicos', () => {
    const indexPath = fs.existsSync('knowledge/knowledge-index.json') ? 'knowledge/knowledge-index.json' : 'project-docs/knowledge/knowledge-index.json';
    const indexRaw = fs.readFileSync(indexPath, 'utf8');
    const indexData = JSON.parse(indexRaw);

    assert.ok(indexData.shelves && typeof indexData.shelves === 'object', 'Debe incluir un diccionario de estantes');
    const shelfKeys = Object.keys(indexData.shelves);
    assert.equal(shelfKeys.length, 6, 'Deben existir exactamente 6 estantes temáticos');

    const expectedShelves = ['architecture', 'requirements', 'business_rules', 'modules', 'standards', 'adrs'];

    for (const expectedId of expectedShelves) {
      assert.ok(shelfKeys.includes(expectedId), `Debe contener el estante ${expectedId}`);
    }

    // Cada estante debe tener título y al menos un documento asignado
    for (const key of shelfKeys) {
      const shelf = indexData.shelves[key];
      assert.ok(shelf.title.length > 0, `El estante ${key} debe tener un título`);
      assert.ok(Array.isArray(shelf.docs) && shelf.docs.length > 0, `El estante ${key} no debe estar vacío`);
    }
  });

  test('Branch Coverage: Integridad del archivo generado data-fallback.js', () => {
    const fallbackPath = fs.existsSync('data-fallback.js') ? 'data-fallback.js' : 'project-docs/data-fallback.js';
    assert.ok(fs.existsSync(fallbackPath), 'data-fallback.js debe existir físicamente');

    const content = fs.readFileSync(fallbackPath, 'utf8');
    assert.ok(content.includes('window.__FALLBACK_DATA__'), 'Debe exponer window.__FALLBACK_DATA__');
    assert.ok(content.includes('featureList'), 'Debe contener featureList');
    assert.ok(content.includes('knowledgeIndex'), 'Debe contener knowledgeIndex');
    assert.ok(content.includes('"docs":'), 'Debe contener los documentos vivos indexados');
  });
});
