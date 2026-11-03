/**
 * Hash router to manage active tab state
 */

export const router = {
  init(callback) {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').trim() || 'features';
      if (callback) callback(hash);
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
  },

  navigate(tabId) {
    window.location.hash = tabId;
  }
};

export function initRouter(callback) {
  router.init(callback);
}
