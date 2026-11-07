/**
 * AnalyticsStore
 * Estado reactivo local para filtros temporales y de ciclo en analitica.
 */
import { createStore } from '../../../core/store.js';

export const analyticsStore = createStore({
  timeRange: 'all', // 'sprint' | 'month' | 'all'
  selectedAgent: 'all'
});
