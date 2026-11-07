/**
 * Page Store - Reactive State Management for Knowledge Pages & Docs
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */

export const initialPageState = {
  pages: [],
  activePageId: null,
  activePageContent: '',
  searchQuery: '',
  editorMode: 'reader', // 'reader' | 'editor'
  activeShelf: 'all',
  filterTab: 'all', // 'all' | 'favorites' | 'locked' | 'modules'
  isFullWidth: false,
  showNavigationPane: true,
  activeNavTab: 'outline', // 'outline' | 'info' | 'assets' | 'version_history'
  showAiMenu: false
};

export class PageStore {
  constructor(initialState = initialPageState) {
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
        console.error('Error en PageStore listener:', err);
      }
    }
  }

  setPages(pages) {
    this.setState({ pages });
  }

  selectPage(pageId, content = '') {
    this.setState({ activePageId: pageId, activePageContent: content });
  }

  setEditorMode(mode) {
    this.setState({ editorMode: mode });
  }

  setSearchQuery(searchQuery) {
    this.setState({ searchQuery });
  }

  setFilterTab(filterTab) {
    this.setState({ filterTab });
  }

  setFullWidth(isFullWidth) {
    this.setState({ isFullWidth });
  }

  setShowNavigationPane(showNavigationPane) {
    this.setState({ showNavigationPane });
  }

  setActiveNavTab(activeNavTab) {
    this.setState({ activeNavTab });
  }

  setShowAiMenu(showAiMenu) {
    this.setState({ showAiMenu });
  }

  togglePageProperty(pageId, propKey) {
    const updatedPages = this.state.pages.map(p => {
      if (p.id !== pageId) return p;
      return { ...p, [propKey]: p[propKey] ? 0 : 1 };
    });
    this.setState({ pages: updatedPages });
  }

  getFilteredPages() {
    const { pages, searchQuery, activeShelf } = this.state;
    return pages.filter(p => {
      if (activeShelf !== 'all' && p.shelf !== activeShelf) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (p.title || '').toLowerCase().includes(q) || (p.file_path && p.file_path.toLowerCase().includes(q));
    });
  }

  reset() {
    this.state = { ...initialPageState };
    this.notify();
  }
}

export const pageStore = new PageStore();
