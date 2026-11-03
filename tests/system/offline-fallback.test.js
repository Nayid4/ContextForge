import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

describe('System Testing: Interoperabilidad Offline y Protocolo file:///', () => {
  test('Offline Compatibility: data-fallback.js es autocontenido y parseable en sandbox sin red', () => {
    const fallbackPath = 'project-docs/data-fallback.js';
    assert.ok(fs.existsSync(fallbackPath));

    const code = fs.readFileSync(fallbackPath, 'utf8');

    // Contexto sintético que simula un navegador en modo offline
    const sandbox = {
      window: {},
      console
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);

    const fallbackData = sandbox.window.__FALLBACK_DATA__;
    assert.ok(fallbackData, 'Debe registrar window.__FALLBACK_DATA__');

    // Validación de integridad de los 5 componentes nucleares
    assert.ok(fallbackData.featureList, 'Debe incluir featureList');
    assert.ok(Array.isArray(fallbackData.featureList.features), 'featureList debe contener array de features');
    assert.ok(fallbackData.featureList.features.length >= 8, 'Debe incluir al menos 8 features del arnés');

    assert.ok(fallbackData.knowledgeIndex, 'Debe incluir knowledgeIndex');
    assert.ok(fallbackData.knowledgeIndex.docs, 'Debe incluir docs en knowledgeIndex');
    
    // Todos los documentos deben contener contenido Markdown legible
    const docKeys = Object.keys(fallbackData.knowledgeIndex.docs);
    assert.ok(docKeys.length >= 22, 'Deben existir al menos 22 documentos vivos para consulta offline');

    for (const key of docKeys) {
      const docContent = fallbackData.knowledgeIndex.docs[key];
      assert.ok(typeof docContent === 'string' && docContent.length > 50, `El documento ${key} debe contener texto markdown`);
    }
  });
});
