/**
 * Hash router to manage active tab state
 */
import { store } from './store.js';

const VALID_TABS = ['list', 'graph', 'tree', 'three', 'history'];

export function initRouter() {
  const handleHash = () => {
    const hash = window.location.hash.replace('#', '').trim();
    if (VALID_TABS.includes(hash)) {
      store.setState({ activeTab: hash });
    }
  };

  window.addEventListener('hashchange', handleHash);
  if (window.location.hash) {
    handleHash();
  }

  // Sync hash when store activeTab changes
  store.subscribe(state => {
    if (window.location.hash.replace('#', '') !== state.activeTab) {
      window.location.hash = state.activeTab;
    }
  });
}
