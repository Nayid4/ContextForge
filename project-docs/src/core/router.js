/**
 * Unified Hash Router for Plane Single-Page Architecture
 * Mapea rutas de hash a las vistas de dominio de Plane.
 * 100% Vectorial, sin emojis.
 */

export const router = {
  init(callback) {
    const handleHash = () => {
      const rawHash = (typeof window !== 'undefined' && window.location?.hash ? window.location.hash.replace('#', '').trim() : '') || 'issues';

      // Normalizar rutas legacy o alias a los dominios Screaming de Plane
      let domainView = 'issues';
      if (rawHash === 'features' || rawHash === 'issues' || rawHash === 'plane' || rawHash === 'plane-issues') {
        domainView = 'issues';
      } else if (rawHash === 'cycles' || rawHash === 'plane-cycles') {
        domainView = 'cycles';
      } else if (rawHash === 'modules' || rawHash === 'plane-modules') {
        domainView = 'modules';
      } else if (rawHash === 'pages' || rawHash === 'knowledge' || rawHash === 'plane-pages') {
        domainView = 'pages';
      } else if (rawHash === 'architecture' || rawHash === 'c4' || rawHash === 'stack') {
        domainView = 'architecture';
      } else if (rawHash === 'graph' || rawHash === 'tree' || rawHash === 'depgraph' || rawHash === 'dependencies') {
        domainView = 'graph';
      } else if (rawHash === 'constellation' || rawHash === 'three' || rawHash === 'space3d' || rawHash === '3d') {
        domainView = 'constellation';
      } else if (rawHash === 'analytics' || rawHash === 'metrics' || rawHash === 'stats') {
        domainView = 'analytics';
      } else {
        domainView = rawHash;
      }

      if (callback) callback(domainView, rawHash);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHash);
      handleHash();
    }
  },

  navigate(domainView) {
    if (typeof window !== 'undefined') {
      window.location.hash = domainView;
    }
  }
};

export function initRouter(callback) {
  router.init(callback);
}
