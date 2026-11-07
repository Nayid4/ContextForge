/**
 * Project Service - Data Access Layer for Workspace & Projects Domain
 * Maneja operaciones de consulta de workspaces, proyectos y cálculo de estadísticas ejecutivas.
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */
import { apiClient } from '../../../core/api-client.js';

export class ProjectService {
  constructor(client = apiClient) {
    this.client = client;
  }

  /**
   * Obtiene la información del Workspace activo.
   * @param {{ bypassCache?: boolean }} [options]
   * @returns {Promise<Record<string, any>>}
   */
  async getWorkspace(options = {}) {
    const planeData = await this.client.fetchPlaneData(options);
    if (planeData && planeData.workspace) {
      return planeData.workspace;
    }
    return {
      id: 'ws-harness',
      name: 'Harness Engineering Workspace',
      slug: 'harness',
      description: 'Espacio de trabajo soberano para orquestación SDD con agentes de IA'
    };
  }

  /**
   * Obtiene la información del Proyecto activo.
   * @param {{ bypassCache?: boolean }} [options]
   * @returns {Promise<Record<string, any>>}
   */
  async getProject(options = {}) {
    const planeData = await this.client.fetchPlaneData(options);
    if (planeData && planeData.project) {
      return planeData.project;
    }
    return {
      id: 'proj-harness-core',
      name: 'Arnés de Ingeniería SDD Multi-Agente',
      identifier: 'INT',
      description: 'Plataforma de especificación formal, desarrollo guiado por pruebas y trazabilidad Scrum',
      methodology: 'SDD + TDD'
    };
  }

  /**
   * Calcula métricas y KPIs globales del proyecto.
   * @param {Array<Record<string, any>>} [issues]
   * @param {Array<Record<string, any>>} [cycles]
   * @param {Array<Record<string, any>>} [modules]
   * @param {Array<Record<string, any>>} [pages]
   * @returns {Record<string, any>}
   */
  calculateProjectStats(issues = [], cycles = [], modules = [], pages = []) {
    const totalIssues = issues.length;
    const completedIssues = issues.filter(i => i.state_id === 'state-done').length;
    const inProgressIssues = issues.filter(i => i.state_id === 'state-in-progress' || i.state_id === 'state-in-review').length;
    const backlogIssues = totalIssues - completedIssues - inProgressIssues;
    const progressPercent = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

    const agentDistribution = {};
    for (const issue of issues) {
      const agent = issue.assignee_role || 'unassigned';
      agentDistribution[agent] = (agentDistribution[agent] || 0) + 1;
    }

    return {
      totalIssues,
      completedIssues,
      inProgressIssues,
      backlogIssues,
      progressPercent,
      cycleCount: cycles.length,
      moduleCount: modules.length,
      pageCount: pages.length,
      agentDistribution
    };
  }
}

export const projectService = new ProjectService();
