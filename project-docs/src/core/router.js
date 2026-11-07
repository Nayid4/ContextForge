/**
 * Unified Hash Router with URL Parameters Support for Plane Single-Page Architecture
 * Mapea rutas de hash a las vistas de dominio de Plane con soporte de query parameters:
 * Ejemplos: #issues?id=INT-001&view=board, #pages?doc=c4-model
 * 100% Vectorial, sin emojis.
 */

export class Router {
  constructor() {
    this.currentRoute = 'issues';
    this.currentParams = {};
    this.callbacks = new Set();
    this.routeHandlers = new Map();
    this.isListening = false;
  }

  /**
   * Parsea un hash crudo extrayendo la ruta normalizada y sus parámetros de consulta.
   * @param {string} rawHash 
   * @returns {{ route: string, params: Record<string, string>, rawHash: string }}
   */
  parseHash(rawHash = '') {
    const cleanHash = (rawHash || '').replace(/^#\/?/, '').trim();
    if (!cleanHash) {
      return { route: 'issues', params: {}, rawHash: '' };
    }

    const [pathPart, queryPart] = cleanHash.split('?');
    const rawRoute = (pathPart || 'issues').toLowerCase().trim();
    const params = {};

    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      for (const [key, val] of searchParams.entries()) {
        params[key] = val;
      }
    }

    // Normalización de dominios Screaming Architecture
    let route = 'issues';
    if (['features', 'issues', 'plane', 'plane-issues'].includes(rawRoute)) {
      route = 'issues';
    } else if (['cycles', 'plane-cycles'].includes(rawRoute)) {
      route = 'cycles';
    } else if (['modules', 'plane-modules'].includes(rawRoute)) {
      route = 'modules';
    } else if (['pages', 'knowledge', 'plane-pages'].includes(rawRoute)) {
      route = 'pages';
    } else if (['architecture', 'c4', 'stack'].includes(rawRoute)) {
      route = 'architecture';
    } else if (['graph', 'tree', 'depgraph', 'dependencies'].includes(rawRoute)) {
      route = 'graph';
    } else if (['constellation', 'three', 'space3d', '3d'].includes(rawRoute)) {
      route = 'constellation';
    } else if (['analytics', 'metrics', 'stats'].includes(rawRoute)) {
      route = 'analytics';
    } else if (['agents', 'harness', 'orchestrator'].includes(rawRoute)) {
      route = 'harness';
    } else {
      route = rawRoute;
    }

    return { route, params, rawHash: cleanHash };
  }

  _dispatch(route, rawHash, params) {
    this.currentRoute = route;
    this.currentParams = params;

    // Disparar callbacks globales
    for (const cb of this.callbacks) {
      try {
        cb(route, rawHash, params);
      } catch (err) {
        console.error('Error en router callback global:', err);
      }
    }

    // Disparar handlers específicos de ruta
    if (this.routeHandlers.has(route)) {
      const handlers = Array.from(this.routeHandlers.get(route));
      for (const handler of handlers) {
        try {
          handler(params, rawHash);
        } catch (err) {
          console.error(`Error en handler de ruta "${route}":`, err);
        }
      }
    }
  }

  /**
   * Inicializa la escucha de cambios de hash en window.
   * @param {Function} [globalCallback] 
   */
  init(globalCallback) {
    if (globalCallback && typeof globalCallback === 'function') {
      this.callbacks.add(globalCallback);
    }

    const handleHashChange = () => {
      const rawHash = (typeof window !== 'undefined' && window.location?.hash) ? window.location.hash : '';
      const { route, params } = this.parseHash(rawHash);
      this._dispatch(route, rawHash, params);
    };

    if (typeof window !== 'undefined' && !this.isListening) {
      if (typeof window.addEventListener === 'function') {
        window.addEventListener('hashchange', handleHashChange);
      }
      this.isListening = true;
      handleHashChange();
    }
  }

  /**
   * Navega a una ruta con parámetros opcionales.
   * @param {string} route 
   * @param {Record<string, any>} [params] 
   */
  navigate(route, params = {}) {
    let hash = `#${route}`;
    const keys = Object.keys(params);
    if (keys.length > 0) {
      const searchParams = new URLSearchParams();
      for (const key of keys) {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          searchParams.append(key, String(params[key]));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        hash += `?${qs}`;
      }
    }

    if (typeof window !== 'undefined' && window.location) {
      window.location.hash = hash;
    } else {
      // Simulación en entornos sin window (Node.js)
      const parsed = this.parseHash(hash);
      this._dispatch(parsed.route, hash, parsed.params);
    }
  }

  /**
   * Registra un listener para una ruta específica.
   * @param {string} route 
   * @param {Function} handler 
   * @returns {Function} Función para desuscribir.
   */
  on(route, handler) {
    if (!this.routeHandlers.has(route)) {
      this.routeHandlers.set(route, new Set());
    }
    this.routeHandlers.get(route).add(handler);
    return () => {
      const handlers = this.routeHandlers.get(route);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.routeHandlers.delete(route);
        }
      }
    };
  }

  /**
   * Obtiene la ruta activa normalizada.
   * @returns {string}
   */
  getRoute() {
    return this.currentRoute;
  }

  /**
   * Obtiene los parámetros de la URL activa.
   * @returns {Record<string, string>}
   */
  getParams() {
    return { ...this.currentParams };
  }
}

export const router = new Router();

export function initRouter(callback) {
  router.init(callback);
}
