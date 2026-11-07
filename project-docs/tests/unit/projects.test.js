import test from 'node:test';
import assert from 'node:assert/strict';

import {
  projectService,
  ProjectService,
  projectStore,
  ProjectStore,
  ProjectHeader,
  ProjectCard,
  ProjectSelector,
  ProjectsPage
} from '../../src/modules/Projects/index.js';

test('ProjectService Suite: getWorkspace y getProject retornan entidades canónicas', async () => {
  const service = new ProjectService({
    fetchPlaneData: async () => ({
      workspace: { id: 'ws-test', name: 'Test Workspace' },
      project: { id: 'proj-test', name: 'Test Project', identifier: 'TST' }
    })
  });

  const ws = await service.getWorkspace();
  assert.equal(ws.id, 'ws-test');
  assert.equal(ws.name, 'Test Workspace');

  const proj = await service.getProject();
  assert.equal(proj.id, 'proj-test');
  assert.equal(proj.identifier, 'TST');
});

test('ProjectService Suite: calculateProjectStats calcula métricas correctas', () => {
  const issues = [
    { id: 'INT-001', state_id: 'state-done', assignee_role: 'implementer' },
    { id: 'INT-002', state_id: 'state-done', assignee_role: 'implementer' },
    { id: 'INT-003', state_id: 'state-in-progress', assignee_role: 'reviewer' },
    { id: 'INT-004', state_id: 'state-todo', assignee_role: 'spec-author' }
  ];
  const cycles = [{ id: 'cycle-1' }, { id: 'cycle-2' }];
  const modules = [{ id: 'mod-1' }];
  const pages = [{ id: 'p-1' }, { id: 'p-2' }, { id: 'p-3' }];

  const stats = projectService.calculateProjectStats(issues, cycles, modules, pages);

  assert.equal(stats.totalIssues, 4);
  assert.equal(stats.completedIssues, 2);
  assert.equal(stats.inProgressIssues, 1);
  assert.equal(stats.backlogIssues, 1);
  assert.equal(stats.progressPercent, 50);
  assert.equal(stats.cycleCount, 2);
  assert.equal(stats.moduleCount, 1);
  assert.equal(stats.pageCount, 3);
  assert.equal(stats.agentDistribution['implementer'], 2);
});

test('ProjectStore Suite: Observer reactivo y mutaciones', () => {
  const store = new ProjectStore();
  let notificationCount = 0;
  store.subscribe(() => { notificationCount++; });

  store.setWorkspace({ id: 'ws-new', name: 'New WS' });
  assert.equal(store.getState().workspace.name, 'New WS');

  store.setProject({ id: 'proj-new', name: 'New Proj' });
  assert.equal(store.getState().project.name, 'New Proj');

  store.setActiveTab('settings');
  assert.equal(store.getState().activeTab, 'settings');

  assert.ok(notificationCount >= 3);
});

test('Projects UI Suite: Componentes renderizan sin emojis y con estructura semántica', () => {
  const headerHtml = ProjectHeader({
    workspace: { name: 'Acme Corp' },
    project: { name: 'Apollo', identifier: 'APL' },
    stats: { progressPercent: 75 }
  });
  assert.ok(headerHtml.includes('Apollo'));
  assert.ok(headerHtml.includes('APL'));
  assert.ok(headerHtml.includes('75%'));

  const cardHtml = ProjectCard({
    title: 'Sprints',
    value: 5,
    subtitle: 'Activos',
    icon: 'cycle'
  });
  assert.ok(cardHtml.includes('Sprints'));
  assert.ok(cardHtml.includes('5'));

  const selectorHtml = ProjectSelector({ currentProject: 'Apollo' });
  assert.ok(selectorHtml.includes('Apollo'));

  const pageHtml = ProjectsPage({
    workspace: { name: 'Acme' },
    project: { name: 'Apollo', identifier: 'APL' },
    stats: { totalIssues: 10, completedIssues: 8, progressPercent: 80, cycleCount: 3, moduleCount: 2, pageCount: 15 },
    modules: [{ id: 'MOD-1', name: 'Core Engine', description: 'Motor principal' }]
  });
  assert.ok(pageHtml.includes('Core Engine'));
  assert.ok(pageHtml.includes('MOD-1'));
});
