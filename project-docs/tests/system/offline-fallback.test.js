import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

describe('System Testing: Interoperabilidad Offline y Protocolo file:///', () => {
  test('Offline Compatibility: data-fallback.js es autocontenido y parseable en sandbox sin red', () => {
    const fallbackPath = fs.existsSync('data-fallback.js') ? 'data-fallback.js' : 'project-docs/data-fallback.js';
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

  test('Offline Compatibility: knowledgeIndex contiene diagramas C4, UML y ERD con sintaxis Mermaid válida', () => {
    const fallbackPath = fs.existsSync('data-fallback.js') ? 'data-fallback.js' : 'project-docs/data-fallback.js';
    const code = fs.readFileSync(fallbackPath, 'utf8');

    const sandbox = { window: {}, console };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);

    const fallbackData = sandbox.window.__FALLBACK_DATA__;
    assert.ok(fallbackData.knowledgeIndex.diagrams, 'Debe incluir diagrams en knowledgeIndex');
    const diagrams = fallbackData.knowledgeIndex.diagrams;
    assert.ok(diagrams.length >= 8, 'Deben existir al menos 8 diagramas estructurados');

    const expectedIds = ['c1', 'c2', 'c3', 'class', 'seq-sdd', 'seq-editor', 'use-cases', 'erd'];
    for (const id of expectedIds) {
      const diag = diagrams.find(d => d.id === id);
      assert.ok(diag, `El diagrama ${id} debe estar presente`);
      assert.ok(diag.title, `El diagrama ${id} debe tener título`);
      assert.ok(diag.mermaid, `El diagrama ${id} debe tener código Mermaid`);
      assert.ok(diag.mermaid.length > 20, `El código Mermaid de ${id} debe ser sustancial`);
      assert.ok(!diag.mermaid.includes('undefined'), `El código Mermaid de ${id} no debe contener undefined`);
    }
  });

  test('Offline Compatibility: fetchProjectData() en file: retorna fallback directamente sin invocar fetch ni lanzar CORS', async () => {
    const { fetchProjectData, startAutoSync } = await import('../../src/core/api.js');

    // Simular navegador en file:/// sin conectividad HTTP
    globalThis.window = {
      location: { protocol: 'file:' },
      __FALLBACK_DATA__: {
        featureList: { project: 'Offline Test Project', features: [{ id: 1, name: 'Offline Feature' }] },
        currentSpec: { id: 1, name: 'Offline Feature' },
        historyData: { records: [] },
        projectSpec: { project: { name: 'Test' } },
        knowledgeIndex: { diagrams: [{ id: 'c1', mermaid: 'flowchart TD\n  A --> B' }] }
      }
    };

    try {
      const data = await fetchProjectData();
      assert.equal(data.project, 'Offline Test Project');
      assert.equal(data.protocol, 'file:');
      assert.equal(data.features.length, 1);
      assert.equal(data.knowledgeIndex.diagrams.length, 1);

      // AutoSync debe retornar un controlador inofensivo y no lanzar intervalos en file://
      const controller = startAutoSync();
      assert.ok(typeof controller.stop === 'function');
      controller.stop();
    } finally {
      delete globalThis.window;
    }
  });
});
