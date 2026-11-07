/**
 * GraphStore
 * Estado reactivo local para el modo de visualizacion (grafo en malla DAG o arbol jerarquico).
 */
import { createStore } from '../../../core/store.js';

export const graphStore = createStore({
  graphMode: 'graph', // 'graph' | 'tree'
  selectedFeatureId: null,
  zoomLevel: 100
});
