/**
 * Cycle Service - Data Access Layer for Cycles & Sprints Domain
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */
import { apiClient } from '../../../core/api-client.js';

export class CycleService {
  constructor(client = apiClient) {
    this.client = client;
  }

  /**
   * Obtiene todos los ciclos de sprint configurados.
   * @param {{ bypassCache?: boolean }} [options]
   * @returns {Promise<Array<Record<string, any>>>}
   */
  async getCycles(options = {}) {
    const planeData = await this.client.fetchPlaneData(options);
    if (planeData && Array.isArray(planeData.cycles) && planeData.cycles.length > 0) {
      return planeData.cycles;
    }
    return [];
  }

  /**
   * Obtiene un ciclo específico por su identificador.
   * @param {string} cycleId
   * @returns {Promise<Record<string, any>|null>}
   */
  async getCycleById(cycleId) {
    const cycles = await this.getCycles();
    return cycles.find(c => c.id === cycleId) || null;
  }

  /**
   * Calcula las métricas de avance de un ciclo dado un conjunto de tareas.
   * @param {Record<string, any>} cycle
   * @param {Array<Record<string, any>>} issues
   * @returns {Record<string, any>}
   */
  calculateCycleMetrics(cycle = {}, issues = []) {
    const cycleIssues = issues.filter(i => i.cycle_id === cycle.id);
    const total = cycleIssues.length;
    const done = cycleIssues.filter(i => i.state_id === 'state-done').length;
    const inProgress = cycleIssues.filter(i => i.state_id === 'state-in-progress' || i.state_id === 'state-in-review').length;
    const backlog = total - done - inProgress;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      total,
      done,
      inProgress,
      backlog,
      percent,
      issues: cycleIssues
    };
  }

  /**
   * Genera la serie de puntos temporales para el gráfico de Burn-down vectorial.
   * @param {Record<string, any>} cycle
   * @param {Array<Record<string, any>>} issues
   * @returns {Array<{ label: string, remaining: number, ideal: number }>}
   */
  calculateBurnDownPoints(cycle = {}, issues = []) {
    const { total, done } = this.calculateCycleMetrics(cycle, issues);
    const safeTotal = Math.max(total, 1);

    return [
      { label: 'Día 1', remaining: total, ideal: total },
      { label: 'Día 4', remaining: Math.max(0, total - Math.round(done * 0.3)), ideal: Math.round(safeTotal * 0.8) },
      { label: 'Día 7', remaining: Math.max(0, total - Math.round(done * 0.6)), ideal: Math.round(safeTotal * 0.6) },
      { label: 'Día 10', remaining: Math.max(0, total - done), ideal: Math.round(safeTotal * 0.4) },
      { label: 'Día 14', remaining: Math.max(0, total - done), ideal: 0 }
    ];
  }
}

export const cycleService = new CycleService();
