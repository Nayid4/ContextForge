import test from 'node:test';
import assert from 'node:assert/strict';

import {
  issueService,
  IssueService,
  CANONICAL_STATES,
  issueStore,
  IssueStore,
  IssueCard,
  IssueRow,
  IssueBoard,
  IssueList,
  IssueDetailModal,
  IssueControlsBar,
  IssueFilters,
  IssuesPage
} from '../../src/modules/Issues/index.js';

test('IssueService Suite: Estados canónicos y transformación de entidades', () => {
  const service = new IssueService();
  const states = service.getStates();
  assert.equal(states.length, 6, 'Debe haber 6 estados canónicos en Plane');
  assert.equal(states[0].id, 'state-backlog');
  assert.equal(states[4].id, 'state-done');

  // Transformación de features a IssueDTO
  const rawFeatures = [
    {
      id: 1,
      name: 'auth_module',
      title: 'Módulo de Autenticación',
      description: 'Login y JWT',
      status: 'done',
      priority: 'P0',
      module: 'security',
      subtasks: [
        { id: 'INT-001-DEV', type: 'development', title: 'Implementar JWT', status: 'done' },
        { id: 'INT-001-QA', type: 'qa', title: 'Validar expiración', status: 'passed' }
      ],
      user_story: {
        as_a: 'Usuario',
        i_want: 'iniciar sesión',
        so_that: 'acceder a mis datos'
      }
    },
    {
      id: 2,
      name: 'cart_module',
      title: 'Carrito de Compras',
      status: 'in_progress',
      priority: 'P1',
      subtasks: []
    }
  ];

  const issues = service.transformFeaturesToIssues(rawFeatures);
  assert.equal(issues.length, 2);
  assert.equal(issues[0].id, 'INT-001');
  assert.equal(issues[0].state_id, 'state-done');
  assert.equal(issues[0].subtasks_count, 2);
  assert.equal(issues[0].subtasks_done, 2);
  assert.equal(issues[0].user_story_as_a, 'Usuario');

  assert.equal(issues[1].id, 'INT-002');
  assert.equal(issues[1].state_id, 'state-in-progress');
});

test('IssueService Suite: getIssueById y cálculo de métricas', async () => {
  const service = new IssueService();
  const sampleIssues = [
    { id: 'INT-001', sequence_id: 1, title: 'Issue 1', state_id: 'state-done' },
    { id: 'INT-002', sequence_id: 2, title: 'Issue 2', state_id: 'state-in-progress' },
    { id: 'INT-003', sequence_id: 3, title: 'Issue 3', state_id: 'state-todo' }
  ];

  const found1 = await service.getIssueById('INT-001', sampleIssues);
  assert.ok(found1 !== null);
  assert.equal(found1.title, 'Issue 1');

  const foundByNum = await service.getIssueById(2, sampleIssues);
  assert.ok(foundByNum !== null);
  assert.equal(foundByNum.id, 'INT-002');

  const metrics = service.calculateMetrics(sampleIssues);
  assert.equal(metrics.total, 3);
  assert.equal(metrics.completed, 1);
  assert.equal(metrics.inProgress, 1);
  assert.equal(metrics.pending, 1);
  assert.equal(metrics.percentage, 33);
});

test('IssueStore Suite: Mutaciones reactivas, filtros y modos de vista', () => {
  const store = new IssueStore();
  let calls = 0;

  const unsub = store.subscribe(() => {
    calls++;
  });

  // Cambio de modo de vista
  store.setViewMode('list');
  assert.equal(store.getState().viewMode, 'list');
  assert.equal(calls, 1);

  // Modo de vista inválido: ignorado
  store.setViewMode('invalid_mode');
  assert.equal(store.getState().viewMode, 'list');

  // Filtros
  store.setFilter('state', 'state-in-progress');
  store.setFilter('priority', 'urgent');
  assert.equal(store.getState().filters.state, 'state-in-progress');
  assert.equal(store.getState().filters.priority, 'urgent');

  // Reset
  store.resetFilters();
  assert.equal(store.getState().filters.state, 'all');
  assert.equal(store.getState().filters.priority, 'all');

  unsub();
});

test('IssueStore Suite: getFilteredIssues y ordenamiento reactivo', () => {
  const store = new IssueStore();
  const sampleIssues = [
    { id: 'INT-003', sequence_id: 3, title: 'Zebra Service', state_id: 'state-todo', priority: 'low' },
    { id: 'INT-001', sequence_id: 1, title: 'Alpha API', state_id: 'state-done', priority: 'urgent' },
    { id: 'INT-002', sequence_id: 2, title: 'Beta UI', state_id: 'state-in-progress', priority: 'high' }
  ];

  store.setIssues(sampleIssues);

  // Sin filtros: ordenado por secuencia por defecto
  let filtered = store.getFilteredIssues();
  assert.equal(filtered.length, 3);
  assert.equal(filtered[0].id, 'INT-001');
  assert.equal(filtered[2].id, 'INT-003');

  // Filtro por búsqueda de texto
  store.setFilter('search', 'zebra');
  filtered = store.getFilteredIssues();
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].title, 'Zebra Service');

  // Filtro por prioridad
  store.resetFilters();
  store.setFilter('priority', 'urgent');
  filtered = store.getFilteredIssues();
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'INT-001');

  // Ordenamiento por prioridad
  store.resetFilters();
  store.setOrderBy('priority');
  filtered = store.getFilteredIssues();
  assert.equal(filtered[0].priority, 'urgent');
  assert.equal(filtered[1].priority, 'high');
  assert.equal(filtered[2].priority, 'low');
});

test('IssueStore Suite: Apertura, cierre y selección de modal de detalle', () => {
  const store = new IssueStore();
  const sample = [
    { id: 'INT-042', sequence_id: 42, title: 'GraphQL Gateway' }
  ];
  store.setIssues(sample);

  assert.equal(store.getState().isDetailModalOpen, false);
  assert.equal(store.getSelectedIssue(), null);

  store.openDetailModal('INT-042');
  assert.equal(store.getState().isDetailModalOpen, true);
  assert.equal(store.getState().selectedIssueId, 'INT-042');
  assert.equal(store.getSelectedIssue()?.title, 'GraphQL Gateway');

  store.closeDetailModal();
  assert.equal(store.getState().isDetailModalOpen, false);
  assert.equal(store.getState().selectedIssueId, null);
});

test('Presentation Suite: IssueCard e IssueRow con 0 emojis y métricas Jira', () => {
  const issue = {
    id: 'INT-010',
    title: 'Refactor Core Architecture',
    priority: 'high',
    state_id: 'state-in-progress',
    state_name: 'En Progreso',
    module_name: 'Core',
    assignee_role: 'implementer',
    subtasks_count: 4,
    subtasks_done: 3
  };

  const cardHtml = IssueCard(issue);
  assert.ok(cardHtml.includes('INT-010'));
  assert.ok(cardHtml.includes('Refactor Core Architecture'));
  assert.ok(cardHtml.includes('3/4 (75%)'));
  assert.ok(cardHtml.includes('data-action="quick-state"'));

  const rowHtml = IssueRow(issue);
  assert.ok(rowHtml.includes('<tr'));
  assert.ok(rowHtml.includes('INT-010'));
  assert.ok(rowHtml.includes('DEV'));
  assert.ok(rowHtml.includes('QA'));
  assert.ok(rowHtml.includes('3/4'));
});

test('Presentation Suite: IssueBoard agrupa columnas y renderiza tarjetas', () => {
  const issues = [
    { id: 'INT-001', title: 'Task 1', state_id: 'state-todo' },
    { id: 'INT-002', title: 'Task 2', state_id: 'state-done' }
  ];

  const boardHtml = IssueBoard({ issues, states: CANONICAL_STATES });
  assert.ok(boardHtml.includes('id="plane-board-container"'));
  assert.ok(boardHtml.includes('data-state-column="state-todo"'));
  assert.ok(boardHtml.includes('data-state-column="state-done"'));
  assert.ok(boardHtml.includes('Task 1'));
  assert.ok(boardHtml.includes('Task 2'));
});

test('Presentation Suite: IssueList agrupa secciones con sticky header', () => {
  const issues = [
    { id: 'INT-001', title: 'Task 1', state_id: 'state-todo' },
    { id: 'INT-002', title: 'Task 2', state_id: 'state-done' }
  ];

  const listHtml = IssueList({ issues, states: CANONICAL_STATES, groupBy: 'state' });
  assert.ok(listHtml.includes('id="plane-list-container"'));
  assert.ok(listHtml.includes('<table'));
  assert.ok(listHtml.includes('Task 1'));
  assert.ok(listHtml.includes('Task 2'));
  assert.ok(listHtml.includes('Por Hacer'));
  assert.ok(listHtml.includes('Completado'));
});

test('Presentation Suite: IssueDetailModal accesible con Scrum, EARS y DoD', () => {
  const issue = {
    id: 'INT-014',
    title: 'Screaming Architecture Domain Issues',
    description: 'Implementación modular del dominio de tareas',
    state_id: 'state-in-progress',
    state_name: 'En Progreso',
    priority: 'P0',
    module_name: 'dashboard',
    user_story_as_a: 'Lead Frontend Engineer',
    user_story_i_want: 'implementar el dominio Issues bajo Screaming Architecture',
    user_story_so_that: 'mantener alta modularidad y desacoplamiento',
    acceptance_criteria: [
      'Criterio 1: Cero emojis unicode',
      'Criterio 2: Persistencia dual relacional'
    ],
    subtasks: [
      { id: 'INT-014-DEV', type: 'development', title: 'Escribir componentes modulares', status: 'done' },
      { id: 'INT-014-QA', type: 'qa', title: 'Ejecutar suite unitaria y E2E', status: 'passed' }
    ]
  };

  const modalHtml = IssueDetailModal({ issue, states: CANONICAL_STATES });
  assert.ok(modalHtml.includes('role="dialog"'));
  assert.ok(modalHtml.includes('aria-modal="true"'));
  assert.ok(modalHtml.includes('INT-014'));
  assert.ok(modalHtml.includes('Historia de Usuario (Scrum)'));
  assert.ok(modalHtml.includes('Lead Frontend Engineer'));
  assert.ok(modalHtml.includes('Criterios de Aceptación (EARS / DoR)'));
  assert.ok(modalHtml.includes('Subtareas Técnicas Jira (2)'));
  assert.ok(modalHtml.includes('Definition of Done (DoD)'));
  assert.ok(modalHtml.includes('id="plane-modal-close"'));
});

test('Presentation Suite: IssueControlsBar, IssueFilters e IssuesPage', () => {
  const controlsHtml = IssueControlsBar({
    currentViewMode: 'board',
    groupBy: 'state',
    issueCount: 14
  });
  assert.ok(controlsHtml.includes('id="plane-issue-controls-bar"'));
  assert.ok(controlsHtml.includes('data-plane-view-mode="board"'));
  assert.ok(controlsHtml.includes('data-plane-view-mode="list"'));
  assert.ok(controlsHtml.includes('14 tareas'));

  const filtersHtml = IssueFilters({
    filters: { state: 'all', priority: 'all', assignee: 'all', search: 'auth' },
    states: CANONICAL_STATES
  });
  assert.ok(filtersHtml.includes('id="plane-issue-filters"'));
  assert.ok(filtersHtml.includes('plane-filter-state'));
  assert.ok(filtersHtml.includes('value="auth"'));

  const pageHtml = IssuesPage({
    issues: [{ id: 'INT-001', title: 'Test Task', state_id: 'state-todo' }],
    states: CANONICAL_STATES,
    viewMode: 'board'
  });
  assert.ok(pageHtml.includes('id="plane-issues-page"'));
  assert.ok(pageHtml.includes('id="plane-board-container"'));
  assert.ok(pageHtml.includes('Test Task'));
});
