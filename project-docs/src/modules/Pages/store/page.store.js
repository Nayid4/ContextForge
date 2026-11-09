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
  navigationTab: 'all', // Plane TPageNavigationTabs: 'all' | 'created_by_me' | 'favorited' | 'archived' | 'public' | 'private'
  viewLayout: 'list', // 'list' | 'card'
  orderBy: 'updated_at', // Plane TPageOrderBy: 'updated_at' | 'created_at' | 'name'
  sortBy: 'desc', // Plane TPageSortBy: 'asc' | 'desc'
  filters: {
    favorites: false,
    locked: false,
    created_by: []
  },
  isFullWidth: false,
  showNavigationPane: true,
  activeNavTab: 'outline', // 'outline' | 'info' | 'assets' | 'version_history'
  showAiMenu: false
};

export class PageStore {
  constructor(initialState = initialPageState) {
    this.state = {
      ...initialState,
      filters: { ...(initialState.filters || { favorites: false, locked: false, created_by: [] }) }
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
    const activePage = this.state.pages.find(p => p.id === this.state.activePageId);
    // Plane BR-PAGE-02: Locked or archived pages cannot enter editable mode
    if (mode === 'editor' && activePage && (activePage.is_locked || activePage.archived_at)) {
      return;
    }
    this.setState({ editorMode: mode });
  }

  setSearchQuery(searchQuery) {
    this.setState({ searchQuery });
  }

  setFilterTab(filterTab) {
    this.setState({ filterTab });
  }

  setNavigationTab(navigationTab) {
    this.setState({ navigationTab });
  }

  setViewLayout(viewLayout) {
    this.setState({ viewLayout: viewLayout === 'card' ? 'card' : 'list' });
  }

  setOrderBy(orderBy) {
    this.setState({ orderBy });
  }

  setSortBy(sortBy) {
    this.setState({ sortBy });
  }

  setFilters(partialFilters = {}) {
    this.setState({
      filters: {
        ...this.state.filters,
        ...partialFilters
      }
    });
  }

  clearAllFilters() {
    this.setState({
      searchQuery: '',
      activeShelf: 'all',
      filterTab: 'all',
      filters: {
        favorites: false,
        locked: false,
        created_by: []
      }
    });
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
      // Plane BR-PAGE-04: Access cannot be changed when archived
      if (propKey === 'access' && p.archived_at) return p;
      return { ...p, [propKey]: p[propKey] ? 0 : 1 };
    });
    this.setState({ pages: updatedPages });
  }

  archivePage(pageId) {
    const nowIso = new Date().toISOString();
    const updatedPages = this.state.pages.map(p => {
      if (p.id !== pageId) return p;
      // Plane BR-PAGE-03: Archiving automatically removes page from Favorites
      return { ...p, archived_at: nowIso, is_favorite: 0 };
    });
    this.setState({ pages: updatedPages });
  }

  restorePage(pageId) {
    const updatedPages = this.state.pages.map(p => {
      if (p.id !== pageId) return p;
      return { ...p, archived_at: null };
    });
    this.setState({ pages: updatedPages });
  }

  getFilteredPages() {
    const { pages, searchQuery, activeShelf, navigationTab, orderBy, sortBy, filters } = this.state;

    const filtered = pages.filter(p => {
      // 1. Navigation Tab (All Pages / Created by me / Favorited / Archived / Public / Private)
      if (navigationTab === 'archived') {
        if (!p.archived_at) return false;
      } else if (navigationTab === 'favorited' || navigationTab === 'favorites') {
        if (p.archived_at || !p.is_favorite) return false;
      } else if (navigationTab === 'created_by_me') {
        if (p.archived_at) return false;
        const isMe = p.owned_by_role === 'spec-author' || p.owned_by_id === 'user-spec-author' || p.owned_by_role === 'leader';
        if (!isMe) return false;
      } else if (navigationTab === 'private') {
        if (p.archived_at || Number(p.access || 0) !== 1) return false;
      } else if (navigationTab === 'public') {
        if (p.archived_at || Number(p.access || 0) !== 0) return false;
      } else if (navigationTab === 'all') {
        if (p.archived_at) return false;
      }

      // 2. Shelf filter
      if (activeShelf !== 'all' && p.shelf !== activeShelf) return false;

      // 3. Property filters (favorites, locked, created_by)
      if (filters?.favorites && !p.is_favorite) return false;
      if (filters?.locked && !p.is_locked) return false;
      if (Array.isArray(filters?.created_by) && filters.created_by.length > 0) {
        if (!filters.created_by.includes(p.owned_by_role) && !filters.created_by.includes(p.owned_by_id)) {
          return false;
        }
      }

      // 4. Search query
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (p.title || '').toLowerCase().includes(q) || (p.file_path && p.file_path.toLowerCase().includes(q));
    });

    // 5. Plane OrderBy & SortBy (name / title, created_at, updated_at)
    const dir = sortBy === 'asc' ? 1 : -1;
    return filtered.sort((a, b) => {
      if (orderBy === 'name' || orderBy === 'title') {
        const nameA = (a.title || 'Untitled').toLowerCase();
        const nameB = (b.title || 'Untitled').toLowerCase();
        return nameA.localeCompare(nameB) * dir;
      }
      if (orderBy === 'created_at') {
        const tA = new Date(a.created_at || a.updated_at || 0).getTime();
        const tB = new Date(b.created_at || b.updated_at || 0).getTime();
        return (tA - tB) * dir;
      }
      const uA = new Date(a.updated_at || 0).getTime();
      const uB = new Date(b.updated_at || 0).getTime();
      return (uA - uB) * dir;
    });
  }

  getFilteredAndSortedPages() {
    return this.getFilteredPages();
  }

  reset() {
    this.state = {
      ...initialPageState,
      filters: { ...initialPageState.filters }
    };
    this.notify();
  }
}

export const pageStore = new PageStore();
