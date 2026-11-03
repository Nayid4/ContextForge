import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { store } from '../../project-docs/src/core/store.js';

describe('White-Box Testing: Reactividad, Estado y Mutaciones en Store', () => {
  test('Branch Coverage: Suscripción y notificación reactiva a listeners', () => {
    let callCount = 0;
    let capturedState = null;

    const unsubscribe = store.subscribe((state) => {
      callCount++;
      capturedState = state;
    });

    store.setLoading(false);
    assert.equal(callCount, 1);
    assert.equal(capturedState.loading, false);

    // Desuscripción limpia
    unsubscribe();
    store.setLoading(true);
    assert.equal(callCount, 1, 'No debe notificar tras cancelar suscripción');
  });

  test('Branch Coverage: setData con datos completos y estructura normalizada', () => {
    const mockData = {
      project: 'Harness Test Unit',
      features: [
        { id: 101, name: 'feat_test', status: 'done', module: 'test-mod' }
      ],
      currentSpec: { id: 101, task_id: 101 },
      projectSpec: { runtime: 'Node.js' },
      knowledgeIndex: { modules: ['test-mod'], docs: {} }
    };

    store.setData(mockData);
    const state = store.getState();

    assert.equal(state.project, 'Harness Test Unit');
    assert.equal(state.features.length, 1);
    assert.equal(state.features[0].id, 101);
    assert.equal(state.loading, false);
    assert.equal(state.error, null);
  });

  test('Branch Coverage: Filtrado reactivo de features por módulo, estado y búsqueda', () => {
    store.setData({
      project: 'Filter Suite',
      features: [
        { id: 1, name: 'auth_jwt', title: 'Auth JWT', module: 'auth', status: 'done', priority: 'P0' },
        { id: 2, name: 'user_crud', title: 'User CRUD', module: 'users', status: 'in_progress', priority: 'P1' },
        { id: 3, name: 'payment_webhook', title: 'Payment Webhook', module: 'billing', status: 'pending', priority: 'P0' }
      ]
    });

    // Filtro por módulo
    store.setFilter('module', 'auth');
    assert.equal(store.getFilteredFeatures().length, 1);
    assert.equal(store.getFilteredFeatures()[0].name, 'auth_jwt');

    // Reset y filtro por status
    store.setFilter('module', '');
    store.setFilter('status', 'in_progress');
    assert.equal(store.getFilteredFeatures().length, 1);
    assert.equal(store.getFilteredFeatures()[0].id, 2);

    // Reset filtros
    store.resetFilters();
    assert.equal(store.getFilteredFeatures().length, 3);
  });

  test('Branch Coverage: Manejo de errores y estado de carga', () => {
    store.setError('Error critico simulado de red');
    assert.equal(store.getState().error, 'Error critico simulado de red');
    assert.equal(store.getState().loading, false);

    store.setError(null);
    assert.equal(store.getState().error, null);
  });
});
