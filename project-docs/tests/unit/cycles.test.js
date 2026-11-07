import test from 'node:test';
import assert from 'node:assert/strict';

import {
  cycleService,
  CycleService,
  cycleStore,
  CycleStore,
  BurnDownChart,
  CycleCard,
  CycleList,
  CyclesPage,
  renderCyclesView
} from '../../src/modules/Cycles/index.js';

test('CycleService Suite: getCycles y getCycleById retornan ciclos válidos', async () => {
  const service = new CycleService({
    fetchPlaneData: async () => ({
      cycles: [
        { id: 'c-1', name: 'Sprint 1', status: 'completed' },
        { id: 'c-2', name: 'Sprint 2', status: 'active' }
      ]
    })
  });

  const cycles = await service.getCycles();
  assert.equal(cycles.length, 2);

  const cycle = await service.getCycleById('c-2');
  assert.ok(cycle);
  assert.equal(cycle.name, 'Sprint 2');
  assert.equal(cycle.status, 'active');
});

test('CycleService Suite: calculateCycleMetrics y calculateBurnDownPoints', () => {
  const cycle = { id: 'c-1', name: 'Sprint 1' };
  const issues = [
    { id: 'i-1', cycle_id: 'c-1', state_id: 'state-done' },
    { id: 'i-2', cycle_id: 'c-1', state_id: 'state-done' },
    { id: 'i-3', cycle_id: 'c-1', state_id: 'state-in-progress' },
    { id: 'i-4', cycle_id: 'c-1', state_id: 'state-todo' }
  ];

  const metrics = cycleService.calculateCycleMetrics(cycle, issues);
  assert.equal(metrics.total, 4);
  assert.equal(metrics.done, 2);
  assert.equal(metrics.inProgress, 1);
  assert.equal(metrics.backlog, 1);
  assert.equal(metrics.percent, 50);

  const points = cycleService.calculateBurnDownPoints(cycle, issues);
  assert.equal(points.length, 5);
  assert.equal(points[0].remaining, 4);
  assert.equal(points[4].ideal, 0);
});

test('CycleStore Suite: Observer reactivo y filtros de ciclos', () => {
  const store = new CycleStore();
  let count = 0;
  store.subscribe(() => count++);

  store.setCycles([
    { id: 'c-1', status: 'completed' },
    { id: 'c-2', status: 'active' }
  ]);
  assert.equal(store.getState().cycles.length, 2);

  store.setFilterStatus('active');
  const filtered = store.getFilteredCycles();
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'c-2');

  store.selectCycle('c-2');
  assert.equal(store.getState().selectedCycleId, 'c-2');
  assert.ok(count >= 3);
});

test('Cycles UI Suite: BurnDownChart, CycleCard, CycleList y CyclesPage renderizan con 0 emojis', () => {
  const points = [
    { label: 'Día 1', remaining: 10, ideal: 10 },
    { label: 'Día 14', remaining: 0, ideal: 0 }
  ];
  const chartHtml = BurnDownChart({ points });
  assert.ok(chartHtml.includes('<svg'));
  assert.ok(chartHtml.includes('burndownGrad'));
  assert.ok(chartHtml.includes('Día 1'));

  const cardHtml = CycleCard({
    cycle: { id: 'c-1', name: 'Sprint Alpha', status: 'active' },
    metrics: { total: 10, done: 8, percent: 80 },
    isActive: true
  });
  assert.ok(cardHtml.includes('Sprint Alpha'));
  assert.ok(cardHtml.includes('ACTIVO'));
  assert.ok(cardHtml.includes('80%'));

  const listHtml = CycleList({
    cycles: [{ id: 'c-1', name: 'Sprint Alpha', status: 'active' }],
    issues: [],
    activeCycleId: 'c-1'
  });
  assert.ok(listHtml.includes('Sprint Alpha'));

  const pageHtml = CyclesPage({
    cycles: [{ id: 'c-1', name: 'Sprint Alpha', status: 'active', start_date: '2026-01-01', end_date: '2026-01-14' }],
    issues: []
  });
  assert.ok(pageHtml.includes('Ciclos de Desarrollo (Sprints Plane)'));
  assert.ok(pageHtml.includes('Gráfico de Burn-down de Tareas'));

  const legacyHtml = renderCyclesView({
    cycles: [{ id: 'c-1', name: 'Sprint Alpha', status: 'active' }],
    issues: []
  });
  assert.ok(legacyHtml.includes('Sprint Alpha'));
});
