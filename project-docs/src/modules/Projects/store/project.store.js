/**
 * Project Store - Reactive State Management for Workspace & Projects
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */

export const initialProjectState = {
  workspace: null,
  project: null,
  activeTab: 'overview', // 'overview' | 'settings' | 'team'
  searchQuery: '',
  stats: null
};

export class ProjectStore {
  constructor(initialState = initialProjectState) {
    this.state = { ...initialState };
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
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error en ProjectStore listener:', err);
      }
    }
  }

  setWorkspace(workspace) {
    this.setState({ workspace });
  }

  setProject(project) {
    this.setState({ project });
  }

  setActiveTab(activeTab) {
    this.setState({ activeTab });
  }

  setStats(stats) {
    this.setState({ stats });
  }

  reset() {
    this.state = { ...initialProjectState };
    this.notify();
  }
}

export const projectStore = new ProjectStore();
