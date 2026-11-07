import test from 'node:test';
import assert from 'node:assert/strict';

import {
  pageService,
  PageService,
  pageStore,
  PageStore,
  PageShelfTree,
  PageReader,
  DualMarkdownEditor,
  PagesPage,
  renderPlanePagesView
} from '../../src/modules/Pages/index.js';

test('PageService Suite: getPages y resolveShelf clasifican estantes correctamente', async () => {
  const service = new PageService({
    fetchPlaneData: async () => ({
      pages: [
        { id: 'p-1', title: 'C4 Model', file_path: 'knowledge/c4-model.md', shelf: 'architecture' },
        { id: 'p-2', title: 'Reglas', file_path: 'knowledge/business-rules.md', shelf: 'business_rules' }
      ]
    })
  });

  const pages = await service.getPages();
  assert.equal(pages.length, 2);

  assert.equal(service.resolveShelf('knowledge/c4-model.md'), 'architecture');
  assert.equal(service.resolveShelf('knowledge/business-rules.md'), 'business_rules');
  assert.equal(service.resolveShelf('specs/001_auth.md'), 'specs');
});

test('PageService Suite: calculateReadingMetrics computa palabras y minutos', () => {
  const text = 'Palabra '.repeat(450);
  const metrics = pageService.calculateReadingMetrics(text);
  assert.equal(metrics.words, 450);
  assert.equal(metrics.readingTimeMin, 3);
});

test('PageStore Suite: Observer reactivo, selección y modo de editor', () => {
  const store = new PageStore();
  let count = 0;
  store.subscribe(() => count++);

  store.setPages([
    { id: 'p-1', title: 'Guía', shelf: 'standards' },
    { id: 'p-2', title: 'ADR 01', shelf: 'adrs' }
  ]);
  assert.equal(store.getState().pages.length, 2);

  store.selectPage('p-2', '# ADR 01');
  assert.equal(store.getState().activePageId, 'p-2');
  assert.equal(store.getState().activePageContent, '# ADR 01');

  store.setEditorMode('editor');
  assert.equal(store.getState().editorMode, 'editor');

  assert.ok(count >= 3);
});

test('Pages UI Suite: PageShelfTree, PageReader, DualMarkdownEditor y PagesPage', () => {
  const treeHtml = PageShelfTree({
    shelves: {
      architecture: { name: 'Arquitectura', pages: [{ id: 'p-1', title: 'C4 Model' }] }
    },
    activePageId: 'p-1'
  });
  assert.ok(treeHtml.includes('Arquitectura'));
  assert.ok(treeHtml.includes('C4 Model'));

  const readerHtml = PageReader({
    page: { title: 'Doc', file_path: 'doc.md', word_count: 100, reading_time_min: 1 },
    content: '# Hola Mundo\nContenido de prueba',
    toc: [{ id: 'hola-mundo', text: 'Hola Mundo', level: 1 }]
  });
  assert.ok(readerHtml.includes('Hola Mundo'));
  assert.ok(readerHtml.includes('100 palabras'));
  assert.ok(readerHtml.includes('En esta página'));

  const editorHtml = DualMarkdownEditor({
    pageId: 'p-1',
    content: '# Editor'
  });
  assert.ok(editorHtml.includes('plane-page-editor-input'));
  assert.ok(editorHtml.includes('Previsualización en Vivo'));

  const pageHtml = PagesPage({
    pages: [{ id: 'p-1', title: 'Doc', shelf: 'standards', content_markdown: '# Doc' }],
    activePageId: 'p-1',
    editorMode: 'reader'
  });
  assert.ok(pageHtml.includes('Lector Editorial'));
  assert.ok(pageHtml.includes('Editor Dual'));

  const legacyHtml = renderPlanePagesView({
    pages: [{ id: 'p-1', title: 'Doc', shelf: 'standards', content_markdown: '# Doc' }]
  });
  assert.ok(legacyHtml.includes('Lector Editorial'));
});
