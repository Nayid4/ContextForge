/**
 * Central state store using Observer pattern (Vanilla reactive state).
 */

const initialState = {
  project: 'Proyecto',
  features: [],
  currentSpec: {},
  historyData: { records: [] },
  activeTab: 'list', // 'list' | 'graph' | 'tree' | 'three' | 'history'
  filters: {
    search: '',
    status: '',
    module: '',
    priority: '',
    type: '' // 'feature' | 'bugfix'
  },
  pagination: {
    page: 1,
    perPage: 10
  },
  selectedFeature: null,
  theme3D: 'dark',
  error: null,
  loading: true
};

class Store {
  constructor(state = initialState) {
    this.state = { ...state };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(updater) {
    const nextPartial = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...nextPartial };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // --- Selectors ---

  isReady(feature) {
    if (feature.status === 'done' || feature.status === 'in_progress') return false;
    if (!feature.dependencies || !feature.dependencies.length) return true;
    return feature.dependencies.every(depId => {
      const dep = this.state.features.find(f => f.id === depId);
      return dep && dep.status === 'done';
    });
  }

  getBlockedBy(feature) {
    if (!feature.dependencies || !feature.dependencies.length) return [];
    return feature.dependencies
      .map(depId => this.state.features.find(f => f.id === depId))
      .filter(dep => dep && dep.status !== 'done');
  }

  getDepChain(feature, visited = new Set()) {
    if (visited.has(feature.id)) return [];
    visited.add(feature.id);
    const chain = [feature];
    if (feature.dependencies) {
      feature.dependencies.forEach(depId => {
        const dep = this.state.features.find(f => f.id === depId);
        if (dep) {
          const subChain = this.getDepChain(dep, visited);
          chain.push(...subChain);
        }
      });
    }
    return chain;
  }

  getFilteredFeatures() {
    const { features, filters } = this.state;
    return features.filter(f => {
      const q = filters.search.trim().toLowerCase();
      if (q) {
        const matchTitle = (f.title || '').toLowerCase().includes(q);
        const matchName = (f.name || '').toLowerCase().includes(q);
        const matchDesc = (f.description || '').toLowerCase().includes(q);
        const matchBranch = (f.branch || '').toLowerCase().includes(q);
        const matchId = String(f.id).includes(q);
        if (!matchTitle && !matchName && !matchDesc && !matchBranch && !matchId) {
          return false;
        }
      }
      if (filters.status && f.status !== filters.status) return false;
      if (filters.module && f.module !== filters.module) return false;
      if (filters.priority && f.priority !== filters.priority) return false;
      if (filters.type && (f.type || 'feature') !== filters.type) return false;
      return true;
    });
  }

  getPaginatedFeatures() {
    const filtered = this.getFilteredFeatures();
    const { page, perPage } = this.state.pagination;
    const start = (page - 1) * perPage;
    return {
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / perPage) || 1,
      currentPage: page,
      items: filtered.slice(start, start + perPage)
    };
  }

  getStats() {
    const { features } = this.state;
    const total = features.length;
    const pending = features.filter(f => f.status === 'pending').length;
    const inProgress = features.filter(f => f.status === 'in_progress').length;
    const specReady = features.filter(f => f.status === 'spec_ready').length;
    const done = features.filter(f => f.status === 'done').length;
    const blocked = features.filter(f => f.status === 'blocked').length;
    const featuresCount = features.filter(f => !f.type || f.type === 'feature').length;
    const bugfixesCount = features.filter(f => f.type === 'bugfix').length;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      total,
      pending,
      inProgress,
      specReady,
      done,
      blocked,
      featuresCount,
      bugfixesCount,
      percentage
    };
  }
}

export const store = new Store();
