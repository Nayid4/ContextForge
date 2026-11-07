import test from 'node:test';
import assert from 'node:assert/strict';

import {
  pageService,
  PageService,
  pageStore,
  PageStore,
  PageShelfTree,
  PageReader,
  enrichMarkdownWithSmartChips,
  PageNavigationPane,
  renderFloatingOutlineBars,
  DualMarkdownEditor,
  PagesPage,
  renderPageHeaderActions,
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

test('Plane Pages Evolution Suite: PageNavigationPane (4 pestañas), Smart Entity Chips y PageHeaderActions', () => {
  const sampleHtml = '<p>Cumple con INT-016, regla BR-001, requisito RF-010, ADR-002 y CAP-001.</p><pre><code>INT-016 en codigo no se transforma</code></pre>';
  const enriched = enrichMarkdownWithSmartChips(sampleHtml, [
    { id: 'INT-016', name: 'Plane Data Model', status: 'completed', state_id: 'state-done' }
  ]);
  assert.ok(enriched.includes('data-action="view-detail" data-id="INT-016"'));
  assert.ok(enriched.includes('BR-001'));
  assert.ok(enriched.includes('RF-010'));
  assert.ok(enriched.includes('ADR-002'));
  assert.ok(enriched.includes('CAP-001'));
  assert.ok(enriched.includes('<pre><code>INT-016 en codigo no se transforma</code></pre>'));

  const samplePage = {
    id: 'page-kb-c4-model_md',
    title: 'Modelo C4',
    file_path: 'knowledge/c4-model.md',
    is_locked: 1,
    is_favorite: 1,
    word_count: 520,
    char_count: 3400,
    paragraph_count: 14,
    diagrams_count: 2,
    reading_time_min: 3,
    owned_by_id: 'user-spec-author',
    updated_by_id: 'user-reviewer',
    labels: [{ name: 'c4-model' }, { name: 'ieee-830' }],
    logs: [
      { entity_name: 'issue', entity_identifier: 'INT-016' },
      { entity_name: 'business_rule', entity_identifier: 'BR-001' }
    ],
    versions: [
      { id: 'pver-1', version_number: 1, author_role: 'spec-author', created_at: '2026-11-07T15:00:00Z' }
    ]
  };

  const navInfoHtml = PageNavigationPane({
    page: samplePage,
    content: '# C4\n```mermaid\nflowchart TD\nA-->B\n```',
    toc: [{ id: 'c4', text: 'C4', level: 1 }],
    activeTab: 'info',
    issues: [{ id: 'INT-016', title: 'Plane Model', state_id: 'state-done' }]
  });
  assert.ok(navInfoHtml.includes('Palabras'));
  assert.ok(navInfoHtml.includes('Caracteres'));
  assert.ok(navInfoHtml.includes('Párrafos'));
  assert.ok(navInfoHtml.includes('Lectura'));
  assert.ok(navInfoHtml.includes('INT-016'));
  assert.ok(navInfoHtml.includes('BR-001'));

  const navAssetsHtml = PageNavigationPane({
    page: samplePage,
    content: '# C4\n```mermaid\nflowchart TD\nA-->B\n```',
    activeTab: 'assets'
  });
  assert.ok(navAssetsHtml.includes('Diagramas Mermaid'));
  assert.ok(navAssetsHtml.includes('flowchart'));

  const navHistoryHtml = PageNavigationPane({
    page: samplePage,
    content: '# C4',
    activeTab: 'version_history'
  });
  assert.ok(navHistoryHtml.includes('Historial de Versiones'));
  assert.ok(navHistoryHtml.includes('Restaurar'));

  const headerActionsHtml = renderPageHeaderActions({
    activePage: samplePage,
    isFullWidth: true,
    showNavigationPane: true,
    showAiMenu: true
  });
  assert.ok(headerActionsHtml.includes('SQLite + .md Synced'));
  assert.ok(headerActionsHtml.includes('Ask Harness AI'));
  assert.ok(headerActionsHtml.includes('toggle-page-favorite'));
  assert.ok(headerActionsHtml.includes('toggle-page-lock'));

  const floatingHtml = renderFloatingOutlineBars([{ id: 'c4', text: 'C4', level: 1 }]);
  assert.ok(floatingHtml.includes('toggle-page-nav-pane'));
});
