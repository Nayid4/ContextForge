/**
 * Central state store using Observer pattern (Vanilla reactive state).
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */

const getInitialTheme = () => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('harness_theme');
    if (saved) return saved;
  }
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'dark'; // Dark mode por defecto para el arnés
};

export const defaultInitialState = {
  project: 'Proyecto',
  features: [],
  currentSpec: {},
  history: { records: [] },
  historyData: { records: [] },
  projectSpec: null,
  knowledgeIndex: null,
  activeTab: 'features', // 'features' | 'architecture' | 'knowledge' | 'graph' | 'tree' | 'three' | 'history'
  theme: getInitialTheme(),
  filters: {
    search: '',
    status: '',
    module: '',
    priority: '',
    type: '' // 'feature' | 'bugfix'
  },
  pagination: {
    page: 1,
    currentPage: 1,
    perPage: 10,
    pageSize: 10,
    totalPages: 1
  },
  selectedFeature: null,
  theme3D: 'dark',
  error: null,
  loading: true,
  // Plane Unified Architecture & Multi-View State
  layoutMode: 'plane',
  planeData: { workspace: null, project: null, states: [], cycles: [], modules: [], issues: [], pages: [] },
  planeView: 'issues', // 'issues' | 'cycles' | 'modules' | 'pages' | 'architecture' | 'graph' | 'constellation' | 'analytics'
  planeViewMode: 'list', // 'list' | 'board' | 'calendar' | 'spreadsheet'
  planeFilterState: 'all',
  planeFilterPriority: 'all',
  planeFilterAssignee: 'all',
  planeGroupBy: 'state', // 'state' | 'priority' | 'assignee'
  planeOrderBy: 'sequence',
  planeSearchQuery: '',
  planePageSearchQuery: '',
  planeActivePageId: null,
  planeActivePageContent: '',
  planePageEditorMode: 'reader', // 'reader' | 'editor'
  planeSelectedIssueId: null,
  isSidebarCollapsed: false,
  isOmniboxOpen: false,
  omniboxQuery: '',
  graphMode: 'graph' // 'graph' | 'tree'
};

export class Store {
  constructor(state = defaultInitialState) {
    this.initialState = { ...state };
    this.state = { ...state };
    this.listeners = new Set();
    this.keyListeners = new Map();
    this.syncThemeDom();
  }

  /**
   * Retorna una copia congelada o referencial del estado actual.
   * @returns {typeof defaultInitialState}
   */
  getState() {
    return this.state;
  }

  /**
   * Actualiza el estado mediante un objeto parcial o una función actualizadora.
   * Notifica a todos los suscriptores generales y por clave afectada.
   * @param {Partial<typeof defaultInitialState> | ((prevState: typeof defaultInitialState) => Partial<typeof defaultInitialState>)} updater 
   */
  setState(updater) {
    const prevState = this.state;
    const nextPartial = typeof updater === 'function' ? updater(prevState) : updater;
    if (!nextPartial || typeof nextPartial !== 'object') return;

    this.state = { ...prevState, ...nextPartial };

    // Notificar suscriptores por clave modificada
    const changedKeys = Object.keys(nextPartial);
    for (const key of changedKeys) {
      if (prevState[key] !== this.state[key] && this.keyListeners.has(key)) {
        const keySubs = this.keyListeners.get(key);
        for (const sub of keySubs) {
          try {
            sub(this.state[key], prevState[key], this.state);
          } catch (err) {
            console.error(`Error en suscriptor de clave "${key}":`, err);
          }
        }
      }
    }

    this.notify();
  }

  /**
   * Suscribe un listener al estado completo.
   * @param {(state: typeof defaultInitialState) => void} listener 
   * @returns {() => void} Función de desuscripción
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('El listener debe ser una función');
    }
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Suscribe un listener específico a una propiedad particular del estado.
   * @param {string} key - Nombre de la propiedad a observar
   * @param {(newValue: any, oldValue: any, fullState: any) => void} listener 
   * @returns {() => void} Función de desuscripción
   */
  subscribeKey(key, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('El listener de clave debe ser una función');
    }
    if (!this.keyListeners.has(key)) {
      this.keyListeners.set(key, new Set());
    }
    this.keyListeners.get(key).add(listener);
    return () => {
      const subs = this.keyListeners.get(key);
      if (subs) {
        subs.delete(listener);
        if (subs.size === 0) {
          this.keyListeners.delete(key);
        }
      }
    };
  }

  /**
   * Notifica a todos los suscriptores registrados.
   */
  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error en suscriptor de Store:', err);
      }
    }
  }

  /**
   * Restablece el estado completo a sus valores iniciales.
   */
  resetState() {
    this.state = { ...this.initialState };
    this.notify();
  }

  // --- Theme Management ---

  syncThemeDom() {
    if (typeof document !== 'undefined') {
      if (this.state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  toggleTheme() {
    const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('harness_theme', nextTheme);
    }
    this.setState({ theme: nextTheme });
    this.syncThemeDom();
  }

  // --- Mutators ---

  setLoading(loading) {
    this.setState({ loading });
  }

  setData({ project, features, currentSpec, historyData, projectSpec, knowledgeIndex }) {
    const featList = Array.isArray(features) ? features : [];
    const pageSize = this.state.pagination.pageSize || 10;
    const totalPages = Math.ceil(featList.length / pageSize) || 1;

    let mergedKIndex = knowledgeIndex || this.state.knowledgeIndex || null;
    if (mergedKIndex && typeof localStorage !== 'undefined') {
      try {
        const customDocs = JSON.parse(localStorage.getItem('harness_custom_docs') || '{}');
        if (Object.keys(customDocs).length > 0) {
          mergedKIndex = {
            ...mergedKIndex,
            docs: { ...(mergedKIndex.docs || {}), ...customDocs }
          };
        }
      } catch (_) {}
    }

    this.setState({
      project: project || this.state.project,
      features: featList,
      currentSpec: currentSpec || {},
      history: historyData || { records: [] },
      historyData: historyData || { records: [] },
      projectSpec: projectSpec || this.state.projectSpec || null,
      knowledgeIndex: mergedKIndex,
      pagination: {
        ...this.state.pagination,
        totalPages
      },
      loading: false,
      error: null
    });
  }

  saveDoc(key, content) {
    const kIndex = this.state.knowledgeIndex ? { ...this.state.knowledgeIndex } : { docs: {} };
    if (!kIndex.docs) kIndex.docs = {};
    kIndex.docs[key] = content;

    if (typeof localStorage !== 'undefined') {
      try {
        const customDocs = JSON.parse(localStorage.getItem('harness_custom_docs') || '{}');
        customDocs[key] = content;
        localStorage.setItem('harness_custom_docs', JSON.stringify(customDocs));
      } catch (_) {}
    }

    this.setState({ knowledgeIndex: { ...kIndex } });
  }

  deleteDoc(key) {
    const kIndex = this.state.knowledgeIndex ? { ...this.state.knowledgeIndex } : { docs: {} };
    if (kIndex.docs && kIndex.docs[key]) {
      delete kIndex.docs[key];
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const customDocs = JSON.parse(localStorage.getItem('harness_custom_docs') || '{}');
        delete customDocs[key];
        localStorage.setItem('harness_custom_docs', JSON.stringify(customDocs));
      } catch (_) {}
    }
    this.setState({ knowledgeIndex: { ...kIndex } });
  }

  setError(error) {
    this.setState({ error, loading: false });
  }

  setSelectedFeature(selectedFeature) {
    this.setState({ selectedFeature });
  }

  setPage(page) {
    this.setState({
      pagination: { ...this.state.pagination, page, currentPage: page }
    });
  }

  setPageSize(pageSize) {
    const totalPages = Math.ceil(this.state.features.length / pageSize) || 1;
    this.setState({
      pagination: {
        ...this.state.pagination,
        perPage: pageSize,
        pageSize,
        page: 1,
        currentPage: 1,
        totalPages
      }
    });
  }

  setFilter(key, value) {
    this.setState({
      filters: { ...this.state.filters, [key]: value },
      pagination: { ...this.state.pagination, page: 1, currentPage: 1 }
    });
  }

  resetFilters() {
    this.setState({
      filters: { search: '', status: '', module: '', priority: '', type: '' },
      pagination: { ...this.state.pagination, page: 1, currentPage: 1 }
    });
  }

  // --- Selectors ---

  getAvailableModules() {
    const modules = new Set();
    this.state.features.forEach(f => {
      if (f.module) modules.add(f.module);
    });
    return Array.from(modules);
  }

  isReady(feature) {
    if (feature.status === 'done' || feature.status === 'in_progress') return false;
    const deps = feature.depends_on || feature.dependencies || [];
    if (!deps.length) return true;
    return deps.every(depId => {
      const dep = this.state.features.find(f => f.id === depId);
      return dep && dep.status === 'done';
    });
  }

  getBlockedBy(feature) {
    const deps = feature.depends_on || feature.dependencies || [];
    if (!deps.length) return [];
    return deps
      .map(depId => this.state.features.find(f => f.id === depId))
      .filter(dep => dep && dep.status !== 'done');
  }

  getDepChain(feature, visited = new Set()) {
    if (visited.has(feature.id)) return [];
    visited.add(feature.id);
    const chain = [feature];
    const deps = feature.depends_on || feature.dependencies || [];
    deps.forEach(depId => {
      const dep = this.state.features.find(f => f.id === depId);
      if (dep) {
        const subChain = this.getDepChain(dep, visited);
        chain.push(...subChain);
      }
    });
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
