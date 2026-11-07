/**
 * AnalyticsService
 * Capa de calculo de metricas agregadas: tasa de completitud, balance de carga de agentes y distribucion de prioridad.
 */
import { store } from '../../../core/store.js';

export class AnalyticsService {
  getIssues() {
    const state = store.getState();
    return state.features || [];
  }

  getMetrics() {
    const issues = this.getIssues();
    const total = issues.length;
    const done = issues.filter(i => i.status === 'done' || i.state_id === 'state-done').length;
    const inProgress = issues.filter(i => i.status === 'in_progress' || i.state_id === 'state-in-progress').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, done, inProgress, completionRate };
  }
}

export const analyticsService = new AnalyticsService();
