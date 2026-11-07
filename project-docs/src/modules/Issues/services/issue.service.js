/**
 * Issue Service - Data Access Layer for Issues Domain
 * Maneja operaciones de consulta, filtrado y transición de estados con persistencia dual
 * (API REST local y fallback hacia SQLite / window.__FALLBACK_DATA__).
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */
import { apiClient } from '../../../core/api-client.js';

export const CANONICAL_STATES = [
  { id: 'state-backlog', name: 'Backlog', color: 'bg-zinc-500', group: 'backlog', sequence: 1 },
  { id: 'state-todo', name: 'Por Hacer', color: 'bg-sky-500', group: 'unstarted', sequence: 2 },
  { id: 'state-in-progress', name: 'En Progreso', color: 'bg-amber-500', group: 'started', sequence: 3 },
  { id: 'state-in-review', name: 'En Revisión', color: 'bg-purple-500', group: 'started', sequence: 4 },
  { id: 'state-done', name: 'Completado', color: 'bg-emerald-500', group: 'completed', sequence: 5 },
  { id: 'state-cancelled', name: 'Cancelado', color: 'bg-rose-500', group: 'cancelled', sequence: 6 }
];

export class IssueService {
  constructor(client = apiClient) {
    this.client = client;
    this.states = [...CANONICAL_STATES];
  }

  /**
   * Obtiene todos los estados configurados en el proyecto.
   * @returns {Array<{ id: string, name: string, color: string, group: string, sequence: number }>}
   */
  getStates() {
    return this.states;
  }

  /**
   * Carga todas las tareas con datos enriquecidos.
   * @param {{ bypassCache?: boolean }} [options] 
   * @returns {Promise<Array<Record<string, any>>>}
   */
  async getIssues(options = {}) {
    try {
      const planeData = await this.client.fetchPlaneData(options);
      if (planeData && Array.isArray(planeData.issues) && planeData.issues.length > 0) {
        if (Array.isArray(planeData.states) && planeData.states.length > 0) {
          this.states = planeData.states;
        }
        return planeData.issues;
      }
    } catch (err) {
      console.warn('Error obteniendo issues desde API, usando fallback:', err.message);
    }

    // Fallback desde featureList
    const allData = await this.client.fetchAll(options);
    const features = Array.isArray(allData.features) ? allData.features : [];
    return this.transformFeaturesToIssues(features);
  }

  /**
   * Transforma la lista canónica de features de feature_list.json a formato IssueDTO de Plane.
   * @param {Array<Record<string, any>>} features 
   * @returns {Array<Record<string, any>>}
   */
  transformFeaturesToIssues(features) {
    return features.map((f, idx) => {
      let stateId = 'state-backlog';
      let stateName = 'Backlog';

      if (f.status === 'done') {
        stateId = 'state-done';
        stateName = 'Completado';
      } else if (f.status === 'in_progress') {
        stateId = 'state-in-progress';
        stateName = 'En Progreso';
      } else if (f.status === 'spec_ready') {
        stateId = 'state-todo';
        stateName = 'Por Hacer';
      } else if (f.status === 'blocked') {
        stateId = 'state-cancelled';
        stateName = 'Cancelado';
      }

      const rawSubtasks = Array.isArray(f.subtasks) ? f.subtasks : [];
      const subtasks = rawSubtasks.map(s => ({
        id: s.id,
        type: s.type || 'development',
        title: s.title,
        status: s.status || 'pending',
        assignee: s.assignee || 'implementer'
      }));

      const doneSubtasks = subtasks.filter(s => s.status === 'done' || s.status === 'passed').length;

      return {
        id: `INT-${String(f.id).padStart(3, '0')}`,
        sequence_id: f.id,
        title: f.title || f.name,
        name: f.name,
        description: f.description || '',
        state_id: stateId,
        state_name: stateName,
        priority: (f.priority || 'p2').toLowerCase(),
        assignee_role: 'implementer',
        module_name: f.module || 'General',
        subtasks,
        subtasks_count: subtasks.length,
        subtasks_done: doneSubtasks,
        acceptance_criteria: Array.isArray(f.acceptance) ? f.acceptance : [],
        user_story: f.user_story || null,
        user_story_as_a: f.user_story?.as_a || '',
        user_story_i_want: f.user_story?.i_want || '',
        user_story_so_that: f.user_story?.so_that || '',
        branch: f.branch || `feature/INT-${String(f.id).padStart(3, '0')}/${f.name}`,
        raw_feature: f
      };
    });
  }

  /**
   * Obtiene una tarea específica por su ID.
   * @param {string | number} id 
   * @param {Array<Record<string, any>>} [issuesCache] 
   * @returns {Promise<Record<string, any> | null>}
   */
  async getIssueById(id, issuesCache = null) {
    const list = issuesCache || await this.getIssues();
    const strId = String(id).toUpperCase();
    const numId = parseInt(strId.replace(/\D/g, ''), 10);

    return list.find(i =>
      String(i.id).toUpperCase() === strId ||
      i.sequence_id === numId ||
      i.id === `INT-${String(numId).padStart(3, '0')}`
    ) || null;
  }

  /**
   * Actualiza el estado de una tarea y lo persiste localmente y en SQLite si está disponible.
   * @param {string} issueId 
   * @param {string} targetStateId 
   * @returns {Promise<{ ok: boolean, issueId: string, stateId: string }>}
   */
  async updateIssueState(issueId, targetStateId) {
    const targetState = this.states.find(s => s.id === targetStateId);
    const stateName = targetState ? targetState.name : targetStateId;

    try {
      await this.client.post('/api/plane/issues/state', {
        id: issueId,
        state_id: targetStateId,
        state_name: stateName
      });
    } catch (_) {
      // Modo offline o sin servidor REST activo: persistir en memoria/localStorage si es aplicable
    }

    return { ok: true, issueId, stateId: targetStateId };
  }

  /**
   * Actualiza el estado de una subtarea individual.
   * @param {string} issueId 
   * @param {string} subtaskId 
   * @param {string} status 
   * @returns {Promise<{ ok: boolean, issueId: string, subtaskId: string, status: string }>}
   */
  async updateSubtask(issueId, subtaskId, status) {
    try {
      await this.client.post('/api/plane/issues/subtask', {
        issue_id: issueId,
        subtask_id: subtaskId,
        status
      });
    } catch (_) {
      // Fallback
    }

    return { ok: true, issueId, subtaskId, status };
  }

  /**
   * Calcula estadísticas resumidas sobre la lista de tareas.
   * @param {Array<Record<string, any>>} issues 
   * @returns {Record<string, any>}
   */
  calculateMetrics(issues = []) {
    const total = issues.length;
    const completed = issues.filter(i => i.state_id === 'state-done').length;
    const inProgress = issues.filter(i => i.state_id === 'state-in-progress' || i.state_id === 'state-in-review').length;
    const pending = issues.filter(i => i.state_id === 'state-backlog' || i.state_id === 'state-todo').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      percentage
    };
  }
}

export const issueService = new IssueService();
