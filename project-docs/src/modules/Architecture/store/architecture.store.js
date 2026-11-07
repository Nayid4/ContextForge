/**
 * ArchitectureStore
 * Estado reactivo local para la vista de arquitectura y navegacion por pestañas (C4, Stack, Metas, Capas).
 */
import { createStore } from '../../../core/store.js';

export const architectureStore = createStore({
  activeTab: 'c4', // 'c4' | 'stack' | 'layers' | 'goals'
  selectedDiagram: 'context',
  zoomLevel: 100
});
