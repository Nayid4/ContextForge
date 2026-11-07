import test from 'node:test';
import assert from 'node:assert/strict';

// Core imports
import { Store } from '../../src/core/store.js';
import { Router } from '../../src/core/router.js';
import { EventBus } from '../../src/core/event-bus.js';
import { ApiClient } from '../../src/core/api-client.js';

// Shared utilities imports
import { renderList } from '../../src/shared/utils/renderList.js';
import { escapeHtml, html } from '../../src/shared/utils/dom.js';
import { formatDate, formatTimeAgo, calculateReadingTime } from '../../src/shared/utils/dates.js';
import { slugify, extractTableOfContents, renderMarkdown } from '../../src/shared/utils/markdown.js';

// Shared UI imports
import { Icons, createIcon } from '../../src/shared/ui/Icons.js';
import { Badge, renderBadge } from '../../src/shared/ui/Badge.js';
import { renderBaseModal } from '../../src/shared/ui/BaseModal.js';
import { renderMasterLayout } from '../../src/shared/ui/MasterLayout.js';
import { renderPlaneSidebar } from '../../src/shared/ui/PlaneSidebar.js';
import { renderPlaneTopBar } from '../../src/shared/ui/PlaneTopBar.js';
import { renderOmniboxModal } from '../../src/shared/ui/OmniboxModal.js';

test('Core Store Suite: Observer / Pub-Sub pattern y suscripción por clave', () => {
  const store = new Store({ count: 0, user: 'agent' });
  let globalCallCount = 0;
  let keyCallCount = 0;
  let receivedNewVal = null;

  // Suscripción global
  const unsubGlobal = store.subscribe((state) => {
    globalCallCount++;
  });

  // Suscripción por clave específica
  const unsubKey = store.subscribeKey('count', (newVal, oldVal) => {
    keyCallCount++;
    receivedNewVal = newVal;
  });

  // Mutación
  store.setState({ count: 1 });
  assert.equal(store.getState().count, 1);
  assert.equal(globalCallCount, 1);
  assert.equal(keyCallCount, 1);
  assert.equal(receivedNewVal, 1);

  // Mutación en otra clave: no debe disparar listener de 'count'
  store.setState({ user: 'reviewer' });
  assert.equal(globalCallCount, 2);
  assert.equal(keyCallCount, 1);

  // Desuscripción
  unsubKey();
  store.setState({ count: 2 });
  assert.equal(keyCallCount, 1, 'No debe llamarse tras desuscribir');
  unsubGlobal();
});

test('Core Store Suite: resetState restaura valores iniciales', () => {
  const store = new Store({ count: 5, flag: true });
  store.setState({ count: 99, flag: false });
  assert.equal(store.getState().count, 99);
  
  store.resetState();
  assert.equal(store.getState().count, 5);
  assert.equal(store.getState().flag, true);
});

test('Core Router Suite: Hash parsing con soporte de query parameters', () => {
  const router = new Router();

  // Caso 1: Ruta simple sin parámetros
  const res1 = router.parseHash('#issues');
  assert.equal(res1.route, 'issues');
  assert.deepEqual(res1.params, {});

  // Caso 2: Ruta con query parameters
  const res2 = router.parseHash('#issues?view=board&id=INT-001&assignee=implementer');
  assert.equal(res2.route, 'issues');
  assert.equal(res2.params.view, 'board');
  assert.equal(res2.params.id, 'INT-001');
  assert.equal(res2.params.assignee, 'implementer');

  // Caso 3: Alias legacy normalizados
  assert.equal(router.parseHash('#features').route, 'issues');
  assert.equal(router.parseHash('#c4').route, 'architecture');
  assert.equal(router.parseHash('#three').route, 'constellation');
  assert.equal(router.parseHash('#agents').route, 'harness');
  assert.equal(router.parseHash('#knowledge?doc=c4-model').route, 'pages');
  assert.equal(router.parseHash('#knowledge?doc=c4-model').params.doc, 'c4-model');
});

test('Core Router Suite: Route handlers específicos con router.on()', () => {
  const router = new Router();
  let receivedParams = null;

  const unsub = router.on('issues', (params) => {
    receivedParams = params;
  });

  router.navigate('issues', { mode: 'spreadsheet', page: 2 });
  assert.equal(router.getRoute(), 'issues');
  assert.equal(receivedParams?.mode, 'spreadsheet');
  assert.equal(receivedParams?.page, '2');

  unsub();
});

test('Core EventBus Suite: Pub-Sub, emit, on, off y once', () => {
  const bus = new EventBus();
  const logs = [];

  const unsub = bus.on('task:created', (data) => {
    logs.push(`created:${data.id}`);
  });

  bus.emit('task:created', { id: 'INT-010' });
  assert.equal(logs.length, 1);
  assert.equal(logs[0], 'created:INT-010');

  // Once
  let onceRan = 0;
  bus.once('agent:boot', () => {
    onceRan++;
  });
  bus.emit('agent:boot');
  bus.emit('agent:boot');
  assert.equal(onceRan, 1, 'once debe ejecutarse solo 1 vez');

  // Unsub
  unsub();
  bus.emit('task:created', { id: 'INT-011' });
  assert.equal(logs.length, 1, 'No debe recibir eventos tras desuscribir');
});

test('Core ApiClient Suite: Offline detection y fallback resolution', () => {
  const client = new ApiClient();
  const fallback = client.resolveOfflineFallback('/api/features');
  assert.ok(fallback !== null);
  assert.ok(Array.isArray(fallback.features) || fallback.project);

  const planeFallback = client.resolveOfflineFallback('/api/plane');
  assert.ok(planeFallback !== null);
  assert.ok(planeFallback.workspace);
});

test('Shared Utils Suite: DOM escapeHtml y template tag html', () => {
  const dangerous = '<script>alert("xss")</script>&"\'';
  const escaped = escapeHtml(dangerous);
  assert.ok(!escaped.includes('<script>'));
  assert.ok(escaped.includes('&lt;script&gt;'));
  assert.ok(escaped.includes('&quot;'));

  const clean = html`<div class="card">${'Seguro'}</div>`;
  assert.equal(clean, '<div class="card">Seguro</div>');
});

test('Shared Utils Suite: Dates formatting y calculateReadingTime', () => {
  const res = calculateReadingTime('Palabra '.repeat(400), 200);
  assert.equal(res.words, 400);
  assert.equal(res.minutes, 2);
  assert.equal(res.label, '2 min de lectura');

  const nowFormatted = formatDate(new Date(2026, 10, 7));
  assert.ok(nowFormatted.includes('2026'));

  const timeAgo = formatTimeAgo(Date.now() - 60000);
  assert.ok(timeAgo.includes('min'));
});

test('Shared Utils Suite: Markdown rendering, slugify y TOC extraction', () => {
  const md = '# Titulo Principal\n## Seccion 1\nTexto descriptivo con `codigo` y **negrita**.\n> [!NOTE]\n> Esta es una nota informativa.';
  const toc = extractTableOfContents(md);
  assert.equal(toc.length, 2);
  assert.equal(toc[0].text, 'Titulo Principal');
  assert.equal(toc[1].text, 'Seccion 1');

  const htmlOutput = renderMarkdown(md);
  assert.ok(htmlOutput.includes('<h1 id="titulo-principal"'));
  assert.ok(htmlOutput.includes('Esta es una nota informativa.'));
});

test('Shared UI Suite: Badge component para status, priority y agent', () => {
  const statusBadge = Badge.status('done');
  assert.ok(statusBadge.includes('Completado'));
  assert.ok(statusBadge.includes('emerald'));

  const p0Badge = Badge.priority('p0');
  assert.ok(p0Badge.includes('Urgente P0'));

  const qaBadge = Badge.agent('reviewer');
  assert.ok(qaBadge.includes('reviewer'));
  assert.ok(qaBadge.includes('purple'));

  const legacyCall = renderBadge('priority', 'alta');
  assert.ok(legacyCall.includes('Alta'));
});

test('Shared UI Suite: BaseModal accesible WAI-ARIA', () => {
  const modalHtml = renderBaseModal({
    id: 'test-modal',
    title: 'Titulo del Dialogo',
    contentHtml: '<p>Cuerpo del modal</p>',
    isOpen: true
  });

  assert.ok(modalHtml.includes('role="dialog"'));
  assert.ok(modalHtml.includes('aria-modal="true"'));
  assert.ok(modalHtml.includes('Titulo del Dialogo'));
  assert.ok(modalHtml.includes('Cuerpo del modal'));

  const closedHtml = renderBaseModal({ isOpen: false });
  assert.ok(!closedHtml.includes('role="dialog"'));
});

test('Shared UI Suite: MasterLayout, PlaneSidebar, PlaneTopBar y OmniboxModal', () => {
  const sidebar = renderPlaneSidebar({
    currentView: 'issues',
    activeWorkspace: 'Workspace Test',
    issueCount: 12
  });
  assert.ok(sidebar.includes('Workspace Test'));
  assert.ok(sidebar.includes('Tareas (Issues)'));
  assert.ok(sidebar.includes('12'));

  const topbar = renderPlaneTopBar({
    viewTitle: 'Vista Kanban',
    activeProject: 'Proyecto Test'
  });
  assert.ok(topbar.includes('Vista Kanban'));
  assert.ok(topbar.includes('Proyecto Test'));
  assert.ok(topbar.includes('plane-omnibox-trigger'));

  const omnibox = renderOmniboxModal({
    isOpen: true,
    query: 'test',
    issues: [{ id: 'INT-001', title: 'Test Issue', state_name: 'Done' }]
  });
  assert.ok(omnibox.includes('omnibox-modal'));
  assert.ok(omnibox.includes('INT-001'));
  assert.ok(omnibox.includes('Test Issue'));

  const master = renderMasterLayout({
    sidebarProps: { activeWorkspace: 'Test' },
    topBarProps: { viewTitle: 'Test Title' },
    mainContentHtml: '<section id="main-view">Contenido</section>'
  });
  assert.ok(master.includes('id="plane-app-root"'));
  assert.ok(master.includes('id="plane-sidebar"'));
  assert.ok(master.includes('id="tab-content"'));
  assert.ok(master.includes('id="main-view"'));
});
