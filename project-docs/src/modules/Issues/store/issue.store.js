/**
 * Issue Local Reactive State Store
 * Maneja el estado reactivo del dominio Issues: filtros, vista activa, agrupación, ordenamiento y selección.
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */
import { CANONICAL_STATES } from '../services/issue.service.js';

export const initialIssueState = {
  viewMode: 'board', // 'board' | 'list' | 'calendar' | 'spreadsheet'
  filters: {
    state: 'all',
    priority: 'all',
    assignee: 'all',
    module: 'all',
    search: ''
  },
  groupBy: 'state', // 'state' | 'priority' | 'assignee'
  orderBy: 'sequence', // 'sequence' | 'priority' | 'title'
  selectedIssueId: null,
  isDetailModalOpen: false,
  issues: [],
  states: [...CANONICAL_STATES],
  loading: false,
  error: null
};

export class IssueStore {
  constructor(initial = initialIssueState) {
    this.state = {
      ...initial,
      filters: { ...initial.filters }
    };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(updater) {
    const next = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...next };
    this.notify();
  }

  subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('El listener debe ser una función');
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error en suscriptor de IssueStore:', err);
      }
    }
  }

  // --- Mutators ---

  setViewMode(viewMode) {
    if (['board', 'list', 'calendar', 'spreadsheet'].includes(viewMode)) {
      this.setState({ viewMode });
    }
  }

  setFilter(key, value) {
    this.setState({
      filters: { ...this.state.filters, [key]: value }
    });
  }

  resetFilters() {
    this.setState({
      filters: {
        state: 'all',
        priority: 'all',
        assignee: 'all',
        module: 'all',
        search: ''
      }
    });
  }

  setGroupBy(groupBy) {
    if (['state', 'priority', 'assignee'].includes(groupBy)) {
      this.setState({ groupBy });
    }
  }

  setOrderBy(orderBy) {
    this.setState({ orderBy });
  }

  setIssues(issues) {
    this.setState({ issues: Array.isArray(issues) ? issues : [] });
  }

  setStates(states) {
    if (Array.isArray(states) && states.length > 0) {
      this.setState({ states });
    }
  }

  setSelectedIssueId(selectedIssueId) {
    this.setState({
      selectedIssueId,
      isDetailModalOpen: Boolean(selectedIssueId)
    });
  }

  openDetailModal(issueId) {
    this.setState({
      selectedIssueId: issueId,
      isDetailModalOpen: true
    });
  }

  closeDetailModal() {
    this.setState({
      selectedIssueId: null,
      isDetailModalOpen: false
    });
  }

  // --- Selectors ---

  getSelectedIssue() {
    if (!this.state.selectedIssueId) return null;
    const strId = String(this.state.selectedIssueId).toUpperCase();
    const numId = parseInt(strId.replace(/\D/g, ''), 10);

    return this.state.issues.find(i =>
      String(i.id).toUpperCase() === strId ||
      i.sequence_id === numId ||
      i.id === `INT-${String(numId).padStart(3, '0')}`
    ) || null;
  }

  getFilteredIssues() {
    const { issues, filters, orderBy } = this.state;
    const q = (filters.search || '').trim().toLowerCase();

    const filtered = issues.filter(issue => {
      // Búsqueda textual
      if (q) {
        const matchTitle = (issue.title || '').toLowerCase().includes(q);
        const matchId = (issue.id || '').toLowerCase().includes(q);
        const matchDesc = (issue.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchDesc) return false;
      }

      // Filtro por Estado
      if (filters.state !== 'all' && issue.state_id !== filters.state) {
        return false;
      }

      // Filtro por Prioridad
      if (filters.priority !== 'all') {
        const p = (issue.priority || '').toLowerCase();
        if (p !== filters.priority.toLowerCase()) return false;
      }

      // Filtro por Agente Asignado
      if (filters.assignee !== 'all') {
        const a = (issue.assignee_role || issue.assignee || '').toLowerCase();
        if (!a.includes(filters.assignee.toLowerCase())) return false;
      }

      // Filtro por Módulo
      if (filters.module !== 'all') {
        const m = (issue.module_name || issue.module || '').toLowerCase();
        if (m !== filters.module.toLowerCase()) return false;
      }

      return true;
    });

    // Ordenamiento
    return filtered.sort((a, b) => {
      if (orderBy === 'priority') {
        const weights = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
        return (weights[b.priority] || 0) - (weights[a.priority] || 0);
      }
      if (orderBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      // Por secuencia numérica por defecto
      const seqA = a.sequence_id || parseInt(String(a.id).replace(/\D/g, ''), 10) || 0;
      const seqB = b.sequence_id || parseInt(String(b.id).replace(/\D/g, ''), 10) || 0;
      return seqA - seqB;
    });
  }
}

export const issueStore = new IssueStore();
